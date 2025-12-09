import { Run, TAGS } from '../types';

interface StatisticsProps {
  runs: Run[];
}

interface RouteStats {
  routeId: string;
  routeName: string;
  totalRuns: number;
  remainingRuns: number;
  totalRemainingCount: number;
  lastRemainingDate: string | null;
}


export const Statistics = ({ runs }: StatisticsProps) => {
  if (runs.length === 0) {
    return (
      <div className="card">
        <p style={{ color: '#666', textAlign: 'center' }}>
          統計情報を表示するには、RUNデータが必要です。
        </p>
      </div>
    );
  }

  // ルートごとの統計を計算
  const routeStatsMap = new Map<string, RouteStats>();

  runs.forEach(run => {
    run.routes.forEach(routeRun => {
      const existing = routeStatsMap.get(routeRun.routeId);
      if (existing) {
        existing.totalRuns++;
        if (routeRun.hasRemaining) {
          existing.remainingRuns++;
          existing.totalRemainingCount += routeRun.remainingCount;
          const runDate = new Date(run.updatedAt);
          if (!existing.lastRemainingDate || new Date(existing.lastRemainingDate) < runDate) {
            existing.lastRemainingDate = run.updatedAt;
          }
        }
      } else {
        routeStatsMap.set(routeRun.routeId, {
          routeId: routeRun.routeId,
          routeName: routeRun.routeName,
          totalRuns: 1,
          remainingRuns: routeRun.hasRemaining ? 1 : 0,
          totalRemainingCount: routeRun.hasRemaining ? routeRun.remainingCount : 0,
          lastRemainingDate: routeRun.hasRemaining ? run.updatedAt : null
        });
      }
    });
  });

  const routeStats = Array.from(routeStatsMap.values());

  // タグの統計を計算
  const tagStatsMap = new Map<string, number>();
  runs.forEach(run => {
    run.routes.forEach(routeRun => {
      if (routeRun.hasRemaining && routeRun.comment) {
        TAGS.forEach(tag => {
          if (routeRun.comment.includes(tag)) {
            tagStatsMap.set(tag, (tagStatsMap.get(tag) || 0) + 1);
          }
        });
      }
    });
  });

  const tagStats = Array.from(tagStatsMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // 各種TOP3を計算
  const recentRemaining = routeStats
    .filter(rs => rs.lastRemainingDate)
    .sort((a, b) => new Date(b.lastRemainingDate!).getTime() - new Date(a.lastRemainingDate!).getTime())
    .slice(0, 3);

  const frequentRemaining = routeStats
    .filter(rs => rs.remainingRuns > 0)
    .sort((a, b) => {
      const rateA = a.remainingRuns / a.totalRuns;
      const rateB = b.remainingRuns / b.totalRuns;
      return rateB - rateA;
    })
    .slice(0, 3);

  const highRemainingCount = routeStats
    .filter(rs => rs.totalRemainingCount > 0)
    .sort((a, b) => b.totalRemainingCount - a.totalRemainingCount)
    .slice(0, 3);

  const rareRemaining = routeStats
    .filter(rs => rs.remainingRuns > 0 && rs.totalRuns > 3)
    .sort((a, b) => {
      const rateA = a.remainingRuns / a.totalRuns;
      const rateB = b.remainingRuns / b.totalRuns;
      return rateA - rateB;
    })
    .slice(0, 3);

  const topTags = tagStats.slice(0, 3);

  const renderTop3 = (title: string, items: RouteStats[], renderItem: (item: RouteStats, index: number) => React.ReactNode) => (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '20px' }}>{title}</h3>
      {items.length === 0 ? (
        <p style={{ color: '#666', fontSize: '14px' }}>データがありません</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, index) => (
            <div
              key={item.routeId}
              style={{
                padding: '12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '2px solid #e0e0e0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {index + 1}
                </div>
                {renderItem(item, index)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* 直近で狩り残したルート */}
      {renderTop3('直近で狩り残したルート', recentRemaining, (item) => (
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
            {item.routeName}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            最終: {item.lastRemainingDate ? new Date(item.lastRemainingDate).toLocaleDateString('ja-JP') : '-'}
          </div>
        </div>
      ))}

      {/* 狩り残しが頻発しているルート */}
      {renderTop3('狩り残しが頻発しているルート', frequentRemaining, (item) => {
        const rate = ((item.remainingRuns / item.totalRuns) * 100).toFixed(1);
        return (
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
              {item.routeName}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {item.remainingRuns}回 / {item.totalRuns}回 ({rate}%)
            </div>
          </div>
        );
      })}

      {/* 狩り残しが多かったルート */}
      {renderTop3('狩り残しが多かったルート', highRemainingCount, (item) => (
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
            {item.routeName}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            合計 {item.totalRemainingCount}体
          </div>
        </div>
      ))}

      {/* 珍しく狩り残したルート */}
      {renderTop3('珍しく狩り残したルート', rareRemaining, (item) => {
        const rate = ((item.remainingRuns / item.totalRuns) * 100).toFixed(1);
        return (
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
              {item.routeName}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {item.remainingRuns}回 / {item.totalRuns}回 ({rate}%)
            </div>
          </div>
        );
      })}

      {/* タグの頻出TOP3 */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '20px' }}>
          タグの頻出TOP3（狩り残しの理由）
        </h3>
        {topTags.length === 0 ? (
          <p style={{ color: '#666', fontSize: '14px' }}>データがありません</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topTags.map((tagStat, index) => (
              <div
                key={tagStat.tag}
                style={{
                  padding: '12px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                      {tagStat.tag}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {tagStat.count}回使用
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
