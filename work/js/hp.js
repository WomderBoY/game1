class hp {
    constructor(maxHP = 5, game) {
        this.maxHP = maxHP;  // 最大血量
        this.currentHP = maxHP; // 当前血量
        this.game = game; // 游戏实例
    }

    decrease(amount = 1) {
        this.currentHP -= amount;
        if (this.currentHP < 0) this.currentHP = 0;
        this.isDead();
    }

    increase(amount = 1) {
        this.currentHP += amount;
        if (this.currentHP > this.maxHP) this.currentHP = this.maxHP;
    }

    reset() {
        this.currentHP = this.maxHP;
    }

    isDead() {
        if (this.currentHP === 0) {
            // 执行死亡相关逻辑
            this.game.status = "over";
        }
    }

    draw(ctx, canvasWidth = 1280, canvasHeight = 720) {
    // 当前 canvas 尺寸
        const scaleX = ctx.canvas.width / canvasWidth;
        const scaleY = ctx.canvas.height / canvasHeight;

        const x = 20 * scaleX;  // 左上角 X
        const y = 20 * scaleY;  // 左上角 Y
        const width = this.maxHP * 30 * scaleX;   // 背景宽度
        const height = 20 * scaleY;               // 血条高度
        const currentWidth = this.currentHP * 30 * scaleX; // 当前血量宽度

        // 背景血条
        ctx.fillStyle = "gray";
        ctx.fillRect(x, y, width, height);

    // 当前血量
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, currentWidth, height);

    // 文字
        ctx.fillStyle = "white";
        ctx.font = `${16 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText(`HP: ${this.currentHP}/${this.maxHP}`, x + 5, y + 15 * Math.min(scaleY, scaleX));
    }
}