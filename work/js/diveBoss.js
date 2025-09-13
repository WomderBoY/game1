// 尘土粒子类：管理单个粒子的生成、移动、绘制
class Particle {
    /**
     * @param {number} x - 粒子初始X坐标
     * @param {number} y - 粒子初始Y坐标
     * @param {number} size - 粒子初始大小
     * @param {number} speedX - 粒子X方向速度
     * @param {number} speedY - 粒子Y方向速度
     * @param {number} lifetime - 粒子生命周期（毫秒）
     */
    constructor(x, y, size, speedX, speedY, lifetime) {
        this.x = x;
        this.y = y;
        this.size = size; // 粒子初始大小
        this.speedX = speedX; // X方向速度（控制左右扩散）
        this.speedY = speedY; // Y方向速度（控制上下扩散+下落）
        this.lifetime = lifetime; // 粒子存活时间
        this.maxLifetime = lifetime; // 最大生命周期（用于计算透明度衰减）
        this.alpha = 1; // 粒子透明度（1=不透明，0=完全透明）
    }

    // 更新粒子状态（位置、大小、透明度）
    update(deltaTime) {
        // 1. 减少生命周期
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) return false; // 生命周期结束，标记为可删除

        // 2. 更新位置（模拟尘土扩散+轻微下落）
        this.x += this.speedX * (deltaTime / 16); // 与Boss移动速度时间戳同步
        this.y += this.speedY * (deltaTime / 16);

        // 3. 粒子大小衰减（逐渐变小）
        this.size = Math.max(0, this.size - (deltaTime / this.maxLifetime) * 2);

        // 4. 透明度衰减（逐渐消失）
        this.alpha = this.lifetime / this.maxLifetime;

        return true; // 粒子仍存活
    }

    // 绘制粒子（灰色半透明圆形）
    draw(ctx) {
        ctx.save(); // 保存画布状态，避免影响其他绘制
        // 设置粒子样式：灰色、半透明、无轮廓
        ctx.fillStyle = `rgba(120, 120, 120, ${this.alpha})`; // RGB(120,120,120) = 浅灰色
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // 绘制圆形粒子
        ctx.fill();
        ctx.restore(); // 恢复画布状态
    }
}

class DiveBoss {
    constructor(game, x = 100, y = 100, width = 200, height = 200, maxHP = 1) {
        this.game = game;
        this.rect = new Rect(x, y, width, height);

        this.state = "LEFT_IDLE";
        this.stateTimer = 0;

        this.baseSpeed = 10;     // 默认速度
        this.speed = this.baseSpeed;
        this.idleSpeed = 1.5;   // 巡逻时速度

        this.vx = 0;
        this.vy = 0;
        this.hp = new hp(maxHP, game);
        this.dead = false;

        // 移动区间内的速度调整逻辑
        this.randomSpeedInitialized = false;
        this.hasChangedSpeed = false;
        this.changePoint = null;

        // 四张图片
        this.imageLeftIdle = this.loadImage("../images/boss.png");
        this.imageRightIdle = this.loadImage("../images/boss2.png");
        this.imageLeftDive = this.loadImage("../images/boss-dash2.png");
        this.imageRightDive = this.loadImage("../images/boss-dash.png");

        // 新增：尘土粒子相关属性
        this.dustParticles = [];
        this.particleSpawnInterval = 50; // 每50毫秒生成一次粒子
        this.lastParticleTime = 0; // 上一次生成粒子的时间戳
    }

    loadImage(src) {
        const img = new Image();
        img.src = src;
        img.loaded = false;
        img.onload = () => { img.loaded = true; };
        return img;
    }

