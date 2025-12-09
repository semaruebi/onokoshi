import { RouteSet } from '../types';

interface RouteSetSelectorProps {
  routeSets: RouteSet[];
  onSelect: (routeSet: RouteSet) => void;
  onCancel: () => void;
}

export const RouteSetSelector = ({ routeSets, onSelect, onCancel }: RouteSetSelectorProps) => {
  if (routeSets.length === 0) {
    return (
      <div className="card">
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '16px' }}>
          まだルートセットが登録されていません。
        </p>
        <button onClick={onCancel} className="secondary-button" style={{ width: '100%' }}>
          戻る
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>
        📋 ルートセットを選択
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {routeSets.map((routeSet) => (
          <div
            key={routeSet.id}
            onClick={() => onSelect(routeSet)}
            className="selectable-card"
              style={{
                padding: '12px',
                border: '2px solid var(--accent-100)',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-200)',
                transition: 'all 0.2s'
              }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-100)';
              e.currentTarget.style.backgroundColor = 'var(--accent-100)';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-100)';
              e.currentTarget.style.backgroundColor = 'var(--bg-200)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', marginBottom: '4px' }}>
              {routeSet.name}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {routeSet.routes.length}個のルート
            </div>
          </div>
        ))}
      </div>
      <button onClick={onCancel} className="secondary-button" style={{ width: '100%' }}>
        キャンセル
      </button>
    </div>
  );
};

