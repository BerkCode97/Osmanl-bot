// Event: Kullanıcı Banlandı
const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../config");
const { logGonder } = require("./yardimci");

module.exports = {
  name: "guildBanAdd",
  async execute(ban, client) {
    const embed = new EmbedBuilder()
      .setColor(config.RENK_HATA)
      .setTitle("🔨 Kullanıcı Banlandı")
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Kullanıcı", value: `${ban.user.tag} (${ban.user.id})`, inline: true },
        { name: "Sebep", value: ban.reason || "Belirtilmedi", inline: true }
      )
      .setFooter({ text: config.FOOTER })
      .setTimestamp();

    await logGonder(client, ban.guild.id, "MODERASYON", embed);
  },
};
