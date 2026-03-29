// Komut: /rol-al - Kullanıcıdan Rol Al
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, logGonder } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("rol-al")
    .setDescription("Kullanıcıdan rol al")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Rolü alınacak kullanıcı").setRequired(true)
    )
    .addRoleOption((secenek) =>
      secenek.setName("rol").setDescription("Alınacak rol").setRequired(true)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getMember("kullanici");
    const rol = interaction.options.getRole("rol");

    if (!hedef) return interaction.reply({ embeds: [hataEmbed("Kullanıcı bulunamadı.")], ephemeral: true });
    if (rol.managed) return interaction.reply({ embeds: [hataEmbed("Bu rol bot tarafından yönetilmektedir.")], ephemeral: true });
    if (!hedef.roles.cache.has(rol.id)) {
      return interaction.reply({ embeds: [hataEmbed("Kullanıcının bu rolü yok!")], ephemeral: true });
    }

    await hedef.roles.remove(rol);

    const logEmbed = basariEmbed(
      "➖ Rol Alındı",
      `**${hedef.user.tag}** kullanıcısından **${rol.name}** rolü alındı.`,
      [{ name: "Yetkili", value: interaction.user.tag, inline: true }]
    );
    await logGonder(client, interaction.guild.id, "YONETICI", logEmbed);

    return interaction.reply({ embeds: [basariEmbed("✅ Rol Alındı", `**${hedef.user.tag}** kullanıcısından **${rol.name}** rolü alındı.`)] });
  },
};
