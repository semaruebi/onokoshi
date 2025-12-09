import { useState, useEffect } from 'react';
import { Run, RouteRun, TAGS } from '../types';
import { saveRun, getAllRoutes } from '../utils/indexedDB';

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
      onSave();
    } catch (error) {
      console.error('RUNの保存に失敗しました:', error);
      alert('RUNの保存に失敗しました');
    }
  };

  const totalRemaining = routeRuns.reduce((sum, rr) => sum + rr.remainingCount, 0);
  const finalCount = expectedEliteCount - totalRemaining - tsurumiShortage + adlibAddition;

  return (
    <div>
      {/* ヘッダー */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <input
            type="text"
            value={runName}
            onChange={(e) => setRunName(e.target.value)}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              border: 'none',
              borderBottom: '2px solid #667eea',
              padding: '8px',
              width: '100%',
              maxWidth: '400px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onCancel}
              style={{ backgroundColor: '#999', color: 'white' }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              style={{ backgroundColor: '#4caf50', color: 'white' }}
            >
              保存
            </button>
          </div>
        </div>

        {/* 合計表示 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              想定精鋭数
            </label>
            <input
              type="number"
              value={expectedEliteCount}
              onChange={(e) => setExpectedEliteCount(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              狩り残し総数
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4444' }}>
              {totalRemaining}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              鶴観不足分
            </label>
            <input
              type="number"
              value={tsurumiShortage}
              onChange={(e) => setTsurumiShortage(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              アドリブ追加数
            </label>
            <input
              type="number"
              value={adlibAddition}
              onChange={(e) => setAdlibAddition(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>

        {/* 最終結果 */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          backgroundColor: '#f0f4ff',
          borderRadius: '12px',
          border: '3px solid #667eea'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            最終結果
          </div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#667eea' }}>
            {finalCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            {expectedEliteCount} - {totalRemaining} - {tsurumiShortage} + {adlibAddition}
          </div>
        </div>
      </div>

      {/* ルート一覧 */}
      <div className="card">
        <h2 style={{ marginBottom: '16px', color: '#333' }}>ルート一覧</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {routeRuns.map((routeRun) => (
            <div
              key={routeRun.routeId}
              style={{
                padding: '16px',
                border: '2px solid',
                borderColor: routeRun.hasRemaining ? '#ff4444' : '#e0e0e0',
                borderRadius: '8px',
                backgroundColor: routeRun.hasRemaining ? '#ffe0e0' : '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <button
                  onClick={() => toggleRemaining(routeRun.routeId)}
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: routeRun.hasRemaining ? '#ff4444' : '#333',
                    textAlign: 'left',
                    padding: 0
                  }}
                >
                  {routeRun.hasRemaining ? '❌' : '✅'} {routeRun.routeName}
                </button>
              </div>

              {routeRun.hasRemaining && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600 }}>
                      仮残し数
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={routeRun.remainingCount}
                      onChange={(e) => updateRemainingCount(routeRun.routeId, parseInt(e.target.value) || 0)}
                      style={{ width: '100px', padding: '8px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                      コメント
                    </label>
                    <textarea
                      value={routeRun.comment}
                      onChange={(e) => updateComment(routeRun.routeId, e.target.value)}
                      placeholder="コメントを入力..."
                      style={{ width: '100%', minHeight: '80px', padding: '8px' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>
                      タグを追加
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => addTagToComment(routeRun.routeId, tag)}
                          style={{
                            backgroundColor: '#667eea',
                            color: 'white',
                            padding: '6px 12px',
                            fontSize: '12px',
                            borderRadius: '4px'
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

