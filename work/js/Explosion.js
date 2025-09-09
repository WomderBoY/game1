class BlackParticle { // 类名规范：首字母大写
    constructor(xi, yi) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3; // 1-4的随机速度

        this.x = xi; // 从Boss中心出发
        this.y = yi;
        this.size = 2 + Math.random() * 4; // 修复：漏了分号
        this.speedX = Math.cos(angle) * speed; // 速度变量名：speedX
        this.speedY = Math.sin(angle) * speed; // 速度变量名：speedY
        // 黑紫色系（加深黑色调，更明显）
        this.color = `rgba(${10 + Math.random() * 20}, ${0}, ${30 + Math.random() * 30}, 1)`;
        this.life = 60 + Math.random() * 40; // 生命周期改为60-100帧（按帧计算）
//        this.life *= 3;
        this.maxLife = this.life; // 用初始life作为maxLife，方便计算透明度
        this.markedForDeletion = false;
    }

    update() { // 按帧更新，无需deltaTime（或统一用帧计数）
        // 用正确的速度变量名
        this.x += this.speedX;
        this.y += this.speedY;

        // 粒子逐渐减速
        this.speedX *= 0.95;
        this.speedY *= 0.95;

        // 按帧减少生命周期（每帧减1）
        this.life--;
        // 透明度随生命周期衰减（0-1之间）
        this.alpha = Math.max(0, this.life / this.maxLife);

        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha; // 应用透明度
        ctx.fillStyle = this.color;
        // 绘制方块粒子（基于中心定位，可选）
        ctx.fillRect(
            this.x - this.size / 2, // 左移半个size，使粒子以x,y为中心
            this.y - this.size / 2,
            this.size,
            this.size
        );
        ctx.restore();
    }
}

class BlackParticleSystem { // 类名更清晰：黑色粒子系统
    constructor(x, y, count = 30) {
        this.particles = [];
        // 从(x,y)中心生成粒子（而非x+随机范围，避免偏移）
        for (let i = 0; i < count; i++) {
            this.particles.push(new BlackParticle(x, y));
        }
    }

    update() {
        // 更新所有粒子，删除已标记的粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].markedForDeletion) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // 绘制所有活跃粒子
        this.particles.forEach(particle => particle.draw(ctx));
    }

    // 检查粒子是否全部消失
    isEmpty() {
        return this.particles.length === 0;
    }
}

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
        this.life = 1500; // 粒子寿命更短
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;

        // 粒子逐渐减速
        this.vx *= 0.95;
        this.vy *= 0.95;

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

// 白色/灰色烟雾粒子类
class SmokeParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // 烟雾粒子大小（方块感，稍微大点）
        this.size = Math.random() * 6 + 4;

        // 白色和灰色混合
        const r = Math.random();
        if (r < 0.6) {
            // 偏白
            const w = 220 + Math.floor(Math.random() * 35); // 220~255
            this.color = `rgb(${w},${w},${w})`;
        } else {
            // 偏浅灰
            const g = 150 + Math.floor(Math.random() * 80); // 150~230
            this.color = `rgb(${g},${g},${g})`;
        }

        // 飘散速度较慢，略微上升
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2 - 0.3;

        this.alpha = 1;
        this.life = 3000; // 烟雾寿命更长
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;

        // 轻微扩散
        this.vx *= 0.98;
        this.vy *= 0.98;

        // 逐渐变透明
        this.life -= deltaTime;
        this.alpha = Math.max(0, this.life / 3000);

        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.7; // 柔和些
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// 烟雾效果（矩形范围生成粒子）
class Smoke {
    constructor(x, y, width, height, count = 30) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            this.particles.push(new SmokeParticle(px, py));
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

class asplayer {
    constructor(game, nowframe, lstframe, deltaframe, x, y) {
        this.game = game;
        this.startframe = nowframe;
        this.lstframe = lstframe;
        this.deltaframe = deltaframe;
        this.x = x, this.y = y;
    }

    update() {
        if (this.game.gameFrame <= this.startframe + this.lstframe
            && (this.game.gameFrame - this.startframe) % this.deltaframe == 0) {
            this.game.expmanager.addblk(this.x, this.y);
        }
    }
}

class Expmanager {
    constructor(game) {
        this.game = game;
        this.empty();
    }

    empty() {
        this.exp = [];
        this.asy = [];
    }

    addexp(x, y, w, h, amount = 50) {
        console.warn('addexp', this.exp.length, amount);
        this.exp.push(new Explosion(x, y, w, h, amount));
    }

    addsmoke(x, y, w, h, amount = 50) {
        console.warn('addsmk');
        this.exp.push(new Smoke(x, y, w, h, amount));
    }

    addblk(x, y) {
        console.warn('addblk');
        this.exp.push(new BlackParticleSystem(x, y));
    }

    conaddblk(x, y) {
        this.asy.push(new asplayer(this.game, this.game.gameFrame, 100, 5, x, y));
    }

    update(deltaTime) {
        for (let i of this.exp) {
            i.update(deltaTime);
        }
    }

    draw() {
        for (let i of this.asy) {
            i.update();
        }
        for (let i of this.exp) {
            i.draw(this.game.ctx);
        }
    }
}