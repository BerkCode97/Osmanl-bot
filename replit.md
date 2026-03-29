# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (API server), Node.js built-in SQLite (Discord bot)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── discord-bot/        # Osmanlı İmparatorluğu Discord botu
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Discord Bot (artifacts/discord-bot)

Tamamen Türkçe, Osmanlı İmparatorluğu temalı Discord botu.

### Özellikler
- **Moderasyon**: ban/kick/mute/warn + otomatik ceza sistemi (3 uyarı=mute, 5 uyarı=ban)
- **Ekonomi**: Akçe sistemi, banka, faiz, kredi, soygun
- **Vergi**: Haftalık vergi sistemi, otomatik ceza
- **Logs**: Otomatik kanal kurulum, tüm olaylar loglanır
- **Yönetici**: Gelişmiş yönetim komutları

### Yapı
```
artifacts/discord-bot/
├── commands/
│   ├── moderasyon/   → ban, kick, mute, warn...
│   ├── ekonomi/      → bakiye, çalış, soygun...
│   ├── yonetici/     → duyur, rol-ver, yedek...
│   └── logs/         → logs-kur
├── events/           → Discord event handler'ları
├── database/         → SQLite (node:sqlite)
├── config.js         → Tüm ayarlar burada
├── index.js          → Giriş noktası
└── deploy-commands.js → Slash komutları kayıt
```

### Başlatma
1. `artifacts/discord-bot/.env` dosyası oluştur (BOT_TOKEN, CLIENT_ID, GUILD_ID)
2. `cd artifacts/discord-bot && npm run deploy` → komutları Discord'a kaydet
3. Workflow: "Osmanlı Discord Botu" → `npm start`

### Veritabanı
- Node.js 24 built-in `node:sqlite` modülü kullanılır
- `database/osmanli.db` dosyasında saklanır
- Tablolar: ekonomi, uyarilar, moderasyon_log, vergi, vergi_gecmis, log_ayarlari, sunucu_ayarlari

### Önemli Ayarlar (config.js)
- `OWNER_ID`: "1457036049472557299"
- `AKCE_EMOJI`: "<:akce:1487929022133436466>"
- Vergi oranı, cooldown'lar, otomatik ban/mute eşikleri
