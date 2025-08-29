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
    play(event) {
        this.queue.push(event);
        if (!this.isPlaying) {
            this._runQueue();
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
            const event = this.queue.shift();
            this.images = event.images || [];
            this.texts = event.text || [];

            for (let i = 0; i < this.images.length; i++) {
                if (this.canceled) break;
                this.overlay.innerHTML = "";

                const img = document.createElement("img");
                img.src = this.images[i];
                Object.assign(img.style, { maxWidth: "80%", maxHeight: "80%", objectFit: "contain" });
                this.overlay.appendChild(img);

                if (this.texts[i] && !this.canceled) {
                    await this.dialog.prints([this.texts[i]]);
                }

                if (!this.canceled) {
                    await new Promise(resolve => {
                        this._resolveNext = resolve;
                    });
                    this._resolveNext = null;
                }
            }
        }

        this.end();
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
