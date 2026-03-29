// Komut: /kilit-aç - Kanal Kilidini Kaldır
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("kilit-aç")
    .setDescription("Kanalın kilidini kaldır")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((secenek) =>
      secenek.setName("kanal").setDescription("Kilidi açılacak kanal (belirtilmezse mevcut kanal)").setRequired(false)
    ),

  async execute(interaction) {
    const kanal = interaction.options.getChannel("kanal") || interaction.channel;
    const everyoneRolu = interaction.guild.roles.everyone;

    try {
      await kanal.permissionOverwrites.edit(everyoneRolu, { SendMessages: null });
      await kanal.send({ embeds: [basariEmbed("🔓 Kanal Açıldı", "Bu kanalın kilidi kaldırıldı.")] });
      return interaction.reply({ embeds: [basariEmbed("✅ Kilit Kaldırıldı", `${kanal} kanalının kilidi kaldırıldı.`)], ephemeral: true });
    } catch (hata) {
      return interaction.reply({ embeds: [hataEmbed("Kanal kilidi kaldırılamadı.")], ephemeral: true });
    }
  },
};
