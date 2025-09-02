class Boss {
    constructor(game) {
        this.game = game;
        this.lstmove = -20000;
        this.HP = new hp(10);
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

    gethurt(x = 10) {
        this.HP.gethurt(x);
    }

    async move() {
        if (!this.game.canmove) return ;
        let now = Date.now();
        if (now - this.lstmove <= 10000) return ;
        console.warn('boss move!!');
        let o = this.game.random(1, 2);
        if (o == 1) {
            await this.change_hitbox('yin', 1);
            await this.change_hitbox('yang', 1);
        }
        else if (o == 2) {
            await this.get_enemy('yin', 1);
            await this.get_enemy('yang', 1);
        }
        this.lstmove = now;
    }

    draw() {
//        console.warn('draw boss hp');
        this.HP.draw2(this.game.ctx, 1280 / 2, 720 - 30);
    }
}