// Event: Mesaj Düzenlendi
const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { logGonder } = require("./yardimci");

module.exports = {
  name: "messageUpdate",
  async execute(eskiMesaj, yeniMesaj, client) {
    if (!yeniMesaj.guild) return;
    if (yeniMesaj.author?.bot) return;
    if (eskiMesaj.content === yeniMesaj.content) return;

    const embed = new EmbedBuilder()
      .setColor(config.RENK_ALTIN)
      .setTitle("✏️ Mesaj Düzenlendi")
      .addFields(
        { name: "Kullanıcı", value: `${yeniMesaj.author.tag} (${yeniMesaj.author.id})`, inline: true },
        { name: "Kanal", value: `<#${yeniMesaj.channelId}>`, inline: true },
        { name: "Mesaj Linki", value: `[Tıkla](${yeniMesaj.url})`, inline: true },
        { name: "Eski İçerik", value: eskiMesaj.content ? (eskiMesaj.content.length > 512 ? eskiMesaj.content.slice(0, 509) + "..." : eskiMesaj.content) : "*Bilinmiyor*" },
        { name: "Yeni İçerik", value: yeniMesaj.content ? (yeniMesaj.content.length > 512 ? yeniMesaj.content.slice(0, 509) + "..." : yeniMesaj.content) : "*Boş*" }
      )
      .setFooter({ text: config.FOOTER })
      .setTimestamp();

    await logGonder(client, yeniMesaj.guild.id, "MESAJ", embed);
  },
};
