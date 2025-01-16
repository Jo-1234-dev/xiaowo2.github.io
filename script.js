// 粒子动画配置
particlesJS('particles-js', {
    particles: {
        number: {
            value: 40,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: "#ff9a9e"
        },
        shape: {
            type: "heart",
            stroke: {
                width: 0,
                color: "#ff9a9e"
            },
            polygon: {
                nb_sides: 5
            }
        },
        opacity: {
            value: 0.6,
            random: false,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 15,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 5,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#ffd1d1",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 3,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "grab"
            },
            onclick: {
                enable: true,
                mode: "push"
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                line_linked: {
                    opacity: 1
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
});

// 登录表单处理
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin') {
        try {
            sessionStorage.setItem('username', username);
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            const homePath = basePath + 'home.html';
            window.location.href = homePath;
        } catch (error) {
            console.error('跳转发生错误:', error);
            alert('跳转失败，请确保home.html文件存在且可访问');
        }
    } else {
        alert('登录失败！用户名和密码只能是 admin');
        document.getElementById('password').value = '';
    }
});
