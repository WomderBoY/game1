class Trampoline extends Rect {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        (this.x = x), (this.y = y);
        (this.w = w), (this.h = h);
    }

    async update(prevX, prevY, vx, vy, ga) {
        if (prevY + ga.player.size.y <= this.y) {
            //            console.warn("up col!!!");
            ga.player.position.y = this.y - ga.player.size.y;
            entitymanager.vy = vy * (-0.9);
            if (Math.abs(entitymanager.vy) <= 1) {
                entitymanager.vy = 0;
                entitymanager.onground = true;
                entitymanager.isjp = false;
            }
            else {
                console.warn("fuckckckckc");
                entitymanager.onground = false;
                entitymanager.lstjp = ga.gameFrame;
                entitymanager.isjp = false;
            }
        }
        // 下方碰撞
        else if (prevY >= this.y + this.h) {
            //            console.warn("down col!!!");
            ga.player.position.y = this.y + this.h;
            entitymanager.vy = vy * (-0.9);
            entitymanager.onground = false;
            entitymanager.isjp = true;
        }
        // 左侧碰撞
        else if (prevX + ga.player.size.x <= this.x) {
            ga.player.position.x = this.x - ga.player.size.x - 0.5;
            entitymanager.vx = vx * (-0.9);
        }
        // 右侧碰撞
        else if (prevX >= this.x + this.w) {
            //            console.warn("right col!!!");
            ga.player.position.x = this.x + this.w + 0.5;
            entitymanager.vx = vx * (-0.9);
        }
    }

    async draw(game) {
        const ctx = game.ctx;
        if (game.env == 'yang') {
            // 画白色方块
            ctx.fillStyle = "white";
            ctx.fillRect(this.x, this.y, this.w, this.h); // (x, y, 宽, 高)
        }
        else {
            // 画黑色方块
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y, this.w, this.h); // (x, y, 宽, 高)
        }
    }
}
