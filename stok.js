/* VeriPusula – Stok takibi (SQL veritabanına /api üzerinden bağlanır) */
(function () {
  'use strict';
  const API = '/api';
  const DEMO = [
    { id: 1, kod: 'G01', ad: 'Enerji Modülü', sirket: 'EnerjiNova A.Ş.', tur: 'bilesen', adet: 100, birim_maliyet: 50, kritik_seviye: 50 },
    { id: 2, kod: 'G02', ad: 'İşlemci Modülü', sirket: 'MikroCore Teknoloji A.Ş.', tur: 'bilesen', adet: 100, birim_maliyet: 50, kritik_seviye: 50 },
    { id: 3, kod: 'G03', ad: 'Sensör Kiti', sirket: 'SensoTek A.Ş.', tur: 'bilesen', adet: 100, birim_maliyet: 50, kritik_seviye: 50 },
    { id: 4, kod: 'G04', ad: 'Kasa ve Ambalaj', sirket: 'FormAmbalaj A.Ş.', tur: 'bilesen', adet: 100, birim_maliyet: 50, kritik_seviye: 50 },
    { id: 5, kod: 'G05', ad: 'Yazılım Lisansı', sirket: 'BulutOS Yazılım A.Ş.', tur: 'bilesen', adet: 100, birim_maliyet: 50, kritik_seviye: 50 },
    { id: 6, kod: 'G06', ad: 'Lojistik Tokenı', sirket: 'HızlıRota Lojistik A.Ş.', tur: 'bilesen', adet: 100, birim_maliyet: 50, kritik_seviye: 50 },
    { id: 7, kod: 'G07', ad: 'Müşteri Analitiği Lisansı', sirket: 'VeriPusula Analitik A.Ş.', tur: 'bilesen', adet: 3300, birim_maliyet: 50, kritik_seviye: 300 },
    { id: 8, kod: 'G08', ad: 'Garanti Hizmet Paketi', sirket: 'GüvencePlus Hizmetleri A.Ş.', tur: 'bilesen', adet: 100, birim_maliyet: 50, kritik_seviye: 50 },
    { id: 9, kod: 'SBX', ad: 'SmartBox (mamul)', sirket: 'VeriPusula Analitik A.Ş.', tur: 'mamul', adet: 0, birim_maliyet: 500, kritik_seviye: 0 }
  ];
  let veri = [], canli = false;

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tl = (n) => Number(n).toLocaleString('tr-TR') + ' TL';

  async function yukle() {
    try {
      const r = await fetch(API + '/stok', { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      veri = await r.json(); canli = true;
    } catch (e) { veri = JSON.parse(JSON.stringify(DEMO)); canli = false; }
    durum(); ciz();
  }

  function durum() {
    $('stokDurum').textContent = canli
      ? '✅ Veritabanına bağlı – veriler canlı SQL kaydından okunuyor.'
      : 'ℹ️ Demo modu: sunucu/veritabanı bulunamadı, örnek açılış stokları gösteriliyor. server.js çalışınca canlı veriye geçer.';
  }

  function ciz() {
    const en = Math.max(...veri.map(v => v.adet), 1);
    $('stokGovde').innerHTML = veri.map(v => {
      const dusuk = v.tur === 'bilesen' && v.adet <= v.kritik_seviye;
      const rozet = v.adet === 0 ? '<span class="badge b-bad">Yok</span>' : dusuk ? '<span class="badge b-warn">Kritik</span>' : '<span class="badge b-ok">Yeterli</span>';
      return `<tr>
        <td><b>${esc(v.kod)}</b></td><td>${esc(v.ad)}<br><small style="color:var(--muted)">${esc(v.sirket)}</small></td>
        <td>${v.adet.toLocaleString('tr-TR')}</td>
        <td><div class="bar"><i style="width:${Math.round(v.adet / en * 100)}%"></i></div></td>
        <td>${tl(v.adet * v.birim_maliyet)}</td><td>${rozet}</td></tr>`;
    }).join('');
    const bil = veri.filter(v => v.tur === 'bilesen');
    $('ozBilesen').textContent = bil.reduce((t, v) => t + v.adet, 0).toLocaleString('tr-TR');
    $('ozDeger').textContent = tl(veri.reduce((t, v) => t + v.adet * v.birim_maliyet, 0));
    $('ozKritik').textContent = bil.filter(v => v.adet <= v.kritik_seviye).length;
    $('ozMonte').textContent = bil.length ? Math.min(...bil.map(v => v.adet)).toLocaleString('tr-TR') : 0;
    const sel = $('hBilesen');
    if (sel && !sel.options.length) sel.innerHTML = veri.map(v => `<option value="${v.id}">${esc(v.kod)} – ${esc(v.ad)}</option>`).join('');
  }

  async function hareketler() {
    const kutu = $('hareketGovde'); if (!kutu) return;
    if (!canli) { kutu.innerHTML = '<tr><td colspan="5">Hareket kayıtları için sunucuya bağlanın.</td></tr>'; return; }
    try {
      const r = await fetch(API + '/hareketler'); const l = await r.json();
      kutu.innerHTML = l.length ? l.map(h => `<tr><td>${esc(h.tarih)}</td><td>${esc(h.ad)}</td>
        <td>${h.tur === 'giris' ? '➕ Giriş' : '➖ Çıkış'}</td><td>${h.miktar}</td><td>${esc(h.aciklama || '-')}</td></tr>`).join('')
        : '<tr><td colspan="5">Henüz hareket yok.</td></tr>';
    } catch (e) { kutu.innerHTML = '<tr><td colspan="5">Kayıtlar okunamadı.</td></tr>'; }
  }

  function formBagla() {
    const f = $('hareketForm'); if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const m = $('hMsg'); const miktar = parseInt($('hMiktar').value, 10);
      if (!(miktar > 0)) { m.className = 'msg err'; m.textContent = 'Geçerli bir miktar girin.'; return; }
      if (!canli) { m.className = 'msg err'; m.textContent = 'Demo modunda kayıt yapılamaz; sunucuyu çalıştırın.'; return; }
      try {
        const r = await fetch(`${API}/stok/${$('hBilesen').value}/hareket`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tur: $('hTur').value, miktar, aciklama: $('hAciklama').value.trim() })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.hata || 'İşlem başarısız');
        m.className = 'msg ok'; m.textContent = 'Stok hareketi kaydedildi.'; f.reset();
        await yukle(); hareketler();
      } catch (err) { m.className = 'msg err'; m.textContent = err.message; }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (!$('stokGovde')) return;
    formBagla(); await yukle(); hareketler();
  });
})();
