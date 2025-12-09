import { Route } from '../types';

/**
 * テキスト入力からルートのリストをパースする
 * 対応形式:
 * - "かつヴァナ 5" -> { name: "かつヴァナ", count: 5 }
 * - "かつヴァナ (5)" -> { name: "かつヴァナ", count: 5 }
 * - "かつヴァナ 6" -> { name: "かつヴァナ", count: 6 }
 * - "かつヴァナ" -> { name: "かつヴァナ", count: 0 }
 */
export const parseRouteText = (text: string): Route[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  return lines.map((line, index) => {
    // パターン1: 最後に (数字) がある場合
    const parenMatch = line.match(/^(.+?)\s*\((\d+)\)\s*$/);
    if (parenMatch) {
      return {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index.toString(),
        name: parenMatch[1].trim(),
        count: parseInt(parenMatch[2], 10),
        order: index
      };
    }
    
    // パターン2: 最後にスペース+数字がある場合
    const spaceMatch = line.match(/^(.+?)\s+(\d+)\s*$/);
    if (spaceMatch) {
      return {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index.toString(),
        name: spaceMatch[1].trim(),
        count: parseInt(spaceMatch[2], 10),
        order: index
      };
    }
    
    // パターン3: 数字がない場合は0として扱う
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index.toString(),
      name: line,
      count: 0,
      order: index
    };
  });
};
