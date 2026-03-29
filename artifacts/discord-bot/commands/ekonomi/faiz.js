// Komut: /faiz - Banka Faizi Al
const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, akceFormatla, kalansureFormatla } = require("../../events/yardimci");
const { kullaniciyiGetir, bankaGuncelle, faizSonGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName("faiz")
    .setDescription("Bankadaki akçene %2 günlük faiz al"),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    const simdi = Date.now();
    const bekleme = config.EKONOMI.FAIZ_COOLDOWN;
    const kalan = kullanici.faiz_son + bekleme - simdi;

    if (kalan > 0) {
      return interaction.reply({ embeds: [hataEmbed(`Faizi zaten aldınız! **${kalansureFormatla(kalan)}** sonra tekrar alabilirsiniz.`)], ephemeral: true });
    }

    if (kullanici.banka <= 0) {
      return interaction.reply({ embeds: [hataEmbed("Bankada akçeniz olmadan faiz alamazsınız!")], ephemeral: true });
    }

    const faizMiktari = Math.floor(kullanici.banka * config.EKONOMI.FAIZ_ORANI);
    if (faizMiktari <= 0) {
      return interaction.reply({ embeds: [hataEmbed("Bankadaki akçeniz faiz almak için çok az!")], ephemeral: true });
    }

    bankaGuncelle(interaction.user.id, faizMiktari);
    faizSonGuncelle(interaction.user.id);

    return interaction.reply({
      embeds: [basariEmbed(
        "📈 Faiz Kazandınız!",
        `Bankadaki akçenize **%${config.EKONOMI.FAIZ_ORANI * 100}** faiz uygulandı.`,
        [
          { name: "Faiz Miktarı", value: akceFormatla(faizMiktari), inline: true },
          { name: "Yeni Banka Bakiyesi", value: akceFormatla(kullanici.banka + faizMiktari), inline: true }
        ]
      )]
    });
  },
};
