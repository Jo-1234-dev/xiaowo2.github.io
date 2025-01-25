// 检查登录状态
function checkAuth() {
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
    }
}

// 页面加载时检查登录状态
checkAuth();

// Supabase 配置
const SUPABASE_URL = 'https://iqiemumflwfswswwcqef.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWVtdW1mbHdmc3dzd3djcWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDgxOTMsImV4cCI6MjA1MzIyNDE5M30.T5aUmuQR98vJ2_3XN_WEwGmb9huHfjzTv-ny74nIVC8'
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class Calendar {
    constructor() {
        this.date = new Date();
        this.currentYear = this.date.getFullYear();
        this.currentMonth = this.date.getMonth();
        this.markedDates = new Set();
        
        // 获取元素
        this.monthSelect = document.getElementById('monthSelect');
        this.yearSelect = document.getElementById('yearSelect');
        this.daysContainer = document.getElementById('daysContainer');
        this.prevBtn = document.getElementById('prevMonth');
        this.nextBtn = document.getElementById('nextMonth');
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmBtn = document.getElementById('confirmBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // 初始化月份和年份选择器
        this.initMonthSelect();
        this.initYearSelect();
        
        // 设置当前月份和年份
        this.monthSelect.value = this.currentMonth;
        this.yearSelect.value = this.currentYear;
        
        // 绑定事件
        this.bindEvents();
        
        // 加载标记的日期
        this.loadMarkedDates();
        
        // 渲染日历
        this.renderCalendar();
    }
    
    initMonthSelect() {
        const months = ['一月', '二月', '三月', '四月', '五月', '六月', 
                       '七月', '八月', '九月', '十月', '十一月', '十二月'];
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            this.monthSelect.appendChild(option);
        });
    }
    
    initYearSelect() {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;
        const endYear = currentYear + 5;
        
        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '年';
            this.yearSelect.appendChild(option);
        }
    }
    
    bindEvents() {
        this.monthSelect.addEventListener('change', () => {
            this.currentMonth = parseInt(this.monthSelect.value);
            this.renderCalendar();
        });
        
        this.yearSelect.addEventListener('change', () => {
            this.currentYear = parseInt(this.yearSelect.value);
            this.renderCalendar();
        });
        
        this.prevBtn.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
                this.yearSelect.value = this.currentYear;
            }
            this.monthSelect.value = this.currentMonth;
            this.renderCalendar();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
                this.yearSelect.value = this.currentYear;
            }
            this.monthSelect.value = this.currentMonth;
            this.renderCalendar();
        });

        // 触摸滑动支持
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) { // 最小滑动距离
                if (diff > 0) {
                    // 向左滑动，下一个月
                    this.nextBtn.click();
                } else {
                    // 向右滑动，上一个月
                    this.prevBtn.click();
                }
            }
        });

        // 确认弹窗事件
        this.confirmBtn.addEventListener('click', () => {
            if (this.dateToUnmark) {
                this.toggleDateMark(this.dateToUnmark, true);
                this.dateToUnmark = null;
            }
            this.confirmModal.classList.remove('active');
        });
        
        this.cancelBtn.addEventListener('click', () => {
            this.dateToUnmark = null;
            this.confirmModal.classList.remove('active');
        });
    }
    
    async loadMarkedDates() {
        try {
            const { data, error } = await supabase
                .from('marked_dates')
                .select('date');
                
            if (error) throw error;
            
            this.markedDates = new Set(data.map(item => item.date));
            this.renderCalendar();
        } catch (error) {
            console.error('Error loading marked dates:', error);
        }
    }
    
    async toggleDateMark(dateStr, confirmed = false) {
        if (this.markedDates.has(dateStr) && !confirmed) {
            this.dateToUnmark = dateStr;
            this.confirmModal.classList.add('active');
            return;
        }
        
        try {
            if (this.markedDates.has(dateStr)) {
                const { error } = await supabase
                    .from('marked_dates')
                    .delete()
                    .eq('date', dateStr);
                    
                if (error) throw error;
                this.markedDates.delete(dateStr);
            } else {
                const { error } = await supabase
                    .from('marked_dates')
                    .insert([{ date: dateStr }]);
                    
                if (error) throw error;
                this.markedDates.add(dateStr);
            }
            
            this.renderCalendar();
        } catch (error) {
            console.error('Error toggling date mark:', error);
        }
    }
    
    renderCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const monthDays = lastDay.getDate();
        
        let days = '';
        
        // 添加上个月的天数
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            days += `<div class="day other-month"><span>${day}</span></div>`;
        }
        
        // 添加当前月的天数
        for (let i = 1; i <= monthDays; i++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = this.isToday(i);
            const isMarked = this.markedDates.has(dateStr);
            
            days += `
                <div class="day${isToday ? ' today' : ''}${isMarked ? ' marked' : ''}"
                     onclick="calendar.toggleDateMark('${dateStr}')"><span>${i}</span></div>
            `;
        }
        
        // 添加下个月的天数
        const totalDays = Math.ceil((startingDay + monthDays) / 7) * 7;
        const nextMonthDays = totalDays - (startingDay + monthDays);
        for (let i = 1; i <= nextMonthDays; i++) {
            days += `<div class="day other-month"><span>${i}</span></div>`;
        }
        
        this.daysContainer.innerHTML = days;
    }
    
    isToday(day) {
        const today = new Date();
        return day === today.getDate() &&
               this.currentMonth === today.getMonth() &&
               this.currentYear === today.getFullYear();
    }
}

// 初始化日历
const calendar = new Calendar();
