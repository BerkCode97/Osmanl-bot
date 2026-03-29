// Komut: /rol-ver - Kullanıcıya Rol Ver
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, logGonder } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("rol-ver")
    .setDescription("Kullanıcıya rol ver")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Rol verilecek kullanıcı").setRequired(true)
    )
    .addRoleOption((secenek) =>
      secenek.setName("rol").setDescription("Verilecek rol").setRequired(true)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getMember("kullanici");
    const rol = interaction.options.getRole("rol");

    if (!hedef) return interaction.reply({ embeds: [hataEmbed("Kullanıcı bulunamadı.")], ephemeral: true });
    if (rol.managed) return interaction.reply({ embeds: [hataEmbed("Bu rol bot tarafından yönetilmektedir, değiştirilemez.")], ephemeral: true });
    if (rol.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [hataEmbed("Bu rolü veremezsiniz. Rol sizden yüksek veya eşit konumda.")], ephemeral: true });
    }

    if (hedef.roles.cache.has(rol.id)) {
      return interaction.reply({ embeds: [hataEmbed("Kullanıcının zaten bu rolü var!")], ephemeral: true });
    }

    await hedef.roles.add(rol);

    const logEmbed = basariEmbed(
      "✅ Rol Verildi",
      `**${hedef.user.tag}** kullanıcısına **${rol.name}** rolü verildi.`,
      [{ name: "Yetkili", value: interaction.user.tag, inline: true }]
    );
    await logGonder(client, interaction.guild.id, "YONETICI", logEmbed);

    return interaction.reply({ embeds: [basariEmbed("✅ Rol Verildi", `**${hedef.user.tag}** kullanıcısına **${rol.name}** rolü verildi.`)] });
  },
};
