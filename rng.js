import { sum } from './utils.js';

// TODO: Does PRNG vs RNG make a difference?
function random() {
  return Math.random();
}

// Return a random integer between min and max, inclusive
export function randomInt(min, max) {
  const range = max - min + 1;
  return min + Math.floor(random() * range);
}

// Return two normal numbers sampled from independent normal distrobutions with mean μ, and standard deviation σ
export function marsgalia(μ, σ) {
  let u, v, s;

  do {
    u = (random() * 2) - 1;
    v = (random() * 2) - 1;
    s = (u * u) + (v * v);
  } while (s >= 1 || s === 0);

  const x = u * Math.sqrt((-2 * Math.log(s)) / s);
  const y = v * Math.sqrt((-2 * Math.log(s)) / s);

  return {
    x: (x * σ) + μ,
    y: (y * σ) + μ,
  };
}

export function singleMarsgalia(μ, σ) {
  return marsgalia(μ, σ).x;
}

// Return a normal int with 99% chance to be between minish and maxish
export function marsgaliaInt(minish, maxish) {
  const σ = (maxish - minish) / 6;
  const μ = ((maxish - minish) / 2) + minish;

  return Math.round(marsgalia(μ, σ).x);
}

// Return a normalish number between min and max, inclusive
export function irwinHall(min, max) {
  // Renerate 12 uniform U(0,1) deviates, add them all up, and subtract 6: the resulting random
  // variable will have approximately standard normal distribution. In truth, the distribution
  // will be Irwin–Hall, which is a 12-section eleventh-order polynomial approximation to the
  // normal distribution. This random deviate will have a limited range of (−6, 6).
  // n.b., here we're not subtracting by 6 so we end up with a range of (0, 12)
  const uniformDeviates = Array(12).fill().map(() => random());
  const r = sum(uniformDeviates);

  const scale = (max - min) / 12;
  const shift = min;

  return (r * scale) + shift;
}

// Return a normalish int between min and max, inclusive
export function irwinHallInt(min, max) {
  return Math.round(irwinHall(min, max));
}
