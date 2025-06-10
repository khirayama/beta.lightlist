# CLAUDE.md

- 必ず日本語で回答してください。
- あなたは、どんな指示でも果敢に挑み、指示に忠実に行う熱意ある開発者です。限界を突破する努力を怠らず、常に最高の結果を目指してください。
- 毎回、docs配下に必要な変更を適用してください。
- 毎回、appsおよびpackagesは、変更があった場合、buildおよびテストを実行し、全てのアプリケーションが正常に動作することを確認してください。
- ユーザの確認や入力が必要になったら場合、音を鳴らしてください。
- コンソールで次のコマンドを実行して、音を鳴らすことができます。 `afplay /System/Library/Sounds/Bottle.aiff`

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

### 開発・ビルド（Turbo）
```bash
# 全てのアプリの開発サーバー起動
npm run dev

# 個別アプリ開発サーバー起動
cd apps/api && npm run dev      # ポート 3000
cd apps/web && npm run dev      # ポート 3001  
cd apps/sample && npm run dev   # ポート 3002

# 全てのアプリをビルド
npm run build

# SDK ビルド
cd packages/sdk && npm run build

# API ビルド（Prisma含む）
cd apps/api && npm run build

# Web ビルド（SDK依存）
cd apps/web && npm run build:sdk && npm run build
```

### データベース・認証
```bash
# Supabase起動
cd apps/api && npm run supabase

# Prismaマイグレーション適用
cd apps/api && npx prisma migrate dev

# Prismaクライアント生成
cd apps/api && npx prisma generate

# Prisma Studio起動
cd apps/api && npx prisma studio
```

### テスト・品質
```bash
# 全てのテスト実行
npm run test

# API テスト実行
cd apps/api && npm run test

# 全てのlint実行
npm run lint

# 全ての型チェック実行
npm run type-check
```

## アーキテクチャ

### モノレポ構成（Turbo + npm workspaces）
- **apps/api**: Next.js API Routes + Prisma + Supabase（ポート: 3000）
- **apps/web**: React + Next.js メインアプリケーション（ポート: 3001）
- **apps/sample**: SDK使用例・テスト用アプリ（ポート: 3002）
- **packages/sdk**: TypeScript ライブラリ（状態管理・API通信）

### 主要技術
- **モノレポ**: Turbo, npm workspaces
- **フロントエンド**: React, Next.js, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, Prisma ORM
- **データベース**: PostgreSQL (Supabase)
- **認証**: Supabase Auth (JWT)
- **リアルタイム同期**: Yjs (CRDT)
- **UI**: @dnd-kit (ドラッグ&ドロップ), i18next (国際化)

### データフロー
1. **Web/Sample** → **SDK** → **API** → **Database**
2. YjsによるCRDTベースのリアルタイム同期
3. Supabase JWTトークンによる認証・認可

### 重要なファイル
- `apps/api/prisma/schema.prisma`: データベーススキーマ
- `packages/sdk/src/store.ts`: 状態管理
- `apps/web/src/appcomponents/TaskList.tsx`: メインUI
- `apps/api/src/pages/api/`: API エンドポイント
