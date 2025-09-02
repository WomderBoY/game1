// class DiveBoss {
//     constructor(game, x = 100, y = 100, width = 80, height = 80, maxHP = 10) {
//         this.game = game;
//         this.rect = new Rect(x, y, width, height);

//         this.state = "LEFT_IDLE";
//         this.stateTimer = 0;

//         this.speed = this.baseSpeed;       // 冲击/水平移动速度
//         this.idleSpeed = 1.5; // 巡逻时速度

//         this.vx = 0;
//         this.vy = 0;

//         this.hp = new hp(maxHP, game);
//         this.dead = false;
//          this.randomSpeedInitialized = false;
//         this.hasChangedSpeed = false;
//         this.changePoint = null;


//         // 图片加载
//         this.img = new Image();
//         this.img.src = "../images/enemy-white.png";
//         this.imgLoaded = false;

//         // 图片加载完成标记
//         this.img.onload = () => {
//             this.imgLoaded = true;
//         };
//     }

//     update(player, deltaTime) {
//         if (this.dead) return;

//         // 状态机逻辑（保持原有）
//         switch (this.state) {
//             case "LEFT_IDLE":
//                 this.patrol(0, 200, 0, 300);
//                 this.stateTimer += deltaTime;
//                 if (this.stateTimer > 3000) this.changeState("CHARGE_TO_LEFT_PLATFORM");
//                 break;
//             case "CHARGE_TO_LEFT_PLATFORM":
//                 this.moveTo(300, 580);
//                 if (this.reached(300, 580)) this.changeState("MOVE_RIGHT");
//                 break;
//             case "MOVE_RIGHT":
//                 this.moveTo(980, 580);
//                 if (this.reached(980, 580)) this.changeState("RISE_TO_RIGHT_IDLE");
//                 break;
//             case "RISE_TO_RIGHT_IDLE":
//                 this.moveTo(1100, 200);
//                 if (this.rect.position.x >= 1050 && this.rect.position.y <= 300)
//                     this.changeState("RIGHT_IDLE");
//                 break;
//             case "RIGHT_IDLE":
//                 this.patrol(1050, 1200, 0, 300);
//                 this.stateTimer += deltaTime;
//                 if (this.stateTimer > 3000) this.changeState("CHARGE_TO_RIGHT_PLATFORM");
//                 break;
//             case "CHARGE_TO_RIGHT_PLATFORM":
//                 this.moveTo(980, 580);
//                 if (this.reached(980, 580)) this.changeState("MOVE_LEFT");
//                 break;
//             case "MOVE_LEFT":
//                 this.moveTo(300, 580);
//                 if (this.reached(300, 580)) this.changeState("RISE_TO_LEFT_IDLE");
//                 break;
//             case "RISE_TO_LEFT_IDLE":
//                 this.moveTo(100, 200);
//                 if (this.rect.position.x <= 200 && this.rect.position.y <= 300)
//                     this.changeState("LEFT_IDLE");
//                 break;
//         }

//         // 更新位置
//         this.rect.position.x += this.vx * deltaTime / 16;
//         this.rect.position.y += this.vy * deltaTime / 16;

//         // 踩头/碰撞判定
//         this.handlePlayerCollision(player);
//     }

//     changeState(newState) {
//         this.state = newState;
//         this.stateTimer = 0;
//         this.vx = 0;
//         this.vy = 0;
//     }

//     patrol(xMin, xMax, yMin, yMax) {
//         if (Math.random() < 0.02) {
//             this.vx = (Math.random() - 0.5) * this.idleSpeed;
//             this.vy = (Math.random() - 0.5) * this.idleSpeed;
//         }
//         if (this.rect.position.x < xMin) this.vx = this.idleSpeed;
//         if (this.rect.position.x > xMax) this.vx = -this.idleSpeed;
//         if (this.rect.position.y < yMin) this.vy = this.idleSpeed;
//         if (this.rect.position.y > yMax) this.vy = -this.idleSpeed;
//     }

