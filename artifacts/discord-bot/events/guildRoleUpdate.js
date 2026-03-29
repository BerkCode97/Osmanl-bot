// Event: Rol Güncellendi / Rol Değişiklikleri
const { EmbedBuilder, Events } = require("discord.js");
const config = require("../config");
const { logGonder } = require("./yardimci");

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(eskiUye, yeniUye, client) {
    if (!yeniUye.guild) return;

    const eklenenRoller = yeniUye.roles.cache.filter((r) => !eskiUye.roles.cache.has(r.id));
    const kaldirilanRoller = eskiUye.roles.cache.filter((r) => !yeniUye.roles.cache.has(r.id));

    if (eklenenRoller.size === 0 && kaldirilanRoller.size === 0) return;

    const embed = new EmbedBuilder()
      .setColor(config.RENK_ALTIN)
      .setTitle("🔧 Rol Değişikliği")
      .setThumbnail(yeniUye.user.displayAvatarURL({ dynamic: true }))
      .addFields({ name: "Kullanıcı", value: `${yeniUye.user.tag} (${yeniUye.user.id})`, inline: true })
      .setFooter({ text: config.FOOTER })
      .setTimestamp();

    if (eklenenRoller.size > 0) {
      embed.addFields({ name: "➕ Eklenen Roller", value: eklenenRoller.map((r) => `<@&${r.id}>`).join(", ") });
    }
    if (kaldirilanRoller.size > 0) {
      embed.addFields({ name: "➖ Kaldırılan Roller", value: kaldirilanRoller.map((r) => `<@&${r.id}>`).join(", ") });
    }

    await logGonder(client, yeniUye.guild.id, "SUNUCU", embed);
  },
};
