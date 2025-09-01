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
    }

    async init() {
        this.img = await this.game.datamanager.loadImg("../images/bagua.png");
    }

    empty() {
        this.baguas = [];
    }

    async LoadBagua(src) {
        let data = await this.game.datamanager.loadJSON(src);

        this.empty();

        for (let i of data[this.game.env].bagua) {
            let [x, y, w, h] = i.hitbox;
            await this.addBagua(x, y, w, h);
        }
    }

    addBagua(x, y, width, height) {
        this.baguas.push(new Bagua(x, y, width, height));
    }

    update(player) {
        for (let b of this.baguas) {
            // 如果和玩家重叠，并且按下Enter，就切换环境
            if (b.checkInteract(player) && this.game.inputmanager.takeEnter()) {
                // 切换 game.env（假设只有 'yin'/'yang' 两种）
                this.game.env = this.game.env == "yin" ? "yang" : "yin";
                this.game.changetimes++;
            }
        }
    }

    draw(ctx) {
        for (let b of this.baguas) {
            b.draw(ctx, this.img);
        }
    }
}
