class entitymanager {
    static vx = 0;
    static vy = 0;
    static jump = -12;
    static yingjump = -5;
    static gravity = 0.5;
    static maxSpeed = 5;
    static friction = 0.85;
    static a = 0.8;
    static yinga = 1.5;
    static yingmaxSpeed = 12;
    static fw = 1;
    static bg;
    static lt;
    static re;
    static safeUntil = 0;

    static onground = false;

    constructor(game) {
        this.game = game;
        this.entities = [];
        this.keys = { left: false, right: false, up: false, change : false };
//        this.bg = null;
        this.lt = 'stand';
        this.re = this.rre = 0;
        this.init();
        this.safeUntil = 0;
    }

        async init() {
            this.bg = await this.game.datamanager.loadImg('../images/point.png');
            this.deadImg = await this.game.datamanager.loadImg('../images/die.png');
  //          bg = await this.game.datamanager.loadImg('../images/point.png');
        }
    // 更新逻辑优化
    async update() {
        this.keys = { left: false, right: false, up: false, change : false , envchange:false};
        
        if (this.game.inputmanager.askA() == true) this.keys.left = true;
        if (this.game.inputmanager.askD() == true) this.keys.right = true;
        if (this.game.inputmanager.askW() == true) this.keys.up = true;
        if (this.game.inputmanager.askJ() == true) this.keys.change = true;
        if (this.game.inputmanager.askK() == true) this.keys.envchange = true;
        let machine = this.game.animationmachine;

    //    console.log(this.keys);

        if (this.game.status !== 'running') return;
        if (this.game.canmove == false) return;
        const ky = this.keys;
        const ga = this.game;
        if (ky.change && this.game.gameFrame - this.re >= 200) {
            ga.yingyang = !ga.yingyang;
            this.re = this.game.gameFrame;
        }

        if (ky.envchange && this.game.gameFrame - this.rre >= 200) {
            ga.env = (ga.env === "yin") ? "yang" : "yin";
            this.rre = this.game.gameFrame;
        }
  //      console.log(this.game.gameFrame, this.re);
        // 用静态变量访问速度等
        let vx = entitymanager.vx;
        let vy = entitymanager.vy;
        const gravity = entitymanager.gravity;
        const maxSpeed = this.game.yingyang ? entitymanager.maxSpeed : entitymanager.yingmaxSpeed;
        const friction = entitymanager.friction;
        const a = this.game.yingyang ? entitymanager.a : entitymanager.yinga;
        let fw = entitymanager.fw;
        const jp = this.game.yingyang ? entitymanager.jump : entitymanager.yingjump;
        let og = entitymanager.onground;

        // 水平移动
        if (ky.left) {
            vx -= a;
            fw = -1;
        }
        if (ky.right) {
            vx += a;
            fw = 1;
        }

        // 松开按键减速
        if (!ky.left && !ky.right) {
            vx *= friction;
            if (Math.abs(vx) < 0.1) vx = 0;
        }

        // 限制最大速度
        if (vx > maxSpeed) vx = maxSpeed;
        if (vx < -maxSpeed) vx = -maxSpeed;

        ga.player.position.x += vx;

        vy += gravity;
        // 垂直移动
        if (ky.up && og)
        {
            vy += jp;
            og = false;
        }
        ga.player.position.y += vy;

        if (this.keys.up && entitymanager.onground == false) {
            machine.current = 'jump';
        }
        else if (this.keys.left || this.keys.right) {
            machine.current = 'run';
        }
        else {
            machine.current = 'stand';
        }
   //     console.log(og, ky.up, vy);
     //   console.log(ga.player.position.y, ga.player.position.y);

        // 平台移动 & 碰撞逻辑
        for (let p of ga.mapmanager.collidable[this.game.env]) {
            if (ga.player.containsRect(p)) {
                const prevX = ga.player.position.x - vx;
                const prevY = ga.player.position.y - vy;

                // 上方碰撞
                if (prevY + ga.player.size.y <= p.y) {
                    ga.player.position.y = p.y - ga.player.size.y;
                    vy = 0;
                    og = true;
                }
                // 下方碰撞
                else if (prevY >= p.y + p.h) {
                    ga.player.position.y = p.y + p.h;
                    vy = 0;
                }
                // 左侧碰撞
                else if (prevX + ga.player.size.x <= p.x) {
                    ga.player.position.x = p.x - ga.player.size.x;
                    vx = 0;
                }
                // 右侧碰撞
                else if (prevX >= p.x + p.w) {
                    ga.player.position.x = p.x + p.w;
                    vx = 0;
                }
            }
        }

        // 边界限制
        if (ga.player.position.x < 0) ga.player.position.x = 0;
        if (ga.player.position.x + ga.player.size.x > ga.width)
            ga.player.position.x = ga.width - ga.player.size.x;
        if (ga.player.position.y + ga.player.size.y > ga.height) {
            ga.player.position.y = ga.height - ga.player.size.y;
            vy = 0;
            og = true;
        }

        // 更新静态速度
        entitymanager.vx = vx;
        entitymanager.vy = vy;
        entitymanager.fw = fw;
        entitymanager.onground = og;
    }

