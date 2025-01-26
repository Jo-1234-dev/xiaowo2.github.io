// 密码查看功能
document.querySelector('.toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // 切换图标
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// 密码加密函数
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const togglePassword = document.querySelector('.toggle-password');

    // 页面加载时检查是否有保存的登录信息
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    if (rememberMe && savedUsername && savedPassword) {
        usernameInput.value = savedUsername;
        passwordInput.value = savedPassword;
        rememberMeCheckbox.checked = true;
    }

    // 切换密码可见性
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // 处理登录表单提交
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        // 对密码进行加密
        const hashedPassword = await hashPassword(password);
        const correctHashedPassword = await hashPassword('admin');

        // 验证用户名和密码
        if ((username === 'admin' || username === 'admin2') && hashedPassword === correctHashedPassword) {
            
            // 如果选中了"记住密码"，保存登录信息
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('savedUsername', username);
                localStorage.setItem('savedPassword', password);
                localStorage.setItem('rememberMe', 'true');
            } else {
                // 如果没有选中，清除保存的信息
                localStorage.removeItem('savedUsername');
                localStorage.removeItem('savedPassword');
                localStorage.removeItem('rememberMe');
            }

            // 保存当前用户到会话存储
            sessionStorage.setItem('currentUser', username);
            sessionStorage.setItem('isLoggedIn', 'true');
            
            // 跳转到主页
            window.location.href = 'index.html';
        } else {
            alert('用户名或密码错误');
        }
    });
});
