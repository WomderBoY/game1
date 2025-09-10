class Boss {
    constructor(game) {
        this.game = game;
        this.lstmove = -20000;
        this.HP = new hp(10, this.game); // 添加game参数
        this.rect = new Rect(615, 335, 50, 50);
        console.log('Boss HP系统初始化完成:', this.HP);

        this.state = "IDLE";
        this.stateTimer = 0;
        this.attackStateDuration = 5000; // 攻击状态持续时间延长至5秒（5000ms）

        this.x = 640;
        this.y = 360;
        this.width = 70;
        this.height = 70;

        this.imageIdle = this.loadImage("../images/boss_idle.png");
        this.imageAttackHitbox = this.loadImage("../images/boss_enemy2.png");
        this.imageAttackEnemy = this.loadImage("../images/boss_enemy2.png");
        this.imageAttackEnemy2 = this.loadImage("../images/boss_enemy2.png");

        // 新增：粒子系统相关
        this.particles = []; // 存储粒子的数组
    }

    loadImage(src) {
        const img = new Image();
        img.src = src;
        img.loaded = false;
        img.onload = () => { img.loaded = true; };
        return img;
    }

    end() {
        this.game.startboss = false;
    }

    start() {
        this.game.startboss = true;
    }

    async change_hitbox(type, x) {
        console.warn('hitbox!!');
        this.state = "ATTACK_HITBOX";
        this.stateTimer = 0;
        this.game.expmanager.conaddblk(this.x, this.y); // 触发粒子效果

        let len = this.game.mapmanager.collidable[type].length;
        this.game.mapmanager.cl_attack(type);
        for (let ti = 1; ti <= x; ++ti) {
            let y = this.game.random(0, len - 1);
            while (this.game.mapmanager.collidable[type][y] instanceof Movetile)
                y = this.game.random(0, len - 1);
            this.game.mapmanager.set_attack(type, y);
        }
    }

    async get_enemy(type, x) {
        console.warn('enemy!!');
        this.state = "ATTACK_ENEMY";
        this.stateTimer = 0;
        this.game.expmanager.conaddblk(this.x, this.y); // 触发粒子效果

        let len = this.game.mapmanager.collidable[type].length;
        this.game.enemymanager.cl_enemy();
        for (let ti = 1; ti <= x; ++ti) {
            let y = this.game.random(0, len - 1);
            while (this.game.mapmanager.collidable[type][y] instanceof Movetile)
                y = this.game.random(0, len - 1);
            this.game.enemymanager.set_enemy(type, y);
        }
    }

    async get_enemy2(x) {
        console.warn('enemy2!!');
        this.state = "ATTACK_ENEMY2";
        this.stateTimer = 0;
        this.game.expmanager.conaddblk(this.x, this.y); // 触发粒子效果

        this.game.enemy2manager.cl_enemy();
        for (let i = 1; i <= x; ++i) {
            this.game.enemy2manager.set_enemy();
        }
    }

    gethurt(x = 10) {
        // 使用新的HP系统方法
        if (this.HP && typeof this.HP.decrease === "function") {
            console.log(`Boss受到伤害: ${x}点`);
            this.HP.decrease(x, 640, 690);
        } else {
            console.error("Boss HP系统未正确初始化!");
        }

        if (this.HP.isDead()) {

            this.game.eventmanager.add({ 
                type: "changemap3", 
                endingTrueTarget: "../map/end_select1.json",
                endingFalseTarget: "../map/end_select2.json",
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
                }, true);
        }
    }

    async move() {
        if (!this.game.canmove) return;
        let now = Date.now();
        if (now - this.lstmove <= 10000) {
            this.stateTimer = now - this.lstmove;
            // 使用延长后的攻击状态持续时间
            if (this.stateTimer > this.attackStateDuration) {
                this.state = "IDLE";
            }
            return ;
        }
        console.warn('boss move!!');
        let o = this.game.random(1, 3);
        if (o == 1) {
            await this.change_hitbox('yang', 1);
        }
        else if (o == 2) {
            await this.get_enemy(this.game.env, 1);
        }
        else if (o == 3) {
            await this.get_enemy2(1);
        }
        this.lstmove = now;
    }

    update(deltaTime) {
        // 更新粒子状态
        this.particles = this.particles.filter(particle => {
            // 移动粒子
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            // 减少生命值
            particle.life--;
            // 轻微减速效果
            particle.speedX *= 0.98;
            particle.speedY *= 0.98;
            // 保留生命值>0的粒子
            return particle.life > 0;
        });

        // 更新攻击状态持续时间
        if (this.state !== "IDLE") {
            this.stateTimer += deltaTime;
            if (this.stateTimer > this.attackStateDuration) {
                this.state = "IDLE";
            }
        }
    }

    draw() {
        // 绘制粒子
        this.particles.forEach(particle => {
            // 计算透明度（随生命周期衰减）
            const alpha = particle.life / particle.maxLife;
            this.game.ctx.fillStyle = particle.color.replace('1)', `${alpha})`);
            this.game.ctx.beginPath();
            this.game.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.game.ctx.fill();
        });

        // 绘制Boss图片
        let img = null;
        switch (this.state) {
            case "IDLE":
                img = this.imageIdle.loaded ? this.imageIdle : null;
                break;
            case "ATTACK_HITBOX":
                img = this.imageAttackHitbox.loaded ? this.imageAttackHitbox : null;
//        console.warn(img);
                break;
            case "ATTACK_ENEMY":
                img = this.imageAttackEnemy.loaded ? this.imageAttackEnemy : null;
//       console.warn(img);
                break;
            case "ATTACK_ENEMY2":
                img = this.imageAttackEnemy2.loaded ? this.imageAttackEnemy2 : null;
 //       console.warn(img);
                break;
            default:
                img = this.imageIdle.loaded ? this.imageIdle : null;
        }
        if (img) {
            this.game.ctx.drawImage(
                img,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }

        // 绘制HP
        this.HP.draw2(this.game.ctx, 1280 / 2, 720 - 30);
    }
}
