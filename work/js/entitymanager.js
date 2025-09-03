class entitymanager {
    static vx = 0;
    static vy = 0;
    static vxx = 0;
    static vyy = 0;
    static jump = -12;
    static yingjump = -5;
    static gravity = 0.5;
    static maxSpeed = 5;
    static maxspeedy = -15;
    static friction = 0.75;
    static a = 0.8;
    static yinga = 1.5;
    static yingmaxSpeed = 12;
    static fw = 1;
    static bg;
    static lt;
    static re;
    static safeUntil = 0;
    static isjp;
    static lstjp;
    static soundspeed = [3, 1.5];

    static onground = false;
    static lstrun = 0;

    constructor(game) {
        this.game = game;
        this.entities = [];
        this.keys = { left: false, right: false, up: false, change: false };
        //        this.bg = null;
        this.lt = "stand";
        this.re = this.rre = 0;
        this.init();
        this.safeUntil = 0;
    }

    async init() {
        this.bg = await this.game.datamanager.loadImg("../images/point.png");
        this.deadImg = await this.game.datamanager.loadImg("../images/die.png");
        //    bg = await this.game.datamanager.loadImg('../images/point.png');
    }

    static pre = "stand"; // 面向方向，1为右，-1为左
    async makesound() {
        //        console.warn(this.game.canmove);
        if (!this.game.canmove) {
            this.game.soundmanager.fadeLoop("run", 0.1);
            return;
        }
        //      console.log(entitymanager.onground);
        let ky = this.keys,
            ps = entitymanager.pre;
        if (this.game.status !== "running") return;
        if (this.game.canmove == false) return;
        if (ky.up && entitymanager.onground) {
            ps = "startjump";
        } else if ((ky.left || ky.right) && entitymanager.onground) {
            ps = "run";
            entitymanager.lstrun = this.game.gameFrame;
        } else if (entitymanager.onground) {
            ps = "stand";
        } else if (!entitymanager.onground) {
            ps = "onjump";
        }

        


        if (ps == "run") {
            //          console.log('run sound', this.game.soundmanager.isPlay('run'));
            if (entitymanager.pre == "onjump") {
                //            this.game.soundmanager.playOnce('land', 1, 1);
            }
            if (this.game.soundmanager.isPlay("run") == false) {
                console.log("play run");
                this.game.soundmanager.playLoop(
                    "run",
                    1,
                    entitymanager.soundspeed[this.game.yingyang ? 1 : 0]
                );
            }
        } else if (ps == "startjump") {
            console.log("startjump");
            this.game.soundmanager.playOnce("jump", 1, 1); // 停下或跳跃时淡出音效
            if (this.game.gameFrame - entitymanager.lstrun >= 10)
                this.game.soundmanager.fadeLoop("run", 0.1);
        } else if (ps == "stand") {
            if (entitymanager.pre == "onjump") {
                //          this.game.soundmanager.playOnce('land', 1, 1);
            }
            if (this.game.gameFrame - entitymanager.lstrun >= 10)
                this.game.soundmanager.fadeLoop("run", 0.1);
        } else if (ps == "onjump") {
            if (this.game.gameFrame - entitymanager.lstrun >= 10)
                this.game.soundmanager.fadeLoop("run", 0.1);
        }
        entitymanager.pre = ps;
    }

    gethurt(x = 1) {
        let now = Date.now();
        if (now >= entitymanager.safeUntil) {
            if (this.game.hp) this.game.hp.decrease(x);
                entitymanager.safeUntil = now + 3000; // 3秒无敌
        }
    }

    // 更新逻辑优化
    async update() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            change: false,
            envchange: false,
        };

        if (this.game.canmove == true) {
            if (this.game.inputmanager.askA() == true) this.keys.left = true;
            if (this.game.inputmanager.askD() == true) this.keys.right = true;
            if (this.game.inputmanager.askW() == true) this.keys.up = true;
            if (this.game.inputmanager.askJ() == true) this.keys.change = true;
            //if (this.game.inputmanager.askK() == true)
                //this.keys.envchange = true;
        }
        let machine = this.game.animationmachine;

        await this.makesound();

        //    console.log(this.keys);

        if (this.game.status !== "running") return;
        const ky = this.keys;
        const ga = this.game;
        if (ky.change && this.game.gameFrame - this.re >= 200) {
            ga.yingyang = !ga.yingyang;
            this.re = this.game.gameFrame;
            if (this.game.achievements)
                this.game.achievements.unlock("first_toggle");
            this.game.taijimanager.trigger(); // 触发太极动画切换效果
            this.game.soundmanager.playOnce("change", 1, 1); //触发太极音效
        }

        if (ky.envchange && this.game.gameFrame - this.rre >= 200) {
            ga.env = ga.env === "yin" ? "yang" : "yin";
            this.rre = this.game.gameFrame;
            ++this.game.changetimes;
            this.game.mapmanager.sethurt();
        }
        //      console.log(this.game.gameFrame, this.re);
        // 用静态变量访问速度等
        let vx = entitymanager.vx;
        let vy = entitymanager.vy;
        const gravity = entitymanager.gravity;
        const maxSpeed = this.game.yingyang
            ? entitymanager.maxSpeed
            : entitymanager.yingmaxSpeed;
        const friction = entitymanager.friction;
        const a = this.game.yingyang ? entitymanager.a : entitymanager.yinga;
        let fw = entitymanager.fw;
        const jp = this.game.yingyang
            ? entitymanager.jump
            : entitymanager.yingjump;
        let og = entitymanager.onground;
        let isjp = entitymanager.isjp;
        let lstjp = entitymanager.lstjp;
        let vxx = entitymanager.vxx;
        let vyy = entitymanager.vyy;
        entitymanager.vxx = 0;
        entitymanager.vyy = 0;
        let fl = false;
        for (let p of ga.mapmanager.collidable[this.game.env])
            if (p instanceof Movetile) {
                p.update(this.game)
            }
        for (let p of ga.mapmanager.tram) {
            let prevX = ga.player.position.x - vx - vxx;
            let prevY = ga.player.position.y - vy - vyy;
            if (ga.player.containsRect(p) && this.game.env != (this.game.yingyang ? 'yang' : 'yin')) {
                p.update(prevX, prevY, vx, vy, ga);
                vx = entitymanager.vx;
                vy = entitymanager.vy;
                og = entitymanager.onground;
                isjp = entitymanager.isjp;
                lstjp = entitymanager.lstjp;
                fl = true;
                break;
            }
        }
        if (!fl) {
            for (let j = 0; j < ga.mapmanager.collidable[this.game.env].length; ++j) {
                let p =  ga.mapmanager.collidable[this.game.env][j];
                //            console.warn("check col", p);
                if (p.alive(this.game) == false) {
                    console.warn("pass it");
                    continue;
                }
                
                let prevX = ga.player.position.x - vx - vxx;
                let prevY = ga.player.position.y - vy - vyy;
                if (ga.player.containsRect(p)) {
   //                 console.warn("col!!!", ga.player.position.x + ga.player.size.x, prevX + ga.player.size.x, p.x);
                    if (ga.mapmanager.atk[ga.env][j] && !ga.mapmanager.loadingatk()) {
                        this.gethurt();
                    }
                    if (p instanceof Movetile) {
                        prevX += p.vx;
                        prevY += p.vy;
                    }                

                    // 上方碰撞
                    if (prevY + ga.player.size.y <= p.y) {
                        
            //            console.warn("up col!!!");
                        ga.player.position.y = p.y - ga.player.size.y;
                        vy = 0;
                        og = true;
                        isjp = false;
                        if (p instanceof Movetile) {
                            entitymanager.vxx = p.vx;
                            entitymanager.vyy = p.vy;
                        }
                    }
                    // 下方碰撞
                    else if (prevY >= p.y + p.h) {
                        
            //            console.warn("down col!!!");
                        ga.player.position.y = p.y + p.h;
                        vy = 0;
                    }
                    // 左侧碰撞
                    else if (prevX + ga.player.size.x <= p.x) {
                        ga.player.position.x = p.x - ga.player.size.x - 0.5;
                        vx = 0;
            //            console.warn("left col!!!");
                        if (p instanceof Movetile) {
                            entitymanager.vxx = p.vx;
                        }
                    }
                    // 右侧碰撞
                    else if (prevX >= p.x + p.w) {
            //            console.warn("right col!!!");
                        ga.player.position.x = p.x + p.w + 0.5;
                        vx = 0;
                        if (p instanceof Movetile) {
                            entitymanager.vxx = p.vx;
                        }
                    }
                    if (p instanceof Fratile)
                    {
                        console.warn('get', p);
                        p.update(this.game);
                    }
                }
            }
        }

        if (this.game.cg == false) this.drawPlayer();

        ga.player.position.x += vx + vxx;

        if (vy != 0) og = false;
        else lstjp = ga.gameFrame;

        // 垂直移动
        if (ky.up && (og || (!isjp && ga.gameFrame - lstjp <= 10))) {
            if (vy >= 0) vy -= gravity * (ga.gameFrame - lstjp); // 控制跳跃高度
            if (og) vy += jp;
            else
                vy = - Math.sqrt(jp * jp + vy * vy);
            og = false;
            isjp = true;
    //        if (vy < entitymanager.maxspeedy) vy = entitymanager.maxspeedy;
        }

        vy += gravity;
        ga.player.position.y += vy + vyy;

        // 水平移动
        if (ky.left) {
            if (vx < 0) vx -= a;
            else vx -= a * 1.3;
            fw = -1;
        }
        if (ky.right) {
            if (vx > 0) vx += a;
            else vx += a * 1.3;
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

        if (this.keys.up && entitymanager.onground == false) {
            machine.current = "jump";
        } else if (this.keys.left || this.keys.right) {
            machine.current = "run";
        } else {
            machine.current = "stand";
        }
        //     console.log(og, ky.up, vy);
        //   console.log(ga.player.position.y, ga.player.position.y);

        // 平台移动 & 碰撞逻辑
        

        // 边界限制
        if (ga.player.position.x < 0) ga.player.position.x = 0;
        if (ga.player.position.x + ga.player.size.x > ga.width)
            ga.player.position.x = ga.width - ga.player.size.x;
        if (ga.player.position.y + ga.player.size.y > ga.height) {
            ga.player.position.y = ga.height - ga.player.size.y;
            vy = 0;
            og = true;
            isjp = false;
        }

        // 更新静态速度
        entitymanager.vx = vx;
        entitymanager.vy = vy;
        entitymanager.fw = fw;
        entitymanager.onground = og;
        entitymanager.isjp = isjp;
        entitymanager.lstjp = lstjp;
    }

    async chcevent() {
        //   console.log(this.game.player.position.x, this.game.player.position.y);
        //     console.log(this.game.mapmanager.events);
        for (let e of this.game.mapmanager.events[this.game.env]) {
            if (!e.alive(this.game)) continue;
            if (e.way == "tunnal") console.log("check", e);
            if (this.game.player.containsRect(e)) {
                if (e.event.way == "tunnal") {
                    console.log("tunnal事件触发", e.event);
                    this.game.eventmanager.add(e.event);
                } else {
                    const press = this.game.inputmanager.takeEnter();
                    if (press) {
                        console.log("消极事件触发", e.event);
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

            const overlapX =
                player.position.x < enemyRight && playerRight > rect.position.x;
            const overlapY =
                player.position.y < enemyBottom &&
                playerBottom > rect.position.y;

            if (!overlapX || !overlapY) continue;

            const fromTop = playerPrevY + player.size.y <= rect.position.y;
            const isHead =
                fromTop &&
                playerBottom >= rect.position.y &&
                playerBottom <= rect.position.y + 10;

            if (this.game.yingyang !== enemy.type && isHead) {
                // 阴阳不同踩头 → 敌人死亡
                enemy.dead = true;
                if (this.game.boss) {
                    this.game.boss.gethurt(3);
                    this.game.boss.HP.update();
                }
                this.game.soundmanager.playOnce("enemydeath");
                entitymanager.vy = -10;
                if (this.game.achievements)
                    this.game.achievements.unlock("first_kill");
            } else {
                // 扣血条件：阴阳相同 或 阴阳不同非踩头
                this.gethurt();
            }
        }
    }

    async drawPlayer() {
        let machine = this.game.animationmachine;
        if (this.keys.up || entitymanager.onground == false) {
            machine.current = "jump";
        } else if (this.keys.left || this.keys.right) {
            machine.current = "run";
        } else {
            machine.current = "stand";
        }
        if (machine.current != this.lt) {
            machine.currentFrame = 0;
        }

        if (machine.timer > 10) {
            let animation;
            if (this.game.yingyang)
                animation = machine.spritesheet1.animation[machine.current];
            else animation = machine.spritesheet0.animation[machine.current];
            //当前动画播放结束时，判断应该循环播放还是切换动画
            machine.currentFrame++;
            if (machine.currentFrame >= animation.length) {
                machine.currentFrame = 0;
            }
            machine.timer -= 10;
        }
        ++machine.timer;
        this.lt = machine.current;
        let now = Date.now();
        //    console.log(now, entitymanager.safeUntil);
        if (now > entitymanager.safeUntil)
            machine.draw(
                this.game.player.position,
                entitymanager.fw == -1,
                this.game.yingyang
            );
        else if (this.game.gameFrame % 2 == 1)
            machine.draw(
                this.game.player.position,
                entitymanager.fw == -1,
                this.game.yingyang
            );

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
            this.game.ctx.drawImage(
                this.bg,
                this.game.player.position.x + this.game.player.size.x, // 右上角
                this.game.player.position.y - 10, // 悬浮在头顶
                32,
                32
            );
        }
    }

    async drawDeadPlayer() {
        if (!this.deadImg) {
            console.error("死亡插图未加载");
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