    async chcevent() {
     //   console.log(this.game.player.position.x, this.game.player.position.y);
//     console.log(this.game.mapmanager.events);
        for (let e of this.game.mapmanager.events[this.game.env]) {
            if (e.way == 'tunnal') console.log('check', e);
            if (this.game.player.containsRect(e)) {
                if (e.event.way == "tunnal") {
                    console.log('tunnal事件触发', e.event);
                    this.game.eventmanager.add(e.event);
                }   
                else{
                    const press = this.game.inputmanager.takeEnter();
                    if (press) {
                        console.log('消极事件触发', e.event);
                        this.game.eventmanager.add(e.event);
                    }
                }   
            }
        }
    }

    checkCollision() {
    const player = this.game.player;
    const playerPrevX = player.position.x - entitymanager.vx;
    const playerPrevY = player.position.y - entitymanager.vy;
    const playerBottom = player.position.y + player.size.y;
    const playerRight = player.position.x + player.size.x;

    const now = Date.now();

    for (let enemy of this.game.enemymanager.enemies) {
        const rect = enemy.rect;
        const enemyBottom = rect.position.y + rect.size.y;
        const enemyRight = rect.position.x + rect.size.x;

        const overlapX = player.position.x < enemyRight && playerRight > rect.position.x;
        const overlapY = player.position.y < enemyBottom && playerBottom > rect.position.y;

        if (!overlapX || !overlapY) continue;

        const fromTop = playerPrevY + player.size.y <= rect.position.y;
        const fromBottom = playerPrevY >= enemyBottom;
        const isHead = fromTop && (playerBottom >= rect.position.y && playerBottom <= rect.position.y + 10);

        if (this.game.yingyang !== enemy.type && isHead) {
            // 阴阳不同踩头 → 敌人死亡
            enemy.dead = true;
            entitymanager.vy = -10;
        } else {
            // 扣血条件：阴阳相同 或 阴阳不同非踩头
            if (now >= entitymanager.safeUntil) {
                if (this.game.hp) this.game.hp.decrease();
                entitymanager.safeUntil = now + 3000; // 3秒无敌
            }

            // 竖直碰撞修正
            if (fromTop) { player.position.y = rect.position.y - player.size.y; entitymanager.vy = 0; }
            else if (fromBottom) { player.position.y = enemyBottom; entitymanager.vy = 0; }

            // 水平碰撞修正
            if (playerPrevX + player.size.x <= rect.position.x) { // 从左撞
                player.position.x = rect.position.x - player.size.x;
                entitymanager.vx = 0;
            } else if (playerPrevX >= enemyRight) { // 从右撞
                player.position.x = enemyRight;
                entitymanager.vx = 0;
            }
        }
    }
}



    async drawPlayer() {
        
        let machine=this.game.animationmachine;
        if (this.keys.up && entitymanager.onground == false) {
            machine.current = 'jump';
        }
        else if (this.keys.left || this.keys.right) {
            machine.current = 'run';
        }
        else {
            machine.current = 'stand';
        }
        if (machine.current != this.lt) {
            machine.currentFrame = 0;
        }

		if(machine.timer>10){
			let animation;
            if (this.game.yingyang) animation=machine.spritesheet1.animation[machine.current];
			else animation=machine.spritesheet0.animation[machine.current];
            //当前动画播放结束时，判断应该循环播放还是切换动画
			machine.currentFrame++;
            if(machine.currentFrame>=animation.length){
                machine.currentFrame=0;
            }
            machine.timer -= 10;
		}
		++machine.timer;
        this.lt = machine.current;
        let now = Date.now();
        console.log(now, entitymanager.safeUntil);
        if (now > entitymanager.safeUntil) machine.draw(this.game.player.position, entitymanager.fw == -1, this.game.yingyang);
        else if (this.game.gameFrame % 2 == 1) machine.draw(this.game.player.position, entitymanager.fw == -1, this.game.yingyang);
    
    //    machine.draw(this.game.player.position, entitymanager.fw == -1, this.game.yingyang);
        //	console.log(bg);
        let fl = false;
        for (let e of this.game.mapmanager.events[this.game.env]) {
      //      console.log(e);
            if (this.game.player.containsRect(e) && e.event.way == "negative") {
                fl = true;
            }
        }
        if (fl) {
            this.game.ctx.drawImage(this.bg,
        this.game.player.position.x + this.game.player.size.x, // 右上角
        this.game.player.position.y - 10,                     // 悬浮在头顶
        32, 32
    );
}

    }

    async drawDeadPlayer() {
    if (!this.deadImg) {
        console.error('死亡插图未加载');
        return;
    }

    // 绘制逻辑保持不变，使用this.deadImg
    const playerPos = this.game.player.position;
    const playerSize = this.game.player.size;

    this.game.ctx.drawImage(
        this.deadImg,
        playerPos.x - (this.deadImg.width - playerSize.x) / 2,
        playerPos.y - (this.deadImg.height - playerSize.y) / 2,
        this.deadImg.width,
        this.deadImg.height
        );
    }
}