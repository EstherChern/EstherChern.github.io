// js/pomodoro.js
// Simple pomodoro manager for front & admin (window.pomodoroManager)

(function () {
    const DEFAULT_WORK = 25 * 60; // seconds
    let timer = null;
    let remaining = DEFAULT_WORK;
    let running = false;

    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateUI() {
        const disp = document.getElementById('timer-display');
        const status = document.getElementById('timer-status');
        if (disp) disp.textContent = formatTime(remaining);
        if (status) status.textContent = running ? '专注中' : '准备开始';
        document.getElementById('pause-btn') && (document.getElementById('pause-btn').style.display = running ? 'inline-block' : 'none');
    }

    function tick() {
        if (remaining <= 0) {
            stopInternal();
            finishPomodoro();
            return;
        }
        remaining -= 1;
        updateUI();
    }

    function start() {
        if (running) return;
        running = true;
        if (!timer) timer = setInterval(tick, 1000);
        updateUI();
    }

    function pause() {
        running = false;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        updateUI();
    }

    function reset() {
        pause();
        remaining = DEFAULT_WORK;
        updateUI();
    }

    function stopInternal() {
        running = false;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        remaining = DEFAULT_WORK;
        updateUI();
    }

    async function finishPomodoro() {
        showLocalMessage('完成一个番茄！', 'success');
        // If backend token exists, post an issue
        const token = localStorage.getItem('github_access_token');
        const userStr = localStorage.getItem('github_user');
        // githubAPI might be set by admin initialization or main
        try {
            if (window.githubAPI && token && userStr) {
                // ensure token is set on the instance
                window.githubAPI.setToken(token);
                // need owner & repo set — admin usually sets currentRepo; front uses default
                if (!window.githubAPI.owner || !window.githubAPI.repo) {
                    console.warn('pomodoro: owner/repo not set, skipping create issue');
                    return;
                }
                await window.githubAPI.postPomodoro();
                showLocalMessage('番茄记录已同步到 GitHub', 'info');
                // reload local view
                if (typeof window.loadPomodoroData === 'function') window.loadPomodoroData();
            } else {
                console.info('pomodoro: not logged in or githubAPI not ready; skip server record');
            }
        } catch (err) {
            console.error('finishPomodoro error:', err);
            showLocalMessage('同步番茄记录失败', 'error');
        }
    }

    function showLocalMessage(msg, type='info') {
        // small non-blocking toast
        const d = document.createElement('div');
        d.className = `message ${type}`;
        d.textContent = msg;
        d.style.cssText = 'position:fixed;bottom:30px;left:30px;padding:8px 12px;border-radius:6px;background:rgba(0,0,0,0.7);color:#fff;z-index:9999';
        document.body.appendChild(d);
        setTimeout(()=>d.remove(), 2500);
    }

    // expose
    window.pomodoroManager = {
        start,
        pause,
        reset,
        setBreak: (minutes) => {
            pause();
            remaining = minutes * 60;
            updateUI();
        }
    };

    // wire UI buttons if present
    document.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const shortBtn = document.getElementById('short-break');
        const longBtn = document.getElementById('long-break');

        if (startBtn) startBtn.addEventListener('click', start);
        if (pauseBtn) pauseBtn.addEventListener('click', pause);
        if (resetBtn) resetBtn.addEventListener('click', reset);
        if (shortBtn) shortBtn.addEventListener('click', () => { window.pomodoroManager.setBreak(5); });
        if (longBtn) longBtn.addEventListener('click', () => { window.pomodoroManager.setBreak(15); });

        updateUI();
    });

})();
