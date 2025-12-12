// js/github-api.js
// Simple GitHub API helper used by front & admin.
// Usage:
//   const api = new GitHubAPI(tokenOrNull, owner, repo);
//   await api.getIssues({ labels: ['thought'], per_page: 20 });
//   await api.postIssue({ title, body, labels });

class GitHubAPI {
    constructor(token = null, owner = '', repo = '') {
        this.token = token;
        this.owner = owner;
        this.repo = repo;
        this.base = 'https://api.github.com';
    }

    setToken(token) {
        this.token = token;
    }

    setRepo(owner, repo) {
        this.owner = owner;
        this.repo = repo;
    }

    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        if (this.token) headers['Authorization'] = 'token ' + this.token;
        return headers;
    }

    // Get repositories for the authenticated user
    async getUserRepos() {
        try {
            const res = await fetch(`${this.base}/user/repos?per_page=100`, {
                headers: this.getHeaders()
            });
            if (!res.ok) {
                console.warn('getUserRepos failed:', res.status, await res.text());
                return [];
            }
            const json = await res.json();
            return Array.isArray(json) ? json : [];
        } catch (err) {
            console.error('getUserRepos error:', err);
            return [];
        }
    }

    // Generic issues fetch with safe fallback
    // params: { labels: ['a','b'], state: 'all', per_page: 20 }
    async getIssues(params = {}) {
        if (!this.owner || !this.repo) {
            console.warn('getIssues: owner/repo not specified');
            return [];
        }

        const qs = new URLSearchParams({
            state: params.state || 'all',
            per_page: params.per_page || 20
        });

        if (params.labels && Array.isArray(params.labels)) {
            qs.set('labels', params.labels.join(','));
        }

        try {
            const url = `${this.base}/repos/${this.owner}/${this.repo}/issues?${qs.toString()}`;
            const res = await fetch(url, { headers: this.getHeaders() });
            if (!res.ok) {
                console.warn('getIssues non-ok:', res.status, await res.text());
                return [];
            }
            const json = await res.json();
            return Array.isArray(json) ? json : [];
        } catch (err) {
            console.error('getIssues error:', err);
            return [];
        }
    }

    // Get "today mood" - find an issue titled with today's date or label mood
    async getTodayMood() {
        if (!this.owner || !this.repo) return null;
        try {
            const issues = await this.getIssues({ labels: ['mood', 'personal-blog'], per_page: 50 });
            if (!Array.isArray(issues) || issues.length === 0) return null;
            const today = new Date().toISOString().split('T')[0];
            // prefer title containing date, else return most recent
            const match = issues.find(i => i.title && i.title.includes(today));
            return match || issues[0] || null;
        } catch (err) {
            console.error('getTodayMood error:', err);
            return null;
        }
    }

    // Create a new issue (used by thoughts, pomodoro, mood save)
    async postIssue({ title, body = '', labels = [] }) {
        if (!this.owner || !this.repo) throw new Error('owner/repo not set');
        if (!this.token) throw new Error('No token for write operation');

        try {
            const url = `${this.base}/repos/${this.owner}/${this.repo}/issues`;
            const res = await fetch(url, {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/json' }, this.getHeaders()),
                body: JSON.stringify({ title, body, labels })
            });
            const json = await res.json();
            if (!res.ok) {
                console.warn('postIssue failed', res.status, json);
                throw new Error(json.message || 'GitHub issue create failed');
            }
            return json;
        } catch (err) {
            console.error('postIssue error:', err);
            throw err;
        }
    }

    // Helpers for specific actions
    async postThought(content) {
        const title = `Thought ${new Date().toISOString()}`;
        return this.postIssue({ title, body: content, labels: ['thought', 'personal-blog'] });
    }

    async saveTodayMood(content) {
        const today = new Date().toISOString().split('T')[0];
        const title = `Mood ${today}`;
        return this.postIssue({ title, body: content, labels: ['mood', 'personal-blog'] });
    }

    async postPomodoro() {
        const title = `Pomodoro ${new Date().toISOString()}`;
        const body = '完成 25 分钟专注';
        return this.postIssue({ title, body, labels: ['pomodoro', 'personal-blog'] });
    }

    // Test connection by fetching the authenticated user (if token) or public repo info (if no token)
    async testConnection() {
        try {
            if (this.token) {
                const res = await fetch(`${this.base}/user`, { headers: this.getHeaders() });
                if (!res.ok) {
                    return { success: false, error: `User fetch failed ${res.status}` };
                }
                const user = await res.json();
                return { success: true, user: user.login || user.name || user };
            } else {
                // no token: check if repo is public
                if (!this.owner || !this.repo) return { success: false, error: 'no repo specified' };
                const res = await fetch(`${this.base}/repos/${this.owner}/${this.repo}`);
                if (!res.ok) {
                    return { success: false, error: `Repo fetch failed ${res.status}` };
                }
                const repo = await res.json();
                return { success: true, repo: repo.full_name || repo.name };
            }
        } catch (err) {
            console.error('testConnection error:', err);
            return { success: false, error: err.message || 'unknown' };
        }
    }

}

// expose globally
window.GitHubAPI = GitHubAPI;