    update(player, deltaTime) {
        if (this.dead) return;

        // 横向移动时的动态速度逻辑
        switch (this.state) {
            case "MOVE_RIGHT":
                this.handleDynamicSpeed(300, 980, true);  // 左→右
                this.moveTo(980, 580);
                if (this.reached(980, 580)) {
                    this.resetSpeed();
                    this.changeState("RISE_TO_RIGHT_IDLE");
                }
                break;
            case "MOVE_LEFT":
                this.handleDynamicSpeed(980, 300, false); // 右→左
                this.moveTo(300, 580);
                if (this.reached(300, 580)) {
                    this.resetSpeed();
                    this.changeState("RISE_TO_LEFT_IDLE");
                }
                break;
            default:
                this.resetSpeed();
                break;
        }

        // 原有状态机
        switch (this.state) {
            case "LEFT_IDLE":
                this.patrol(0, 200, 0, 300);
                this.stateTimer += deltaTime;
                if (this.stateTimer > 3000 && this.game.canmove) this.changeState("CHARGE_TO_LEFT_PLATFORM");
                break;
            case "CHARGE_TO_LEFT_PLATFORM":
                this.moveTo(300, 580);
                this.game.soundmanager.playOnce("eagle_fly", 1, 1);
                if (this.reached(300, 580)) this.changeState("MOVE_RIGHT");
                break;
            case "RISE_TO_RIGHT_IDLE":
                this.moveTo(1100, 200);
                if (this.rect.position.x >= 1050 && this.rect.position.y <= 300)
                    this.changeState("RIGHT_IDLE");
                break;
            case "RIGHT_IDLE":
                this.patrol(1050, 1200, 0, 300);
                this.stateTimer += deltaTime;
                if (this.stateTimer > 3000) this.changeState("CHARGE_TO_RIGHT_PLATFORM");
                break;
            case "CHARGE_TO_RIGHT_PLATFORM":
                this.moveTo(980, 580);
                this.game.soundmanager.playOnce("eagle_fly", 1, 1);
                if (this.reached(980, 580)) this.changeState("MOVE_LEFT");
                break;
            case "RISE_TO_LEFT_IDLE":
                this.moveTo(100, 200);
                if (this.rect.position.x <= 200 && this.rect.position.y <= 300)
                    this.changeState("LEFT_IDLE");
                break;
        }

        // 更新位置
        this.rect.position.x += this.vx * deltaTime / 16;
        this.rect.position.y += this.vy * deltaTime / 16;

        // 踩头/碰撞判定
        this.handlePlayerCollision(player);

        // 更新血量系统（包括显示血量的平滑过渡和扣血动画）
        if (this.hp) {
            this.hp.update(deltaTime);
        }

        // 新增：更新尘土粒子状态（删除已消亡的粒子）
        this.dustParticles = this.dustParticles.filter(particle => {
            return particle.update(deltaTime); // 调用粒子的update，返回false则删除
        });

        // 新增：俯冲状态下生成粒子（控制生成频率）
        const isDiving = ["MOVE_RIGHT", "MOVE_LEFT", "CHARGE_TO_LEFT_PLATFORM", "CHARGE_TO_RIGHT_PLATFORM"].includes(this.state);
        if (isDiving) {
            this.lastParticleTime += deltaTime;
            if (this.lastParticleTime >= this.particleSpawnInterval) {
                this.spawnDustParticles(); // 生成粒子
                this.lastParticleTime = 0; // 重置间隔计时器
            }
        } else {
            // 非俯冲状态：清空残留粒子
            this.dustParticles = [];
            this.lastParticleTime = 0;
        }
    }

    // 新增：生成尘土粒子（根据俯冲方向调整粒子扩散区域）
    spawnDustParticles() {
        const boss = this.rect;
        const particleCount = 6; // 每次生成的粒子数量
        const bossCenterX = boss.position.x + boss.size.x / 2; // Boss中心点X
        const bossBottomY = boss.position.y + boss.size.y; // Boss底部Y（尘土从底部生成更自然）

        // 根据俯冲方向，调整粒子生成范围和扩散方向
        let spawnRangeX, speedRangeX;
        switch (this.state) {
            case "MOVE_RIGHT": // 向右俯冲：粒子在Boss左侧+下方生成，向左扩散
            case "CHARGE_TO_LEFT_PLATFORM":
                spawnRangeX = [boss.position.x - 30, boss.position.x + 70]; // 生成X范围
                speedRangeX = [-3, -0.5]; // X速度范围（向左扩散）
                break;
            case "MOVE_LEFT": // 向左俯冲：粒子在Boss右侧+下方生成，向右扩散
            case "CHARGE_TO_RIGHT_PLATFORM":
                spawnRangeX = [boss.position.x + boss.size.x - 70, boss.position.x + boss.size.x + 30]; // 生成X范围
                speedRangeX = [0.5, 3]; // X速度范围（向右扩散）
                break;
            default:
                return;
        }

        // 生成指定数量的粒子
        for (let i = 0; i < particleCount; i++) {
            // 1. 随机生成粒子初始位置（在Boss底部附近）
            const x = Math.random() * (spawnRangeX[1] - spawnRangeX[0]) + spawnRangeX[0];
            const y = Math.random() * 20 + bossBottomY - 20; // Y范围：Boss底部上下10px

            // 2. 随机粒子大小（1~3px，模拟细小尘土）
            const size = Math.random() * 2 + 5;

            // 3. 随机粒子速度（X方向按俯冲方向扩散，Y方向轻微上下浮动）
            const speedX = Math.random() * (speedRangeX[1] - speedRangeX[0]) + speedRangeX[0];
            const speedY = Math.random() * 2 - 1; // Y速度：-1~1（轻微上下）

            // 4. 随机粒子生命周期（300~600毫秒，避免同时消失）
            const lifetime = Math.random() * 300 + 300;

            // 5. 添加粒子到数组
            this.dustParticles.push(new Particle(x, y, size, speedX, speedY, lifetime));
        }
    }

