// Komut: /yavaş-mod - Yavaş Mod
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("yavaş-mod")
    .setDescription("Kanalda yavaş mod ayarla")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((secenek) =>
      secenek
        .setName("saniye")
        .setDescription("Yavaş mod süresi (saniye, 0 = kapalı)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    ),

  async execute(interaction) {
    const saniye = interaction.options.getInteger("saniye");

    try {
      await interaction.channel.setRateLimitPerUser(saniye);
      const mesaj = saniye === 0
        ? "Yavaş mod **kapatıldı**."
        : `Yavaş mod **${saniye} saniye** olarak ayarlandı.`;
      return interaction.reply({ embeds: [basariEmbed("⏱️ Yavaş Mod", mesaj)] });
    } catch (hata) {
      return interaction.reply({ embeds: [hataEmbed("Yavaş mod ayarlanamadı.")], ephemeral: true });
    }
  },
};
