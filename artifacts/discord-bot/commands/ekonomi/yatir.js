// Komut: /yatır - Bankaya Akçe Yatır
const { SlashCommandBuilder } = require("discord.js");
const { basariEmbed, hataEmbed, akceFormatla } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle, bankaGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("yatır")
    .setDescription("Bankaya akçe yatır")
    .addIntegerOption((secenek) =>
      secenek.setName("miktar").setDescription("Yatırılacak akçe (tümü için -1)").setRequired(true).setMinValue(1)
    ),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    let miktar = interaction.options.getInteger("miktar");

    if (miktar === -1) miktar = kullanici.cuzdan;
    if (miktar <= 0 || kullanici.cuzdan < miktar) {
      return interaction.reply({ embeds: [hataEmbed(`Yeterli akçeniz yok! Cüzdanınızda: ${akceFormatla(kullanici.cuzdan)}`)], ephemeral: true });
    }

    cuzdanGuncelle(interaction.user.id, -miktar);
    bankaGuncelle(interaction.user.id, miktar);

    return interaction.reply({
      embeds: [basariEmbed(
        "🏦 Banka Yatırımı",
        `**${akceFormatla(miktar)}** bankaya yatırıldı.`,
        [
          { name: "Cüzdan", value: akceFormatla(kullanici.cuzdan - miktar), inline: true },
          { name: "Banka", value: akceFormatla(kullanici.banka + miktar), inline: true }
        ]
      )]
    });
  },
};