    // 区间运动时的随机速度逻辑
    handleDynamicSpeed(startX, endX, movingRight) {
        if (!this.randomSpeedInitialized) {
            this.speed = 8 + Math.random() * 4; // 8-12
            this.changePoint = startX + Math.random() * (endX - startX); // 随机变速点
            this.randomSpeedInitialized = true;
            this.hasChangedSpeed = false;
            console.log("初始速度:", this.speed.toFixed(2), " 变速点:", this.changePoint.toFixed(2));
        }

        if (!this.hasChangedSpeed) {
            if (movingRight && this.rect.position.x >= this.changePoint) {
                this.speed = 13 + Math.random() * 8; // 13-21
                this.hasChangedSpeed = true;
                console.log("变速后速度:", this.speed.toFixed(2));
            } else if (!movingRight && this.rect.position.x <= this.changePoint) {
                this.speed = 13 + Math.random() * 8;
                this.hasChangedSpeed = true;
                console.log("变速后速度:", this.speed.toFixed(2));
            }
        }
    }

    resetSpeed() {
        this.speed = this.baseSpeed;
        this.randomSpeedInitialized = false;
        this.hasChangedSpeed = false;
        this.changePoint = null;
    }

    changeState(newState) {
        this.state = newState;
        this.stateTimer = 0;
        this.vx = 0;
        this.vy = 0;
    }

    patrol(xMin, xMax, yMin, yMax) {
        if (Math.random() < 0.02) {
            this.vx = (Math.random() - 0.5) * this.idleSpeed;
            this.vy = (Math.random() - 0.5) * this.idleSpeed;
        }
        if (this.rect.position.x < xMin) this.vx = this.idleSpeed;
        if (this.rect.position.x > xMax) this.vx = -this.idleSpeed;
        if (this.rect.position.y < yMin) this.vy = this.idleSpeed;
        if (this.rect.position.y > yMax) this.vy = -this.idleSpeed;
    }

    moveTo(tx, ty) {
        const dx = tx - this.rect.position.x;
        const dy = ty - this.rect.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) {
            this.vx = 0;
            this.vy = 0;
            return;
        }
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;

