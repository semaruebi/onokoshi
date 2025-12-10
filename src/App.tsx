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
          comment: '',
          groupName: route.groupName
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* ヘッダー: 視線を集めるクリーンなデザイン */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '40px',
        textAlign: 'center',
        padding: '20px 0'
      }}>
        <div 
          onClick={() => {
            setViewMode('home');
            setSelectedRun(null);
          }}
          style={{ 
            display: 'inline-block',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h1 className="text-gradient" style={{ 
            fontSize: '32px', 
            marginBottom: '8px', 
            fontWeight: '900', 
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            お残しは許しまへんday
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: 'var(--text-200)', 
            fontWeight: '500' 
          }}>
            狩り残し確認・記録ツール
          </p>
        </div>
        
        {/* テーマ切り替え: 目立つデザイン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
          className="theme-toggle-button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '0',
            padding: '10px 20px',
            minHeight: 'auto',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: '700',
            background: theme === 'light' 
              ? 'linear-gradient(135deg, #7E57C2 0%, #5E35B1 100%)'
              : 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)',
            color: '#FFFFFF',
            border: theme === 'light' 
              ? '2px solid #5E35B1'
              : '2px solid #7C4DFF',
            boxShadow: theme === 'light'
              ? '0 4px 16px rgba(94, 53, 177, 0.4), 0 0 0 2px rgba(94, 53, 177, 0.1)'
              : '0 4px 16px rgba(124, 77, 255, 0.5), 0 0 0 2px rgba(124, 77, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            cursor: 'pointer',
            zIndex: 1000
          }}
          title={theme === 'light' ? '常夜モードへ' : '白夜モードへ'}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = theme === 'light'
              ? '0 6px 24px rgba(94, 53, 177, 0.6), 0 0 0 3px rgba(94, 53, 177, 0.2)'
              : '0 6px 24px rgba(124, 77, 255, 0.7), 0 0 0 3px rgba(124, 77, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = theme === 'light'
              ? '0 4px 16px rgba(94, 53, 177, 0.4), 0 0 0 2px rgba(94, 53, 177, 0.1)'
              : '0 4px 16px rgba(124, 77, 255, 0.5), 0 0 0 2px rgba(124, 77, 255, 0.2)';
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: '1' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
          <span style={{ fontWeight: '700', letterSpacing: '0.05em' }}>
            {theme === 'light' ? '常夜' : '白夜'}
          </span>
        </button>
      </div>

      {/* ナビゲーション: セグメンテッドコントロール風 */}
      {viewMode !== 'edit' && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '32px',
          background: 'var(--bg-200)',
          padding: '6px',
          borderRadius: '20px',
          width: 'fit-content',
          margin: '0 auto 32px'
        }}>
          <button
            onClick={() => setViewMode('home')}
            style={{
              backgroundColor: viewMode === 'home' ? 'var(--bg-100)' : 'transparent',
              color: viewMode === 'home' ? 'var(--primary-200)' : 'var(--text-200)',
              boxShadow: viewMode === 'home' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              borderRadius: '16px',
              padding: '10px 24px',
              minHeight: '44px',
              fontWeight: '700',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            🏠 ホーム
          </button>
          <button
            onClick={() => setViewMode('statistics')}
            style={{
              backgroundColor: viewMode === 'statistics' ? 'var(--bg-100)' : 'transparent',
              color: viewMode === 'statistics' ? 'var(--primary-200)' : 'var(--text-200)',
              boxShadow: viewMode === 'statistics' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              borderRadius: '16px',
              padding: '10px 24px',
              minHeight: '44px',
              fontWeight: '700',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            📊 統計
          </button>
        </div>
      )}

      {/* コンテンツ */}
      {viewMode === 'home' && (
        <>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <button
              onClick={handleCreateNewRun}
              className="primary-button"
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                fontSize: '18px', 
                padding: '20px',
                borderRadius: '24px',
                boxShadow: '0 8px 24px rgba(124, 77, 255, 0.25)'
              }}
            >
              <span>✨ 記録を始める</span>
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
