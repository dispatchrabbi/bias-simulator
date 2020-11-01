/*
Okay, so here's what's happening here. We're gonna simulate what happens when there is a bias that affects how likely
someone is to get hired and/or promoted within an organization.

We'll set up an organization with a bunch of levels and a group of people in each level. We'll set an attrition rate A
where every year (or whatever), A% of people at each level leave. People will be replaced by people on the level below
them based on performance score - the higher a person's performance score, the more likely they are to be promoted. On
the lowest level, we'll just replace however many people we need to and assign them a score.

Performance scores will be assigned according to a normal sample with mean 50 and standard deviation 10. People from
the privileged group will be given a performance score boost of B points, where B is the strength of the bias gained
from their privilege.
*/

import { singleMarsgalia } from './rng.js';
import { average } from "./utils.js";

export default function run(cohortSizes, iterations, attritionRate, biasStrength) {
  const getScore = function(isPrivileged) { return singleMarsgalia(50, 10) + (isPrivileged ? biasStrength : 0); };
  const dropsOut = function(/* person */) { return Math.random() < attritionRate; };

  let population = cohortSizes.map(cohortSize => hireIntoCohort([], cohortSize, getScore, true));

  if(iterations === null) {
    iterations = 0;
    while(!isPopulationAllNewYet(population)) {
      population = iterate(population, cohortSizes, dropsOut, getScore);
      ++iterations;
    }
  } else {
    for(let iteration = 0; iteration < iterations; ++iteration) {
      population = iterate(population, cohortSizes, dropsOut, getScore);
    }
  }

  const privilegedPercent = population.map(getCohortPrivilegedPercent);
  const performanceScores = population.map(getCohortMeanPerformanceScore);

  return { privilegedPercent, performanceScores, iterations };
}

function iterate(population, cohortSizes, dropsOut, getScore) {
  for(let rank = 0; rank < population.length; ++rank) {
    const cohortSize = cohortSizes[rank];

    // first, drop people out of this cohort
    const cohortAfterAttrition = reduceCohort(population[rank], dropsOut);

    // then, promote replacements from the next cohort (or hire from the general populace, if there's no next cohort)
    if(rank + 1 < population.length) {
      const { cohort, lowerCohort} = promoteFromBelow(cohortAfterAttrition, population[rank + 1], cohortSizes[rank]);
      population[rank] = cohort;
      population[rank + 1] = lowerCohort;
    } else {
      population[rank] = hireIntoCohort(cohortAfterAttrition, cohortSizes[rank], getScore);
    }
  }

  return population;
}

function hireIntoCohort(cohort, cohortSize, getScore, initialHire = false) {
  while(cohort.length < cohortSize) {
    const isPrivileged = !!(cohort.length % 2);
    const score = getScore(isPrivileged);
    cohort.push({ isPrivileged, score, initialHire });
  }

  return cohort;
}

function reduceCohort(cohort, dropsOut) {
  return cohort.filter(p => !dropsOut(p));
}

function promoteFromBelow(cohort, lowerCohort, cohortSize) {
  sortCohort(lowerCohort);
  // just peel the top people off the lower cohort
  const promotees = lowerCohort.splice(0, cohortSize - cohort.length);
  cohort.push(...promotees);

  return { cohort, lowerCohort };
}

function sortCohort(cohort) {
  return cohort.sort((a, b) => b.score - a.score);
}

function isPopulationAllNewYet(population) {
  return population.every(cohort => cohort.every(person => !person.initialHire));
}

function getCohortPrivilegedPercent(cohort) {
  return cohort.filter(p => p.isPrivileged).length / cohort.length;
}

function getCohortMeanPerformanceScore(cohort) {
  return average(cohort.map(p => p.score));
}
