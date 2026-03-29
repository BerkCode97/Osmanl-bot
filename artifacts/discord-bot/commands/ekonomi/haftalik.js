// Komut: /haftalık - Haftalık Akçe
const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, akceFormatla, kalansureFormatla } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle, haftalikGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName("haftalık")
    .setDescription("Haftalık akçeni topla"),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    const simdi = Date.now();
    const bekleme = config.EKONOMI.HAFTALIK_COOLDOWN;
    const kalan = kullanici.haftalik_son + bekleme - simdi;

    if (kalan > 0) {
      return interaction.reply({ embeds: [hataEmbed(`Haftalık akçeni zaten topladın! **${kalansureFormatla(kalan)}** sonra tekrar dene.`)], ephemeral: true });
    }

    const miktar = Math.floor(Math.random() * (config.EKONOMI.HAFTALIK_MAX - config.EKONOMI.HAFTALIK_MIN + 1)) + config.EKONOMI.HAFTALIK_MIN;

    cuzdanGuncelle(interaction.user.id, miktar);
    haftalikGuncelle(interaction.user.id);

    return interaction.reply({
      embeds: [basariEmbed(
        "📅 Haftalık Akçe",
        `Haftanın kazancınız: **${akceFormatla(miktar)}**!`,
        [{ name: "Yeni Bakiye", value: akceFormatla(kullanici.cuzdan + miktar) }]
      )]
    });
  },
};
