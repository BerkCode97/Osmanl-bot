// Osmanlı İmparatorluğu Discord Botu - Yapılandırma Dosyası

module.exports = {
  // Bot Sahibi ID
  OWNER_ID: "1457036049472557299",

  // Para Birimi
  AKCE_EMOJI: "<:akce:1487929022133436466>",

  // Embed Renkleri
  RENK_ANA: "#8B0000",       // Kırmızı (ana renk)
  RENK_ALTIN: "#FFD700",     // Altın
  RENK_BASARI: "#28a745",    // Başarı (yeşil)
  RENK_HATA: "#dc3545",      // Hata (kırmızı)

  // Footer
  FOOTER: "Devlet-i Aliyye-i Osmaniyye",

  // Ekonomi Ayarları
  EKONOMI: {
    GUNLUK_MIN: 100,
    GUNLUK_MAX: 500,
    HAFTALIK_MIN: 500,
    HAFTALIK_MAX: 2000,
    CALIS_MIN: 100,
    CALIS_MAX: 300,
    CALIS_COOLDOWN: 30 * 60 * 1000,        // 30 dakika (ms)
    GUNLUK_COOLDOWN: 24 * 60 * 60 * 1000,  // 24 saat (ms)
    HAFTALIK_COOLDOWN: 7 * 24 * 60 * 60 * 1000, // 7 gün (ms)
    FAIZ_COOLDOWN: 24 * 60 * 60 * 1000,    // 24 saat (ms)
    FAIZ_ORANI: 0.02,                       // %2 günlük faiz
    KREDI_MAX: 5000,                        // Maks kredi
    KREDI_FAIZ: 0.05,                       // %5 kredi faizi
    SOYGUN_BASARI: 0.40,                    // %40 başarı şansı
    SOYGUN_MIN: 50,                         // Min soygun miktarı
    SOYGUN_CEZA_ORANI: 0.20,               // Başarısız soygunda %20 ceza
    SOYGUN_COOLDOWN: 60 * 60 * 1000,       // 1 saat cooldown
    BASLANGIC_AKCE: 500,                   // Yeni kullanıcı başlangıç akçesi
  },

  // Vergi Ayarları
  VERGI: {
    VARSAYILAN_ORAN: 0.05,                  // %5 varsayılan vergi oranı
    CEZA_HAFTA: 2,                          // 2 hafta ödememe = ceza
    CEZA_MIKTARI: 200,                      // Ceza miktarı akçe
    HATIRLATMA_GUN: 1,                      // Pazartesi = 1 (0=Pazar)
  },

  // Moderasyon Ayarları
  MODERASYON: {
    UYARI_MUTE_ESIK: 3,                     // 3 uyarıda mute
    UYARI_BAN_ESIK: 5,                      // 5 uyarıda ban
    OTOMATIK_MUTE_SURE: 60 * 60 * 1000,    // 1 saat (ms) - otomatik mute süresi
    MAX_TEMIZLE: 100,                       // Maks mesaj silme
  },

  // Çalışma Mesajları (Osmanlı temalı)
  CALIS_MESAJLARI: [
    "Çarşıda tezgah açtınız",
    "Tersanede çalıştınız",
    "Kervansarayda çalıştınız",
    "Bedestende esnaf oldunuz",
    "Kapıkulu olarak hizmet ettiniz",
    "Sarayda aşçı olarak çalıştınız",
    "Sipahi olarak sefere çıktınız",
    "Liman başında hamallik yaptınız",
    "Medresede müderris olarak ders verdiniz",
    "Çarşıda kuyumcu olarak çalıştınız",
  ],

  // Log Kanalları
  LOG_KATEGORISI: "📋 Kayıtlar",
  LOG_KANALLARI: {
    MODERASYON: "⚔️-moderasyon-log",
    EKONOMI: "💰-ekonomi-log",
    UYE: "👥-üye-log",
    MESAJ: "✏️-mesaj-log",
    SUNUCU: "🔧-sunucu-log",
    YONETICI: "👑-yönetici-log",
  },

  // Büyük ekonomi işlemi eşiği (log için)
  EKONOMI_LOG_ESIK: 1000,
};
