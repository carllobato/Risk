(function attachSimulationEngine(globalScope) {
  function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function triangularSample(lowInput, midInput, highInput) {
    let low = toNumber(lowInput, 0);
    let high = toNumber(highInput, low);

    if (high < low) {
      [low, high] = [high, low];
    }

    const defaultMid = (low + high) / 2;
    let mid = toNumber(midInput, defaultMid);
    mid = Math.min(high, Math.max(low, mid));

    const range = high - low;
    if (range <= 0) {
      return low;
    }

    const splitPoint = (mid - low) / range;
    const random = Math.random();

    if (random < splitPoint) {
      return low + Math.sqrt(random * range * (mid - low));
    }

    return high - Math.sqrt((1 - random) * range * (high - mid));
  }

  function percentile(sortedValues, p) {
    if (!sortedValues.length) {
      return 0;
    }

    const rank = p * (sortedValues.length - 1);
    const lowIndex = Math.floor(rank);
    const highIndex = Math.ceil(rank);

    if (lowIndex === highIndex) {
      return sortedValues[lowIndex];
    }

    const weight = rank - lowIndex;
    return sortedValues[lowIndex] * (1 - weight) + sortedValues[highIndex] * weight;
  }

  function summarize(values) {
    if (!values.length) {
      return {
        mean: 0,
        median: 0,
        p50: 0,
        p80: 0,
        p90: 0,
        min: 0,
        max: 0
      };
    }

    const sorted = values.slice().sort((a, b) => a - b);
    const total = values.reduce((sum, value) => sum + value, 0);

    return {
      mean: total / values.length,
      median: percentile(sorted, 0.5),
      p50: percentile(sorted, 0.5),
      p80: percentile(sorted, 0.8),
      p90: percentile(sorted, 0.9),
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  }

  function buildHistogram(values, bucketCount = 10) {
    if (!values.length) {
      return [];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      return [{ label: `${min.toFixed(0)}-${max.toFixed(0)}`, count: values.length, value: values.length }];
    }

    const width = (max - min) / bucketCount;
    const buckets = Array.from({ length: bucketCount }, (_, index) => ({
      low: min + index * width,
      high: index === bucketCount - 1 ? max : min + (index + 1) * width,
      count: 0
    }));

    values.forEach((value) => {
      const relative = (value - min) / width;
      const index = Math.min(bucketCount - 1, Math.floor(relative));
      buckets[index].count += 1;
    });

    return buckets.map((bucket) => ({
      label: `${bucket.low.toFixed(0)}-${bucket.high.toFixed(0)}`,
      count: bucket.count,
      value: bucket.count
    }));
  }

  function runMonteCarlo(risks, iterations = 100) {
    const activeRisks = risks.filter((risk) => risk.status !== "Closed");
    const costResults = [];
    const scheduleResults = [];

    for (let i = 0; i < iterations; i += 1) {
      let totalCost = 0;
      let totalDays = 0;

      activeRisks.forEach((risk) => {
        const probability = Math.max(0, Math.min(1, toNumber(risk.probability, 0)));
        if (Math.random() <= probability) {
          totalCost += triangularSample(risk.impact_cost_low, risk.impact_cost_mid, risk.impact_cost_high);
          totalDays += triangularSample(risk.impact_days_low, risk.impact_days_mid, risk.impact_days_high);
        }
      });

      costResults.push(totalCost);
      scheduleResults.push(totalDays);
    }

    return {
      iterations,
      costResults,
      scheduleResults,
      costStats: summarize(costResults),
      scheduleStats: summarize(scheduleResults),
      costHistogram: buildHistogram(costResults, 12),
      scheduleHistogram: buildHistogram(scheduleResults, 12)
    };
  }

  globalScope.SimulationEngine = {
    runMonteCarlo,
    triangularSample
  };
})(window);
