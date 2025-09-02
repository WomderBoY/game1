// class DiveBoss {
//     constructor(game, x = 100, y = 100, width = 80, height = 80, maxHP = 10) {
//         this.game = game;
//         this.rect = new Rect(x, y, width, height);

//         this.state = "LEFT_IDLE"; 
//         this.stateTimer = 0;

//         this.speed = 4;        // 冲击/水平移动速度
//         this.idleSpeed = 1.5;  // 巡逻时速度

//         this.vx = 0;
//         this.vy = 0;

//         this.hp = new hp(maxHP, game);
//         this.dead = false;

//         (async () => {
//             this.img = await this.game.datamanager.loadImg(
//                 "../images/enemy-white.png"
//             );
//         })();
//     }

//     update(player, deltaTime) {
//         if (this.dead) return;

//         // 根据状态移动
//         switch (this.state) {
//             case "LEFT_IDLE":
//                 this.patrol(-50, 200, -50, 300, deltaTime);
//                 this.stateTimer += deltaTime;
//                 if (this.stateTimer > 3000) this.changeState("CHARGE_TO_LEFT_PLATFORM");
//                 break;

//             case "CHARGE_TO_LEFT_PLATFORM":
//                 this.moveTo(300, 650, deltaTime);
//                 if (this.reached(300, 650)) this.changeState("MOVE_RIGHT");
//                 break;

//             case "MOVE_RIGHT":
//                 this.moveTo(980, 650, deltaTime);
//                 if (this.reached(980, 650)) this.changeState("RISE_TO_RIGHT_IDLE");
//                 break;

//             case "RISE_TO_RIGHT_IDLE":
//                 this.moveTo(1100, 200, deltaTime);
//                 if (this.rect.position.x >= 1050 && this.rect.position.y <= 300) 
//                     this.changeState("RIGHT_IDLE");
//                 break;

//             case "RIGHT_IDLE":
//                 this.patrol(1050, 1300, -50, 300, deltaTime);
//                 this.stateTimer += deltaTime;
//                 if (this.stateTimer > 3000) this.changeState("CHARGE_TO_RIGHT_PLATFORM");
//                 break;

//             case "CHARGE_TO_RIGHT_PLATFORM":
//                 this.moveTo(980, 650, deltaTime);
//                 if (this.reached(980, 650)) this.changeState("MOVE_LEFT");
//                 break;

//             case "MOVE_LEFT":
//                 this.moveTo(300, 650, deltaTime);
//                 if (this.reached(300, 650)) this.changeState("RISE_TO_LEFT_IDLE");
//                 break;

//             case "RISE_TO_LEFT_IDLE":
//                 this.moveTo(100, 200, deltaTime);
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

//     patrol(xMin, xMax, yMin, yMax, deltaTime) {
//         if (Math.random() < 0.02) {
//             this.vx = (Math.random() - 0.5) * this.idleSpeed * deltaTime / 16;
//             this.vy = (Math.random() - 0.5) * this.idleSpeed * deltaTime / 16;
//         }
//         // 限制在范围内
//         if (this.rect.position.x < xMin) this.vx = this.idleSpeed * deltaTime / 16;
//         if (this.rect.position.x > xMax) this.vx = -this.idleSpeed * deltaTime / 16;
//         if (this.rect.position.y < yMin) this.vy = this.idleSpeed * deltaTime / 16;
//         if (this.rect.position.y > yMax) this.vy = -this.idleSpeed * deltaTime / 16;
//     }

//     // moveTo(tx, ty, deltaTime) {
//     //     const dx = tx - this.rect.position.x;
//     //     const dy = ty - this.rect.position.y;
//     //     const dist = Math.sqrt(dx * dx + dy * dy);
//     //     if (dist === 0) {
//     //         this.vx = 0;
//     //         this.vy = 0;
//     //         return;
//     //     }

//     //     const moveDist = Math.min(this.speed * deltaTime / 16, dist);
//     //     this.vx = (dx / dist) * moveDist;
//     //     this.vy = (dy / dist) * moveDist;

//     //     // 防止越过目标点
//     //     if (Math.abs(dx) <= Math.abs(this.vx)) {
//     //         this.rect.position.x = tx;
//     //         this.vx = 0;
//     //     }
//     //     if (Math.abs(dy) <= Math.abs(this.vy)) {
//     //         this.rect.position.y = ty;
//     //         this.vy = 0;
//     //     }
//     // }
//     moveTo(tx, ty) {
//     const dx = tx - this.rect.position.x;
//     const dy = ty - this.rect.position.y;
//     const dist = Math.sqrt(dx * dx + dy * dy);

