export const CATEGORY_LABELS = {
  movies: 'Movies',
  tv_shows: 'TV Shows',
  books: 'Books',
  music: 'Music',
  games: 'Games',
  restaurants: 'Restaurants',
  travel: 'Travel',
  activities: 'Activities',
  tasks: 'Tasks',
  other: 'Other',
};

export const PICK_MODE_LABELS = {
  pure_random: 'Pure random',
  weighted: 'Weighted',
  cooldown: 'Cooldown',
  surprise: 'Surprise',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);
export const PICK_MODES = Object.keys(PICK_MODE_LABELS);

const WATCH_CATEGORIES = new Set(['movies', 'tv_shows', 'games']);
const READ_CATEGORIES = new Set(['books']);

export function itemTrackingType(category) {
  if (READ_CATEGORIES.has(category)) return 'read';
  if (WATCH_CATEGORIES.has(category)) return 'watch';
  return null;
}
