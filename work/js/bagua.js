class Bagua {
    constructor(x, y, width, height) {
        this.rect = new Rect(x, y, width, height);
        this.angle = 0; // 初始旋转角度，单位是弧度
        this.rotateSpeed = 0.05; // 每帧旋转速度，可以自行调整
    }

    draw(ctx, img) {
        if (!img) return; // 图片没加载完，直接跳过

        // 中心点
        const centerX = this.rect.position.x + this.rect.size.x / 2;
        const centerY = this.rect.position.y + this.rect.size.y / 2;

        ctx.save(); // 保存当前状态
        ctx.translate(centerX, centerY); // 将画布原点移动到中心
        ctx.rotate(this.angle); // 按当前角度旋转

        // 由于中心点已经平移，这里画图需要从中心的左上角往左上偏移一半
        ctx.drawImage(
            img,
            -this.rect.size.x / 2,
            -this.rect.size.y / 2,
            this.rect.size.x,
            this.rect.size.y
        );

        ctx.restore(); // 恢复状态

        // 每次绘制后增加角度，形成旋转效果
        this.angle += this.rotateSpeed;
        if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2; // 防止角度过大
    }

    // 检查玩家是否和八卦阵重叠
    checkInteract(player) {
        return player.containsRect(this.rect);
    }
}

// ------------------ 八卦阵管理类 ------------------
class BaguaManager {
    constructor(game) {
        this.baguas = [];
        this.game = game;
        this.init();

        // 感叹号提示系统
        this.exclamationPrompt = {
            show: false,
            x: 0,
            y: 0,
            timer: 0,
            maxTimer: 300, // 显示5秒（60fps）
            animationPhase: 0,
            image: null,
            enterPressed: false
        };
    }

    async init() {
        this.img = await this.game.datamanager.loadImg("../images/bagua.png");
        this.exclamationPrompt.image = await this.game.datamanager.loadImg("../images/point.png");
    }

    empty() {
        this.baguas = [];
    }

    async LoadBagua(src) {
        let data = await this.game.datamanager.loadJSON(src);

        this.empty();

        for (let i of data['yang'].bagua) {
            let [x, y, w, h] = i.hitbox;
            await this.addBagua(x, y, w, h);
        }

        // 如果是第一关或第二关，显示感叹号提示
        if (src.includes("bg-map1.json") || src.includes("bg-map2.json")) {
            // 在玩家头顶显示感叹号
            this.showExclamationPrompt();
        }
    }

    addBagua(x, y, width, height) {
        this.baguas.push(new Bagua(x, y, width, height));
    }

    // 显示感叹号提示
    showExclamationPrompt() {
        this.exclamationPrompt.show = true;
        this.exclamationPrompt.x = this.game.player.position.x;
        this.exclamationPrompt.y = this.game.player.position.y;
        this.exclamationPrompt.timer = 0;
        this.exclamationPrompt.animationPhase = 0;
        this.exclamationPrompt.enterPressed = false;
    }

    // 隐藏感叹号提示
    hideExclamationPrompt() {
        this.exclamationPrompt.show = false;
    }

    // 更新感叹号提示动画
    updateExclamationPrompt() {
        if (!this.exclamationPrompt.show) return;

        // 更新位置跟随玩家
        this.exclamationPrompt.x = this.game.player.position.x;
        this.exclamationPrompt.y = this.game.player.position.y;

        this.exclamationPrompt.timer++;
        this.exclamationPrompt.animationPhase = Math.sin(this.exclamationPrompt.timer * 0.1) * 0.3 + 0.7;

        // 不再自动隐藏，只在按下Enter键后隐藏
    }

    // 绘制感叹号提示
    drawExclamationPrompt() {
        if (!this.exclamationPrompt.show || !this.exclamationPrompt.image) {
            return;
        }

        const ctx = this.game.ctx;
        const x = this.exclamationPrompt.x;
        const y = this.exclamationPrompt.y;
        const phase = this.exclamationPrompt.animationPhase;

        // 保存当前状态
        ctx.save();

        // 绘制point.png图片，使用呼吸效果
        const size = 32 * phase; // 呼吸缩放效果
        ctx.drawImage(
            this.exclamationPrompt.image,
            x + this.game.player.size.x, // 玩家右上角
            y - 10, // 悬浮在玩家头顶
            size,
            size
        );

        // 恢复状态
        ctx.restore();
    }

    update(player) {
        // // 更新感叹号提示
        // this.updateExclamationPrompt();

        // // 如果感叹号显示且按下回车键，显示对话框
        // if (this.exclamationPrompt.show && this.game.inputmanager.takeEnter() && !this.exclamationPrompt.enterPressed) {
        //     this.exclamationPrompt.enterPressed = true;
        //     this.hideExclamationPrompt();

        //     // 显示对话框
        //     this.game.eventmanager.add({
        //         type: "dialog",
        //         text: [
        //             "【旁白】在中央八卦阵按enter，将触发地图变化"
        //         ]
        //     });
        // }
        if (!this.game.canmove) return ;

        for (let b of this.baguas) {
            // 如果和玩家重叠，并且按下Enter，就切换环境
            if (b.checkInteract(player) && this.game.inputmanager.takeEnter()) {
                // 切换 game.env（假设只有 'yin'/'yang' 两种）
                this.game.env = this.game.env == "yin" ? "yang" : "yin";
                this.game.mapmanager.sethurt();
                this.game.changetimes++;
            }
        }
    }

    draw(ctx) {
        for (let b of this.baguas) {
            b.draw(ctx, this.img);
        }

        // 绘制感叹号提示
        this.drawExclamationPrompt();
    }
}
