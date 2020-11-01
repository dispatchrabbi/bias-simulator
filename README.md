# bias-simulator

A simple model that simulates the effects of bias in an environment with promotions and attrition, such as a company.

## How the simulation works

The simulation begins by populating an organization with a given number of people at each level, split half-and-half between a privileged group and a non-privileged group. Each person is also assigned a performance score.[0] The privileged group's performance scores are given a point bonus based on the strength of the bias being simulated.

In each iteration, some number[1] of the incumbents at each level are removed to simulate attrition. These vacancies are filled by promoting the person from the next-lower level with the highest performance score. At the lowest level, vacancies are filled by hiring from the general populace, which is assumed to be split half-and-half between the two groups, with performance scores assigned as mentioned above.

The simulation continues for a given number of iterations, or until every member of the initial population is gone, depending on the settings given.

[0] Scores are sampled from a normal distribution with a mean of 50 and a standard deviation of 10. The sampling is done with the Marsgalia polar method.

[1] Based on the attrition rate for the simulation.

## Inspiration

I was watching [this video about the effects of unconscious bias at work](https://youtu.be/nLjFTHTgEVU) and [at about 12:47 or so](https://youtu.be/nLjFTHTgEVU?t=767), the presenter mentions a study where the authors ran a computer simulation that showed that even a very small effect from bias can result in huge imbalances at top levels in companies. The presenter described the simulation in enough detail that I thought, "Hey, I could probably build that."

So I did. After some research (turns out it's [tough to sample randomly from a normal distribution](https://en.wikipedia.org/wiki/Marsaglia_polar_method)) and some tinkering, I ran it for the first time. I was surprised to see that my results didn't match what the presenter had cited - I had to crank the strength of the bias way up to match his claims. It was at this point I realized I probably should have found and read the actual paper first.

So I did. The paper is *[Male-Female Differences: A Computer Simulation](https://www.ruf.rice.edu/~lane/papers/male_female.pdf)*, by Richard F. Martell, David M. Lane, and Cynthia Emrich, published in 1996 in *American Psychologist*. After reading it, I adjusted both my score-assigning function (I'd been accounting for bias strength incorrectly) and - crucially - I tweaked the cohort sizes so that the organization represented had a pyramidal structure: that is, fewer spots in higher ranks.

## What I learned

This pyramidal structure, I found, led to a major increase in the number of privileged people at higher levels in the simulations. While I am aware that this is a simple model (though it must have been impressive in 1996 - and the paper notes that it's the first simulation of its kind in the literature), it shows that **the scarcity of high-ranking positions is a big factor in amplifying the effects of bias**.

There is a straightforward explanation for this effect: fewer high-level positions means fewer promotion opportunities, which means each of those rare decisions amplifies the strength of the bias. On the other hand, it's not like the pyramidal structure is going away any time soon. That means that the factor that we *can* change - our unconscious biases and their effects on our decisionmaking - becomes *even more important* to examine, guard against, and reduce.

## Running simulations

### Installation

This is a node app, so it works like every other node app:

```sh
$ git clone <this repo>
$ cd bias-simulator
$ npm install
```

(You don't even actually have to `npm install` because the only dependency is `eslint`, and if you're not gonna be writing code, you don't need it.)

### Running

Run the simulation with `node ./index.js` or `npm run start`:

```sh
$ node ./index.js
Ran 200 simulations with a bias strength of 2.01 and an attrition rate of 0.15, which took an average of 49.17 iterations to cycle all orignal members out.

level   score   count   !priv%
8       77.73   10      36.80%
7       71.10   40      39.60%
6       66.38   75      41.60%
5       63.08   100     43.39%
4       60.00   150     45.55%
3       56.86   200     46.63%
2       52.11   350     49.13%
1       43.84   500     53.42%
```

By default, this will show you a summary with the number of simulations run, the bias strength and attrition rate used, and the average number of iterations per simulations. Below, for each level (`level`), it will list the mean score (`score`) of the people in that level, the *total* number of people at that level (`count`), and the percentage of people who are *not* in the privileged group (`!priv%`). This matches the format of the results given in the original paper.

If you want more columns in your results, you can set the `VERBOSE` environment variable to `true`, or you can run `npm run start:verbose`:

```
$ VERBOSE=true node ./index.js
Ran 200 simulations with a bias strength of 2.01 and an attrition rate of 0.15, which took an average of 51.88 iterations to cycle all orignal members out.

level   score   !priv%  priv%   count   !priv#  priv#
8       77.61   37.75%  62.25%  10      4       6
7       71.06   39.19%  60.81%  40      16      24
6       66.36   42.56%  57.44%  75      32      43
5       63.08   43.71%  56.29%  100     44      56
4       59.96   45.08%  54.92%  150     68      82
3       56.94   46.90%  53.10%  200     94      106
2       52.08   49.36%  50.64%  350     173     177
1       43.90   53.39%  46.61%  500     267     233
```

In verbose mode, the summary is the same. The columns shown are: the level (`level`), the mean score (`score`), the percentage of people out of and in the privileged group at that level (`!priv%` and `priv%` respectively), the number of people total at that level (`count`), and the number of people out of and in the privileged group at that level (`!priv#` and `priv#`).

### Configuration

You can configure the simulation using these constants, all of which can be found in _config.js_:

| name | initial value | description |
| --- | --- | --- |
| NUMBER_OF_SIMULATIONS | `200` | Number of simulations to run.
| COHORT_SIZES | `[10, 40, 75, 100, 150, 200, 350, 500]` | How many people are in each level of the simulated organization, starting at the top. This also determines how many levels there are.
| NUMBER_OF_ITERATIONS | `null` | If you give a number, the simulation will iterate this many times. If `null` is given, the simulation will iterate until no original members of the organization are left. |
| BIAS_STRENGTH | `2.01` | How many extra points each member of the privileged group gets added to their performance score. |
| ATTRITION_RATE | `0.15` | What chance each person has of leaving the organization each iteration. |

## Next steps

I have not yet really experimented with the effects of anything but the cohort sizes and the bias strength, and I'm sure there are other factors that could be added to the model. I am interested to know, for example, what happens if attrition is based mostly on performance rather than being random.

At the end of the video linked above, the presenter asks everyone in the audience (and now, that audience includes you) to commit to just one action to reduce the effects of unconscious bias. Four options he suggests (and goes into helpful, actionable, concrete detail about) are:

- structure your processes for success,
- collect data on your decisionmaking,
- evaluate the subtle messages your organization puts out, and
- hold everyone accountable to reducing the effects of bias.

Take a moment to think about which one would be the best first step for your role in your organization, and commit to it.
