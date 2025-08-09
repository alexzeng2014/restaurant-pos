// 点餐端JavaScript

// 购物车管理
class Cart {
    constructor() {
        this.items = [];
        this.loadFromStorage();
    }
    
    // 从本地存储加载购物车
    loadFromStorage() {
        const saved = storage.get('cart');
        if (saved) {
            this.items = saved;
        }
    }
    
    // 保存到本地存储
    saveToStorage() {
        storage.set('cart', this.items);
    }
    
    // 添加商品到购物车
    addItem(dishId, name, price, quantity = 1) {
        const existingItem = this.items.find(item => item.dishId === dishId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                dishId,
                name,
                price,
                quantity
            });
        }
        
        this.saveToStorage();
        this.updateDisplay();
        showNotification(`${name} 已添加到购物车`, 'success');
    }
    
    // 从购物车移除商品
    removeItem(dishId) {
        this.items = this.items.filter(item => item.dishId !== dishId);
        this.saveToStorage();
        this.updateDisplay();
    }
    
    // 更新商品数量
    updateQuantity(dishId, quantity) {
        const item = this.items.find(item => item.dishId === dishId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(dishId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateDisplay();
            }
        }
    }
    
    // 清空购物车
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateDisplay();
    }
    
    // 获取购物车总数量
    getTotalQuantity() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    // 获取购物车总金额
    getTotalAmount() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // 更新购物车显示
    updateDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (cartCount) cartCount.textContent = this.getTotalQuantity();
        if (cartTotal) cartTotal.textContent = formatCurrency(this.getTotalAmount());
        if (checkoutBtn) checkoutBtn.disabled = this.items.length === 0;
        
        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = '<div class="empty-cart">购物车为空</div>';
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${formatCurrency(item.price)}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="cart.updateQuantity(${item.dishId}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity(${item.dishId}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="cart.removeItem(${item.dishId})">&times;</button>
                    </div>
                `).join('');
            }
        }
    }
    
    // 获取购物车数据（用于提交订单）
    getItemsForOrder() {
        return this.items.map(item => ({
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
        }));
    }
}

// 创建购物车实例
const cart = new Cart();

// 添加商品到购物车
function addToCart(dishId, name, price) {
    cart.addItem(dishId, name, price);
}

// 从本地存储加载购物车
function loadCartFromStorage() {
    cart.loadFromStorage();
    cart.updateDisplay();
}

// 跳转到结账页面
function goToCheckout() {
    if (cart.items.length === 0) {
        showNotification('购物车为空', 'warning');
        return;
    }
    
    window.location.href = `/order/checkout?tableId=${tableId}`;
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 订单管理
class OrderManager {
    constructor() {
        this.currentOrder = null;
    }
    
    // 创建订单
    async createOrder(orderData) {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentOrder = result.order;
                cart.clear();
                showNotification('订单创建成功！', 'success');
                return result;
            } else {
                showNotification(result.error || '订单创建失败', 'error');
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    }
    
    // 获取订单状态
    async getOrderStatus(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            const result = await response.json();
            
            if (result) {
                return result;
            } else {
                throw new Error('获取订单状态失败');
            }
        } catch (error) {
            console.error('Get order status error:', error);
            throw error;
        }
    }
    
    // 轮询订单状态
    pollOrderStatus(orderId, callback) {
        const interval = setInterval(async () => {
            try {
                const order = await this.getOrderStatus(orderId);
                if (callback) callback(order);
                
                // 如果订单已完成或取消，停止轮询
                if (['completed', 'cancelled'].includes(order.status)) {
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Poll order status error:', error);
                clearInterval(interval);
            }
        }, 3000); // 每3秒查询一次
        
        return interval;
    }
}

// 创建订单管理器实例
const orderManager = new OrderManager();

// 支付处理
class PaymentManager {
    constructor() {
        this.paymentMethods = {
            cash: '现金',
            wechat: '微信支付',
            alipay: '支付宝',
            balance: '余额支付'
        };
    }
    
    // 处理余额支付
    async processBalancePayment(orderData) {
        if (!currentMember) {
            throw new Error('请先登录会员账号');
        }
        
        const balanceNeeded = orderData.finalAmount;
        const memberBalance = parseFloat(currentMember.balance);
        
        if (memberBalance < balanceNeeded) {
            throw new Error('余额不足');
        }
        
        orderData.paymentMethod = 'balance';
        orderData.balanceUsed = balanceNeeded;
        orderData.cashAmount = 0;
        
        return orderData;
    }
    
    // 处理混合支付
    async processMixedPayment(orderData, balanceAmount) {
        if (!currentMember) {
            throw new Error('请先登录会员账号');
        }
        
        const memberBalance = parseFloat(currentMember.balance);
        
        if (memberBalance < balanceAmount) {
            throw new Error('余额不足');
        }
        
        orderData.paymentMethod = 'mixed';
        orderData.balanceUsed = balanceAmount;
        orderData.cashAmount = orderData.finalAmount - balanceAmount;
        
        return orderData;
    }
    
    // 处理现金支付
    processCashPayment(orderData) {
        orderData.paymentMethod = 'cash';
        orderData.balanceUsed = 0;
        orderData.cashAmount = orderData.finalAmount;
        
        return orderData;
    }
}

// 创建支付管理器实例
const paymentManager = new PaymentManager();

// 菜单搜索和筛选
class MenuManager {
    constructor() {
        this.currentCategory = '';
        this.searchTerm = '';
        this.dishes = [];
    }
    
    // 筛选菜品
    filterDishes(dishes, category = '', search = '') {
        return dishes.filter(dish => {
            const matchCategory = !category || 
                (dish.Category && dish.Category.id.toString() === category.toString());
            
            const matchSearch = !search || 
                dish.name.toLowerCase().includes(search.toLowerCase()) ||
                (dish.description && dish.description.toLowerCase().includes(search.toLowerCase()));
            
            return matchCategory && matchSearch;
        });
    }
    
    // 排序菜品
    sortDishes(dishes, sortBy = 'default') {
        switch (sortBy) {
            case 'price-asc':
                return dishes.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return dishes.sort((a, b) => b.price - a.price);
            case 'popularity':
                return dishes.sort((a, b) => b.soldCount - a.soldCount);
            case 'name':
                return dishes.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return dishes;
        }
    }
}

// 创建菜单管理器实例
const menuManager = new MenuManager();

// 用户界面管理
class UIManager {
    constructor() {
        this.isLoading = false;
    }
    
    // 显示加载状态
    showLoading(element) {
        this.isLoading = true;
        if (element) {
            element.disabled = true;
            element.innerHTML = '<div class="loading"></div> 处理中...';
        }
    }
    
    // 隐藏加载状态
    hideLoading(element, originalText) {
        this.isLoading = false;
        if (element) {
            element.disabled = false;
            element.innerHTML = originalText;
        }
    }
    
    // 更新用户显示
    updateUserDisplay(member) {
        const userInfo = document.getElementById('userInfo');
        if (!userInfo) return;
        
        if (member) {
            userInfo.innerHTML = `
                <div class="member-info">
                    <span>欢迎, ${member.name || member.phone}</span>
                    <button class="btn btn-sm" onclick="guestMode()">退出</button>
                </div>
            `;
        } else {
            userInfo.innerHTML = `
                <button class="btn btn-sm" onclick="showLoginModal()">会员登录</button>
                <button class="btn btn-sm btn-secondary" onclick="guestMode()">游客模式</button>
            `;
        }
    }
    
    // 显示订单确认对话框
    showOrderConfirmation(orderData, callback) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>确认订单</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="order-summary">
                        <h4>订单信息</h4>
                        <div class="order-items">
                            ${orderData.items.map(item => `
                                <div class="summary-item">
                                    <span>${item.name} x ${item.quantity}</span>
                                    <span>${formatCurrency(item.subtotal)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-total">
                            <strong>总计: ${formatCurrency(orderData.finalAmount)}</strong>
                        </div>
                    </div>
                    <div class="payment-methods">
                        <h4>支付方式</h4>
                        <div class="payment-options">
                            ${this.getPaymentOptions(orderData)}
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                        <button class="btn btn-primary" onclick="confirmOrder(this, ${JSON.stringify(orderData).replace(/"/g, '&quot;')})">确认支付</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 点击外部关闭
        modal.onclick = function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        };
    }
    
    // 获取支付选项
    getPaymentOptions(orderData) {
        let options = `
            <label>
                <input type="radio" name="paymentMethod" value="cash" checked>
                现金支付
            </label>
        `;
        
        if (currentMember && parseFloat(currentMember.balance) > 0) {
            const canPayFull = parseFloat(currentMember.balance) >= orderData.finalAmount;
            
            if (canPayFull) {
                options += `
                    <label>
                        <input type="radio" name="paymentMethod" value="balance">
                        余额支付 (${formatCurrency(currentMember.balance)})
                    </label>
                `;
            } else {
                options += `
                    <label>
                        <input type="radio" name="paymentMethod" value="mixed">
                        混合支付 (余额${formatCurrency(currentMember.balance)} + 现金${formatCurrency(orderData.finalAmount - parseFloat(currentMember.balance))})
                    </label>
                `;
            }
        }
        
        return options;
    }
}

