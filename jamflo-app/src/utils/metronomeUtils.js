export const clampBpm = (bpm, min = 40, max = 240) => {
  return Math.max(min, Math.min(max, bpm));
};

export const getBeatIntervalMs = (bpm) => {
  return 60000 / bpm;
};

export const getBeatInBar = (tick, beatsPerBar) => {
  return tick % beatsPerBar;
};

export const adjustStartTimeForBpmChange = ({
  currentTime,
  startTime,
  tick,
  prevInterval,
  newInterval,
}) => {
  const elapsed = currentTime - startTime;

  const phase =
    ((elapsed % prevInterval) + prevInterval) % prevInterval;

  const phaseFrac = phase / prevInterval;

  return currentTime - (tick + phaseFrac) * newInterval;
};

export const getMissedTicks = ({
  currentTime,
  nextTime,
  interval,
}) => {
  if (currentTime <= nextTime + interval) return 0;

  return Math.floor((currentTime - nextTime) / interval);
};