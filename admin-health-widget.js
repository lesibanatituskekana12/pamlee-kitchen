/**
 * Admin Dashboard Health Widget
 * Real-time health monitoring for admin dashboard
 */

class AdminHealthWidget {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.results = {
      api: null,
      auth: null,
      database: null,
      stats: null,
      orders: null,
      products: null
    };
    this.isRunning = false;
    this.autoRefresh = false;
    this.refreshInterval = null;
  }

  // Initialize the widget
  init() {
    this.render();
    this.runQuickCheck();
  }

  // Render the widget HTML
  render() {
    this.container.innerHTML = `
      <div class="health-widget">
        <div class="health-header">
          <h3>🏥 System Health</h3>
          <div class="health-actions">
            <button class="btn-icon" onclick="adminHealth.runQuickCheck()" title="Refresh">
              <span id="refreshIcon">🔄</span>
            </button>
            <button class="btn-icon" onclick="adminHealth.toggleAutoRefresh()" title="Auto-refresh">
              <span id="autoRefreshIcon">⏸️</span>
            </button>
          </div>
        </div>
        
        <div class="health-status" id="healthStatus">
          <div class="status-item">
            <span class="status-label">Overall Status:</span>
            <span class="status-value" id="overallStatus">Checking...</span>
          </div>
          <div class="status-item">
            <span class="status-label">Last Check:</span>
            <span class="status-value" id="lastCheck">Never</span>
          </div>
        </div>

        <div class="health-checks" id="healthChecks">
          ${this.renderCheckItem('api', 'API Connection', '⏳')}
          ${this.renderCheckItem('auth', 'Authentication', '⏳')}
          ${this.renderCheckItem('database', 'Database', '⏳')}
          ${this.renderCheckItem('stats', 'Statistics', '⏳')}
          ${this.renderCheckItem('orders', 'Orders System', '⏳')}
          ${this.renderCheckItem('products', 'Products System', '⏳')}
        </div>

        <div class="health-footer">
          <button class="btn btn-sm btn-gold" onclick="adminHealth.runFullDiagnostic()">
            🔍 Run Full Diagnostic
          </button>
        </div>
      </div>

      <style>
        .health-widget {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .health-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
        }
        
        .health-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--foreground);
        }
        
        .health-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .btn-icon {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.5rem;
          cursor: pointer;
          font-size: 1.25rem;
          transition: all 0.2s;
        }
        
        .btn-icon:hover {
          background: var(--muted);
          transform: scale(1.1);
        }
        
        .btn-icon.active {
          background: var(--primary);
          color: white;
        }
        
        .health-status {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: var(--background);
          border-radius: 6px;
        }
        
        .status-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .status-label {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--foreground);
        }
        
        .health-checks {
          display: grid;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .check-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: var(--background);
          border-radius: 4px;
          border-left: 3px solid transparent;
          transition: all 0.2s;
        }
        
        .check-item.success {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        
        .check-item.error {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
        
        .check-item.warning {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }
        
        .check-item.checking {
          border-left-color: #3b82f6;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .check-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--foreground);
        }
        
        .check-icon {
          font-size: 1.25rem;
        }
        
        .check-status {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .check-status.success {
          background: #10b981;
          color: white;
        }
        
        .check-status.error {
          background: #ef4444;
          color: white;
        }
        
        .check-status.warning {
          background: #f59e0b;
          color: white;
        }
        
        .health-footer {
          display: flex;
          justify-content: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        
        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
        
        .rotate {
          animation: rotate 1s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  // Render individual check item
  renderCheckItem(id, label, icon) {
    return `
      <div class="check-item" id="check-${id}">
        <div class="check-label">
          <span class="check-icon">${icon}</span>
          <span>${label}</span>
        </div>
        <span class="check-status" id="status-${id}">Pending</span>
      </div>
    `;
  }

  // Update check status
  updateCheck(id, status, message = '') {
    const checkItem = document.getElementById(`check-${id}`);
    const statusEl = document.getElementById(`status-${id}`);
    
    if (!checkItem || !statusEl) return;
    
    checkItem.className = `check-item ${status}`;
    statusEl.className = `check-status ${status}`;
    statusEl.textContent = message || status.toUpperCase();
    
    this.results[id] = status;
    this.updateOverallStatus();
  }

  // Update overall status
  updateOverallStatus() {
    const statuses = Object.values(this.results).filter(s => s !== null);
    const hasError = statuses.includes('error');
    const hasWarning = statuses.includes('warning');
    const allSuccess = statuses.every(s => s === 'success');
    
    const overallEl = document.getElementById('overallStatus');
    
    if (allSuccess && statuses.length === 6) {
      overallEl.textContent = '✅ All Systems Operational';
      overallEl.style.color = '#10b981';
    } else if (hasError) {
      overallEl.textContent = '❌ Issues Detected';
      overallEl.style.color = '#ef4444';
    } else if (hasWarning) {
      overallEl.textContent = '⚠️ Warnings Present';
      overallEl.style.color = '#f59e0b';
    } else {
      overallEl.textContent = '⏳ Checking...';
      overallEl.style.color = '#3b82f6';
    }
    
    document.getElementById('lastCheck').textContent = new Date().toLocaleTimeString();
  }

  // Run quick health check
  async runQuickCheck() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const refreshIcon = document.getElementById('refreshIcon');
    if (refreshIcon) refreshIcon.classList.add('rotate');
    
    // Reset all checks
    Object.keys(this.results).forEach(key => {
      this.updateCheck(key, 'checking', 'Checking...');
    });

    try {
      // Check 1: API Connection
      await this.checkAPI();
      
      // Check 2: Authentication
      await this.checkAuth();
      
      // Check 3: Database
      await this.checkDatabase();
      
      // Check 4: Stats
      await this.checkStats();
      
      // Check 5: Orders
      await this.checkOrders();
      
      // Check 6: Products
      await this.checkProducts();
      
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      this.isRunning = false;
      if (refreshIcon) refreshIcon.classList.remove('rotate');
    }
  }

  // Individual health checks
  async checkAPI() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.updateCheck('api', 'success', 'Online');
      } else {
        this.updateCheck('api', 'error', 'Failed');
      }
    } catch (error) {
      this.updateCheck('api', 'error', 'Offline');
    }
  }

  async checkAuth() {
    try {
      const user = JSON.parse(localStorage.getItem('pamlee_user') || 'null');
      
      if (!user || !user.token) {
        this.updateCheck('auth', 'warning', 'Not logged in');
        return;
      }
      
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user.role === 'admin') {
          this.updateCheck('auth', 'success', 'Admin');
        } else {
          this.updateCheck('auth', 'warning', 'Not admin');
        }
      } else {
        this.updateCheck('auth', 'error', 'Invalid');
      }
    } catch (error) {
      this.updateCheck('auth', 'error', 'Failed');
    }
  }

  async checkDatabase() {
    try {
      const response = await fetch('/api/products');
      
      if (response.ok) {
        this.updateCheck('database', 'success', 'Connected');
      } else {
        this.updateCheck('database', 'error', 'Error');
      }
    } catch (error) {
      this.updateCheck('database', 'error', 'Failed');
    }
  }

  async checkStats() {
    try {
      const user = JSON.parse(localStorage.getItem('pamlee_user') || 'null');
      
      if (!user || !user.token) {
        this.updateCheck('stats', 'warning', 'No auth');
        return;
      }
      
      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        this.updateCheck('stats', 'success', 'Working');
      } else {
        this.updateCheck('stats', 'error', 'Failed');
      }
    } catch (error) {
      this.updateCheck('stats', 'error', 'Failed');
    }
  }

  async checkOrders() {
    try {
      const user = JSON.parse(localStorage.getItem('pamlee_user') || 'null');
      
      if (!user || !user.token) {
        this.updateCheck('orders', 'warning', 'No auth');
        return;
      }
      
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.updateCheck('orders', 'success', `${data.orders?.length || 0} orders`);
      } else {
        this.updateCheck('orders', 'error', 'Failed');
      }
    } catch (error) {
      this.updateCheck('orders', 'error', 'Failed');
    }
  }

  async checkProducts() {
    try {
      const response = await fetch('/api/products');
      
      if (response.ok) {
        const data = await response.json();
        this.updateCheck('products', 'success', `${data.products?.length || 0} items`);
      } else {
        this.updateCheck('products', 'error', 'Failed');
      }
    } catch (error) {
      this.updateCheck('products', 'error', 'Failed');
    }
  }

  // Toggle auto-refresh
  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    const icon = document.getElementById('autoRefreshIcon');
    
    if (this.autoRefresh) {
      icon.textContent = '▶️';
      this.refreshInterval = setInterval(() => this.runQuickCheck(), 30000); // Every 30 seconds
      this.runQuickCheck();
    } else {
      icon.textContent = '⏸️';
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }

  // Run full diagnostic
  runFullDiagnostic() {
    window.open('/admin-diagnostic.html', '_blank');
  }
}

// Initialize global instance
let adminHealth;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('adminHealthWidget');
    if (container) {
      adminHealth = new AdminHealthWidget('adminHealthWidget');
      adminHealth.init();
    }
  });
} else {
  const container = document.getElementById('adminHealthWidget');
  if (container) {
    adminHealth = new AdminHealthWidget('adminHealthWidget');
    adminHealth.init();
  }
}
