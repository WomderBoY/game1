class game {

    constructor() {
        this.init();
    }


    static lst;
    static yingyang = true;
    async init() {
        this.player = new Rect(0, 0, 40, 40);
        this.gameFrame = 0;
        this.lst = 0;
        this.status = "running";
        this.canmove = true;
        this.createStage();

        this.datamanager = new datamanager(this);

        // 传递 datamanager 给 mapmanager
        this.mapmanager = new mapmanager(this);
        this.inputmanager = new inputmanager(this);
        this.hp = new hp(10, this);

        this.entitymanager = new entitymanager(this);
        this.eventmanager = new eventmanager(this);
        this.savemanager = new SaveManager(this);
        this.dialog = new dialog(this);
        this.enemymanager = new EnemyManager(this);
        let s1 = await this.datamanager.loadSpritesheet('ying-data.json');
        let s2 = await this.datamanager.loadSpritesheet('yang-right-0.json');
    //    console.log(s);
        this.animationmachine = new AnimationMachine(this, s1, s2);

        await this.mapmanager.loadMap("bg.json");
        await this.enemymanager.LoadEnemy("bg.json");
        this.mapmanager.draw();
        this.update();
        window.addEventListener('resize', () => this.autoScale(this.view));
    }

    createStage() {
        // 固定画布分辨率为 1280x720
        this.width = 1280;
        this.height = 720;

        // 创建 canvas 元素作为游戏视图
        this.view = document.createElement('canvas');
        this.view.width = this.width;
        this.view.height = this.height;

        // 设置画布的样式，使其居中显示
        this.view.style.position = "absolute";
        this.view.style.display = "block";
        this.view.style.margin = "auto";
        this.view.style.inset = 0;

        // 根据当前窗口大小进行缩放
        this.autoScale(this.view);

        // 获取画布的 2D 渲染上下文
        this.ctx = this.view.getContext('2d');

        // 将画布添加到页面中 id 为 game 的容器里
        const container = document.getElementById('game');
        if (container) {
            container.appendChild(this.view);
        } else {
            console.error("页面缺少 id 为 'game' 的容器");
        }
    }

    autoScale(view) {
        // 计算缩放比例，取窗口宽高比与画布宽高比的最小值
        let scale = Math.min(window.innerWidth / view.width, window.innerHeight / view.height);

        // 如果缩放比例接近 1（小于 0.5% 的差距），则直接保持原始大小
        if (Math.abs(scale - 1) < 0.005) scale = 1;

        // 设置缩放后的宽高
        view.style.width = view.width * scale + 'px';
        view.style.height = view.height * scale + 'px';
    }

    async update(delta) {
        const debug = true; // 调试开关
        if (debug) {
            const now = Date.now();
            if (this.lst == 0 || now - this.lst > 500) {
                 document.addEventListener('click', e => {
                    const x = e.clientX * 300 / 345;
                    const y = e.clientY * 450/ 500 * 450 / 445;
                    console.log(`点击坐标：x=${x}, y=${y}`);
                });
                this.lst = now;
            }
        }
//        console.log(this.player.position.x, this.player.position.y);
        // 每一帧都重新计算缩放，保证窗口大小改变时画布自适应
        this.autoScale(this.view);
        this.ctx.clearRect(0, 0, this.view.width, this.view.height);
    //    console.log(this.savemanager.data.player.x, this.savemanager.data.player.y);
        // 根据当前游戏状态进行不同处理
        await this.eventmanager.handle();
        switch (this.status) {
            case "running": // 游戏运行状态

                // 绘制地图（背景或场景元素）
                this.mapmanager.draw();
                await this.enemymanager.update();
                await this.entitymanager.update();
                await this.entitymanager.chcevent();
                this.entitymanager.drawPlayer();
                this.enemymanager.draw(this.ctx);
                // console.log('游戏运行中...');

                // 绘制血条，放在最后，保证在最上层
                this.hp.draw(this.ctx, this.width, this.height);
                break;
            case "over":
                console.log("游戏结束");
                if (this.inputmanager.takeEnter()) {
                    await this.savemanager.load();
                    this.hp = new hp(10, this);
                }
                //this.savemanager()
                //event
                //load...
        }

        console.log("hp = ", this.hp.currentHP);
        // 帧数加 1
        this.gameFrame++;

        // 16.6667ms 大约相当于每秒 60 帧（1000 / 60 ≈ 16.67）
        // setTimeout 循环调用 update 实现游戏循环
        setTimeout(this.update.bind(this), 16.6667);
    }
}
