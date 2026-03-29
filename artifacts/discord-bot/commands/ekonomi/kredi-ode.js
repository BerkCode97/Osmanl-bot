// Komut: /kredi-öde - Kredi Öde
const { SlashCommandBuilder } = require("discord.js");
const { basariEmbed, hataEmbed, akceFormatla } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle, db } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("kredi-öde")
    .setDescription("Kredi borcunu öde")
    .addIntegerOption((secenek) =>
      secenek.setName("miktar").setDescription("Ödenecek miktar").setRequired(true).setMinValue(1)
    ),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    let miktar = interaction.options.getInteger("miktar");

    if (kullanici.kredi <= 0) {
      return interaction.reply({ embeds: [hataEmbed("Ödenmesi gereken krediniz yok!")], ephemeral: true });
    }

    miktar = Math.min(miktar, kullanici.kredi);

    if (kullanici.cuzdan < miktar) {
      return interaction.reply({ embeds: [hataEmbed(`Yeterli akçeniz yok! Cüzdanınızda: ${akceFormatla(kullanici.cuzdan)}`)], ephemeral: true });
    }

    cuzdanGuncelle(interaction.user.id, -miktar);
    const yeniKredi = Math.max(0, kullanici.kredi - miktar);
    db.prepare("UPDATE ekonomi SET kredi = ? WHERE user_id = ?").run(yeniKredi, interaction.user.id);

    return interaction.reply({
      embeds: [basariEmbed(
        "✅ Kredi Ödendi",
        `**${akceFormatla(miktar)}** kredi ödemesi yapıldı.`,
        [
          { name: "Ödenen", value: akceFormatla(miktar), inline: true },
          { name: "Kalan Borç", value: akceFormatla(yeniKredi), inline: true },
          { name: "Yeni Cüzdan", value: akceFormatla(kullanici.cuzdan - miktar), inline: true }
        ]
      )]
    });
  },
};
