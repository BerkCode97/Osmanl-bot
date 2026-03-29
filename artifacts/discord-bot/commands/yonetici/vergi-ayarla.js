// Komut: /vergi-ayarla - Vergi Oranı Belirle (YETKİ GEREKİR)
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed } = require("../../events/yardimci");
const { vergiOraniGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("vergi-ayarla")
    .setDescription("Sunucu vergi oranını ayarla (YETKİ GEREKİR)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addNumberOption((secenek) =>
      secenek
        .setName("oran")
        .setDescription("Vergi oranı (örn: 5 = %5, maks: 30)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(30)
    ),

  async execute(interaction) {
    const oranYuzde = interaction.options.getNumber("oran");
    const oran = oranYuzde / 100;

    vergiOraniGuncelle(interaction.guild.id, oran);

    return interaction.reply({
      embeds: [basariEmbed(
        "✅ Vergi Oranı Güncellendi",
        `Sunucu vergi oranı **%${oranYuzde}** olarak ayarlandı.`
      )]
    });
  },
};
