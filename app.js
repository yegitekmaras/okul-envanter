// ─── SUPABASE CONFIG ───────────────────────────────────────────────────────
const SUPA_URL = 'https://rduqjqlgbpuzyqgrhizm.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdXFqcWxnYnB1enlxZ3JoaXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjY4MTgsImV4cCI6MjA5MzgwMjgxOH0.As8yVZ7nJoDIG7KDzMX6rBz-y7i9UrD75FuUgZfZN1c';
const { createClient } = supabase;
const db = createClient(SUPA_URL, SUPA_KEY);

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const ILCELER = ['Afşin','Andırın','Çağlayancerit','Dulkadiroğlu','Ekinözü','Elbistan','Göksun','Merkez (Onikişubat)','Nurhak','Pazarcık','Türkoğlu'];
const TIPLER = ['Anaokulu','İlkokul','Ortaokul','Lise','İmam Hatip Ortaokulu','İmam Hatip Lisesi'];
const GMS = ['Temel Eğitim Genel Müdürlüğü','Ortaöğretim Genel Müdürlüğü','Din Eğitimi Genel Müdürlüğü'];
const AGLAR = [['Fatih','Fatih'],['Uyumlaştırma','Uyumlaştırma'],['Müteahhit','Müteahhit'],['','Yok']];
const INETLER = [['adsl','ADSL'],['fatih_vpn','Fatih VPN'],['gsm','GSM'],['','Yok']];
const INET_MAP = {adsl:'ADSL', fatih_vpn:'Fatih VPN', gsm:'GSM'};
const FAZ_COLORS = ['#6366f1','#0d9488','#f59e0b','#ef4444'];
const INET_COLORS = {adsl:'#f59e0b', fatih_vpn:'#1a56db', gsm:'#0d9488'};

const FOTO_G1 = [{key:'foto_dis',lbl:'Dış Görünüm'},{key:'foto_koridor',lbl:'Koridor'},{key:'foto_sinif1',lbl:'Sınıf 1'},{key:'foto_sinif2',lbl:'Sınıf 2'},{key:'foto_sistem',lbl:'Sistem Odası'}];
const FOTO_G2 = [{key:'foto_bilisim',lbl:'Bilişim Sınıfı'},{key:'foto_yenilikci',lbl:'Yenilikçi Sınıf'}];

// ─── STATE ─────────────────────────────────────────────────────────────────
let activeId = null;
let editMode = false;
let allOkullar = [];
let chartInstances = [];
let addFotoTemp = {};

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllStats();
});

async function loadAllStats() {
  const { data, error } = await db.from('okullar').select('faz1,faz2,faz3,faz4,internet_turu');
  if (error) { renderTopStats([]); return; }
  renderTopStats(data || []);
}

function totalTahta(o) {
  return (parseInt(o.faz1)||0)+(parseInt(o.faz2)||0)+(parseInt(o.faz3)||0)+(parseInt(o.faz4)||0);
}

