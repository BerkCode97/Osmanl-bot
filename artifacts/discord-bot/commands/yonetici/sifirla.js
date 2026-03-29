// Komut: /sıfırla - Kullanıcı Ekonomisini Sıfırla
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, logGonder } = require("../../events/yardimci");
const { ekonomiSifirla } = require("../../database/database");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("sıfırla")
    .setDescription("Kullanıcı ekonomisini sıfırla (YETKİ GEREKİR)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Ekonomisi sıfırlanacak kullanıcı").setRequired(true)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getUser("kullanici");

    ekonomiSifirla(hedef.id);

    const logEmbed = basariEmbed(
      "🗑️ Ekonomi Sıfırlandı",
      `**${hedef.tag}** kullanıcısının ekonomisi sıfırlandı.`,
      [{ name: "Yetkili", value: interaction.user.tag }]
    );
    await logGonder(client, interaction.guild.id, "YONETICI", logEmbed);

    return interaction.reply({
      embeds: [basariEmbed("✅ Ekonomi Sıfırlandı", `**${hedef.username}**'ın ekonomisi sıfırlandı.`)]
    });
  },
};
