import { Route } from '../types';

/**
 * テキスト入力からルートのリストをパースする
 * 対応形式:
 * - "-ルート名(5)" -> 子ルート（グループに属する）
 * - "{グループ名(33)}ルート名(2)" -> グループの境界、右側のルートもそのグループに属する
 * - "ルート名 5" -> 通常のルート
 * - "ルート名 (5)" -> 通常のルート
 * - "ルート名" -> 通常のルート（count=0）
 */
export const parseRouteText = (text: string): Route[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // グループ化が必要かチェック（-で始まる行と{}がある行が両方存在するか）
  const hasChildRoutes = lines.some(line => line.startsWith('-'));
  const hasGroupMarkers = lines.some(line => line.includes('{') && line.includes('}'));
  const useGrouping = hasChildRoutes && hasGroupMarkers;

  if (!useGrouping) {
    // グループ化なし - 従来のパース
    return lines.map((line, index) => parseSimpleLine(line, index));
  }

  // グループ化あり
  // 下から上に処理してグループを割り当て
  const routes: Route[] = [];
  let currentGroupName: string | undefined = undefined;

  // 下から上に処理
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    
    // グループマーカーを検出: {グループ名(数)}ルート名(数)
    const groupMatch = line.match(/^\{([^}]+)\}(.*)$/);
    
    if (groupMatch) {
      // グループの境界を発見
      const groupPart = groupMatch[1]; // "スメール西部(33)"
      const routePart = groupMatch[2].trim(); // "おにぎり波△(2)"
      
      // グループ名を抽出（数字部分を除去）
      const groupNameMatch = groupPart.match(/^(.+?)\s*\(?\d*\)?\s*$/);
      currentGroupName = groupNameMatch ? groupNameMatch[1].trim() : groupPart.trim();
      
      // グループマーカー行自体にもルートがあれば、このグループに追加
      if (routePart) {
        const route = parseSimpleLine(routePart, i, currentGroupName);
        routes.push(route);
      }
    } else if (line.startsWith('-')) {
      // 子ルート - 現在のグループに属する
      const route = parseSimpleLine(line, i, currentGroupName);
      routes.push(route);
    } else {
      // グループ化形式でない行 - そのまま追加
      const route = parseSimpleLine(line, i);
      routes.push(route);
    }
  }
  
  // 元の順序に戻す
  routes.sort((a, b) => a.order - b.order);
  
  return routes;
};

/**
 * 単純な行をパースする
 */
const parseSimpleLine = (line: string, index: number, groupName?: string): Route => {
  // 先頭の - を除去
  let cleanLine = line.startsWith('-') ? line.substring(1).trim() : line;
  
  // パターン1: 最後に (数字) がある場合
  const parenMatch = cleanLine.match(/^(.+?)\s*\((\d+)\)\s*$/);
  if (parenMatch) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index.toString(),
      name: parenMatch[1].trim(),
      count: parseInt(parenMatch[2], 10),
      order: index,
      groupName
    };
  }
  
  // パターン2: 最後にスペース+数字がある場合
  const spaceMatch = cleanLine.match(/^(.+?)\s+(\d+)\s*$/);
  if (spaceMatch) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index.toString(),
      name: spaceMatch[1].trim(),
      count: parseInt(spaceMatch[2], 10),
      order: index,
      groupName
    };
  }
  
  // パターン3: 数字がない場合は0として扱う
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index.toString(),
    name: cleanLine,
    count: 0,
    order: index,
    groupName
  };
};
