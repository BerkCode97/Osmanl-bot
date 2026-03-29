// Komut: /duyur - Embed Duyuru Yap
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config");
const { hataEmbed } = require("../../events/yardimci");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("duyur")
    .setDescription("Embed duyuru yap")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((secenek) =>
      secenek.setName("mesaj").setDescription("Duyuru mesajı").setRequired(true)
    )
    .addChannelOption((secenek) =>
      secenek.setName("kanal").setDescription("Duyuru kanalı (belirtilmezse mevcut kanal)").setRequired(false)
    ),

  async execute(interaction) {
    const mesaj = interaction.options.getString("mesaj");
    const hedefKanal = interaction.options.getChannel("kanal") || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(config.RENK_ALTIN)
      .setTitle("📢 Duyuru")
      .setDescription(mesaj)
      .addFields({ name: "Yayımlayan", value: interaction.user.tag, inline: true })
      .setFooter({ text: config.FOOTER })
      .setTimestamp();

    try {
      await hedefKanal.send({ content: "@everyone", embeds: [embed] });
      return interaction.reply({ content: `✅ Duyuru ${hedefKanal} kanalına gönderildi!`, ephemeral: true });
    } catch (hata) {
      return interaction.reply({ embeds: [hataEmbed("Duyuru gönderilemedi. Kanal izinlerini kontrol edin.")], ephemeral: true });
    }
  },
};
