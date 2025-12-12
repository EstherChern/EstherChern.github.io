// js/thoughts.js
// thoughtsManager.displayThoughts(thoughtsArray, containerId)

window.thoughtsManager = (function () {

    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/[&<>"'`=\/]/g, function (c) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            }[c];
        });
    }

    function renderItem(issue) {
        const title = escapeHtml(issue.title || '');
        const body = escapeHtml(issue.body || '');
        const time = new Date(issue.created_at).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        return `<div class="thought-item">
            <div class="thought-meta"><strong>${title}</strong> <span class="time"> ${time}</span></div>
            <div class="thought-body">${body}</div>
        </div>`;
    }

    function displayThoughts(thoughts, containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        if (!Array.isArray(thoughts) || thoughts.length === 0) {
            el.innerHTML = '<div class="empty-info">还没有想法记录</div>';
            return;
        }
        el.innerHTML = thoughts.map(renderItem).join('');
    }

    return {
        displayThoughts
    };
})();
