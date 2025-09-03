/**
 * LavaParticle 类用于模拟岩浆滴落的单个粒子
 */
class LavaParticle {
    /**
     * @param {number} x 粒子初始X坐标
     * @param {number} y 粒子初始Y坐标
     * @param {number} dx 粒子初始水平速度
     * @param {number} dy 粒子初始垂直速度
     * @param {number} size 粒子初始大小
     * @param {string} color 粒子颜色 (e.g., 'rgba(255, 100, 0, 1)')
     * @param {number} lifetime 粒子生命周期 (帧数)
     */
    constructor(x, y, dx, dy, size, color, lifetime) {
        this.x = x;
        this.y = y;
        this.dx = dx; // 初始水平速度
        this.dy = dy; // 初始垂直速度
        this.size = size;
        this.color = color; // 例如 'rgba(255, 100, 0, 1)'
        this.lifetime = lifetime;
        this.life = lifetime; // 当前生命值，从 lifetime 递减到 0
        this.gravity = 0.1; // 模拟重力，使粒子下落加速
    }

    /**
     * 更新粒子状态 (位置, 生命周期, 透明度)
     */
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += this.gravity; // 受重力影响，垂直速度增加
        this.life--; // 生命值递减

        // 随着生命减少，透明度逐渐降低，模拟粒子消散
        // 使用正则表达式来动态修改rgba颜色字符串的透明度部分
        // 假设颜色格式始终是 'rgba(r, g, b, a)'
        if (this.life > 0) {
            const currentAlpha = this.life / this.lifetime;
            // 找到最后一个逗号和右括号之间的部分（即透明度）并替换
            this.color = this.color.replace(/, [\d\.]+\)/, `, ${currentAlpha.toFixed(2)})`);
        }
    }

    /**
     * 绘制粒子
     * @param {CanvasRenderingContext2D} ctx Canvas 2D 渲染上下文
     */
    draw(ctx) {
        if (this.life > 0) { // 只在粒子还有生命时绘制
            ctx.fillStyle = this.color;
            ctx.beginPath();
            // 随着生命减少，粒子大小也逐渐缩小
            const currentSize = this.size * (this.life / this.lifetime);
            ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2); // 绘制圆形粒子
            ctx.fill();
        }
    }
}

// 接着是之前提供的 Enemy2 和 Enemy2Manager 类
// ... (Your Enemy2 and Enemy2Manager classes here)