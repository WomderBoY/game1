
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
                if (this.stateTimer > 3000) this.changeState("CHARGE_TO_LEFT_PLATFORM");
                break;
            case "CHARGE_TO_LEFT_PLATFORM":
                this.moveTo(300, 580);
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
    }

    // 区间运动时的随机速度逻辑
    handleDynamicSpeed(startX, endX, movingRight) {
        if (!this.randomSpeedInitialized) {
            this.speed = 8+ Math.random() * 4; // 13-21
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

    reached(tx, ty, tolerance = 10) {
        return Math.abs(this.rect.position.x - tx) <= tolerance &&
               Math.abs(this.rect.position.y - ty) <= tolerance;
    }

    handlePlayerCollision(player) {
        if (!player.containsRect(this.rect)) return ;
        const playerBottom = player.position.y + player.size.y;
        const playerPrevY = player.position.y - (entitymanager.vy || 0);
        const rect = this.rect;
        
        if (playerPrevY + player.size.y <= rect.position.y
            && player.position.x + player.size.x >= this.rect.position.x
            && player.position.x <= this.rect.position.x + this.rect.size.x
        ) {
            console.warn("口血了");
            this.hp.decrease(1, this.rect.x, this.rect.y); 
            entitymanager.vy = -10;
            if (this.hp.isDead()) {
                this.dead = true;
                //这里加一个事件，让玩家传送到下一个关卡
                this.game.eventmanager.add({ 
                    type: "changemap", 
                    target: "../map/bg-map1.json", 
                    x: 0, 
                    y: 0 }, true);




            } else {
                this.stateTimer = 0;
            }
        } else {
            this.game.entitymanager.gethurt()
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

        // 血条
        this.hp.draw2(
            ctx,
            this.rect.position.x + this.rect.size.x / 2,
            this.rect.position.y - 20
        );
    }
}

class BossManager {
    constructor(game) {
        this.game = game;
        this.bosses = [];
    }

    addBoss(x, y, width = 80, height = 80, maxHP = 10) {
        this.bosses.push(new DiveBoss(this.game, x, y, width, height, maxHP));
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
