// 通用JavaScript函数

// 格式化货币
function formatCurrency(amount) {
    return '¥' + parseFloat(amount).toFixed(2);
}

// 格式化日期
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN');
}

// 格式化时间
function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('zh-CN');
}

// 显示加载动画
function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
    element.disabled = true;
}

// 隐藏加载动画
function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    // 设置背景颜色
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            notification.style.backgroundColor = '#e74c3c';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f39c12';
            break;
        default:
            notification.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 确认对话框
function confirmDialog(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 本地存储
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },
    
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }
};

// AJAX请求封装
async function ajaxRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('AJAX request error:', error);
        throw error;
    }
}

// 表单验证
const validators = {
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    
    phone: (value) => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(value);
    },
    
    minLength: (value, min) => {
        return value.length >= min;
    },
    
    maxLength: (value, max) => {
        return value.length <= max;
    },
    
    numeric: (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    positiveNumber: (value) => {
        return validators.numeric(value) && parseFloat(value) > 0;
    }
};

// 验证表单
function validateForm(form, rules) {
    const errors = {};
    let isValid = true;
    
    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = form[field] ? form[field].value : '';
        const fieldErrors = [];
        
        for (const rule of fieldRules) {
            if (rule.type === 'required' && !validators.required(value)) {
                fieldErrors.push(rule.message || `${field} is required`);
            } else if (rule.type === 'email' && value && !validators.email(value)) {
                fieldErrors.push(rule.message || `${field} must be a valid email`);
            } else if (rule.type === 'phone' && value && !validators.phone(value)) {
                fieldErrors.push(rule.message || `${field} must be a valid phone number`);
            } else if (rule.type === 'minLength' && value && !validators.minLength(value, rule.min)) {
                fieldErrors.push(rule.message || `${field} must be at least ${rule.min} characters`);
            } else if (rule.type === 'maxLength' && value && !validators.maxLength(value, rule.max)) {
                fieldErrors.push(rule.message || `${field} must be no more than ${rule.max} characters`);
            } else if (rule.type === 'numeric' && value && !validators.numeric(value)) {
                fieldErrors.push(rule.message || `${field} must be a number`);
            } else if (rule.type === 'positiveNumber' && value && !validators.positiveNumber(value)) {
                fieldErrors.push(rule.message || `${field} must be a positive number`);
            }
        }
        
        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors;
            isValid = false;
        }
    }
    
    return { isValid, errors };
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 更新当前时间
    updateTime();
    setInterval(updateTime, 1000);
    
    // 添加表单验证样式
    addFormValidationStyles();
});

// 更新时间显示
function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleString('zh-CN');
    }
}

// 添加表单验证样式
function addFormValidationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .form-group.error input,
        .form-group.error select,
        .form-group.error textarea {
            border-color: #e74c3c;
        }
        
        .error-message {
            color: #e74c3c;
            font-size: 12px;
            margin-top: 5px;
        }
        
        .form-group.success input,
        .form-group.success select,
        .form-group.success textarea {
            border-color: #27ae60;
        }
    `;
    document.head.appendChild(style);
}

// 添加CSS动画
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyles);