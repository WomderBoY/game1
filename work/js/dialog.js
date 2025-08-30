class dialog {
    constructor(game) {
        this.buffer = [];
        this.canceled = false;
        this._cancel = null;
        this.game = game;

        this.createDialog();
    }

    createDialog() {
        // 创建对话框容器
        this.dialog = document.createElement("div");
        Object.assign(this.dialog.style, {
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            minHeight: "100px",
            padding: "10px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "2px solid white",
            borderRadius: "8px",
            boxSizing: "border-box",
            fontFamily: "sans-serif",
            overflow: "hidden",
            display: "none",
            zIndex: "999"
        });

        // 名字容器
        this.name = document.createElement("span");
        Object.assign(this.name.style, {
            fontWeight: "bold",
            display: "block",
            marginBottom: "5px"
        });

        // 文本容器
        this.text = document.createElement("p");
        this.text.style.margin = "0";

        this.dialog.appendChild(this.name);
        this.dialog.appendChild(this.text);

        document.getElementById("game").appendChild(this.dialog);
    }
    async close(duration = 500) {
        // duration 单位是毫秒，表示关闭动画总时间
        const steps = 20; // 动画分成多少步
        const interval = duration / steps;

        for (let i = steps; i >= 0; i--) {
            const scale = i / steps; // 从 1 到 0
            this.dialog.style.transform = `translateX(-50%) scaleY(${scale})`;
            await new Promise(r => setTimeout(r, interval));
        }
        this.dialog.style.display = "none";
        this.dialog.style.transform = "translateX(-50%) scaleY(1)";
    }
    async open() {
        this.dialog.style.display = "block";
    }

    async prints(texts) {
        this.canceled = false;
        this.buffer.push(...texts);
        await this.open();
        await this._prints();
        await this.close();
    }

    async _prints() {
    while (this.buffer.length > 0) {
        let text = this.buffer.shift();

        // 解析名字
        if (text[0] === "【") {
            let end = text.indexOf("】");
            this.name.textContent = text.slice(0, end + 1);
            text = text.slice(end + 1);
        }

        this.text.innerHTML = "";
        let chars = text.split("");
        let skip = false;
        this.game.soundmanager.playLoop('typing', 3, 1);

        // 逐字打印
        for (let i = 0; i < chars.length; i++) {
            if (this.canceled) {
      //          this.game.soundmanager.fadeLoop('typing', 0.5);
                return ;
            }

            let span = document.createElement("span");
            span.textContent = chars[i];
            this.text.appendChild(span);

            if (skip) continue; // 已按 Enter，直接显示剩余文字

            // 等待 50ms 或 Enter
            await new Promise(resolve => {
                const timer = setTimeout(resolve, 50);
                const handler = e => {
                    if (e.code === "Enter") {
                        skip = true;
                        clearTimeout(timer);
                        document.removeEventListener("keydown", handler);
                        resolve();
                    }
                };
                document.addEventListener("keydown", handler);
            });
        }

        this.game.soundmanager.fadeLoop('typing', 0.5);        

        // 段落显示完成，等待 Enter 再进入下一段
        if (this.canceled) return;
        await new Promise(resolve => {
            const handler = e => {
                if (e.code === "Enter") {
                    document.removeEventListener("keydown", handler);
                    resolve();
                }
            };
            document.addEventListener("keydown", handler);
        });

        this.name.textContent = "";
        this.text.innerHTML = "";
    }
}





    cancel() {
        this.canceled = true;
        if (this._cancel) {
            this._cancel();
            this._cancel = null;
        }
        this.buffer = [];
        this.text.innerHTML = "";
        this.name.textContent = "";
        this.dialog.style.display = "none";
    }
}
