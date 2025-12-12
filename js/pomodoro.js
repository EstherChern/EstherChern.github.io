// js/pomodoro.js
const pomodoroManager = {
    timer: null,
    minutes: 25,
    seconds: 0,
    isRunning: false,
    type: 'work', // 'work' 或 'break'
    
    // 开始计时
    start: function() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'flex';
        document.getElementById('timer-status').textContent = 
            this.type === 'work' ? '专注中...' : '休息中...';
        
        this.timer = setInterval(() => this.update(), 1000);
    },
    
    // 暂停计时
    pause: function() {
        this.isRunning = false;
        clearInterval(this.timer);
        document.getElementById('start-btn').style.display = 'flex';
        document.getElementById('pause-btn').style.display = 'none';
        document.getElementById('timer-status').textContent = '已暂停';
    },
    
    // 重置计时器
    reset: function() {
        this.pause();
        this.minutes = this.type === 'work' ? 25 : 5;
        this.seconds = 0;
        this.updateDisplay();
        document.getElementById('timer-status').textContent = '准备开始';
    },
    
    // 设置休息时间
    setBreak: function(minutes) {
        this.type = 'break';
        this.minutes = minutes;
        this.seconds = 0;
        this.reset();
    },
    
    // 设置工作时间
    setWork: function() {
        this.type = 'work';
        this.minutes = 25;
        this.seconds = 0;
        this.reset();
    },
    
    // 更新时间
    update: function() {
        if (this.seconds === 0) {
            if (this.minutes === 0) {
                // 时间到
                this.complete();
                return;
            }
            this.minutes--;
            this.seconds = 59;
        } else {
            this.seconds--;
        }
        this.updateDisplay();
    },
    
    // 更新显示
    updateDisplay: function() {
        const display = document.getElementById('timer-display');
        if (display) {
            display.textContent = 
                `${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
        }
    },
    
    // 完成番茄钟
    complete: function() {
        this.pause();
        
        // 播放提示音
        this.playSound();
        
        // 显示通知
        if (Notification.permission === 'granted') {
            new Notification('番茄钟完成', {
                body: this.type === 'work' ? '恭喜完成一个番茄钟！休息一下吧～' : '休息结束，继续专注吧！',
                icon: 'https://cdn.jsdelivr.net/gh/guoshijiang/picbed/2023/10/202310071352613.jpg'
            });
        }
        
        // 切换类型
        if (this.type === 'work') {
            document.getElementById('timer-status').innerHTML = '<span style="color:#4ade80;">🍅 番茄钟完成！</span>';
            this.setBreak(5);
            
            // 如果是在后台页面且有 GitHub API，记录番茄钟
            if (window.githubAPI && window.location.pathname.includes('admin.html')) {
                this.recordPomodoro();
            }
        } else {
            document.getElementById('timer-status').innerHTML = '<span style="color:#60a5fa;">休息结束，继续专注吧！</span>';
            this.setWork();
        }
    },
    
    // 播放提示音
    playSound: function() {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('音频播放失败:', e));
    },
    
    // 记录番茄钟到 GitHub
    async recordPomodoro() {
        if (!window.githubAPI) return;
        
        try {
            await githubAPI.recordPomodoro(25, 'work');
            console.log('番茄钟记录成功');
            
            // 刷新番茄钟数据
            if (typeof loadPomodoroData === 'function') {
                loadPomodoroData();
            }
        } catch (error) {
            console.error('记录番茄钟失败:', error);
        }
    },
    
    // 初始化
    init: function() {
        this.updateDisplay();
    }
};

// 初始化
pomodoroManager.init();

// 导出给其他文件使用
window.pomodoroManager = pomodoroManager;
