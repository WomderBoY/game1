class Trampoline extends Rect {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        (this.x = x), (this.y = y);
        (this.w = w), (this.h = h);
        
        // 预加载弹跳箱图片
        this.whiteImage = null;
        this.blackImage = null;
        this.loadImages();
    }
    
    async loadImages() {
        try {
            // 加载白色弹跳箱图片
            this.whiteImage = new Image();
            this.whiteImage.src = "../images/trampoline_white.png";
            
            // 加载黑色弹跳箱图片
            this.blackImage = new Image();
            this.blackImage.src = "../images/trampoline_black.png";
        } catch (error) {
            console.warn("弹跳箱图片加载失败:", error);
        }
    }

    async update(prevX, prevY, vx, vy, ga) {
        if (prevY + ga.player.size.y <= this.y) {
            //            console.warn("up col!!!");
            ga.player.position.y = this.y - ga.player.size.y;
            entitymanager.vy = vy * (-0.8);
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
            entitymanager.vy = vy * (-0.8);
            entitymanager.onground = false;
            entitymanager.isjp = true;
        }
        // 左侧碰撞
        else if (prevX + ga.player.size.x <= this.x) {
            ga.player.position.x = this.x - ga.player.size.x - 0.5;
            entitymanager.vx = vx * (-0.8);
        }
        // 右侧碰撞
        else if (prevX >= this.x + this.w) {
            //            console.warn("right col!!!");
            ga.player.position.x = this.x + this.w + 0.5;
            entitymanager.vx = vx * (-0.8);
        }
    }

    async draw(game) {
        const ctx = game.ctx;
        
        if (game.env == 'yang') {
            // 阳属性：绘制白色弹跳箱图片
            if (this.whiteImage && this.whiteImage.complete) {
                ctx.drawImage(this.whiteImage, this.x, this.y, this.w, this.h);
            } else {
                // 如果图片未加载完成，使用白色方块作为备用
                ctx.fillStyle = "white";
                ctx.fillRect(this.x, this.y, this.w, this.h);
            }
        } else {
            // 阴属性：绘制黑色弹跳箱图片
            if (this.blackImage && this.blackImage.complete) {
                ctx.drawImage(this.blackImage, this.x, this.y, this.w, this.h);
            } else {
                // 如果图片未加载完成，使用黑色方块作为备用
                ctx.fillStyle = "black";
                ctx.fillRect(this.x, this.y, this.w, this.h);
            }
        }
    }
}
