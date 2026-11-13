export const GOALS = [
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'fruit', label: 'Fruit & berries' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'meat', label: 'Meat' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'fiber', label: 'Fiber' },
  { id: 'self-sufficiency', label: 'Self-sufficiency' },
];

export const INTERESTS = [
  { id: 'garden', label: 'Kitchen garden' },
  { id: 'chickens', label: 'Chickens' },
  { id: 'ducks', label: 'Ducks' },
  { id: 'sheep', label: 'Sheep' },
  { id: 'goats', label: 'Goats' },
  { id: 'cattle', label: 'Cattle' },
  { id: 'pigs', label: 'Pigs' },
  { id: 'rabbits', label: 'Rabbits' },
];

export const LIVESTOCK_CATEGORIES = [
  { id: 'sheep', label: 'Sheep', singular: 'Sheep' },
  { id: 'goats', label: 'Goats', singular: 'Goat' },
  { id: 'chickens', label: 'Chickens', singular: 'Chicken' },
  { id: 'ducks', label: 'Ducks', singular: 'Duck' },
  { id: 'cattle', label: 'Cattle', singular: 'Cattle' },
  { id: 'pigs', label: 'Pigs', singular: 'Pig' },
  { id: 'rabbits', label: 'Rabbits', singular: 'Rabbit' },
];

export const PURPOSES = [
  { id: 'meat', label: 'Meat' },
  { id: 'dairy', label: 'Milk' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'fiber', label: 'Fiber' },
  { id: 'draft', label: 'Draft' },
];

export const PLANT_CATEGORIES = [
  { id: 'vegetable', label: 'Vegetables' },
  { id: 'herb', label: 'Herbs' },
  { id: 'fruit', label: 'Fruit' },
];

export const SEASONS = [
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'fall', label: 'Fall' },
];

export const SPACE_LABELS = {
  small: 'Small spaces',
  moderate: 'Needs pasture',
  large: 'Needs acreage',
};

export const labelFor = (list, id) => list.find((o) => o.id === id)?.label ?? id;
export const categoryLabel = (id) => labelFor(LIVESTOCK_CATEGORIES, id);
export const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
