// ══ CLEAR BAD STORED API (runs first, before anything) ══
(function(){
  const v = localStorage.getItem('noor_api') || '';
  if (v.includes('44.221')) {
    localStorage.removeItem('noor_api');
  }
})();

// ══ DARK MODE (runs before anything else) ══
(function initTheme(){
  const saved = localStorage.getItem('noor_theme');
  const sys   = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && sys)) {
    document.documentElement.setAttribute('data-theme','dark');
    setDarkIcon(true);
  }
})();
function setDarkIcon(dark){
  const ic = document.getElementById('dm-icon');
  if (!ic) return;
  ic.innerHTML = dark
    ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
}
function toggleDark(){
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement[dark ? 'removeAttribute' : 'setAttribute']('data-theme','dark');
  localStorage.setItem('noor_theme', dark ? 'light' : 'dark');
  setDarkIcon(!dark);
  toast(dark ? 'المظهر الفاتح' : 'المظهر الداكن');
}

// ══ STATE ══
const S = {
  results:[], page:1, totalPages:1,
  degree:'', zone:'*',
  books:[], rawis:[], mohdith:[],
  query:'', favs:[], shareText:'', daily:null,
  dailyPool:[], dailyPoolIdx:0,
};
try { S.favs = JSON.parse(localStorage.getItem('noor_favs') || '[]'); } catch(e) {}

// ══ API BASE ══
(function(){
  const v = localStorage.getItem('noor_api') || '';
  if (v.includes('44.221') || v.includes('98.92')) localStorage.removeItem('noor_api');
})();
const _IS_LOCAL = ['localhost','127.0.0.1'].includes(window.location.hostname);
let API_BASE = _IS_LOCAL
  ? (localStorage.getItem('noor_api') || 'http://localhost:3000')
  : '';

// ══ DATE ══
function updateDates(){
  const n = new Date();
  const el_g = document.getElementById('greg');
  const el_h = document.getElementById('hijri');
  if (el_g) el_g.textContent = n.toLocaleDateString('ar-SA',{day:'numeric',month:'long',year:'numeric'});
  try {
    if (el_h) el_h.textContent = n.toLocaleDateString('ar-SA-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'});
  } catch(e) { if (el_h) el_h.textContent = ''; }
}
updateDates();

// ══ API CONFIG PANEL ══
function toggleCfg(){
  const p = document.getElementById('cfg-panel');
  if (!p) return;
  p.classList.toggle('open');
  if (p.classList.contains('open')) {
    const inp = document.getElementById('api-inp');
    if (inp) inp.value = API_BASE;
  }
}
function saveApiConfig(){
  const inp = document.getElementById('api-inp');
  if (!inp) return;
  let v = inp.value.trim().replace(/\/$/,'');
  if (!v) { toast('أدخل رابطًا صحيحًا'); return; }
  if (!v.startsWith('http')) v = 'http://' + v;
  API_BASE = v;
  localStorage.setItem('noor_api', v);
  const p = document.getElementById('cfg-panel');
  if (p) p.classList.remove('open');
  checkApi();
  toast('تم تحديث رابط الخادم ✓');
}

document.addEventListener('click', e => {
  const p = document.getElementById('cfg-panel');
  const s = document.querySelector('.api-status');
  if (p && p.classList.contains('open') && !p.contains(e.target) && s && !s.contains(e.target))
    p.classList.remove('open');
});

async function checkApi(){
  const dot = document.getElementById('api-dot');
  const lbl = document.getElementById('api-lbl');
  let banner = document.getElementById('proxy-banner');
  try {
    const r = await fetch(API_BASE + '/', { signal: AbortSignal.timeout(5000) });
    if (r.ok || r.status < 500) {
      if (dot) dot.className = 'api-dot on';
      if (lbl) lbl.textContent = 'متصل';
      if (banner) banner.remove();
    } else throw 0;
  } catch {
    if (dot) dot.className = 'api-dot off';
    if (lbl) lbl.textContent = 'غير متصل';
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'proxy-banner';
      banner.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#0D3D28;border:2px solid #C9A84C;border-radius:14px;padding:14px 20px;z-index:9000;max-width:420px;width:90%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.5);direction:rtl;font-family:Cairo,sans-serif';
      banner.innerHTML = '<div style="color:#E8C97A;font-weight:700;font-size:.9rem;margin-bottom:6px">\u26a0\ufe0f \u0627\u0644\u0628\u0631\u0648\u0643\u0633\u064a \u063a\u064a\u0631 \u0645\u0634\u063a\u0651\u0644</div><div style="color:rgba(255,255,255,.75);font-size:.76rem;line-height:1.9;margin-bottom:10px">\u0634\u063a\u0651\u0644 \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0641\u064a Terminal:<br><code style=\"background:rgba(255,255,255,.1);padding:4px 10px;border-radius:6px;font-size:.82rem;display:inline-block;direction:ltr\">node proxy.js</code></div><button onclick=\"checkApi();document.getElementById(\'proxy-banner\').remove()\" style=\"background:#C9A84C;border:none;border-radius:8px;padding:6px 16px;font-weight:700;font-size:.78rem;cursor:pointer;color:#1C1410;font-family:Cairo,sans-serif\">\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629</button>';
      document.body.appendChild(banner);
    }
  }
}

