class inputmanager {
    constructor() {
        this.keys = new Set();

        // 监听按键按下
        window.addEventListener('keydown', e => {
            this.keys.add(e.code);
        });

        // 监听按键松开
        window.addEventListener('keyup', e => {
            this.keys.delete(e.code);
        });
    }

    /** 检查某个按键是否正在被按下 */
    isPressed(code) {
        if (this.keys.has(code) == true) return true;
        return false;
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

    /** 检查是否按下了 Enter 键 */
    takeEnter() {
        return this.isPressed('Enter');
    }

    /**
     * 等待按下 Enter 键
     * 返回一个 Promise，按下后 resolve
     */
    waitEnter() {
        return new Promise(resolve => {
            const handler = e => {
                if (e.code === 'Enter') {
                    document.removeEventListener('keydown', handler);
                    resolve(true);
                }
            };
            document.addEventListener('keydown', handler);
        });
    }
}