class Enemy {
    constructor(x, y, width, height, speed = 2, type=true) {
        // 敌人矩形
        this.rect = new Rect(x, y, width, height);

        // 水平速度（左右移动）
        this.speed = speed;

        // 垂直速度（重力用）
        this.vy = 0;

        // 重力常量
        this.gravity = 0.5;

        // 是否在地面上
        this.onGround = false;

        //true为阴
        this.type = type;

        //是否死亡
        this.dead = false
    }

    update(colliders) {
        // === 水平方向运动 ===
        this.rect.position.x += this.speed;

        // 检测碰到墙壁
        for (let box of colliders) {
            if (this.rect.containsRect(box)) {
                // 碰墙则反向
                this.rect.position.x -= this.speed;
                this.speed *= -1;
                break;
            }
        }

        // === 垂直方向（重力）===
        this.vy += this.gravity;
        this.rect.position.y += this.vy;
        this.onGround = false;

        for (let box of colliders) {
            if (this.rect.containsRect(box)) {
                // 碰到地面
                this.rect.position.y -= this.vy; // 回退
                this.vy = 0; // 停止下落
                this.onGround = true;
                break;
            }
        }

        // === 悬空检测（边缘掉落转向）===
       if (this.onGround) {
            const direction = this.speed > 0 ? 1 : -1;
            // 探测前方脚底下的小矩形
            const frontFoot = new Rect(
                this.rect.position.x + (direction * this.rect.size.x * 0.5), // 稍微往前探
                this.rect.position.y + this.rect.size.y + 1, // 脚底下
                this.rect.size.x * 0.5, 2 // 探测宽度更宽
            );

            let groundFound = false;
            for (let box of colliders) {
                // 用 intersects 而不是 contains
                if (frontFoot.containsRect(box)) {
                    groundFound = true;
                    break;
                }
            }

            if (!groundFound) {
                this.speed *= -1;
            }
        }
    }

    

    /**
     * 绘制敌人
     */
    draw(ctx) {
        if(this.type){
            ctx.fillStyle = "red";
        }
        else{
            ctx.fillStyle = "blue";
        }
        ctx.fillRect(
            this.rect.position.x,
            this.rect.position.y,
            this.rect.size.x,
            this.rect.size.y
        );
    }
}

class EnemyManager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
    }

    /**
     * 添加敌人
     */

    empty() {
        this.enemies = [];
    }

    async LoadEnemy(src) {
        let data = await this.game.datamanager.loadJSON(src);

        this.empty();

        for (let i of data.enemy) {
            await this.addEnemy(i.x, i.y, i.w, i.h, i.speed);
        }
    }

    addEnemy(x, y, width, height, speed = 2) {
        this.enemies.push(new Enemy(x, y, width, height, speed));
    }

    /**
     * 更新所有敌人
     */
    update() {
        const colliders = this.game.mapmanager.getCollidable();
        for (let enemy of this.enemies) {
            enemy.update(colliders);
        }
        // 过滤掉死亡的敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          if (this.enemies[i].dead) {
               this.enemies.splice(i, 1); // 删除死亡敌人
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