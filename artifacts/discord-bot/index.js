// Osmanlı İmparatorluğu Discord Botu - Ana Giriş Noktası
require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { initDatabase } = require("./database/database");
const { zamanlanmisGorevleriBaslat } = require("./events/zamanlayici");

// Ortam değişkenlerini kontrol et
if (!process.env.BOT_TOKEN) {
  console.error("[HATA] BOT_TOKEN bulunamadı! .env dosyasını kontrol edin.");
  process.exit(1);
}
if (!process.env.CLIENT_ID) {
  console.error("[HATA] CLIENT_ID bulunamadı! .env dosyasını kontrol edin.");
  process.exit(1);
}

// Client oluştur
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

// Komutlar koleksiyonu
client.commands = new Collection();
client.cooldowns = new Collection();

// Veritabanını başlat
try {
  initDatabase();
} catch (hata) {
  console.error("[HATA] Veritabanı başlatılamadı:", hata);
  process.exit(1);
}

// Komutları yükle
function komutlariYukle(dizin) {
  const dosyalar = fs.readdirSync(dizin);
  for (const dosya of dosyalar) {
    const tam_yol = path.join(dizin, dosya);
    if (fs.statSync(tam_yol).isDirectory()) {
      komutlariYukle(tam_yol);
    } else if (dosya.endsWith(".js")) {
      try {
        const komut = require(tam_yol);
        if ("data" in komut && "execute" in komut) {
          client.commands.set(komut.data.name, komut);
          console.log(`[KOMUT] Yüklendi: /${komut.data.name}`);
        } else {
          console.warn(`[UYARI] ${dosya} geçersiz komut yapısına sahip.`);
        }
      } catch (hata) {
        console.error(`[HATA] ${dosya} yüklenemedi:`, hata.message);
      }
    }
  }
}

const komutDizini = path.join(__dirname, "commands");
komutlariYukle(komutDizini);

// Event'leri yükle
const eventDizini = path.join(__dirname, "events");
const eventDosyalari = fs.readdirSync(eventDizini).filter((f) => f.endsWith(".js"));

for (const dosya of eventDosyalari) {
  try {
    const event = require(path.join(eventDizini, dosya));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`[EVENT] Yüklendi: ${event.name}`);
  } catch (hata) {
    console.error(`[HATA] Event ${dosya} yüklenemedi:`, hata.message);
  }
}

// Slash komut işleyici
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const komut = client.commands.get(interaction.commandName);
  if (!komut) {
    console.error(`[HATA] /${interaction.commandName} komutu bulunamadı.`);
    return;
  }

  // Cooldown kontrolü
  const { cooldowns } = client;
  if (!cooldowns.has(komut.data.name)) {
    cooldowns.set(komut.data.name, new Collection());
  }

  const simdi = Date.now();
  const zamanDamgalari = cooldowns.get(komut.data.name);
  const bekleme = (komut.cooldown ?? 3) * 1000;

  if (zamanDamgalari.has(interaction.user.id)) {
    const gecmisZaman = zamanDamgalari.get(interaction.user.id);
    const kalansure = (gecmisZaman + bekleme - simdi) / 1000;

    if (kalansure > 0) {
      return interaction.reply({
        content: `⏳ Bu komutu tekrar kullanmak için **${kalansure.toFixed(1)}** saniye beklemeniz gerekiyor.`,
        ephemeral: true,
      });
    }
  }

  zamanDamgalari.set(interaction.user.id, simdi);
  setTimeout(() => zamanDamgalari.delete(interaction.user.id), bekleme);

  // Komutu çalıştır
  try {
    await komut.execute(interaction, client);
  } catch (hata) {
    console.error(`[HATA] /${komut.data.name} çalıştırılırken hata:`, hata);
    const hataMesaji = { content: "❌ Bir hata oluştu. Lütfen daha sonra tekrar deneyin.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(hataMesaji);
    } else {
      await interaction.reply(hataMesaji);
    }
  }
});

// Bot hazır
client.once("ready", (c) => {
  console.log(`\n[BOT] ${c.user.tag} olarak giriş yapıldı!`);
  console.log(`[BOT] ${c.guilds.cache.size} sunucuda aktif.`);
  console.log(`[BOT] ${client.commands.size} komut yüklendi.\n`);

  // Bot durumunu ayarla
  c.user.setActivity("Osmanlı İmparatorluğu'nu yönetiyor 👑", { type: 3 }); // WATCHING

  // Zamanlanmış görevleri başlat
  zamanlanmisGorevleriBaslat(client);
});

// Hata yönetimi
process.on("unhandledRejection", (hata) => {
  console.error("[HATA] İşlenmeyen Promise Reddi:", hata);
});

process.on("uncaughtException", (hata) => {
  console.error("[HATA] Yakalanmamış İstisna:", hata);
});

// Bağlan
client.login(process.env.BOT_TOKEN).catch((hata) => {
  console.error("[HATA] Bot girişi başarısız:", hata.message);
  process.exit(1);
});
