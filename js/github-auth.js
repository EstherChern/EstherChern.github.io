// js/github-auth.js
// Front-end OAuth helper. Stores token+user to localStorage after exchange.
// NOTE: keep clientId as your app's client id and apiEndpoint as your vercel endpoint.

const GITHUB_CONFIG = {
    // 使用你自己的GitHub OAuth App Client ID
    // 创建地址：https://github.com/settings/developers
    clientId: 'Ov23liVfqw48OFq76vWI', // 替换为你的Client ID
    
    // 回调地址必须与GitHub OAuth App设置中的完全一致
    redirectUri: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/admin.html'  // 本地开发
        : 'https://estherchern.github.io/admin.html', // 线上地址
    
    // Vercel API地址，确保你的后端API已部署
    apiEndpoint: window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/github-auth'
        : 'https://esther-ivory-three.vercel.app/api/github-auth'  // 替换为你的Vercel域名
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

// 发起 GitHub 登录
function githubLogin() {
    // request repo + user at minimum so we can list repos and create issues
    const scopes = encodeURIComponent('repo user');
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CONFIG.clientId}&redirect_uri=${encodeURIComponent(GITHUB_CONFIG.redirectUri)}&scope=${scopes}`;
    window.location.href = authUrl;
}

// 交换 code -> token via your Vercel API
async function exchangeCodeForToken(code) {
    try {
        const res = await fetch(`${GITHUB_CONFIG.apiEndpoint}?code=${encodeURIComponent(code)}`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        if (data.access_token) {
            // store token and user
            localStorage.setItem('github_access_token', data.access_token);
            if (data.user) localStorage.setItem('github_user', JSON.stringify(data.user));
            else localStorage.removeItem('github_user');

            // return success and user
            return { success: true, user: data.user || null };
        } else {
            console.warn('exchangeCodeForToken response:', data);
            return { success: false, error: data.error || data.message || 'no token in response' };
        }
    } catch (err) {
        console.error('exchangeCodeForToken error:', err);
        return { success: false, error: err.message || 'fetch failed' };
    }
}

function logout() {
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_user');
    window.location.reload();
}

// export
window.GITHUB_CONFIG = GITHUB_CONFIG;
window.githubLogin = githubLogin;
window.exchangeCodeForToken = exchangeCodeForToken;
window.checkAuthStatus = checkAuthStatus;
window.logout = logout;
