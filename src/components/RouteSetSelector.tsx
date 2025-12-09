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
  const [editExpectedCount, setEditExpectedCount] = useState(0);
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
    // ルートをテキスト形式に変換
    const routeText = routeSet.routes.map(r => {
      const prefix = r.groupName ? `-${r.name}` : r.name;
      return r.count > 0 ? `${prefix}(${r.count})` : prefix;
    }).join('\n');
    setEditRouteText(routeText);
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
        updatedAt: new Date().toISOString()
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
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-100)' }}>
            ルートセット名
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-100)' }}>
            想定精鋭数
          </label>
          <input
            type="number"
            value={editExpectedCount || ''}
            onChange={(e) => setEditExpectedCount(parseInt(e.target.value) || 0)}
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-100)' }}>
            ルートリスト
          </label>
          <textarea
            value={editRouteText}
            onChange={(e) => setEditRouteText(e.target.value)}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={(e) => handleEdit(e, routeSet)}
                style={{
                  background: 'var(--bg-200)',
                  color: 'var(--text-100)',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  minHeight: 'auto',
                  border: '1px solid var(--accent-100)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-100)';
                  e.currentTarget.style.color = 'var(--primary-300)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-200)';
                  e.currentTarget.style.color = 'var(--text-100)';
                }}
              >
                編集
              </button>
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
