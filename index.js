import run from './simulation.js';
import { average } from './utils.js';

import { NUMBER_OF_SIMULATIONS, COHORT_SIZES, NUMBER_OF_ITERATIONS, BIAS_STRENGTH, ATTRITION_RATE } from './config.js';

function runAllSimulations() {
  const aggregatePercentages = Array(COHORT_SIZES.length).fill().map(() => []);
  const aggregateScores = Array(COHORT_SIZES.length).fill().map(() => []);
  const iterationCounts = [];

  for(let i = 0; i < NUMBER_OF_SIMULATIONS; ++i) {
    // if((i + 1) % 50 === 0) { console.log(`Simulation #${i + 1}`); };

    const { privilegedPercent, performanceScores, iterations } = run(COHORT_SIZES, NUMBER_OF_ITERATIONS, ATTRITION_RATE, BIAS_STRENGTH);

    privilegedPercent.forEach((pct, ix) => aggregatePercentages[ix].push(pct));
    performanceScores.forEach((score, ix) => aggregateScores[ix].push(score));
    iterationCounts.push(iterations);
  }

  return {
    averagePercentages: aggregatePercentages.map(average),
    averageScores: aggregateScores.map(average),
    averageIterations: average(iterationCounts),
  }
}

function reportResults(cohortSizes, biasStrength, attritionRate, averagePercentages, averageScores, averageIterations, verbose = false) {
  const iterationReport = NUMBER_OF_ITERATIONS === null ?
    `which took an average of ${averageIterations.toFixed(2)} iterations to cycle all orignal members out` :
    `with ${NUMBER_OF_ITERATIONS} iterations each`;

  console.log(`Ran ${NUMBER_OF_SIMULATIONS} simulations with a bias strength of ${biasStrength} and an attrition rate of ${attritionRate}, ${iterationReport}.`);
  console.log('');

  console.log(verbose ? `level\tscore\t!priv%\tpriv%\tcount\t!priv#\tpriv#` : `level\tscore\tcount\t!priv%`);
  COHORT_SIZES.forEach((count, rank) => {
    const level = COHORT_SIZES.length - rank; // make higher ranks higher numbers
    const score = averageScores[rank].toFixed(2);
    const privPct = (averagePercentages[rank] * 100).toFixed(2);
    const unprivPct = (100 - (averagePercentages[rank] * 100)).toFixed(2);
    const priv = Math.round(averagePercentages[rank] * count);
    const unpriv = count - priv;
    console.log(verbose ? `${level}\t${score}\t${unprivPct}%\t${privPct}%\t${count}\t${unpriv}\t${priv}` : `${level}\t${score}\t${count}\t${unprivPct}%`)
  });
}

const { averagePercentages, averageScores, averageIterations } = runAllSimulations();
reportResults(COHORT_SIZES, BIAS_STRENGTH, ATTRITION_RATE, averagePercentages, averageScores, averageIterations, process.env['VERBOSE'] === 'true');
