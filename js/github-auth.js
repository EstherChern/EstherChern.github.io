// js/github-auth.js
const GITHUB_CONFIG = {
    clientId: 'Ov23liVfqw48OFq76vWI',  // 替换为你的 Client ID
    apiEndpoint: window.location.origin.includes('localhost') 
        ? 'http://localhost:3000/api/github-auth'
        : 'https://esther-ivory-three.vercel.app/api/github-auth'
};

// 检查登录状态
function checkAuthStatus() {
    const token = localStorage.getItem('github_access_token');
    const user = localStorage.getItem('github_user');
    return { 
        isLoggedIn: !!(token && user), 
        token, 
        user: user ? JSON.parse(user) : null 
    };
}

// GitHub 登录
function githubLogin() {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CONFIG.clientId}&redirect_uri=${encodeURIComponent(window.location.href)}&scope=repo`;
    window.location.href = authUrl;
}

// 交换授权码获取 token
async function exchangeCodeForToken(code) {
    try {
        const response = await fetch(`${GITHUB_CONFIG.apiEndpoint}?code=${code}`);
        const data = await response.json();
        
        if (data.access_token) {
            // 保存 token 和用户信息
            localStorage.setItem('github_access_token', data.access_token);
            localStorage.setItem('github_user', JSON.stringify(data.user));
            
            // 清除 URL 中的 code 参数
            window.history.replaceState({}, document.title, window.location.pathname);
            
            return { success: true, user: data.user };
        } else {
            throw new Error(data.error || '授权失败');
        }
    } catch (error) {
        console.error('获取 token 失败:', error);
        return { success: false, error: error.message };
    }
}

// 登出
function logout() {
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_user');
    window.location.reload();
}

// 导出函数
window.githubLogin = githubLogin;
window.exchangeCodeForToken = exchangeCodeForToken;
window.checkAuthStatus = checkAuthStatus;
window.logout = logout;
