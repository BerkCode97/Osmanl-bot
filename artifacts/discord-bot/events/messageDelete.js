// Event: Mesaj Silindi
const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { logGonder } = require("./yardimci");

module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    if (!message.guild) return;
    if (message.author?.bot) return;

    const embed = new EmbedBuilder()
      .setColor(config.RENK_HATA)
      .setTitle("✏️ Mesaj Silindi")
      .addFields(
        { name: "Kullanıcı", value: message.author ? `${message.author.tag} (${message.author.id})` : "Bilinmiyor", inline: true },
        { name: "Kanal", value: `<#${message.channelId}>`, inline: true },
        { name: "İçerik", value: message.content ? (message.content.length > 1024 ? message.content.slice(0, 1021) + "..." : message.content) : "*İçerik alınamadı*" }
      )
      .setFooter({ text: config.FOOTER })
      .setTimestamp();

    await logGonder(client, message.guild.id, "MESAJ", embed);
  },
};
