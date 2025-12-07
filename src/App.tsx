import { useState, useEffect } from 'react';
import { Route, CheckHistory } from './types';
import { loadRoutes, loadHistories } from './utils/storage';
import { RouteForm } from './components/RouteForm';
import { RouteList } from './components/RouteList';
import { CheckInterface } from './components/CheckInterface';
import { HistoryView } from './components/HistoryView';
import { Statistics } from './components/Statistics';

type ViewMode = 'home' | 'check' | 'history' | 'statistics';

function App() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [histories, setHistories] = useState<CheckHistory[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');

  useEffect(() => {
    setRoutes(loadRoutes());
    setHistories(loadHistories());
  }, []);

  const refreshRoutes = () => {
    setRoutes(loadRoutes());
  };

  const refreshHistories = () => {
    setHistories(loadHistories());
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setViewMode('check');
  };

  const handleCheckComplete = () => {
    setSelectedRoute(null);
    setViewMode('home');
    refreshHistories();
  };

  const handleCheckCancel = () => {
    setSelectedRoute(null);
    setViewMode('home');
  };

  return (
    <div>
      {/* ヘッダー */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: 'bold' }}>
          🎯 狩り残し確認チェッカー
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          精鋭狩りRTAの狩り残しを効率的にチェック・記録
        </p>
      </div>

      {/* ナビゲーション */}
      {viewMode !== 'check' && (
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setViewMode('home')}
            style={{
              backgroundColor: viewMode === 'home' ? '#667eea' : '#999',
              color: 'white'
            }}
          >
            🏠 ホーム
          </button>
          <button
            onClick={() => setViewMode('history')}
            style={{
              backgroundColor: viewMode === 'history' ? '#667eea' : '#999',
              color: 'white'
            }}
          >
            📈 履歴
          </button>
          <button
            onClick={() => setViewMode('statistics')}
            style={{
              backgroundColor: viewMode === 'statistics' ? '#667eea' : '#999',
              color: 'white'
            }}
          >
            📊 統計
          </button>
        </div>
      )}

      {/* コンテンツ */}
      {viewMode === 'home' && (
        <>
          <RouteForm onRouteAdded={refreshRoutes} />
          <RouteList
            routes={routes}
            onRouteSelect={handleRouteSelect}
            onRouteDeleted={refreshRoutes}
          />
        </>
      )}

      {viewMode === 'check' && selectedRoute && (
        <CheckInterface
          route={selectedRoute}
          onComplete={handleCheckComplete}
          onCancel={handleCheckCancel}
        />
      )}

      {viewMode === 'history' && (
        <HistoryView histories={histories} />
      )}

      {viewMode === 'statistics' && (
        <Statistics histories={histories} />
      )}
    </div>
  );
}

export default App;

