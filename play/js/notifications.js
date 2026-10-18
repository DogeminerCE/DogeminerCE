// DogeMiner: Community Edition - Notifications System
class NotificationManager {
    constructor(game) {
        this.game=game;this.notifications=[];this.maxNotifications=5;
        this.defaultDuration=4500;this.pending=[];this.paused=false;
        this.setupNotificationContainer();
    }

    setupNotificationContainer() {
        let container=document.getElementById('notifications');
        if(!container){container=document.createElement('div');container.id='notifications';document.body.append(container);}
        container.setAttribute('aria-label','Game notifications');
        this.layout=()=>{
            const mobile=this.game?.isMobileDevice?.(),width=Math.min(mobile?230.16:328.8,innerWidth-24);
            const panels=['left-panel','right-panel'].map(id=>document.getElementById(id)).filter(n=>n?.getClientRects().length).map(n=>n.getBoundingClientRect());
            const right=panels.length?Math.max(...panels.map(r=>r.right)):innerWidth,bottom=panels.length?Math.max(...panels.map(r=>r.bottom)):innerHeight;
            Object.assign(container.style,{width:width+'px',right:(mobile?(innerWidth-width)/2:Math.max(12,innerWidth-right+6))+'px',top:mobile?'18px':'auto',bottom:mobile?'auto':Math.max(12,innerHeight-bottom+6)+'px'});
        };
        window.addEventListener('resize',this.layout);this.layout();
    }

    show(message,type='info',duration) {
        const data=typeof message==='object'&&message!==null?{...message}:{info:String(message??''),type,duration};
        if(this.game?.notificationsEnabled===false&&!data.system)return null;
        if(this.paused&&!data.system){this.pending.push(data);return null;}
        const existing=data.id&&this.notifications.find(n=>!n._isRemoving&&n.dataset.notificationId===data.id);
        if(existing&&data.system)return existing;
        if(existing)this.removeNotification(existing,'replace');
        const node=this.createNotification(data,data.type||type,data.duration??duration);
        this.addNotification(node);return node;
    }

    showEvent(data){return this.show(data);}

    createNotification(message,type='info',duration) {
        const data=typeof message==='object'&&message!==null?{...message}:{info:String(message??'')};
        type=['info','quest','achievement','success','error','warning','coin','level','shop'].includes(data.type||type)?data.type||type:'info';
        const node=document.createElement('section');node.className='notification';
        node.dataset.type=type;if(data.id)node.dataset.notificationId=String(data.id);
        node.setAttribute('role','status');node.setAttribute('aria-live','polite');
        node._notificationData=data;
        const text=(tag,className,value)=>{const el=document.createElement(tag);el.className=className;
            // Source color tags are parsed as text, never inserted as HTML.
            let color='';for(const part of String(value??'').split(/(<\/?[a-zA-Z]+>)/)){
                const tag=part.match(/^<(\/?)([a-zA-Z]+)>$/);
                if(tag){color=tag[1]?'':({green:'green',equip:'green',blue:'blue',itemsand:'sand',redStroke:'red',red:'red',orange:'sand'}[tag[2]]||'');continue;}
                const span=document.createElement('span');span.textContent=part;if(color)span.className='notification-text-'+color;el.append(span);
            }return el;};
        if(data.title)node.append(text('strong','notification-title',data.title));
        const action=document.createElement('button');action.type='button';action.className='notification-content';
        action.setAttribute('aria-label',String(data.actionLabel||data.info||data.title||'Dismiss notification').replace(/<[^>]*>/g,''));
        if(data.info)action.append(text('span','notification-info',data.info));
        if(data.details)action.append(text('span','notification-details',data.details));
        if(typeof data.icon==='string'&&/^(?:\.\.\/)?assets\//.test(data.icon)){
            const icon=document.createElement('img');icon.className='notification-icon';icon.src=data.icon;icon.alt='';action.append(icon);node.classList.add('notification-with-icon');
        }
        action.addEventListener('click',()=>this.removeNotification(node,'activate'));
        action.addEventListener('keydown',event=>{if([' ','Enter'].includes(event.key))event.stopPropagation();});
        node.append(action);
        node._notificationDuration=data.stay?0:Number.isFinite(Number(data.closetimer??data.duration??duration))&&Number(data.closetimer??data.duration??duration)>0?Number(data.closetimer??data.duration??duration):this.defaultDuration;
        return node;
    }

    addNotification(node) {
        const container=document.getElementById('notifications');if(!container)return;
        const active=this.notifications.filter(n=>!n._isRemoving&&!n._notificationData.system);
        if(active.length>=this.maxNotifications)this.removeNotification(active[0],'overflow');
        container.append(node);this.notifications.push(node);
        if(node._notificationDuration>0)node._expiry=setTimeout(()=>this.removeNotification(node,'timeout'),node._notificationDuration);
        if(!node._notificationData.silent)window.audioManager?.playSound('biblip');
    }

    removeNotification(node,reason='close') {
        if(!node||node._isRemoving)return;
        node._isRemoving=true;clearTimeout(node._expiry);
        const data=node._notificationData||{};
        try{if(reason==='activate')data.onClick?.();}
        finally{
            try{data.onEnd?.(reason);}finally{
                node.classList.add('slide-out');
                node.querySelectorAll('button').forEach(button=>button.disabled=true);
                node._removeTimer=setTimeout(()=>{node.remove();this.notifications=this.notifications.filter(n=>n!==node);},700);
            }
        }
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
    
    clearAll() {
        this.pending=[];
        for(const node of [...this.notifications]){
            this.removeNotification(node,'clear');clearTimeout(node._removeTimer);node.remove();
        }
        this.notifications=[];
    }
    pause(){this.paused=true;}
    resume(){this.paused=false;this.processQueue();}
    queue(message,type,duration){if(this.paused)this.pending.push({info:message,type,duration});else return this.show(message,type,duration);}
    processQueue(){if(this.paused)return;const pending=this.pending.splice(0);for(const item of pending)this.show(item);}

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
