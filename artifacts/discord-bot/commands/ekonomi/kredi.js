// Komut: /kredi - Bankadan Kredi Çek
const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, akceFormatla } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle, db } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("kredi")
    .setDescription(`Bankadan kredi çek (maks: ${config.EKONOMI.KREDI_MAX} akçe, %5 faizli)`)
    .addIntegerOption((secenek) =>
      secenek
        .setName("miktar")
        .setDescription("Kredi miktarı")
        .setRequired(true)
        .setMinValue(100)
        .setMaxValue(config.EKONOMI.KREDI_MAX)
    ),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    const miktar = interaction.options.getInteger("miktar");

    if (kullanici.kredi > 0) {
      return interaction.reply({ embeds: [hataEmbed(`Zaten **${akceFormatla(kullanici.kredi)}** krediniz var! Önce mevcut kredinizi ödeyin.`)], ephemeral: true });
    }

    const faiz = Math.floor(miktar * config.EKONOMI.KREDI_FAIZ);
    const toplamBorc = miktar + faiz;

    cuzdanGuncelle(interaction.user.id, miktar);
    db.prepare("UPDATE ekonomi SET kredi = ? WHERE user_id = ?").run(toplamBorc, interaction.user.id);

    return interaction.reply({
      embeds: [basariEmbed(
        "💳 Kredi Çekildi",
        `**${akceFormatla(miktar)}** kredi çekildi. Devlet hazinesine borcunuz var!`,
        [
          { name: "Çekilen Miktar", value: akceFormatla(miktar), inline: true },
          { name: "Faiz (%5)", value: akceFormatla(faiz), inline: true },
          { name: "Toplam Borç", value: akceFormatla(toplamBorc), inline: true },
          { name: "Yeni Cüzdan", value: akceFormatla(kullanici.cuzdan + miktar), inline: true }
        ]
      )]
    });
  },
};
