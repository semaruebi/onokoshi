import { RouteSet } from '../types';
import { deleteRouteSet } from '../utils/indexedDB';

interface RouteSetSelectorProps {
  routeSets: RouteSet[];
  onSelect: (routeSet: RouteSet) => void;
  onCancel: () => void;
  onRouteSetDeleted: () => void;
}

export const RouteSetSelector = ({ routeSets, onSelect, onCancel, onRouteSetDeleted }: RouteSetSelectorProps) => {
  const handleDelete = async (e: React.MouseEvent, routeSetId: string) => {
    e.stopPropagation();
    if (confirm('このルートセットを削除しますか？')) {
      try {
        await deleteRouteSet(routeSetId);
        onRouteSetDeleted();
      } catch (error) {
        console.error('ルートセットの削除に失敗しました:', error);
        alert('ルートセットの削除に失敗しました');
      }
    }
  };

  if (routeSets.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-200)', marginBottom: '24px', fontSize: '16px' }}>
          まだルートセットが登録されていません 🗺️
        </p>
        <button onClick={onCancel} className="secondary-button" style={{ width: '100%' }}>
          戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-100)', fontSize: '20px', fontWeight: 'bold' }}>
          🗺️ ルートセットを選択
        </h2>
        <button onClick={onCancel} className="secondary-button" style={{ padding: '8px 16px', fontSize: '13px', minHeight: '36px' }}>
          キャンセル
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {routeSets.map((routeSet) => (
          <div
            key={routeSet.id}
            onClick={() => onSelect(routeSet)}
            className="selectable-card"
            style={{
              padding: '20px',
              borderRadius: '16px',
              cursor: 'pointer',
              backgroundColor: 'var(--bg-300)',
              border: '1px solid var(--bg-200)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 95, 191, 0.15)';
              e.currentTarget.style.borderColor = 'var(--primary-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = 'var(--bg-200)';
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--text-100)', marginBottom: '4px' }}>
                {routeSet.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-200)', display: 'flex', gap: '12px' }}>
                <span>📦 {routeSet.routes.length} ルート</span>
                {routeSet.expectedEliteCount > 0 && (
                  <span>🎯 想定 {routeSet.expectedEliteCount} 体</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={(e) => handleDelete(e, routeSet.id)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-300)',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  minHeight: 'auto',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-100)';
                  e.currentTarget.style.color = '#FF6B6B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-300)';
                }}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
