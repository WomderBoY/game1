class inputmanager {
    constructor() {
        this.keys = new Set();
        this.lastEnterTime = 0; // 记录上次按下 Enter 的时间
        this.cooldown = 300;    // 冷却时间 300 毫秒

        // 监听按键按下（暂停时忽略输入）
        window.addEventListener('keydown', e => {
            if (window.game && window.game.status === 'paused') return;
            this.keys.add(e.code);
        });

        // 监听按键松开（暂停时忽略输入）
        window.addEventListener('keyup', e => {
            if (window.game && window.game.status === 'paused') return;
            this.keys.delete(e.code);
        });
    }

    /** 检查某个按键是否正在被按下 */
    isPressed(code) {
        return this.keys.has(code);
    }

    /** 检查是否按下了 A 键 */
    askA() {
        return this.isPressed('KeyA');
    }

    /** 检查是否按下了 D 键 */
    askD() {
        return this.isPressed('KeyD');
    }

    /** 检查是否按下了 W 键 */
    askW() {
        return this.isPressed('KeyW');
    }

    /** 检查是否按下了 J 键 */
    askJ() {
        return this.isPressed('KeyJ');
    }

    /** 检查是否按下了 Enter 键（带冷却） */
    takeEnter() {
        const now = Date.now();
        if (this.isPressed('Enter') && now - this.lastEnterTime > this.cooldown) {
            this.lastEnterTime = now;
            return true;
        }
        return false;
    }

    /**
     * 等待按下 Enter 键（带冷却）
     * 返回一个 Promise，按下后 resolve
     */
    waitEnter() {
        return new Promise(resolve => {
            const handler = e => {
                const now = Date.now();
                if (e.code === 'Enter' && now - this.lastEnterTime > this.cooldown) {
                    this.lastEnterTime = now;
                    document.removeEventListener('keydown', handler);
                    resolve(true);
                }
            };
            document.addEventListener('keydown', handler);
        });
    }
}