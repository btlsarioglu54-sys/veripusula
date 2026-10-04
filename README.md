# VeriPusula Analitik A.Ş. – Web Sitesi (G07)

## Çalıştırma (bilgisayarınızda)
1. Node.js 18+ kurun.
2. Klasörde: `npm install` sonra `npm start`
3. Tarayıcıda http://localhost:3000 açın. Veritabanı (`database/veripusula.db`) ilk çalıştırmada otomatik oluşur.

## Sadece statik gösterim
`public/` klasörünü GitHub Pages / Netlify'a yükleyebilirsiniz; bu durumda stok tablosu "demo modu"nda örnek verileri gösterir,
canlı SQL için `server.js` bir sunucuda (Render, Railway, Fly.io vb. – HTTPS verir) çalışmalıdır.

## Fotoğraf değiştirme
`public/images/` içine aşağıdaki adlarla dosya koyun; kodu değiştirmenize gerek yok:
hero.jpg, kart1.jpg, kart2.jpg, kart3.jpg, hakkimizda.jpg, is-modeli.jpg, urun-lisans.jpg, urun-smartbox.jpg, ekip.jpg, iletisim.jpg
(Dosya yoksa gri "📷 fotoğraf yeri" kutusu görünür.)

## Düzenlenecek yerler
- Departman kartlarındaki "Ad Soyad" → departmanlar.html
- E-posta/telefon/adres → iletisim.html ve js/main.js (footer)
