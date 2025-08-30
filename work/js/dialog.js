class dialog {
    constructor(game) {
        this.buffer = [];
        this.canceled = false;
        this._cancel = null;
        this.username = localStorage.getItem('yyj_username') || '';
        this.game = game;

        this.createDialog();
    }

    // 重新加载用户名（用于从localStorage更新）
    reloadUsername() {
        this.username = localStorage.getItem('yyj_username') || '';
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

        // 输入框容器（默认隐藏）
        this.inputContainer = document.createElement("div");
        Object.assign(this.inputContainer.style, {
            marginTop: "10px",
            display: "none"
        });

        this.inputField = document.createElement("input");
        Object.assign(this.inputField.style, {
            width: "100%",
            padding: "8px",
            border: "1px solid white",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            fontSize: "14px",
            boxSizing: "border-box"
        });
        this.inputField.placeholder = "请输入...";

        this.inputContainer.appendChild(this.inputField);

        this.dialog.appendChild(this.name);
        this.dialog.appendChild(this.text);
        this.dialog.appendChild(this.inputContainer);

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
        this.reloadUsername(); // 重新加载用户名状态
        this.buffer.push(...texts);
        await this.open();
        await this._prints();
        await this.close();

    }

    async _prints() {
        while (this.buffer.length > 0) {
            let text = this.buffer.shift();

            // 检查是否是输入提示
            if (text.includes("请输入用户名：")) {
                // 如果已经有用户名，跳过输入提示和欢迎语
                if (this.username) {
                    // 跳过下一行的欢迎语
                    if (this.buffer.length > 0 && this.buffer[0].includes("你好：{用户名}")) {
                        this.buffer.shift();
                    }
                    continue;
                } else {
                    await this.handleUsernameInput();
                    continue;
                }
            }

            // 检查是否包含用户名占位符
            if (text.includes("【用户名】")) {
                text = text.replace(/用户名/g, this.username || "旅行者");
            }

            if (text.includes("{用户名}")) {
                text = text.replace(/{用户名}/g, this.username || "旅行者");
            }

            // 解析名字
            if (text[0] === "【") {
                let end = text.indexOf("】");
                this.name.textContent = text.slice(0, end + 1);
                text = text.slice(end + 1);
            }

        this.text.innerHTML = "";
        let chars = text.split("");
        let skip = false;
        this.game.soundmanager.playLoop('typing', 1, 1);

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

        await  this.game.soundmanager.fadeLoop('typing', 0.5);        

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

    async handleUsernameInput() {
        // 显示输入提示
        this.name.textContent = "【系统】";
        this.text.textContent = "请输入用户名：";
        this.inputContainer.style.display = "block";
        this.inputField.focus();

        // 等待用户输入并确认
        return new Promise(resolve => {
            const handleSubmit = () => {
                const username = this.inputField.value.trim();
                if (username) {
                    this.username = username;
                    localStorage.setItem('yyj_username', username);
                    this.inputContainer.style.display = "none";
                    this.inputField.value = "";
                    document.removeEventListener("keydown", handleKeydown);
                    resolve();
                }
            };

            const handleKeydown = (e) => {
                if (e.code === "Enter") {
                    handleSubmit();
                }
            };

            this.inputField.addEventListener("blur", handleSubmit);
            document.addEventListener("keydown", handleKeydown);
        });
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
        this.inputContainer.style.display = "none";
        this.dialog.style.display = "none";
    }
}
