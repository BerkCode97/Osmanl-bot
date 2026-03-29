// Komut: /bakiye - Bakiye Göster
const { SlashCommandBuilder } = require("discord.js");
const { altinEmbed } = require("../../events/yardimci");
const { kullaniciyiGetir } = require("../../database/database");
const { akceFormatla } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("bakiye")
    .setDescription("Akçe bakiyeni gör"),

  async execute(interaction) {
    const kullanici = kullaniciyiGetir(interaction.user.id);
    const toplam = kullanici.cuzdan + kullanici.banka;

    return interaction.reply({
      embeds: [altinEmbed(
        `💰 ${interaction.user.username} - Hazine`,
        "Osmanlı İmparatorluğu'ndaki varlıklarınız:",
        [
          { name: "👝 Cüzdan", value: akceFormatla(kullanici.cuzdan), inline: true },
          { name: "🏦 Banka", value: akceFormatla(kullanici.banka), inline: true },
          { name: "💳 Kredi Borcu", value: akceFormatla(kullanici.kredi), inline: true },
          { name: "📊 Toplam Servet", value: akceFormatla(toplam), inline: true }
        ]
      ).setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))]
    });
  },
};
