// Komut: /çek - Bankadan Akçe Çek
const { SlashCommandBuilder } = require("discord.js");
const { basariEmbed, hataEmbed, akceFormatla } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle, bankaGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("çek")
    .setDescription("Bankadan akçe çek")
    .addIntegerOption((secenek) =>
      secenek.setName("miktar").setDescription("Çekilecek akçe miktarı").setRequired(true).setMinValue(1)
    ),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    const miktar = interaction.options.getInteger("miktar");

    if (kullanici.banka < miktar) {
      return interaction.reply({ embeds: [hataEmbed(`Bankada yeterli akçeniz yok! Banka: ${akceFormatla(kullanici.banka)}`)], ephemeral: true });
    }

    bankaGuncelle(interaction.user.id, -miktar);
    cuzdanGuncelle(interaction.user.id, miktar);

    return interaction.reply({
      embeds: [basariEmbed(
        "🏦 Banka Çekimi",
        `**${akceFormatla(miktar)}** bankadan çekildi.`,
        [
          { name: "Cüzdan", value: akceFormatla(kullanici.cuzdan + miktar), inline: true },
          { name: "Banka", value: akceFormatla(kullanici.banka - miktar), inline: true }
        ]
      )]
    });
  },
};
