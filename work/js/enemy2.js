/**
 * LavaParticle 类用于模拟岩浆滴落的单个粒子
 */
class LavaParticle {
    constructor(x, y, dx, dy, size, color, lifetime) {
        this.x = x;
        this.y = y;
        this.dx = dx; // 初始水平速度
        this.dy = dy; // 初始垂直速度
        this.size = size;
        this.color = color;
        this.lifetime = lifetime;
        this.life = lifetime;
        this.gravity = 0.1; // 模拟重力
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += this.gravity;
        this.life--;

        if (this.life > 0) {
            const currentAlpha = this.life / this.lifetime;
            this.color = this.color.replace(/, [\d\.]+\)/, `, ${currentAlpha.toFixed(2)})`);
        }
    }

    draw(ctx) {
        if (this.life > 0) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const currentSize = this.size * (this.life / this.lifetime);
            ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}


/**
 * Enemy2 类
 */
class Enemy2 {
    constructor(game, x, y, width, height, speed = 2, attackRange = 150, dashSpeed = 3) {
        this.game = game;
        this.rect = new Rect(x, y, width, height);

        this.speed = speed;
        this.vy = 0;
        this.gravity = 0.5;
        this.onGround = false;
        this.type = false;
        this.dead = false;
        this.dying = false;

        // 攻击逻辑
        this.attackRange = attackRange;
        this.dashSpeed = dashSpeed;
        this.isAttacking = false;
        this.lockedTarget = null;
        this.angleRad = 0; // 保存旋转角度

        // 摇晃动画
        this.idleAmplitudeX = 2;
        this.idleAmplitudeY = 1;
        this.idleFrequency = 0.05;
        this.idleTime = 0;

        // 粒子
        this.particles = [];
        this.particleSpawnInterval = 10;
        this.particleTimer = 0;
        this.didExplode = false;

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
            this.particles = this.particles.filter(p => p.life > 0);
            this.particles.forEach(p => p.update());
            return;
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

                // 保存角度（在 draw 里旋转用）
                this.angleRad = Math.atan2(this.lockedTarget.y, this.lockedTarget.x);
            }
            this.idleTime++;
        }

        if (this.isAttacking && this.lockedTarget) {
            this.rect.position.x += this.lockedTarget.x * this.dashSpeed;
            this.rect.position.y += this.lockedTarget.y * this.dashSpeed;

            // 粒子生成
            this.particleTimer++;
            if (this.particleTimer >= this.particleSpawnInterval / 2) {
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
                if (this.rect.containsRect(box)) {
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
        } else {
            // 非攻击状态下粒子生成
            this.particleTimer++;
            if (this.particleTimer >= this.particleSpawnInterval) {
                this.particleTimer = 0;
                this.spawnLavaParticle();
            }
        }

        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());
    }

    spawnLavaParticle() {
        const x = this.rect.position.x + this.rect.size.x / 2;
        const y = this.rect.position.y + this.rect.size.y;
        const size = Math.random() * 3 + 2;
        const dx = (Math.random() - 0.5) * 1;
        const dy = Math.random() * 0.5;
        const lifetime = Math.floor(Math.random() * 60) + 30;
        const color = 'rgba(255, 100, 0, 1)';
        this.particles.push(new LavaParticle(x, y, dx, dy, size, color, lifetime));
    }

    spawnExplosionParticles(count = 420) {
        console.warn('explode');
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
        if (this.dying) {
            console.warn('dying');
            if (!this.dead) {
                console.warn('not dead');
                if (!this.didExplode) {
                    console.warn('not explode');
                    this.didExplode = true;
                    this.particles.length = 0;
                    this.spawnExplosionParticles(420);
                }
                this.particles.forEach(p => p.draw(ctx));
                return;
            }
            else return;
        } else if (this.dead) {
            return;
        }

        const img = !this.isAttacking ? this.imgstatic : this.imgmove;
        if (!img) {
            this.particles.forEach(p => p.draw(ctx));
            return;
        }

        let drawX = this.rect.position.x;
        let drawY = this.rect.position.y;

        // 摇晃效果
        if (!this.isAttacking) {
            drawX += Math.sin(this.idleTime * this.idleFrequency) * this.idleAmplitudeX;
            drawY += Math.cos(this.idleTime * this.idleFrequency * 0.7) * this.idleAmplitudeY;
        }

        ctx.save();

        if (this.isAttacking && this.angleRad !== undefined) {
            ctx.translate(drawX + this.rect.size.x / 2, drawY + this.rect.size.y / 2);
            ctx.rotate(this.angleRad);
            ctx.drawImage(img, -this.rect.size.x / 2, -this.rect.size.y / 2, this.rect.size.x, this.rect.size.y);
        } else {
            ctx.drawImage(img, drawX, drawY, this.rect.size.x, this.rect.size.y);
        }

        ctx.restore();

        // 非死亡、资源正常时也绘制粒子（确保待命时的岩浆滴落可见）
        this.particles.forEach(p => p.draw(ctx));


    }
}


/**
 * Enemy2Manager 类
 */
class Enemy2Manager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
    }

    empty() {
        this.enemies = [];
    }

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

    addEnemy2(x, y, width, height, speed = 2, attackRange = 150, dashSpeed = 6) {
        this.enemies.push(
            new Enemy2(this.game, x, y, width, height, speed, attackRange, dashSpeed)
        );
    }

    update() {
        const colliders = this.game.mapmanager.getCollidable(this.game.env);
        for (let enemy of this.enemies) {
            enemy.update(colliders);
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].dead) {
                this.enemies.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (let enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }
}
