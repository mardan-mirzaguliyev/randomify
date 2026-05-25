import { Router } from 'express';
import List from '../models/List.js';
import Pick from '../models/Pick.js';
import { protect, requirePro, listAccess } from '../middleware/auth.js';
import { pickItem, shuffleAll } from '../services/randomization.js';

const router = Router();

function formatList(list, isOwner) {
  const obj = list.toObject();
  return { ...obj, isOwner };
}

router.get('/explore', async (req, res, next) => {
  try {
    const filter = { $or: [{ isPublic: true }, { isTemplate: true }] };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const lists = await List.find(filter)
      .select('title description category pickMode items isTemplate isPublic ownerId createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('ownerId', 'displayName');

    const result = lists.map((list) => ({
      _id: list._id,
      title: list.title,
      description: list.description,
      category: list.category,
      pickMode: list.pickMode,
      itemCount: list.items.length,
      isTemplate: list.isTemplate,
      isPublic: list.isPublic,
      ownerName: list.ownerId?.displayName || 'Unknown',
    }));

    res.json({ lists: result });
  } catch (err) {
    next(err);
  }
});

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const lists = await List.find({
      $or: [
        { ownerId: req.user._id },
        { collaboratorIds: req.user._id },
      ],
    }).sort({ updatedAt: -1 });

    res.json({
      lists: lists.map((list) => ({
        ...formatList(list, list.ownerId.toString() === req.user._id.toString()),
        itemCount: list.items.length,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const count = await List.countDocuments({ ownerId: req.user._id });
    if (!req.user.canCreateList(count)) {
      return res.status(403).json({
        message: 'Free plan allows up to 3 lists. Upgrade to create more.',
        code: 'UPGRADE_REQUIRED',
      });
    }

    const list = await List.create({
      ownerId: req.user._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      pickMode: req.body.pickMode,
      cooldownDays: req.body.cooldownDays,
    });

    res.status(201).json({ list: formatList(list, true) });
  } catch (err) {
    next(err);
  }
});

router.get('/:listId', listAccess(), async (req, res) => {
  res.json({ list: formatList(req.list, req.isOwner) });
});

router.patch('/:listId', listAccess(true), async (req, res, next) => {
  try {
    const allowed = [
      'title',
      'description',
      'category',
      'pickMode',
      'cooldownDays',
      'isPublic',
      'isTemplate',
      'collaboratorIds',
    ];

    if (req.body.collaboratorIds !== undefined) {
      if (req.user.plan !== 'pro' && req.user.plan !== 'lifetime') {
        return res.status(403).json({
          message: 'Collaborative lists require a Pro plan',
          code: 'UPGRADE_REQUIRED',
        });
      }
    }

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        req.list[key] = req.body[key];
      }
    }

    await req.list.save();
    res.json({ list: formatList(req.list, true) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:listId', listAccess(true), async (req, res, next) => {
  try {
    await Pick.deleteMany({ listId: req.list._id });
    await req.list.deleteOne();
    res.json({ message: 'List deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:listId/items', listAccess(), async (req, res, next) => {
  try {
    if (!req.user.canAddItem(req.list.items.length)) {
      return res.status(403).json({
        message: 'Free plan allows up to 20 items per list. Upgrade for unlimited items.',
        code: 'UPGRADE_REQUIRED',
      });
    }

    req.list.items.push(req.body);
    await req.list.save();

    const item = req.list.items[req.list.items.length - 1];
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

router.patch('/:listId/items/:itemId', listAccess(), async (req, res, next) => {
  try {
    const item = req.list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const allowed = [
      'title',
      'notes',
      'url',
      'weight',
      'excludeFromPool',
      'watchedAt',
      'readAt',
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key];
      }
    }

    await req.list.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

router.delete('/:listId/items/:itemId', listAccess(), async (req, res, next) => {
  try {
    const item = req.list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.deleteOne();
    await req.list.save();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:listId/pick', listAccess(), async (req, res, next) => {
  try {
    const eligible = req.list.getPickableItems();
    const poolSize = eligible.length;

    if (poolSize === 0) {
      const message =
        req.list.pickMode === 'cooldown'
          ? 'All items are in cooldown. Wait or reduce the cooldown period.'
          : 'No items available. Add items or unexclude some.';
      return res.status(400).json({ message, code: 'EMPTY_POOL' });
    }

    const winner = pickItem(eligible, req.list.pickMode);
    const itemDoc = req.list.items.id(winner._id);
    if (itemDoc) {
      itemDoc.lastPickedAt = new Date();
    }
    await req.list.save();

    await Pick.create({
      listId: req.list._id,
      itemId: winner._id,
      itemTitleSnapshot: winner.title,
      pickedBy: req.user._id,
      pickMode: req.list.pickMode,
      poolSizeSnapshot: poolSize,
    });

    let picked;
    if (req.list.pickMode === 'surprise') {
      picked = winner;
    } else {
      picked = itemDoc ? itemDoc.toObject() : winner;
    }

    res.json({ picked, poolSize });
  } catch (err) {
    next(err);
  }
});

router.post('/:listId/shuffle', listAccess(), requirePro, async (req, res) => {
  const shuffled = shuffleAll(req.list.items);
  res.json({ items: shuffled });
});

router.get('/:listId/picks', listAccess(), requirePro, async (req, res, next) => {
  try {
    const picks = await Pick.find({ listId: req.list._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('pickedBy', 'displayName');

    res.json({ picks });
  } catch (err) {
    next(err);
  }
});

router.post('/:listId/clone', requirePro, async (req, res, next) => {
  try {
    const source = await List.findById(req.params.listId);
    if (!source) {
      return res.status(404).json({ message: 'List not found' });
    }

    if (!source.isPublic && !source.isTemplate) {
      return res.status(403).json({ message: 'This list is not available to clone' });
    }

    const count = await List.countDocuments({ ownerId: req.user._id });
    if (!req.user.canCreateList(count)) {
      return res.status(403).json({
        message: 'Free plan allows up to 3 lists. Upgrade to create more.',
        code: 'UPGRADE_REQUIRED',
      });
    }

    const cloned = await List.create({
      ownerId: req.user._id,
      title: `${source.title} (copy)`,
      description: source.description,
      category: source.category,
      pickMode: source.pickMode,
      cooldownDays: source.cooldownDays,
      clonedFrom: source._id,
      items: source.items.map((item) => ({
        title: item.title,
        notes: item.notes,
        url: item.url,
        affiliateUrl: item.affiliateUrl,
        weight: item.weight,
        excludeFromPool: false,
        addedAt: new Date(),
        lastPickedAt: null,
      })),
    });

    res.status(201).json({ list: formatList(cloned, true) });
  } catch (err) {
    next(err);
  }
});

export default router;
