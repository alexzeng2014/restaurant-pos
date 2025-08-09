// 厨房端JavaScript

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化厨房功能
    initKitchenFeatures();
    
    // 启动订单轮询
    startOrderPolling();
    
    // 设置键盘快捷键
    setupKeyboardShortcuts();
});

// 初始化厨房功能
function initKitchenFeatures() {
    // 更新统计数据
    updateKitchenStats();
    
    // 添加订单卡片动画
    addOrderCardAnimations();
    
    // 设置自动刷新
    setupAutoRefresh();
}

// 更新厨房统计数据
function updateKitchenStats() {
    const confirmedOrders = document.querySelectorAll('.order-card[data-status="confirmed"]');
    const preparingOrders = document.querySelectorAll('.order-card[data-status="preparing"]');
    
    const pendingCount = document.getElementById('pendingCount');
    const preparingCount = document.getElementById('preparingCount');
    
    if (pendingCount) pendingCount.textContent = confirmedOrders.length;
    if (preparingCount) preparingCount.textContent = preparingOrders.length;
}

// 添加订单卡片动画
function addOrderCardAnimations() {
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

// 设置自动刷新
function setupAutoRefresh() {
    // 每30秒刷新一次订单
    setInterval(() => {
        checkForNewOrders();
    }, 30000);
}

// 检查新订单
async function checkForNewOrders() {
    try {
        const response = await fetch('/kitchen/queue');
        const html = await response.text();
        
        // 创建临时DOM来解析新订单
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newOrderCards = tempDiv.querySelectorAll('.order-card');
        
        // 获取当前订单数量
        const currentOrders = document.querySelectorAll('.order-card');
        
        // 如果有新订单
        if (newOrderCards.length > currentOrders.length) {
            const newOrderCount = newOrderCards.length - currentOrders.length;
            showNewOrderNotification(newOrderCount);
            
            // 播放声音提醒
            playNotificationSound();
            
            // 可选：自动刷新页面
            // location.reload();
        }
        
    } catch (error) {
        console.error('Check new orders error:', error);
    }
}

// 显示新订单通知
function showNewOrderNotification(count) {
    const notification = document.createElement('div');
    notification.className = 'kitchen-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🔔</div>
            <div class="notification-text">
                <strong>新订单提醒</strong>
                <div>有 ${count} 个新订单待处理</div>
            </div>
            <button class="notification-close" onclick="this.closest('.kitchen-notification').remove()">×</button>
        </div>
    `;
    
    // 添加通知样式
    const style = document.createElement('style');
    style.textContent = `
        .kitchen-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #e74c3c;
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .notification-icon {
            font-size: 24px;
        }
        
        .notification-text {
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    if (!document.querySelector('style[data-kitchen-notification]')) {
        style.setAttribute('data-kitchen-notification', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // 5秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// 播放通知声音
function playNotificationSound() {
    try {
        // 创建简单的提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio notification not supported');
    }
}

// 更新订单状态
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/kitchen/order/${orderId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 更新UI
            updateOrderCardUI(orderId, status);
            updateKitchenStats();
            
            // 显示成功消息
            showNotification('订单状态更新成功', 'success');
            
            // 如果订单完成，设置定时移除
            if (status === 'ready') {
                setTimeout(() => {
                    removeOrderCard(orderId);
                }, 3000);
            }
        } else {
            showNotification(result.error || '更新失败', 'error');
        }
    } catch (error) {
        console.error('Update order status error:', error);
        showNotification('更新失败，请重试', 'error');
    }
}

// 更新订单卡片UI
function updateOrderCardUI(orderId, status) {
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (!orderCard) return;
    
    // 更新数据属性
    orderCard.dataset.status = status;
    
    // 更新状态徽章
    const statusBadge = orderCard.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = `status-badge status-${status}`;
        statusBadge.textContent = getStatusText(status);
    }
    
    // 更新操作按钮
    const actionsContainer = orderCard.querySelector('.order-actions');
    if (actionsContainer) {
        const orderTotal = actionsContainer.querySelector('.order-total');
        const totalText = orderTotal ? orderTotal.textContent : '';
        
        if (status === 'preparing') {
            actionsContainer.innerHTML = `
                <button class="btn btn-success" onclick="updateOrderStatus(${orderId}, 'ready')">
                    制作完成
                </button>
                <div class="order-total">${totalText}</div>
            `;
        } else if (status === 'ready') {
            actionsContainer.innerHTML = `
                <div class="order-completed">
                    <span class="completed-icon">✓</span>
                    <span>制作完成</span>
                </div>
                <div class="order-total">${totalText}</div>
            `;
        }
    }
    
    // 添加状态变化动画
    orderCard.classList.add('status-updated');
    setTimeout(() => {
        orderCard.classList.remove('status-updated');
    }, 1000);
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'confirmed': '待制作',
        'preparing': '制作中',
        'ready': '已完成',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 移除订单卡片
function removeOrderCard(orderId) {
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (orderCard) {
        orderCard.classList.add('removing');
        setTimeout(() => {
            orderCard.remove();
            checkEmptyState();
        }, 500);
    }
}

// 检查空状态
function checkEmptyState() {
    const ordersQueue = document.querySelector('.orders-queue');
    const orderCards = ordersQueue.querySelectorAll('.order-card');
    
    if (orderCards.length === 0) {
        ordersQueue.innerHTML = `
            <div class="no-orders">
                <div class="no-orders-icon">🍽️</div>
                <h3>暂无待处理订单</h3>
                <p>当前没有需要制作的订单</p>
            </div>
        `;
    }
}

// 设置键盘快捷键
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // 空格键：开始制作第一个待制作订单
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            const firstConfirmedOrder = document.querySelector('.order-card[data-status="confirmed"] button');
            if (firstConfirmedOrder) {
                firstConfirmedOrder.click();
            }
        }
        
        // Enter键：完成第一个制作中的订单
        if (e.code === 'Enter' && e.target === document.body) {
            e.preventDefault();
            const firstPreparingOrder = document.querySelector('.order-card[data-status="preparing"] button');
            if (firstPreparingOrder) {
                firstPreparingOrder.click();
            }
        }
        
        // R键：刷新页面
        if (e.code === 'KeyR' && e.target === document.body) {
            e.preventDefault();
            location.reload();
        }
    });
}

// 启动订单轮询
function startOrderPolling() {
    // 每30秒检查一次新订单
    setInterval(() => {
        checkForNewOrders();
    }, 30000);
}

// 打印订单
function printOrder(orderId) {
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (!orderCard) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>订单打印</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .order-card { border: 1px solid #000; padding: 20px; margin-bottom: 20px; }
                .order-header { border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                .order-items { margin-bottom: 10px; }
                .order-item { margin-bottom: 5px; }
                .order-total { font-weight: bold; font-size: 18px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            ${orderCard.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// 全屏模式
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// 添加状态更新动画样式
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    .status-updated {
        animation: statusPulse 1s ease;
    }
    
    @keyframes statusPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    .removing {
        animation: slideOut 0.5s ease;
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
document.head.appendChild(animationStyle);

// 导出功能
window.kitchenUtils = {
    updateOrderStatus,
    printOrder,
    toggleFullscreen,
    updateKitchenStats
};