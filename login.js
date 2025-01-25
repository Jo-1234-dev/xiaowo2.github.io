// 密码加密函数
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 对密码进行加密
    const hashedPassword = await hashPassword(password);
    const correctHashedPassword = await hashPassword('admin');

    // 检查用户名和密码
    if (username === 'admin' && hashedPassword === correctHashedPassword) {
        // 登录成功，使用 sessionStorage 代替 localStorage
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
    } else {
        alert('用户名或密码错误！');
    }
});
