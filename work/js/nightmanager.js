class NightManager {
    constructor(game) {
        this.game = game; // 游戏实例
        this.spotlightOverlay = document.getElementById('spotlightOverlay');
        this.spotlightRadius = 50;
        this.updateSpotlightInterval = null;
        this._active = false; // 覆盖层是否启用
        this._lastCanvasRect = null; // 缓存画布矩形，减少重排
        
        // 初始化聚光灯覆盖层样式
        this.initOverlayStyle();
    }

    // 初始化聚光灯覆盖层的基础样式
    initOverlayStyle() {
        if (!this.spotlightOverlay) return;
        
        // 设置覆盖层样式，确保它能正确覆盖游戏区域且不影响交互
        Object.assign(this.spotlightOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // 允许鼠标事件穿透覆盖层
            zIndex: '100', // 确保在游戏内容上方
            transition: 'opacity 0.5s ease' // 平滑过渡效果
        });
    }

    // 激活夜晚模式和聚光灯效果
    activateNight() {
        // 如果游戏处于结束状态，不激活失明效果
        if (this.game.status === "over") {
            console.log("游戏已结束，跳过失明效果激活");
            return;
        }
        
        console.log("Night mode activation started");
        this.game.night = true;
        this._active = true;
        
        // 激活聚光灯效果
        this.spotlightOverlay.classList.add('spotlight-active');
        this.spotlightOverlay.style.opacity = '1'; // 显示覆盖层
        
        // 首次立即更新一次位置
        this.updateSpotlightPosition();
        
        // 开始跟踪玩家位置并更新聚光灯
        this.updateSpotlightInterval = setInterval(() => {
            this.updateSpotlightPosition();
        }, 16); // 约60fps更新频率
    }

    // 更新聚光灯位置到玩家中心
    updateSpotlightPosition() {
        if (!this.game.night || !this.game.player || !this.spotlightOverlay) return;
        
        // 获取玩家中心位置
        const player = this.game.player;
        const playerCenterX = player.position.x + player.size.x / 2;
        const playerCenterY = player.position.y + player.size.y / 2;

        // 将画布坐标转换为屏幕坐标：考虑画布缩放与居中偏移
        const canvas = this.game.view;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        // 缓存用于性能，但当尺寸变化时浏览器会更新 rect
        this._lastCanvasRect = rect;
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;
        // 转换为页面像素坐标（与 fixed 覆盖层同一参照系）
        const screenX = rect.left + playerCenterX * scaleX;
        const screenY = rect.top + playerCenterY * scaleY;
        
        // 改进的径向渐变设置：
        // 1. 聚光中心完全透明，显示游戏内容
        // 2. 边缘过渡更柔和
        // 3. 外围使用半透明黑色，使未照亮区域变暗而非完全黑色
        this.spotlightOverlay.style.background = `radial-gradient(circle at ${screenX}px ${screenY}px,
            rgba(0, 0, 0, 0) ${this.spotlightRadius}px,
            rgba(0, 0, 0, 0.7) ${this.spotlightRadius + 50}px,
            rgba(0, 0, 0, 1) ${this.spotlightRadius + 100}px)`;
    }

    // 取消夜晚模式和聚光灯效果
    deactivateNight() {
        this.game.night = false;
        console.warn("Night mode deactivated");
        this._active = false;
        
        // 淡出覆盖层
        this.spotlightOverlay.style.opacity = '0';
        
        // 清除更新聚光灯位置的定时器
        if (this.updateSpotlightInterval) {
            clearInterval(this.updateSpotlightInterval);
            this.updateSpotlightInterval = null;
        }
        
        // 完全移除效果（可选，根据需要）
        setTimeout(() => {
            this.spotlightOverlay.classList.remove('spotlight-active');
            this.spotlightOverlay.style.background = '';
        }, 500); // 与过渡时间匹配
    }

    // 暴露状态供外部判断是否使用了 DOM 覆盖层夜晚效果
    isActive() {
        return !!this._active;
    }
}
