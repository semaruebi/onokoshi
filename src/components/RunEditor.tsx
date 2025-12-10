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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
        showSuccessFeedback('🎉 狩り残しなし！　えらい！');
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
      {/* メインカード - スクロール追従 */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '16px', 
          border: '1px solid var(--primary-100)', 
          boxShadow: '0 4px 16px rgba(139, 95, 191, 0.1)', 
          padding: '16px',
          position: 'sticky',
          top: '8px',
          zIndex: 100,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'var(--bg-300)'
        }}
      >
        {/* ボタンバー */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '12px',
          justifyContent: 'flex-end',
          flexWrap: 'nowrap'
        }}>
          <button
            onClick={onCancel}
            className="secondary-button"
            style={{ minHeight: '36px', padding: '0 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="primary-button"
            style={{ minHeight: '36px', padding: '0 18px', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            保存
          </button>
        </div>
        {/* RUN名 */}
        <input
          type="text"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            background: 'var(--bg-100)',
            borderRadius: '8px',
            padding: '10px 12px',
            width: '100%',
            boxShadow: 'none',
            color: 'var(--text-100)',
            marginBottom: '16px'
          }}
        />

        {/* 最終結果 - コンパクト版 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          background: `linear-gradient(135deg, var(--bg-200) 0%, var(--bg-100) 100%)`,
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-200)', marginBottom: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>
              FINAL COUNT
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--accent-200) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1',
              marginBottom: '4px'
            }}>
              {finalCount}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--text-300)', 
              fontFamily: 'monospace'
            }}>
              {expectedEliteCount} - {totalRemaining} - {tsurumiShortage} + {adlibAddition}
            </div>
          </div>
        </div>

        {/* 入力フィールド - 2x2グリッド */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
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
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ color: 'var(--text-100)', fontSize: '18px', fontWeight: 'bold' }}>
            📍 チェックリスト
          </h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {renderGroupedRoutes()}
        </div>
      </div>
    </div>
  );

  // グループ化されたルートを表示
  function renderGroupedRoutes() {
    // グループを抽出
    const groups = new Map<string, RouteRun[]>();
    const ungrouped: RouteRun[] = [];
    
    routeRuns.forEach(rr => {
      if (rr.groupName) {
        if (!groups.has(rr.groupName)) {
          groups.set(rr.groupName, []);
        }
        groups.get(rr.groupName)!.push(rr);
      } else {
        ungrouped.push(rr);
      }
    });

    const elements: React.ReactNode[] = [];

    // グループがない場合は従来通り表示
    if (groups.size === 0) {
      return routeRuns.map(rr => renderRouteItem(rr));
    }

    // ルートを順番に処理し、グループヘッダーを挿入
    const processedGroups = new Set<string>();
    
    routeRuns.forEach((rr, idx) => {
      if (rr.groupName && !processedGroups.has(rr.groupName)) {
        // グループヘッダーを追加
        const groupRoutes = groups.get(rr.groupName) || [];
        const groupRemaining = groupRoutes.reduce((sum, r) => sum + r.remainingCount, 0);
        const isCollapsed = collapsedGroups.has(rr.groupName);

        elements.push(
          <div key={`group-${rr.groupName}`} style={{ marginTop: idx > 0 ? '8px' : 0 }}>
            {/* グループヘッダー */}
            <div
              onClick={() => {
                const newCollapsed = new Set(collapsedGroups);
                if (isCollapsed) {
                  newCollapsed.delete(rr.groupName!);
                } else {
                  newCollapsed.add(rr.groupName!);
                }
                setCollapsedGroups(newCollapsed);
              }}
              style={{
                padding: '10px 14px',
                background: 'var(--accent-100)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: isCollapsed ? 0 : '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>{isCollapsed ? '▶' : '▼'}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-100)', fontSize: '14px' }}>
                  {rr.groupName}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-200)' }}>
                  ({groupRoutes.length})
                </span>
              </div>
              {groupRemaining > 0 && (
                <span style={{ 
                  background: '#FF6B6B', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {groupRemaining}
                </span>
              )}
            </div>

            {/* グループ内のルート */}
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '12px', borderLeft: '2px solid var(--accent-100)' }}>
                {groupRoutes.map(r => renderRouteItem(r))}
              </div>
            )}
          </div>
        );

        processedGroups.add(rr.groupName);
      } else if (!rr.groupName) {
        // グループなしのルート
        elements.push(renderRouteItem(rr));
      }
    });

    return elements;
  }

  // 個別のルートアイテムを表示
  function renderRouteItem(routeRun: RouteRun) {
    return (
      <div
        key={routeRun.routeId}
        className="route-item"
        onClick={() => toggleRemaining(routeRun.routeId)}
        style={{
          padding: '12px 14px',
          border: '1px solid',
          borderColor: routeRun.hasRemaining ? 'var(--primary-100)' : 'var(--bg-200)',
          borderRadius: '10px',
          backgroundColor: routeRun.hasRemaining ? 'var(--bg-100)' : 'var(--bg-300)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%', 
            background: routeRun.hasRemaining ? '#FF6B6B' : '#4CAF50',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {routeRun.hasRemaining ? '✕' : '✓'}
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: routeRun.hasRemaining ? '600' : '400',
            color: routeRun.hasRemaining ? 'var(--primary-100)' : 'var(--text-100)'
          }}>
            {routeRun.routeName}
          </span>
        </div>

        {routeRun.hasRemaining && (
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: '1px solid var(--bg-200)', 
              cursor: 'default'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 70px' }}>
                <label style={{ fontSize: '11px', marginBottom: '4px', color: 'var(--text-100)', fontWeight: 'bold', display: 'block' }}>残数</label>
                <input
                  type="number"
                  min="0"
                  value={routeRun.remainingCount}
                  onChange={(e) => updateRemainingCount(routeRun.routeId, parseInt(e.target.value) || 0)}
                  style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    fontSize: '14px',
                    background: 'var(--bg-200)',
                    color: 'var(--text-100)',
                    border: '1px solid var(--primary-100)',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ fontSize: '11px', marginBottom: '4px', color: 'var(--text-100)', fontWeight: 'bold', display: 'block' }}>メモ</label>
                <input
                  type="text"
                  value={routeRun.comment}
                  onChange={(e) => updateComment(routeRun.routeId, e.target.value)}
                  placeholder="理由、精鋭名など..."
                  style={{ 
                    padding: '8px',
                    background: 'var(--bg-200)',
                    color: 'var(--text-100)',
                    border: '1px solid var(--accent-100)',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    addTagToComment(routeRun.routeId, tag);
                  }}
                  style={{
                    background: 'var(--bg-200)',
                    color: 'var(--text-100)',
                    padding: '4px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid var(--accent-100)',
                    minHeight: '26px'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
};
