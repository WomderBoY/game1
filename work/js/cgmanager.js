class CGManager {
    constructor(game) {
        this.game = game;
        this.queue = []; // CG 事件队列
        this.isPlaying = false; // 播放锁
        this.overlay = null;
        this.dialog = game.dialog;
        this._keydownHandler = this._onKeyDown.bind(this);
        this._clickHandler = this._onClick.bind(this);
        this._resolveNext = null;
        this.canceled = false;
    }

    // 添加一个新的 CG 事件到队列
    async play(event) {
        this.queue.push(event);
        if (!this.isPlaying) {
            await this._runQueue();
        }
    }

    async _runQueue() {
        this.isPlaying = true;
        this.game.cg = true;
        this.game.canmove = false;
        this.canceled = false;
        this.createOverlay();

        document.addEventListener("keydown", this._keydownHandler);
        document.addEventListener("click", this._clickHandler);

        while (this.queue.length > 0) {
            console.log("cg event start");
            console.log(this.game.canmove);
            const event = this.queue.shift();
            this.images = event.images || [];
            this.texts = event.text || [];

            for (let i = 0; i < this.images.length; i++) {
                if (this.canceled) break;
                this.overlay.innerHTML = "";

                const img = document.createElement("img");
                img.src = this.images[i];

                // 公共样式
                Object.assign(img.style, {
                    maxWidth: "80%",
                    maxHeight: "80%",
                    objectFit: "contain",
                    transition: "opacity 0.5s",
                });

                // 第一张淡入，其余直接显示
                img.style.opacity = "0"; // 初始透明
                this.overlay.appendChild(img);
                // 触发淡入
                requestAnimationFrame(() => {
                    img.style.opacity = "1";
                });
                // 等待淡入完成
                await new Promise((resolve) => setTimeout(resolve, 500));

                if (this.texts[i] && !this.canceled) {
                    // 确保传递正确的文本格式
                    const textArray = Array.isArray(this.texts[i]) ? this.texts[i] : [this.texts[i]];
                    console.log("CGManager 调用对话框，文本:", textArray);
                    console.log("对话框对象:", this.game.dialog);
                    await this.game.dialog.prints(textArray);
                    console.log("cg text done");
                }

                if (!this.canceled) {
                    await new Promise((resolve) => {
                        this._resolveNext = resolve;
                    });
                    this._resolveNext = null;
                }
            }
            console.log("cg event end");
        }

        // ==== 图片淡出动画 ====
        if (this.overlay && this.overlay.firstChild) {
            const img = this.overlay.firstChild;
            img.style.opacity = "0"; // 开始淡出
            await new Promise((resolve) => setTimeout(resolve, 500)); // 等待 0.5 秒
        }

        this.end();
        console.log("cg end");
        this.game.cg = false;
        this.game.canmove = true;
        this.isPlaying = false;
    }

    createOverlay() {
        if (!this.overlay) {
            this.overlay = document.createElement("div");
            Object.assign(this.overlay.style, {
                position: "fixed",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                background: "black",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: "998",
            });
            document.body.appendChild(this.overlay);
        }
        this.overlay.style.display = "flex";
    }

    _onKeyDown(e) {
        if ((e.key === " " || e.key === "Enter") && this._resolveNext) {
            this._resolveNext();
            this._resolveNext = null;
        }
        if (e.key === "Escape") {
            this.canceled = true;
            if (this._resolveNext) {
                this._resolveNext();
                this._resolveNext = null;
            }
        }
        // 添加U键跳过功能
        if (e.key === "u" || e.key === "U") {
            this.canceled = true;
            // 立即结束当前CG
            this.queue = []; // 清空队列
            // 清空当前事件的剩余内容
            this.images = [];
            this.texts = [];
            // 清空对话系统的缓冲区
            if (this.dialog) {
                this.dialog.clearBuffer();
            }
            if (this._resolveNext) {
                this._resolveNext();
                this._resolveNext = null;
            }
        }
    }

    _onClick() {
        if (this._resolveNext) {
            this._resolveNext();
            this._resolveNext = null;
        }
    }

    end() {
        if (this.overlay) {
            this.overlay.style.display = "none";
            this.overlay.innerHTML = "";
        }
        document.removeEventListener("keydown", this._keydownHandler);
        document.removeEventListener("click", this._clickHandler);
    }
}
