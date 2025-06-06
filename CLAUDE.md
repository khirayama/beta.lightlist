# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

必ず日本語で回答してください。

## コマンド

### 開発・ビルド
```bash
# API開発サーバー起動
cd packages/api && npm run dev

# Web開発サーバー起動  
cd packages/web && npm run dev

# Sample開発サーバー起動（APIも同時起動）
cd packages/sample && npm run dev

# SDK ビルド
cd packages/sdk && npm run build

# API ビルド（Prisma含む）
cd packages/api && npm run build

# Web ビルド
cd packages/web && npm run build
```

### データベース・認証
```bash
# Supabase起動
cd packages/api && npm run supabase

# Prismaマイグレーション適用
cd packages/api && npx prisma migrate dev

# Prismaクライアント生成
cd packages/api && npx prisma generate

# Prisma Studio起動
cd packages/api && npx prisma studio
```

### テスト
```bash
# API テスト実行
cd packages/api && npm test
```

## アーキテクチャ

### モノレポ構成
- **packages/api**: Next.js API Routes + Prisma + Supabase
- **packages/web**: React + Next.js メインアプリケーション
- **packages/sdk**: TypeScript ライブラリ（状態管理・API通信）
- **packages/sample**: SDK使用例・テスト用アプリ

### 主要技術
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
- `packages/api/prisma/schema.prisma`: データベーススキーマ
- `packages/sdk/src/store.ts`: 状態管理
- `packages/web/src/appcomponents/TaskList.tsx`: メインUI
- `packages/api/src/pages/api/`: API エンドポイント
