// Komut: /günlük - Günlük Akçe
const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, akceFormatla, kalansureFormatla } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle, gunlukGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName("günlük")
    .setDescription("Günlük akçeni topla"),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    const simdi = Date.now();
    const bekleme = config.EKONOMI.GUNLUK_COOLDOWN;
    const kalan = kullanici.gunluk_son + bekleme - simdi;

    if (kalan > 0) {
      return interaction.reply({ embeds: [hataEmbed(`Günlük akçeni zaten topladın! **${kalansureFormatla(kalan)}** sonra tekrar dene.`)], ephemeral: true });
    }

    const miktar = Math.floor(Math.random() * (config.EKONOMI.GUNLUK_MAX - config.EKONOMI.GUNLUK_MIN + 1)) + config.EKONOMI.GUNLUK_MIN;

    cuzdanGuncelle(interaction.user.id, miktar);
    gunlukGuncelle(interaction.user.id);

    return interaction.reply({
      embeds: [basariEmbed(
        "☀️ Günlük Akçe",
        `Sultanın lütfu ile **${akceFormatla(miktar)}** aldınız!`,
        [{ name: "Yeni Bakiye", value: akceFormatla(kullanici.cuzdan + miktar) }]
      )]
    });
  },
};
