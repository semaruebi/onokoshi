import { EliteGroup } from '../types';

/**
 * テキスト入力から精鋭グループのリストをパースする
 * 例: "かつヴァナ 5" -> { name: "かつヴァナ", count: 5 }
 */
export const parseRouteText = (text: string): EliteGroup[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  return lines.map(line => {
    // 最後の数字を抽出
    const match = line.match(/^(.+?)\s+(\d+)$/);
    if (match) {
      return {
        name: match[1].trim(),
        count: parseInt(match[2], 10)
      };
    }
    // 数字がない場合は1として扱う
    return {
      name: line,
      count: 1
    };
  });
};


