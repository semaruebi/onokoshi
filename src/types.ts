// ルート情報（精鋭グループ）
export interface Route {
  id: string;
  name: string;
  count: number; // 精鋭数
  order: number; // 入力順序
  groupName?: string; // グループ名（オプション）
}

// ルートセット（名前付きルートグループ）
export interface RouteSet {
  id: string;
  name: string; // ルートセット名
  routes: Route[];
  expectedEliteCount: number; // 想定精鋭数
  createdAt: string;
  updatedAt: string;
  originalText?: string; // 登録時の元のテキストフォーマット（-や{}を含む）
}

// RUNデータ（プロジェクト単位）
export interface Run {
  id: string;
  name: string; // "2025-12-09 RUN" 形式、編集可能
  createdAt: string;
  updatedAt: string;
  routes: RouteRun[]; // ルートごとの仮残し情報
  expectedEliteCount: number; // 想定精鋭数
  tsurumiShortage: number; // 鶴観不足分
  adlibAddition: number; // アドリブ追加数
}

// ルートごとの仮残し情報
export interface RouteRun {
  routeId: string;
  routeName: string;
  hasRemaining: boolean; // 仮残しの有無
  remainingCount: number; // 仮残しの数
  comment: string; // コメント（自由入力 + タグ）
  groupName?: string; // グループ名（オプション）
}

// タグ定義
export const TAGS = [
  '#ワンパンミス',
  '#ミリ残し',
  '#狩り漏れ',
  '#置き物ミス',
  '#フライングワープ',
  '#あきらめた'
] as const;

export type Tag = typeof TAGS[number];