// ══ NAVIGATION ══
let _currentPage = 'home';
function go(name, btn, mnavId){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn && btn.classList.contains('nav-btn')) btn.classList.add('active');
  else {
    const idx = {home:0,search:1,favorites:2,about:3}[name];
    document.querySelectorAll('.nav-btn')[idx]?.classList.add('active');
  }

  document.querySelectorAll('.mnav-btn').forEach(b => b.classList.remove('active'));
  const mId = mnavId || 'mnav-' + name;
  document.getElementById(mId)?.classList.add('active');

  _currentPage = name;
  if (name === 'favorites') renderFavs();
  if (name === 'search') setTimeout(() => document.getElementById('q')?.focus(), 100);
}

// ══ API FETCH ══
async function api(path){
  const res = await fetch(API_BASE + path, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
function buildPath(q, page, opts){
  const { degree='', zone='*', books=[], rawis=[], mohdith=[] } = opts;
  let p = `/v1/site/hadith/search?value=${encodeURIComponent(q)}&page=${page}&removehtml=true&specialist=false&tab=1`;
  if (degree) p += `&d[]=${degree}`;
  books.forEach(b  => p += `&s[]=${b}`);
  mohdith.forEach(m => p += `&m[]=${m}`);
  rawis.forEach(r  => p += `&rawi[]=${encodeURIComponent(r.trim())}`);
  if (zone && zone !== '*') p += `&t=${zone}`;
  return p;
}

// ══ FILTERS ══
function setSingle(btn, type, val){
  S[type] = val;
  btn.closest('.filter-chips').querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderActiveFilters();
}
function toggleMulti(btn, type){
  const val = btn.dataset.val, arr = S[type], idx = arr.indexOf(val);
  if (idx === -1) { arr.push(val); btn.classList.add('on'); }
  else            { arr.splice(idx,1); btn.classList.remove('on'); }
  renderActiveFilters();
}
function clearAllFilters(){
  S.degree=''; S.zone='*'; S.books=[]; S.rawis=[]; S.mohdith=[];
  document.querySelectorAll('.filter-chips .fbtn').forEach(b => b.classList.remove('on'));
  document.querySelector('#fc-degree .fbtn')?.classList.add('on');
  document.querySelector('#fc-zone .fbtn')?.classList.add('on');
  renderActiveFilters(); toast('تم مسح الفلاتر');
}
const BOOK_NAMES  = {'6216':'البخاري','3088':'مسلم','10007':'أبو داود','9894':'الترمذي','2023':'السلسلة الصحيحة','13457':'الأربعون','96':'الصحيح المسند','2197':'ابن حبان','11240':'المستدرك','1406':'موطأ مالك'};
const MOH_NAMES   = {'256':'البخاري','261':'مسلم','275':'أبو داود','279':'الترمذي','273':'ابن ماجه','303':'النسائي','1420':'الألباني','855':'ابن حجر','241':'أحمد','204':'الشافعي'};
const DEG_NAMES   = {'1':'صحيح','2':'حسن','3':'ضعيف'};
const ZON_NAMES   = {'0':'مرفوعة','1':'قدسية','2':'آثار صحابة'};

function renderActiveFilters(){
  const wrap = document.getElementById('active-filters');
  if (!wrap) return;
  const chips = [];
  if (S.degree) chips.push({ label:'درجة: '+DEG_NAMES[S.degree], rm:()=>{ S.degree=''; document.querySelector('#fc-degree .fbtn')?.click(); }});
  if (S.zone && S.zone!=='*') chips.push({ label:'نطاق: '+ZON_NAMES[S.zone], rm:()=>{ S.zone='*'; document.querySelector('#fc-zone .fbtn')?.click(); }});
  S.books.forEach(v   => chips.push({ label:'كتاب: '+(BOOK_NAMES[v]||v),   rm:()=>{ const i=S.books.indexOf(v);   if(i>-1){S.books.splice(i,1);   document.querySelector(`#fc-books [data-val="${v}"]`)?.classList.remove('on');   renderActiveFilters();}}}));
  S.mohdith.forEach(v => chips.push({ label:'محدث: '+(MOH_NAMES[v]||v),    rm:()=>{ const i=S.mohdith.indexOf(v); if(i>-1){S.mohdith.splice(i,1); document.querySelector(`#fc-mohdith [data-val="${v}"]`)?.classList.remove('on'); renderActiveFilters();}}}));
  S.rawis.forEach(v   => chips.push({ label:'راوي: '+v,                    rm:()=>{ const i=S.rawis.indexOf(v);   if(i>-1){S.rawis.splice(i,1);   document.querySelector(`#fc-rawis [data-val="${v}"]`)?.classList.remove('on');   renderActiveFilters();}}}));
  if (!chips.length) { wrap.style.display='none'; wrap.innerHTML=''; return; }
  wrap.style.display = 'flex';
  wrap._chips = chips;
  wrap.innerHTML = chips.map((c,i) => `<span class="af-chip">${c.label} <span class="af-x" onclick="rmFilter(${i})">✕</span></span>`).join('');
}
function rmFilter(i){ const w = document.getElementById('active-filters'); if (w?._chips?.[i]) w._chips[i].rm(); }

// ══ BADGE ══
// درجة الحديث حكم المحدث — تُعرض دائماً منسوبةً إليه
function badge(g, mohdith){
  if (!g) return '';
  const label = mohdith ? `${g} — ${mohdith}` : g;
  if (g.includes('صحيح')) return `<span class="badge b-sahih" title="حكم ${mohdith||'المحدث'} على الحديث">${label}</span>`;
  if (g.includes('حسن'))  return `<span class="badge b-hasan" title="حكم ${mohdith||'المحدث'} على الحديث">${label}</span>`;
  if (g.includes('ضعيف')||g.includes('موضوع')||g.includes('منكر')) return `<span class="badge b-daif" title="حكم ${mohdith||'المحدث'} على الحديث">${label}</span>`;
  return `<span class="badge" style="background:rgba(0,0,0,.06);color:var(--ink-muted);border:1px solid rgba(0,0,0,.1)" title="حكم ${mohdith||'المحدث'} على الحديث">${label}</span>`;
}

function isFav(h){ return S.favs.some(f => f.hadith === h.hadith && f.rawi === h.rawi); }
function saveFavs(){ localStorage.setItem('noor_favs', JSON.stringify(S.favs)); }
function getResultSet(){
  if (_currentPage === 'home')      return window._homeR || [];
  if (_currentPage === 'favorites') return S.favs;
  return window._R || S.results;
}

// ══ CARD ══
function card(h, i){
  const fav  = isFav(h);
  const text = (h.hadith||'').substring(0,280) + ((h.hadith||'').length>280?'…':'');
  const cats = (h.categories||[]).map(c => `<span class="cat">${c.name}</span>`).join('');
  return `<div class="hcard" id="c${i}">
    <div class="card-top">
      <div class="card-badges">${badge(h.grade, h.mohdith)}${h.book?`<span class="badge b-book">${h.book}</span>`:''}</div>
      <div class="card-btns">
        <button class="ico-btn ${fav?'fav':''}" onclick="toggleFav(${i})" title="${fav?'إزالة':'حفظ'}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${fav?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button class="ico-btn" onclick="openShare(${i})" title="مشاركة">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
    </div>
    <div class="htext" onclick="openDetail(${i})">${text}</div>
    ${cats?`<div class="cats">${cats}</div>`:''}
    <div class="card-foot">
      <div class="card-meta">
        ${h.rawi?`<span class="badge b-rawi">${h.rawi}</span>`:''}
      </div>
      <div class="card-acts">
        ${h.hasSharhMetadata?`<button class="btn btn-sm btn-light" onclick="openDetail(${i},true)">الشرح</button>`:''}
      </div>
    </div>
  </div>`;
}

// ══ RENDER RESULTS ══
function renderResults(arr, cid, total){
  const el = document.getElementById(cid);
  if (!arr.length){
    el.innerHTML = `<div class="empty"><div class="empty-icon"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div class="empty-t">لا نتائج</div><div class="empty-d">لم يُعثر على أحاديث. جرّب كلمات أخرى أو غيّر الفلاتر.</div></div>`;
    return;
  }
  const sorted = [...arr].sort((a,b) => (b.grade||'').includes('صحيح') - (a.grade||'').includes('صحيح'));
  window._R = sorted;
  if (cid === 'home-results') window._homeR = sorted;
  let html = `<div class="results-hdr"><span class="results-count">وُجد <strong>${total}</strong> حديثًا</span></div>`;
  html += sorted.map((h,i) => card(h,i)).join('');
  if (S.totalPages > 1 && cid === 'search-results'){
    html += `<div class="pager">`;
    const p = S.page, max = Math.min(S.totalPages, p+4), min = Math.max(1, p-2);
    if (min > 1) html += `<button class="pbtn" onclick="gotoPage(1)">1</button><span style="align-self:center;color:var(--ink-muted)">…</span>`;
    for (let i = min; i <= max; i++) html += `<button class="pbtn ${i===p?'on':''}" onclick="gotoPage(${i})">${i}</button>`;
    if (max < S.totalPages) html += `<span style="align-self:center;color:var(--ink-muted)">…</span><button class="pbtn" onclick="gotoPage(${S.totalPages})">${S.totalPages}</button>`;
    html += `
  <div style="text-align:center;padding:14px 10px 4px;font-size:.69rem;color:var(--ink-muted);line-height:1.8;border-top:1px solid var(--border);margin-top:10px">
    ⚠️ قد تحتوي النتائج على أخطاء في العرض — تحقق دائمًا من المصدر الأصلي
    <a href="https://dorar.net" target="_blank" rel="noopener" style="color:var(--emerald);font-weight:600">الدرر السنية</a>
  </div>`;
    html += `</div>`;
  }
  el.innerHTML = html;
}

// ══ SHARH EXTRACTION ══
function extractSharh(raw){
  if (!raw) return '';
  raw = raw.trim();
  const patterns = ['\n        \n\n', '\n\n        \n\n', '\n \n\n', '\n\n\n'];
  for (const sep of patterns){
    const idx = raw.indexOf(sep);
    if (idx !== -1){
      const after = raw.substring(idx + sep.length).trim();
      if (after.length > 20) return after;
    }
  }
  const parts = raw.split(/\n{2,}/);
  if (parts.length > 1){
    const rest = parts.slice(1).join('\n\n').trim();
    if (rest.length > 20) return rest;
  }
  return raw;
}

// ══ DAILY HADITH ══
const KWS = ['الإيمان','الصلاة','الصدق','الرحمة','العلم','الصبر','التوبة','الذكر','الجنة','البر','الأمانة','الإحسان','القرآن'];

async function loadDaily(){
  const today = new Date().toDateString();
  const cd = localStorage.getItem('daily_date'), cp = localStorage.getItem('daily_pool');
  if (cd === today && cp){
    S.dailyPool    = JSON.parse(cp);
    S.dailyPoolIdx = parseInt(localStorage.getItem('daily_pool_idx') || '0') % S.dailyPool.length;
    S.daily        = S.dailyPool[S.dailyPoolIdx];
    renderDaily(); return;
  }
  setHeroLoading();
  const d   = new Date().getDate();
  const kws = [KWS[d%KWS.length], KWS[(d+4)%KWS.length], KWS[(d+8)%KWS.length]];
  try {
    const results = await Promise.allSettled(kws.map(k => api(buildPath(k,1,{degree:'1',zone:'0',books:[],rawis:[],mohdith:[]}))));
    let pool = [];
    results.forEach(r => { if (r.status==='fulfilled') pool.push(...(r.value.data||[])); });
    pool = pool.filter(h => (h.grade||'').includes('صحيح'));
    const seen = new Set();
    pool = pool.filter(h => { if(seen.has(h.hadith)) return false; seen.add(h.hadith); return true; });
    if (!pool.length) throw new Error('empty pool');
    for (let i = pool.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    pool = pool.slice(0,30);
    S.dailyPool = pool; S.dailyPoolIdx = 0; S.daily = pool[0];
    localStorage.setItem('daily_pool', JSON.stringify(pool));
    localStorage.setItem('daily_date', today);
    localStorage.setItem('daily_pool_idx', '0');
    renderDaily();
  } catch(e){
    const dm = document.getElementById('daily-meta');
    if (dm) dm.innerHTML = `<button class="btn btn-outline btn-sm" onclick="loadDaily()">إعادة المحاولة</button>`;
  }
}

function setHeroLoading(){
  const dt = document.getElementById('daily-text');
  const dm = document.getElementById('daily-meta');
  if (dt) dt.innerHTML = '<div class="loading" style="justify-content:flex-start;padding:0"><div class="spin"></div> يتم تحميل حديث...</div>';
  if (dm) dm.innerHTML = '';
}

function renderDaily(){
  const h = S.daily; if (!h) return;
  const dt = document.getElementById('daily-text');
  const dm = document.getElementById('daily-meta');
  if (dt) dt.textContent = h.hadith || '';
  if (dm) dm.innerHTML = `
    ${badge(h.grade, h.mohdith)}
    ${h.rawi   ? `<span class="badge b-rawi"  style="color:rgba(255,255,255,.75);background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)">${h.rawi}</span>` : ''}
    ${h.book   ? `<span class="badge b-book">${h.book}</span>` : ''}
  `;
  const shPanel = document.getElementById('daily-sharh');
  if (shPanel) { shPanel.innerHTML = ''; shPanel.style.display = 'none'; }
  const sharthBtn = document.getElementById('sharh-btn');
  if (sharthBtn){
    const commentary = extractSharh(h.sharhMetadata?.sharh || '');
    sharthBtn.style.display = commentary.length > 10 ? 'inline-flex' : 'none';
    sharthBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> الشرح`;
  }
  const rb = document.getElementById('refresh-btn');
  if (rb) rb.disabled = false;
  const favIcon = document.getElementById('daily-fav-icon');
  if (favIcon){
    if (isFav(h)) { favIcon.style.fill = '#ef4444'; favIcon.style.stroke = '#ef4444'; }
    else          { favIcon.style.fill = 'none';    favIcon.style.stroke = 'currentColor'; }
  }
  
  const simBtn = document.getElementById('daily-sim-btn');
  if (simBtn) {
    simBtn.style.display = h.hasSimilarHadith ? 'inline-flex' : 'none';
    simBtn.onclick = () => openDailySimilar();  
  }
}



function toggleDailySharh(){
  const h = S.daily; if (!h) return;
  const panel = document.getElementById('daily-sharh');
  const btn   = document.getElementById('sharh-btn');
  if (!panel) return;
  if (panel.style.display === 'none' || !panel.innerHTML){
    const commentary = extractSharh(h.sharhMetadata?.sharh || '');
    if (!commentary) { toast('لا يوجد شرح متاح'); return; }
    panel.innerHTML = `<div style="background:rgba(0,0,0,.25);border-right:3px solid var(--gold);border-radius:12px;padding:14px 16px;font-family:'Scheherazade New',serif;font-size:.98rem;line-height:2.05;color:rgba(253,250,244,.9);white-space:pre-wrap">${commentary}</div>`;
    panel.style.display = 'block';
    if (btn) btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg> إخفاء`;
  } else {
    panel.style.display = 'none';
    if (btn) btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> الشرح`;
  }
}

function openDailyDetail(){
  if (!S.daily) return;
  window._homeR = [S.daily];
  window._R     = [S.daily];
  const prev = _currentPage; _currentPage = 'home';
  openDetail(0);
  _currentPage = prev;
}

function refreshDaily(){
  if (!S.dailyPool.length) { loadDaily(); return; }
  const rb = document.getElementById('refresh-btn');
  if (rb) rb.disabled = true;
  S.dailyPoolIdx = (S.dailyPoolIdx + 1) % S.dailyPool.length;
  S.daily = S.dailyPool[S.dailyPoolIdx];
  localStorage.setItem('daily_pool_idx', String(S.dailyPoolIdx));
  const tx = document.getElementById('daily-text');
  const mt = document.getElementById('daily-meta');
  if (tx) tx.style.opacity = '0';
  if (mt) mt.style.opacity = '0';
  setTimeout(() => {
    renderDaily();
    if (tx) { tx.style.transition = 'opacity .28s'; tx.style.opacity = '1'; }
    if (mt) { mt.style.transition = 'opacity .28s'; mt.style.opacity = '1'; }
  }, 200);
}

function shareDailyHadith(){ if (S.daily) triggerShare(S.daily); }
function saveDailyFav(){
  if (!S.daily) return;
  const icon = document.getElementById('daily-fav-icon');
  if (!isFav(S.daily)){
    S.favs.unshift(S.daily); saveFavs();
    if (icon) { icon.style.fill = '#ef4444'; icon.style.stroke = '#ef4444'; }
    toast('تم حفظ حديث اليوم');
  } else {
    toast('الحديث محفوظ مسبقاً');
  }
}

// ══ QUICK SEARCH ══
function quickSearch(kw){
  const qi = document.getElementById('q');
  if (qi) qi.value = kw;
  go('search', document.querySelectorAll('.nav-btn')[1], 'mnav-search');
  doSearch();
}

// ══ SEARCH ══
async function doSearch(){
  const raw = document.getElementById('q')?.value.trim();
  if (!raw) { toast('أدخل كلمة للبحث'); return; }
  const q = removeTashkeel(raw);
  S.query = q; S.page = 1;
  const sr = document.getElementById('search-results');
  if (sr) sr.innerHTML = '<div class="loading"><div class="spin"></div> جارٍ البحث في السنة النبوية...</div>';
  await runSearch();
}
async function runSearch(){
  try {
    const data = await api(buildPath(S.query, S.page, {degree:S.degree, zone:S.zone, books:S.books, rawis:S.rawis, mohdith:S.mohdith}));
    S.results = data.data || [];
    const total = parseInt(data.metadata?.length) || 0;
    S.totalPages = Math.ceil(total/30) || 1;
    renderResults(S.results, 'search-results', total);
  } catch(e){
    const sr = document.getElementById('search-results');
    if (sr) sr.innerHTML = `
      <div style="text-align:center;padding:36px;color:var(--ink-muted)">
        <div style="font-weight:700;margin-bottom:5px">تعذر الاتصال بالـ API</div>
        <div style="font-size:.76rem;color:#e67373;margin-bottom:12px">${e.message||'خطأ'}</div>
        <div style="margin-top:13px"><button class="btn btn-gold" onclick="runSearch()">إعادة المحاولة</button></div>
      </div>`;
  }
}
async function gotoPage(p){
  S.page = p;
  const sr = document.getElementById('search-results');
  if (sr) sr.innerHTML = '<div class="loading"><div class="spin"></div></div>';
  await runSearch();
  window.scrollTo({ top:0, behavior:'smooth' });
}

// ══ DETAIL MODAL ══
async function openDetail(i, scrollToSharh){
  const R = getResultSet();
  const h = R[i]; if (!h) return;
  document.getElementById('detail-overlay').classList.add('open');
  document.getElementById('modal-body').innerHTML = '<div class="loading"><div class="spin"></div> تحميل التفاصيل...</div>';
  let shH = '', mhH = '', tkH = '';

  let sharhRaw = h.sharhMetadata?.sharh || '';
  if (!sharhRaw && (h.sharhMetadata?.id || h.hadithId)){
    const fetchId = h.sharhMetadata?.id || h.hadithId;
    try {
      const sd = await api(`/v1/site/sharh/${fetchId}`);
      sharhRaw = sd?.data?.sharhMetadata?.sharh || sd?.data?.sharh || sd?.sharhMetadata?.sharh || '';
    } catch(e){}
  }
  if (sharhRaw){
    const commentary = extractSharh(sharhRaw);
    const display = (commentary && commentary.length > 15) ? commentary : sharhRaw.trim();
    if (display.length > 5) shH = `<div class="sec-title" id="sharh-section">شرح الحديث</div><div class="info-box sharh-full">${display}</div>`;
  }
  if (h.mohdithId){
    try {
      const md = await api(`/v1/site/mohdith/${h.mohdithId}`);
      if (md?.data?.info)
        mhH = `<div class="sec-title">عن المحدث</div><div class="info-box"><strong>${md.data.name||h.mohdith||''}</strong><span style="display:block;margin-top:4px">${md.data.info}</span></div>`;
    } catch(e){}
  }
  if (h.takhrij) tkH = `<div class="sec-title">تخريج</div><div class="info-box">${h.takhrij}</div>`;
  const cats = (h.categories||[]).map(c => `<span class="cat">${c.name}</span>`).join('');
  const hE = (h.hadith||'').replace(/'/g,"\\'").replace(/\n/g,' ');
  const rE = (h.rawi  ||'').replace(/'/g,"\\'");
  const mE = (h.mohdith||'').replace(/'/g,"\\'");
  const gE = (h.grade ||'').replace(/'/g,"\\'");

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-hadith">${h.hadith||''}</div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px">
      ${badge(h.grade, h.mohdith)}
      ${h.rawi         ? `<span class="badge b-rawi">${h.rawi}</span>` : ''}
      ${h.book         ? `<span class="badge b-book">${h.book}</span>` : ''}
      ${h.numberOrPage ? `<span class="badge" style="background:var(--bg2);color:var(--ink-muted);border:1px solid var(--border)">رقم: ${h.numberOrPage}</span>` : ''}
    </div>
    ${cats?`<div class="cats" style="margin-bottom:12px">${cats}</div>`:''}
    ${shH}${tkH}${mhH}
    <div class="sec-title" style="margin-top:14px">إجراءات</div>
    <div style="display:flex;gap:7px;flex-wrap:wrap">
      <button class="btn btn-gold btn-sm" onclick="triggerShareByParts('${hE}','${rE}','${mE}','${gE}')">مشاركة</button>
      <button class="btn btn-sm btn-light" onclick="saveFavObj(${i})">حفظ</button>
      ${h.hasSimilarHadith?`<button class="btn btn-sm btn-green" id="sim-btn-detail" onclick="openSimilarFromDetail(${i})">مشابهة</button>`:''}
    </div>`;
  if (scrollToSharh){
    setTimeout(() => {
      const el = document.getElementById('sharh-section');
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 120);
  }
}




async function openSimilarFromDetail(i){
  const R = getResultSet();
  const h = R[i]; if (!h) return;
  
  // cherche l'id dans tous les champs possibles
  const id = h.hadithId || h.id || h._id || h.hadith_id;
  if (!id) { toast('لا يوجد معرّف للحديث'); console.log('hadith obj:', h); return; }

  const mb = document.getElementById('modal-body');
  // remplace tout le contenu du modal par les résultats mشابهة
  mb.innerHTML = `
    <div class="modal-hadith" style="font-size:.85rem;opacity:.65;margin-bottom:14px">${(h.hadith||'').substring(0,150)}…</div>
    <div class="loading"><div class="spin"></div> جارٍ تحميل الأحاديث المشابهة...</div>`;
  try {
    const d = await api(`/v1/site/hadith/similar/${id}`);
    const s = d.data || [];
    if (!s.length){ mb.innerHTML += '<div style="text-align:center;padding:18px;color:var(--ink-muted)">لا توجد أحاديث مشابهة</div>'; return; }
    window._similarR = s;
    mb.innerHTML = `
      <div class="modal-hadith" style="font-size:.85rem;opacity:.65;margin-bottom:14px">${(h.hadith||'').substring(0,150)}…</div>
      <div class="sec-title">مشابهة (${s.length})</div>` +
      s.slice(0,8).map((x, idx) => `
        <div class="similar-item" onclick="openSimilarDetail(${idx})" style="cursor:pointer">
          <div class="similar-text">${x.hadith||''}</div>
          <div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap;align-items:center">
            ${badge(x.grade, x.mohdith)}
            ${x.rawi ? `<span class="badge b-rawi" style="cursor:pointer" onclick="event.stopPropagation();document.getElementById('detail-overlay').classList.remove('open');quickSearch('${(x.rawi||'').replace(/'/g,"\\'")}')">${x.rawi}</span>` : ''}
            ${x.book ? `<span class="badge b-book">${x.book}</span>` : ''}
            <span style="margin-right:auto;font-size:.7rem;color:var(--emerald);font-weight:600">← تفاصيل</span>
          </div>
        </div>`).join('');
  } catch(e){
    mb.innerHTML = '<div style="text-align:center;padding:18px;color:var(--ink-muted)">تعذر التحميل</div>';
  }
}




function saveFavObj(i){
  const R = getResultSet();
  const h = R[i]; if (!h) return;
  if (!isFav(h)) { S.favs.unshift(h); saveFavs(); toast('تم حفظ الحديث'); }
  else toast('محفوظ مسبقاً');
}

async function loadSimilar(id){
  const mb = document.getElementById('modal-body');
  mb.insertAdjacentHTML('beforeend','<div class="loading" id="sl"><div class="spin"></div></div>');
  try {
    const d = await api(`/v1/site/hadith/similar/${id}`);
    document.getElementById('sl')?.remove();
    const s = d.data || [];
    window._similarR = s;
    mb.insertAdjacentHTML('beforeend',
      `<div class="sec-title">مشابهة (${s.length})</div>` +
      s.slice(0,8).map((x, idx) => `
        <div class="similar-item" onclick="openSimilarDetail(${idx})" style="cursor:pointer">
          <div class="similar-text">${x.hadith||''}</div>
          <div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap;align-items:center">
            ${badge(x.grade, x.mohdith)}
            ${x.rawi ? `<span class="badge b-rawi" style="cursor:pointer" onclick="event.stopPropagation();document.getElementById('detail-overlay').classList.remove('open');quickSearch('${(x.rawi||'').replace(/'/g,"\\'")}')">${x.rawi}</span>` : ''}
            ${x.book ? `<span class="badge b-book">${x.book}</span>` : ''}
            <span style="margin-right:auto;font-size:.7rem;color:var(--emerald);font-weight:600">← تفاصيل</span>
          </div>
        </div>`).join(''));
  } catch(e){ document.getElementById('sl')?.remove(); }
}

async function openDailySimilar(){
  const h = S.daily; if (!h || !h.hadithId) return;
  document.getElementById('detail-overlay').classList.add('open');
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-hadith" style="margin-bottom:14px;font-size:.9rem;opacity:.7">${(h.hadith||'').substring(0,150)}…</div>
    <div class="loading"><div class="spin"></div> جارٍ تحميل الأحاديث المشابهة...</div>`;
  try {
    const d = await api(`/v1/site/hadith/similar/${h.hadithId}`);
    const s = d.data || [];
    window._similarR = s;
    document.getElementById('modal-body').innerHTML =
      `<div class="sec-title">مشابهة (${s.length})</div>` +
      s.slice(0,8).map((x, idx) => `
        <div class="similar-item" onclick="openSimilarDetail(${idx})" style="cursor:pointer">
          <div class="similar-text">${x.hadith||''}</div>
          <div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap;align-items:center">
            ${badge(x.grade, x.mohdith)}
            ${x.rawi ? `<span class="badge b-rawi" style="cursor:pointer" onclick="event.stopPropagation();document.getElementById('detail-overlay').classList.remove('open');quickSearch('${(x.rawi||'').replace(/'/g,"\\'")}')">${x.rawi}</span>` : ''}
            ${x.book ? `<span class="badge b-book">${x.book}</span>` : ''}
            <span style="margin-right:auto;font-size:.7rem;color:var(--emerald);font-weight:600">← تفاصيل</span>
          </div>
        </div>`).join('');
  } catch(e){
    document.getElementById('modal-body').innerHTML = '<div style="text-align:center;padding:18px;color:var(--ink-muted)">تعذر التحميل</div>';
  }
}

async function openSimilarDetail(idx){
  const h = (window._similarR||[])[idx]; if (!h) return;
  // Push into _R so openDetail works, then open at that index
  window._R = window._similarR;
  const prev = _currentPage; _currentPage = 'search'; // use _R
  await openDetail(idx);
  _currentPage = prev;
}

// ══ CLOSE OVERLAY ══
function closeOverlay(e, el){ if (e.target === el) el.classList.remove('open'); }

// ══ FAVORITES ══
function toggleFav(i){
  const R = getResultSet();
  const h = R[i]; if (!h) return;
  const idx = S.favs.findIndex(f => f.hadith === h.hadith && f.rawi === h.rawi);
  const btn = document.querySelector(`#c${i} .ico-btn`);
  if (idx === -1){
    S.favs.unshift(h);
    if (btn) { btn.classList.add('fav'); btn.querySelector('svg').setAttribute('fill','currentColor'); }
    toast('تم الحفظ');
  } else {
    S.favs.splice(idx,1);
    if (btn) { btn.classList.remove('fav'); btn.querySelector('svg').setAttribute('fill','none'); }
    toast('تم الإزالة');
  }
  saveFavs();
}
function renderFavs(){
  const el = document.getElementById('fav-list');
  if (!el) return;
  if (!S.favs.length){
    el.innerHTML = `<div class="empty"><div class="empty-icon"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div><div class="empty-t">لا توجد أحاديث محفوظة</div><div class="empty-d">اضغط على أيقونة القلب على أي حديث لحفظه</div></div>`;
    return;
  }
  window._R = S.favs;
  el.innerHTML = S.favs.map((h,i) => card(h,i)).join('');
}
function clearFavs(){
  if (!S.favs.length) return;
  if (confirm('هل تريد مسح جميع الأحاديث المحفوظة؟')){ S.favs = []; saveFavs(); renderFavs(); toast('تم مسح المفضلة'); }
}

// ══ SHARE ══
function triggerShare(h){
  S.shareText = fmt(h);
  const sp = document.getElementById('share-preview');
  if (sp) sp.textContent = (h.hadith||'').substring(0,110) + '…';
  document.getElementById('share-overlay').classList.add('open');
}
function openShare(i){ const R = getResultSet(); const h = R[i]; if (h) triggerShare(h); }
function triggerShareByParts(hadith, rawi, mohdith, grade){ triggerShare({hadith, rawi, mohdith, grade}); }
function fmt(h){
  let t = `« ${h.hadith||''} »\n`;
  t += `\n─────────────────`;
  if (h.rawi)    t += `\n📖 رواه ${h.rawi}`;
  if (h.mohdith) t += `\n✦ أخرجه ${h.mohdith}${h.book ? ` في ${h.book}` : ''}`;
  if (h.grade)   t += `\n✦ الدرجة: ${h.grade}`;
  t += `\n\n🌐 نور السنة\nnoor-al-sunnah-production.up.railway.app`;
  return t;
}
function via(p){
  const t = S.shareText, e = encodeURIComponent(t);
  if      (p==='whatsapp') window.open(`https://wa.me/?text=${e}`,'_blank');
  else if (p==='twitter')  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t.substring(0,260)+' #نور_السنة')}`,'_blank');
  else if (p==='telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(location.origin)}&text=${e}`,'_blank');
  else if (p==='copy'){
    navigator.clipboard.writeText(t).then(() => {
      toast('تم نسخ الحديث');
      document.getElementById('share-overlay').classList.remove('open');
    });
    return;
  }
  document.getElementById('share-overlay').classList.remove('open');
}

// ══ TOAST ══
function toast(msg, duration=2600){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '';
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.transition = 'transform .3s, opacity 1s';
    t.style.opacity = '0';
    setTimeout(() => {
      t.classList.remove('show');
      t.style.transition = '';
      t.style.opacity = '';
    }, 1000);
  }, duration);
}

// ══ UTILS ══
function removeTashkeel(str) {
  return str
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '')
    .replace(/\u0622/g, '\u0627')
    .replace(/\u0623/g, '\u0627')
    .replace(/\u0625/g, '\u0627')
    .replace(/\u0671/g, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .trim();
}

// ══ INIT ══
checkApi();
setInterval(checkApi, 30000);
loadDaily();
setTimeout(() => toast('أهلاً — اللهم صلِّ على نبينا محمد ﷺ'), 1000);
