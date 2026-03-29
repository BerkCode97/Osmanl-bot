// Komut: /delwarn - Uyarı Silme
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed } = require("../../events/yardimci");
const { uyariSil } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("delwarn")
    .setDescription("Kullanıcıdan uyarı sil")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Uyarısı silinecek kullanıcı").setRequired(true)
    )
    .addIntegerOption((secenek) =>
      secenek.setName("id").setDescription("Silinecek uyarının ID'si").setRequired(true)
    ),

  async execute(interaction) {
    const hedef = interaction.options.getUser("kullanici");
    const uyariId = interaction.options.getInteger("id");

    const sonuc = uyariSil(uyariId, hedef.id, interaction.guild.id);

    if (sonuc.changes === 0) {
      return interaction.reply({ embeds: [hataEmbed(`#${uyariId} ID'li uyarı bulunamadı!`)], ephemeral: true });
    }

    return interaction.reply({
      embeds: [basariEmbed("✅ Uyarı Silindi", `**${hedef.tag}** kullanıcısından **#${uyariId}** numaralı uyarı silindi.`)]
    });
  },
};