// 创建UI管理器实例
const uiManager = new UIManager();

// 确认订单
async function confirmOrder(button, orderData) {
    const modal = button.closest('.modal');
    const selectedPayment = modal.querySelector('input[name="paymentMethod"]:checked');
    
    if (!selectedPayment) {
        showNotification('请选择支付方式', 'warning');
        return;
    }
    
    const paymentMethod = selectedPayment.value;
    
    try {
        uiManager.showLoading(button);
        
        // 处理支付方式
        let processedOrder = { ...orderData };
        
        switch (paymentMethod) {
            case 'balance':
                processedOrder = await paymentManager.processBalancePayment(processedOrder);
                break;
            case 'mixed':
                processedOrder = await paymentManager.processMixedPayment(processedOrder, parseFloat(currentMember.balance));
                break;
            default:
                processedOrder = paymentManager.processCashPayment(processedOrder);
        }
        
        // 创建订单
        const result = await orderManager.createOrder(processedOrder);
        
        modal.remove();
        
        // 显示订单成功页面
        showOrderSuccess(result.order);
        
    } catch (error) {
        console.error('Confirm order error:', error);
        showNotification(error.message || '订单创建失败', 'error');
    } finally {
        uiManager.hideLoading(button, '确认支付');
    }
}

// 显示订单成功页面
function showOrderSuccess(order) {
    const successHtml = `
        <div class="order-success">
            <div class="success-icon">✓</div>
            <h2>订单创建成功！</h2>
            <div class="order-info">
                <p><strong>订单号:</strong> ${order.orderNumber}</p>
                <p><strong>餐桌:</strong> ${order.Table ? order.Table.name || order.Table.number : ''}</p>
                <p><strong>金额:</strong> ${formatCurrency(order.finalAmount)}</p>
                <p><strong>状态:</strong> ${getOrderStatusText(order.status)}</p>
            </div>
            <div class="success-actions">
                <button class="btn btn-primary" onclick="window.location.href='/order/tables?tableId=${order.tableId}'">继续点餐</button>
                <button class="btn btn-secondary" onclick="window.location.href='/'">返回首页</button>
            </div>
        </div>
    `;
    
    document.body.innerHTML = successHtml;
    document.body.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f8f9fa;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
}

// 获取订单状态文本
function getOrderStatusText(status) {
    const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'preparing': '制作中',
        'ready': '待取餐',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化购物车显示
    cart.updateDisplay();
    
    // 设置用户显示
    if (typeof currentMember !== 'undefined') {
        uiManager.updateUserDisplay(currentMember);
    }
    
    // 添加键盘快捷键
    document.addEventListener('keydown', function(e) {
        // Esc 键关闭模态框
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
});