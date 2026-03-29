// Event: Üye Ayrıldı
const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { logGonder } = require("./yardimci");

module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    const embed = new EmbedBuilder()
      .setColor(config.RENK_HATA)
      .setTitle("👥 Üye Ayrıldı")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Kullanıcı", value: `${member.user.tag} (${member.user.id})`, inline: true },
        { name: "Katılma Tarihi", value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Bilinmiyor", inline: true },
        { name: "Üye Sayısı", value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: config.FOOTER })
      .setTimestamp();

    await logGonder(client, member.guild.id, "UYE", embed);
  },
};
