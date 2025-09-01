class Fratile extends Rect {
    constructor(x, y, w, h, img) {
        super(x, y, w, h);
        this.img = img;
        // 兼容直接访问
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.lst = 0;
    }

    alive(game) {
        if (this.lst == 0) return true;
        else if (this.hurt(game)) return true;
        return false;
    }

    hurt(game) {
        if (!this.lst) return false;
        return game.gameFrame - this.lst <= 50;
    }

    draw(game) {
//        console.log(this.img[0], this.x, this.y, this.w, this.h);
        if (this.alive(game) && !this.hurt(game)) {
            game.ctx.drawImage(this.img[0], this.x, this.y, this.w, this.h);
        }
        else if (this.hurt(game)) {
            if (game.gameFrame % 2 == 1) {
                game.ctx.drawImage(this.img[0], this.x, this.y, this.w, this.h);
            }
        }
    }

    update(game) {
        if (this.lst) return ;
        console.log(game.player);
        this.lst = game.gameFrame;
    }
}