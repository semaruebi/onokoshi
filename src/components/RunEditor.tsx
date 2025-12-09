// RunEditor.tsx: コンプリート演出とマイクロインタラクションを追加
import { useState, useEffect } from 'react';
import { Run, RouteRun, TAGS } from '../types';
import { saveRun, getAllRoutes } from '../utils/indexedDB';
import { showSuccessFeedback } from '../utils/feedback';

interface RunEditorProps {
  run: Run;
  onSave: () => void;
  onCancel: () => void;
}

export const RunEditor = ({ run, onSave, onCancel }: RunEditorProps) => {
  const [runName, setRunName] = useState(run.name);
  const [expectedEliteCount, setExpectedEliteCount] = useState(run.expectedEliteCount);
  const [tsurumiShortage, setTsurumiShortage] = useState(run.tsurumiShortage);
  const [adlibAddition, setAdlibAddition] = useState(run.adlibAddition);
  const [routeRuns, setRouteRuns] = useState<RouteRun[]>(run.routes);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    loadRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoutes = async () => {
    try {
      const routes = await getAllRoutes();
      // 既存のルートRUNがない場合は、全ルートをデフォルトで追加
      if (routeRuns.length === 0 && routes.length > 0) {
        const defaultRouteRuns: RouteRun[] = routes.map(route => ({
          routeId: route.id,
          routeName: route.name,
          hasRemaining: false,
          remainingCount: 0,
          comment: ''
        }));
        setRouteRuns(defaultRouteRuns);
      }
    } catch (error) {
      console.error('ルートの読み込みに失敗しました:', error);
    }
  };

  const toggleRemaining = (routeId: string) => {
    setRouteRuns(prev => prev.map(rr => 
      rr.routeId === routeId
        ? { ...rr, hasRemaining: !rr.hasRemaining, remainingCount: !rr.hasRemaining ? 1 : 0 }
        : rr
    ));
  };

  const updateRemainingCount = (routeId: string, count: number) => {
    setRouteRuns(prev => prev.map(rr => 
      rr.routeId === routeId ? { ...rr, remainingCount: count } : rr
    ));
  };

  const updateComment = (routeId: string, comment: string) => {
    setRouteRuns(prev => prev.map(rr => 
      rr.routeId === routeId ? { ...rr, comment } : rr
    ));
  };

  const addTagToComment = (routeId: string, tag: string) => {
    const routeRun = routeRuns.find(rr => rr.routeId === routeId);
    if (routeRun) {
      const currentComment = routeRun.comment || '';
      const newComment = currentComment ? `${currentComment} ${tag}` : tag;
      updateComment(routeId, newComment);
    }
  };

  const handleSave = async () => {
    try {
      const updatedRun: Run = {
        ...run,
        name: runName,
        expectedEliteCount,
        tsurumiShortage,
        adlibAddition,
        routes: routeRuns,
        updatedAt: new Date().toISOString()
      };
      await saveRun(updatedRun);
      
      // コンプリート判定（仮残しゼロの場合）
      const totalRemaining = routeRuns.reduce((sum, rr) => sum + rr.remainingCount, 0);
      if (totalRemaining === 0) {
        setIsCompleted(true);
        // コンプリート時のフィードバック
        showSuccessFeedback('🎉 おめでとうございます！狩り残しゼロで完了しました！');
        setTimeout(() => {
          onSave();
        }, 2000);
      } else {
        showSuccessFeedback('保存しました！');
        onSave();
      }
    } catch (error) {
      console.error('RUNの保存に失敗しました:', error);
      alert('RUNの保存に失敗しました');
    }
  };

  const totalRemaining = routeRuns.reduce((sum, rr) => sum + rr.remainingCount, 0);
  const finalCount = expectedEliteCount - totalRemaining - tsurumiShortage + adlibAddition;

  return (
    <div className={isCompleted ? 'animate-pop-in' : 'animate-slide-in'}>
      {/* ヘッダー */}
      <div className="card" style={{ marginBottom: '24px', position: 'sticky', top: '20px', zIndex: 100, border: '1px solid var(--primary-100)', boxShadow: '0 8px 32px rgba(139, 95, 191, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <input
            type="text"
            value={runName}
            onChange={(e) => setRunName(e.target.value)}
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              border: 'none',
              background: 'transparent',
              borderBottom: '2px solid transparent',
              borderRadius: '8px',
              padding: '8px 12px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: 'none',
              color: 'var(--text-100)',
              marginLeft: '-12px'
            }}
            onFocus={(e) => {
              e.target.style.borderBottom = '2px solid var(--primary-100)';
              e.target.style.backgroundColor = 'var(--bg-100)';
            }}
            onBlur={(e) => {
              e.target.style.borderBottom = '2px solid transparent';
              e.target.style.backgroundColor = 'transparent';
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onCancel}
              className="secondary-button"
              style={{ minHeight: '44px', padding: '0 20px' }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="primary-button"
              style={{ minHeight: '44px', padding: '0 24px' }}
            >
              保存する
            </button>
          </div>
        </div>

        {/* 最終結果 - ピーク・エンドの法則: 最も重要な情報を強調 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          background: `linear-gradient(135deg, var(--bg-200) 0%, var(--bg-100) 100%)`,
          borderRadius: '20px',
          border: 'none',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)',
          marginBottom: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-200)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em' }}>
              FINAL COUNT
            </div>
            <div style={{ 
              fontSize: '64px', 
              fontWeight: '800', 
              background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--accent-200) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1',
              marginBottom: '8px',
              fontFamily: 'Segoe UI, Roboto, sans-serif'
            }}>
              {finalCount}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-300)', 
              fontFamily: 'monospace', 
              background: 'var(--bg-300)',
              padding: '4px 12px',
              borderRadius: '12px',
              display: 'inline-block'
            }}>
              {expectedEliteCount} (想定) - {totalRemaining} (残) - {tsurumiShortage} (不足) + {adlibAddition} (追加)
            </div>
          </div>
        </div>

        {/* 入力フィールド - グリッドレイアウトで整理 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}>
          <div>
            <label style={{ fontSize: '13px' }}>想定精鋭数</label>
            <input
              type="number"
              value={expectedEliteCount}
              onChange={(e) => setExpectedEliteCount(parseInt(e.target.value) || 0)}
              style={{ textAlign: 'center', fontWeight: 'bold' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px' }}>狩り残し総数</label>
            <div style={{ 
              padding: '14px 16px', 
              background: totalRemaining > 0 ? 'rgba(255, 107, 107, 0.1)' : 'rgba(76, 175, 80, 0.1)', 
              borderRadius: '12px', 
              color: totalRemaining > 0 ? '#FF6B6B' : '#4CAF50', 
              fontWeight: 'bold',
              border: '1px solid transparent',
              textAlign: 'center',
              fontSize: '16px'
            }}>
              {totalRemaining}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px' }}>鶴観不足分</label>
            <input
              type="number"
              value={tsurumiShortage}
              onChange={(e) => setTsurumiShortage(parseInt(e.target.value) || 0)}
              style={{ textAlign: 'center' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px' }}>アドリブ追加数</label>
            <input
              type="number"
              value={adlibAddition}
              onChange={(e) => setAdlibAddition(parseInt(e.target.value) || 0)}
              style={{ textAlign: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* ルート一覧 */}
      <div className="card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--text-100)', fontSize: '18px', fontWeight: 'bold' }}>
            📍 チェックリスト
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-200)' }}>
            残り: {routeRuns.filter(r => !r.hasRemaining).length} / {routeRuns.length}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {routeRuns.map((routeRun) => (
            <div
              key={routeRun.routeId}
              className="route-item"
              onClick={() => toggleRemaining(routeRun.routeId)}
              style={{
                padding: '16px 20px',
                border: '2px solid',
                borderColor: routeRun.hasRemaining ? 'var(--primary-100)' : 'transparent',
                borderRadius: '16px',
                backgroundColor: routeRun.hasRemaining ? 'var(--bg-100)' : 'var(--bg-200)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: routeRun.hasRemaining ? '0 4px 12px rgba(139, 95, 191, 0.1)' : 'none',
                userSelect: 'none',
                opacity: !routeRun.hasRemaining ? 0.8 : 1
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.99)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: routeRun.hasRemaining ? '700' : '500',
                  color: routeRun.hasRemaining ? 'var(--primary-100)' : 'var(--text-200)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    border: routeRun.hasRemaining ? 'none' : '2px solid var(--text-300)',
                    background: routeRun.hasRemaining ? 'var(--primary-100)' : 'transparent',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {routeRun.hasRemaining && '❌'}
                  </div>
                  {routeRun.routeName}
                </div>
              </div>

              {routeRun.hasRemaining && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    marginTop: '16px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid var(--bg-300)', 
                    animation: 'fadeIn 0.3s ease-out',
                    cursor: 'default'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: '0 0 100px' }}>
                      <label style={{ fontSize: '12px', marginBottom: '6px' }}>狩り残し数</label>
                      <input
                        type="number"
                        min="0"
                        value={routeRun.remainingCount}
                        onChange={(e) => updateRemainingCount(routeRun.routeId, parseInt(e.target.value) || 0)}
                        style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', marginBottom: '6px' }}>メモ・理由</label>
                      <input
                        type="text"
                        value={routeRun.comment}
                        onChange={(e) => updateComment(routeRun.routeId, e.target.value)}
                        placeholder="タップして入力..."
                        style={{ padding: '10px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', marginBottom: '8px' }}>クイックタグ</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation();
                            addTagToComment(routeRun.routeId, tag);
                          }}
                          style={{
                            background: 'var(--bg-300)',
                            color: 'var(--text-200)',
                            padding: '6px 12px',
                            fontSize: '12px',
                            borderRadius: '20px',
                            border: '1px solid var(--bg-300)',
                            minHeight: '32px',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--accent-100)';
                            e.currentTarget.style.color = 'var(--primary-200)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bg-300)';
                            e.currentTarget.style.color = 'var(--text-200)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
