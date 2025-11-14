// Enhanced Admin Dashboard with Real-time Features

// Session Check
const user = JSON.parse(localStorage.getItem('pamlee_user') || 'null');
if (!user || user.role !== 'admin') {
    alert('Please sign in as admin first.');
    window.location.href = 'login.html';
}

// Check if user has a valid token
if (!user.token) {
    console.warn('No authentication token found. Please log in again.');
    alert('Your session has expired. Please log in again.');
    localStorage.removeItem('pamlee_user');
    window.location.href = 'login.html';
}

// Order Status Options
const ORDER_STATUSES = {
    'placed': { label: 'Placed', color: '#3b82f6', icon: '📝' },
    'confirmed': { label: 'Confirmed', color: '#8b5cf6', icon: '✅' },
    'preparing': { label: 'Preparing', color: '#f59e0b', icon: '👨‍🍳' },
    'ready': { label: 'Ready', color: '#10b981', icon: '✨' },
    'out-for-delivery': { label: 'Out for Delivery', color: '#06b6d4', icon: '🚗' },
    'completed': { label: 'Completed', color: '#22c55e', icon: '🎉' },
    'cancelled': { label: 'Cancelled', color: '#ef4444', icon: '❌' }
};

// Utility Functions (defined early to avoid hoisting issues)
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function playNotificationSound() {
    try {
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
        console.error('Error playing notification sound:', error);
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    initializeDashboard();
});

// Setup Navbar
function setupNavbar() {
    const actionsDiv = document.getElementById('userActions');
    const mobileUserLinks = document.getElementById('mobileUserLinks');
    
    if (user) {
        actionsDiv.insertAdjacentHTML('beforeend', `
            <span style="margin-left:1rem;">👤 Admin</span>
            <a href="admin.html" class="btn btn-outline" style="margin-left:1rem;">Dashboard</a>
            <button id="logoutBtn" class="btn btn-gold" style="margin-left:1rem;">Sign Out</button>
        `);
        
        mobileUserLinks.innerHTML = `
            <div style="border-top: 1px solid var(--border); margin-top: 0.5rem; padding-top: 0.5rem;">
                <a href="admin.html" class="nav-link active">⚙️ Admin Dashboard</a>
                <a href="#" class="nav-link" id="mobileLogoutBtn">🚪 Sign Out</a>
            </div>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('mobileLogoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

function logout() {
    localStorage.removeItem('pamlee_user');
    alert('You have been signed out.');
    window.location.href = 'login.html';
}

// Initialize Dashboard
async function initializeDashboard() {
    // Check if RealtimeOrders is available
    if (!window.RealtimeOrders) {
        console.error('RealtimeOrders not loaded!');
        showToast('❌ Error: Real-time system not available. Please refresh the page.');
        
        // Show loading state
        document.getElementById('ordersContainer').innerHTML = `
            <h2 style="margin-bottom:1rem;">Recent Orders</h2>
            <div class="feature-card" style="padding:2rem;text-align:center;">
                <p style="color:var(--muted-foreground);">❌ Real-time system not available. Please refresh the page.</p>
            </div>
        `;
        return;
    }

    try {
        // Show loading state
        document.getElementById('ordersContainer').innerHTML = `
            <h2 style="margin-bottom:1rem;">Recent Orders</h2>
            <div class="feature-card" style="padding:2rem;text-align:center;">
                <p style="color:var(--muted-foreground);">⏳ Loading orders...</p>
            </div>
        `;
        
        // Subscribe to order updates first
        window.RealtimeOrders.subscribe((orders) => {
            console.log('Orders received:', orders.length);
            updateStats(orders);
            renderOrders(orders);
        });
        
        // Play notification sound for new orders
        let lastOrderCount = 0;
        window.RealtimeOrders.subscribe((orders) => {
            const newOrderCount = orders.filter(o => o.status === 'placed').length;
            if (newOrderCount > lastOrderCount && lastOrderCount > 0) {
                playNotificationSound();
                showToast('🔔 New order received!');
            }
            lastOrderCount = newOrderCount;
        });
        
        // Start real-time polling (this will trigger the subscriptions)
        console.log('Starting polling...');
        await window.RealtimeOrders.startPolling('admin');
        console.log('Polling started');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showToast('❌ Error loading orders. Please refresh the page.');
        
        document.getElementById('ordersContainer').innerHTML = `
            <h2 style="margin-bottom:1rem;">Recent Orders</h2>
            <div class="feature-card" style="padding:2rem;text-align:center;">
                <p style="color:var(--muted-foreground);">❌ Error: ${error.message}</p>
                <button class="btn btn-gold" onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

// Update Statistics
function updateStats(orders) {
    const stats = window.RealtimeOrders.getStats();
    
    // Safely update stats with fallbacks
    document.getElementById('totalOrders').textContent = stats.total || 0;
    
    // Fix NaN revenue issue
    const revenue = isNaN(stats.revenue) ? 0 : stats.revenue;
    document.getElementById('totalRevenue').textContent = `R ${revenue.toFixed(2)}`;
    
    document.getElementById('pendingOrders').textContent = (stats.pending || 0) + (stats.preparing || 0);
    
    // Get product count from API or default
    fetch('/api/products')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalProducts').textContent = data.products.length;
            }
        })
        .catch(() => {
            document.getElementById('totalProducts').textContent = '8';
        });
}

