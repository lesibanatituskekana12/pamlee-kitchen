# Dashboard Testing Guide

## Issue Identified

The dashboards were showing "Loading orders..." indefinitely because:

1. **Authentication Required**: The `/api/orders` endpoint requires a valid JWT token
2. **No Token Check**: Users could access dashboards without being properly logged in
3. **Subscription Timing**: Subscriptions were registered before the first data fetch completed

## Fixes Applied

### 1. Subscription Mechanism
- ✅ Subscribe callback now fires immediately with current orders (even if empty)
- ✅ `startPolling` now awaits the first fetch before starting the interval
- ✅ Subscriptions registered before polling starts

### 2. Authentication Checks
- ✅ Added token validation in both admin and customer dashboards
- ✅ Redirects to login if no token found
- ✅ Falls back to localStorage if API authentication fails

### 3. Error Handling
- ✅ Better error messages in console
- ✅ Graceful fallback to localStorage
- ✅ Shows "No orders" message instead of infinite loading

## How to Test

### Step 1: Create Admin Account (if needed)
The admin account is pre-created:
- Email: `admin@pamlee.co.za`
- Password: `admin123`

### Step 2: Create Customer Account
1. Go to `/signup.html`
2. Create a new account with any email/password
3. You'll be automatically logged in

### Step 3: Place an Order
1. Go to `/menu.html` or `/index.html`
2. Add items to cart
3. Click cart icon
4. Click "Checkout"
5. Fill in:
   - Payment method (Cash/Card/EFT)
   - Fulfillment (Pickup/Delivery)
   - If Delivery: Select location and enter address
6. Click "Place Order"
7. Note the Tracker ID from the success modal

### Step 4: Test Customer Dashboard
1. Go to `/customer.html`
2. You should see your order with:
   - Order details
   - Progress bar showing status
   - Timeline of events
   - Ability to track order
3. Click "Track Order" to see live tracking modal
4. Click "View Full Details" to see complete order info

### Step 5: Test Admin Dashboard
1. Log out (if logged in as customer)
2. Go to `/login.html`
3. Login with admin credentials
4. Go to `/admin.html`
5. You should see:
   - Statistics cards (total orders, revenue, pending)
   - List of all orders
   - Ability to update order status
   - Filter orders by status

### Step 6: Test Real-Time Updates
1. Open admin dashboard in one tab
2. Open customer dashboard in another tab (logged in as customer)
3. In admin dashboard, change order status
4. Customer dashboard should update within 5 seconds
5. Customer should see a toast notification

## Expected Behavior

### Admin Dashboard
- **With Orders**: Shows list of orders with status badges
- **No Orders**: Shows "No orders yet" message
- **Not Logged In**: Redirects to login page
- **No Token**: Shows alert and redirects to login

### Customer Dashboard
- **With Orders**: Shows customer's orders with progress bars
- **No Orders**: Shows "No Orders Yet" with link to menu
- **Not Logged In**: Redirects to login page
- **No Token**: Shows alert and redirects to login

## Troubleshooting

### Dashboard shows "Loading orders..." forever

**Cause**: Not logged in or no valid token

**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Go to `/login.html`
3. Log in with valid credentials
4. Navigate to dashboard again

### Dashboard shows "No orders" but orders exist

**Cause**: Orders might be in database but not accessible

**Solution**:
1. Check if logged in with correct account
2. For customer: Orders are filtered by email
3. For admin: Should see all orders
4. Check browser console for errors

### Orders not updating in real-time

**Cause**: Polling might have stopped or API is failing

**Solution**:
1. Check browser console for errors
2. Refresh the page
3. Check if server is running
4. Verify API endpoint: `curl http://localhost:3000/api/orders`

### API returns 401 Unauthorized

**Cause**: Token expired or invalid

**Solution**:
1. Log out and log in again
2. Check if token is stored: `localStorage.getItem('pamlee_user')`
3. Token should have a `token` field

## API Endpoints

### Get All Orders (Requires Auth)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/orders
```

### Get Single Order (Public)
```bash
curl http://localhost:3000/api/orders/TRACKER_ID
```

### Create Order (Public)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "trackerId": "PL-TEST-001",
    "userEmail": "test@example.com",
    "items": [...],
    "subtotal": 100,
    "deliveryFee": 0,
    "total": 100,
    "paymentMethod": "cash",
    "fulfilment": "pickup"
  }'
```

### Update Order Status (Requires Admin Auth)
```bash
curl -X PUT http://localhost:3000/api/orders/TRACKER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing",
    "note": "Order is being prepared"
  }'
```

## Current Test Order

A test order has been created:
- Tracker ID: `PL-1763063101`
- Email: `customer@test.com`
- Total: R 550.00
- Status: placed

You can use this to test the dashboards.

## Next Steps

1. **Log in as admin** to see the test order in admin dashboard
2. **Create a customer account** with email `customer@test.com` to see it in customer dashboard
3. **Update the order status** in admin dashboard
4. **Watch it update** in customer dashboard (within 5 seconds)

## Notes

- Real-time updates happen every 5 seconds (polling interval)
- Orders are stored in SQLite database (`pamlee.db`)
- Fallback to localStorage if API fails
- All dashboards require authentication
- Admin can see all orders, customers only see their own
