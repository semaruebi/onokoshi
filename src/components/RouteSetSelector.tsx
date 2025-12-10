import { useState } from 'react';
import { RouteSet } from '../types';
import { deleteRouteSet, saveRouteSet } from '../utils/indexedDB';
import { parseRouteText } from '../utils/routeParser';
import { showSuccessFeedback } from '../utils/feedback';

interface RouteSetSelectorProps {
  routeSets: RouteSet[];
  onSelect: (routeSet: RouteSet) => void;
  onCancel: () => void;
  onRouteSetDeleted: () => void;
}

export const RouteSetSelector = ({ routeSets, onSelect, onCancel, onRouteSetDeleted }: RouteSetSelectorProps) => {
  const [editingRouteSet, setEditingRouteSet] = useState<RouteSet | null>(null);
  const [editName, setEditName] = useState('');
  const [editExpectedCount, setEditExpectedCount] = useState(400);
  const [editRouteText, setEditRouteText] = useState('');

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

  const handleEdit = (e: React.MouseEvent, routeSet: RouteSet) => {
    e.stopPropagation();
    setEditingRouteSet(routeSet);
    setEditName(routeSet.name);
    setEditExpectedCount(routeSet.expectedEliteCount);
    // 元のテキストフォーマットがあればそれを使用、なければ再構築
    if (routeSet.originalText) {
      setEditRouteText(routeSet.originalText);
    } else {
      // フォールバック: ルートをテキスト形式に変換
      const routeText = routeSet.routes.map(r => {
        const prefix = r.groupName ? `-${r.name}` : r.name;
        return r.count > 0 ? `${prefix}(${r.count})` : prefix;
      }).join('\n');
      setEditRouteText(routeText);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRouteSet) return;
    
    if (!editName.trim()) {
      alert('ルートセット名を入力してください');
      return;
    }

    const routes = parseRouteText(editRouteText);
    if (routes.length === 0) {
      alert('有効なルートを入力してください');
      return;
    }

    try {
      const updatedRouteSet: RouteSet = {
        ...editingRouteSet,
        name: editName.trim(),
        expectedEliteCount: editExpectedCount,
        routes,
        updatedAt: new Date().toISOString(),
        originalText: editRouteText.trim() // 編集後のテキストも元のフォーマットとして保存
      };
      await saveRouteSet(updatedRouteSet);
      setEditingRouteSet(null);
      onRouteSetDeleted(); // リロード
      showSuccessFeedback('ルートセットを更新しました！');
    } catch (error) {
      console.error('ルートセットの更新に失敗しました:', error);
      alert('ルートセットの更新に失敗しました');
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

  // 編集モーダル
  if (editingRouteSet) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--text-100)', fontSize: '18px', fontWeight: 'bold' }}>
          ✏️ ルートセットを編集
        </h2>
        
        <div className="input-field-container" style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-100)' }}>
            ルートリスト (Subsplits対応)
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="input-interactive"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          />
        </div>

        <div className="input-field-container" style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-100)' }}>
            想定精鋭数
          </label>
          <input
            type="number"
            value={editExpectedCount || ''}
            onChange={(e) => setEditExpectedCount(parseInt(e.target.value) || 0)}
            className="input-interactive"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          />
        </div>

        <div className="input-field-container" style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-100)' }}>
            ルートリスト
          </label>
          <textarea
            value={editRouteText}
            onChange={(e) => setEditRouteText(e.target.value)}
            className="input-interactive"
            style={{ width: '100%', minHeight: '200px', padding: '12px', fontSize: '14px' }}
          />
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-200)' }}>
            形式: ルート名(精鋭数) または -ルート名(精鋭数)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setEditingRouteSet(null)}
            className="secondary-button"
          >
            キャンセル
          </button>
          <button
            onClick={handleSaveEdit}
            className="primary-button"
          >
            保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ color: 'var(--text-100)', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
            🗺️ ルートセットを選択
          </h2>
          <p style={{ color: 'var(--text-200)', fontSize: '14px' }}>
            本日のハントに使用するルートを選んでください
          </p>
        </div>
        <button onClick={onCancel} className="secondary-button">
          キャンセル
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        {routeSets.map((routeSet) => (
          <div
            key={routeSet.id}
            onClick={() => onSelect(routeSet)}
            className="selectable-card"
            style={{
              padding: '24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '160px'
            }}
          >
            <div>
              <div style={{ 
                fontWeight: '800', 
                fontSize: '20px', 
                color: 'var(--text-100)', 
                marginBottom: '8px',
                lineHeight: 1.4
              }}>
                {routeSet.name}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--text-200)', 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '12px' 
              }}>
                <span style={{ 
                  background: 'var(--bg-100)', 
                  padding: '4px 10px', 
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  📦 {routeSet.routes.length} ルート
                </span>
                {routeSet.expectedEliteCount > 0 && (
                  <span style={{ 
                    background: 'var(--accent-100)', 
                    color: 'var(--accent-200)',
                    padding: '4px 10px', 
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    🎯 想定 {routeSet.expectedEliteCount} 体
                  </span>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '8px', 
              marginTop: '24px',
              borderTop: '1px solid var(--bg-200)',
              paddingTop: '16px'
            }}>
              <button
                onClick={(e) => handleEdit(e, routeSet)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-200)',
                  fontSize: '13px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  minHeight: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-200)';
                  e.currentTarget.style.color = 'var(--primary-200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-200)';
                }}
              >
                編集
              </button>
              <button
                onClick={(e) => handleDelete(e, routeSet.id)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-300)',
                  fontSize: '13px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  minHeight: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFEBEE';
                  e.currentTarget.style.color = '#D32F2F';
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
