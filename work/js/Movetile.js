class Movetile extends Rect {
    constructor(x, y, w, h, img, xmn, xmx, ymn, ymx, vx, vy) {
        super(x, y, w, h);
        this.img = img;
        // 兼容直接访问
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.lst = 0;
        this.xmx = xmx;
        this.xmn = xmn;
        this.ymx = ymx;
        this.ymn = ymn;
        this.vx = vx, this.vy = vy;
        
        // 初始化移动距离属性
        this.deltaX = 0;
        this.deltaY = 0;
        
        // 确保位置信息同步到父类
        this.setpos(x, y);
    }

    alive(game) {
        return 1;
    }

    update() {
        
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        
        
        // 边界检测和反弹
        if ((this.xmx != -1 && this.x + this.w >= this.xmx) || (this.xmn != -1 && this.x <= this.xmn)) {
            this.vx *= -1;
            // 防止卡在边界
            if (this.x + this.w >= this.xmx) this.x = this.xmx - this.w;
            if (this.x <= this.xmn) this.x = this.xmn;
        }
        if ((this.ymx != -1 && this.y + this.h >= this.ymx) || (this.ymn != -1 && this.y <= this.ymn)) {
            this.vy *= -1;
            // 防止卡在边界
            if (this.y + this.h >= this.ymx) this.y = this.ymx - this.h;
            if (this.y <= this.ymn) this.y = this.ymn;
        }
        
        // 更新父类的位置信息，确保碰撞检测使用正确位置
        this.setpos(this.x, this.y);
    }

    draw(game) {
        game.ctx.drawImage(this.img[0], this.x, this.y, this.w, this.h);
    }
}