class Boss {
    constructor(game) {
        this.game = game;
        this.lstmove = -20000;
        this.HP = new hp(10, this.game);  // 添加game参数
        console.log('Boss HP系统初始化完成:', this.HP);

        // 新增：状态管理
        this.state = "IDLE"; // 默认状态：闲置
        this.stateTimer = 0; // 状态计时器

        // 新增：位置与尺寸（可根据实际需求调整）
        this.x = 640; // 初始X坐标（示例：屏幕中心）
        this.y = 360; // 初始Y坐标
        this.width = 50; // 宽度
        this.height = 50; // 高度

        // 新增：加载不同状态的图片
        this.imageIdle = this.loadImage("../images/boss_idle.png"); // 闲置状态图片
        this.imageAttackHitbox = this.loadImage("../images/boss_enemy2.png"); // 攻击_hitbox状态图片
        this.imageAttackEnemy = this.loadImage("../images/boss_enemy2.png"); // 召唤敌人状态图片
        this.imageAttackEnemy2 = this.loadImage("../images/boss_enemy2.png"); // 召唤enemy2状态图片
    }

    // 新增：加载图片方法
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
        // 新增：设置攻击_hitbox状态
        this.state = "ATTACK_HITBOX";
        this.stateTimer = 0; // 重置状态计时器

        let len = this.game.mapmanager.collidable[type].length;
        this.game.mapmanager.cl_attack(type);
        for (let ti = 1; ti <= x; ++ti)
        {
            let y = this.game.random(0, len - 1);
            this.game.mapmanager.set_attack(type, y);
        }
    }

    async get_enemy(type, x) {
        console.warn('enemy!!');
        // 新增：设置召唤敌人状态
        this.state = "ATTACK_ENEMY";
        this.stateTimer = 0;

        let len = this.game.mapmanager.collidable[type].length;
        this.game.enemymanager.cl_enemy();
        for (let ti = 1; ti <= x; ++ti)
        {
            let y = this.game.random(0, len - 1);
            this.game.enemymanager.set_enemy(type, y);
        }
    }

    async get_enemy2(x) {
        console.warn('enemy2!!');
        // 新增：设置召唤enemy2状态
        this.state = "ATTACK_ENEMY2";
        this.stateTimer = 0;

        this.game.enemy2manager.cl_enemy();
        for (let i = 1; i <= x; ++i) {
            this.game.enemy2manager.set_enemy();
        }
    }

    gethurt(x = 10) {
        // 使用新的HP系统方法
        if (this.HP && typeof this.HP.decrease === 'function') {
            console.log(`Boss受到伤害: ${x}点`);
            this.HP.decrease(x, 640, 690);
        } else {
            console.error('Boss HP系统未正确初始化!');
        }
    }

    async move() {
        if (!this.game.canmove) return ;
        let now = Date.now();
        if (now - this.lstmove <= 10000) {
            // 新增：如果处于攻击状态且超时，恢复闲置状态
            this.stateTimer += now - this.lstmove;
            if (this.stateTimer > 2000) { // 攻击状态持续2秒后恢复闲置
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

    // 新增：根据状态更新逻辑（可选，用于状态过渡）
    update(deltaTime) {
        // 示例：攻击状态持续一段时间后自动恢复闲置
        if (this.state !== "IDLE") {
            this.stateTimer += deltaTime;
            if (this.stateTimer > 2000) { // 2000毫秒后恢复闲置
                this.state = "IDLE";
            }
        }
    }

    draw() {
        // 新增：根据状态绘制对应图片
        let img = null;
        switch (this.state) {
            case "IDLE":
                img = this.imageIdle.loaded ? this.imageIdle : null;
                break;
            case "ATTACK_HITBOX":
                img = this.imageAttackHitbox.loaded ? this.imageAttackHitbox : null;
                break;
            case "ATTACK_ENEMY":
                img = this.imageAttackEnemy.loaded ? this.imageAttackEnemy : null;
                break;
            case "ATTACK_ENEMY2":
                img = this.imageAttackEnemy2.loaded ? this.imageAttackEnemy2 : null;
                break;
            default:
                img = this.imageIdle.loaded ? this.imageIdle : null;
        }

        // 绘制Boss图片
        if (img) {
            this.game.ctx.drawImage(
                img,
                this.x - this.width / 2, // 居中绘制
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }

        // 保持原有的HP绘制
        this.HP.draw2(this.game.ctx, 1280 / 2, 720 - 30);
    }
}