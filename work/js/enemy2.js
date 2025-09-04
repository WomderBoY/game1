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




class Enemy2 {
    constructor(game, x, y, width, height, speed = 2, attackRange = 150, dashSpeed = 3) {
        this.game = game;
        this.rect = new Rect(x, y, 50, 50);

        this.speed = speed;   // 普通巡逻速度
        this.vy = 0;          // 垂直速度
        this.gravity = 0.5;
        this.onGround = false;
        this.type = false;
        this.dead = false;
        this.dying = false;

        // 攻击逻辑
        this.attackRange = attackRange; // 触发攻击的距离
        this.dashSpeed = dashSpeed;     // 冲刺速度
        this.isAttacking = false;       // 是否正在攻击
        this.lockedTarget = null;       // 锁定的目标位置（玩家位置）

        // 摇晃动画属性
        this.idleAmplitudeX = 2; // 水平摇晃幅度
        this.idleAmplitudeY = 1; // 垂直摇晃幅度
        this.idleFrequency = 0.05; // 摇晃频率
        this.idleTime = 0; // 动画时间计数器

        // 特效属性 (岩浆滴落)
        this.particles = [];
        this.particleSpawnInterval = 10; // 多少帧生成一个粒子
        this.particleTimer = 0;
        this.didExplode = false; // 爆炸是否已触发（仅用于绘制阶段控制）

        (async () => {
            this.imgstatic = await this.game.datamanager.loadImg("../images/enemy21.png");
            this.imgmove = await this.game.datamanager.loadImg("../images/enemy22.png");
        })();
    }

    update(colliders) {
        const player = this.game.player;
        let gm = this.game;

        if (this.dying) {
            this.deathTimer--;
            if (this.deathTimer <= 0) {
                this.dead = true;
            }
            // 清理粒子
            this.particles = this.particles.filter(p => p.life > 0);
            this.particles.forEach(p => p.update());
            return; // 死亡状态下不执行其他更新
        }

        // === 攻击检测 ===
        if (!this.isAttacking) {
            let dx = player.position.x - this.rect.position.x;
            let dy = player.position.y - this.rect.position.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= this.attackRange) {
                this.isAttacking = true;
                const dist = Math.sqrt(dx * dx + dy * dy);
                this.lockedTarget = { x: dx / dist, y: dy / dist };

                // 旋转图像逻辑
                const angleRad = Math.atan2(this.lockedTarget.y, this.lockedTarget.x);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const width = this.rect.size.x;
                const height = this.rect.size.y;

                const sin = Math.abs(Math.sin(angleRad));
                const cos = Math.abs(Math.cos(angleRad));
                const newWidth = Math.floor(width * cos + height * sin);
                const newHeight = Math.floor(width * sin + height * cos);

                this.rect.size.x = newWidth; // 更新敌人矩形的尺寸以适应旋转后的图像
                this.rect.size.y = newHeight;

                canvas.width = newWidth;
                canvas.height = newHeight;

                ctx.translate(newWidth / 2, newHeight / 2); // 移动到新Canvas的中心
                ctx.rotate(angleRad);
                ctx.drawImage(this.imgmove, -width / 2, -height / 2, width, height);

                const rotatedImg = new Image();
                rotatedImg.src = canvas.toDataURL();
                this.imgmove = rotatedImg;
            }
            this.idleTime++; // 只有在不攻击时才增加摇晃时间
        }

        if (this.isAttacking && this.lockedTarget) {
            this.rect.position.x += this.lockedTarget.x * this.dashSpeed;
            this.rect.position.y += this.lockedTarget.y * this.dashSpeed;

            // 粒子生成 (攻击时生成更多粒子，或者改变粒子行为)
            this.particleTimer++;
            if (this.particleTimer >= this.particleSpawnInterval / 2) { // 攻击时加速粒子生成
                this.particleTimer = 0;
                this.spawnLavaParticle();
            }

            // 边界检测
            if (
                this.rect.position.x <= 0 ||
                this.rect.position.x + this.rect.size.x >= this.game.width ||
                this.rect.position.y <= 0 ||
                this.rect.position.y + this.rect.size.y >= this.game.height
            ) {
                this.dying = true;
                this.deathTimer = 60; // 死亡动画持续时间
                // 播放爆破音效
                if (this.game.soundmanager) {
                    this.game.soundmanager.playOnce("explode", 2.0, 1);
                }
            }

            // 碰撞检测
            for (let box of colliders) {
                if (this.rect.containsRect(box)) { // 假设 Rect 有 intersects 方法
                    this.isAttacking = false;
                    this.lockedDirection = null;
                    this.dying = true;
                    this.deathTimer = 30;
                    // 播放爆破音效
                    if (this.game.soundmanager) {
                        this.game.soundmanager.playOnce("explode", 1.0, 1);
                    }
                }
            }

            // 玩家碰撞检测
            for (let enemy2 of this.game.enemy2manager.enemies) {
                const rect = enemy2.rect;
                if (
                    gm.player.position.x >= rect.position.x &&
                    gm.player.position.x <= rect.position.x + rect.size.x &&
                    gm.player.position.y >= rect.position.y &&
                    gm.player.position.y <= rect.position.y + rect.size.y
                ) {
                    this.dying = true;
                    this.deathTimer = 30;
                    this.game.hp.decrease(10);
                    // 播放爆破音效
                    if (this.game.soundmanager) {
                        this.game.soundmanager.playOnce("explode", 1.0, 1);
                    }
                }
            }

            // 敌人之间碰撞检测（可选，如果需要）
            // for (let enemy2 of this.game.enemy2manager.enemies) {
            //     if (enemy2 !== this && this.rect.intersects(enemy2.rect)) {
            //         // 发生碰撞，可以决定如何处理，例如两个都自毁或反弹
            //     }
            // }

        } else {
            // 非攻击状态下的粒子生成 (较慢的速度)
            this.particleTimer++;
            if (this.particleTimer >= this.particleSpawnInterval) {
                this.particleTimer = 0;
                this.spawnLavaParticle();
            }
        }

