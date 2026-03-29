// Osmanlı Bot - Slash Komutları Discord'a Kaydetme
require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
  console.error("[HATA] BOT_TOKEN veya CLIENT_ID bulunamadı!");
  process.exit(1);
}

const komutlar = [];

function komutlariTara(dizin) {
  const dosyalar = fs.readdirSync(dizin);
  for (const dosya of dosyalar) {
    const tamYol = path.join(dizin, dosya);
    if (fs.statSync(tamYol).isDirectory()) {
      komutlariTara(tamYol);
    } else if (dosya.endsWith(".js")) {
      try {
        const komut = require(tamYol);
        if ("data" in komut && "execute" in komut) {
          komutlar.push(komut.data.toJSON());
          console.log(`[KAYIT] Hazırlandı: /${komut.data.name}`);
        }
      } catch (hata) {
        console.error(`[HATA] ${dosya} okunamadı:`, hata.message);
      }
    }
  }
}

komutlariTara(path.join(__dirname, "commands"));

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log(`\n[KAYIT] ${komutlar.length} slash komutu Discord'a kaydediliyor...`);

    let veri;
    if (process.env.GUILD_ID) {
      // Sunucu bazlı kayıt (hızlı - geliştirme için)
      veri = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: komutlar,
      });
      console.log(`[BAŞARI] ${veri.length} komut "${process.env.GUILD_ID}" sunucusuna kaydedildi!`);
    } else {
      // Global kayıt (yavaş - prodüksiyon için)
      veri = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: komutlar });
      console.log(`[BAŞARI] ${veri.length} komut global olarak kaydedildi!`);
    }
  } catch (hata) {
    console.error("[HATA] Komutlar kaydedilemedi:", hata);
    process.exit(1);
  }
})();
