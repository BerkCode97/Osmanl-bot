// Komut: /kick - Kullanıcı Atma
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, bilgiEmbed, logGonder, dmGonder } = require("../../events/yardimci");
const { moderasyonLogEkle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kullanıcıyı sunucudan at")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Atılacak kullanıcı").setRequired(true)
    )
    .addStringOption((secenek) =>
      secenek.setName("sebep").setDescription("Atma sebebi").setRequired(false)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getMember("kullanici");
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi";

    if (!hedef) return interaction.reply({ embeds: [hataEmbed("Kullanıcı bulunamadı.")], ephemeral: true });
    if (hedef.id === interaction.user.id) return interaction.reply({ embeds: [hataEmbed("Kendinizi atamazsınız!")], ephemeral: true });
    if (!hedef.kickable) return interaction.reply({ embeds: [hataEmbed("Bu kullanıcıyı atamam.")], ephemeral: true });

    if (hedef.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [hataEmbed("Bu kullanıcıyı atamazsınız. Rolü sizden yüksek veya eşit.")], ephemeral: true });
    }

    const dmEmbed = bilgiEmbed(
      "👢 Sunucudan Atıldınız",
      `**${interaction.guild.name}** sunucusundan atıldınız.`,
      [
        { name: "Sebep", value: sebep },
        { name: "Yetkili", value: interaction.user.tag }
      ]
    );
    await dmGonder(hedef.user, dmEmbed);

    await hedef.kick(`${interaction.user.tag}: ${sebep}`);

    moderasyonLogEkle(hedef.id, interaction.guild.id, interaction.user.id, "KICK", sebep);

    const logEmbed = basariEmbed(
      "👢 Kullanıcı Atıldı",
      `**${hedef.user.tag}** sunucudan atıldı.`,
      [
        { name: "Kullanıcı", value: `${hedef.user.tag} (${hedef.id})`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true },
        { name: "Sebep", value: sebep }
      ]
    );
    await logGonder(client, interaction.guild.id, "MODERASYON", logEmbed);

    return interaction.reply({ embeds: [basariEmbed("✅ Kullanıcı Atıldı", `**${hedef.user.tag}** başarıyla atıldı.`, [{ name: "Sebep", value: sebep }])] });
  },
};
