// AOM Impact Data Room: renders the repo's markdown and CSVs directly (no build step).
(function () {
  const ROOT = '../'; // site/ lives one level below the data room files
  const app = document.getElementById('app');

  const CATALOG = [
    { group: 'The engagement', items: [
      { path: 'documents/research-impact-framework-2026.md', title: 'The Global Research Impact Framework (2026)', blurb: 'House summary: the five association imperatives and what the framework does not say.', tag: 'Start here' },
      { path: 'documents/a-framework-for-research-impact-2026.pdf', title: 'A Framework for Research Impact (full report, PDF)', blurb: 'The 46-page primary source.', tag: 'PDF' },
      { path: 'documents/progress-since-hambrick.md', title: 'Progress Since Hambrick (1994)', blurb: 'An honest scorecard of three decades of reform.' },
      { path: 'documents/management-ideas-timeline.pdf', title: '75 Years of Management Ideas (handout)', blurb: 'Timeline handout.', tag: 'PDF' },
    ]},
    { group: 'Why this is hard', items: [
      { path: 'documents/hambrick-academy-mattered.md', title: 'Hambrick: What If the Academy Actually Mattered?', blurb: '1993 AOM presidential address (AMR, 1994).' },
      { path: 'documents/rousseau-evidence-based-mgmt.md', title: 'Rousseau: Evidence-Based Management', blurb: 'AOM presidential address (AMR, 2006).' },
      { path: 'documents/ghoshal-bad-theories.md', title: 'Ghoshal: Bad Management Theories', blurb: "The field's most-cited critique." },
      { path: 'documents/rynes-great-divide.md', title: 'Rynes et al.: Across the Great Divide', blurb: 'Practitioner-gap evidence.' },
      { path: 'documents/akerlof-sins-of-omission.md', title: 'Akerlof: Sins of Omission', blurb: 'An economics critique of what gets studied.' },
      { path: 'documents/heckman-tyranny-top5.md', title: 'Heckman & Moktan: The Tyranny of the Top Five', blurb: 'Journal rankings as career gatekeepers.' },
      { path: 'documents/lariviere-publisher-oligopoly.md', title: 'Larivière et al.: The Publisher Oligopoly', blurb: 'Who controls scholarly output.' },
    ]},
    { group: 'The constructive program', items: [
      { path: 'documents/george-grand-challenges.md', title: 'George et al.: Grand Challenges', blurb: 'Management research on societal problems.' },
      { path: 'documents/rrbm-summary.md', title: 'RRBM: Responsible Research in Business & Management', blurb: 'The vision and seven principles.' },
      { path: 'documents/impact-debate.md', title: 'The Wider Debate, Annotated Map', blurb: 'Orientation to the full literature.' },
    ]},
    { group: 'Stakeholder interviews', note: 'Illustrative composites, not real individuals.', items: [
      { path: 'interviews/bschool-dean.md', title: 'Business School Dean', blurb: 'Top-40 US school; former strategy scholar.', tag: 'Composite' },
      { path: 'interviews/journal-editor.md', title: 'Senior Journal Editor', blurb: 'Senior editor at a top-tier journal; former associate dean.', tag: 'Composite' },
      { path: 'interviews/phd-student.md', title: 'Fifth-Year PhD Student', blurb: 'OB candidate on the job market; four years in industry first.', tag: 'Composite' },
      { path: 'interviews/practitioner.md', title: 'Practitioner (Chief People Officer)', blurb: 'CPO at a ~6,000-employee tech company.', tag: 'Composite' },
    ]},
    { group: 'Data notes', items: [
      { path: 'data/README.md', title: 'Data Folder README', blurb: 'Sources, columns, and how much to trust each number.', tag: 'Read first' },
      { path: 'data/membership-figures.md', title: 'AOM Public Figures', blurb: 'Membership, divisions, journals, meeting.' },
    ]},
  ];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cache = {};
  const get = path => cache[path] || (cache[path] = fetch(ROOT + path).then(r => {
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    return r.text();
  }));

  // Normalise a repo-relative path, resolving "../" against the current file's folder.
  function resolve(from, href) {
    const parts = (from.includes('/') ? from.replace(/[^/]+$/, '') : '').split('/').filter(Boolean);
    href.split('/').forEach(p => { if (p === '..') parts.pop(); else if (p && p !== '.') parts.push(p); });
    return parts.join('/');
  }
  const routeFor = path => /\.md$/.test(path) ? '#/doc/' + path : ROOT + path;

  function renderMarkdown(md, fromPath) {
    const html = DOMPurify.sanitize(marked.parse(md));
    const div = document.createElement('div');
    div.className = 'prose';
    div.innerHTML = html;
    // Relative links to repo files open inside the site.
    div.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (/^(https?:|mailto:|#)/.test(h)) { if (/^https?:/.test(h)) { a.target = '_blank'; a.rel = 'noopener'; } return; }
      a.setAttribute('href', routeFor(resolve(fromPath, h)));
    });
    // Inline code that names a data-room file becomes a link.
    div.querySelectorAll('code').forEach(c => {
      if (c.closest('pre') || c.closest('a')) return;
      const m = c.textContent.match(/^((?:documents|interviews|data)\/[\w.\-]+\.(?:md|pdf|csv))$/);
      if (!m) return;
      const a = document.createElement('a');
      a.href = routeFor(m[1]);
      c.replaceWith(a); a.appendChild(c);
    });
    div.querySelectorAll('table').forEach(t => {
      const w = document.createElement('div'); w.className = 'table-scroll';
      t.replaceWith(w); w.appendChild(t);
    });
    return div;
  }

  async function showMarkdown(path, back) {
    app.innerHTML = '';
    if (back) app.insertAdjacentHTML('beforeend', `<a class="back" href="${back.href}">← ${esc(back.label)}</a>`);
    try {
      const md = await get(path);
      app.appendChild(renderMarkdown(md, path));
      const h1 = app.querySelector('h1');
      document.title = (h1 ? h1.textContent + ' · ' : '') + 'AOM Impact Data Room';
    } catch (e) {
      app.insertAdjacentHTML('beforeend', `<p>Could not load <code>${esc(path)}</code>. If you opened this file directly, serve the repo root instead (see <code>site/README.md</code>).</p>`);
    }
  }

  function showLibrary() {
    document.title = 'Library · AOM Impact Data Room';
    app.innerHTML = `<h1 class="page-title">Library</h1>
      <p class="lede">Every document, interview and data note in the room. Summaries render here; PDFs open in a new tab.</p>` +
      CATALOG.map(g => `<h2 class="section-label">${esc(g.group)}</h2>
        ${g.note ? `<p class="muted" style="margin-top:-6px;font-size:14px">${esc(g.note)}</p>` : ''}
        <div class="cards">${g.items.map(d => `
          <a class="card" href="${routeFor(d.path)}"${/\.pdf$/.test(d.path) ? ' target="_blank" rel="noopener"' : ''}>
            <h3>${esc(d.title)}</h3>
            ${d.blurb ? `<p>${esc(d.blurb)}</p>` : ''}
            ${d.tag ? `<span class="tag">${esc(d.tag)}</span>` : ''}
          </a>`).join('')}</div>`).join('');
  }

  // CSV with quoted fields.
  function parseCSV(text) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (ch !== '\r') cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const [head, ...body] = rows;
    return body.filter(r => r.length === head.length).map(r => Object.fromEntries(head.map((h, i) => [h, isNaN(r[i]) || r[i] === '' ? r[i] : +r[i]])));
  }

  async function showData() {
    document.title = 'Data · AOM Impact Data Room';
    app.innerHTML = `<h1 class="page-title">Data</h1>
      <p class="lede">OpenAlex-derived figures, computed live from <a href="${ROOT}data/journal-metrics.csv">journal-metrics.csv</a> and <a href="${ROOT}data/field-trends.csv">field-trends.csv</a>. Read the <a href="#/doc/data/README.md">data README</a> before citing any of it.</p>
      <div class="callout"><b>Trust warning.</b> The company-affiliation column has a measured ~10% error rate and its institution names are worse (one audited AMJ "company" is Rutgers University). Treat counts as approximate; never group by company name. Affiliation is not occupation.</div>
      <section class="panel">
        <h2>Who writes the field's flagship literature, 2015–2025</h2>
        <p class="sub">Share of articles with a resolvable affiliation that have at least one author at an institution of the selected type.</p>
        <div style="margin-bottom:12px"><label for="aff-type" class="muted" style="font-size:14px">Institution type </label>
          <select id="aff-type"><option value="company">Company</option><option value="healthcare">Healthcare</option><option value="government">Government</option><option value="nonprofit">Nonprofit</option><option value="education">Education (academic)</option></select></div>
        <div class="legend"><span><i style="background:var(--series-1)"></i>AOM journals</span><span><i style="background:var(--series-muted)"></i>Comparators</span></div>
        <div id="chart-aff"></div>
        <details class="table-view"><summary>Table view</summary><div class="table-scroll" id="table-aff"></div></details>
      </section>
      <section class="panel">
        <h2>Open-access share of publications by field, 1995–2025</h2>
        <p class="sub">Business, management and accounting highlighted; other fields in gray. Hover for every field's value.</p>
        <div class="legend"><span><i style="background:var(--series-1)"></i>Business &amp; management</span><span><i style="background:var(--series-muted)"></i>Other fields</span></div>
        <div id="chart-oa"></div>
      </section>`;

    const [jm, ft] = await Promise.all([get('data/journal-metrics.csv'), get('data/field-trends.csv')]).then(([a, b]) => [parseCSV(a), parseCSV(b)]);

    // 2015–2025 aggregates per journal.
    const agg = {};
    jm.filter(r => r.year >= 2015 && r.year <= 2025).forEach(r => {
      const a = agg[r.journal] || (agg[r.journal] = { journal: r.journal, aom: /AOM/.test(r.field), works: 0, noaff: 0, aff: 0, company: 0, healthcare: 0, government: 0, nonprofit: 0, education: 0 });
      a.works += r.works; a.noaff += r.works_no_affiliation; a.aff += r.works_with_affiliation;
      ['company', 'healthcare', 'government', 'nonprofit', 'education'].forEach(t => a[t] += r[`works_with_${t}_author`]);
    });
    const journals = Object.values(agg);
    const short = j => j.replace('Academy of Management', 'AOM').replace('Learning and Education', 'Learning & Educ.');

    const sel = document.getElementById('aff-type');
    const draw = () => {
      const t = sel.value;
      const rows = journals.map(a => ({ label: short(a.journal), value: a[t] / a.aff, color: a.aom ? 'var(--series-1)' : 'var(--series-muted)', note: `${a[t]} of ${a.aff} articles` }))
        .sort((x, y) => y.value - x.value);
      Charts.hbar(document.getElementById('chart-aff'), rows, { max: t === 'education' ? 1 : Math.max(.05, Math.ceil(Math.max(...rows.map(r => r.value)) * 20) / 20) });
    };
    sel.addEventListener('change', draw);
    draw();
    const P = Charts.pct;
    document.getElementById('table-aff').innerHTML = `<table><thead><tr><th>Journal</th><th class="num">Articles</th><th class="num">No affiliation</th><th class="num">Company</th><th class="num">Healthcare</th><th class="num">Government</th><th class="num">Nonprofit</th><th class="num">Education</th></tr></thead><tbody>${
      journals.sort((a, b) => b.company / b.aff - a.company / a.aff).map(a => `<tr><td>${esc(a.journal)}</td><td class="num">${a.works.toLocaleString()}</td><td class="num">${P(a.noaff / a.works)}</td>${['company', 'healthcare', 'government', 'nonprofit', 'education'].map(t => `<td class="num">${P(a[t] / a.aff)}</td>`).join('')}</tr>`).join('')
    }</tbody></table>`;

    const fields = [...new Set(ft.map(r => r.field))];
    const isBiz = f => /Business/.test(f);
    const series = fields.map(f => ({
      name: isBiz(f) ? 'Business & mgmt' : f,
      color: isBiz(f) ? 'var(--series-1)' : 'var(--series-muted)',
      width: isBiz(f) ? 2.5 : 1.5,
      points: ft.filter(r => r.field === f).map(r => ({ x: r.year, y: r.open_access_share }))
    }));
    const yMax = Math.ceil(Math.max(...ft.map(r => r.open_access_share)) * 5) / 5;
    Charts.lines(document.getElementById('chart-oa'), series, { yMax, endLabels: ['Business & mgmt'] });
  }

  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const section = h.startsWith('doc/') ? 'library' : (h || 'brief');
    document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.dataset.route === section));
    if (h.startsWith('doc/')) showMarkdown(decodeURIComponent(h.slice(4)), { href: '#/library', label: 'Library' });
    else if (h === 'library') showLibrary();
    else if (h === 'data') showData();
    else showMarkdown('README.md');
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  // Theme toggle: OS preference by default, viewer override remembered.
  const btn = document.getElementById('theme-toggle');
  try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  btn.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  route();
})();
