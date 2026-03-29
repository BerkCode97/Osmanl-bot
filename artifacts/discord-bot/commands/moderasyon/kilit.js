// Komut: /kilit - Kanalı Kilitle
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("kilit")
    .setDescription("Kanalı kilitle (mesaj göndermeyi engelle)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((secenek) =>
      secenek.setName("kanal").setDescription("Kilitlenecek kanal (belirtilmezse mevcut kanal)").setRequired(false)
    ),

  async execute(interaction) {
    const kanal = interaction.options.getChannel("kanal") || interaction.channel;
    const everyoneRolu = interaction.guild.roles.everyone;

    try {
      await kanal.permissionOverwrites.edit(everyoneRolu, { SendMessages: false });
      await kanal.send({ embeds: [basariEmbed("🔒 Kanal Kilitlendi", "Bu kanal yöneticiler tarafından kilitlendi.")] });
      return interaction.reply({ embeds: [basariEmbed("✅ Kanal Kilitlendi", `${kanal} kanalı kilitlendi.`)], ephemeral: true });
    } catch (hata) {
      return interaction.reply({ embeds: [hataEmbed("Kanal kilitlenemedi.")], ephemeral: true });
    }
  },
};
