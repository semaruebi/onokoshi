/**
 * UX心理学に基づいたフィードバックユーティリティ
 * ドハティの閾値（0.4秒）と労働の錯覚を活用
 */

// 即座の視覚的フィードバックを提供
export const showImmediateFeedback = (element: HTMLElement) => {
  // 0.4秒以内に視覚的フィードバックを返す
  element.style.transition = 'all 0.2s';
  element.style.transform = 'scale(0.98)';
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 200);
};

// 保存成功時のポジティブなフィードバック（ピーク・エンドの法則）
export const showSuccessFeedback = (message: string = '保存しました！') => {
  // 簡易的なトースト通知
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
};

// CSSアニメーションを追加
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

