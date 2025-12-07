import { Route } from '../types';
import { deleteRoute } from '../utils/storage';

interface RouteListProps {
  routes: Route[];
  onRouteSelect: (route: Route) => void;
  onRouteDeleted: () => void;
}

export const RouteList = ({ routes, onRouteSelect, onRouteDeleted }: RouteListProps) => {
  const handleDelete = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    if (confirm('このルートを削除しますか？')) {
      deleteRoute(routeId);
      onRouteDeleted();
    }
  };

  if (routes.length === 0) {
    return (
      <div className="card">
        <p style={{ color: '#666', textAlign: 'center' }}>
          まだルートが登録されていません。上記のフォームから登録してください。
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', color: '#333' }}>📋 登録済みルート一覧</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {routes.map((route) => (
          <div
            key={route.id}
            onClick={() => onRouteSelect(route)}
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
                <h3 style={{ marginBottom: '8px', color: '#333' }}>{route.name}</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {route.groups.length}グループ / 合計{route.groups.reduce((sum, g) => sum + g.count, 0)}体
                </p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {new Date(route.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => handleDelete(e, route.id)}
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
          </div>
        ))}
      </div>
    </div>
  );
};

