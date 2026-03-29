// Komut: /logs-kur - Log Kanallarını Otomatik Kur
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, yoneticiMi } = require("../../events/yardimci");
const { logAyariniKaydet, logKategoriKaydet } = require("../../database/database");

const KANAL_TANIMI = [
  { key: "MODERASYON", isim: "⚔️-moderasyon-log", aciklama: "Ban, kick, mute, uyarı işlemleri" },
  { key: "EKONOMI", isim: "💰-ekonomi-log", aciklama: "Büyük transferler, soygunlar, vergi" },
  { key: "UYE", isim: "👥-üye-log", aciklama: "Sunucuya giriş ve çıkışlar" },
  { key: "MESAJ", isim: "✏️-mesaj-log", aciklama: "Silinen ve düzenlenen mesajlar" },
  { key: "SUNUCU", isim: "🔧-sunucu-log", aciklama: "Rol ve kanal değişiklikleri" },
  { key: "YONETICI", isim: "👑-yönetici-log", aciklama: "Yönetici komut kullanımları" },
];

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("logs-kur")
    .setDescription("Log kanallarını otomatik oluştur (YETKİ GEREKİR)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    if (!yoneticiMi(interaction.member)) {
      return interaction.reply({ embeds: [hataEmbed("Bu komutu kullanma yetkiniz yok!")], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Kategori oluştur
      const kategori = await interaction.guild.channels.create({
        name: config.LOG_KATEGORISI,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
          },
        ],
      });

      logKategoriKaydet(interaction.guild.id, kategori.id);

      // Admin rollerine erişim ver
      const adminRoller = interaction.guild.roles.cache.filter(
        (rol) => rol.permissions.has(PermissionFlagsBits.Administrator) && !rol.managed
      );

      for (const [, rol] of adminRoller) {
        await kategori.permissionOverwrites.edit(rol, { ViewChannel: true });
      }

      // Kanalları oluştur
      const olusturulanKanalar = [];
      for (const kanal of KANAL_TANIMI) {
        const yeniKanal = await interaction.guild.channels.create({
          name: kanal.isim,
          type: ChannelType.GuildText,
          parent: kategori.id,
          topic: kanal.aciklama,
        });

        logAyariniKaydet(interaction.guild.id, kanal.key, yeniKanal.id);
        olusturulanKanalar.push(`${yeniKanal}`);
      }

      return interaction.editReply({
        embeds: [basariEmbed(
          "✅ Log Sistemi Kuruldu",
          `**${config.LOG_KATEGORISI}** kategorisi ve log kanalları başarıyla oluşturuldu!`,
          [{ name: "Oluşturulan Kanallar", value: olusturulanKanalar.join("\n") }]
        )]
      });
    } catch (hata) {
      console.error("[HATA] Log kanalları oluşturulamadı:", hata);
      return interaction.editReply({ embeds: [hataEmbed(`Log kanalları oluşturulurken hata: ${hata.message}`)] });
    }
  },
};
