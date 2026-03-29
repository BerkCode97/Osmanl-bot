// Komut: /ver - Akçe Transfer
const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, akceFormatla, logGonder } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("ver")
    .setDescription("Başka birine akçe ver")
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Akçe verilecek kullanıcı").setRequired(true)
    )
    .addIntegerOption((secenek) =>
      secenek.setName("miktar").setDescription("Verilecek akçe miktarı").setRequired(true).setMinValue(1)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getUser("kullanici");
    const miktar = interaction.options.getInteger("miktar");

    if (hedef.id === interaction.user.id) return interaction.reply({ embeds: [hataEmbed("Kendinize akçe veremezsiniz!")], ephemeral: true });
    if (hedef.bot) return interaction.reply({ embeds: [hataEmbed("Botlara akçe veremezsiniz!")], ephemeral: true });

    const gonderen = kullaniciyiGetir(interaction.user.id);
    if (gonderen.cuzdan < miktar) {
      return interaction.reply({ embeds: [hataEmbed(`Yeterli akçeniz yok! Cüzdanınızda: ${akceFormatla(gonderen.cuzdan)}`)], ephemeral: true });
    }

    cuzdanGuncelle(interaction.user.id, -miktar);
    cuzdanGuncelle(hedef.id, miktar);

    // Büyük işlemleri logla
    if (miktar >= config.EKONOMI_LOG_ESIK) {
      const logEmbed = basariEmbed(
        "💸 Büyük Transfer",
        `**${interaction.user.tag}** → **${hedef.tag}** arası büyük transfer`,
        [{ name: "Miktar", value: akceFormatla(miktar) }]
      );
      await logGonder(client, interaction.guild.id, "EKONOMI", logEmbed);
    }

    return interaction.reply({
      embeds: [basariEmbed(
        "💸 Transfer Başarılı",
        `**${akceFormatla(miktar)}** başarıyla **${hedef.username}**'e gönderildi.`,
        [
          { name: "Gönderen", value: interaction.user.username, inline: true },
          { name: "Alan", value: hedef.username, inline: true },
          { name: "Miktar", value: akceFormatla(miktar), inline: true }
        ]
      )]
    });
  },
};
