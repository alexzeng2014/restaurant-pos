// 管理端JavaScript

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化管理员功能
    initAdminFeatures();
});

// 初始化管理员功能
function initAdminFeatures() {
    // 添加表格行悬停效果
    addTableHoverEffects();
    
    // 初始化图表
    initCharts();
    
    // 初始化实时数据更新
    initRealTimeUpdates();
}

// 添加表格行悬停效果
function addTableHoverEffects() {
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
}

// 初始化图表（简单的统计图表）
function initCharts() {
    // 这里可以集成Chart.js或其他图表库
    // 目前使用简单的CSS图表
    initSimpleCharts();
}

// 初始化简单图表
function initSimpleCharts() {
    // 为统计数据添加动画效果
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(element => {
        animateValue(element, 0, parseFloat(element.textContent), 1000);
    });
}

// 数值动画
function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const isCurrency = element.textContent.includes('¥');
    const isInteger = end === Math.floor(end);
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * progress;
        const displayValue = isInteger ? Math.floor(current) : current.toFixed(2);
        
        element.textContent = isCurrency ? `¥${displayValue}` : displayValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// 初始化实时数据更新
function initRealTimeUpdates() {
    // 每30秒更新一次统计数据
    setInterval(updateDashboardStats, 30000);
}

// 更新仪表板统计数据
async function updateDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const stats = await response.json();
        
        // 更新显示
        updateStatDisplay('orderCount', stats.orderCount);
        updateStatDisplay('totalAmount', stats.totalAmount);
        updateStatDisplay('memberCount', stats.memberCount);
        updateStatDisplay('totalBalance', stats.totalBalance);
        
    } catch (error) {
        console.error('Update stats error:', error);
    }
}

// 更新统计显示
function updateStatDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        const isCurrency = element.textContent.includes('¥');
        const displayValue = isCurrency ? `¥${parseFloat(value).toFixed(2)}` : value;
        element.textContent = displayValue;
    }
}

// 批量操作
function batchOperation(operation, selectedIds) {
    if (selectedIds.length === 0) {
        showNotification('请选择要操作的项目', 'warning');
        return;
    }
    
    confirmDialog(`确定要${operation}选中的 ${selectedIds.length} 个项目吗？`, async () => {
        try {
            const response = await fetch(`/api/batch/${operation}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: selectedIds })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(`${operation}成功`, 'success');
                // 刷新页面或更新列表
                setTimeout(() => location.reload(), 1000);
            } else {
                showNotification(result.error || `${operation}失败`, 'error');
            }
        } catch (error) {
            console.error('Batch operation error:', error);
            showNotification(`${operation}失败`, 'error');
        }
    });
}

// 导出数据
function exportData(type, format = 'csv') {
    const url = `/api/export/${type}?format=${format}`;
    window.open(url, '_blank');
}

// 打印功能
function printContent(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>打印</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .no-print { display: none; }
                @media print {
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            ${element.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// 搜索功能
function setupSearch(searchInputId, resultsContainerId, searchFunction) {
    const searchInput = document.getElementById(searchInputId);
    const resultsContainer = document.getElementById(resultsContainerId);
    
    if (!searchInput || !resultsContainer) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchFunction(query, resultsContainer);
        }, 300);
    });
}

// 数据表格排序
function setupTableSort(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => sortTable(table, header.dataset.sort, header.dataset.sortType || 'string'));
    });
}

// 表格排序
function sortTable(table, column, type = 'string') {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.querySelector(`td[data-${column}]`)?.textContent || '';
        const bValue = b.querySelector(`td[data-${column}]`)?.textContent || '';
        
        switch (type) {
            case 'number':
                return parseFloat(aValue) - parseFloat(bValue);
            case 'date':
                return new Date(aValue) - new Date(bValue);
            default:
                return aValue.localeCompare(bValue);
        }
    });
    
    // 重新添加排序后的行
    rows.forEach(row => tbody.appendChild(row));
}

// 文件上传预览
function setupFileUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    input.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="预览" style="max-width: 200px; max-height: 200px;">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = `<div>文件名: ${file.name}</div><div>大小: ${(file.size / 1024).toFixed(2)} KB</div>`;
        }
    });
}

// 表单序列化
function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

// 确认删除
function confirmDelete(message = '确定要删除这个项目吗？') {
    return confirm(message);
}

// 显示操作结果
function showOperationResult(result, successMessage = '操作成功', errorMessage = '操作失败') {
    if (result.success) {
        showNotification(successMessage, 'success');
    } else {
        showNotification(result.error || errorMessage, 'error');
    }
}

// 刷新页面数据
function refreshPageData() {
    // 根据当前页面刷新相应的数据
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/admin/dashboard')) {
        updateDashboardStats();
    } else if (currentPath.includes('/admin/members')) {
        // 刷新会员列表
        searchMembers();
    } else if (currentPath.includes('/admin/dishes')) {
        // 刷新菜品列表
        location.reload();
    }
}

// 键盘快捷键
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+S 保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const saveButton = document.querySelector('[type="submit"]');
            if (saveButton) saveButton.click();
        }
        
        // Esc 关闭模态框
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
}

// 初始化键盘快捷键
setupKeyboardShortcuts();