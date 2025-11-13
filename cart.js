// ============================
// Shopping Cart with localStorage
// ============================

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Add item to cart
function addToCart(id, name, price, image) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }

    saveCart(cart);
    showNotification('Added to cart!');
}

// Remove item from cart
function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
}

// Update item quantity
function updateQuantity(id, change) {
    const cart = getCart();
    const item = cart.find(item => item.id === id);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart(cart);
        }
    }
}

// Calculate cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart UI
function updateCartUI() {
    const cart = getCart();
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartBtn = document.getElementById('cartBtn');

    // Update cart count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        const oldCount = parseInt(cartCount.textContent) || 0;
        
        // Update badge content and visibility using class
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.add('has-items');
        } else {
            cartCount.textContent = '';
            cartCount.classList.remove('has-items');
        }
        
        // Trigger bounce animation when items are added
        if (totalItems > oldCount && cartBtn) {
            cartBtn.classList.remove('bounce');
            void cartBtn.offsetWidth; // Trigger reflow
            cartBtn.classList.add('bounce');
            setTimeout(() => cartBtn.classList.remove('bounce'), 500);
        }
    }

    // Update cart items display
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">R ${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                            <button class="btn btn-sm" onclick="removeFromCart('${item.id}')" style="margin-left:auto;background:#ef4444;color:white;">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Update cart total
    if (cartTotal) {
        cartTotal.textContent = `R ${getCartTotal().toFixed(2)}`;
    }
}

// ============================
// CHECKOUT WITH REAL-TIME ORDER SYSTEM
// ============================

