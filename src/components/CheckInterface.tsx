import { useState } from 'react';
import { Route, CheckResult } from '../types';
import { addHistory, generateId } from '../utils/storage';

interface CheckInterfaceProps {
  route: Route;
  onComplete: () => void;
  onCancel: () => void;
}

export const CheckInterface = ({ route, onComplete, onCancel }: CheckInterfaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<CheckResult[]>(
    route.groups.map(group => ({
      groupName: group.name,
      hasRemaining: false,
      memo: ''
    }))
  );

  const currentGroup = route.groups[currentIndex];
  const currentResult = results[currentIndex];
  const isLastGroup = currentIndex === route.groups.length - 1;
  const isFirstGroup = currentIndex === 0;

  const handleToggleRemaining = () => {
    const newResults = [...results];
    newResults[currentIndex] = {
      ...newResults[currentIndex],
      hasRemaining: !newResults[currentIndex].hasRemaining,
      memo: !newResults[currentIndex].hasRemaining ? '' : newResults[currentIndex].memo
    };
    setResults(newResults);
  };

  const handleMemoChange = (memo: string) => {
    const newResults = [...results];
    newResults[currentIndex] = {
      ...newResults[currentIndex],
      memo
    };
    setResults(newResults);
  };

  const handleNext = () => {
    if (currentIndex < route.groups.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = () => {
    const history = {
      id: generateId(),
      routeId: route.id,
      routeName: route.name,
      date: new Date().toISOString(),
      results
    };
    addHistory(history);
    alert('チェック完了！履歴に保存しました。');
    onComplete();
  };

  const progress = ((currentIndex + 1) / route.groups.length) * 100;

  return (
    <div className="card">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ marginBottom: '8px', color: '#333' }}>✅ 狩り残しチェック</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>{route.name}</p>
      </div>

      {/* プログレスバー */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {currentIndex + 1} / {route.groups.length}
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {Math.round(progress)}%
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
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#667eea',
              transition: 'width 0.3s'
            }}
          />
        </div>
      </div>

      {/* 現在のグループ */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          marginBottom: '24px'
        }}
      >
        <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#333' }}>
          {currentGroup.name}
        </h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          精鋭数: {currentGroup.count}体
        </p>

        {/* チェックボックス */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 600
          }}
        >
          <input
            type="checkbox"
            checked={currentResult.hasRemaining}
            onChange={handleToggleRemaining}
            style={{
              width: '24px',
              height: '24px',
              cursor: 'pointer'
            }}
          />
          <span style={{ color: currentResult.hasRemaining ? '#ff4444' : '#333' }}>
            狩り残しがいた
          </span>
        </label>

        {/* メモ入力 */}
        {currentResult.hasRemaining && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
              メモ（なぜ狩り残したか）
            </label>
            <textarea
              value={currentResult.memo}
              onChange={(e) => handleMemoChange(e.target.value)}
              placeholder="例: ターゲットを見失った、スキルクールタイム、操作ミスで落ちた..."
              style={{ width: '100%', minHeight: '100px' }}
            />
          </div>
        )}
      </div>

      {/* ナビゲーションボタン */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrevious}
            disabled={isFirstGroup}
            style={{
              backgroundColor: isFirstGroup ? '#ccc' : '#666',
              color: 'white',
              opacity: isFirstGroup ? 0.5 : 1,
              cursor: isFirstGroup ? 'not-allowed' : 'pointer'
            }}
          >
            ← 前へ
          </button>
          <button
            onClick={handleNext}
            disabled={isLastGroup}
            style={{
              backgroundColor: isLastGroup ? '#ccc' : '#667eea',
              color: 'white',
              opacity: isLastGroup ? 0.5 : 1,
              cursor: isLastGroup ? 'not-allowed' : 'pointer'
            }}
          >
            次へ →
          </button>
        </div>
        <div>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#999',
              color: 'white',
              marginRight: '12px'
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleComplete}
            style={{
              backgroundColor: '#4caf50',
              color: 'white'
            }}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};