function renderTopStats(data) {
  const totalET = data.reduce((a,o) => a+totalTahta(o), 0);
  const inetOkul = data.filter(o => o.internet_turu && o.internet_turu !== '').length;
  document.getElementById('topStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:#ede9fe">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>
      </div>
      <div><div class="stat-val" style="color:#7c3aed">${totalET}</div><div class="stat-lbl">Toplam ET</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#dcfce7">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
      </div>
      <div><div class="stat-val" style="color:#16a34a">${inetOkul}</div><div class="stat-lbl">İnternet Olan</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#e8f0fe">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a56db"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
      </div>
      <div><div class="stat-val" style="color:#1a56db">${data.length}</div><div class="stat-lbl">Toplam Okul</div></div>
    </div>`;
}

// ─── PAGE NAV ──────────────────────────────────────────────────────────────
function setPage(p) {
  currentPage = p;
  document.getElementById('pageOkul').style.display = p === 'okul' ? '' : 'none';
  document.getElementById('pageIstat').style.display = p === 'istat' ? '' : 'none';
  // Ana Sayfa butonu
  const btnHome = document.getElementById('btnAnasayfa');
  if (btnHome) {
    btnHome.className = p === 'okul' ? 'btn-anasayfa active' : 'btn-anasayfa';
  }
  // İstatistik butonu
  const btnIstat = document.getElementById('btnIstat');
  if (btnIstat) {
    btnIstat.style.background = p === 'istat' ? 'rgba(255,255,255,0.35)' : '';
    btnIstat.style.fontWeight = p === 'istat' ? '700' : '';
  }
  if (p === 'istat') renderIstatistik();
}

// ─── LİSTELE ───────────────────────────────────────────────────────────────
async function listele() {
  const ilce = document.getElementById('selIlce').value;
  if (!ilce) { showToast('Lütfen bir ilçe seçin'); return; }

  const listPanel = document.getElementById('listPanel');
  const listEl = document.getElementById('okulListesi');
  listPanel.style.display = 'block';
  document.getElementById('detailPanel').style.display = 'none';
  activeId = null;

  listEl.innerHTML = `<div class="loading-overlay"><div class="spinner"></div>Yükleniyor...</div>`;
  document.getElementById('listInfo').textContent = '';

  const { data, error } = await db.from('okullar').select('*').eq('ilce', ilce).order('okul_adi');
  if (error) { showToast('Veri yüklenemedi: ' + error.message); return; }

  allOkullar = data || [];
  document.getElementById('listInfo').textContent = ilce + ' ilçesinde ' + allOkullar.length + ' okul bulundu.';

  if (!allOkullar.length) {
    listEl.innerHTML = '<div class="empty-state">Bu ilçede kayıtlı okul bulunamadı.</div>';
    return;
  }

  listEl.innerHTML = allOkullar.map(o => `
    <div class="okul-row" id="row-${o.id}" onclick="showDetail(${o.id})">
      <div>
        <div class="okul-row-name">${o.okul_adi}</div>
        <div class="okul-row-sub">${o.kurum_turu} · Kod: ${o.kurum_kodu}</div>
      </div>
      <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
    </div>`).join('');
}

// ─── DETAIL ────────────────────────────────────────────────────────────────
async function showDetail(id, isEdit) {
  activeId = id;
  editMode = !!isEdit;

  document.querySelectorAll('.okul-row').forEach(el => el.classList.remove('active'));
  const rowEl = document.getElementById('row-' + id);
  if (rowEl) rowEl.classList.add('active');

  const panel = document.getElementById('detailPanel');
  panel.innerHTML = `<div class="loading-overlay"><div class="spinner"></div>Yükleniyor...</div>`;
  panel.style.display = 'block';

  const { data: o, error } = await db.from('okullar').select('*').eq('id', id).single();
  if (error) { showToast('Veri yüklenemedi'); return; }

  panel.innerHTML = editMode ? renderEditPanel(o) : renderViewPanel(o);
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

function renderViewPanel(o) {
  const total = totalTahta(o);
  const fotoG1HTML = renderFotoView(o, FOTO_G1, 'photo-grid-5');
  const fotoG2HTML = renderFotoView(o, FOTO_G2, 'photo-grid-2');

  return `<div class="card detail-card">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap">
      <div>
        <div class="detail-title">${o.okul_adi}</div>
        <div class="detail-sub">${o.ilce} · ${o.kurum_turu}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn-danger btn-sm" onclick="okulSil(${o.id}, '${o.okul_adi}')">🗑 Sil</button>
        <button class="btn-primary btn-sm" onclick="showDetail(${o.id}, true)">Güncelle</button>
      </div>
    </div>

    <div class="section-hdr">Kurum Bilgileri</div>
    ${infoRow('İlçe', o.ilce)}
    ${infoRow('Kurum Adı', o.okul_adi)}
    ${infoRow('Kurum Kodu', o.kurum_kodu)}
    ${infoRow('Kurum Türü', o.kurum_turu)}
    ${infoRow('Bağlı Genel Müdürlük', o.genel_mudurluk)}
    ${infoRow('Okul Müdürü', o.mudur_adi)}
    ${infoRow('Müdür Telefonu', o.mudur_tel)}

    <div class="section-hdr">Altyapı Bilgileri</div>
    ${infoRow('Bina Durumu', badge(o.bina_durumu))}
    ${infoRow('Etkileşimli Tahta', badge(o.tahta_durumu))}
    ${o.tahta_durumu === 'var' ? `
      ${infoRow('Toplam ET Sayısı', `<span style="font-size:18px;font-weight:700;color:#1a56db">${total}</span>`)}
      ${infoRow('Faz Dağılımı', fazBadges(o))}
    ` : ''}
    ${infoRow('Bilişim Sınıfı', badge(o.bilisim_sinifi))}
    ${infoRow('Yenilikçi Sınıf', badge(o.yenilikci_sinif))}
    ${infoRow('Ağ Altyapısı', o.ag_altyapisi || '—')}
    ${infoRow('İnternet Türü', INET_MAP[o.internet_turu] || o.internet_turu || '—')}

    <div class="section-hdr">Fotoğraflar</div>
    <div class="photo-section">
      <div class="photo-section-lbl">Genel</div>
      <div class="photo-grid-5">${fotoG1HTML}</div>
    </div>
    <div class="photo-section">
      <div class="photo-section-lbl">Sınıflar</div>
      <div class="photo-grid-2">${fotoG2HTML}</div>
    </div>
    <div class="photo-hint">Fotoğraf eklemek için kutucuğa tıklayın</div>
  </div>`;
}

function renderFotoView(o, group, gridClass) {
  return group.map(f => {
    const url = o[f.key];
    if (url) {
      return `<div class="photo-slot filled" onclick="openLightbox('${url}','${f.lbl}')" title="${f.lbl} — büyütmek için tıklayın">
        <img src="${url}" alt="${f.lbl}">
        <button class="photo-del" onclick="deleteFoto(event,${o.id},'${f.key}')">✕</button>
      </div>`;
    } else {
      return `<div class="photo-slot" onclick="uploadFoto(${o.id}, '${f.key}')" title="${f.lbl} — fotoğraf ekle">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
        <div class="photo-slot-lbl">${f.lbl}</div>
      </div>`;
    }
  }).join('');
}

function openLightbox(url, lbl) {
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out;padding:20px';
  lb.innerHTML = `
    <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
      <a href="${url}" download target="_blank" onclick="event.stopPropagation()" style="background:rgba(255,255,255,0.15);color:white;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:500;cursor:pointer;text-decoration:none">⬇ İndir</a>
      <button onclick="closeLightbox()" style="background:rgba(255,255,255,0.15);color:white;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:500;cursor:pointer">✕ Kapat</button>
    </div>
    <img src="${url}" alt="${lbl}" style="max-width:95%;max-height:85vh;object-fit:contain;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
    <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:12px;font-weight:500">${lbl}</div>`;
  lb.addEventListener('click', e => { if(e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLightbox(); }, {once:true});
  document.body.appendChild(lb);
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.remove(); document.body.style.overflow = ''; }
}

function renderEditPanel(o) {
  const si = (id, opts, val) => `<select id="e_${id}">${opts.map(v => `<option value="${v}" ${v===val?'selected':''}>${v}</option>`).join('')}</select>`;
  const siK = (id, opts, val) => `<select id="e_${id}">${opts.map(([v,l]) => `<option value="${v}" ${v===val?'selected':''}>${l}</option>`).join('')}</select>`;
  const fotoG1HTML = renderFotoView(o, FOTO_G1, 'photo-grid-5');
  const fotoG2HTML = renderFotoView(o, FOTO_G2, 'photo-grid-2');

  return `<div class="card detail-card">
    <div class="edit-bar">
      <div class="edit-bar-text">✏ Düzenleme modu</div>
      <div style="display:flex;gap:6px">
        <button class="btn-outline btn-sm" onclick="showDetail(${o.id}, false)">İptal</button>
        <button class="btn-success btn-sm" onclick="saveEdit(${o.id})">Kaydet</button>
      </div>
    </div>

    <div class="section-hdr">Kurum Bilgileri</div>
    ${editRow('İlçe', si('ilce', ILCELER, o.ilce))}
    ${editRow('Kurum Adı', `<input id="e_okul_adi" value="${o.okul_adi || ''}">`)}
    ${editRow('Kurum Kodu', `<input id="e_kurum_kodu" value="${o.kurum_kodu || ''}">`)}
    ${editRow('Kurum Türü', si('kurum_turu', TIPLER, o.kurum_turu))}
    ${editRow('Bağlı Genel Müdürlük', si('genel_mudurluk', GMS, o.genel_mudurluk))}
    ${editRow('Okul Müdürü', `<input id="e_mudur_adi" value="${o.mudur_adi || ''}">`)}
    ${editRow('Müdür Telefonu', `<input id="e_mudur_tel" value="${o.mudur_tel || ''}">`)}

    <div class="section-hdr">Altyapı Bilgileri</div>
    ${editRow('Bina Durumu', siK('bina_durumu', [['var','Var'],['yok','Yok']], o.bina_durumu))}
    ${editRow('Etkileşimli Tahta', siK('tahta_durumu', [['var','Var'],['yok','Yok']], o.tahta_durumu))}
    ${editRow('Bilişim Sınıfı', siK('bilisim_sinifi', [['var','Var'],['yok','Yok']], o.bilisim_sinifi))}
    ${editRow('Yenilikçi Sınıf', siK('yenilikci_sinif', [['var','Var'],['yok','Yok']], o.yenilikci_sinif))}

    <div class="section-hdr">Faz Detayları</div>
    <div style="padding:8px 0">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px">
        ${[1,2,3,4].map(n => `<div class="f"><div class="lbl">Faz ${n}</div><input id="e_faz${n}" type="number" min="0" value="${o['faz'+n]||0}" oninput="calcEditTotal()"></div>`).join('')}
      </div>
      <div class="toplam-box">
        <div class="toplam-box-lbl">Toplam ET Sayısı</div>
        <div class="toplam-box-val" id="editToplamVal">${totalTahta(o)}</div>
      </div>
    </div>

    ${editRow('Ağ Altyapısı', siK('ag_altyapisi', AGLAR, o.ag_altyapisi))}
    ${editRow('İnternet Türü', siK('internet_turu', INETLER, o.internet_turu))}

    <div class="section-hdr">Fotoğraflar</div>
    <div class="photo-section">
      <div class="photo-section-lbl">Genel</div>
      <div class="photo-grid-5">${fotoG1HTML}</div>
    </div>
    <div class="photo-section">
      <div class="photo-section-lbl">Sınıflar</div>
      <div class="photo-grid-2">${fotoG2HTML}</div>
    </div>
    <div class="photo-hint" style="margin-bottom:14px">Fotoğraf eklemek için kutucuğa tıklayın</div>

    <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:12px;border-top:1px solid var(--border)">
      <button class="btn-outline btn-sm" onclick="showDetail(${o.id}, false)">İptal</button>
      <button class="btn-success btn-sm" onclick="saveEdit(${o.id})">Kaydet</button>
    </div>
  </div>`;
}

function calcEditTotal() {
  const total = [1,2,3,4].reduce((a,n) => a + (parseInt(document.getElementById('e_faz'+n)?.value)||0), 0);
  const el = document.getElementById('editToplamVal');
  if (el) el.textContent = total;
}

function calcAddTotal() {
  const total = [1,2,3,4].reduce((a,n) => a + (parseInt(document.getElementById('a_faz'+n)?.value)||0), 0);
  const el = document.getElementById('addToplamVal');
  if (el) el.textContent = total;
}

async function saveEdit(id) {
  const gv = k => document.getElementById('e_' + k)?.value || '';
  const gn = k => parseInt(document.getElementById('e_' + k)?.value) || 0;

  if (!gv('okul_adi')) { showToast('Okul adı boş bırakılamaz'); return; }
  if (!gv('kurum_kodu')) { showToast('Kurum kodu boş bırakılamaz'); return; }

  const btn = document.querySelector('.btn-success');
  if (btn) { btn.innerHTML = '<span class="loading-spin"></span>Kaydediliyor...'; btn.disabled = true; }

  const payload = {
    ilce: gv('ilce'), okul_adi: gv('okul_adi'), kurum_kodu: gv('kurum_kodu'),
    kurum_turu: gv('kurum_turu'), genel_mudurluk: gv('genel_mudurluk'),
    mudur_adi: gv('mudur_adi'), mudur_tel: gv('mudur_tel'),
    bina_durumu: gv('bina_durumu'), tahta_durumu: gv('tahta_durumu'),
    bilisim_sinifi: gv('bilisim_sinifi'), yenilikci_sinif: gv('yenilikci_sinif'),
    ag_altyapisi: gv('ag_altyapisi'), internet_turu: gv('internet_turu'),
    faz1: gn('faz1'), faz2: gn('faz2'), faz3: gn('faz3'), faz4: gn('faz4')
  };

  const { error } = await db.from('okullar').update(payload).eq('id', id);
  if (error) { showToast('Hata: ' + error.message); return; }

  showToast('✓ Kaydedildi');
  await loadAllStats();
  await listele();
  await showDetail(id, false);
}

// ─── FOTO UPLOAD ───────────────────────────────────────────────────────────
async function uploadFoto(id, fieldKey) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    showToast('Fotoğraf yükleniyor...');
    const ext = file.name.split('.').pop();
    const path = `${id}/${fieldKey}_${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage.from('okul_foto').upload(path, file, { upsert: true });
    if (upErr) { showToast('Yükleme hatası: ' + upErr.message); return; }
    const { data: urlData } = db.storage.from('okul_foto').getPublicUrl(path);
    const { error: dbErr } = await db.from('okullar').update({ [fieldKey]: urlData.publicUrl }).eq('id', id);
    if (dbErr) { showToast('Kayıt hatası: ' + dbErr.message); return; }
    showToast('✓ Fotoğraf yüklendi');
    await showDetail(id, editMode);
  };
  inp.click();
}

async function deleteFoto(e, id, fieldKey) {
  e.stopPropagation();
  if (!confirm('Fotoğrafı sil?')) return;
  await db.from('okullar').update({ [fieldKey]: null }).eq('id', id);
  showToast('Fotoğraf silindi');
  await showDetail(id, editMode);
}

// ─── ADD MODAL ─────────────────────────────────────────────────────────────
function openAddModal() {
  addFotoTemp = {};
  document.getElementById('modalTitle').textContent = 'Yeni Okul Ekle';
  document.getElementById('modalBody').innerHTML = addFormHTML();
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target.id === 'modalOverlay') closeModal();
}

function addFormHTML() {
  const si = (id, opts) => `<select id="a_${id}">${opts.map(v => `<option value="${v}">${v}</option>`).join('')}</select>`;
  const siK = (id, opts) => `<select id="a_${id}">${opts.map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}</select>`;
  return `
  <div class="form-grid2">
    <div class="f"><div class="lbl">İlçe</div>${si('ilce', ILCELER)}</div>
    <div class="f"><div class="lbl">Kurum Adı</div><input id="a_okul_adi" placeholder="Okul adını girin"></div>
  </div>
  <div class="form-grid2">
    <div class="f"><div class="lbl">Kurum Kodu</div><input id="a_kurum_kodu" placeholder="706XXX"></div>
    <div class="f"><div class="lbl">Kurum Türü</div>${si('kurum_turu', TIPLER)}</div>
  </div>
  <div class="f"><div class="lbl">Bağlı Genel Müdürlük</div>${si('genel_mudurluk', GMS)}</div>
  <div class="form-grid2">
    <div class="f"><div class="lbl">Okul Müdürü Adı Soyadı</div><input id="a_mudur_adi" placeholder="Ad Soyad"></div>
    <div class="f"><div class="lbl">Müdür Telefonu</div><input id="a_mudur_tel" placeholder="0344 XXX XXXX"></div>
  </div>
  <div class="form-grid3">
    <div class="f"><div class="lbl">Bina Durumu</div>${siK('bina_durumu', [['var','Var'],['yok','Yok']])}</div>
    <div class="f"><div class="lbl">Bilişim Sınıfı</div>${siK('bilisim_sinifi', [['var','Var'],['yok','Yok']])}</div>
    <div class="f"><div class="lbl">Yenilikçi Sınıf</div>${siK('yenilikci_sinif', [['var','Var'],['yok','Yok']])}</div>
  </div>
  <div class="form-grid2">
    <div class="f"><div class="lbl">Etkileşimli Tahta</div>${siK('tahta_durumu', [['var','Var'],['yok','Yok']])}</div>
    <div class="f"><div class="lbl">Ağ Altyapısı</div>${siK('ag_altyapisi', AGLAR)}</div>
  </div>
  <div class="f"><div class="lbl">İnternet Türü</div>${siK('internet_turu', INETLER)}</div>

  <div class="faz-section">
    <div class="lbl" style="margin-bottom:8px">Faz Detayları (adet)</div>
    <div class="form-grid4">
      ${[1,2,3,4].map(n => `<div class="f"><div class="lbl">Faz ${n}</div><input id="a_faz${n}" type="number" min="0" value="0" oninput="calcAddTotal()"></div>`).join('')}
    </div>
    <div class="toplam-box">
      <div class="toplam-box-lbl">Toplam ET Sayısı</div>
      <div class="toplam-box-val" id="addToplamVal">0</div>
    </div>
  </div>

  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text2);margin-bottom:8px">Fotoğraflar</div>
  <div class="photo-section">
    <div class="photo-section-lbl">Genel</div>
    <div class="photo-grid-5">
      ${FOTO_G1.map(f => `<div class="photo-slot" id="addslot_${f.key}" onclick="addUploadFoto('${f.key}')" title="${f.lbl}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
        <div class="photo-slot-lbl">${f.lbl}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="photo-section">
    <div class="photo-section-lbl">Sınıflar</div>
    <div class="photo-grid-2">
      ${FOTO_G2.map(f => `<div class="photo-slot" id="addslot_${f.key}" onclick="addUploadFoto('${f.key}')" title="${f.lbl}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
        <div class="photo-slot-lbl">${f.lbl}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="photo-hint" style="margin-bottom:14px">Fotoğraf eklemek için kutucuğa tıklayın (okul kaydedildikten sonra da eklenebilir)</div>

  <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:12px;border-top:1px solid var(--border)">
    <button class="btn-outline" onclick="closeModal()">İptal</button>
    <button class="btn-primary" onclick="saveAdd()">Kaydet</button>
  </div>`;
}

function addUploadFoto(key) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      addFotoTemp[key] = { file, dataUrl: ev.target.result };
      const slot = document.getElementById('addslot_' + key);
      if (slot) {
        slot.classList.add('filled');
        slot.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover">`;
      }
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

async function saveAdd() {
  const gv = k => document.getElementById('a_' + k)?.value || '';
  const gn = k => parseInt(document.getElementById('a_' + k)?.value) || 0;

  if (!gv('okul_adi')) { showToast('Okul adı zorunludur'); return; }
  if (!gv('kurum_kodu')) { showToast('Kurum kodu zorunludur'); return; }

  const btn = document.querySelector('#modal .btn-primary');
  if (btn) { btn.innerHTML = '<span class="loading-spin"></span>Kaydediliyor...'; btn.disabled = true; }

  const payload = {
    ilce: gv('ilce'), okul_adi: gv('okul_adi'), kurum_kodu: gv('kurum_kodu'),
    kurum_turu: gv('kurum_turu'), genel_mudurluk: gv('genel_mudurluk'),
    mudur_adi: gv('mudur_adi'), mudur_tel: gv('mudur_tel'),
    bina_durumu: gv('bina_durumu'), tahta_durumu: gv('tahta_durumu'),
    bilisim_sinifi: gv('bilisim_sinifi'), yenilikci_sinif: gv('yenilikci_sinif'),
    ag_altyapisi: gv('ag_altyapisi'), internet_turu: gv('internet_turu'),
    faz1: gn('faz1'), faz2: gn('faz2'), faz3: gn('faz3'), faz4: gn('faz4')
  };

  const { data, error } = await db.from('okullar').insert(payload).select().single();
  if (error) { showToast('Hata: ' + error.message); if(btn){btn.innerHTML='Kaydet';btn.disabled=false;} return; }

  // upload photos
  for (const [key, val] of Object.entries(addFotoTemp)) {
    if (!val) continue;
    const ext = val.file.name.split('.').pop();
    const path = `${data.id}/${key}_${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage.from('okul_foto').upload(path, val.file);
    if (!upErr) {
      const { data: urlData } = db.storage.from('okul_foto').getPublicUrl(path);
      await db.from('okullar').update({ [key]: urlData.publicUrl }).eq('id', data.id);
    }
  }

  showToast('✓ Okul eklendi');
  closeModal();
  await loadAllStats();
  document.getElementById('selIlce').value = payload.ilce;
  await listele();
  setTimeout(() => showDetail(data.id, false), 300);
}

// ─── İSTATİSTİK ────────────────────────────────────────────────────────────
async function renderIstatistik() {
  chartInstances.forEach(c => { try { c.destroy(); } catch(e) {} });
  chartInstances = [];
  const content = document.getElementById('istatContent');
  content.innerHTML = `<div class="loading-overlay"><div class="spinner"></div>İstatistikler yükleniyor...</div>`;

  const { data, error } = await db.from('okullar').select('*');
  if (error) { content.innerHTML = '<div class="empty-state">Veri yüklenemedi.</div>'; return; }

  const all = data || [];
  const totalET = all.reduce((a,o) => a+totalTahta(o), 0);
  const inetOkul = all.filter(o => o.internet_turu && o.internet_turu !== '').length;
  const tahtalı = all.filter(o => o.tahta_durumu === 'var').length;
  const f1t = all.reduce((a,o) => a+(o.faz1||0), 0);
  const f2t = all.reduce((a,o) => a+(o.faz2||0), 0);
  const f3t = all.reduce((a,o) => a+(o.faz3||0), 0);
  const f4t = all.reduce((a,o) => a+(o.faz4||0), 0);

  const inetSay = {adsl:0, fatih_vpn:0, gsm:0};
  all.forEach(o => { if (o.internet_turu && inetSay[o.internet_turu] !== undefined) inetSay[o.internet_turu]++; });
  const bilisimVar = all.filter(o => o.bilisim_sinifi === 'var').length;
  const yenilikciVar = all.filter(o => o.yenilikci_sinif === 'var').length;

  const ilceler = [...new Set(all.map(o => o.ilce))].sort();
  const ilceET = ilceler.map(i => all.filter(o => o.ilce===i).reduce((a,o) => a+totalTahta(o), 0));
  const ilceOkul = ilceler.map(i => all.filter(o => o.ilce===i).length);
  const maxOkul = Math.max(...ilceOkul, 1);

  content.innerHTML = `
  <div class="card" style="padding:14px;margin-bottom:12px">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:12px">İl Geneli Özet</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px">
      <div class="istat-s-card"><div class="istat-s-val" style="color:#1a56db">${all.length}</div><div class="istat-s-lbl">Toplam Okul</div></div>
      <div class="istat-s-card"><div class="istat-s-val" style="color:#7c3aed">${totalET}</div><div class="istat-s-lbl">Toplam ET</div></div>
      <div class="istat-s-card"><div class="istat-s-val" style="color:#16a34a">${inetOkul}</div><div class="istat-s-lbl">İnternet Olan</div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      <div class="istat-s-card"><div class="istat-s-val" style="color:#ea580c">${tahtalı}</div><div class="istat-s-lbl">ET'li Okul</div></div>
      <div class="istat-s-card"><div class="istat-s-val" style="color:#0d9488">${bilisimVar}</div><div class="istat-s-lbl">Bilişim Sınıfı</div></div>
      <div class="istat-s-card"><div class="istat-s-val" style="color:#d97706">${yenilikciVar}</div><div class="istat-s-lbl">Yenilikçi Sınıf</div></div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <div class="card chart-card">
      <div class="chart-title">Faz Dağılımı</div>
      <div style="position:relative;height:170px"><canvas id="chartFaz"></canvas></div>
      <div class="legend-row">
        ${['Faz 1','Faz 2','Faz 3','Faz 4'].map((l,i) => `<div class="legend-item"><div class="legend-dot" style="background:${FAZ_COLORS[i]}"></div>${l}: <strong>${[f1t,f2t,f3t,f4t][i]}</strong></div>`).join('')}
      </div>
    </div>
    <div class="card chart-card">
      <div class="chart-title">İnternet Türü</div>
      <div style="position:relative;height:170px"><canvas id="chartInet"></canvas></div>
      <div class="legend-row">
        ${Object.entries(inetSay).filter(([,v])=>v>0).map(([k,v]) => `<div class="legend-item"><div class="legend-dot" style="background:${INET_COLORS[k]}"></div>${INET_MAP[k]}: <strong>${v}</strong></div>`).join('')}
      </div>
    </div>
  </div>

  <div class="card chart-card" style="margin-bottom:12px">
    <div class="chart-title">İlçe Bazında ET Sayısı</div>
    <div style="position:relative;height:200px"><canvas id="chartIlceET"></canvas></div>
  </div>

  <div class="card chart-card" style="margin-bottom:12px">
    <div class="chart-title">İlçe Bazında Okul Sayısı</div>
    <div class="bar-list">
      ${ilceler.map((ilce,i) => `<div class="bar-row">
        <div class="bar-lbl">${ilce}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.round(ilceOkul[i]/maxOkul*100)}%;background:#1a56db"></div></div>
        <div class="bar-num">${ilceOkul[i]}</div>
      </div>`).join('')}
    </div>
  </div>

  <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:10px">İlçe Detay Kartları</div>
  <div class="ilce-grid">
    ${ilceler.map(ilce => {
      const okullar = all.filter(o => o.ilce===ilce);
      const etT = okullar.reduce((a,o) => a+totalTahta(o), 0);
      const inetT = okullar.filter(o => o.internet_turu && o.internet_turu !== '').length;
      const bilisimT = okullar.filter(o => o.bilisim_sinifi === 'var').length;
      const yenilikciT = okullar.filter(o => o.yenilikci_sinif === 'var').length;
      return `<div class="ilce-card">
        <div class="ilce-card-title">${ilce}</div>
        <div class="ilce-mini-row"><div class="ilce-mini-k">Okul</div><div class="ilce-mini-v">${okullar.length}</div></div>
        <div class="ilce-mini-row"><div class="ilce-mini-k">Toplam ET</div><div class="ilce-mini-v" style="color:#7c3aed">${etT}</div></div>
        <div class="ilce-mini-row"><div class="ilce-mini-k">İnternet</div><div class="ilce-mini-v" style="color:#16a34a">${inetT} okul</div></div>
        <div class="ilce-mini-row"><div class="ilce-mini-k">Bilişim Sınıfı</div><div class="ilce-mini-v" style="color:#0d9488">${bilisimT}</div></div>
        <div class="ilce-mini-row"><div class="ilce-mini-k">Yenilikçi Sınıf</div><div class="ilce-mini-v" style="color:#d97706">${yenilikciT}</div></div>
      </div>`;
    }).join('')}
  </div>`;

  setTimeout(() => {
    const c1 = new Chart(document.getElementById('chartFaz'), { type:'doughnut', data:{labels:['Faz 1','Faz 2','Faz 3','Faz 4'], datasets:[{data:[f1t,f2t,f3t,f4t], backgroundColor:FAZ_COLORS, borderWidth:0}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'65%'} });
    chartInstances.push(c1);
    const ie = Object.entries(inetSay).filter(([,v])=>v>0);
    const c2 = new Chart(document.getElementById('chartInet'), { type:'doughnut', data:{labels:ie.map(([k])=>INET_MAP[k]), datasets:[{data:ie.map(([,v])=>v), backgroundColor:ie.map(([k])=>INET_COLORS[k]), borderWidth:0}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'65%'} });
    chartInstances.push(c2);
    const c3 = new Chart(document.getElementById('chartIlceET'), { type:'bar', data:{labels:ilceler, datasets:[{data:ilceET, backgroundColor:'#7c3aed', borderRadius:5, borderSkipped:false}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'rgba(0,0,0,0.05)'},ticks:{font:{size:10},stepSize:1}}}} });
    chartInstances.push(c3);
  }, 100);
}

// ─── PDF ───────────────────────────────────────────────────────────────────
function chartToImg(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return '';
  return canvas.toDataURL('image/png');
}

async function pdfIndir() {
  // Önce istatistik sayfasını render et (grafikler oluşsun)
  if (currentPage !== 'istat') {
    setPage('istat');
    await new Promise(r => setTimeout(r, 1200));
  }

  showToast('PDF hazırlanıyor...');
  await new Promise(r => setTimeout(r, 200));

  // Grafikleri resme çevir
  const imgFaz = chartToImg('chartFaz');
  const imgInet = chartToImg('chartInet');
  const imgIlceET = chartToImg('chartIlceET');

  const { data: all } = await db.from('okullar').select('*');
  if (!all) return;
  const tarih = new Date().toLocaleDateString('tr-TR');
  const totalET = all.reduce((a,o) => a+totalTahta(o), 0);
  const inetOkul = all.filter(o => o.internet_turu && o.internet_turu !== '').length;
  const tahtalı = all.filter(o => o.tahta_durumu === 'var').length;
  const bilisimVar = all.filter(o => o.bilisim_sinifi === 'var').length;
  const yenilikciVar = all.filter(o => o.yenilikci_sinif === 'var').length;
  const f1t=all.reduce((a,o)=>a+(o.faz1||0),0), f2t=all.reduce((a,o)=>a+(o.faz2||0),0);
  const f3t=all.reduce((a,o)=>a+(o.faz3||0),0), f4t=all.reduce((a,o)=>a+(o.faz4||0),0);
  const ilceler = [...new Set(all.map(o => o.ilce))].sort();
  const rows = ilceler.map(ilce => {
    const ol = all.filter(o=>o.ilce===ilce);
    const et=ol.reduce((a,o)=>a+totalTahta(o),0);
    const inet=ol.filter(o=>o.internet_turu&&o.internet_turu!=='').length;
    const bil=ol.filter(o=>o.bilisim_sinifi==='var').length;
    const yen=ol.filter(o=>o.yenilikci_sinif==='var').length;
    const f1=ol.reduce((a,o)=>a+(o.faz1||0),0),f2=ol.reduce((a,o)=>a+(o.faz2||0),0);
    const f3=ol.reduce((a,o)=>a+(o.faz3||0),0),f4=ol.reduce((a,o)=>a+(o.faz4||0),0);
    return `<tr><td>${ilce}</td><td>${ol.length}</td><td><b>${et}</b></td><td>${f1}</td><td>${f2}</td><td>${f3}</td><td>${f4}</td><td>${inet}</td><td>${bil}</td><td>${yen}</td></tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  body{font-family:Arial,sans-serif;margin:30px;font-size:12px;color:#111}
  h1{font-size:20px;color:#1a56db;margin-bottom:3px}.sub{color:#666;font-size:11px}.tarih{color:#888;font-size:10px;margin-bottom:20px}
  .cards{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
  .sc{background:#f1f5f9;border-radius:8px;padding:10px 16px;text-align:center;min-width:90px}
  .sv{font-size:22px;font-weight:700}.sl{font-size:10px;color:#666;margin-top:2px}
  h2{font-size:13px;border-bottom:2px solid #1a56db;padding-bottom:5px;margin:18px 0 10px}
  .charts{display:flex;gap:16px;margin-bottom:20px;align-items:flex-start}
  .chart-box{flex:1;text-align:center}
  .chart-box h3{font-size:11px;color:#666;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
  .chart-box img{width:100%;max-width:280px;height:auto}
  .chart-full{margin-bottom:20px;text-align:center}
  .chart-full h3{font-size:11px;color:#666;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
  .chart-full img{width:100%;max-width:700px;height:auto}
  .fc{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
  .fc div{background:#f1f5f9;border-radius:7px;padding:10px 16px;text-align:center;min-width:80px}
  .fv{font-size:20px;font-weight:700}.fl{font-size:10px;color:#666;margin-top:2px}
  table{width:100%;border-collapse:collapse;font-size:10px}
  th{background:#1a56db;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
  td{padding:5px 8px;border-bottom:1px solid #e5e7eb}
  tr:nth-child(even) td{background:#f8fafc}
  tfoot td{background:#eff6ff;font-weight:700}
  .footer{margin-top:24px;border-top:1px solid #e5e7eb;padding-top:8px;font-size:9px;color:#999;text-align:center}
  @media print{body{margin:15px}}
  </style></head><body>
  <h1>Kahramanmaraş Etkileşimli Tahta Envanter Raporu</h1>
  <div class="sub">YEĞİTEK Teknoloji Altyapı Takip Sistemi</div>
  <div class="tarih">Rapor Tarihi: ${tarih} · Toplam ${all.length} Okul</div>
  <div class="cards">
    <div class="sc"><div class="sv" style="color:#1a56db">${all.length}</div><div class="sl">Toplam Okul</div></div>
    <div class="sc"><div class="sv" style="color:#7c3aed">${totalET}</div><div class="sl">Toplam ET</div></div>
    <div class="sc"><div class="sv" style="color:#16a34a">${inetOkul}</div><div class="sl">İnternet Olan</div></div>
    <div class="sc"><div class="sv" style="color:#ea580c">${tahtalı}</div><div class="sl">ET'li Okul</div></div>
    <div class="sc"><div class="sv" style="color:#0d9488">${bilisimVar}</div><div class="sl">Bilişim Sınıfı</div></div>
    <div class="sc"><div class="sv" style="color:#d97706">${yenilikciVar}</div><div class="sl">Yenilikçi Sınıf</div></div>
  </div>
  ${imgFaz || imgInet ? `
  <h2>Grafikler</h2>
  <div class="charts">
    ${imgFaz ? `<div class="chart-box"><h3>Faz Dağılımı</h3><img src="${imgFaz}"></div>` : ''}
    ${imgInet ? `<div class="chart-box"><h3>İnternet Türü</h3><img src="${imgInet}"></div>` : ''}
  </div>` : ''}
  ${imgIlceET ? `
  <div class="chart-full"><h3>İlçe Bazında ET Sayısı</h3><img src="${imgIlceET}"></div>` : ''}
  <h2>Faz Dağılımı (İl Geneli)</h2>
  <div class="fc">
    <div><div class="fv" style="color:#6366f1">${f1t}</div><div class="fl">Faz 1</div></div>
    <div><div class="fv" style="color:#0d9488">${f2t}</div><div class="fl">Faz 2</div></div>
    <div><div class="fv" style="color:#f59e0b">${f3t}</div><div class="fl">Faz 3</div></div>
    <div><div class="fv" style="color:#ef4444">${f4t}</div><div class="fl">Faz 4</div></div>
    <div><div class="fv" style="color:#1a56db">${totalET}</div><div class="fl">Toplam</div></div>
  </div>
  <h2>İlçe Bazında İstatistikler</h2>
  <table><thead><tr><th>İlçe</th><th>Okul</th><th>Toplam ET</th><th>Faz1</th><th>Faz2</th><th>Faz3</th><th>Faz4</th><th>İnternet</th><th>Bilişim</th><th>Yenilikçi</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td>TOPLAM</td><td>${all.length}</td><td>${totalET}</td><td>${f1t}</td><td>${f2t}</td><td>${f3t}</td><td>${f4t}</td><td>${inetOkul}</td><td>${bilisimVar}</td><td>${yenilikciVar}</td></tr></tfoot>
  </table>
  <div class="footer">Kahramanmaraş Milli Eğitim Müdürlüğü · YEĞİTEK · ${tarih}</div>
  </body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) setTimeout(() => w.print(), 1000);
}

// ─── SİL ───────────────────────────────────────────────────────────────────
async function okulSil(id, ad) {
  const onay = confirm(`"${ad}" okulunu silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`);
  if (!onay) return;

  showToast('Siliniyor...');

  // Önce fotoğrafları storage'dan sil
  const { data: o } = await db.from('okullar').select('*').eq('id', id).single();
  if (o) {
    const fotoKeys = ['foto_dis','foto_koridor','foto_sinif1','foto_sinif2','foto_sistem','foto_bilisim','foto_yenilikci'];
    for (const key of fotoKeys) {
      if (o[key]) {
        const path = o[key].split('/okul_foto/')[1];
        if (path) await db.storage.from('okul_foto').remove([path]);
      }
    }
  }

  // Sonra kaydı sil
  const { error } = await db.from('okullar').delete().eq('id', id);
  if (error) { showToast('Silme hatası: ' + error.message); return; }

  showToast('✓ Okul silindi');
  document.getElementById('detailPanel').style.display = 'none';
  activeId = null;
  await loadAllStats();
  await listele();
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
function infoRow(k, v) { return `<div class="info-row"><div class="info-k">${k}</div><div class="info-v">${v}</div></div>`; }
function editRow(k, input) { return `<div class="edit-row"><div class="edit-k">${k}</div><div class="edit-v">${input}</div></div>`; }
function badge(val) { return val === 'var' ? '<span class="badge badge-var">Var</span>' : '<span class="badge badge-yok">Yok</span>'; }
function fazBadges(o) {
  return `<div class="faz-badges">
    <span class="faz-b" style="background:#ede9fe;color:#4c1d95">Faz1: ${o.faz1||0}</span>
    <span class="faz-b" style="background:#d1fae5;color:#065f46">Faz2: ${o.faz2||0}</span>
    <span class="faz-b" style="background:#fef3c7;color:#78350f">Faz3: ${o.faz3||0}</span>
    <span class="faz-b" style="background:#fee2e2;color:#7f1d1d">Faz4: ${o.faz4||0}</span>
  </div>`;
}
function showToast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}
