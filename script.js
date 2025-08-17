class DriverCustomerTracker {
    constructor() {
        this.user = null;
        this.customers = [];
        this.selectedCustomer = null;
        this.isLoading = true;
        
        this.initializeApp();
    }

    // Initialization
    async initializeApp() {
        this.showLoadingScreen();
        
        // Check for existing user session
        const savedUser = localStorage.getItem('driver-user');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
                this.customers = this.loadCustomers();
                await this.simulateLoading();
                this.showMainApp();
            } catch (error) {
                console.error('Error loading saved user:', error);
                this.showLoginPage();
            }
        } else {
            await this.simulateLoading();
            this.showLoginPage();
        }
        
        this.initializeEventListeners();
        this.isLoading = false;
    }

    async simulateLoading() {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'none';
    }

    showLoginPage() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        this.updateUserProfile();
        this.render();
    }

    // Authentication
    async handleLogin(provider) {
        const button = document.getElementById(`${provider}-login-btn`);
        button.classList.add('loading');
        
        try {
            // Simulate authentication process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockUser = {
                id: `${provider}_${Date.now()}`,
                name: 'John Driver',
                email: provider === 'google' ? 'john.driver@gmail.com' : 'john.driver@icloud.com',
                avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
                provider: provider
            };
            
            this.user = mockUser;
            localStorage.setItem('driver-user', JSON.stringify(mockUser));
            this.customers = this.loadCustomers();
            this.showMainApp();
            
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            button.classList.remove('loading');
        }
    }

    handleLogout() {
        this.user = null;
        localStorage.removeItem('driver-user');
        this.customers = [];
        this.selectedCustomer = null;
        this.showLoginPage();
    }

    updateUserProfile() {
        if (!this.user) return;
        
        document.getElementById('user-avatar-img').src = this.user.avatar;
        document.getElementById('user-name').textContent = this.user.name;
        document.getElementById('user-email').textContent = this.user.email;
    }

    // Storage methods
    loadCustomers() {
        try {
            const stored = localStorage.getItem('driver-customers');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading customers:', error);
            return [];
        }
    }

    saveCustomers() {
        try {
            localStorage.setItem('driver-customers', JSON.stringify(this.customers));
        } catch (error) {
            console.error('Error saving customers:', error);
        }
    }

    // Utility methods
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    isToday(dateString) {
        return dateString === this.getTodayDate();
    }

    // Customer management
    addCustomer(name, location) {
        const newCustomer = {
            id: Date.now().toString(),
            name: name.trim(),
            location: location.trim(),
            visits: [],
            createdAt: new Date().toISOString()
        };

        this.customers.push(newCustomer);
        this.saveCustomers();
        return newCustomer;
    }

    addVisit(customerId) {
        const today = this.getTodayDate();
        const customer = this.customers.find(c => c.id === customerId);
        
        if (!customer) return;

        const existingVisit = customer.visits.find(v => v.date === today);

        if (existingVisit) {
            existingVisit.count += 1;
        } else {
            customer.visits.push({ date: today, count: 1 });
        }

        this.saveCustomers();
        this.render();
    }

    getCustomerStats(customer) {
        const totalVisits = customer.visits.reduce((sum, visit) => sum + visit.count, 0);
        const totalDays = customer.visits.length;
        const todayVisit = customer.visits.find(v => v.date === this.getTodayDate());
        
        return { totalVisits, totalDays, todayVisit };
    }

    // Event listeners
    initializeEventListeners() {
        // Login buttons
        document.getElementById('google-login-btn').addEventListener('click', () => {
            this.handleLogin('google');
        });

        document.getElementById('apple-login-btn').addEventListener('click', () => {
            this.handleLogin('apple');
        });

        // Logout buttons
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        document.getElementById('mobile-logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Form submission
        document.getElementById('customer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Modal close
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal backdrop click
        document.getElementById('customer-modal').addEventListener('click', (e) => {
            if (e.target.id === 'customer-modal') {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    handleFormSubmit() {
        const nameInput = document.getElementById('customer-name');
        const locationInput = document.getElementById('customer-location');
        const submitBtn = document.getElementById('add-customer-btn');

        const name = nameInput.value.trim();
        const location = locationInput.value.trim();

        if (!name || !location) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding Customer...';

        try {
            this.addCustomer(name, location);
            nameInput.value = '';
            locationInput.value = '';
            this.render();
        } catch (error) {
            console.error('Error adding customer:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Customer';
        }
    }

    // Rendering methods
    render() {
        if (!this.user) return;
        
        this.renderCustomerCount();
        this.renderCustomerGrid();
    }

    renderCustomerCount() {
        const countElement = document.getElementById('customer-count');
        const count = this.customers.length;
        countElement.textContent = `${count} Customer${count !== 1 ? 's' : ''}`;
    }

    renderCustomerGrid() {
        const gridElement = document.getElementById('customer-grid');
        const emptyState = document.getElementById('empty-state');

        if (this.customers.length === 0) {
            emptyState.style.display = 'block';
            gridElement.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        gridElement.style.display = 'grid';

        gridElement.innerHTML = this.customers.map(customer => 
            this.renderCustomerCard(customer)
        ).join('');

        // Add event listeners to cards and buttons
        this.customers.forEach(customer => {
            const card = document.querySelector(`[data-customer-id="${customer.id}"]`);
            const addBtn = document.querySelector(`[data-add-visit="${customer.id}"]`);

            if (card) {
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.add-visit-btn')) {
                        this.openModal(customer);
                    }
                });
            }

            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addVisit(customer.id);
                });
            }
        });
    }

    renderCustomerCard(customer) {
        const stats = this.getCustomerStats(customer);
        const todayVisitHtml = stats.todayVisit ? `
            <div class="today-visit">
                <div class="today-visit-content">
                    <div class="today-indicator"></div>
                    Visited today: ${stats.todayVisit.count} time${stats.todayVisit.count !== 1 ? 's' : ''}
                </div>
            </div>
        ` : '';

        return `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="card-header">
                    <div class="card-info">
                        <h3>${customer.name}</h3>
                        <div class="card-location">
                            <svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${customer.location}
                        </div>
                    </div>
                    <button class="add-visit-btn" data-add-visit="${customer.id}" title="Add visit for today">
                        <svg class="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </button>
                </div>
                <div class="card-stats">
                    <div class="stat">
                        <svg class="stat-icon trending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                            <polyline points="17,6 23,6 23,12"/>
                        </svg>
                        <span class="stat-label">Total Visits:</span>
                        <span class="stat-value">${stats.totalVisits}</span>
                    </div>
                    <div class="stat">
                        <svg class="stat-icon calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span class="stat-label">Days:</span>
                        <span class="stat-value">${stats.totalDays}</span>
                    </div>
                </div>
                ${todayVisitHtml}
            </div>
        `;
    }

    // Modal methods
    openModal(customer) {
        this.selectedCustomer = customer;
        const modal = document.getElementById('customer-modal');
        
        // Update modal content
        document.getElementById('modal-customer-name').textContent = customer.name;
        document.getElementById('modal-customer-location').textContent = customer.location;
        
        const stats = this.getCustomerStats(customer);
        document.getElementById('modal-total-visits').textContent = stats.totalVisits;
        document.getElementById('modal-days-visited').textContent = stats.totalDays;
        
        this.renderVisitHistory(customer);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('customer-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.selectedCustomer = null;
    }

    renderVisitHistory(customer) {
        const visitList = document.getElementById('visit-list');
        
        if (customer.visits.length === 0) {
            visitList.innerHTML = `
                <div class="no-visits">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p>No visits recorded yet</p>
                </div>
            `;
            return;
        }

        const sortedVisits = [...customer.visits].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        visitList.innerHTML = sortedVisits.map(visit => {
            const isToday = this.isToday(visit.date);
            const todayClass = isToday ? 'today' : '';
            const todayIndicator = isToday ? '<div class="visit-indicator"></div>' : '';
            const todayLabel = isToday ? '<div class="today-label">Today</div>' : '';

            return `
                <div class="visit-item ${todayClass}">
                    <div class="visit-info">
                        ${todayIndicator}
                        <div>
                            <div class="visit-date">${this.formatDate(visit.date)}</div>
                            ${todayLabel}
                        </div>
                    </div>
                    <div class="visit-count">
                        ${visit.count} visit${visit.count !== 1 ? 's' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DriverCustomerTracker();
});
