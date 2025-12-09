import { CheckHistory } from '../types';

interface HistoryViewProps {
  histories: CheckHistory[];
}

export const HistoryView = ({ histories }: HistoryViewProps) => {
  if (histories.length === 0) {
    return (
      <div className="card">
        <p style={{ color: '#666', textAlign: 'center' }}>
          まだチェック履歴がありません。
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', color: '#333' }}>📈 チェック履歴</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {histories.map((history) => {
          const remainingCount = history.results.filter(r => r.hasRemaining).length;
          const totalCount = history.results.length;
          const remainingRate = totalCount > 0 ? (remainingCount / totalCount) * 100 : 0;

          return (
            <div
              key={history.id}
              style={{
                padding: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ marginBottom: '4px', color: '#333' }}>{history.routeName}</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {new Date(history.date).toLocaleString('ja-JP')}
                </p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                  狩り残し: {remainingCount} / {totalCount} ({remainingRate.toFixed(1)}%)
                </p>
              </div>

              <div style={{ marginTop: '12px' }}>
                {history.results.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px',
                      marginBottom: '8px',
                      backgroundColor: result.hasRemaining ? '#ffe0e0' : '#e8f5e9',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#333' }}>
                        {result.hasRemaining ? '❌' : '✅'} {result.groupName}
                      </span>
                    </div>
                    {result.hasRemaining && result.memo && (
                      <div style={{ marginTop: '4px', paddingLeft: '24px', color: '#666', fontSize: '13px' }}>
                        💬 {result.memo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


