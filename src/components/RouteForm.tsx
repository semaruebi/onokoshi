import { useState } from 'react';
import { parseRouteText } from '../utils/routeParser';
import { saveRoute } from '../utils/indexedDB';
import { showSuccessFeedback } from '../utils/feedback';

interface RouteFormProps {
  onRouteAdded: () => void;
}

export const RouteForm = ({ onRouteAdded }: RouteFormProps) => {
  const [routeText, setRouteText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!routeText.trim()) {
      alert('ルートリストを入力してください');
      return;
    }

    const routes = parseRouteText(routeText);
    if (routes.length === 0) {
      alert('有効なルートを入力してください');
      return;
    }

    try {
      // 各ルートを保存
      for (const route of routes) {
        await saveRoute(route);
      }
      setRouteText('');
      onRouteAdded();
      // ピーク・エンドの法則: ポジティブなフィードバック
      showSuccessFeedback('ルートを登録しました！');
    } catch (error) {
      console.error('ルートの保存に失敗しました:', error);
      alert('ルートの保存に失敗しました');
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', color: '#333' }}>🗺️ ルート情報を登録</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
            ルートリスト
          </label>
          <textarea
            value={routeText}
            onChange={(e) => setRouteText(e.target.value)}
            placeholder="かつヴァナ 5&#10;聖遺殿 8&#10;...&#10;（livesplitのsegmentをそのまま貼り付けでOK)"
            style={{ width: '100%', minHeight: '150px' }}
          />
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            形式: ルート名 精鋭数（例: かつヴァナ(5)）
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
