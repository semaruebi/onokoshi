import { Route } from '../types';

/**
 * テキスト入力からルートのリストをパースする
 * 例: "かつヴァナ 5" -> { name: "かつヴァナ", count: 5 }
 */
export const parseRouteText = (text: string): Route[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  return lines.map(line => {
    // 最後の数字を抽出
    const match = line.match(/^(.+?)\s+(\d+)$/);
    if (match) {
      return {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name: match[1].trim(),
        count: parseInt(match[2], 10)
      };
    }
    // 数字がない場合は1として扱う
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name: line,
      count: 1
    };
  });
};
