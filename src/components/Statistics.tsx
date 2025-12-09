import { CheckHistory } from '../types';

interface StatisticsProps {
  histories: CheckHistory[];
}

interface GroupStats {
  name: string;
  totalChecks: number;
  remainingCount: number;
  remainingRate: number;
  memos: string[];
}

export const Statistics = ({ histories }: StatisticsProps) => {
  if (histories.length === 0) {
    return (
      <div className="card">
        <p style={{ color: '#666', textAlign: 'center' }}>
          統計情報を表示するには、チェック履歴が必要です。
        </p>
      </div>
    );
  }

  // グループごとの統計を計算
  const groupStatsMap = new Map<string, GroupStats>();

  histories.forEach(history => {
    history.results.forEach(result => {
      const existing = groupStatsMap.get(result.groupName);
      if (existing) {
        existing.totalChecks++;
        if (result.hasRemaining) {
          existing.remainingCount++;
          if (result.memo) {
            existing.memos.push(result.memo);
          }
        }
        existing.remainingRate = (existing.remainingCount / existing.totalChecks) * 100;
      } else {
        groupStatsMap.set(result.groupName, {
          name: result.groupName,
          totalChecks: 1,
          remainingCount: result.hasRemaining ? 1 : 0,
          remainingRate: result.hasRemaining ? 100 : 0,
          memos: result.hasRemaining && result.memo ? [result.memo] : []
        });
      }
    });
  });

  const groupStats = Array.from(groupStatsMap.values())
    .sort((a, b) => b.remainingRate - a.remainingRate);

  // メモの頻出ワードを抽出（簡単な実装）
  const allMemos = histories.flatMap(h => 
    h.results.filter(r => r.hasRemaining && r.memo).map(r => r.memo)
  );

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', color: '#333' }}>📊 統計情報</h2>

      {/* グループ別の狩り残し率 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', color: '#555', fontSize: '18px' }}>
          精鋭グループ別の狩り残し率
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groupStats.map((stat) => (
            <div key={stat.name} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#333' }}>{stat.name}</span>
                <span style={{ color: '#666' }}>
                  {stat.remainingCount} / {stat.totalChecks} ({stat.remainingRate.toFixed(1)}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${stat.remainingRate}%`,
                    height: '100%',
                    backgroundColor: stat.remainingRate > 50 ? '#ff4444' : '#ffa500',
                    transition: 'width 0.3s'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* メモ一覧 */}
      {allMemos.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '12px', color: '#555', fontSize: '18px' }}>
            メモ一覧
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {allMemos.map((memo, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#666'
                }}
              >
                💬 {memo}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


