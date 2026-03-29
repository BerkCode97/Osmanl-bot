// Event: Üye Katıldı
const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { logGonder } = require("./yardimci");

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    const embed = new EmbedBuilder()
      .setColor(config.RENK_BASARI)
      .setTitle("👥 Yeni Üye Katıldı")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Kullanıcı", value: `${member.user.tag} (${member.user.id})`, inline: true },
        { name: "Hesap Açılış", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "Üye Sayısı", value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: config.FOOTER })
      .setTimestamp();

    await logGonder(client, member.guild.id, "UYE", embed);
  },
};
