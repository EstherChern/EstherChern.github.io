// js/main.js
// 通用工具函数

// 显示消息
function showMessage(message, type = 'info', duration = 3000) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                     type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 
                     'rgba(103, 81, 185, 0.9)'};
        color: white;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, duration);
}

// 动画 keyframes
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

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 安全解析 JSON
function safeParseJSON(str, defaultValue = {}) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('JSON 解析失败:', e);
        return defaultValue;
    }
}

// 格式化字节大小
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 获取 URL 参数
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 设置 URL 参数
function setQueryParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
}

// 移除 URL 参数
function removeQueryParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showMessage('已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showMessage('复制失败', 'error');
    });
}

// 导出所有函数
window.showMessage = showMessage;
window.debounce = debounce;
window.throttle = throttle;
window.safeParseJSON = safeParseJSON;
window.formatBytes = formatBytes;
window.getQueryParam = getQueryParam;
window.setQueryParam = setQueryParam;
window.removeQueryParam = removeQueryParam;
window.copyToClipboard = copyToClipboard;
