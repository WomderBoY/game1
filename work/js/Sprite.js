class Spritesheet {
    constructor(game, json, img) {
        this.game = game;
        this.scale = new Vector(0.1, 0.1);
        this.frames = {};   // 新增映射
        for (let obj of json.frames) {
            for (let key in obj) {
                this.frames[key] = obj[key];  // key -> frame 对象
            }
        }
        this.animation = json.animation;
        this.img = img;
    }

    draw(key, pos, inverted=false) {
        let frame = this.frames[key];  // 使用映射访问
        if (!frame) {
            console.warn(`找不到帧: ${key}`);
            return;
        }
        let {x, y, w, h} = frame.frame;
        let ctx = this.game.ctx;
        ctx.save();
        if (inverted) {
            ctx.translate(pos.x + w*this.scale.x, pos.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.img, x, y, w, h, 0, 0, w*this.scale.x, h*this.scale.y);
        } else {
            ctx.drawImage(this.img, x, y, w, h, pos.x, pos.y, w*this.scale.x, h*this.scale.y);
        }
        ctx.restore();
    }
}