//     if (dist === 0) {
//         this.vx = 0;
//         this.vy = 0;
//         return;
//     }

//     this.vx = (dx / dist) * this.speed;
//     this.vy = (dy / dist) * this.speed;
// }

// // // update 更新位置
// // this.rect.position.x += this.vx * deltaTime / 16;
// // this.rect.position.y += this.vy * deltaTime / 16;


//     reached(tx, ty, tolerance = 5) {
//         return Math.abs(this.rect.position.x - tx) <= tolerance &&
//                Math.abs(this.rect.position.y - ty) <= tolerance;
//     }

//     handlePlayerCollision(player) {
//         const playerBottom = player.position.y + player.size.y;
//         const playerPrevY = player.position.y - (player.vy || 0);
//         const rect = this.rect;

//         const fromTop = playerPrevY + player.size.y <= rect.position.y;
//         const isHead = fromTop && playerBottom >= rect.position.y && playerBottom <= rect.position.y + 10;

//         const now = performance.now();

//         if (isHead) {
//             this.hp.decrease();
//             if (player.rebound) player.rebound();
//             if (this.hp.isDead()) {
//                 this.state = "dead";
//                 this.dead = true;
//             } else {
//                 this.state = "hurt";
//                 this.stateTimer = 0;
//             }
//         } else {
//             if (now >= (player.safeUntil || 0)) {
//                 if (this.game.hp) this.game.hp.decrease();
//                 player.safeUntil = now + 3000;
//             }
//         }
//     }

//     draw(ctx) {
//         if (!this.img || this.dead) return;
//         ctx.drawImage(
//             this.img,
//             this.rect.position.x,
//             this.rect.position.y,
//             this.rect.size.x,
//             this.rect.size.y
//         );

//         // Boss 血条在头顶
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

// class DiveBoss {
//     constructor(game, x = 100, y = 100, width = 80, height = 80, maxHP = 10) {
//         this.game = game;
//         this.rect = new Rect(x, y, width, height);

//         this.state = "LEFT_IDLE";
//         this.stateTimer = 0;

//         this.speed = 4;       // 冲击/水平移动速度
//         this.idleSpeed = 1.5; // 巡逻时速度

//         this.vx = 0;
//         this.vy = 0;

//         this.hp = new hp(maxHP, game);
//         this.dead = false;

//         // 加载图片
//         (async () => {
//             this.img = await this.game.datamanager.loadImg("../images/enemy-white.png");
//         })();
//     }

//     update(player, deltaTime) {
//         if (this.dead) return;

//         switch (this.state) {
//             case "LEFT_IDLE":
//                 this.patrol(-50, 200, -50, 300);
//                 this.stateTimer += deltaTime;
//                 if (this.stateTimer > 3000) this.changeState("CHARGE_TO_LEFT_PLATFORM");
//                 break;

//             case "CHARGE_TO_LEFT_PLATFORM":
//                 this.moveTo(300, 650);
//                 if (this.reached(300, 650)) this.changeState("MOVE_RIGHT");
//                 break;

//             case "MOVE_RIGHT":
//                 this.moveTo(980, 650);
//                 if (this.reached(980, 650)) this.changeState("RISE_TO_RIGHT_IDLE");
//                 break;

//             case "RISE_TO_RIGHT_IDLE":
//                 this.moveTo(1100, 200);
//                 if (this.rect.position.x >= 1050 && this.rect.position.y <= 300)
//                     this.changeState("RIGHT_IDLE");
//                 break;

//             case "RIGHT_IDLE":
//                 this.patrol(1050, 1300, -50, 300);
//                 this.stateTimer += deltaTime;
//                 if (this.stateTimer > 3000) this.changeState("CHARGE_TO_RIGHT_PLATFORM");
//                 break;

//             case "CHARGE_TO_RIGHT_PLATFORM":
//                 this.moveTo(980, 650);
//                 if (this.reached(980, 650)) this.changeState("MOVE_LEFT");
//                 break;

//             case "MOVE_LEFT":
//                 this.moveTo(300, 650);
//                 if (this.reached(300, 650)) this.changeState("RISE_TO_LEFT_IDLE");
//                 break;

//             case "RISE_TO_LEFT_IDLE":
//                 this.moveTo(100, 200);
//                 if (this.rect.position.x <= 200 && this.rect.position.y <= 300)
//                     this.changeState("LEFT_IDLE");
//                 break;
//         }

//         // 更新位置（乘 deltaTime 缩放）
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
//         // 随机轻微抖动
//         if (Math.random() < 0.02) {
//             this.vx = (Math.random() - 0.5) * this.idleSpeed;
//             this.vy = (Math.random() - 0.5) * this.idleSpeed;
//         }

