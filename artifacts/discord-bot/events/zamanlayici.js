// Osmanlı Bot - Zamanlanmış Görevler
const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { db, vergiBorclulari, vergiBorcunuGuncelle } = require("../database/database");
const { logKanaliniGetir } = require("../database/database");

// Her gün çalışacak görev
function gunlukKontrol(client) {
  const simdi = new Date();

  // Pazartesi kontrolü (vergi hatırlatması)
  if (simdi.getDay() === 1) {
    vergiHatirlatmasiGonder(client);
  }
}

// Vergi hatırlatması gönder
async function vergiHatirlatmasiGonder(client) {
  for (const guild of client.guilds.cache.values()) {
    try {
      const hazineKanalId = logKanaliniGetir(guild.id, "EKONOMI");
      if (!hazineKanalId) continue;

      const kanal = await client.channels.fetch(hazineKanalId).catch(() => null);
      if (!kanal) continue;

      const embed = new EmbedBuilder()
        .setColor(config.RENK_ALTIN)
        .setTitle("👑 Haftalık Vergi Hatırlatması")
        .setDescription(
          "Ey Osmanlı vatandaşları! Bu hafta verginizi ödemeyi unutmayın.\n" +
          "Devlet-i Aliyye'nin bekası için verginizi `/vergi-öde` komutu ile ödeyiniz."
        )
        .setFooter({ text: config.FOOTER })
        .setTimestamp();

      await kanal.send({ embeds: [embed] });

      // 2 haftadır ödemeyen kullanıcılara ceza uygula
      const borclular = vergiBorclulari(guild.id);
      for (const borclu of borclular) {
        if (borclu.odenmemis_hafta >= config.VERGI.CEZA_HAFTA) {
          const cezaMiktari = config.VERGI.CEZA_MIKTARI;
          // Cüzdandan akçe düş
          db.prepare("UPDATE ekonomi SET cuzdan = MAX(0, cuzdan - ?) WHERE user_id = ?")
            .run(cezaMiktari, borclu.user_id);

          // Ödenmemiş hafta sayısını artır
          db.prepare("UPDATE vergi SET odenmemis_hafta = odenmemis_hafta + 1 WHERE user_id = ? AND guild_id = ?")
            .run(borclu.user_id, guild.id);

          console.log(`[VERGİ CEZA] ${borclu.user_id} kullanıcısına ${cezaMiktari} akçe ceza uygulandı.`);
        } else {
          // Ödenmemiş hafta sayısını artır
          db.prepare("UPDATE vergi SET odenmemis_hafta = odenmemis_hafta + 1 WHERE user_id = ? AND guild_id = ?")
            .run(borclu.user_id, guild.id);
        }
      }
    } catch (hata) {
      console.error(`[ZAMANLAYICI HATA] ${guild.name} için vergi hatırlatması gönderilemedi:`, hata.message);
    }
  }
}

// Zamanlanmış görevleri başlat
function zamanlanmisGorevleriBaslat(client) {
  // Her gün gece yarısı çalıştır
  const simdi = new Date();
  const yariGece = new Date(simdi);
  yariGece.setHours(24, 0, 0, 0);
  const ilkBekleme = yariGece - simdi;

  setTimeout(() => {
    gunlukKontrol(client);
    // Sonraki günlerden itibaren her 24 saatte bir
    setInterval(() => gunlukKontrol(client), 24 * 60 * 60 * 1000);
  }, ilkBekleme);

  console.log(`[ZAMANLAYICI] Görevler başlatıldı. İlk çalışma: ${Math.round(ilkBekleme / 1000 / 60)} dakika sonra.`);
}

module.exports = { zamanlanmisGorevleriBaslat };
