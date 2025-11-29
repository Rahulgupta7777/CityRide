export function calculateJourney(route, startIdx, endIdx) {
  if (startIdx === endIdx) return { numStops: 0, totalTime: 0 };
  let s = Math.min(startIdx, endIdx);
  let e = Math.max(startIdx, endIdx);
  let numStops = e - s;
  let totalTime = 0;
  for (let i = s + 1; i <= e; ++i) {
    totalTime += route.approxTravelTimes[i];
  }
  return { numStops, totalTime };
}

export function calculateStopsBetween(stops, fromName, toName) {
  const fromIdx = stops.findIndex((s) => s.stop_name === fromName);
  const toIdx = stops.findIndex((s) => s.stop_name === toName);

  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return 0;
  return Math.abs(toIdx - fromIdx);
}