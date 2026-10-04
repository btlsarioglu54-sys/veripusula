-- VeriPusula Analitik A.Ş. – Stok veritabanı (SQLite; MySQL/PostgreSQL için notlara bakın)
CREATE TABLE IF NOT EXISTS bilesenler (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,   -- MySQL: INT AUTO_INCREMENT
  kod           TEXT NOT NULL UNIQUE,
  ad            TEXT NOT NULL,
  sirket        TEXT NOT NULL,
  tur           TEXT NOT NULL CHECK (tur IN ('bilesen','mamul')),
  adet          INTEGER NOT NULL DEFAULT 0 CHECK (adet >= 0),
  birim_maliyet REAL NOT NULL DEFAULT 50,
  kritik_seviye INTEGER NOT NULL DEFAULT 50
);
CREATE TABLE IF NOT EXISTS stok_hareketleri (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  bilesen_id  INTEGER NOT NULL REFERENCES bilesenler(id),
  tur         TEXT NOT NULL CHECK (tur IN ('giris','cikis')),
  miktar      INTEGER NOT NULL CHECK (miktar > 0),
  aciklama    TEXT,
  tarih       TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS mesajlar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad TEXT NOT NULL, eposta TEXT NOT NULL, mesaj TEXT NOT NULL,
  tarih TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS siparisler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tur TEXT NOT NULL CHECK (tur IN ('siparis','tedarik')),
  kalem TEXT NOT NULL,
  firma TEXT NOT NULL, yetkili TEXT NOT NULL, eposta TEXT NOT NULL,
  miktar INTEGER NOT NULL CHECK (miktar > 0),
  odeme TEXT NOT NULL CHECK (odeme IN ('pesin','vadeli')),
  birim_fiyat REAL NOT NULL, toplam REAL NOT NULL, notu TEXT,
  tarih TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
-- Açılış stokları (Şirket Tanıtım Dosyası): uzmanlık 3.300, diğer yedi bileşen 100'er, mamul 0
INSERT OR IGNORE INTO bilesenler (kod,ad,sirket,tur,adet,birim_maliyet,kritik_seviye) VALUES
 ('G01','Enerji Modülü','EnerjiNova A.Ş.','bilesen',100,50,50),
 ('G02','İşlemci Modülü','MikroCore Teknoloji A.Ş.','bilesen',100,50,50),
 ('G03','Sensör Kiti','SensoTek A.Ş.','bilesen',100,50,50),
 ('G04','Kasa ve Ambalaj','FormAmbalaj A.Ş.','bilesen',100,50,50),
 ('G05','Yazılım Lisansı','BulutOS Yazılım A.Ş.','bilesen',100,50,50),
 ('G06','Lojistik Tokenı','HızlıRota Lojistik A.Ş.','bilesen',100,50,50),
 ('G07','Müşteri Analitiği Lisansı','VeriPusula Analitik A.Ş.','bilesen',3300,50,300),
 ('G08','Garanti Hizmet Paketi','GüvencePlus Hizmetleri A.Ş.','bilesen',100,50,50),
 ('SBX','SmartBox (mamul)','VeriPusula Analitik A.Ş.','mamul',0,500,0);
