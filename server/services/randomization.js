export function pureRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function weightedRandom(items) {
  const total = items.reduce((sum, i) => sum + (i.weight || 1), 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.weight || 1;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

export function surprisePick(items) {
  const hasWeights = items.some((i) => (i.weight || 1) > 1);
  const picked = hasWeights ? weightedRandom(items) : pureRandom(items);
  return {
    _id: picked._id,
    title: picked.title,
    notes: picked.notes,
    url: picked.url,
    affiliateUrl: picked.affiliateUrl,
    weight: picked.weight,
    excludeFromPool: picked.excludeFromPool,
    lastPickedAt: picked.lastPickedAt,
    revealed: false,
  };
}

export function pickItem(eligibleItems, pickMode) {
  if (!eligibleItems?.length) return null;

  switch (pickMode) {
    case 'weighted':
      return weightedRandom(eligibleItems);
    case 'surprise':
      return surprisePick(eligibleItems);
    default:
      return pureRandom(eligibleItems);
  }
}

export function shuffleAll(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
