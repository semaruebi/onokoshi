import { Run } from '../types';
import { deleteRun } from '../utils/indexedDB';
import { showImmediateFeedback } from '../utils/feedback';

interface RunListProps {
  runs: Run[];
  onRunSelect: (run: Run) => void;
  onRunDeleted: () => void;
}

export const RunList = ({ runs, onRunSelect, onRunDeleted }: RunListProps) => {
  const handleDelete = async (e: React.MouseEvent, runId: string) => {
    e.stopPropagation();
    if (confirm('このRUNを削除しますか？')) {
      try {
        await deleteRun(runId);
        onRunDeleted();
      } catch (error) {
        console.error('RUNの削除に失敗しました:', error);
        alert('RUNの削除に失敗しました');
      }
    }
  };

  if (runs.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-200)', borderStyle: 'dashed' }}>
        <p style={{ color: 'var(--text-200)', fontSize: '16px', fontWeight: 600 }}>
          まだ記録がありません 📝
        </p>
        <p style={{ color: 'var(--text-200)', fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
          「新規作成」ボタンから今日の結果を確認しましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
        <h2 style={{ color: 'var(--text-100)', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 狩り残しの記録
          <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-200)', background: 'var(--bg-200)', padding: '2px 8px', borderRadius: '12px' }}>
            {runs.length}件
          </span>
        </h2>
      </div>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {runs.map((run) => {
          const remainingCount = run.routes
            .filter(r => r.hasRemaining)
            .reduce((sum, r) => sum + r.remainingCount, 0);
          const totalRemaining = run.routes.filter(r => r.hasRemaining).length;
          
          // 日付フォーマット
          const date = new Date(run.updatedAt);
          const dateStr = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });
          const timeStr = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={run.id}
              onClick={(e) => {
                showImmediateFeedback(e.currentTarget as HTMLElement);
                onRunSelect(run);
              }}
              className="selectable-card"
              style={{
                padding: '16px 20px',
                borderRadius: '16px',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-300)',
                border: '1px solid var(--bg-200)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-100)' }}>
                    {run.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-200)', fontFamily: 'monospace' }}>
                    {dateStr} {timeStr}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-200)' }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: remainingCount > 0 ? '#FF6B6B' : '#4CAF50',
                      flexShrink: 0
                    }} />
                    {remainingCount > 0 ? (
                      <span>狩り残し <strong style={{ color: '#FF6B6B' }}>{remainingCount}</strong> 体</span>
                    ) : (
                      <span style={{ color: '#4CAF50', fontWeight: '600' }}>かんぺき！</span>
                    )}
                  </div>
                  
                  {totalRemaining > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-200)', marginLeft: '14px' }}>
                      {run.routes.filter(r => r.hasRemaining).slice(0, 3).map(r => r.routeName).join('、')}
                      {totalRemaining > 3 && ` 他${totalRemaining - 3}件`}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(e, run.id)}
                className="icon-button"
                style={{
                  background: 'transparent',
                  color: 'var(--text-300)',
                  padding: '8px',
                  borderRadius: '50%',
                  minHeight: 'auto',
                  boxShadow: 'none',
                  opacity: 0.6
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-100)';
                  e.currentTarget.style.color = '#FF6B6B';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-300)';
                  e.currentTarget.style.opacity = '0.6';
                }}
                title="削除"
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
