class AuthManager {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
        this.scheduleTokenRefresh();
    }

    static removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
    }

    static isTokenExpired(token) {
        if (!token) return true;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    static async refreshToken() {
        const token = this.getToken();
        const userType = localStorage.getItem('userType');
        
        if (!token || !userType) {
            this.logout();
            return false;
        }

        try {
            const response = await fetch(`/api/${userType}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.token);
                console.log('✅ Token refreshed successfully');
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            this.logout();
            return false;
        }
    }

    static scheduleTokenRefresh() {
        const token = this.getToken();
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const refreshTime = expirationTime - (30 * 60 * 1000); // Refresh 30 minutes before expiration

            if (refreshTime > currentTime) {
                setTimeout(() => {
                    this.refreshToken();
                }, refreshTime - currentTime);
            }
        } catch (error) {
            console.error('❌ Error scheduling token refresh:', error);
        }
    }

    static logout() {
        this.removeToken();
        window.location.href = 'index.html';
    }

    static async apiCall(endpoint, options = {}) {
        let token = this.getToken();
        
        // Check if token is expired and refresh if needed
        if (this.isTokenExpired(token)) {
            const refreshed = await this.refreshToken();
            if (!refreshed) {
                return Promise.reject(new Error('Authentication failed'));
            }
            token = this.getToken();
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(endpoint, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token might be invalid, try to refresh
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Retry the request with new token
                        config.headers['Authorization'] = `Bearer ${this.getToken()}`;
                        const retryResponse = await fetch(endpoint, config);
                        if (retryResponse.ok) {
                            return await retryResponse.json();
                        }
                    }
                    this.logout();
                }
                throw new Error(data.error || 'API call failed');
            }

            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }
}

// Initialize token refresh on page load
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.scheduleTokenRefresh();
});
