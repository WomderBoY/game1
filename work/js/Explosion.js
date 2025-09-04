// 方块粒子类（MC 风格）
class DeathParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // 粒子大小更小（像像素块）
        this.size = Math.random() * 3 + 2;

        // 随机颜色（黑、灰、少量白）
        const r = Math.random();
        if (r < 0.7) {
            // 黑 / 深灰
            const g = Math.floor(Math.random() * 50);
            this.color = `rgb(${g},${g},${g})`;
        } else {
            // 偶尔白色
            const w = 200 + Math.floor(Math.random() * 55);
            this.color = `rgb(${w},${w},${w})`;
        }

        // 初始速度（四散飞）
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;

        this.alpha = 1;
        this.life = 800; // 粒子寿命更短
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;

        // 粒子逐渐减速
        this.vx *= 0.9;
        this.vy *= 0.9;

        // 透明度随时间衰减
        this.life -= deltaTime;
        this.alpha = Math.max(0, this.life / 800);

        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        // 方块粒子（正方形）
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// 死亡爆炸（矩形范围生成方块粒子）
class Explosion {
    constructor(x, y, width, height, count = 40) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            this.particles.push(new DeathParticle(px, py));
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (this.particles[i].markedForDeletion) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    isFinished() {
        return this.particles.length === 0;
    }
}


class Expmanager {
    constructor (game) {
        this.game = game;
        this.empty();
    }

    empty() {
        this.exp = [];
    }

    addexp(x, y, w, h, amount = 50) {
        this.exp.push(new Explosion(x, y, w, h, amount));
    }

    update(deltaTime) {
        for (let i of this.exp) {
            i.update(deltaTime);
        }
    }

    draw() {
        for (let i of this.exp) {
            i.draw(this.game.ctx);
        }
    }
}