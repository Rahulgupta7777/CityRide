export function calculateNextBusTime(firstBus, lastBus, freqMins) {
  const pad = (n) => (n < 10 ? "0" + n : String(n));
  const now = new Date();
  const [fh, fm] = firstBus.split(":").map(Number);
  const [lh, lm] = lastBus.split(":").map(Number);
  const first = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    fh,
    fm,
    0,
    0
  );
  const last = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    lh,
    lm,
    0,
    0
  );

  if (now < first) {
    return `First bus at ${firstBus}`;
  }
  if (now > last) {
    return "No more buses today";
  }

  let minutesSinceFirst = Math.floor((now - first) / 60000);
  let busesPassed = Math.floor(minutesSinceFirst / freqMins);
  let nextMinutes = first.getTime() + (busesPassed + 1) * freqMins * 60000;
  let nextBus = new Date(nextMinutes);
  if (nextBus > last) return "No more buses today";
  return `Next bus at ${pad(nextBus.getHours())}:${pad(nextBus.getMinutes())}`;
}

export function parseHHMMSSToMinutes(hhmmss) {
  if (!hhmmss || typeof hhmmss !== "string") return NaN;
  const [h = 0, m = 0, s = 0] = hhmmss.split(":").map(Number);
  return h * 60 + m + Math.floor(s / 60);
}

export function diffMinutesHHMMSS(start, end) {
  const s = parseHHMMSSToMinutes(start);
  const e = parseHHMMSSToMinutes(end);
  if (Number.isNaN(s) || Number.isNaN(e)) return NaN;
  return e - s;
}
