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
      // ピーク・エンドの法則: 保存成功時にポジティブなフィードバック
      showSuccessFeedback('保存しました！');
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
              className="secondary-button"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="primary-button"
            >
              保存
            </button>
          </div>
        </div>

        {/* 合計表示 - ゲシュタルト原則（近接・同類）に基づいてグループ化 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
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
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6b9d' }}>
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

        {/* 最終結果 - ピーク・エンドの法則: 重要な情報を強調 */}
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffeef0 100%)',
          borderRadius: '12px',
          border: '2px solid #ff9a9e',
          boxShadow: '0 2px 12px rgba(255, 154, 158, 0.2)'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 600 }}>
            最終結果
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff6b9d', marginBottom: '4px' }}>
            {finalCount}
          </div>
          <div style={{ fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
            {expectedEliteCount} - {totalRemaining} - {tsurumiShortage} + {adlibAddition}
          </div>
        </div>
      </div>

      {/* ルート一覧 - ミラーの法則: 7±2個のチャンクでグループ化 */}
      <div className="card">
        <h2 style={{ marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>ルート一覧</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '70vh', overflowY: 'auto' }}>
          {routeRuns.map((routeRun) => (
            <div
              key={routeRun.routeId}
              onClick={() => toggleRemaining(routeRun.routeId)}
              style={{
                padding: '8px 12px',
                border: '2px solid',
                borderColor: routeRun.hasRemaining ? '#ff9a9e' : 'rgba(255, 154, 158, 0.3)',
                borderRadius: '10px',
                backgroundColor: routeRun.hasRemaining ? '#fff5f5' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s',
                // ドハティの閾値: 即座の視覚的フィードバック
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = routeRun.hasRemaining ? '#ff6b9d' : '#ff9a9e';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = routeRun.hasRemaining ? '#ff9a9e' : 'rgba(255, 154, 158, 0.3)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: routeRun.hasRemaining ? '8px' : '0' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: routeRun.hasRemaining ? '#ff6b9d' : '#333'
                }}>
                  {routeRun.hasRemaining ? '❌' : '✅'} {routeRun.routeName}
                </div>
              </div>

              {routeRun.hasRemaining && (
                <div onClick={(e) => e.stopPropagation()}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                      仮残し数
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={routeRun.remainingCount}
                      onChange={(e) => updateRemainingCount(routeRun.routeId, parseInt(e.target.value) || 0)}
                      style={{ width: '80px', padding: '6px', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                      コメント
                    </label>
                    <textarea
                      value={routeRun.comment}
                      onChange={(e) => updateComment(routeRun.routeId, e.target.value)}
                      placeholder="コメントを入力..."
                      style={{ width: '100%', minHeight: '60px', padding: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
                      タグを追加
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation();
                            addTagToComment(routeRun.routeId, tag);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                            color: 'white',
                            padding: '4px 10px',
                            fontSize: '11px',
                            borderRadius: '6px',
                            boxShadow: '0 1px 4px rgba(255, 154, 158, 0.3)'
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

