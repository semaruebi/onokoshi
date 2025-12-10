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
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-glass)', borderStyle: 'dashed', borderColor: 'var(--border-glass)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📝</div>
        <p style={{ color: 'var(--text-100)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          まだ記録がありません
        </p>
        <p style={{ color: 'var(--text-200)', fontSize: '14px', maxWidth: '300px', margin: '0 auto', lineHeight: '1.6' }}>
          「新規作成」ボタンから、今日のハントの記録を始めましょう！
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '0 8px' }}>
        <h2 style={{ color: 'var(--text-100)', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
          📋 狩り残しの記録
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-200)', background: 'var(--accent-100)', padding: '4px 12px', borderRadius: '16px' }}>
            {runs.length}件
          </span>
        </h2>
      </div>
      
      <div style={{ display: 'grid', gap: '16px' }}>
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
