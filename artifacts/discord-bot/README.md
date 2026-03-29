# 👑 Osmanlı İmparatorluğu Discord Botu

Discord.js v14 + Node.js built-in SQLite ile yazılmış, Fatih Sultan Mehmet dönemi temalı profesyonel Discord botu.

## Kurulum

### 1. .env Dosyasını Oluştur
```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Slash Komutlarını Kaydet
```bash
npm run deploy
```

### 4. Botu Başlat
```bash
npm start
```

## Komutlar

### Moderasyon
| Komut | Açıklama |
|-------|----------|
| `/ban` | Kullanıcı banla |
| `/unban` | Ban kaldır |
| `/kick` | Kullanıcı at |
| `/mute` | Kullanıcı sustur |
| `/unmute` | Susturmayı kaldır |
| `/warn` | Uyarı ver |
| `/warnings` | Uyarıları listele |
| `/delwarn` | Uyarı sil |
| `/temizle` | Mesaj sil |
| `/yavaş-mod` | Yavaş mod ayarla |
| `/kilit` | Kanalı kilitle |
| `/kilit-aç` | Kilidi kaldır |

### Ekonomi (Akçe Sistemi)
| Komut | Açıklama |
|-------|----------|
| `/bakiye` | Bakiye gör |
| `/günlük` | Günlük akçe topla |
| `/haftalık` | Haftalık akçe topla |
| `/çalış` | 30dk cooldown ile çalış |
| `/ver` | Akçe transfer et |
| `/sıralama` | En zengin 10 kişi |
| `/yatır` | Bankaya yatır |
| `/çek` | Bankadan çek |
| `/faiz` | %2 günlük faiz al |
| `/kredi` | Kredi çek (maks 5000) |
| `/kredi-öde` | Kredi öde |
| `/soy` | Soygun dene (%40 başarı) |

### Vergi Sistemi
| Komut | Açıklama |
|-------|----------|
| `/vergi` | Vergi durumunu gör |
| `/vergi-öde` | Haftalık vergi öde |
| `/vergi-geçmiş` | Vergi geçmişi |
| `/vergi-ayarla` | Oran ayarla (YETKİ) |
| `/vergi-listesi` | Borçlular (YETKİ) |

### Log Sistemi
| Komut | Açıklama |
|-------|----------|
| `/logs-kur` | Log kanallarını kur (YETKİ) |

### Yönetici
| Komut | Açıklama |
|-------|----------|
| `/rol-ver` | Rol ver |
| `/rol-al` | Rol al |
| `/duyur` | Embed duyuru |
| `/akçe-ver` | Akçe ver |
| `/akçe-al` | Akçe al |
| `/sunucu-bilgi` | Sunucu istatistikleri |
| `/kullanıcı-bilgi` | Kullanıcı detayı |
| `/bot-bilgi` | Bot bilgisi |
| `/yedek` | DB yedekle (SADECE OWNER) |
| `/sıfırla` | Ekonomi sıfırla |
