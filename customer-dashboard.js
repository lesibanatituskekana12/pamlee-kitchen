// Enhanced Customer Dashboard with Real-time Features

// Session Check
const user = JSON.parse(localStorage.getItem('pamlee_user') || 'null');
if (!user) {
    alert('Please sign in first.');
    window.location.href = 'login.html';
}

// Order Status Configuration
const ORDER_STATUSES = {
    'placed': { label: 'Order Placed', color: '#3b82f6', icon: '📝', progress: 20 },
    'confirmed': { label: 'Confirmed', color: '#8b5cf6', icon: '✅', progress: 40 },
    'preparing': { label: 'Preparing', color: '#f59e0b', icon: '👨‍🍳', progress: 60 },
    'ready': { label: 'Ready', color: '#10b981', icon: '✨', progress: 80 },
    'out-for-delivery': { label: 'Out for Delivery', color: '#06b6d4', icon: '🚗', progress: 90 },
    'completed': { label: 'Completed', color: '#22c55e', icon: '🎉', progress: 100 },
    'cancelled': { label: 'Cancelled', color: '#ef4444', icon: '❌', progress: 0 }
};

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
        const name = user.email.split('@')[0];
        actionsDiv.insertAdjacentHTML('beforeend', `
            <span style="margin-left:1rem;">👤 Hi, ${name}</span>
            <a href="customer.html" class="btn btn-outline" style="margin-left:1rem;">My Orders</a>
            <button id="logoutBtn" class="btn btn-gold" style="margin-left:1rem;">Sign Out</button>
        `);
        
        mobileUserLinks.innerHTML = `
            <div style="border-top: 1px solid var(--border); margin-top: 0.5rem; padding-top: 0.5rem;">
                <a href="customer.html" class="nav-link active">📦 My Orders</a>
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
function initializeDashboard() {
    // Start real-time polling
    window.RealtimeOrders.startPolling('customer', user.email);
    
    // Subscribe to order updates
    window.RealtimeOrders.subscribe((orders) => {
        renderOrders(orders);
    });
    
    // Show notification for status changes
    let lastStatuses = {};
    window.RealtimeOrders.subscribe((orders) => {
        orders.forEach(order => {
            const lastStatus = lastStatuses[order.trackerId];
            if (lastStatus && lastStatus !== order.status) {
                const statusInfo = ORDER_STATUSES[order.status];
                showToast(`${statusInfo.icon} Order ${order.trackerId} is now ${statusInfo.label}`);
            }
            lastStatuses[order.trackerId] = order.status;
        });
    });
}

// Render Orders
function renderOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    if (!container) return;
    
    // Filter orders for current user
    const userOrders = orders.filter(o => o.userEmail === user.email);
    
    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="feature-card" style="padding:3rem;text-align:center;">
                <h3 style="margin-bottom:1rem;">No Orders Yet</h3>
                <p style="color:var(--muted-foreground);margin-bottom:2rem;">Start shopping to see your orders here!</p>
                <a href="menu.html" class="btn btn-gold">Browse Menu</a>
            </div>
        `;
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...userOrders].sort((a, b) => {
        const dateA = new Date(a.placedAt || a.placed_at);
        const dateB = new Date(b.placedAt || b.placed_at);
        return dateB - dateA;
    });
    
    container.innerHTML = sortedOrders.map(order => renderOrderCard(order)).join('');
}

