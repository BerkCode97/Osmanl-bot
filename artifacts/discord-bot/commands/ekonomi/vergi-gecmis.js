// Komut: /vergi-geçmiş - Vergi Ödeme Geçmişi
const { SlashCommandBuilder } = require("discord.js");
const { bilgiEmbed, akceFormatla } = require("../../events/yardimci");
const { vergiGecmisi } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("vergi-geçmiş")
    .setDescription("Vergi ödeme geçmişini gör"),

  async execute(interaction) {
    const gecmis = vergiGecmisi(interaction.user.id, interaction.guild.id);

    if (gecmis.length === 0) {
      return interaction.reply({ embeds: [bilgiEmbed("📜 Vergi Geçmişi", "Henüz hiç vergi ödemediniz.")] });
    }

    const alanlar = gecmis.map((v, i) => ({
      name: `Ödeme #${i + 1}`,
      value: `${akceFormatla(v.miktar)} — <t:${v.tarih}:R>`,
      inline: true,
    }));

    return interaction.reply({ embeds: [bilgiEmbed("📜 Vergi Ödeme Geçmişi", "Son 10 vergi ödemeniz:", alanlar)] });
  },
};
