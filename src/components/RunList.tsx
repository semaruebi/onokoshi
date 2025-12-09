import { Run } from '../types';
import { deleteRun } from '../utils/indexedDB';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {runs.map((run) => {
          const remainingCount = run.routes
            .filter(r => r.hasRemaining)
            .reduce((sum, r) => sum + r.remainingCount, 0);
          const totalRemaining = run.routes.filter(r => r.hasRemaining).length;

          return (
            <div
              key={run.id}
              onClick={() => onRunSelect(run)}
              style={{
                padding: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#f9f9f9'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.backgroundColor = '#f0f4ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = '#f9f9f9';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '8px', color: '#333' }}>{run.name}</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    仮残し: {remainingCount}体 / {totalRemaining}ルート
                  </p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {new Date(run.updatedAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, run.id)}
                  style={{
                    backgroundColor: '#ff4444',
                    color: 'white',
                    padding: '8px 16px',
                    fontSize: '14px'
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