//     moveTo(tx, ty) {
//         const dx = tx - this.rect.position.x;
//         const dy = ty - this.rect.position.y;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         if (dist === 0) {
//             this.vx = 0;
//             this.vy = 0;
//             return;
//         }
//         this.vx = (dx / dist) * this.speed;
//         this.vy = (dy / dist) * this.speed;

//         if (Math.abs(dx) <= Math.abs(this.vx)) {
//             this.rect.position.x = tx;
//             this.vx = 0;
//         }
//         if (Math.abs(dy) <= Math.abs(this.vy)) {
//             this.rect.position.y = ty;
//             this.vy = 0;
//         }
//     }

//     reached(tx, ty, tolerance = 10) {
//         return Math.abs(this.rect.position.x - tx) <= tolerance &&
//                Math.abs(this.rect.position.y - ty) <= tolerance;
//     }

//     handlePlayerCollision(player) {
//         if (!player.containsRect(this.rect)) return ;
//         const playerBottom = player.position.y + player.size.y;
//         const playerPrevY = player.position.y - (entitymanager.vy || 0);
//         const rect = this.rect;
        
//         const now = performance.now();

//         if (playerPrevY + player.size.y <= rect.position.y
//             && player.position.x + player.size.x >= this.rect.position.x
//             && player.position.x <= this.rect.position.x + this.rect.size.x
//         ) {
//             this.hp.decrease();
//             entitymanager.vy = -10;
//             if (this.hp.isDead()) {
//       //          this.state = "dead";
//                 this.dead = true;
//             } else {
//        //         this.state = "hurt";
//                 this.stateTimer = 0;
//             }
//         } else {
//             this.game.entitymanager.gethurt()
//         }
//     }

//     draw(ctx) {
//         if (!this.imgLoaded || this.dead) return;  // 确保图片加载完成
//         ctx.drawImage(
//             this.img,
//             this.rect.position.x,
//             this.rect.position.y,
//             this.rect.size.x,
//             this.rect.size.y
//         );

//         // 绘制血条
//         this.hp.draw2(
//             ctx,
//             this.rect.position.x + this.rect.size.x / 2,
//             this.rect.position.y - 20
//         );
//     }
// }

// class BossManager {
//     constructor(game) {
//         this.game = game;
//         this.bosses = [];
//     }

//     addBoss(x, y, width = 80, height = 80, maxHP = 10) {
//         this.bosses.push(new DiveBoss(this.game, x, y, width, height, maxHP));
//     }

//     async loadBoss(jsonPath) {
//         const data = await this.game.datamanager.loadJSON(jsonPath);
//         console.warn('loadboss', data);
//         this.bosses = [];
//         if (data.boss && Array.isArray(data.boss)) {
//             for (let b of data.boss) {
//                 await this.addBoss(b.x, b.y, b.w, b.h, b.hp);
//             }
//         }
//         console.warn(this.bosses);
//     }

//     update(player, deltaTime) {
//         console.warn('update');
//         for (let boss of this.bosses) {
//             boss.update(player, deltaTime);
//         }
//         this.bosses = this.bosses.filter(b => !b.dead);
//     }

//     draw(ctx) {
//         for (let boss of this.bosses) {
//             boss.draw(ctx);
//         }
//     }
// }

class DiveBoss {
    constructor(game, x = 100, y = 100, width = 80, height = 80, maxHP = 10) {
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

        // 图片加载
        this.img = new Image();
        this.img.src = "../images/enemy-white.png";
        this.imgLoaded = false;
        this.img.onload = () => {
            this.imgLoaded = true;
        };
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
            this.speed = 13+ Math.random() * 8; // 13-21
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
            this.hp.decrease();
            entitymanager.vy = -10;
            if (this.hp.isDead()) {
                this.dead = true;
            } else {
                this.stateTimer = 0;
            }
        } else {
            this.game.entitymanager.gethurt()
        }
    }

    draw(ctx) {
        if (!this.imgLoaded || this.dead) return;  // 确保图片加载完成
        ctx.drawImage(
            this.img,
            this.rect.position.x,
            this.rect.position.y,
            this.rect.size.x,
            this.rect.size.y
        );

        // 绘制血条
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
                await this.addBoss(b.x, b.y, b.w, b.h, b.hp);
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
