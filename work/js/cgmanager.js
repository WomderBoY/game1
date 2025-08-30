class CGManager {
    constructor(game) {
        this.game = game;
        this.queue = [];        // CG 事件队列
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
            console.log('cg event start');
            console.log(this.game.canmove);
            const event = this.queue.shift();
            this.images = event.images || [];
            this.texts = event.text || [];

            for (let i = 0; i < this.images.length; i++) {
                if (this.canceled) break;
                this.overlay.innerHTML = "";

                const img = document.createElement("img");
                img.src = this.images[i];
                Object.assign(img.style, { maxWidth: "90%", maxHeight: "90%", objectFit: "contain", opacity: "1", transition: "opacity 0.5s" });
                this.overlay.appendChild(img);

                if (this.texts[i] && !this.canceled) {
                    await this.dialog.prints(this.texts[i]);
                    console.log('cg text done');
                }

                if (!this.canceled) {
                    await new Promise(resolve => {
                        this._resolveNext = resolve;
                    });
                    this._resolveNext = null;
                }
            }
            console.log('cg event end');
        }

        // ==== 图片淡出动画 ====
        if (this.overlay && this.overlay.firstChild) {
            const img = this.overlay.firstChild;
            img.style.opacity = "0"; // 开始淡出
            await new Promise(resolve => setTimeout(resolve, 500)); // 等待 0.5 秒
        }

        this.end();
        console.log('cg end');
        this.game.cg = false;
        this.game.canmove = true;
        this.isPlaying = false;
    }

    createOverlay() {
        if (!this.overlay) {
            this.overlay = document.createElement("div");
            Object.assign(this.overlay.style, {
                position: "fixed",
                top: "0", left: "0", right: "0", bottom: "0",
                background: "black",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: "998"
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
