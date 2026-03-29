// Event: Ban Kaldırıldı
const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { logGonder } = require("./yardimci");

module.exports = {
  name: "guildBanRemove",
  async execute(ban, client) {
    const embed = new EmbedBuilder()
      .setColor(config.RENK_BASARI)
      .setTitle("✅ Ban Kaldırıldı")
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Kullanıcı", value: `${ban.user.tag} (${ban.user.id})`, inline: true }
      )
      .setFooter({ text: config.FOOTER })
      .setTimestamp();

    await logGonder(client, ban.guild.id, "MODERASYON", embed);
  },
};
