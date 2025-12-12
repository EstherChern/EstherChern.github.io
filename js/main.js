// js/main.js
// Front page loader — exposes loadAllData() used in index.html
// Assumes index.html may set a global CONFIG = { repoOwner, repoName }

(function () {
    // try to get CONFIG from page, else fallback
    const PAGE_CONFIG = window.CONFIG || { repoOwner: 'EstherChern', repoName: 'EstherChern.github.io' };

    // global
    window.githubAPI = new GitHubAPI(null, PAGE_CONFIG.repoOwner, PAGE_CONFIG.repoName);

    async function loadAllData() {
        try {
            console.log('front: loadAllData start');
            await Promise.all([
                loadTodayMood(),
                loadThoughts(),
                loadPomodoroData(),
                loadStatistics()
            ]);
            console.log('front: loadAllData done');
        } catch (err) {
            console.error('front loadAllData error:', err);
        }
    }

    async function loadTodayMood() {
        try {
            const m = await window.githubAPI.getTodayMood();
            const moodDisplay = document.getElementById('mood-display');
            if (!moodDisplay) return;
            if (!m) {
                moodDisplay.innerHTML = '<div class="mood-content" style="color:#a0aec0; font-style: italic;">今天还没有记录心情</div>';
                moodDisplay.classList.remove('loading');
                return;
            }
            const html = `<div class="mood-content">${(m.body || '').replace(/\n/g, '<br>')}</div>`;
            moodDisplay.innerHTML = html;
            moodDisplay.classList.remove('loading');
        } catch (err) {
            console.error('loadTodayMood error:', err);
            const moodDisplay = document.getElementById('mood-display');
            if (moodDisplay) {
                moodDisplay.innerHTML = '<div class="mood-content" style="color:#ef4444">加载心情失败</div>';
                moodDisplay.classList.remove('loading');
            }
        }
    }

    async function loadThoughts() {
        try {
            const thoughts = await window.githubAPI.getIssues({ labels: ['thought', 'personal-blog'], per_page: 10 });
            const containerId = 'thoughts-list';
            if (window.thoughtsManager && typeof window.thoughtsManager.displayThoughts === 'function') {
                window.thoughtsManager.displayThoughts(thoughts, containerId);
            } else {
                const el = document.getElementById(containerId);
                if (!el) return;
                if (!thoughts || thoughts.length === 0) {
                    el.innerHTML = '<div class="empty-info">还没有想法记录</div>';
                } else {
                    el.innerHTML = thoughts.map(t => `<div class="thought-item">${(t.body||'').slice(0,200)}</div>`).join('');
                }
            }
        } catch (err) {
            console.error('loadThoughts error:', err);
            const el = document.getElementById('thoughts-list');
            if (el) el.innerHTML = '<div class="empty-info">加载想法失败</div>';
        }
    }

    async function loadPomodoroData() {
        try {
            const pomodoros = await window.githubAPI.getIssues({ labels: ['pomodoro', 'personal-blog'], per_page: 50 });
            const today = new Date().toISOString().split('T')[0];
            const todayRecords = pomodoros.filter(issue => {
                try {
                    const d = new Date(issue.created_at).toISOString().split('T')[0];
                    return d === today;
                } catch { return false; }
            });

            const historyList = document.getElementById('history-list');
            if (!historyList) return;
            if (!todayRecords || todayRecords.length === 0) {
                historyList.innerHTML = '<div class="history-item">今天还没有记录</div>';
            } else {
                historyList.innerHTML = todayRecords.slice(0,5).map(issue => {
                    const time = new Date(issue.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                    return `<div class="history-item"><i class="fa fa-check-circle" style="color:#4ade80; margin-right:8px;"></i>${time} - 完成25分钟专注</div>`;
                }).join('');
            }
        } catch (err) {
            console.error('loadPomodoroData error:', err);
            const historyList = document.getElementById('history-list');
            if (historyList) historyList.innerHTML = '<div class="history-item">加载失败</div>';
        }
    }

    async function loadStatistics() {
        try {
            // placeholder: extend later
        } catch (err) {
            console.error('loadStatistics error:', err);
        }
    }

    // expose
    window.loadAllData = loadAllData;
    window.loadTodayMood = loadTodayMood;
    window.loadThoughts = loadThoughts;
    window.loadPomodoroData = loadPomodoroData;
    window.loadStatistics = loadStatistics;
})();
