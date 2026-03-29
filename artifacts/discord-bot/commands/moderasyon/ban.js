// Komut: /ban - Kullanıcı Banlama
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config");
const { moderasyonLogEkle } = require("../../database/database");
const { basariEmbed, hataEmbed, bilgiEmbed, logGonder, dmGonder } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Kullanıcıyı sunucudan banla")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Banlanacak kullanıcı").setRequired(true)
    )
    .addStringOption((secenek) =>
      secenek.setName("sebep").setDescription("Ban sebebi").setRequired(false)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getMember("kullanici");
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi";

    if (!hedef) {
      return interaction.reply({ embeds: [hataEmbed("Kullanıcı bu sunucuda bulunamadı.")], ephemeral: true });
    }

    if (hedef.id === interaction.user.id) {
      return interaction.reply({ embeds: [hataEmbed("Kendinizi banlayamazsınız!")], ephemeral: true });
    }

    if (!hedef.bannable) {
      return interaction.reply({ embeds: [hataEmbed("Bu kullanıcıyı banlayamam. Yeterli yetkiye sahip değilim.")], ephemeral: true });
    }

    if (hedef.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ embeds: [hataEmbed("Bu kullanıcıyı banlayamazsınız. Rolü sizden yüksek veya eşit.")], ephemeral: true });
    }

    // DM gönder
    const dmEmbed = bilgiEmbed(
      "🔨 Sunucudan Banlandınız",
      `**${interaction.guild.name}** sunucusundan banlandınız.`,
      [
        { name: "Sebep", value: sebep },
        { name: "Yetkili", value: interaction.user.tag }
      ]
    );
    await dmGonder(hedef.user, dmEmbed);

    // Ban işlemi
    await hedef.ban({ reason: `${interaction.user.tag}: ${sebep}` });

    // Log kaydet
    moderasyonLogEkle(hedef.id, interaction.guild.id, interaction.user.id, "BAN", sebep);

    // Log kanalına gönder
    const logEmbed = basariEmbed(
      "🔨 Kullanıcı Banlandı",
      `**${hedef.user.tag}** sunucudan banlandı.`,
      [
        { name: "Kullanıcı", value: `${hedef.user.tag} (${hedef.id})`, inline: true },
        { name: "Yetkili", value: `${interaction.user.tag}`, inline: true },
        { name: "Sebep", value: sebep }
      ]
    );
    await logGonder(client, interaction.guild.id, "MODERASYON", logEmbed);

    return interaction.reply({
      embeds: [basariEmbed("✅ Kullanıcı Banlandı", `**${hedef.user.tag}** başarıyla banlandı.`, [{ name: "Sebep", value: sebep }])],
    });
  },
};
