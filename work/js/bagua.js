class Bagua {
    constructor(x, y, width, height) {
        this.rect = new Rect(x, y, width, height);
    }

    draw(ctx) {
  //      console.log('绘制八卦阵', this.rect );
        ctx.fillStyle = "purple"; // 先画个紫色矩形代替
        ctx.fillRect(this.rect.position.x, this.rect.position.y, this.rect.size.x, this.rect.size.y);
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
    }

    empty(){
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
                this.game.env = this.game.env == 'yin' ? 'yang' :"yin";
            }
        }
    }

    draw(ctx) {
        for (let b of this.baguas) {
            b.draw(ctx);
        }
    }
}