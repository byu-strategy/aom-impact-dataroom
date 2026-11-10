// Minimal hand-built SVG charts: thin marks, hairline grid, hover tooltips.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const pct = (v, d = 1) => (v * 100).toFixed(d) + '%';

  function tooltip(host) {
    const t = document.createElement('div');
    t.className = 'tooltip';
    host.appendChild(t);
    return {
      show(html, x, y) {
        t.innerHTML = html;
        t.style.opacity = 1;
        const w = t.offsetWidth, hw = host.clientWidth;
        t.style.left = Math.max(0, Math.min(hw - w, x - w / 2)) + 'px';
        t.style.top = Math.max(0, y - t.offsetHeight - 10) + 'px';
      },
      hide() { t.style.opacity = 0; }
    };
  }

  // Horizontal bars. rows: [{label, value, color, note}]
  function hbar(host, rows, { max = 1, format = pct, labelWidth = 230 } = {}) {
    host.innerHTML = '';
    host.classList.add('chart');
    const W = 760, rowH = 30, barH = 18, top = 8, right = 56;
    const H = top + rows.length * rowH + 24;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' }, host);
    const plotW = W - labelWidth - right;
    const x = v => labelWidth + (v / max) * plotW;
    const tickStep = [.01, .02, .05, .1, .2, .25].find(t => max / t <= 6) || max / 4;
    for (let v = 0; v <= max + 1e-9; v += tickStep) {
      const gx = x(v);
      el('line', { x1: gx, x2: gx, y1: top, y2: H - 20, class: 'gridline' }, svg);
      el('text', { x: gx, y: H - 4, 'text-anchor': 'middle', class: 'tick' }, svg).textContent = format(v, 0);
    }
    const tip = tooltip(host);
    rows.forEach((r, i) => {
      const y = top + i * rowH + (rowH - barH) / 2;
      el('text', { x: labelWidth - 10, y: y + barH / 2 + 4, 'text-anchor': 'end' }, svg).textContent = r.label;
      const w = Math.max(1, x(r.value) - labelWidth);
      const rad = Math.min(4, w / 2);
      // square at baseline, 4px rounded at the data end
      el('path', {
        d: `M${labelWidth},${y} h${w - rad} a${rad},${rad} 0 0 1 ${rad},${rad} v${barH - 2 * rad} a${rad},${rad} 0 0 1 ${-rad},${rad} h${-(w - rad)} z`,
        fill: r.color
      }, svg);
      el('text', { x: labelWidth + w + 6, y: y + barH / 2 + 4 }, svg).textContent = format(r.value);
      const hit = el('rect', { x: 0, y: top + i * rowH, width: W, height: rowH, fill: 'transparent' }, svg);
      hit.addEventListener('mousemove', () => {
        const box = svg.getBoundingClientRect(), s = box.width / W;
        tip.show(`<b>${r.label}</b><br><span>${format(r.value)}${r.note ? ' · ' + r.note : ''}</span>`, (labelWidth + w) * s, (y) * s);
      });
      hit.addEventListener('mouseleave', tip.hide);
    });
  }

  // Lines. series: [{name, color, width, points:[{x,y}]}]
  function lines(host, series, { yMax = 1, format = pct, xFormat = String, endLabels = [] } = {}) {
    host.innerHTML = '';
    host.classList.add('chart');
    const W = 760, H = 340, m = { t: 12, r: 150, b: 28, l: 44 };
    const all = series.flatMap(s => s.points);
    const xMin = Math.min(...all.map(p => p.x)), xMax = Math.max(...all.map(p => p.x));
    const sx = v => m.l + (v - xMin) / (xMax - xMin) * (W - m.l - m.r);
    const sy = v => H - m.b - (v / yMax) * (H - m.t - m.b);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' }, host);
    for (let i = 0; i <= 4; i++) {
      const v = yMax * i / 4, gy = sy(v);
      el('line', { x1: m.l, x2: W - m.r, y1: gy, y2: gy, class: 'gridline' }, svg);
      el('text', { x: m.l - 8, y: gy + 4, 'text-anchor': 'end', class: 'tick' }, svg).textContent = format(v, 0);
    }
    const step = Math.ceil((xMax - xMin) / 6 / 5) * 5;
    for (let v = Math.ceil(xMin / 5) * 5; v <= xMax; v += step)
      el('text', { x: sx(v), y: H - 8, 'text-anchor': 'middle', class: 'tick' }, svg).textContent = xFormat(v);
    // muted series first so highlighted ones draw on top
    [...series].sort((a, b) => (a.width || 2) - (b.width || 2)).forEach(s => {
      el('path', {
        d: s.points.map((p, i) => (i ? 'L' : 'M') + sx(p.x) + ',' + sy(p.y)).join(''),
        fill: 'none', stroke: s.color, 'stroke-width': s.width || 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'
      }, svg);
    });
    endLabels.forEach(name => {
      const s = series.find(q => q.name === name); if (!s) return;
      const p = s.points[s.points.length - 1];
      el('circle', { cx: sx(p.x), cy: sy(p.y), r: 4, fill: s.color, stroke: 'var(--surface)', 'stroke-width': 2 }, svg);
      el('text', { x: sx(p.x) + 8, y: sy(p.y) + 4 }, svg).textContent = `${name} ${format(p.y, 0)}`;
    });
    const cross = el('line', { y1: m.t, y2: H - m.b, stroke: 'var(--muted)', 'stroke-width': 1, opacity: 0 }, svg);
    const tip = tooltip(host);
    const hit = el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent' }, svg);
    hit.addEventListener('mousemove', e => {
      const box = svg.getBoundingClientRect(), s = box.width / W;
      const vx = Math.round(xMin + ((e.clientX - box.left) / s - m.l) / (W - m.l - m.r) * (xMax - xMin));
      const X = sx(vx);
      cross.setAttribute('x1', X); cross.setAttribute('x2', X); cross.setAttribute('opacity', .6);
      const rows = series.map(q => ({ q, p: q.points.find(p => p.x === vx) })).filter(r => r.p)
        .sort((a, b) => b.p.y - a.p.y)
        .map(r => `<i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${r.q.color};margin-right:6px"></i><span>${r.q.name}</span> <b>${format(r.p.y)}</b>`);
      const my = e.clientY - box.top;
      tip.show(`<b>${xFormat(vx)}</b><br>${rows.join('<br>')}`, X * s + (X > W / 2 ? -110 : 110), Math.max(140, my));
    });
    hit.addEventListener('mouseleave', () => { tip.hide(); cross.setAttribute('opacity', 0); });
  }

  window.Charts = { hbar, lines, pct };
})();
