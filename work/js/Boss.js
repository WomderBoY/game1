class Boss {
    constructor(game) {
        this.game = game;
        this.lstmove = -20000;
        this.HP = new hp(10, this.game);  // 添加game参数
        console.log('Boss HP系统初始化完成:', this.HP);
    }

    end() {
        this.game.startboss = false;
    }

    start() {
        this.game.startboss = true;
    }

    async change_hitbox(type, x) {
        console.warn('hitbox!!');
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
        if (now - this.lstmove <= 10000) return ;
        console.warn('boss move!!');
        let o = this.game.random(1, 3);
        if (o == 1) {
  //          await this.change_hitbox('yin', 1);
            await this.change_hitbox('yang', 1);
        }
        else if (o == 2) {
            await this.get_enemy(this.game.env, 1);
//            await this.get_enemy('yang', 1);
        }
        else if (o == 3) {
            await this.get_enemy2(1);
        }
        this.lstmove = now;
    }

    draw() {
//        console.warn('draw boss hp');
        this.HP.draw2(this.game.ctx, 1280 / 2, 720 - 30);
    }
}