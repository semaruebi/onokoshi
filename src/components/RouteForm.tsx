import { useState } from 'react';
import { Route } from '../types';
import { parseRouteText } from '../utils/routeParser';
import { addRoute, generateId } from '../utils/storage';

interface RouteFormProps {
  onRouteAdded: () => void;
}

export const RouteForm = ({ onRouteAdded }: RouteFormProps) => {
  const [routeName, setRouteName] = useState('');
  const [routeText, setRouteText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!routeName.trim() || !routeText.trim()) {
      alert('ルート名とルートリストを入力してください');
      return;
    }

    const groups = parseRouteText(routeText);
    if (groups.length === 0) {
      alert('有効な精鋭グループを入力してください');
      return;
    }

    const newRoute: Route = {
      id: generateId(),
      name: routeName.trim(),
      groups,
      createdAt: new Date().toISOString()
    };

    addRoute(newRoute);
    setRouteName('');
    setRouteText('');
    onRouteAdded();
    alert('ルートを登録しました！');
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', color: '#333' }}>🗺️ 新しいルートを登録</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
            ルート名
          </label>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="例: 今日のRTAルート"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
            精鋭グループリスト（一行ずつ入力）
          </label>
          <textarea
            value={routeText}
            onChange={(e) => setRouteText(e.target.value)}
            placeholder="かつヴァナ 5&#10;聖遺殿 8&#10;..."
            style={{ width: '100%', minHeight: '150px' }}
          />
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            形式: 精鋭グループ名 数（例: かつヴァナ 5）
          </div>
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            width: '100%'
          }}
        >
          ルートを登録
        </button>
      </form>
    </div>
  );
};


