// js/github-api.js
class GitHubAPI {
    constructor(token, username, repo) {
        this.token = token;
        this.username = username;
        this.repo = repo;
        this.baseURL = 'https://api.github.com';
    }

    async request(endpoint, options = {}) {
        // ... 保持之前的 request 方法不变 ...
    }

    async createIssue(title, body, labels = []) {
        // ... 保持之前的 createIssue 方法不变 ...
    }

    async getIssues(params = {}) {
        // ... 保持之前的 getIssues 方法不变 ...
    }

    // ... 其他方法都保持原样 ...
}

// 全局变量
let githubAPI = null;
let currentUser = null;
let currentRepo = null;

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GitHubAPI, githubAPI, currentUser, currentRepo };
}
