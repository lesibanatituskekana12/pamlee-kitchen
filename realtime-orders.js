// Real-time Orders System
// Handles real-time order updates using polling and BroadcastChannel

const API_BASE = 'http://localhost:3000/api';
const POLL_INTERVAL = 5000; // Poll every 5 seconds

class RealtimeOrders {
    constructor() {
        this.orders = [];
        this.listeners = [];
        this.pollTimer = null;
        this.channel = this.initBroadcastChannel();
    }

    // Initialize BroadcastChannel for cross-tab communication
    initBroadcastChannel() {
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('pamlee_orders_realtime');
            channel.addEventListener('message', (e) => {
                if (e.data.type === 'order_update') {
                    this.notifyListeners(e.data.orders);
                }
            });
            return channel;
        }
        return null;
    }

    // Start polling for orders
    startPolling(userRole = 'customer', userEmail = null) {
        this.stopPolling();
        
        // Initial fetch
        this.fetchOrders(userRole, userEmail);
        
        // Poll every 5 seconds
        this.pollTimer = setInterval(() => {
            this.fetchOrders(userRole, userEmail);
        }, POLL_INTERVAL);
    }

    // Stop polling
    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }

    // Fetch orders from API
    async fetchOrders(userRole = 'customer', userEmail = null) {
        try {
            const user = JSON.parse(localStorage.getItem('pamlee_user'));
            
            if (!user && userRole !== 'guest') {
                // Fallback to localStorage for guest users
                this.orders = JSON.parse(localStorage.getItem('pamlee_orders') || '[]');
                this.notifyListeners(this.orders);
                return;
            }

            const token = user?.token;
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/orders`, { headers });
            
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            
            if (data.success) {
                this.orders = data.orders;
                
                // Broadcast to other tabs
                if (this.channel) {
                    this.channel.postMessage({
                        type: 'order_update',
                        orders: this.orders
                    });
                }
                
                this.notifyListeners(this.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            
            // Fallback to localStorage
            this.orders = JSON.parse(localStorage.getItem('pamlee_orders') || '[]');
            this.notifyListeners(this.orders);
        }
    }

    // Update order status (admin only)
    async updateOrderStatus(trackerId, status, note = '') {
        try {
            const user = JSON.parse(localStorage.getItem('pamlee_user'));
            
            if (!user || user.role !== 'admin') {
                throw new Error('Admin access required');
            }

            const response = await fetch(`${API_BASE}/orders/${trackerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status, note })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update order');
            }

            // Immediately fetch updated orders
            await this.fetchOrders('admin');
            
            return data;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    // Get single order by tracker ID
    async getOrder(trackerId) {
        try {
            const response = await fetch(`${API_BASE}/orders/${trackerId}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Order not found');
            }

            return data.order;
        } catch (error) {
            console.error('Error fetching order:', error);
            
            // Fallback to localStorage
            const orders = JSON.parse(localStorage.getItem('pamlee_orders') || '[]');
            const order = orders.find(o => o.trackerId === trackerId);
            
            if (!order) {
                throw new Error('Order not found');
            }
            
            return order;
        }
    }

    // Subscribe to order updates
    subscribe(callback) {
        this.listeners.push(callback);
        
        // Immediately call with current orders
        if (this.orders.length > 0) {
            callback(this.orders);
        }
        
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    // Notify all listeners
    notifyListeners(orders) {
        this.listeners.forEach(callback => {
            try {
                callback(orders);
            } catch (error) {
                console.error('Error in order listener:', error);
            }
        });
    }

    // Get order statistics
    getStats() {
        const stats = {
            total: this.orders.length,
            pending: 0,
            preparing: 0,
            ready: 0,
            completed: 0,
            cancelled: 0,
            revenue: 0
        };

        this.orders.forEach(order => {
            stats[order.status] = (stats[order.status] || 0) + 1;
            if (order.status !== 'cancelled') {
                stats.revenue += order.total;
            }
        });

        return stats;
    }
}

// Create global instance
window.RealtimeOrders = new RealtimeOrders();
