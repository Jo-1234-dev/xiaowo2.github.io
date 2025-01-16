// 获取当前页面类型
const pageType = document.title.includes('记录') ? 'records' : 
                document.title.includes('生日') ? 'birthdays' : 
                'anniversaries';

// 从本地存储加载数据
function loadItems() {
    const items = JSON.parse(localStorage.getItem(pageType) || '[]');
    const container = document.querySelector('.list-container');
    container.innerHTML = ''; // 清空容器
    
    items.forEach(item => {
        const listItem = createListItem(item);
        container.appendChild(listItem);
    });
}

// 创建列表项元素
function createListItem(item) {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    listItem.innerHTML = `
        <div class="item-content">
            <h3>${item.title}</h3>
            <p>${item.date}</p>
            ${item.description ? `<small class="description">${item.description}</small>` : ''}
        </div>
        <div class="item-actions">
            <button onclick="editItem(this)" data-id="${item.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteItem(this)" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return listItem;
}

// 保存数据到本地存储
function saveItems() {
    const items = [];
    document.querySelectorAll('.list-item').forEach(item => {
        items.push({
            id: item.querySelector('[data-id]').dataset.id,
            title: item.querySelector('h3').textContent,
            date: item.querySelector('p').textContent,
            description: item.querySelector('.description')?.textContent || ''
        });
    });
    localStorage.setItem(pageType, JSON.stringify(items));
}

// 打开添加模态框
function openAddModal() {
    const modal = document.getElementById('addModal');
    modal.classList.add('active');
    // 清空表单
    document.getElementById('addForm').reset();
    // 移除可能存在的编辑ID
    document.getElementById('addForm').removeAttribute('data-edit-id');
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('addModal');
    modal.classList.remove('active');
    document.getElementById('addForm').reset();
}

// 编辑项目
function editItem(button) {
    const listItem = button.closest('.list-item');
    const title = listItem.querySelector('h3').textContent;
    const date = listItem.querySelector('p').textContent;
    const description = listItem.querySelector('.description')?.textContent || '';
    const id = button.dataset.id;
    
    // 填充表单
    document.getElementById('title').value = title;
    document.getElementById('date').value = formatDate(date);
    document.getElementById('description').value = description;
    
    // 标记正在编辑的项目ID
    document.getElementById('addForm').setAttribute('data-edit-id', id);
    
    // 打开模态框
    openAddModal();
}

// 删除项目
function deleteItem(button) {
    if (confirm('确定要删除这条记录吗？')) {
        button.closest('.list-item').remove();
        saveItems(); // 保存更改到本地存储
    }
}

// 格式化日期为 YYYY-MM-DD
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 表单提交处理
document.getElementById('addForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const editId = this.getAttribute('data-edit-id');
    
    const item = {
        id: editId || generateId(),
        title,
        date,
        description
    };
    
    if (editId) {
        // 编辑现有项目
        const existingItem = document.querySelector(`[data-id="${editId}"]`).closest('.list-item');
        existingItem.replaceWith(createListItem(item));
    } else {
        // 添加新项目
        document.querySelector('.list-container').appendChild(createListItem(item));
    }
    
    saveItems(); // 保存到本地存储
    closeModal();
});

// 页面加载时读取数据
document.addEventListener('DOMContentLoaded', loadItems);
