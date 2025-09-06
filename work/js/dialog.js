class dialog {
    constructor(game) {
        this.buffer = [];
        this.canceled = false;
        this._cancel = null;
        this.username = localStorage.getItem("yyj_username") || "";
        this.game = game;

        this.createDialog();
    }

    // 重新加载用户名（用于从localStorage更新）
    reloadUsername() {
        this.username = localStorage.getItem("yyj_username") || "";
    }

    createDialog() {
        // 创建对话框容器
        this.dialog = document.createElement("div");
        this.dialog.className = "dialog-container";

        // 创建内容区域
        this.content = document.createElement("div");
        this.content.className = "dialog-content";

        // 创建对话人信息区域
        this.speaker = document.createElement("div");
        this.speaker.className = "dialog-speaker";

        // 创建头像
        this.avatar = document.createElement("div");
        this.avatar.className = "dialog-avatar";
        this.avatar.textContent = "?";

        // 创建名字容器
        this.name = document.createElement("h3");
        this.name.className = "dialog-name";

        // 创建文本容器
        this.text = document.createElement("p");
        this.text.className = "dialog-text";

        // 输入框容器（默认隐藏）
        this.inputContainer = document.createElement("div");
        this.inputContainer.className = "dialog-input-container";

        this.inputField = document.createElement("input");
        this.inputField.className = "dialog-input";
        this.inputField.placeholder = "请输入...";

        this.inputContainer.appendChild(this.inputField);

        // 组装结构
        this.speaker.appendChild(this.avatar);
        this.speaker.appendChild(this.name);
        this.content.appendChild(this.speaker);
        this.content.appendChild(this.text);
        this.content.appendChild(this.inputContainer);
        this.dialog.appendChild(this.content);

        document.getElementById("game").appendChild(this.dialog);

        // 默认设置为旁白样式
        this.setDialogTheme("mysterious");
    }

    // 设置对话框主题
    setDialogTheme(theme) {
        // 移除所有主题类
        this.dialog.classList.remove("system", "player", "npc", "boss", "mysterious");
        // 添加新主题类
        this.dialog.classList.add(theme);

        // 根据主题设置头像和样式
        this.updateAvatar(theme);
    }

    // 更新头像显示
    updateAvatar(theme, customAvatar = null) {
        if (customAvatar) {
            // 使用自定义头像图片
            this.avatar.style.backgroundImage = `url(${customAvatar})`;
            this.avatar.classList.add("has-bg");
            this.avatar.innerHTML = '<span class="avatar-text"></span>';
        } else {
            // 使用默认表情符号
            const avatarMap = {
                "system": "🔮",
                "player": "👤",
                "npc": "🗣",
                "boss": "👹",
                "mysterious": "🔮"
            };

            this.avatar.style.backgroundImage = "";
            this.avatar.classList.remove("has-bg");
            this.avatar.textContent = avatarMap[theme] || "?";
        }
    }

    // 设置对话框背景图片
    setDialogBackground(imageUrl) {
        if (imageUrl) {
            this.dialog.style.backgroundImage = `url(${imageUrl})`;
            this.dialog.classList.add("has-bg");
            console.log("背景图片设置:", imageUrl);
        } else {
            this.dialog.style.backgroundImage = "";
            this.dialog.classList.remove("has-bg");
        }
    }

    // 强制应用样式
    forceApplyStyles() {
        console.log("强制应用样式...");

        // 强制设置背景图片
        if (this.dialog.classList.contains("has-bg")) {
            this.dialog.style.backgroundImage = "url(../images/diagbg1.png)";
            this.dialog.style.backgroundSize = "cover";
            this.dialog.style.backgroundPosition = "center";
            this.dialog.style.backgroundRepeat = "no-repeat";
            console.log("强制设置背景图片样式");
        }

        // 强制设置名称样式
        if (this.name.textContent === "旁白") {
            this.name.style.color = "#330066";
            this.name.style.fontSize = "22px";
            this.name.style.fontWeight = "bold";
            console.log("强制设置名称样式");
        }

        // 强制设置头像样式
        if (this.dialog.classList.contains("mysterious")) {
            this.avatar.textContent = "🔮";
            this.avatar.style.background = "linear-gradient(145deg, #9666ff, #7744ff)";
            this.avatar.style.border = "2px solid rgba(150, 100, 255, 0.6)";
            console.log("强制设置头像样式");
        }

        console.log("强制应用样式完成");
    }

    // 根据对话人名称设置主题
    setDialogThemeBySpeaker(speakerName) {
        console.log("设置对话人主题:", speakerName);

        const speakerConfig = {
            "系统": { theme: "mysterious", avatar: null, background: "../images/diagbg1.png", displayName: "旁白" },
            "玩家": { theme: "player", avatar: null, background: "../images/diagbg2.png", displayName: "玩家" },
            "Boss": { theme: "mysterious", avatar: null, background: "../images/diagbg3.png", displayName: "旁白" },
            "旁白": { theme: "mysterious", avatar: null, background: "../images/diagbg4.png", displayName: "旁白" }
        };

        // 检查是否匹配已知的对话人
        let config = { theme: "mysterious", avatar: null, background: "../images/diagbg1.png", displayName: "旁白" }; // 默认为mysterious主题

        for (let [key, value] of Object.entries(speakerConfig)) {
            if (speakerName.includes(key)) {
                config = value;
                console.log("匹配到配置:", key, config);
                break;
            }
        }

        console.log("应用配置:", config);

        // 设置主题
        this.setDialogTheme(config.theme);
        console.log("主题设置完成:", config.theme);

        // 设置头像
        this.updateAvatar(config.theme, config.avatar);
        console.log("头像设置完成");

        // 设置背景
        this.setDialogBackground(config.background);
        console.log("背景设置完成:", config.background);

        // 设置显示名称
        if (config.displayName) {
            this.name.textContent = config.displayName;
            console.log("显示名称设置完成:", config.displayName);
        }

        // 强制应用样式
        this.forceApplyStyles();
    }

    async close(duration = 300) {
        this.dialog.classList.add("hide");
        this.dialog.classList.remove("show");

        // 立即清空内容，防止显示空对话框

        await new Promise((resolve) => setTimeout(resolve, duration));

        this.text.innerHTML = "";
        this.inputContainer.style.display = "none";
        this.dialog.style.display = "none";
        this.dialog.classList.remove("hide");

        // 不要清空name.textContent，保持样式设置
        // this.name.textContent = "";
    }


    async open() {
        this.dialog.style.display = "block";
        // 强制重绘
        this.dialog.offsetHeight;
        // 添加显示动画
        this.dialog.classList.add("show");

        // 确保样式正确应用
        this.forceApplyStyles();
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
                    if (
                        this.buffer.length > 0 &&
                        this.buffer[0].includes("你好：{用户名}")
                    ) {
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

            // 解析名字和主题
            if (text[0] === "【") {
                let end = text.indexOf("】");
                let speakerName = text.slice(1, end); // 去掉【】
                text = text.slice(end + 1);

                console.log("解析到对话人:", speakerName);

                // 根据对话人设置主题（这会自动设置正确的显示名称）
                this.setDialogThemeBySpeaker(speakerName);

                // 延迟一点时间确保样式应用
                setTimeout(() => {
                    this.forceApplyStyles();
                }, 100);
            }

            this.text.innerHTML = "";
            let chars = text.split("");
            let skip = false;
            this.game.soundmanager.playLoop("five_beeps", 1, 1);

            // 逐字打印
            for (let i = 0; i < chars.length; i++) {
                if (this.canceled) {
                    //          this.game.soundmanager.fadeLoop('typing', 0.5);
                    return;
                }

                let span = document.createElement("span");
                span.textContent = chars[i];
                this.text.appendChild(span);

                if (skip) continue; // 已按 Enter，直接显示剩余文字

                // 等待 50ms 或 Enter
                await new Promise((resolve) => {
                    const timer = setTimeout(resolve, 50);
                    const handler = (e) => {
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

            await this.game.soundmanager.fadeLoop("five_beeps", 0.5);

            // 段落显示完成，等待 Enter 再进入下一段
            if (this.canceled) return;
            await new Promise((resolve) => {
                const handler = (e) => {
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
        this.name.textContent = "旁白";
        this.text.textContent = "请输入用户名：";
        this.setDialogTheme("mysterious");
        this.setDialogBackground("../images/diagbg1.png");
        this.inputContainer.style.display = "block";
        this.inputField.focus();

        // 等待用户输入并确认
        return new Promise((resolve) => {
            const handleSubmit = () => {
                const username = this.inputField.value.trim();
                if (username) {
                    this.username = username;
                    localStorage.setItem("yyj_username", username);
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
