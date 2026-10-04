// VeriPusula – Express + SQLite sunucusu. Çalıştır: npm install && npm start
const express = require('express');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'database', 'veripusula.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8'));

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));   // yalnızca public/ yayınlanır

app.get('/api/stok', (req, res) => {
  res.json(db.prepare('SELECT * FROM bilesenler ORDER BY id').all());
});

app.get('/api/hareketler', (req, res) => {
  res.json(db.prepare(`SELECT h.tarih, b.ad, h.tur, h.miktar, h.aciklama
    FROM stok_hareketleri h JOIN bilesenler b ON b.id = h.bilesen_id ORDER BY h.id DESC LIMIT 20`).all());
});

const hareketUygula = db.transaction((id, tur, miktar, aciklama) => {
  const satir = db.prepare('SELECT adet FROM bilesenler WHERE id = ?').get(id);
  if (!satir) throw Object.assign(new Error('Kalem bulunamadı'), { kod: 404 });
  const yeni = satir.adet + (tur === 'giris' ? miktar : -miktar);
  if (yeni < 0) throw Object.assign(new Error('Yetersiz stok: stok sıfırın altına düşemez'), { kod: 400 });
  db.prepare('UPDATE bilesenler SET adet = ? WHERE id = ?').run(yeni, id);
  db.prepare('INSERT INTO stok_hareketleri (bilesen_id, tur, miktar, aciklama) VALUES (?,?,?,?)').run(id, tur, miktar, aciklama);
  return yeni;
});

app.post('/api/stok/:id/hareket', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { tur, aciklama } = req.body || {};
  const miktar = parseInt(req.body && req.body.miktar, 10);
  if (!['giris', 'cikis'].includes(tur) || !(miktar > 0 && miktar <= 100000))
    return res.status(400).json({ hata: 'Geçersiz işlem veya miktar' });
  try {
    res.json({ adet: hareketUygula(id, tur, miktar, String(aciklama || '').slice(0, 120)) });
  } catch (e) { res.status(e.kod || 500).json({ hata: e.message }); }
});

app.post('/api/iletisim', (req, res) => {
  const { ad, eposta, mesaj } = req.body || {};
  if (!ad || !/^\S+@\S+\.\S+$/.test(eposta || '') || !mesaj || mesaj.length < 5)
    return res.status(400).json({ hata: 'Eksik veya hatalı alan' });
  db.prepare('INSERT INTO mesajlar (ad, eposta, mesaj) VALUES (?,?,?)')
    .run(String(ad).slice(0, 80), String(eposta).slice(0, 120), String(mesaj).slice(0, 1000));
  res.json({ ok: true });
});

// B2B sipariş / tedarik formu (lisans fiyatı sunucuda yeniden hesaplanır)
const KALEMLER = ['G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08'];
const kademe = (m) => (m >= 1000 ? 55 : m >= 500 ? 62 : m >= 100 ? 68 : 75);
const yuv = (n) => Math.round(n * 100) / 100;
app.post('/api/siparis', (req, res) => {
  const { tur, kalem, firma, yetkili, eposta, odeme, notu } = req.body || {};
  const miktar = parseInt(req.body && req.body.miktar, 10);
  if (!['siparis', 'tedarik'].includes(tur) || !KALEMLER.includes(kalem) || !['pesin', 'vadeli'].includes(odeme)
    || !firma || !yetkili || !/^\S+@\S+\.\S+$/.test(eposta || '') || !(miktar > 0 && miktar <= 100000)
    || (tur === 'siparis') !== (kalem === 'G07'))
    return res.status(400).json({ hata: 'Eksik veya hatalı alan' });
  let birim;
  if (tur === 'siparis') birim = yuv(kademe(miktar) * (odeme === 'vadeli' ? 1.05 : 1));
  else {
    birim = parseFloat(req.body.birim_fiyat);
    if (!(birim > 0 && birim <= 10000)) return res.status(400).json({ hata: 'Geçersiz teklif fiyatı' });
    birim = yuv(birim);
  }
  const toplam = yuv(birim * miktar);
  db.prepare(`INSERT INTO siparisler (tur, kalem, firma, yetkili, eposta, miktar, odeme, birim_fiyat, toplam, notu)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(tur, kalem, String(firma).slice(0, 80), String(yetkili).slice(0, 80),
    String(eposta).slice(0, 120), miktar, odeme, birim, toplam, String(notu || '').slice(0, 300));
  res.json({ ok: true, birim_fiyat: birim, toplam });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VeriPusula sitesi: http://localhost:${PORT}`));