// Render Orders
function renderOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <h2 style="margin-bottom:1rem;">Recent Orders</h2>
            <div class="feature-card" style="padding:2rem;text-align:center;">
                <p style="color:var(--muted-foreground);">No orders yet</p>
            </div>
        `;
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.placedAt || a.placed_at);
        const dateB = new Date(b.placedAt || b.placed_at);
        return dateB - dateA;
    });
    
    container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h2>Recent Orders (${orders.length})</h2>
            <div style="display:flex;gap:0.5rem;">
                <button class="btn btn-outline btn-sm" onclick="filterOrders('all')">All</button>
                <button class="btn btn-outline btn-sm" onclick="filterOrders('placed')">New</button>
                <button class="btn btn-outline btn-sm" onclick="filterOrders('preparing')">Preparing</button>
                <button class="btn btn-outline btn-sm" onclick="filterOrders('ready')">Ready</button>
            </div>
        </div>
        <div id="ordersList">
            ${sortedOrders.map(order => renderOrderCard(order)).join('')}
        </div>
    `;
}

// Render Single Order Card
function renderOrderCard(order) {
    const status = ORDER_STATUSES[order.status] || ORDER_STATUSES['placed'];
    const placedDate = new Date(order.placedAt || order.placed_at);
    const timeAgo = getTimeAgo(placedDate);
    
    return `
        <div class="admin-order-card" data-status="${order.status}">
            <div class="order-card-header">
                <div>
                    <h3>${status.icon} ${order.trackerId}</h3>
                    <p class="order-meta">${order.userEmail} • ${timeAgo}</p>
                </div>
                <div class="order-status-badge" style="background:${status.color};">
                    ${status.label}
                </div>
            </div>
            
            <div class="order-card-body">
                <div class="order-info-grid">
                    <div class="order-info-item">
                        <span class="info-label">Payment</span>
                        <span class="info-value">${order.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div class="order-info-item">
                        <span class="info-label">Fulfillment</span>
                        <span class="info-value">${order.fulfilment === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}</span>
                    </div>
                    <div class="order-info-item">
                        <span class="info-label">Total</span>
                        <span class="info-value" style="color:var(--secondary);font-weight:700;">R ${order.total.toFixed(2)}</span>
                    </div>
                </div>
                
                ${order.fulfilment === 'delivery' && order.deliveryLocation ? `
                    <div class="delivery-info">
                        <strong>📍 Delivery Details:</strong>
                        <p>${order.deliveryLocation}</p>
                        <p style="font-size:0.9rem;color:var(--muted-foreground);">${order.deliveryAddress || 'N/A'}</p>
                    </div>
                ` : ''}
                
                <div class="order-items">
                    <strong>Items:</strong>
                    <ul>
                        ${order.items.map(item => `
                            <li>${item.name} x${item.quantity} - R ${(item.price * item.quantity).toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="order-actions">
                    <select class="status-select" onchange="updateOrderStatus('${order.trackerId}', this.value)">
                        ${Object.entries(ORDER_STATUSES).map(([key, val]) => `
                            <option value="${key}" ${order.status === key ? 'selected' : ''}>${val.icon} ${val.label}</option>
                        `).join('')}
                    </select>
                    <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${order.trackerId}')">View Details</button>
                </div>
            </div>
        </div>
    `;
}

// Update Order Status
async function updateOrderStatus(trackerId, newStatus) {
    if (!window.RealtimeOrders) {
        showToast('❌ Real-time system not available');
        return;
    }
    
    try {
        const note = prompt('Add a note (optional):');
        await window.RealtimeOrders.updateOrderStatus(trackerId, newStatus, note || '');
        showToast(`✅ Order ${trackerId} updated to ${ORDER_STATUSES[newStatus].label}`);
    } catch (error) {
        console.error('Error updating order:', error);
        showToast(`❌ Failed to update order: ${error.message}`);
    }
}

// Filter Orders
function filterOrders(status) {
    const cards = document.querySelectorAll('.admin-order-card');
    cards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// View Order Details
function viewOrderDetails(trackerId) {
    if (!window.RealtimeOrders) {
        showToast('❌ Real-time system not available');
        return;
    }
    
    window.RealtimeOrders.getOrder(trackerId).then(order => {
        if (order) {
            showOrderDetailsModal(order);
        } else {
            showToast('❌ Order not found');
        }
    }).catch(error => {
        console.error('Error fetching order:', error);
        showToast(`❌ ${error.message}`);
    });
}

// Expose functions globally for onclick handlers
window.updateOrderStatus = updateOrderStatus;
window.filterOrders = filterOrders;
window.viewOrderDetails = viewOrderDetails;

// Show Order Details Modal
function showOrderDetailsModal(order) {
    const status = ORDER_STATUSES[order.status] || ORDER_STATUSES['placed'];
    const placedDate = new Date(order.placedAt || order.placed_at);
    
    const modal = document.createElement('div');
    modal.className = 'checkout-overlay';
    modal.innerHTML = `
        <div class="checkout-modal" style="max-width:700px;">
            <div class="checkout-header">
                <h2>${status.icon} Order Details</h2>
                <button class="btn-close-checkout" onclick="this.closest('.checkout-overlay').remove()">&times;</button>
            </div>
            
            <div class="checkout-body">
                <div class="order-details-box">
                    <div class="order-detail-row">
                        <span>Tracker ID:</span>
                        <strong>${order.trackerId}</strong>
                    </div>
                    <div class="order-detail-row">
                        <span>Customer:</span>
                        <strong>${order.userEmail}</strong>
                    </div>
                    <div class="order-detail-row">
                        <span>Status:</span>
                        <strong style="color:${status.color};">${status.label}</strong>
                    </div>
                    <div class="order-detail-row">
                        <span>Placed:</span>
                        <strong>${placedDate.toLocaleString()}</strong>
                    </div>
                    <div class="order-detail-row">
                        <span>Payment:</span>
                        <strong>${order.paymentMethod.toUpperCase()}</strong>
                    </div>
                    <div class="order-detail-row">
                        <span>Fulfillment:</span>
                        <strong>${order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</strong>
                    </div>
                    ${order.fulfilment === 'delivery' ? `
                        <div class="order-detail-row">
                            <span>Location:</span>
                            <strong>${order.deliveryLocation || 'N/A'}</strong>
                        </div>
                        <div class="order-detail-row">
                            <span>Address:</span>
                            <strong>${order.deliveryAddress || 'N/A'}</strong>
                        </div>
                    ` : ''}
                </div>
                
                <h3 style="margin-top:1.5rem;margin-bottom:1rem;">Items</h3>
                <div class="order-summary">
                    ${order.items.map(item => `
                        <div class="summary-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>R ${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="summary-divider"></div>
                    <div class="summary-item">
                        <span>Subtotal</span>
                        <span>R ${order.subtotal.toFixed(2)}</span>
                    </div>
                    ${order.deliveryFee > 0 ? `
                        <div class="summary-item">
                            <span>Delivery Fee</span>
                            <span>R ${order.deliveryFee.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-item summary-subtotal">
                        <span>Total</span>
                        <span>R ${order.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <h3 style="margin-top:1.5rem;margin-bottom:1rem;">Timeline</h3>
                <div class="order-timeline">
                    ${(order.timeline || []).map(event => `
                        <div class="timeline-event">
                            <div class="timeline-dot" style="background:${ORDER_STATUSES[event.status]?.color || '#64748b'};"></div>
                            <div class="timeline-content">
                                <strong>${event.message}</strong>
                                <small>${event.date}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="checkout-footer">
                <button class="btn btn-outline" onclick="this.closest('.checkout-overlay').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.RealtimeOrders && typeof window.RealtimeOrders.stopPolling === 'function') {
        window.RealtimeOrders.stopPolling();
    }
});
