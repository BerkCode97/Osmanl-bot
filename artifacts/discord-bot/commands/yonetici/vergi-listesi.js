// Komut: /vergi-listesi - Vergi Borçluları Listesi
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { bilgiEmbed, akceFormatla } = require("../../events/yardimci");
const { vergiBorclulari } = require("../../database/database");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("vergi-listesi")
    .setDescription("Vergi borçluları listesi (YETKİ GEREKİR)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const borclular = vergiBorclulari(interaction.guild.id);

    if (borclular.length === 0) {
      return interaction.reply({ embeds: [bilgiEmbed("📜 Vergi Borçluları", "Herkes vergisini ödemiş! Devlet-i Aliyye memnundur.")] });
    }

    const satirlar = borclular.slice(0, 15).map((b, i) => {
      return `**${i + 1}.** <@${b.user_id}> — ${akceFormatla(b.borclu)} *(${b.odenmemis_hafta} hafta)*`;
    });

    return interaction.reply({
      embeds: [bilgiEmbed(
        "📜 Vergi Borçluları",
        `**${borclular.length}** kişi vergi borcuna sahip:\n\n${satirlar.join("\n")}`
      )]
    });
  },
};
