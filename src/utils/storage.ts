import { Route, CheckHistory } from '../types';

const ROUTES_KEY = 'hunt-checker-routes';
const HISTORIES_KEY = 'hunt-checker-histories';

// ルートの保存・取得
export const saveRoutes = (routes: Route[]): void => {
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
};

export const loadRoutes = (): Route[] => {
  const data = localStorage.getItem(ROUTES_KEY);
  return data ? JSON.parse(data) : [];
};

// 履歴の保存・取得
export const saveHistories = (histories: CheckHistory[]): void => {
  localStorage.setItem(HISTORIES_KEY, JSON.stringify(histories));
};

export const loadHistories = (): CheckHistory[] => {
  const data = localStorage.getItem(HISTORIES_KEY);
  return data ? JSON.parse(data) : [];
};

// ルートの追加
export const addRoute = (route: Route): void => {
  const routes = loadRoutes();
  routes.push(route);
  saveRoutes(routes);
};

// ルートの更新
export const updateRoute = (routeId: string, updatedRoute: Route): void => {
  const routes = loadRoutes();
  const index = routes.findIndex(r => r.id === routeId);
  if (index !== -1) {
    routes[index] = updatedRoute;
    saveRoutes(routes);
  }
};

// ルートの削除
export const deleteRoute = (routeId: string): void => {
  const routes = loadRoutes();
  const filteredRoutes = routes.filter(r => r.id !== routeId);
  saveRoutes(filteredRoutes);
};

// 履歴の追加
export const addHistory = (history: CheckHistory): void => {
  const histories = loadHistories();
  histories.unshift(history); // 最新を先頭に
  saveHistories(histories);
};

// ID生成
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};


