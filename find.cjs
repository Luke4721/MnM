async function run() {
  const r = await fetch('https://www.monks-n-monkeys.com');
  const t = await r.text();
  console.log('Length:', t.length);
  const m = t.match(/href=["'](.*?)["']/gi);
  const pkgs = new Set();
  if (m) {
      m.forEach(x => {
          if (x.includes('package') || x.includes('tour') || x.includes('itinerary')) {
              pkgs.add(x);
          }
      });
  }
  console.log('Matches:', pkgs.size);
  console.log(Array.from(pkgs).slice(0, 10));
}
run();
