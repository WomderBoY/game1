class Fratile extends Rect {
    constructor(x, y, w, h, img, tiling = false) {
        super(x, y, w, h);
        this.img = img;
        this.tiling = tiling;
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
            if (this.tiling) {
                // 使用平铺绘制
                this.drawTiling(game.ctx, this.img[0], this.x, this.y, this.w, this.h);
            } else {
                game.ctx.drawImage(this.img[0], this.x, this.y, this.w, this.h);
            }
        }
        else if (this.hurt(game)) {
            if (game.gameFrame % 2 == 1) {
                if (this.tiling) {
                    this.drawTiling(game.ctx, this.img[0], this.x, this.y, this.w, this.h);
                } else {
                    game.ctx.drawImage(this.img[0], this.x, this.y, this.w, this.h);
                }
            }
        }
    }

    // 平铺绘制方法
    drawTiling(ctx, img, x, y, w, h) {
        if (!img || !img.complete) {
            ctx.drawImage(img, x, y, w, h);
            return;
        }

        const imgW = img.width;
        const imgH = img.height;

        if (w < 10 || h < 10) {
            ctx.drawImage(img, x, y, w, h);
            return;
        }

        const tileSize = Math.min(w, h);
        const tilesX = Math.ceil(w / tileSize);
        const tilesY = Math.ceil(h / tileSize);

        for (let ty = 0; ty < tilesY; ty++) {
            for (let tx = 0; tx < tilesX; tx++) {
                const currentX = x + tx * tileSize;
                const currentY = y + ty * tileSize;
                const currentW = Math.min(tileSize, x + w - currentX);
                const currentH = Math.min(tileSize, y + h - currentY);

                if (currentW > 0 && currentH > 0) {
                    ctx.drawImage(
                        img,
                        0, 0, imgW, imgH,
                        currentX, currentY, currentW, currentH
                    );
                }
            }
        }
    }

    update(game) {
        if (this.lst) return;
        console.log("Fratile被踩踏，玩家位置:", game.player);
        this.lst = game.gameFrame;

        // 播放木头断裂音效
        if (game.soundmanager) {
            console.log("尝试播放木头断裂音效...");
            const result = game.soundmanager.playOnce("wood_snap", 1.0, 1);
            if (result) {
                console.log("✅ 木头断裂音效播放成功");
            } else {
                console.error("❌ 木头断裂音效播放失败");
            }
        } else {
            console.error("❌ 音效管理器不存在");
        }
    }
}