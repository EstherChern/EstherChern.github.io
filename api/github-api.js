// github-api.js
class GitHubAPI {
    constructor(token) {
        this.token = token;
        this.username = '你的_GitHub用户名';
        this.repo = '你的_仓库名';
        this.baseURL = 'https://api.github.com';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`GitHub API 错误: ${response.status} - ${error.message || '未知错误'}`);
        }

        return response.json();
    }

    // 创建 Issue
    async createIssue(title, body, labels = []) {
        return this.request(`/repos/${this.username}/${this.repo}/issues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body, labels })
        });
    }

    // 获取 Issues
    async getIssues(labels = [], state = 'open', per_page = 100) {
        let endpoint = `/repos/${this.username}/${this.repo}/issues?state=${state}&per_page=${per_page}`;
        
        if (labels.length > 0) {
            const labelsParam = labels.map(label => `labels=${encodeURIComponent(label)}`).join('&');
            endpoint += `&${labelsParam}`;
        }

        return this.request(endpoint);
    }

    // 更新 Issue
    async updateIssue(issueNumber, updates) {
        return this.request(`/repos/${this.username}/${this.repo}/issues/${issueNumber}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
    }

    // 关闭 Issue
    async closeIssue(issueNumber) {
        return this.updateIssue(issueNumber, { state: 'closed' });
    }

    // 获取今日心情
    async getTodayMood() {
        const issues = await this.getIssues(['mood']);
        const today = new Date().toISOString().split('T')[0];
        
        return issues.find(issue => {
            const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
            return issueDate === today;
        });
    }

    // 保存今日心情
    async saveTodayMood(content) {
        const todayMood = await this.getTodayMood();
        
        if (todayMood) {
            // 更新已有心情
            return this.updateIssue(todayMood.number, { body: content });
        } else {
            // 创建新心情
            const today = new Date().toLocaleDateString('zh-CN');
            return this.createIssue(`心情记录 - ${today}`, content, ['mood']);
        }
    }

    // 发布想法
    async postThought(content) {
        const timestamp = new Date().toLocaleString('zh-CN');
        const title = `想法 - ${timestamp}`;
        const body = JSON.stringify({
            content,
            timestamp,
            type: 'thought'
        });

        return this.createIssue(title, body, ['thought']);
    }

    // 记录番茄钟完成
    async recordPomodoro(duration = 25) {
        const timestamp = new Date().toLocaleString('zh-CN');
        const title = `番茄钟完成 - ${timestamp}`;
        const body = JSON.stringify({
            duration,
            timestamp,
            type: 'pomodoro'
        });

        return this.createIssue(title, body, ['pomodoro']);
    }

    // 获取统计数据
    async getStatistics() {
        const issues = await this.getIssues();
        
        // 按标签分类统计
        const stats = {
            thoughts: issues.filter(i => i.labels.some(l => l.name === 'thought')).length,
            pomodoros: issues.filter(i => i.labels.some(l => l.name === 'pomodoro')).length,
            moods: issues.filter(i => i.labels.some(l => l.name === 'mood')).length
        };

        // 计算连续天数
        const dates = [...new Set(issues.map(i => 
            new Date(i.created_at).toISOString().split('T')[0]
        ))];
        
        dates.sort((a, b) => new Date(b) - new Date(a));
        
        let streak = 0;
        let currentDate = new Date();
        for (let i = 0; i < dates.length; i++) {
            const expectedDate = new Date(currentDate - i * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0];
            if (dates.includes(expectedDate)) {
                streak++;
            } else {
                break;
            }
        }

        stats.streak = streak;
        return stats;
    }
}
