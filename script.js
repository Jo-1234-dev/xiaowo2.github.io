// 检查登录状态
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

// Supabase 配置
const SUPABASE_URL = 'https://iqiemumflwfswswwcqef.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWVtdW1mbHdmc3dzd3djcWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDgxOTMsImV4cCI6MjA1MzIyNDE5M30.T5aUmuQR98vJ2_3XN_WEwGmb9huHfjzTv-ny74nIVC8'

// 初始化 Supabase 客户端
let supabase;

function waitForSupabase(maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const checkSupabase = () => {
            attempts++;
            console.log(`Attempting to initialize Supabase (${attempts}/${maxAttempts})...`);
            
            if (window.supabase) {
                try {
                    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('Supabase client initialized successfully');
                    resolve(true);
                } catch (error) {
                    console.error('Error creating Supabase client:', error);
                    reject(error);
                }
            } else if (attempts < maxAttempts) {
                setTimeout(checkSupabase, 500);
            } else {
                reject(new Error('Supabase client library not loaded after maximum attempts'));
            }
        };
        
        checkSupabase();
    });
}

// 页面元素
const postsContainer = document.getElementById('postsContainer');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// 弹窗相关元素
const createPostBtn = document.getElementById('createPostBtn');
const createPostModal = document.getElementById('createPostModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelPostBtn = document.getElementById('cancelPost');
const postForm = document.getElementById('postForm');
const postText = document.getElementById('postText');

// 分页配置
const PAGE_SIZE = 10;
let currentPage = 1;
let hasMore = true;
let isLoading = false;
let currentSearchTerm = '';

// 打开弹窗
createPostBtn.addEventListener('click', () => {
    createPostModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    postText.focus();
});

// 关闭弹窗
function closeModal() {
    createPostModal.classList.remove('active');
    document.body.style.overflow = '';
    postForm.reset();
}

closeModalBtn.addEventListener('click', closeModal);
cancelPostBtn.addEventListener('click', closeModal);

// 点击弹窗外部关闭
createPostModal.addEventListener('click', (e) => {
    if (e.target === createPostModal) {
        closeModal();
    }
});

// ESC 键关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && createPostModal.classList.contains('active')) {
        closeModal();
    }
});

// 发布新帖子
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const content = postText.value.trim();

    if (!content) {
        alert('请输入内容');
        return;
    }

    try {
        // 准备要插入的数据
        const newPost = {
            content: content,
            created_at: new Date().toISOString()
        };

        // 插入数据
        const { error } = await supabase
            .from('posts')
            .insert([newPost]);

        if (error) throw error;

        // 关闭弹窗并重新加载数据
        closeModal();
        await loadPosts(true);
    } catch (error) {
        console.error('Error creating post:', error);
        alert('发布失败：' + error.message);
    }
});

// 加载帖子
async function loadPosts(reset = false) {
    if (isLoading) return;
    
    try {
        isLoading = true;
        if (reset) {
            currentPage = 1;
            hasMore = true;
            postsContainer.innerHTML = '';
        }

        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
            .from('posts')
            .select('*');

        if (currentSearchTerm) {
            query = query.ilike('content', `%${currentSearchTerm}%`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        if (!data || data.length === 0) {
            hasMore = false;
            if (currentPage === 1) {
                postsContainer.innerHTML = '<div class="no-posts">暂无内容</div>';
            }
            return;
        }

        renderPosts(data);
        currentPage++;
        hasMore = data.length === PAGE_SIZE;
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('加载失败：' + error.message);
    } finally {
        isLoading = false;
        updateLoadMoreButton();
    }
}

// 渲染帖子
function renderPosts(posts) {
    postsContainer.innerHTML = posts.map(post => `
        <div class="post" data-id="${post.id}">
            <div class="post-header">
                <span class="post-time">${formatTime(post.created_at)}</span>
            </div>
            <div class="post-text">${post.content}</div>
            <div class="post-actions">
                <div class="action-btn" onclick="editPost(${post.id})">
                    <i class="fas fa-edit"></i>
                </div>
                <div class="action-btn" onclick="deletePost(${post.id})">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        </div>
    `).join('');
}

// 删除帖子
async function deletePost(id) {
    if (!confirm('确定要删除这条帖子吗？')) return;

    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadPosts(true);
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('删除失败：' + error.message);
    }
}

// 编辑帖子
async function editPost(id) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        const newContent = prompt('编辑帖子', data.content);
        if (newContent === null) return;  // 用户点击取消
        if (newContent.trim() === '') {
            alert('内容不能为空');
            return;
        }

        const { error: updateError } = await supabase
            .from('posts')
            .update({ content: newContent.trim() })
            .eq('id', id);

        if (updateError) throw updateError;

        await loadPosts(true);
    } catch (error) {
        console.error('Error editing post:', error);
        alert('编辑失败：' + error.message);
    }
}

// 搜索功能
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentSearchTerm = e.target.value.trim();
        loadPosts(true);
    }, 300);
});

// 加载更多按钮点击事件
loadMoreBtn.addEventListener('click', () => {
    if (!isLoading && hasMore) {
        loadPosts();
    }
});

// 更新加载更多按钮状态
function updateLoadMoreButton() {
    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
    loadMoreBtn.disabled = isLoading;
    loadMoreBtn.textContent = isLoading ? '加载中...' : '加载更多';
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 优化移动端滚动加载
let lastScrollPosition = 0;
window.addEventListener('scroll', () => {
    const currentScrollPosition = window.scrollY;
    
    // 向下滚动时隐藏导航栏，向上滚动时显示
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (currentScrollPosition > lastScrollPosition) {
            sidebar.style.transform = 'translateY(100%)';
        } else {
            sidebar.style.transform = 'translateY(0)';
        }
    }
    
    lastScrollPosition = currentScrollPosition;
    
    // 自动加载更多
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        if (hasMore && !isLoading) {
            loadPosts();
        }
    }
});

// 优化移动端双击返回顶部
let lastTapTime = 0;
document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < 300 && tapLength > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    lastTapTime = currentTime;
});

// 退出登录
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await waitForSupabase();
        loadPosts(true);
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        alert('初始化数据库连接失败：' + error.message);
    }
});

// 自动刷新（每30秒）
setInterval(() => loadPosts(true), 30000);