        if (Math.abs(dx) <= Math.abs(this.vx)) {
            this.rect.position.x = tx;
            this.vx = 0;
        }
        if (Math.abs(dy) <= Math.abs(this.vy)) {
            this.rect.position.y = ty;
            this.vy = 0;
        }
    }

    revive(x = 100, y = 100) {
        this.dead = false;
        this.hp.reset();   // 血回满
        this.state = "LEFT_IDLE"; // 初始状态
        this.stateTimer = 0;
        this.rect.position.x = x; // 重置坐标
        this.rect.position.y = y;
        this.vx = 0;
        this.vy = 0;
    }

    reached(tx, ty, tolerance = 10) {
        return Math.abs(this.rect.position.x - tx) <= tolerance &&
            Math.abs(this.rect.position.y - ty) <= tolerance;
    }

    handlePlayerCollision(player) {
        if (!player.containsRect(this.rect)) return;
        const playerBottom = player.position.y + player.size.y;
        const playerPrevY = player.position.y - (entitymanager.vy || 0);
        const rect = this.rect;

        if (playerPrevY + player.size.y <= rect.position.y
            && player.position.x + player.size.x >= this.rect.position.x
            && player.position.x <= this.rect.position.x + this.rect.size.x
        ) {
            console.warn("口血了");
            this.hp.decrease(1, this.rect.x, this.rect.y);
            this.game.soundmanager.playOnce("eagle_hurt", 5, 1);
            entitymanager.vy = -10;
            if (this.hp.isDead()) {
                this.dead = true;

                // 检查是否是bg4关卡的Boss击杀成就
                if (this.game.mapmanager.room && this.game.mapmanager.room.includes("bg4.json")) {
                    // 触发Boss击杀成就
                    if (this.game.achievements) {
                        this.game.achievements.unlock("boss_slayer");
                    }
                }

                //这里加一个事件，让玩家传送到下一个关卡
                this.game.eventmanager.add({
                    type: "changemap",
                    target: "../map/bg-map6.json",
                    with: {
                        "type": "cg",
                        "way": "negative",
                        "images": [
                            "../images/middle4.jpg"
                        ],
                        "text": [
                            [
                                "至阴之物发出一声凄厉惨嚎，旋即坠地不动。阴雾散去，死寂弥漫四野。",
                                "你收起锋芒，不敢多做停留，屏住呼吸，重新隐入黑暗，继续潜行前行。"
                            ],
                        ]
                    },
                    x: 0,
                    y: 0
                }, true);
            } else {
                this.stateTimer = 0;
            }
        } else {
            this.game.entitymanager.gethurt()
            this.game.soundmanager.playOnce("hurt", 1, 1);
        }
    }

    draw(ctx) {
        if (this.dead) return;

        let img = null;

        switch (this.state) {
            // 左边悬停
            case "LEFT_IDLE":
            case "RISE_TO_LEFT_IDLE":
                img = this.imageLeftIdle.loaded ? this.imageLeftIdle : null;
                break;

            // 右边悬停
            case "RIGHT_IDLE":
            case "RISE_TO_RIGHT_IDLE":
                img = this.imageRightIdle.loaded ? this.imageRightIdle : null;
                break;

            // 向右俯冲
            case "MOVE_RIGHT":
            case "CHARGE_TO_LEFT_PLATFORM":
                img = this.imageRightDive.loaded ? this.imageRightDive : null;
                break;

            // 向左俯冲
            case "MOVE_LEFT":
            case "CHARGE_TO_RIGHT_PLATFORM":
                img = this.imageLeftDive.loaded ? this.imageLeftDive : null;
                break;

            default:
                img = this.imageLeftIdle.loaded ? this.imageLeftIdle : null;
                break;
        }

        if (!img) return; // 确保图片已加载

        ctx.drawImage(
            img,
            this.rect.position.x,
            this.rect.position.y,
            this.rect.size.x,
            this.rect.size.y
        );

        // 新增：绘制所有活跃的尘土粒子（放在Boss绘制之后，确保粒子在Boss下方）
        this.dustParticles.forEach(particle => {
            particle.draw(ctx);
        });

        // 绘制血量条 - 在游戏画布上方显示
        if (this.hp && !this.dead) {
            this.hp.draw2(
                ctx,
                this.rect.position.x + this.rect.size.x / 2,
                this.rect.position.y - 30  // 在Boss上方30像素处显示血量条
            );
        }
    }
}

class BossManager {
    constructor(game) {
        this.game = game;
        this.bosses = [];
    }

    addBoss(x, y, width = 80, height = 80, maxHP = 3) {
        this.bosses.push(new DiveBoss(this.game, x, y, width, height, maxHP));
    }

    resetAllBosses() {
        for (let boss of this.bosses) {
            if (!boss.dead) {
                boss.revive(100, 100);  // 初始坐标随你设定
            }
        }
    }

    async loadBoss(jsonPath) {
        const data = await this.game.datamanager.loadJSON(jsonPath);
        console.warn('loadboss', data);
        this.bosses = [];
        if (data.boss && Array.isArray(data.boss)) {
            for (let b of data.boss) {
                console.warn('b = ', b);

                this.addBoss(b.x, b.y, b.w, b.h, b.maxHP);
            }
        }
        console.warn(this.bosses);
    }

    update(player, deltaTime) {
        for (let boss of this.bosses) {
            boss.update(player, deltaTime);
        }
        this.bosses = this.bosses.filter(b => !b.dead);
    }

    draw(ctx) {
        for (let boss of this.bosses) {
            boss.draw(ctx);
        }
    }
}
