class TaijiManager {
    constructor(game) {
        this.game = game;
        this.taijiImg = null;
        this.element = null;
        this.cooldown = 0; // 冷却时间（防止连续触发）
        this.init();
    }

    // 初始化太极图元素和加载图片
    async init() {
        // 创建太极图DOM元素
        this.element = document.createElement("div");
        this.element.id = "taiji";
        this.element.style.position = "fixed"; // 改为 fixed，相对于视口定位
        this.element.style.pointerEvents = "none"; // 不影响鼠标交互
        this.element.style.opacity = "0";
        this.element.style.zIndex = "1000"; // 确保在最上层显示
        this.element.style.overflow = "hidden"; // 防止内容溢出
        document.body.appendChild(this.element);

        // 加载太极图片
        this.taijiImg = await this.game.datamanager.loadImg(
            "../images/taiji.png"
        ); // 替换为你的太极图路径
        const imgElement = document.createElement("img");
        imgElement.src = this.taijiImg.src;
        imgElement.style.width = "100px"; // 调整大小
        imgElement.style.height = "100px";
        imgElement.style.display = "block"; // 确保图片正确显示
        this.element.appendChild(imgElement);

        // 添加动画样式
        const style = document.createElement("style");
        style.textContent = `
            @keyframes taijiFadeOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
            }
            #taiji.animate {
                animation: taijiFadeOut 1.5s ease-out forwards;
            }
            #taiji {
                position: fixed !important;
                pointer-events: none !important;
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 触发太极动画（在角色位置）
    trigger() {
        const player = this.game.player;
        // 使用角色中心位置
        const targetX = player.position.x + player.size.x / 2;
        const targetY = player.position.y + player.size.y / 2;
        this._triggerAtPosition(targetX, targetY);
    }

    // 在指定位置触发太极动画
    triggerAtPosition(x, y) {
        this._triggerAtPosition(x, y);
    }

    // 内部方法：在指定位置触发太极动画
    _triggerAtPosition(targetX, targetY) {
//        const now = this.game.gameFrame;
        // 冷却时间检查（300ms内不重复触发）
//        if (now - this.cooldown < 80) return;
//        this.cooldown = now;

        const canvas = this.game.view;

        // 缓存画布位置和缩放信息，避免频繁重新计算
        if (!this._canvasRect || this.game.gameFrame % 30 === 0) {
            try {
                this._canvasRect = canvas.getBoundingClientRect();
                this._scaleX = this._canvasRect.width / canvas.width;
                this._scaleY = this._canvasRect.height / canvas.height;
            } catch (error) {
                console.warn("获取画布位置失败:", error);
                return;
            }
        }

        // 使用传入的目标位置
        const centerX = targetX;
        const centerY = targetY;

        // 计算太极图的目标位置
        const screenX = this._canvasRect.left + centerX * this._scaleX;
        const screenY = this._canvasRect.top + centerY * this._scaleY;

        // 太极图的尺寸（100px x 100px）
        const taijiSize = 100;
        const halfTaijiSize = taijiSize / 2;

        // 获取视口尺寸
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 限制太极图位置在视口范围内
        const clampedX = Math.max(
            halfTaijiSize,
            Math.min(viewportWidth - halfTaijiSize, screenX)
        );
        const clampedY = Math.max(
            halfTaijiSize,
            Math.min(viewportHeight - halfTaijiSize, screenY)
        );

        // 设置太极图位置（居中于角色，但限制在视口内）
        try {
            this.element.style.left = `${clampedX}px`;
            this.element.style.top = `${clampedY}px`;
            this.element.style.transform = "translate(-50%, -50%)";

            // 触发动画
            this.element.classList.remove("animate");
            void this.element.offsetWidth; // 强制重绘
            this.element.classList.add("animate");
        } catch (error) {
            console.warn("设置太极图位置失败:", error);
        }
    }

    // 清理函数，在游戏结束时调用
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        // 移除添加的样式
        const style = document.querySelector("style");
        if (style && style.textContent.includes("#taiji")) {
            style.remove();
        }
    }
}
