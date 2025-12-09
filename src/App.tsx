import { useState, useEffect } from 'react';
import { Run, RouteSet } from './types';
import { getAllRuns, generateId, getAllRouteSets, saveRun } from './utils/indexedDB';
import { RouteSetForm } from './components/RouteSetForm';
import { RouteSetSelector } from './components/RouteSetSelector';
import { RunList } from './components/RunList';
import { RunEditor } from './components/RunEditor';
import { Statistics } from './components/Statistics';

type ViewMode = 'home' | 'edit' | 'statistics' | 'selectRouteSet';

function App() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [routeSets, setRouteSets] = useState<RouteSet[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadRuns();
    loadRouteSets();
    // テーマをローカルストレージから読み込み
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const loadRuns = async () => {
    try {
      const loadedRuns = await getAllRuns();
      setRuns(loadedRuns);
    } catch (error) {
      console.error('RUNの読み込みに失敗しました:', error);
    }
  };

  const loadRouteSets = async () => {
    try {
      const loadedRouteSets = await getAllRouteSets();
      setRouteSets(loadedRouteSets);
    } catch (error) {
      console.error('ルートセットの読み込みに失敗しました:', error);
    }
  };

  const handleCreateNewRun = () => {
    if (routeSets.length === 0) {
      alert('まずルートセットを登録してください');
      return;
    }
    setViewMode('selectRouteSet');
  };

  const handleRouteSetSelect = async (routeSet: RouteSet) => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '-');
      const runName = `${dateStr} ${routeSet.name}`;

      const newRun: Run = {
        id: generateId(),
        name: runName,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        routes: routeSet.routes.map(route => ({
          routeId: route.id,
          routeName: route.name,
          hasRemaining: false,
          remainingCount: 0,
          comment: ''
        })),
        expectedEliteCount: routeSet.expectedEliteCount || 0,
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
    <div style={{ paddingTop: '8px' }}>
      {/* ヘッダー */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <div 
          onClick={() => {
            setViewMode('home');
            setSelectedRun(null);
          }}
          style={{ 
            textAlign: 'center', 
            cursor: 'pointer',
            transition: 'all 0.2s',
            padding: '16px 20px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, var(--primary-100) 0%, var(--accent-200) 100%)`,
            boxShadow: '0 4px 16px rgba(139, 95, 191, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 95, 191, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 95, 191, 0.3)';
          }}
        >
          <h1 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: 'bold', color: 'var(--primary-300)' }}>
            お残しは許しまへんday
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--primary-300)', opacity: 0.9 }}>
            狩り残し確認・記録ツール
          </p>
        </div>
        
        {/* テーマ切り替えボタン - ヘッダーの下に配置 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
          style={{
            position: 'absolute',
            bottom: '-20px',
            right: '16px',
            zIndex: 10,
            background: 'var(--bg-300)',
            border: '2px solid var(--accent-100)',
            borderRadius: '20px',
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: 'var(--text-100)',
            fontSize: '12px',
            fontWeight: '600',
            minHeight: '36px'
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
          <span>{theme === 'light' ? '常夜' : '白夜'}</span>
        </button>
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
              backgroundColor: viewMode === 'home' ? 'var(--primary-100)' : 'var(--bg-200)',
              color: viewMode === 'home' ? 'var(--primary-300)' : 'var(--text-200)',
              border: viewMode === 'home' ? 'none' : '1px solid var(--accent-100)'
            }}
          >
            🏠 ホーム
          </button>
          <button
            onClick={() => setViewMode('statistics')}
            style={{
              backgroundColor: viewMode === 'statistics' ? 'var(--primary-100)' : 'var(--bg-200)',
              color: viewMode === 'statistics' ? 'var(--primary-300)' : 'var(--text-200)',
              border: viewMode === 'statistics' ? 'none' : '1px solid var(--accent-100)'
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
              className="primary-button"
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold' }}
            >
              ➕ 新規作成
            </button>
          </div>
          <RouteSetForm onRouteSetAdded={loadRouteSets} />
          <RunList
            runs={runs}
            onRunSelect={handleRunSelect}
            onRunDeleted={loadRuns}
          />
        </>
      )}

      {viewMode === 'selectRouteSet' && (
        <RouteSetSelector
          routeSets={routeSets}
          onSelect={handleRouteSetSelect}
          onCancel={() => setViewMode('home')}
          onRouteSetDeleted={loadRouteSets}
        />
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
