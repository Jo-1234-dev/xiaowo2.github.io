// 检查是否已登录
if (!sessionStorage.getItem('username')) {
    window.location.href = 'index.html';
}

// 显示用户名
document.addEventListener('DOMContentLoaded', function() {
    const username = sessionStorage.getItem('username');
    const usernameDisplay = document.getElementById('username-display');
    
    if (username && usernameDisplay) {
        usernameDisplay.textContent = username;
    } else {
        // 如果没有登录信息，重定向回登录页
        window.location.href = './index.html';
    }
});

// 移动端菜单切换
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// 退出登录
document.getElementById('logout').addEventListener('click', function(e) {
    e.preventDefault();
    // 清除会话存储
    sessionStorage.clear();
    // 返回登录页
    window.location.href = './index.html';
});