// Render Single Order Card
function renderOrderCard(order) {
    const status = ORDER_STATUSES[order.status] || ORDER_STATUSES['placed'];
    const placedDate = new Date(order.placedAt || order.placed_at);
    
    return `
        <div class="customer-order-card">
            <div class="order-card-header">
                <div>
                    <h3>${status.icon} ${order.trackerId}</h3>
                    <p class="order-date">${placedDate.toLocaleDateString()} at ${placedDate.toLocaleTimeString()}</p>
                </div>
                <div class="order-total">R ${order.total.toFixed(2)}</div>
            </div>
            
            <!-- Progress Bar -->
            <div class="order-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${status.progress}%;background:${status.color};"></div>
                </div>
                <div class="progress-label" style="color:${status.color};">
                    ${status.icon} ${status.label}
                </div>
            </div>
            
            <!-- Order Details -->
            <div class="order-details-grid">
                <div class="detail-item">
                    <span class="detail-label">Payment</span>
                    <span class="detail-value">${order.paymentMethod.toUpperCase()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Fulfillment</span>
                    <span class="detail-value">${order.fulfilment === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}</span>
                </div>
                ${order.fulfilment === 'delivery' && order.deliveryLocation ? `
                    <div class="detail-item">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${order.deliveryLocation}</span>
                    </div>
                ` : ''}
            </div>
            
            <!-- Items Summary -->
            <div class="order-items-summary">
                <strong>Items (${order.items.length}):</strong>
                <div class="items-list">
                    ${order.items.map(item => `
                        <div class="item-row">
                            <span>${item.name} x${item.quantity}</span>
                            <span>R ${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Actions -->
            <div class="order-actions">
                <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${order.trackerId}')">
                    View Full Details
                </button>
                ${order.status !== 'completed' && order.status !== 'cancelled' ? `
                    <button class="btn btn-gold btn-sm" onclick="trackOrder('${order.trackerId}')">
                        Track Order
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// View Order Details
function viewOrderDetails(trackerId) {
    window.RealtimeOrders.getOrder(trackerId).then(order => {
        showOrderDetailsModal(order);
    }).catch(error => {
        showToast(`❌ ${error.message}`);
    });
}

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
                <!-- Status Progress -->
                <div class="order-progress" style="margin-bottom:2rem;">
                    <div class="progress-bar" style="height:12px;">
                        <div class="progress-fill" style="width:${status.progress}%;background:${status.color};"></div>
                    </div>
                    <div class="progress-label" style="color:${status.color};font-size:1.1rem;margin-top:0.75rem;">
                        ${status.icon} ${status.label}
                    </div>
                </div>
                
                <!-- Order Info -->
                <div class="order-details-box">
                    <div class="order-detail-row">
                        <span>Tracker ID:</span>
                        <strong>${order.trackerId}</strong>
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
                
                <!-- Items -->
                <h3 style="margin-top:1.5rem;margin-bottom:1rem;">Order Items</h3>
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
                
                <!-- Timeline -->
                <h3 style="margin-top:1.5rem;margin-bottom:1rem;">Order Timeline</h3>
                <div class="order-timeline">
                    ${(order.timeline || []).map(event => {
                        const eventStatus = ORDER_STATUSES[event.status] || { color: '#64748b' };
                        return `
                            <div class="timeline-event">
                                <div class="timeline-dot" style="background:${eventStatus.color};"></div>
                                <div class="timeline-content">
                                    <strong>${event.message}</strong>
                                    <small>${event.date}</small>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="checkout-footer">
                <button class="btn btn-outline" onclick="this.closest('.checkout-overlay').remove()">Close</button>
                ${order.status !== 'completed' && order.status !== 'cancelled' ? `
                    <button class="btn btn-gold" onclick="this.closest('.checkout-overlay').remove();trackOrder('${order.trackerId}')">Track Order</button>
                ` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Track Order (show live tracking)
function trackOrder(trackerId) {
    window.RealtimeOrders.getOrder(trackerId).then(order => {
        showTrackingModal(order);
    }).catch(error => {
        showToast(`❌ ${error.message}`);
    });
}

// Show Tracking Modal
function showTrackingModal(order) {
    const status = ORDER_STATUSES[order.status] || ORDER_STATUSES['placed'];
    
    const modal = document.createElement('div');
    modal.className = 'checkout-overlay';
    modal.id = 'trackingModal';
    modal.innerHTML = `
        <div class="checkout-modal" style="max-width:600px;">
            <div class="checkout-header">
                <h2>📍 Track Order</h2>
                <button class="btn-close-checkout" onclick="this.closest('.checkout-overlay').remove()">&times;</button>
            </div>
            
            <div class="checkout-body">
                <div style="text-align:center;margin-bottom:2rem;">
                    <div style="font-size:3rem;margin-bottom:1rem;">${status.icon}</div>
                    <h3 style="color:${status.color};margin-bottom:0.5rem;">${status.label}</h3>
                    <p style="color:var(--muted-foreground);">Tracker ID: ${order.trackerId}</p>
                </div>
                
                <!-- Status Steps -->
                <div class="tracking-steps">
                    ${Object.entries(ORDER_STATUSES).filter(([key]) => key !== 'cancelled').map(([key, val]) => {
                        const isActive = getStatusOrder(order.status) >= getStatusOrder(key);
                        const isCurrent = order.status === key;
                        return `
                            <div class="tracking-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}">
                                <div class="step-icon" style="${isActive ? `background:${val.color};` : ''}">${val.icon}</div>
                                <div class="step-label">${val.label}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Latest Update -->
                ${order.timeline && order.timeline.length > 0 ? `
                    <div class="latest-update">
                        <strong>Latest Update:</strong>
                        <p>${order.timeline[order.timeline.length - 1].message}</p>
                        <small>${order.timeline[order.timeline.length - 1].date}</small>
                    </div>
                ` : ''}
                
                <p style="text-align:center;color:var(--muted-foreground);margin-top:2rem;font-size:0.9rem;">
                    🔄 Updates automatically every 5 seconds
                </p>
            </div>
            
            <div class="checkout-footer">
                <button class="btn btn-outline" onclick="this.closest('.checkout-overlay').remove()">Close</button>
                <button class="btn btn-gold" onclick="this.closest('.checkout-overlay').remove();viewOrderDetails('${order.trackerId}')">View Details</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-refresh tracking modal
    const refreshInterval = setInterval(() => {
        if (!document.getElementById('trackingModal')) {
            clearInterval(refreshInterval);
            return;
        }
        
        window.RealtimeOrders.getOrder(trackerId).then(updatedOrder => {
            if (updatedOrder.status !== order.status) {
                // Status changed, refresh modal
                document.getElementById('trackingModal')?.remove();
                showTrackingModal(updatedOrder);
                clearInterval(refreshInterval);
            }
        });
    }, 5000);
}

// Get status order for comparison
function getStatusOrder(status) {
    const order = ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'completed'];
    return order.indexOf(status);
}

// Utility Functions
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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    window.RealtimeOrders.stopPolling();
});
