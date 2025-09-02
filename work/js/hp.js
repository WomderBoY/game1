class hp {
    constructor(maxHP = 5, game) {
        this.maxHP = maxHP; // 最大血量
        this.currentHP = maxHP; // 当前血量
        this.game = game; // 游戏实例
    }

    sethp(amount) {
        this.currentHP = amount;
    }

    decrease(amount = 1) {
        this.currentHP -= amount;
        if (this.currentHP < 0) this.currentHP = 0;
        return this.isDead();
    }

    increase(amount = 1) {
        this.currentHP += amount;
        if (this.currentHP > this.maxHP) this.currentHP = this.maxHP;
    }

    reset() {
        this.currentHP = this.maxHP;
    }

    isDead() {
//        if (this.currentHP === 0) {
            // 执行死亡相关逻辑
  //          this.game.status = "over";
    //        this.game.soundmanager.playOnce("death");
      //  }
        return this.currentHP === 0;
    }

    draw(ctx, canvasWidth = 1280, canvasHeight = 720) {
        // 当前 canvas 尺寸
        const scaleX = ctx.canvas.width / canvasWidth;
        const scaleY = ctx.canvas.height / canvasHeight;

        const x = 20 * scaleX; // 左上角 X
        const y = 20 * scaleY; // 左上角 Y
        const width = this.maxHP * 30 * scaleX; // 背景宽度
        const height = 20 * scaleY; // 血条高度
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
        ctx.fillText(
            `HP: ${this.currentHP}/${this.maxHP}`,
            x + 5,
            y + 15 * Math.min(scaleY, scaleX)
        );
    }

    draw2(ctx, centerX, centerY, canvasWidth = 1280, canvasHeight = 720) {
        // 缩放系数
        const scaleX = ctx.canvas.width / canvasWidth;
        const scaleY = ctx.canvas.height / canvasHeight;
        const scale = Math.min(scaleX, scaleY);

        // 血条尺寸
        const totalWidth = this.maxHP * 30 * scaleX; // 血条总宽度
        const height = 20 * scaleY;                  // 血条高度
        const currentWidth = this.currentHP * 30 * scaleX; // 当前血量宽度

        // 中心位置缩放
        const cx = centerX * scaleX;
        const cy = centerY * scaleY;

        // 左上角起点 (从中心点向左、向上偏移)
        const x = cx - totalWidth / 2;
        const y = cy - height / 2;

        // 背景血条
        ctx.fillStyle = "gray";
        ctx.fillRect(x, y, totalWidth, height);

        // 当前血量
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, currentWidth, height);

        // 血量文字（放在血条中间）
        ctx.fillStyle = "white";
        ctx.font = `${16 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            `HP: ${this.currentHP}/${this.maxHP}`,
            cx, // 文本中心 x
            cy  // 文本中心 y
        );
    }
}