        // 更新粒子
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());
    }

    spawnLavaParticle() {
        // 从敌人底部中心生成粒子
        const x = this.rect.position.x + this.rect.size.x / 2;
        const y = this.rect.position.y + this.rect.size.y;
        const size = Math.random() * 3 + 2; // 粒子大小
        const dx = (Math.random() - 0.5) * 1; // 随机水平速度
        const dy = Math.random() * 0.5; // 向上一点点或向下
        const lifetime = Math.floor(Math.random() * 60) + 30; // 粒子生命周期
        const color = 'rgba(255, 100, 0, 1)'; // 橙红色
        this.particles.push(new LavaParticle(x, y, dx, dy, size, color, lifetime));
    }

    /**
     * 生成爆炸粒子（从中心向四周高速散开）
     */
    spawnExplosionParticles(count = 420) {
        const cx = this.rect.position.x + this.rect.size.x / 2;
        const cy = this.rect.position.y + this.rect.size.y / 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed * 0.9;
            const size = 1 + Math.random() * 3;
            const lifetime = 30 + Math.floor(Math.random() * 50);
            const r = 220 + Math.floor(Math.random() * 35);
            const g = 80 + Math.floor(Math.random() * 140);
            const b = Math.floor(Math.random() * 40);
            const color = `rgba(${r}, ${g}, ${b}, 1)`;
            this.particles.push(new LavaParticle(cx, cy, dx, dy, size, color, lifetime));
        }
    }


    draw(ctx) {
        if (this.dying && !this.dead) {
            // 碰到边界/碰撞箱后，触发一次性爆炸粒子
            if (!this.didExplode) {
                this.didExplode = true;
                // 清空常规滴落粒子，专注爆炸效果
                this.particles.length = 0;
                this.spawnExplosionParticles(420);
                // 播放爆破音效
                if (this.game.soundmanager) {
                    this.game.soundmanager.playOnce("explode", 2.0, 1);
                }
            }
        } else if (this.dead) {
            return;
        }

        const img = !this.isAttacking ? this.imgstatic : this.imgmove;
        if (!img) {
            // 图片未就绪也照常绘制粒子
            this.particles.forEach(p => p.draw(ctx));
            return;
        }

        let drawX = this.rect.position.x;
        let drawY = this.rect.position.y;

        // 应用摇晃效果 (仅在非攻击状态下)
        if (!this.isAttacking) {
            drawX += Math.sin(this.idleTime * this.idleFrequency) * this.idleAmplitudeX;
            drawY += Math.cos(this.idleTime * this.idleFrequency * 0.7) * this.idleAmplitudeY; // 垂直摇晃频率可以不同
        }

        // 爆炸阶段不再绘制本体，只绘制爆炸粒子
        if (!(this.dying && this.didExplode)) {
            ctx.drawImage(
                img,
                drawX,
                drawY,
                this.rect.size.x,
                this.rect.size.y
            );
        }

        // 绘制粒子
        this.particles.forEach(p => p.draw(ctx));

        // 无需调整全局透明度
    }
}


class Enemy2Manager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
    }

    /**
     * 清空所有敌人
     */
    empty() {
        this.enemies = [];
    }

    /**
     * 从 JSON 加载敌人
     * 这里假设你的 JSON 数据里有 enemy2 配置
     * {
     *   "yang": {
     *     "enemy": [...],
     *     "enemy2": [
     *        { "x":100, "y":200, "w":40, "h":40, "speed":2, "attackRange":150, "dashSpeed":6 }
     *     ]
     *   }
     * }
     */
    async LoadEnemy2(src) {
        let data = await this.game.datamanager.loadJSON(src);
        this.empty();

        if (data.yang.enemy2 && Array.isArray(data.yang.enemy2)) {
            for (let i of data.yang.enemy2) {
                await this.addEnemy2(
                    i.x, i.y, i.w, i.h,
                    i.speed, i.attackRange, i.dashSpeed
                );
            }
        }
    }

    /**
     * 手动添加一个 Enemy2
     */
    addEnemy2(x, y, width, height, speed = 2, attackRange = 150, dashSpeed = 6) {
        this.enemies.push(
            new Enemy2(this.game, x, y, width, height, speed, attackRange, dashSpeed)
        );
    }

    /**
     * 更新所有敌人
     */
    update() {
        const colliders = this.game.mapmanager.getCollidable(this.game.env);

        for (let enemy of this.enemies) {
            enemy.update(colliders);
        }

        // 清理死亡敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].dead) {
                this.enemies.splice(i, 1);
            }
        }
    }

    /**
     * 绘制所有敌人
     */
    draw(ctx) {
        for (let enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }
}
