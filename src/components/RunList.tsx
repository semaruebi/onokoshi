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
      <div className="card">
        <p style={{ color: '#666', textAlign: 'center' }}>
          まだRUNが作成されていません。「新規作成」ボタンから作成してください。
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', color: '#333' }}>📋 RUN一覧</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {runs.map((run) => {
          const remainingCount = run.routes
            .filter(r => r.hasRemaining)
            .reduce((sum, r) => sum + r.remainingCount, 0);
          const totalRemaining = run.routes.filter(r => r.hasRemaining).length;

          return (
            <div
              key={run.id}
              onClick={(e) => {
                // ドハティの閾値: 即座の視覚的フィードバック
                showImmediateFeedback(e.currentTarget as HTMLElement);
                onRunSelect(run);
              }}
              style={{
                padding: '8px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#f9f9f9',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.backgroundColor = '#f0f4ff';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = '#f9f9f9';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                    {run.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    仮残し: {remainingCount}体 / {totalRemaining}ルート
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                    {new Date(run.updatedAt).toLocaleString('ja-JP')}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, run.id)}
                  style={{
                    backgroundColor: '#ff4444',
                    color: 'white',
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderRadius: '4px'
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

