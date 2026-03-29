// Komut: /akçe-ver - Kullanıcıya Akçe Ver (Yönetici)
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, akceFormatla, logGonder } = require("../../events/yardimci");
const { cuzdanGuncelle, kullaniciyiGetir } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("akçe-ver")
    .setDescription("Kullanıcıya akçe ver (YETKİ GEREKİR)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Akçe verilecek kullanıcı").setRequired(true)
    )
    .addIntegerOption((secenek) =>
      secenek.setName("miktar").setDescription("Verilecek miktar").setRequired(true).setMinValue(1)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getUser("kullanici");
    const miktar = interaction.options.getInteger("miktar");

    cuzdanGuncelle(hedef.id, miktar);
    const kullanici = kullaniciyiGetir(hedef.id);

    const logEmbed = basariEmbed(
      "👑 Yönetici Akçe Verdi",
      `**${interaction.user.tag}** → **${hedef.tag}** akçe transferi`,
      [
        { name: "Miktar", value: akceFormatla(miktar), inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true }
      ]
    );
    await logGonder(client, interaction.guild.id, "YONETICI", logEmbed);

    return interaction.reply({
      embeds: [basariEmbed(
        "✅ Akçe Verildi",
        `**${hedef.username}**'e **${akceFormatla(miktar)}** verildi.`,
        [{ name: "Yeni Bakiye", value: akceFormatla(kullanici.cuzdan) }]
      )]
    });
  },
};
