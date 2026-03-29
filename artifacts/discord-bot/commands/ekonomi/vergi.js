// Komut: /vergi - Vergi Durumunu Gör
const { SlashCommandBuilder } = require("discord.js");
const { bilgiEmbed, akceFormatla } = require("../../events/yardimci");
const { vergiyiGetir, kullaniciyiGetir, sunucuAyariniGetir } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("vergi")
    .setDescription("Mevcut vergi oranını ve borcunu gör"),

  async execute(interaction) {
    const ayarlar = sunucuAyariniGetir(interaction.guild.id);
    const vergi = vergiyiGetir(interaction.user.id, interaction.guild.id);
    const kullanici = kullaniciyiGetir(interaction.user.id);

    const vergiOrani = ayarlar.vergi_orani || 0.05;
    const haftalikVergi = Math.floor((kullanici.cuzdan + kullanici.banka) * vergiOrani);

    return interaction.reply({
      embeds: [bilgiEmbed(
        "📜 Vergi Durumu",
        "Osmanlı Hazinesi'ne olan vergi durumunuz:",
        [
          { name: "Vergi Oranı", value: `%${vergiOrani * 100}`, inline: true },
          { name: "Vergi Borcunuz", value: akceFormatla(vergi.borclu), inline: true },
          { name: "Tahmini Haftalık Vergi", value: akceFormatla(haftalikVergi), inline: true },
          { name: "Ödenmemiş Hafta", value: `${vergi.odenmemis_hafta}`, inline: true },
          { name: "Son Ödeme", value: vergi.son_odeme ? `<t:${Math.floor(vergi.son_odeme / 1000)}:R>` : "Hiç ödenmedi", inline: true }
        ]
      )]
    });
  },
};
