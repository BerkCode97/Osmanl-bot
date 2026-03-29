// Komut: /sıralama - Zenginlik Sıralaması
const { SlashCommandBuilder } = require("discord.js");
const { altinEmbed, akceFormatla } = require("../../events/yardimci");
const { topSiralamasi } = require("../../database/database");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("sıralama")
    .setDescription("En zengin 10 kişiyi gör"),

  async execute(interaction, client) {
    await interaction.deferReply();

    const siralamaVerisi = topSiralamasi(10);

    const madalyalar = ["👑", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    const satirlar = [];

    for (let i = 0; i < siralamaVerisi.length; i++) {
      const kayit = siralamaVerisi[i];
      let kullaniciAdi = "Bilinmiyor";
      try {
        const kullanici = await client.users.fetch(kayit.user_id);
        kullaniciAdi = kullanici.username;
      } catch {}
      satirlar.push(`${madalyalar[i]} **${kullaniciAdi}** — ${akceFormatla(kayit.toplam)}`);
    }

    return interaction.editReply({
      embeds: [altinEmbed(
        "🏆 Osmanlı'nın En Zenginleri",
        satirlar.join("\n") || "Henüz kimse sıralamada değil."
      )]
    });
  },
};
