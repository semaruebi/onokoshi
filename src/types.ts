// 精鋭グループの情報
export interface EliteGroup {
  name: string;
  count: number;
}

// ルート情報
export interface Route {
  id: string;
  name: string;
  groups: EliteGroup[];
  createdAt: string;
}

// 狩り残しチェック結果
export interface CheckResult {
  groupName: string;
  hasRemaining: boolean;
  memo: string;
}

// チェック履歴
export interface CheckHistory {
  id: string;
  routeId: string;
  routeName: string;
  date: string;
  results: CheckResult[];
}

