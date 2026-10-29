/* Team-stat bar charts. Vanilla SVG, no libraries. Data comes from a JSON <script class="bcdata"> in each .barc section. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a, txt) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
  function fmt(v, f) {
    if (v == null || isNaN(v)) return '-';
    switch (f) {
      case 'f0': return Math.round(v).toLocaleString();
      case 'f1': return v.toFixed(1);
      case 'f2': return v.toFixed(2);
      case 'f3': return (v < 1 && v > -1 ? v.toFixed(3).replace(/^0/, '').replace(/^-0/, '-') : v.toFixed(3));
      case 'pct': return (100 * v).toFixed(1) + '%';
      case 'sgn': return (v > 0 ? '+' : '') + Math.round(v);
      case 'money': return '$' + (v / 1e6).toFixed(1) + 'M';
      case 'usd': return '$' + v.toFixed(2);
      case 'int': return Math.round(v).toLocaleString();
    }
    return String(v);
  }
  function domain(vals, s) {
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    if (lo < 0) return [Math.min(lo, 0), Math.max(hi, 0)];
    if (s.z) return [0, hi];
    var pad = (hi - lo) * 0.35 || hi * 0.1 || 1; return [Math.max(0, lo - pad), hi];
  }
  function better(s) { return s.h === false ? 1 : -1; }   /* sort sign: higher-is-better sorts descending */
  function drawBars(root, D, key) {
    var s = D.stats.filter(function (x) { return x.k === key; })[0], plot = root.querySelector('.bcplot'), info = root.querySelector('.bcinfo');
    var rows = D.teams.filter(function (t) { return t.v[s.k] != null; }).slice();
    rows.sort(function (a, b) { return better(s) * (a.v[s.k] - b.v[s.k]); });
    var vals = rows.map(function (t) { return t.v[s.k]; }), dm = domain(vals.concat([s.a]), s);
    var W = Math.max(340, Math.min(760, plot.clientWidth || 760)), L = 96, R = 62, bh = 22, gap = 5, top = 22, H = top + rows.length * (bh + gap) + 10;
    var x = function (v) { return L + (W - L - R) * (v - dm[0]) / ((dm[1] - dm[0]) || 1); };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'bcsvg', role: 'img', 'aria-label': s.l + ' by team' });
    rows.forEach(function (t, k) {
      var y = top + k * (bh + gap), v = t.v[s.k], x0 = x(Math.max(dm[0], Math.min(0, dm[1])) || dm[0]), x1 = x(v);
      if (dm[0] >= 0) x0 = x(dm[0]);
      var g = el('g', { 'class': 'bcrow', tabindex: '0' });
      g.appendChild(el('text', { x: 4, y: y + bh * 0.7, 'class': 'bcrank' }, String(k + 1)));
      if (t.g) g.appendChild(el('image', { href: t.g, x: 22, y: y + 1, width: bh - 2, height: bh - 2 }));
      var a = el('a', { href: t.u }); a.appendChild(el('text', { x: 46, y: y + bh * 0.7, 'class': 'bcab' }, t.a)); g.appendChild(a);
      var r = el('rect', { x: Math.min(x0, x1), y: y, width: Math.max(1, Math.abs(x1 - x0)), height: bh, rx: 2, style: 'fill:' + t.p + ';stroke:' + t.s + ';stroke-width:1' });
      r.appendChild(el('title', {}, t.n + ': ' + fmt(v, s.f)));
      g.appendChild(r);
      g.appendChild(el('text', { x: Math.max(x0, x1) + 5, y: y + bh * 0.7, 'class': 'bcval' }, fmt(v, s.f)));
      var show = function () { info.innerHTML = ''; var b = document.createElement('b'); b.textContent = t.n; info.appendChild(b);
        info.appendChild(document.createTextNode(': ' + s.l + ' ' + fmt(v, s.f) + ' (' + (k + 1) + ' of ' + rows.length + '; league average ' + fmt(s.a, s.f) + ')')); };
      g.addEventListener('mouseenter', show); g.addEventListener('click', show); g.addEventListener('focus', show);
      svg.appendChild(g);
    });
    var ax = x(s.a);
    svg.appendChild(el('line', { x1: ax, x2: ax, y1: top - 6, y2: H - 6, 'class': 'bcavg' }));
    svg.appendChild(el('text', { x: ax, y: top - 9, 'text-anchor': 'middle', 'class': 'bcavgt' }, 'League avg ' + fmt(s.a, s.f)));
    plot.innerHTML = ''; plot.appendChild(svg);
    info.textContent = (s.h === false ? 'Lower is better; ' : s.h == null ? 'Neither direction is "better"; sorted high to low. ' : '') + 'Tap or hover a bar for the exact value.';
  }
  function pctile(D, s, v) {
    var xs = D.teams.map(function (t) { return t.v[s.k]; }).filter(function (x) { return x != null; });
    var worse = xs.filter(function (x) { return s.h === false ? x > v : x < v; }).length, ties = xs.filter(function (x) { return x === v; }).length - 1;
    return 100 * (worse + ties / 2) / Math.max(1, xs.length - 1);
  }
  function drawCmp(root, D) {
    var ids = [].map.call(root.querySelectorAll('.cmpts input:checked'), function (i) { return +i.value; });
    var plot = root.querySelector('.cmpplot'), mode = (root.querySelector('input[type=radio]:checked') || {}).value || 'grp';
    plot.innerHTML = '';
    if (ids.length < 2) { plot.innerHTML = '<p class="muted">Pick at least two teams.</p>'; return; }
    var ts = D.teams.filter(function (t) { return ids.indexOf(t.id) >= 0; });
    var stats = D.compare.map(function (k) { return D.stats.filter(function (s) { return s.k === k; })[0]; }).filter(Boolean);
    var W = Math.max(340, Math.min(760, plot.clientWidth || 760)), L = W < 500 ? 112 : 150, R = 56, bh = 15, gg = 14, top = 30, n = ts.length, H = top + stats.length * (n * bh + gg) + 10;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'bcsvg' });
    ts.forEach(function (t, j) {   /* legend */
      var lw = (W - L) / n; svg.appendChild(el('rect', { x: L + j * lw, y: 6, width: 14, height: 14, style: 'fill:' + t.p + ';stroke:' + t.s }));
      svg.appendChild(el('text', { x: L + j * lw + 19, y: 18, 'class': 'bcab' }, (lw < 150 || t.n.length > 20) ? t.a : t.n));
    });
    stats.forEach(function (s, k) {
      var y0 = top + k * (n * bh + gg);
      svg.appendChild(el('text', { x: L - 8, y: y0 + n * bh / 2 + 4, 'text-anchor': 'end', 'class': 'bclab' }, (s.k === 'RA/G' ? 'Runs allowed/g' : s.l) + (s.h === false ? ' \u2193' : '')));
      var all = D.teams.map(function (t) { return t.v[s.k]; }).filter(function (x) { return x != null; }), dm = mode === 'pct' ? [0, 100] : domain(all, s);
      var x = function (v) { return L + (W - L - R) * (v - dm[0]) / ((dm[1] - dm[0]) || 1); };
      ts.forEach(function (t, j) {
        var v = t.v[s.k]; if (v == null) return;
        var val = mode === 'pct' ? pctile(D, s, v) : v, x0 = x(dm[0] < 0 ? 0 : dm[0]), x1 = x(val);
        var r = el('rect', { x: Math.min(x0, x1), y: y0 + j * bh, width: Math.max(1, Math.abs(x1 - x0)), height: bh - 2, style: 'fill:' + t.p + ';stroke:' + t.s });
        r.appendChild(el('title', {}, t.n + ' ' + s.l + ': ' + fmt(v, s.f) + (mode === 'pct' ? ' (' + Math.round(val) + 'th percentile)' : '')));
        svg.appendChild(r);
        svg.appendChild(el('text', { x: Math.max(x0, x1) + 4, y: y0 + j * bh + bh - 4, 'class': 'bcval sm' }, mode === 'pct' ? Math.round(val) + ' pct' : fmt(v, s.f)));
      });
      if (mode === 'pct') { var m = x(50); svg.appendChild(el('line', { x1: m, x2: m, y1: y0 - 2, y2: y0 + n * bh, 'class': 'bcavg' })); }
      else if (s.a != null) { var ax = x(s.a); svg.appendChild(el('line', { x1: ax, x2: ax, y1: y0 - 2, y2: y0 + n * bh, 'class': 'bcavg' })); }
    });
    plot.appendChild(svg);
    var p = document.createElement('p'); p.className = 'muted note';
    p.textContent = mode === 'pct' ? 'League percentile: 100 = best in the league for that stat (direction handled), 50 = middle. Dashed line = 50th percentile.' : 'Bars use each stat\'s league range; dashed line = league average; \u2193 = lower is better.';
    plot.appendChild(p);
  }
  function init(root) {
    var D = JSON.parse(root.querySelector('.bcdata').textContent), sel = root.querySelector('.bcsel'), lastW = 0;
    var redraw = function () { var w = root.querySelector('.bcplot').clientWidth || root.querySelector('.cmpplot').clientWidth; if (!w || Math.abs(w - lastW) < 20) return; lastW = w;
      drawBars(root, D, sel.value); if (!root.querySelector('.bcv[data-v=cmp]').hidden) drawCmp(root, D); };
    window.addEventListener('resize', redraw);
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[role=tab]')) setTimeout(redraw, 30); });
    if (window.location.hash) setTimeout(redraw, 100);
    sel.addEventListener('change', function () { drawBars(root, D, sel.value); });
    drawBars(root, D, sel.value);
    [].forEach.call(root.querySelectorAll('.bctabs button'), function (b) {
      b.addEventListener('click', function () {
        [].forEach.call(root.querySelectorAll('.bctabs button'), function (x) { x.classList.toggle('on', x === b); });
        [].forEach.call(root.querySelectorAll('.bcv'), function (v) { v.hidden = v.getAttribute('data-v') !== b.getAttribute('data-v'); });
        if (b.getAttribute('data-v') === 'cmp') drawCmp(root, D); else drawBars(root, D, sel.value);
      });
    });
    var boxes = root.querySelectorAll('.cmpts input');
    /* default compare: the top three by run differential */
    var top3 = D.teams.slice().sort(function (a, b) { return (b.v['Run diff'] || 0) - (a.v['Run diff'] || 0); }).slice(0, 3).map(function (t) { return t.id; });
    [].forEach.call(boxes, function (b) {
      b.checked = top3.indexOf(+b.value) >= 0;
      b.addEventListener('change', function () {
        var on = root.querySelectorAll('.cmpts input:checked');
        if (on.length > 4) b.checked = false;
        drawCmp(root, D);
      });
    });
    [].forEach.call(root.querySelectorAll('input[type=radio]'), function (r) { r.addEventListener('change', function () { drawCmp(root, D); }); });
  }
  function go() { [].forEach.call(document.querySelectorAll('.barc'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
