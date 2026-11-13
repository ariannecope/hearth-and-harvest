// Hand-drawn sketches, cleaned up by scripts/process-sketches.py (transparent, trimmed).
import chicken from '../assets/sketches/chicken.webp';
import cow from '../assets/sketches/cow.webp';
import duck from '../assets/sketches/duck.webp';
import fruit from '../assets/sketches/fruit.webp';
import garden from '../assets/sketches/garden.webp';
import goat from '../assets/sketches/goat.webp';
import herb from '../assets/sketches/herb.webp';
import pig from '../assets/sketches/pig.webp';
import rabbit from '../assets/sketches/rabbit.webp';
import sheep from '../assets/sketches/sheep.webp';
import veggie from '../assets/sketches/veggie.webp';

// Keyed by the category ids in lib/options.js.
export const CATEGORY_SKETCHES = {
  sheep,
  goats: goat,
  chickens: chicken,
  ducks: duck,
  cattle: cow,
  pigs: pig,
  rabbits: rabbit,
  vegetable: veggie,
  herb,
  fruit,
};

export const GARDEN_SKETCH = garden;
