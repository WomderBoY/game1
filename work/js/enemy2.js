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

        (async () => {
            this.imgstatic = await this.game.datamanager.loadImg("../images/enemy21.png");
            this.imgmove = await this.game.datamanager.loadImg("../images/enemy22.png");
        })();
    }

    update(colliders) {
        const player = this.game.player;
        let gm=this.game;
        // === 攻击检测 ===
        if (!this.isAttacking && !this.dying) {
            let dx = player.position.x - this.rect.position.x;
            let dy = player.position.y - this.rect.position.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= this.attackRange) {
                // 锁定玩家位置
                this.isAttacking = true;
                const dist=Math.sqrt(dx*dx+dy*dy);
                this.lockedTarget = { x: dx / dist, y: dy / dist };
                const angleRad = Math.atan2(this.lockedTarget.y, this.lockedTarget.x);
                const canvas = document.createElement('canvas'); // 创建离屏Canvas
                const ctx = canvas.getContext('2d');

                const width = this.rect.size.x;
                const height = this.rect.size.y;

                // 计算旋转后Canvas的新尺寸，以容纳整个旋转后的图片
                // 这确保旋转后的图片不会被裁剪
                const sin = Math.abs(Math.sin(angleRad));
                const cos = Math.abs(Math.cos(angleRad));
                const newWidth = Math.floor(width * cos + height * sin);
                const newHeight = Math.floor(width * sin + height * cos);

                this.rect.size.x = newWidth;
                this.rect.size.y = newHeight;
                //this.rect.size.x / Math.sin(Math.PI / 4) * Math.sin(angleRad + Math.PI / 4);

                canvas.width = newWidth;
                canvas.height = newHeight;

                // 将Canvas原点移动到中心，进行旋转，再移回来
                // 这样图片会围绕自己的中心旋转
                ctx.translate(width / 2, height / 2);
                ctx.rotate(angleRad);
                ctx.drawImage(this.imgmove, -width / 2, -height / 2, width, height);

                // 获取旋转后的图片数据
                const rotatedImg = new Image();
                rotatedImg.src = canvas.toDataURL();
                this.imgmove = rotatedImg;
            }
        }

        if (this.isAttacking && this.lockedTarget) {
            // 沿锁定方向移动
            this.rect.position.x += this.lockedTarget.x * this.dashSpeed;
            this.rect.position.y += this.lockedTarget.y * this.dashSpeed;

            // 检测碰撞（简单边界示例）
            //const mapBounds = this.game.mapmanager.getMapBounds(); // 假设返回 {xMin, yMin, xMax, yMax}
            if (
                this.rect.position.x <= 0 || 
            this.rect.position.x + this.rect.size.x >= this.game.width ||
            this.rect.position.y <= 0 || 
            this.rect.position.y + this.rect.size.y >= this.game.height
            ) {
                // 到达边界，开始死亡流程
//                this.isAttacking = false;
                this.lockedDirection = null;
                this.dying = true;
                this.deathTimer = 30;
            }


            for (let box of colliders) {
                if (this.rect.containsRect(box)) {
                    // 到达边界，开始死亡流程
                    this.isAttacking = false;
                    this.lockedDirection = null;
                    this.dying = true;
                    this.deathTimer = 30;
                }
            }

            for (let enemy2 of this.game.enemy2manager.enemies) {
                const rect = enemy2.rect;

                if(gm.player.position.x >= rect.position.x &&
                    gm.player.position.x <= rect.position.x + rect.size.x &&
                    gm.player.position.y >= rect.position.y &&
                    gm.player.position.y <= rect.position.y + rect.size.y){
                        this.game.hp.decrease(10);
                }
            }
                
            
    /*
            // 如果有碰撞检测系统，也可以在这里判断 colliders
            for (let collider of colliders) {
                if (this.rect.intersects(collider)) { // 假设 Rect 有 intersects 方法
                    this.isAttacking = false;
                    this.lockedDirection = null;
                    this.dying = true;
                    this.deathTimer = 30;
                    break;
                }
            }*/
        }
    }

    draw(ctx) {
        if (this.dying) return ;
        const img = !this.isAttacking ? this.imgstatic : this.imgmove;
//        const w = !this.isAttacking ? this.rect.size.x : this.rect.size.y;
//        const h = !this.isAttacking ? this.rect.size.y : this.rect.size.x;
        if (!img) return;
        ctx.drawImage(
            img,
            this.rect.position.x,
            this.rect.position.y,
            this.rect.size.x,
            this.rect.size.y
        );
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
                await this.addEnemy2(i.x, i.y, i.w, i.h, i.speed, i.attackRange, i.dashSpeed);
            }
        }
    }

    /**
     * 手动添加一个 Enemy2
     */
    addEnemy2(x, y, width, height, speed = 2, attackRange = 150, dashSpeed = 6) {
        this.enemies.push(new Enemy2(this.game, x, y, width, height, speed, attackRange, dashSpeed));
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
