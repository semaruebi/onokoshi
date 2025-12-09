import { Run, Route, RouteSet } from '../types';

const DB_NAME = 'onokoshi-db';
const DB_VERSION = 2;
const RUNS_STORE = 'runs';
const ROUTES_STORE = 'routes';
const ROUTE_SETS_STORE = 'routeSets';

let db: IDBDatabase | null = null;

// IndexedDBの初期化
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // runsストアの作成
      if (!database.objectStoreNames.contains(RUNS_STORE)) {
        const runsStore = database.createObjectStore(RUNS_STORE, { keyPath: 'id' });
        runsStore.createIndex('createdAt', 'createdAt', { unique: false });
        runsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // routesストアの作成（ルートテンプレート）
      if (!database.objectStoreNames.contains(ROUTES_STORE)) {
        const routesStore = database.createObjectStore(ROUTES_STORE, { keyPath: 'id' });
        routesStore.createIndex('name', 'name', { unique: false });
      }

      // routeSetsストアの作成（ルートセット）
      if (!database.objectStoreNames.contains(ROUTE_SETS_STORE)) {
        const routeSetsStore = database.createObjectStore(ROUTE_SETS_STORE, { keyPath: 'id' });
        routeSetsStore.createIndex('name', 'name', { unique: false });
        routeSetsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// RUNの保存
export const saveRun = async (run: Run): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([RUNS_STORE], 'readwrite');
    const store = transaction.objectStore(RUNS_STORE);
    const request = store.put(run);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// RUNの取得（全件）
export const getAllRuns = async (): Promise<Run[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([RUNS_STORE], 'readonly');
    const store = transaction.objectStore(RUNS_STORE);
    const index = store.index('updatedAt');
    const request = index.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const runs = request.result as Run[];
      // 更新日時で降順ソート
      runs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      resolve(runs);
    };
  });
};

// RUNの取得（1件）
export const getRun = async (id: string): Promise<Run | undefined> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([RUNS_STORE], 'readonly');
    const store = transaction.objectStore(RUNS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// RUNの削除
export const deleteRun = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([RUNS_STORE], 'readwrite');
    const store = transaction.objectStore(RUNS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// ルートテンプレートの保存
export const saveRoute = async (route: Route): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ROUTES_STORE], 'readwrite');
    const store = transaction.objectStore(ROUTES_STORE);
    const request = store.put(route);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// ルートテンプレートの取得（全件、作成順を保持）
export const getAllRoutes = async (): Promise<Route[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ROUTES_STORE], 'readonly');
    const store = transaction.objectStore(ROUTES_STORE);
    // ID順で取得（IDはタイムスタンプベースなので作成順になる）
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const routes = request.result as Route[];
      // orderでソート（入力順を保持）
      routes.sort((a, b) => (a.order || 0) - (b.order || 0));
      resolve(routes);
    };
  });
};

// ルートテンプレートの削除
export const deleteRoute = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ROUTES_STORE], 'readwrite');
    const store = transaction.objectStore(ROUTES_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// ルートセットの保存
export const saveRouteSet = async (routeSet: RouteSet): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ROUTE_SETS_STORE], 'readwrite');
    const store = transaction.objectStore(ROUTE_SETS_STORE);
    const request = store.put(routeSet);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// ルートセットの取得（全件）
export const getAllRouteSets = async (): Promise<RouteSet[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ROUTE_SETS_STORE], 'readonly');
    const store = transaction.objectStore(ROUTE_SETS_STORE);
    const index = store.index('createdAt');
    const request = index.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const routeSets = request.result as RouteSet[];
      routeSets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(routeSets);
    };
  });
};

// ルートセットの取得（1件）
export const getRouteSet = async (id: string): Promise<RouteSet | undefined> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ROUTE_SETS_STORE], 'readonly');
    const store = transaction.objectStore(ROUTE_SETS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// ルートセットの削除
export const deleteRouteSet = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ROUTE_SETS_STORE], 'readwrite');
    const store = transaction.objectStore(ROUTE_SETS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// ID生成
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

