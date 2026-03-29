// Osmanlı Bot - Veritabanı Yöneticisi (Node.js built-in SQLite)
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

// Veritabanı klasörünü oluştur
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dbDir, "osmanli.db"));

// WAL modu - daha iyi performans
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Tüm tabloları başlat
function initDatabase() {
  // Ekonomi tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS ekonomi (
      user_id TEXT PRIMARY KEY,
      cuzdan INTEGER DEFAULT 500,
      banka INTEGER DEFAULT 0,
      kredi INTEGER DEFAULT 0,
      gunluk_son INTEGER DEFAULT 0,
      haftalik_son INTEGER DEFAULT 0,
      calis_son INTEGER DEFAULT 0,
      faiz_son INTEGER DEFAULT 0,
      soygun_son INTEGER DEFAULT 0,
      toplam_kazanilan INTEGER DEFAULT 0,
      olusturma_tarihi INTEGER DEFAULT (unixepoch())
    )
  `);

  // Uyarılar tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS uyarilar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      sebep TEXT NOT NULL,
      tarih INTEGER DEFAULT (unixepoch())
    )
  `);

  // Moderasyon geçmişi tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS moderasyon_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      islem TEXT NOT NULL,
      sebep TEXT,
      sure INTEGER,
      tarih INTEGER DEFAULT (unixepoch())
    )
  `);

  // Vergi tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS vergi (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      borclu INTEGER DEFAULT 0,
      son_odeme INTEGER DEFAULT 0,
      odenmemis_hafta INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, guild_id)
    )
  `);

  // Vergi geçmişi
  db.exec(`
    CREATE TABLE IF NOT EXISTS vergi_gecmis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      miktar INTEGER NOT NULL,
      tarih INTEGER DEFAULT (unixepoch())
    )
  `);

  // Log kanalları ayarları
  db.exec(`
    CREATE TABLE IF NOT EXISTS log_ayarlari (
      guild_id TEXT NOT NULL,
      kanal_tur TEXT NOT NULL,
      kanal_id TEXT NOT NULL,
      PRIMARY KEY (guild_id, kanal_tur)
    )
  `);

  // Sunucu ayarları
  db.exec(`
    CREATE TABLE IF NOT EXISTS sunucu_ayarlari (
      guild_id TEXT PRIMARY KEY,
      vergi_orani REAL DEFAULT 0.05,
      hazine_kanal TEXT,
      log_kategori TEXT
    )
  `);

  console.log("[VERİTABANI] Tüm tablolar başarıyla oluşturuldu.");
}

// --- EKONOMİ FONKSİYONLARI ---

function kullaniciyiGetir(userId) {
  let kullanici = db.prepare("SELECT * FROM ekonomi WHERE user_id = ?").get(userId);
  if (!kullanici) {
    db.prepare("INSERT OR IGNORE INTO ekonomi (user_id) VALUES (?)").run(userId);
    kullanici = db.prepare("SELECT * FROM ekonomi WHERE user_id = ?").get(userId);
  }
  return kullanici;
}

function cuzdanGuncelle(userId, miktar) {
  kullaniciyiGetir(userId);
  return db.prepare("UPDATE ekonomi SET cuzdan = cuzdan + ? WHERE user_id = ?").run(miktar, userId);
}

function bankaGuncelle(userId, miktar) {
  kullaniciyiGetir(userId);
  return db.prepare("UPDATE ekonomi SET banka = banka + ? WHERE user_id = ?").run(miktar, userId);
}

function gunlukGuncelle(userId) {
  return db.prepare("UPDATE ekonomi SET gunluk_son = ? WHERE user_id = ?").run(Date.now(), userId);
}

function haftalikGuncelle(userId) {
  return db.prepare("UPDATE ekonomi SET haftalik_son = ? WHERE user_id = ?").run(Date.now(), userId);
}

function calisSonGuncelle(userId) {
  return db.prepare("UPDATE ekonomi SET calis_son = ? WHERE user_id = ?").run(Date.now(), userId);
}

function faizSonGuncelle(userId) {
  return db.prepare("UPDATE ekonomi SET faiz_son = ? WHERE user_id = ?").run(Date.now(), userId);
}

function soygonSonGuncelle(userId) {
  return db.prepare("UPDATE ekonomi SET soygun_son = ? WHERE user_id = ?").run(Date.now(), userId);
}

function topSiralamasi(limit = 10) {
  return db
    .prepare("SELECT user_id, cuzdan, banka, (cuzdan + banka) as toplam FROM ekonomi ORDER BY toplam DESC LIMIT ?")
    .all(limit);
}

function ekonomiSifirla(userId) {
  return db.prepare("UPDATE ekonomi SET cuzdan = 0, banka = 0, kredi = 0 WHERE user_id = ?").run(userId);
}

// --- UYARI FONKSİYONLARI ---

