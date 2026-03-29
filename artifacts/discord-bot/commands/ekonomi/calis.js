// Komut: /çalış - Akçe Kazan
const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, akceFormatla, kalansureFormatla } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle, calisSonGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName("çalış")
    .setDescription("Osmanlı'da çalış ve akçe kazan (30dk bekleme)"),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    const simdi = Date.now();
    const bekleme = config.EKONOMI.CALIS_COOLDOWN;
    const kalan = kullanici.calis_son + bekleme - simdi;

    if (kalan > 0) {
      return interaction.reply({ embeds: [hataEmbed(`Yoruldunuz! **${kalansureFormatla(kalan)}** dinlendikten sonra çalışabilirsiniz.`)], ephemeral: true });
    }

    const mesajlar = config.CALIS_MESAJLARI;
    const mesaj = mesajlar[Math.floor(Math.random() * mesajlar.length)];
    const miktar = Math.floor(Math.random() * (config.EKONOMI.CALIS_MAX - config.EKONOMI.CALIS_MIN + 1)) + config.EKONOMI.CALIS_MIN;

    cuzdanGuncelle(interaction.user.id, miktar);
    calisSonGuncelle(interaction.user.id);

    return interaction.reply({
      embeds: [basariEmbed(
        "⚒️ Çalışma",
        `${mesaj}, **${akceFormatla(miktar)}** kazandınız.`,
        [{ name: "Yeni Bakiye", value: akceFormatla(kullanici.cuzdan + miktar) }]
      )]
    });
  },
};
