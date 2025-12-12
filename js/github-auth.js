// js/github-auth.js
// Front-end OAuth helper. Stores token+user to localStorage after exchange.
// NOTE: keep clientId as your app's client id and apiEndpoint as your vercel endpoint.

const GITHUB_CONFIG = {
    clientId: 'Ov23liVfqw48OFq76vWI', // 你的 client id（保持原值或替换）
    // 固定回调到 admin.html（与 GitHub OAuth App 中设置一致）
    redirectUri: 'https://estherchern.github.io/admin.html',
    apiEndpoint: window.location.hostname === 'localhost'
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
