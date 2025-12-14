// DogeMiner: Community Edition - Notifications System
class NotificationManager {
    constructor(game) {
        this.game = game;
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 3000;
        
        this.setupNotificationContainer();
    }
    
    setupNotificationContainer() {
        // Ensure notifications container exists
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }
    
    show(message, type = 'info', duration = this.defaultDuration) {
        // Check if notifications are enabled
        if (this.game && this.game.notificationsEnabled === false) {
            return null;
        }
        
        const notification = this.createNotification(message, type, duration);
        this.addNotification(notification);
        return notification;
    }
    
    createNotification(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Set notification content
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getIcon(type)}</div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Apply styles
        this.applyNotificationStyles(notification, type);
        
        // Set duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        return notification;
    }
    
    applyNotificationStyles(notification, type) {
        const baseStyles = {
            background: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid #ffd700',
            borderRadius: '10px',
            padding: '15px 20px',
            marginBottom: '10px',
            color: '#ffd700',
            fontWeight: '600',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
            maxWidth: '300px',
            wordWrap: 'break-word'
        };
        
        // Type-specific styles
        const typeStyles = {
            success: {
                borderColor: '#4CAF50',
                color: '#4CAF50',
                boxShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
            },
            error: {
                borderColor: '#f44336',
                color: '#f44336',
                boxShadow: '0 0 20px rgba(244, 67, 54, 0.3)'
            },
            warning: {
                borderColor: '#ff9800',
                color: '#ff9800',
                boxShadow: '0 0 20px rgba(255, 152, 0, 0.3)'
            },
            info: {
                borderColor: '#2196F3',
                color: '#2196F3',
                boxShadow: '0 0 20px rgba(33, 150, 243, 0.3)'
            }
        };
        
        // Apply base styles
        Object.assign(notification.style, baseStyles);
        
        // Apply type-specific styles
        if (typeStyles[type]) {
            Object.assign(notification.style, typeStyles[type]);
        }
        
        // Add content styles
        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const icon = notification.querySelector('.notification-icon');
        icon.style.cssText = `
            font-size: 20px;
            flex-shrink: 0;
        `;
        
        const message = notification.querySelector('.notification-message');
        message.style.cssText = `
            flex: 1;
            font-size: 14px;
        `;
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s ease;
        `;
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });
    }
    
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ',
            coin: '🪙',
            achievement: '🏆',
            level: '🚀',
            shop: '🛒'
        };
        
        return icons[type] || icons.info;
    }
    
    addNotification(notification) {
        const container = document.getElementById('notifications');
        
        // Remove oldest notification if at max capacity
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            this.removeNotification(oldest);
        }
        
        // Add to container and array
        container.appendChild(notification);
        this.notifications.push(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
    }
    
    removeNotification(notification) {
        if (!notification || !notification.parentElement) return;
        
        // Animate out
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
            
            // Remove from array
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    // Convenience methods for different notification types
    showSuccess(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    showError(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    showWarning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    showInfo(message, duration) {
        return this.show(message, 'info', duration);
    }
    
    showCoin(message, duration) {
        return this.show(message, 'coin', duration);
    }
    
    showAchievement(message, duration) {
        return this.show(message, 'achievement', duration);
    }
    
    
    showLevelUp(message, duration) {
        return this.show(message, 'level', duration);
    }
    
    showShop(message, duration) {
        return this.show(message, 'shop', duration);
    }
    
    // Special notification types
    showFloatingCoin(amount, x, y) {
        const coin = document.createElement('div');
        coin.className = 'floating-coin';
        coin.textContent = '+' + this.game.formatNumber(amount);
        coin.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: #ffd700;
            font-weight: bold;
            font-size: 18px;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            animation: floatUp 2s ease-out forwards;
        `;
        
        document.body.appendChild(coin);
        
        setTimeout(() => {
            coin.remove();
        }, 2000);
    }
    
    showCombo(comboCount) {
        const combo = document.createElement('div');
        combo.className = 'combo-notification';
        combo.textContent = `${comboCount}x COMBO!`;
        combo.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffd700;
            font-size: 48px;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            z-index: 10000;
            pointer-events: none;
            animation: comboPop 2s ease-out forwards;
        `;
        
        document.body.appendChild(combo);
        
        setTimeout(() => {
            combo.remove();
        }, 2000);
    }
    
    showCriticalHit(damage) {
        const critical = document.createElement('div');
        critical.className = 'critical-notification';
        critical.innerHTML = `
            <div style="color: #ff4444; font-size: 24px; font-weight: bold;">CRITICAL HIT!</div>
            <div style="color: #ffd700; font-size: 18px;">+${this.game.formatNumber(damage)}</div>
        `;
        critical.style.cssText = `
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 10000;
            pointer-events: none;
            animation: criticalPop 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(critical);
        
        setTimeout(() => {
            critical.remove();
        }, 1500);
    }
    
    // Clear all notifications
    clearAll() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
        this.notifications = [];
    }
    
    // Pause/resume notifications
    pause() {
        this.paused = true;
    }
    
    resume() {
        this.paused = false;
    }
    
    // Queue notifications when paused
    queue(message, type, duration) {
        if (this.paused) {
            this.queue.push({ message, type, duration });
        } else {
            this.show(message, type, duration);
        }
    }
    
    // Process queued notifications
    processQueue() {
        if (this.paused || !this.queue || this.queue.length === 0) return;
        
        const queued = this.queue.shift();
        this.show(queued.message, queued.type, queued.duration);
    }
}

// Add CSS animations if not already present
if (!document.getElementById('notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes floatUp {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) scale(0.5);
            }
        }
        
        @keyframes comboPop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        
        @keyframes criticalPop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            30% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Global notification manager instance
let notificationManager;
