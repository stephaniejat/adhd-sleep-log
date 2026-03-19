```dataviewjs
// Sleep Stage Trends - ADHD‑style (from data/sleep)

const sleepFiles = dv.pages('"data/sleep"')
  .where(p => p.deep_sleep_min != null)
  .sort(p => p.file.name);

const N = sleepFiles.length;
dv.paragraph(`**Last ${N} nights logged (from data/sleep)**`);
dv.table(
  ["Date", "Deep (min)", "Light (min)", "REM (min)", "Awake (min)", "Deep %", "Energy", "Crash‑day"],
  sleepFiles.map(p => {
    const total = p.deep_sleep_min + p.light_sleep_min + p.rem_sleep_min + p.awake_min;
    const deepPercent = total > 0 ? Math.round(100 * p.deep_sleep_min / total) : 0;
    return [
      p.file.name,
      p.deep_sleep_min,
      p.light_sleep_min,
      p.rem_sleep_min,
      p.awake_min,
      `${deepPercent}%`,
      p.next_day_energy_1-5,
      p.crash_day,
    ];
  })
);

dv.header(2, "Stage Averages (all nights)");

const sumDeep   = sleepFiles.sum(p => p.deep_sleep_min);
const sumLight  = sleepFiles.sum(p => p.light_sleep_min);
const sumRem    = sleepFiles.sum(p => p.rem_sleep_min);
const sumAwake  = sleepFiles.sum(p => p.awake_min);
const totalMinAll = sumDeep + sumLight + sumRem + sumAwake;

dv.list([
  `Deep: ${Math.round(sumDeep / N)} min/night (avg ${Math.round(100 * sumDeep / totalMinAll)}%)`,
  `Light: ${Math.round(sumLight / N)} min/night`,
  `REM: ${Math.round(sumRem / N)} min/night`,
  `Awake: ${Math.round(sumAwake / N)} min/night`,
]);

dv.header(2, "Crash‑days vs non‑crash‑days");

const crash = sleepFiles.filter(p => p.crash_day == "yes");
const noCrash = sleepFiles.filter(p => p.crash_day == "no");

function labelAvg(data, label) {
  if (!data.length) return;
  const e = data.map(p => p.next_day_energy_1-5).filter(x => x).mean();
  const t = data.map(p => p.deep_sleep_min + p.light_sleep_min + p.rem_sleep_min + p.awake_min).mean();
  dv.paragraph(`- ${label} (n=${data.length}): avg energy = ${(e||0).toFixed(1)}/5, total sleep = ${(t||0).toFixed(1)} min`);
}

labelAvg(crash, "Crash‑days");
labelAvg(noCrash, "Non‑crash‑days");
```