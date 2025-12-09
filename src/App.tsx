import { useState, useEffect } from 'react';
import { Run } from './types';
import { getAllRuns, generateId, getAllRoutes, saveRun } from './utils/indexedDB';
import { RouteForm } from './components/RouteForm';
import { RunList } from './components/RunList';
import { RunEditor } from './components/RunEditor';
import { Statistics } from './components/Statistics';

type ViewMode = 'home' | 'edit' | 'statistics';

function App() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const loadedRuns = await getAllRuns();
      setRuns(loadedRuns);
    } catch (error) {
      console.error('RUNの読み込みに失敗しました:', error);
    }
  };

  const handleCreateNewRun = async () => {
    try {
      const routes = await getAllRoutes();
      if (routes.length === 0) {
        alert('まずルート情報を登録してください');
        return;
      }

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '-');
      const runName = `${dateStr} RUN`;

      const newRun: Run = {
        id: generateId(),
        name: runName,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        routes: routes.map(route => ({
          routeId: route.id,
          routeName: route.name,
          hasRemaining: false,
          remainingCount: 0,
          comment: ''
        })),
        expectedEliteCount: 0,
        tsurumiShortage: 0,
        adlibAddition: 0
      };

      // 新規作成時にRUNを保存
      await saveRun(newRun);
      await loadRuns();
      setSelectedRun(newRun);
      setViewMode('edit');
    } catch (error) {
      console.error('RUNの作成に失敗しました:', error);
      alert('RUNの作成に失敗しました');
    }
  };

  const handleRunSelect = (run: Run) => {
    setSelectedRun(run);
    setViewMode('edit');
  };

  const handleRunSave = async () => {
    await loadRuns();
    setSelectedRun(null);
    setViewMode('home');
  };

  const handleRunCancel = () => {
    setSelectedRun(null);
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
          お残しは許しまへんday
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          狩り残し確認・記録ツール
        </p>
      </div>

      {/* ナビゲーション */}
      {viewMode !== 'edit' && (
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
          <div className="card" style={{ marginBottom: '20px' }}>
            <button
              onClick={handleCreateNewRun}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ➕ 新規作成
            </button>
          </div>
          <RouteForm onRouteAdded={loadRuns} />
          <RunList
            runs={runs}
            onRunSelect={handleRunSelect}
            onRunDeleted={loadRuns}
          />
        </>
      )}

      {viewMode === 'edit' && selectedRun && (
        <RunEditor
          run={selectedRun}
          onSave={handleRunSave}
          onCancel={handleRunCancel}
        />
      )}

      {viewMode === 'statistics' && (
        <Statistics runs={runs} />
      )}
    </div>
  );
}

export default App;
