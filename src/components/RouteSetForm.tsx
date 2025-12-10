import { useState } from 'react';
import { RouteSet } from '../types';
import { parseRouteText } from '../utils/routeParser';
import { saveRouteSet, generateId } from '../utils/indexedDB';
import { showSuccessFeedback } from '../utils/feedback';

interface RouteSetFormProps {
  onRouteSetAdded: () => void;
}

export const RouteSetForm = ({ onRouteSetAdded }: RouteSetFormProps) => {
  const [routeSetName, setRouteSetName] = useState('');
  const [routeText, setRouteText] = useState('');
  const [expectedEliteCount, setExpectedEliteCount] = useState<number>(400);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!routeSetName.trim()) {
      alert('ルートセット名を入力してください');
      return;
    }

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
      const now = new Date().toISOString();
      const routeSet: RouteSet = {
        id: generateId(),
        name: routeSetName.trim(),
        routes,
        expectedEliteCount: expectedEliteCount || 0,
        createdAt: now,
        updatedAt: now,
        originalText: routeText.trim() // 元のテキストフォーマットを保存
      };

      await saveRouteSet(routeSet);
      setRouteSetName('');
      setRouteText('');
      setExpectedEliteCount(0);
      onRouteSetAdded();
      showSuccessFeedback('ルートセットを登録しました！');
    } catch (error) {
      console.error('ルートセットの保存に失敗しました:', error);
      alert('ルートセットの保存に失敗しました');
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', color: 'var(--text-100)', fontSize: '18px', fontWeight: 'bold' }}>
        🗺️ ルートセットを登録
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="input-field-container" style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-100)' }}>
            ルートセット名
          </label>
          <input
            type="text"
            value={routeSetName}
            onChange={(e) => setRouteSetName(e.target.value)}
            placeholder="例: 400EE NPuI No LeyLine / ぼくのかんがえたさいきょうのるーと"
            className="input-interactive"
          />
        </div>
        <div className="input-field-container" style={{ marginBottom: '24px' }}>
          <label>
            想定精鋭数
          </label>
          <input
            type="number"
            value={expectedEliteCount || ''}
            onChange={(e) => setExpectedEliteCount(parseInt(e.target.value) || 0)}
            placeholder="例: 400"
            className="input-interactive"
          />
        </div>
        <div className="input-field-container" style={{ marginBottom: '24px' }}>
          <label>
            ルートリスト (Subsplits対応)
          </label>
          <textarea
            value={routeText}
            onChange={(e) => setRouteText(e.target.value)}
            placeholder="かつヴァナ 5&#10;聖遺殿 8&#10;...&#10;（livesplitのsegmentをそのまま貼り付けでOK)"
            style={{ minHeight: '120px' }}
            className="input-interactive"
          />
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-200)', lineHeight: '1.5' }}>
            形式: ルート名 精鋭数（例: かつヴァナ 5、かつヴァナ (5)、かつヴァナ）<br />
            精鋭数は省略可能です
          </div>
        </div>
        <button
          type="submit"
          className="primary-button"
          style={{ width: '100%' }}
        >
          ルートセットを登録
        </button>
      </form>
    </div>
  );
};

