// Komut: /unmute - Susturmayı Kaldır
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, logGonder } = require("../../events/yardimci");
const { moderasyonLogEkle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Kullanıcının susturmasını kaldır")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Susturması kaldırılacak kullanıcı").setRequired(true)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getMember("kullanici");

    if (!hedef) return interaction.reply({ embeds: [hataEmbed("Kullanıcı bulunamadı.")], ephemeral: true });
    if (!hedef.isCommunicationDisabled()) {
      return interaction.reply({ embeds: [hataEmbed("Bu kullanıcı zaten susturulmamış!")], ephemeral: true });
    }

    await hedef.timeout(null);

    moderasyonLogEkle(hedef.id, interaction.guild.id, interaction.user.id, "UNMUTE", "Manuel kaldırma");

    const logEmbed = basariEmbed(
      "🔊 Susturma Kaldırıldı",
      `**${hedef.user.tag}** kullanıcısının susturması kaldırıldı.`,
      [
        { name: "Kullanıcı", value: `${hedef.user.tag} (${hedef.id})`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true }
      ]
    );
    await logGonder(client, interaction.guild.id, "MODERASYON", logEmbed);

    return interaction.reply({ embeds: [basariEmbed("✅ Susturma Kaldırıldı", `**${hedef.user.tag}** artık konuşabilir.`)] });
  },
};
