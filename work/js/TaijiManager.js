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
        this.element = document.createElement('div');
        this.element.id = 'taiji';
        this.element.style.position = 'absolute';
        this.element.style.pointerEvents = 'none'; // 不影响鼠标交互
        this.element.style.opacity = '0';
        this.element.style.zIndex = '100'; // 确保在角色上方显示
        document.body.appendChild(this.element);

        // 加载太极图片
        this.taijiImg = await this.game.datamanager.loadImg('../images/taiji.png'); // 替换为你的太极图路径
        const imgElement = document.createElement('img');
        imgElement.src = this.taijiImg.src;
        imgElement.style.width = '100px'; // 调整大小
        imgElement.style.height = '100px';
        this.element.appendChild(imgElement);

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes taijiFadeOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
            }
            #taiji.animate {
                animation: taijiFadeOut 1.5s ease-out forwards;
            }
        `;
        document.head.appendChild(style);
    }

    // 触发太极动画（在角色位置）
    trigger() {
        const now = this.game.gameFrame;
        // 冷却时间检查（300ms内不重复触发）
        if (now - this.cooldown < 200) return;
        this.cooldown = now;

        const player = this.game.player;
        const canvas = this.game.view;
        const canvasRect = canvas.getBoundingClientRect();

        // 计算角色中心位置（相对于页面）
        const playerCenterX = player.position.x + player.size.x / 2;
        const playerCenterY = player.position.y + player.size.y / 2;

        // 处理画布缩放（匹配游戏实际显示尺寸）
        const scaleX = canvasRect.width / canvas.width;
        const scaleY = canvasRect.height / canvas.height;

        // 设置太极图位置（居中于角色）
        this.element.style.left = `${canvasRect.left + playerCenterX * scaleX}px`;
        this.element.style.top = `${canvasRect.top + playerCenterY * scaleY}px`;
        this.element.style.transform = 'translate(-50%, -50%)';

        // 触发动画
        this.element.classList.remove('animate');
        void this.element.offsetWidth; // 强制重绘
        this.element.classList.add('animate');
    }
}