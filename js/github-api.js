// js/github-api.js
class GitHubAPI {
    constructor(token, username, repo) {
        this.token = token;
        this.username = username;
        this.repo = repo;
        this.baseURL = 'https://api.github.com';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        };
        
        // 如果有访问令牌，添加到请求头
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // 处理错误状态
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('GitHub API 请求失败:', error);
            throw error;
        }
    }

    // 测试连接
    async testConnection() {
        try {
            const user = await this.request('/user');
            const repo = await this.request(`/repos/${this.username}/${this.repo}`);
            return {
                success: true,
                user: user.login,
                repo: repo.name
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 创建 Issue
    async createIssue(title, body, labels = []) {
        return this.request(`/repos/${this.username}/${this.repo}/issues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                title, 
                body, 
                labels: [...labels, 'personal-blog']
            })
        });
    }

    // 获取 Issues
    async getIssues(params = {}) {
        let endpoint = `/repos/${this.username}/${this.repo}/issues`;
        const queryParams = [];
        
        if (params.labels && params.labels.length > 0) {
            queryParams.push(`labels=${params.labels.join(',')}`);
        }
        if (params.state) {
            queryParams.push(`state=${params.state}`);
        }
        if (params.per_page) {
            queryParams.push(`per_page=${params.per_page}`);
        }
        if (params.page) {
            queryParams.push(`page=${params.page}`);
        }
        if (params.sort) {
            queryParams.push(`sort=${params.sort}`);
        }
        if (params.direction) {
            queryParams.push(`direction=${params.direction}`);
        }
        
        if (queryParams.length > 0) {
            endpoint += `?${queryParams.join('&')}`;
        }
        
        return this.request(endpoint);
    }

    // 获取用户的所有仓库
    async getUserRepos() {
        return this.request('/user/repos?per_page=100&sort=updated');
    }

    // 获取今日心情
    async getTodayMood() {
        const today = new Date().toISOString().split('T')[0];
        const issues = await this.getIssues({ 
            labels: ['mood', 'personal-blog'],
            per_page: 100,
            sort: 'created',
            direction: 'desc'
        });
        
        // 查找今天的心情（最近的）
        for (const issue of issues) {
            const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
            if (issueDate === today) {
                return issue;
            }
        }
        return null;
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
    async postThought(content, images = []) {
        const timestamp = new Date().toLocaleString('zh-CN');
        const thoughtData = {
            content,
            timestamp,
            images,
            type: 'thought'
        };
        
        const title = content.length > 50 
            ? content.substring(0, 47) + '...' 
            : content;
        
        return this.createIssue(title, JSON.stringify(thoughtData, null, 2), ['thought']);
    }

    // 记录番茄钟完成
    async recordPomodoro(duration = 25, type = 'work') {
        const timestamp = new Date().toLocaleString('zh-CN');
        const pomodoroData = {
            duration,
            timestamp,
            type,
            completed: true
        };
        
        const title = `番茄钟完成 - ${type === 'work' ? '专注' : '休息'} ${duration}分钟`;
        return this.createIssue(title, JSON.stringify(pomodoroData), ['pomodoro']);
    }

    // 获取统计数据
    async getStatistics() {
        const [thoughts, pomodoros, moods] = await Promise.all([
            this.getIssues({ labels: ['thought', 'personal-blog'], state: 'all', per_page: 1 }),
            this.getIssues({ labels: ['pomodoro', 'personal-blog'], state: 'all', per_page: 1 }),
            this.getIssues({ labels: ['mood', 'personal-blog'], state: 'all', per_page: 1 })
        ]);
        
        return {
            thoughts: thoughts.length,
            pomodoros: pomodoros.length,
            moods: moods.length
        };
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

    // 重新打开 Issue
    async reopenIssue(issueNumber) {
        return this.updateIssue(issueNumber, { state: 'open' });
    }

    // 删除 Issue（GitHub API 不支持直接删除，只能关闭）
    async deleteIssue(issueNumber) {
        return this.closeIssue(issueNumber);
    }
}

// 导出给其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
}
