async function run() {
  const r = await fetch('https://www.monks-n-monkeys.com');
  const t = await r.text();
  const m = t.match(/href=["'](\/[^/]+-holiday-packages\/[^/"]+)["']/g) || [];
  const s = new Set(m.map(x => x.replace(/href=["']/, '').replace(/["']$/, '')));
  console.log('Count:', s.size);
}
run();