function uyariEkle(userId, guildId, moderatorId, sebep) {
  const stmt = db.prepare(
    "INSERT INTO uyarilar (user_id, guild_id, moderator_id, sebep) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(userId, guildId, moderatorId, sebep);
  return result.lastInsertRowid;
}

function uyarilariGetir(userId, guildId) {
  return db
    .prepare("SELECT * FROM uyarilar WHERE user_id = ? AND guild_id = ? ORDER BY tarih DESC")
    .all(userId, guildId);
}

function uyariSay(userId, guildId) {
  const row = db
    .prepare("SELECT COUNT(*) as sayi FROM uyarilar WHERE user_id = ? AND guild_id = ?")
    .get(userId, guildId);
  return row.sayi;
}

function uyariSil(id, userId, guildId) {
  return db
    .prepare("DELETE FROM uyarilar WHERE id = ? AND user_id = ? AND guild_id = ?")
    .run(id, userId, guildId);
}

// --- MODERASYON LOG FONKSİYONLARI ---

function moderasyonLogEkle(userId, guildId, moderatorId, islem, sebep, sure = null) {
  return db
    .prepare(
      "INSERT INTO moderasyon_log (user_id, guild_id, moderator_id, islem, sebep, sure) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(userId, guildId, moderatorId, islem, sebep, sure);
}

// --- VERGİ FONKSİYONLARI ---

function vergiyiGetir(userId, guildId) {
  let vergi = db.prepare("SELECT * FROM vergi WHERE user_id = ? AND guild_id = ?").get(userId, guildId);
  if (!vergi) {
    db.prepare("INSERT OR IGNORE INTO vergi (user_id, guild_id) VALUES (?, ?)").run(userId, guildId);
    vergi = db.prepare("SELECT * FROM vergi WHERE user_id = ? AND guild_id = ?").get(userId, guildId);
  }
  return vergi;
}

function vergiBorcunuGuncelle(userId, guildId, miktar) {
  vergiyiGetir(userId, guildId);
  return db.prepare("UPDATE vergi SET borclu = borclu + ? WHERE user_id = ? AND guild_id = ?").run(miktar, userId, guildId);
}

function vergiOde(userId, guildId, miktar) {
  db.prepare(
    "UPDATE vergi SET borclu = MAX(0, borclu - ?), son_odeme = ?, odenmemis_hafta = 0 WHERE user_id = ? AND guild_id = ?"
  ).run(miktar, Date.now(), userId, guildId);
  db.prepare("INSERT INTO vergi_gecmis (user_id, guild_id, miktar) VALUES (?, ?, ?)").run(userId, guildId, miktar);
}

function vergiGecmisi(userId, guildId) {
  return db
    .prepare("SELECT * FROM vergi_gecmis WHERE user_id = ? AND guild_id = ? ORDER BY tarih DESC LIMIT 10")
    .all(userId, guildId);
}

function vergiBorclulari(guildId) {
  return db
    .prepare("SELECT * FROM vergi WHERE guild_id = ? AND borclu > 0 ORDER BY borclu DESC LIMIT 20")
    .all(guildId);
}

// --- LOG AYARLARI FONKSİYONLARI ---

function logAyariniKaydet(guildId, kanalTur, kanalId) {
  return db
    .prepare("INSERT OR REPLACE INTO log_ayarlari (guild_id, kanal_tur, kanal_id) VALUES (?, ?, ?)")
    .run(guildId, kanalTur, kanalId);
}

function logKanaliniGetir(guildId, kanalTur) {
  const row = db
    .prepare("SELECT kanal_id FROM log_ayarlari WHERE guild_id = ? AND kanal_tur = ?")
    .get(guildId, kanalTur);
  return row ? row.kanal_id : null;
}

// --- SUNUCU AYARLARI ---

function sunucuAyariniGetir(guildId) {
  let ayar = db.prepare("SELECT * FROM sunucu_ayarlari WHERE guild_id = ?").get(guildId);
  if (!ayar) {
    db.prepare("INSERT OR IGNORE INTO sunucu_ayarlari (guild_id) VALUES (?)").run(guildId);
    ayar = db.prepare("SELECT * FROM sunucu_ayarlari WHERE guild_id = ?").get(guildId);
  }
  return ayar;
}

function vergiOraniGuncelle(guildId, oran) {
  sunucuAyariniGetir(guildId);
  return db.prepare("UPDATE sunucu_ayarlari SET vergi_orani = ? WHERE guild_id = ?").run(oran, guildId);
}

function logKategoriKaydet(guildId, kategoriId) {
  sunucuAyariniGetir(guildId);
  return db.prepare("UPDATE sunucu_ayarlari SET log_kategori = ? WHERE guild_id = ?").run(kategoriId, guildId);
}

// --- YARDIMCI FONKSİYONLAR ---

function sayiFormatla(sayi) {
  return Number(sayi).toLocaleString("tr-TR");
}

module.exports = {
  db,
  initDatabase,
  // Ekonomi
  kullaniciyiGetir,
  cuzdanGuncelle,
  bankaGuncelle,
  gunlukGuncelle,
  haftalikGuncelle,
  calisSonGuncelle,
  faizSonGuncelle,
  soygonSonGuncelle,
  topSiralamasi,
  ekonomiSifirla,
  // Uyarılar
  uyariEkle,
  uyarilariGetir,
  uyariSay,
  uyariSil,
  // Moderasyon Log
  moderasyonLogEkle,
  // Vergi
  vergiyiGetir,
  vergiBorcunuGuncelle,
  vergiOde,
  vergiGecmisi,
  vergiBorclulari,
  // Log Ayarları
  logAyariniKaydet,
  logKanaliniGetir,
  // Sunucu Ayarları
  sunucuAyariniGetir,
  vergiOraniGuncelle,
  logKategoriKaydet,
  // Yardımcı
  sayiFormatla,
};