// Generate unique tracker ID
function generateTrackerId() {
    return 'PL-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// BroadcastChannel (with fallback)
const orderChannel = (() => {
    if (window.BroadcastChannel) {
        const ch = new BroadcastChannel('pamlee_orders');
        return {
            post: (data) => ch.postMessage(data),
            listen: (cb) => ch.addEventListener('message', e => cb(e.data))
        };
    } else {
        return {
            post: (data) => localStorage.setItem('pamlee_orders_event', JSON.stringify({ data, t: Date.now() })),
            listen: (cb) => window.addEventListener('storage', e => {
                if (e.key === 'pamlee_orders_event' && e.newValue) {
                    cb(JSON.parse(e.newValue).data);
                }
            })
        };
    }
})();

// Create order and notify admin
function createOrder(order) {
    const all = JSON.parse(localStorage.getItem('pamlee_orders') || '[]');
    all.unshift(order);
    localStorage.setItem('pamlee_orders', JSON.stringify(all));
    orderChannel.post({ type: 'new_order', order });
}

// Location-based delivery fees
const DELIVERY_ZONES = {
    'giyani-central': { name: 'Giyani Central', fee: 30 },
    'giyani-suburbs': { name: 'Giyani Suburbs', fee: 50 },
    'nearby-towns': { name: 'Nearby Towns (10-20km)', fee: 80 },
    'far-areas': { name: 'Far Areas (20km+)', fee: 120 }
};

// Checkout function (shows enhanced modal)
function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    const subtotal = getCartTotal();

    // Build enhanced checkout modal
    const modal = document.createElement('div');
    modal.id = 'checkoutModal';
    modal.innerHTML = `
        <div class="checkout-overlay">
          <div class="checkout-modal">
            <div class="checkout-header">
              <h2>Complete Your Order</h2>
              <button class="btn-close-checkout" onclick="this.closest('.checkout-overlay').remove()">&times;</button>
            </div>
            
            <div class="checkout-body">
              <!-- Order Summary -->
              <div class="checkout-section">
                <h3>📦 Order Summary</h3>
                <div class="order-summary">
                  ${cart.map(item => `
                    <div class="summary-item">
                      <span>${item.name} x${item.quantity}</span>
                      <span>R ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  `).join('')}
                  <div class="summary-divider"></div>
                  <div class="summary-item summary-subtotal">
                    <span>Subtotal</span>
                    <span>R ${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="checkout-section">
                <h3>💳 Payment Method</h3>
                <div class="payment-options">
                  <label class="payment-option">
                    <input type="radio" name="payment" value="cash" checked>
                    <div class="payment-card">
                      <div class="payment-icon">💵</div>
                      <div class="payment-info">
                        <strong>Cash</strong>
                        <small>Pay on delivery/pickup</small>
                      </div>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input type="radio" name="payment" value="card">
                    <div class="payment-card">
                      <div class="payment-icon">💳</div>
                      <div class="payment-info">
                        <strong>Card</strong>
                        <small>Debit or Credit Card</small>
                      </div>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input type="radio" name="payment" value="eft">
                    <div class="payment-card">
                      <div class="payment-icon">🏦</div>
                      <div class="payment-info">
                        <strong>EFT</strong>
                        <small>Bank Transfer</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Fulfillment Method -->
              <div class="checkout-section">
                <h3>🚚 Fulfillment Method</h3>
                <div class="fulfillment-options">
                  <label class="fulfillment-option">
                    <input type="radio" name="fulfillment" value="pickup" checked onchange="updateCheckoutTotal()">
                    <div class="fulfillment-card">
                      <div class="fulfillment-icon">🏪</div>
                      <div class="fulfillment-info">
                        <strong>Pickup</strong>
                        <small>Collect from our store</small>
                        <span class="fulfillment-fee">FREE</span>
                      </div>
                    </div>
                  </label>
                  <label class="fulfillment-option">
                    <input type="radio" name="fulfillment" value="delivery" onchange="updateCheckoutTotal()">
                    <div class="fulfillment-card">
                      <div class="fulfillment-icon">🚗</div>
                      <div class="fulfillment-info">
                        <strong>Delivery</strong>
                        <small>We deliver to you</small>
                        <span class="fulfillment-fee" id="deliveryFeeLabel">Select location</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Delivery Location (shown when delivery is selected) -->
              <div class="checkout-section" id="deliveryLocationSection" style="display:none;">
                <h3>📍 Delivery Location</h3>
                <select id="deliveryZone" class="delivery-zone-select" onchange="updateCheckoutTotal()">
                  <option value="">Select your location</option>
                  ${Object.entries(DELIVERY_ZONES).map(([key, zone]) => `
                    <option value="${key}">${zone.name} - R ${zone.fee}</option>
                  `).join('')}
                </select>
                <input type="text" id="deliveryAddress" class="delivery-address-input" placeholder="Enter your full delivery address" style="margin-top:0.75rem;">
              </div>

              <!-- Total -->
              <div class="checkout-total">
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>R ${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row" id="deliveryFeeRow" style="display:none;">
                  <span>Delivery Fee</span>
                  <span id="deliveryFeeAmount">R 0.00</span>
                </div>
                <div class="total-divider"></div>
                <div class="total-row total-final">
                  <span>Total</span>
                  <span id="finalTotal">R ${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="checkout-footer">
              <button class="btn btn-outline" onclick="this.closest('.checkout-overlay').remove()">Cancel</button>
              <button class="btn btn-gold" onclick="confirmCheckout()">Place Order</button>
            </div>
          </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Add event listeners for fulfillment change
    const fulfillmentRadios = modal.querySelectorAll('input[name="fulfillment"]');
    fulfillmentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const deliverySection = document.getElementById('deliveryLocationSection');
            const deliveryFeeLabel = document.getElementById('deliveryFeeLabel');
            if (e.target.value === 'delivery') {
                deliverySection.style.display = 'block';
                deliveryFeeLabel.textContent = 'Select location';
            } else {
                deliverySection.style.display = 'none';
                deliveryFeeLabel.textContent = 'FREE';
            }
        });
    });
}

// Update checkout total based on selections
function updateCheckoutTotal() {
    const subtotal = getCartTotal();
    const fulfillment = document.querySelector('input[name="fulfillment"]:checked')?.value;
    const deliveryZone = document.getElementById('deliveryZone')?.value;
    
    let deliveryFee = 0;
    if (fulfillment === 'delivery' && deliveryZone && DELIVERY_ZONES[deliveryZone]) {
        deliveryFee = DELIVERY_ZONES[deliveryZone].fee;
    }
    
    const total = subtotal + deliveryFee;
    
    // Update UI
    const deliveryFeeRow = document.getElementById('deliveryFeeRow');
    const deliveryFeeAmount = document.getElementById('deliveryFeeAmount');
    const finalTotal = document.getElementById('finalTotal');
    const deliveryFeeLabel = document.getElementById('deliveryFeeLabel');
    
    if (fulfillment === 'delivery' && deliveryZone) {
        deliveryFeeRow.style.display = 'flex';
        deliveryFeeAmount.textContent = `R ${deliveryFee.toFixed(2)}`;
        deliveryFeeLabel.textContent = `R ${deliveryFee}`;
    } else if (fulfillment === 'delivery') {
        deliveryFeeRow.style.display = 'none';
        deliveryFeeLabel.textContent = 'Select location';
    } else {
        deliveryFeeRow.style.display = 'none';
        deliveryFeeLabel.textContent = 'FREE';
    }
    
    finalTotal.textContent = `R ${total.toFixed(2)}`;
}

// Confirm checkout
function confirmCheckout() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    const fulfillment = document.querySelector('input[name="fulfillment"]:checked')?.value;
    const deliveryZone = document.getElementById('deliveryZone')?.value;
    const deliveryAddress = document.getElementById('deliveryAddress')?.value;
    
    // Validation
    if (!paymentMethod) {
        showNotification('Please select a payment method');
        return;
    }
    
    if (!fulfillment) {
        showNotification('Please select pickup or delivery');
        return;
    }
    
    if (fulfillment === 'delivery') {
        if (!deliveryZone) {
            showNotification('Please select your delivery location');
            return;
        }
        if (!deliveryAddress || deliveryAddress.trim() === '') {
            showNotification('Please enter your delivery address');
            return;
        }
    }
    
    // Remove modal
    document.getElementById('checkoutModal')?.remove();
    
    // Process checkout
    processCheckout(paymentMethod, fulfillment, deliveryZone, deliveryAddress);
}

// Process checkout and save order
async function processCheckout(paymentMethod, fulfilment, deliveryZone, deliveryAddress) {
    const cart = getCart();
    const subtotal = getCartTotal();
    
    let deliveryFee = 0;
    let deliveryLocation = 'N/A';
    
    if (fulfilment === 'delivery' && deliveryZone && DELIVERY_ZONES[deliveryZone]) {
        deliveryFee = DELIVERY_ZONES[deliveryZone].fee;
        deliveryLocation = DELIVERY_ZONES[deliveryZone].name;
    }
    
    const total = subtotal + deliveryFee;

    const user = JSON.parse(localStorage.getItem('pamlee_user'));
    const email = user ? user.email : 'guest@pamlee.co.za';

    const order = {
        trackerId: generateTrackerId(),
        userEmail: email,
        items: cart,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        fulfilment,
        deliveryLocation,
        deliveryAddress: deliveryAddress || 'N/A',
        status: 'placed',
        placedAt: Date.now()
    };

    try {
        // Save to backend via API
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to place order');
        }

        // Also save to localStorage for fallback
        createOrder(order);

        // Clear cart
        localStorage.removeItem('cart');
        updateCartUI();
        closeCartModal();

        // Show success modal
        showOrderSuccessModal(order);
    } catch (error) {
        console.error('Order error:', error);
        
        // Fallback: save to localStorage only
        createOrder(order);
        localStorage.removeItem('cart');
        updateCartUI();
        closeCartModal();
        
        showOrderSuccessModal(order);
    }
}

// Show order success modal
function showOrderSuccessModal(order) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="checkout-overlay">
          <div class="checkout-modal success-modal">
            <div class="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p class="success-message">Thank you for your order. We'll start preparing it right away!</p>
            
            <div class="order-details-box">
              <div class="order-detail-row">
                <span>Tracker ID:</span>
                <strong>${order.trackerId}</strong>
              </div>
              <div class="order-detail-row">
                <span>Total Amount:</span>
                <strong>R ${order.total.toFixed(2)}</strong>
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
                  <strong>${order.deliveryLocation}</strong>
                </div>
                <div class="order-detail-row">
                  <span>Address:</span>
                  <strong>${order.deliveryAddress}</strong>
                </div>
              ` : ''}
            </div>
            
            <p class="tracker-note">💡 Save your Tracker ID to track your order status</p>
            
            <div class="success-actions">
              <button class="btn btn-outline" onclick="this.closest('.checkout-overlay').remove()">Close</button>
              <a href="customer.html" class="btn btn-gold">View My Orders</a>
            </div>
          </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ============================
// Notifications
// ============================
function showNotification(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--secondary);
        color: var(--primary);
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ============================
// Cart modal controls
// ============================
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.add('active');
        updateCartUI();
    }
}

function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================
// Initialize cart on page load
// ============================
document.addEventListener('DOMContentLoaded', () => {
    // Delay updateCartUI to ensure all DOM modifications are complete
    setTimeout(() => {
        updateCartUI();
    }, 100);

    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', openCartModal);

    const closeCart = document.getElementById('closeCart');
    if (closeCart) closeCart.addEventListener('click', closeCartModal);

    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) closeCartModal();
        });
    }
});

// Also update cart UI when page becomes visible (handles page navigation)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateCartUI();
    }
});

// Update cart UI when localStorage changes (for multi-tab sync)
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        updateCartUI();
    }
});

// ============================
// Toast Animations
// ============================
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
}`;
document.head.appendChild(style);
