// js/thoughts.js
const thoughtsManager = {
    // 显示想法列表
    displayThoughts: function(thoughts, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (thoughts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #a0aec0; padding: 40px 20px;">
                    <i class="fa fa-pencil" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>还没有发布任何想法</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        thoughts.forEach(issue => {
            const createTime = new Date(issue.created_at).toLocaleString('zh-CN');
            let thoughtData;
            try {
                thoughtData = JSON.parse(issue.body || '{}');
            } catch (e) {
                thoughtData = { content: issue.body || issue.title };
            }
            
            let imagesHtml = '';
            if (thoughtData.images && thoughtData.images.length > 0) {
                imagesHtml = '<div class="thought-images">';
                thoughtData.images.forEach((img, index) => {
                    imagesHtml += `
                        <div class="thought-image-item" onclick="viewImage('${img}')">
                            <img src="${img}" alt="图片${index + 1}">
                        </div>
                    `;
                });
                imagesHtml += '</div>';
            }
            
            const isAdmin = window.location.pathname.includes('admin.html');
            const deleteBtn = isAdmin ? `
                <button class="delete-thought" onclick="deleteThought(${issue.number})" title="删除想法">
                    <i class="fa fa-trash"></i>
                </button>
            ` : '';
            
            const stateBtn = isAdmin ? `
                <div class="thought-action" onclick="toggleIssueState(${issue.number}, '${issue.state}')">
                    <i class="fa fa-${issue.state === 'open' ? 'unlock' : 'lock'}"></i> ${issue.state === 'open' ? '打开' : '关闭'}
                </div>
            ` : '';
            
            html += `
                <div class="thought-item">
                    <div class="thought-header">
                        <img src="${issue.user?.avatar_url || 'https://cdn.jsdelivr.net/gh/guoshijiang/picbed/2023/10/202310071352613.jpg'}" 
                             class="thought-avatar" alt="${issue.user?.login || '用户'}">
                        <div>
                            <div class="thought-author">${issue.user?.login || '用户'}</div>
                            <div class="thought-time">${createTime}</div>
                        </div>
                        ${deleteBtn}
                    </div>
                    <div class="thought-content">${thoughtData.content || issue.title}</div>
                    ${imagesHtml}
                    <div class="thought-actions">
                        <div class="thought-action" onclick="likeThought(${issue.number})">
                            <i class="fa fa-thumbs-up"></i> ${issue.reactions ? issue.reactions['+1'] : 0}
                        </div>
                        ${stateBtn}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // 格式化时间
    formatTime: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) { // 24小时内
            return Math.floor(diff / 3600000) + '小时前';
        } else if (diff < 604800000) { // 7天内
            return Math.floor(diff / 86400000) + '天前';
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
};

// 导出给其他文件使用
window.thoughtsManager = thoughtsManager;

// 通用函数（需要在各自的页面中实现）
function viewImage(imageSrc) {
    // 在各自的页面中实现
    console.log('查看图片:', imageSrc);
}

function deleteThought(issueNumber) {
    // 在 admin.html 中实现
    console.log('删除想法:', issueNumber);
}

function toggleIssueState(issueNumber, currentState) {
    // 在 admin.html 中实现
    console.log('切换状态:', issueNumber, currentState);
}

function likeThought(issueNumber) {
    // 可以在前台和后台中实现不同的逻辑
    console.log('点赞:', issueNumber);
}