//         // 限制范围
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

//         // 速度直接按单位方向
//         this.vx = (dx / dist) * this.speed;
//         this.vy = (dy / dist) * this.speed;

//         // 防止越过目标点
//         if (Math.abs(dx) <= Math.abs(this.vx)) {
//             this.rect.position.x = tx;
//             this.vx = 0;
//         }
//         if (Math.abs(dy) <= Math.abs(this.vy)) {
//             this.rect.position.y = ty;
//             this.vy = 0;
//         }
//     }

//     reached(tx, ty, tolerance = 5) {
//         return Math.abs(this.rect.position.x - tx) <= tolerance &&
//                Math.abs(this.rect.position.y - ty) <= tolerance;
//     }

//     handlePlayerCollision(player) {
//         const playerBottom = player.position.y + player.size.y;
//         const playerPrevY = player.position.y - (player.vy || 0);
//         const rect = this.rect;

//         const fromTop = playerPrevY + player.size.y <= rect.position.y;
//         const isHead = fromTop && playerBottom >= rect.position.y && playerBottom <= rect.position.y + 10;

//         const now = performance.now();

//         if (isHead) {
//             this.hp.decrease();
//             if (player.rebound) player.rebound();
//             if (this.hp.isDead()) {
//                 this.state = "dead";
//                 this.dead = true;
//             } else {
//                 this.state = "hurt";
//                 this.stateTimer = 0;
//             }
//         } else {
//             if (now >= (player.safeUntil || 0)) {
//                 if (this.game.hp) this.game.hp.decrease();
//                 player.safeUntil = now + 3000;
//             }
//         }
//     }

//     draw(ctx) {
//         if (!this.img || this.dead) return;
//         ctx.drawImage(
//             this.img,
//             this.rect.position.x,
//             this.rect.position.y,
//             this.rect.size.x,
//             this.rect.size.y
//         );

//         this.hp.draw2(
//             ctx,
//             this.rect.position.x + this.rect.size.x / 2,
//             this.rect.position.y - 20
//         );
//     }
// }
class DiveBoss {
    constructor(game, x = 100, y = 100, width = 80, height = 80, maxHP = 10) {
        this.game = game;
        this.rect = new Rect(x, y, width, height);

        this.state = "LEFT_IDLE";
        this.stateTimer = 0;

        this.speed = 4;       // 冲击/水平移动速度
        this.idleSpeed = 1.5; // 巡逻时速度

        this.vx = 0;
        this.vy = 0;

        this.hp = new hp(maxHP, game);
        this.dead = false;

        // 图片加载
        this.img = new Image();
        this.img.src = "../images/enemy-white.png";
        this.imgLoaded = false;

        // 图片加载完成标记
        this.img.onload = () => {
            this.imgLoaded = true;
        };
    }

    update(player, deltaTime) {
        if (this.dead) return;

        // 状态机逻辑（保持原有）
        switch (this.state) {
            case "LEFT_IDLE":
                this.patrol(0, 200, 0, 300);
                this.stateTimer += deltaTime;
                if (this.stateTimer > 3000) this.changeState("CHARGE_TO_LEFT_PLATFORM");
                break;
            case "CHARGE_TO_LEFT_PLATFORM":
                this.moveTo(300, 650);
                if (this.reached(300, 650)) this.changeState("MOVE_RIGHT");
                break;
            case "MOVE_RIGHT":
                this.moveTo(980, 650);
                if (this.reached(980, 650)) this.changeState("RISE_TO_RIGHT_IDLE");
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
                this.moveTo(980, 650);
                if (this.reached(980, 650)) this.changeState("MOVE_LEFT");
                break;
            case "MOVE_LEFT":
                this.moveTo(300, 650);
                if (this.reached(300, 650)) this.changeState("RISE_TO_LEFT_IDLE");
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
        const playerPrevY = player.position.y - (player.vy || 0);
        const rect = this.rect;

        const fromTop = playerPrevY + player.size.y <= rect.position.y;
        const isHead = fromTop && playerBottom >= rect.position.y && playerBottom <= rect.position.y + 10;

        const now = performance.now();

        if (isHead) {
            if (this.hp.isDead()) {
                this.state = "dead";
                this.dead = true;
            } else {
                this.state = "hurt";
                this.stateTimer = 0;
            }
        } else {
            if (now >= (player.safeUntil || 0)) {
                if (this.game.hp) this.game.hp.decrease();
                player.safeUntil = now + 3000;
            }
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
        console.warn('update');
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

