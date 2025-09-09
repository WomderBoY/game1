class game {
    constructor() {
        // 不在这里调用init，让外部调用者控制初始化时机
    }

    random(l, r) {
        return Math.floor(Math.random() * (r - l + 1)) + l;
    }


    static lst;
    static yingyang = true;
    async init() {
        this.player = new Rect(0, 0, 30, 40); //初始化玩家
        this.env = "yang";
        this.gameFrame = 0;
        this.lst = 0;
        this.status = "running";
        this.prevStatus = null;
        this.canmove = true;
        this.createStage();
        this.env = "yang"; // 默认环境为阳
        this.changetimes = 0; // 切换环境次数
        this.yingyang = true;
        this.ending=true;//这是隐藏结局
        this.datamanager = new datamanager(this);

        // 添加太极管理器（新增代码）
        this.taijimanager = new TaijiManager(this);

        // 传递 datamanager 给 mapmanager
        this.mapmanager = new mapmanager(this);
        this.inputmanager = new inputmanager(this);
        this.hp = new hp(3, this);
        this.baguamanager = new BaguaManager(this);
        this.achievements = new AchievementsManager(this);
        this.cg = false;
        this.night = false;

        this.entitymanager = new entitymanager(this);
        this.eventmanager = new eventmanager(this);
        this.bossmanager = new BossManager(this);
        this.savemanager = new SaveManager(this);
        this.dialog = new dialog(this);
        this.enemymanager = new EnemyManager(this);
        this.enemy2manager = new Enemy2Manager(this)
        this.cgmanager = new CGManager(this);
        this.nightmanager = new NightManager(this);
        this.soundmanager = new SoundManager(this);
        this.expmanager = new Expmanager(this);

        // 感叹号提示系统
        this.exclamationPrompt = {
            show: false,
            x: 0,
            y: 0,
            timer: 0,
            maxTimer: 300, // 显示5秒（60fps）
            animationPhase: 0,
            image: null
        };
        //        this.expmanager.addexp(100, 100, 100, 100);
        //      this.expmanager.addexp(500, 500, 100, 100);

        await this.soundmanager.init();
        let s1 = await this.datamanager.loadSpritesheet("ying-data.json");
        let s2 = await this.datamanager.loadSpritesheet("yang-right-0.json");

        // 加载感叹号图片
        this.exclamationPrompt.image = await this.datamanager.loadImg("../images/point.png");
        //    console.log(s);
        this.animationmachine = new AnimationMachine(this, s1, s2);

        //      await this.mapmanager.loadMap("test_1.json");
        //    await this.enemymanager.LoadEnemy("test_1.json");
        //  await this.baguamanager.LoadBagua("test_1.json");
        // 检查是否有选择的关卡
        const username = localStorage.getItem("yyj_username");
        const selectedLevelKey = username ? `selectedLevel_${username}` : "selectedLevel";
        const selectedLevel = localStorage.getItem(selectedLevelKey);

        if (selectedLevel) {
            // 有选择的关卡，直接加载该关卡
            console.log("加载选择的关卡:", selectedLevel);

            // 确保选择的关卡被解锁
            this.unlockNextLevel(selectedLevel);

            await this.mapmanager.loadMap(selectedLevel);
            console.warn('game init over', this.canmove);
            await this.enemymanager.LoadEnemy(selectedLevel);
            await this.enemy2manager.LoadEnemy2(selectedLevel);
            await this.baguamanager.LoadBagua(selectedLevel);
            await this.bossmanager.loadBoss(selectedLevel);
            this.mapmanager.draw(this.env);

            // 如果是第四关，显示感叹号提示
            if (selectedLevel.includes("bg-map4.json")) {
                this.showExclamationPrompt(
                    this.player.position.x,
                    this.player.position.y
                );
            }
            // 加载 Boss

        }
        this.bgmmanager = new BGMManager(); // 创建游戏页面自己的 bgmmanager
        this.bgmmanager.loadVolumeSettings(); // 加载音量设置
        this.bgmmanager.add("../bgms/bg2.mp3"); // 游戏 BGM
        window.addEventListener(
            "click",
            () => {
                this.bgmmanager.play(0);
            },
            { once: true }
        );
        console.warn('game init over', this.canmove);
        this.update();
        //    window.addEventListener('resize', () => this.autoScale(this.view));
    }

    pauseGame() {
        if (this.status === "over" || this.status === "paused") return;
        this.prevStatus = this.status;
        this.status = "paused";
        this.canmove = false;
        const menu = document.getElementById("pauseMenu");
        if (menu) {
            menu.style.display = "flex";
        }
    }

    resumeGame() {
        if (this.status !== "paused") return;
        this.status = this.prevStatus || "running";
        this.canmove = true;
        const menu = document.getElementById("pauseMenu");
        if (menu) {
            menu.style.display = "none";
        }
    }

    restartLevel() {
        // 简单实现：刷新当前页面以重置关卡状态
        // 如需更细粒度控制，可在此重置管理器与实体状态
        const menu = document.getElementById("pauseMenu");
        if (menu) menu.style.display = "none";
        this.savemanager.load();
        this.canmove = true;
        this.bossmanager.resetAllBosses();
    }

    returnToMainMenu() {
        const menu = document.getElementById("pauseMenu");
        if (menu) menu.style.display = "none";
        // 返回主菜单：从 work/js/game.html 回到项目根目录 index.html#menu
        const maybe = "../../index.html#menu&fromGame=true";
        // 返回关卡选择页面
        try {
            window.location.href = "level-select.html";
        } catch (e) {
            // 兜底：如果无法跳转，恢复游戏避免卡住
            this.resumeGame();
        }
    }

    // 解锁关卡系统
    unlockNextLevel(currentLevel) {
        // 从关卡配置文件获取关卡顺序
        let levelOrder = [];
        
        // 尝试从localStorage获取关卡配置（如果关卡选择界面已经加载过）
        const levelsConfig = localStorage.getItem('levelsConfig');
        if (levelsConfig) {
            try {
                const config = JSON.parse(levelsConfig);
                levelOrder = config.levels.map(level => level.file);
            } 
            catch (e) {
                console.warn('解析关卡配置失败，使用默认顺序');
                levelOrder = [
                    "../map/test_1.json",
                    "../map/test_2.json",
                    "../map/bg-map1.json",
                    "../map/bg-map2.json",
                    "../map/bg-map3.json",
                    "../map/bg-map4.json",
                ];
            }
        } else {
            // 如果还没有配置，使用默认顺序
            levelOrder = [
                "../map/test_1.json",
                "../map/test_2.json",
                "../map/bg-map1.json",
                "../map/bg-map2.json",
                "../map/bg-map3.json",
                "../map/bg-map4.json",
            ];
        }
        const currentIndex = levelOrder.indexOf(currentLevel);

        console.log(`=== 关卡解锁调试 ===`);
        console.log(`当前关卡: ${currentLevel}`);
        console.log(`关卡索引: ${currentIndex}`);
        console.log(`关卡顺序:`, levelOrder);

        if (currentIndex >= 0) {
            // 解锁当前关卡和之前的所有关卡
            const username = localStorage.getItem("yyj_username");
            const unlockedLevelsKey = username ? `unlockedLevels_${username}` : "unlockedLevels";
            const unlockedLevels = JSON.parse(
                localStorage.getItem(unlockedLevelsKey) || "[]"
            );

            console.log(`解锁前的关卡列表:`, unlockedLevels);

            // 确保当前关卡和之前的所有关卡都被解锁
            for (let i = 0; i <= currentIndex; i++) {
                const levelToUnlock = levelOrder[i];
                if (!unlockedLevels.includes(levelToUnlock)) {
                    unlockedLevels.push(levelToUnlock);
                    console.log(`解锁关卡: ${levelToUnlock}`);
                }
            }

            // 如果当前关卡不是最后一关，也解锁下一关
            // if (currentIndex < levelOrder.length - 1) {
            //     const nextLevel = levelOrder[currentIndex + 1];
            //     if (!unlockedLevels.includes(nextLevel)) {
            //         unlockedLevels.push(nextLevel);
            //         console.log(`解锁下一个关卡: ${nextLevel}`);
            //     }
            // }

            console.log(`解锁后的关卡列表:`, unlockedLevels);

            localStorage.setItem(
                unlockedLevelsKey,
                JSON.stringify(unlockedLevels)
            );
        } else {
            console.warn(`关卡 ${currentLevel} 不在关卡顺序列表中！`);
        }
    }

    // 获取已解锁的关卡列表
    getUnlockedLevels() {
        const username = localStorage.getItem("yyj_username");
        const unlockedLevelsKey = username ? `unlockedLevels_${username}` : "unlockedLevels";
        const unlockedLevels = JSON.parse(
            localStorage.getItem(unlockedLevelsKey) || "[]"
        );
        // 确保默认关卡总是解锁的
        const defaultUnlockedLevels = ["../map/jiaoxue1.json"]; // 根据配置，默认解锁教学关卡1
        let hasNewUnlocks = false;
        defaultUnlockedLevels.forEach(level => {
            if (!unlockedLevels.includes(level)) {
                unlockedLevels.push(level);
                hasNewUnlocks = true;
            }
        });
        
        // 如果有新的解锁关卡，保存到localStorage
        if (hasNewUnlocks) {
            localStorage.setItem(
                unlockedLevelsKey,
                JSON.stringify(unlockedLevels)
            );
        }
        return unlockedLevels;
    }

    // 检查关卡是否已解锁
    isLevelUnlocked(levelFile) {
        const unlockedLevels = this.getUnlockedLevels();
        return unlockedLevels.includes(levelFile);
    }

    createStage() {
        // 固定画布分辨率为 1280x720
        this.width = 1280;
        this.height = 720;

        // 创建 canvas 元素作为游戏视图
        this.view = document.createElement("canvas");
        this.view.width = this.width;
        this.view.height = this.height;

        // 设置画布的样式，使其居中显示
        this.view.style.position = "absolute";
        this.view.style.display = "block";
        this.view.style.margin = "auto";
        this.view.style.inset = 0;
        this.view.style.boxSizing = "border-box";

        // 根据当前窗口大小进行缩放
        this.autoScale(this.view);

        // 设置窗口大小变化监听器
        this.setupResizeListener();

        // 获取画布的 2D 渲染上下文
        this.ctx = this.view.getContext("2d");

        // 将画布添加到页面中 id 为 game 的容器里
        const container = document.getElementById("game");
        if (container) {
            container.appendChild(this.view);
        } else {
            console.error("页面缺少 id 为 'game' 的容器");
        }

        // 锁定画布尺寸，防止意外变化
        this._lockCanvasSize();
    }

    _lockCanvasSize() {
        // 使用 ResizeObserver 监控画布尺寸变化
        if (window.ResizeObserver) {
            this._resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    const expectedWidth =
                        this.width *
                        (parseFloat(this.view.style.width) / this.width);
                    const expectedHeight =
                        this.height *
                        (parseFloat(this.view.style.height) / this.height);

                    // 如果尺寸变化超过容差范围，重新应用缩放
                    if (
                        Math.abs(width - expectedWidth) > 10 ||
                        Math.abs(height - expectedHeight) > 10
                    ) {
                        console.log("检测到画布尺寸异常变化，重新应用缩放");
                        this.autoScale(this.view);
                    }
                }
            });
            this._resizeObserver.observe(this.view);
        }
    }

    autoScale(view) {
        // 防止频繁调用
        if (this._lastScaleTime && Date.now() - this._lastScaleTime < 100) {
            return;
        }
        this._lastScaleTime = Date.now();

        // 计算缩放比例，取窗口宽高比与画布宽高比的最小值
        let scale = Math.min(
            window.innerWidth / view.width,
            window.innerHeight / view.height
        );

        // 如果缩放比例接近 1（小于 0.5% 的差距），则直接保持原始大小
        if (Math.abs(scale - 1) < 0.005) scale = 1;

        // 计算新的宽高
        const newWidth = view.width * scale;
        const newHeight = view.height * scale;

        // 只有当尺寸真正发生变化时才更新
        const currentWidth = parseFloat(view.style.width) || view.width;
        const currentHeight = parseFloat(view.style.height) || view.height;

        // 使用更大的容差范围，避免微小变化
        if (
            Math.abs(newWidth - currentWidth) > 5 ||
            Math.abs(newHeight - currentHeight) > 5
        ) {
            view.style.width = newWidth + "px";
            view.style.height = newHeight + "px";

            // 清除缓存，强制重新计算
            if (this.taijimanager) {
                this.taijimanager._canvasRect = null;
            }
        }
    }

    // 添加窗口大小变化监听器
    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener("resize", () => {
            // 使用防抖，避免频繁触发
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.autoScale(this.view);
            }, 100);
        });
    }

    // 显示感叹号提示
    showExclamationPrompt(x, y) {
        this.exclamationPrompt.show = true;
        this.exclamationPrompt.x = x;
        this.exclamationPrompt.y = y;
        this.exclamationPrompt.timer = 0;
        this.exclamationPrompt.animationPhase = 0;
    }

    // 隐藏感叹号提示
    hideExclamationPrompt() {
        this.exclamationPrompt.show = false;
    }

    // 更新感叹号提示动画
    updateExclamationPrompt() {
        if (!this.exclamationPrompt.show) return;

        this.exclamationPrompt.timer++;
        this.exclamationPrompt.animationPhase = Math.sin(this.exclamationPrompt.timer * 0.1) * 0.3 + 0.7;

        // 5秒后自动隐藏
        if (this.exclamationPrompt.timer >= this.exclamationPrompt.maxTimer) {
            this.hideExclamationPrompt();
        }
    }

    // 绘制感叹号提示
    drawExclamationPrompt() {
        if (!this.exclamationPrompt.show || !this.exclamationPrompt.image) return;

        const ctx = this.ctx;
        const x = this.exclamationPrompt.x;
        const y = this.exclamationPrompt.y;
        const phase = this.exclamationPrompt.animationPhase;

        // 保存当前状态
        ctx.save();

        // 绘制point.png图片，使用呼吸效果
        const size = 32 * phase; // 呼吸缩放效果
        ctx.drawImage(
            this.exclamationPrompt.image,
            x + this.player.size.x, // 右上角
            y - 10, // 悬浮在头顶
            size,
            size
        );

        // 恢复状态
        ctx.restore();
    }

    async update(delta) {
        const debug = true; // 调试开关
        if (debug && !this.debugListenerAdded) {
            this.debugListenerAdded = true;
            this.view.addEventListener("click", (e) => {
                const rect = this.view.getBoundingClientRect();
                const scaleX = this.view.width / rect.width;
                const scaleY = this.view.height / rect.height;
                const x = Math.round((e.clientX - rect.left) * scaleX);
                const y = Math.round((e.clientY - rect.top) * scaleY);
                console.log(`点击坐标：x=${x}, y=${y}`);

                // 在画布上显示坐标
                this.ctx.fillStyle = "white";
                this.ctx.font = "16px Arial";
                this.ctx.fillText(`(${x}, ${y})`, x + 10, y - 10);
            });
        }
        //        console.log('canmove = ', this.canmove);
        //        console.log(this.player.position.x, this.player.position.y);
        // 只在窗口大小变化时重新计算缩放，而不是每帧都计算
        this.ctx.clearRect(0, 0, this.view.width, this.view.height);
        //    console.log(this.savemanager.data.player.x, this.savemanager.data.player.y);
        // 根据当前游戏状态进行不同处理
        //      console.log(this.changetimes);
        //        console.log(this.status, this.canmove);
        if (this.hp.isDead() && this.status == 'running') {
            this.status = 'over';
            this.soundmanager.playOnce("death");
        }
        switch (this.status) {
            case "running": // 游戏运行状态
                //
                // 绘制地图（背景或场景元素）
                
                
                await this.enemymanager.update();
                await this.enemy2manager.update();
                //                await this.mapmanager.drawhp();
            //    this.mapmanager.draw(this.env);
                if (this.cg == false) {
                    if (this.night == false || (this.nightmanager && this.nightmanager.isActive && !this.nightmanager.isActive())) {
                        // 夜晚未启用覆盖层时，保持原有逻辑；否则由 DOM 覆盖层负责遮罩
                        this.mapmanager.draw(this.env);
                    } else {
                        // 覆盖层存在时，底下仍绘制地图，让聚光灯区域显示原画面
                        this.mapmanager.draw(this.env);
                    }
                }
                await this.entitymanager.checkCollision();
                await this.entitymanager.update();
                if (this.night == false) await this.mapmanager.draw(this.env);
                await this.mapmanager.drawPortals();
                await this.mapmanager.drawPeople();
                await this.baguamanager.draw(this.ctx);
                await this.baguamanager.update(this.player);
                if (this.canmove) {
                    this.expmanager.update(16);
                    this.expmanager.draw(this.ctx);
                }
                if (this.cg == false) {
                    this.enemymanager.draw(this.ctx);
                    this.enemy2manager.draw(this.ctx);
                }
                if (this.cg == false) this.enemymanager.draw(this.ctx);
                // 更新和绘制 Boss
                await this.bossmanager.update(this.player, 16.6667); // deltaTime 可按需调整
                if (this.cg == false) this.bossmanager.draw(this.ctx);
                // 更新Boss HP系统（如果存在）
                if (this.boss && this.boss.HP) {
                    this.boss.HP.update(16.6667);
                } else if (this.boss) {
                    console.log('⚠️ Boss存在但HP系统未初始化:', this.boss);
                } else {
      //              console.log('ℹ️ 当前关卡没有Boss');
                }

                this.hp.drawblood();
                if (this.boss) {
                    console.log('boss!!!');
                    this.boss.move();
                    this.boss.draw();
                }
                await this.entitymanager.chcevent();
                //                if (this.cg == false) this.entitymanager.drawPlayer();
                this.eventmanager.handle();
                // console.log('游戏运行中...');

                // 更新HP系统（包括动画和粒子）
                this.hp.update(16.6667);

                // 更新感叹号提示
                this.updateExclamationPrompt();

                // 绘制血条，放在最后，保证在最上层
                this.hp.draw(this.ctx, this.width, this.height);

                // 绘制感叹号提示（在血条之上）
                this.drawExclamationPrompt();
                break;
            case "paused":
                // 暂停时不更新游戏逻辑，仅保持最后一帧画面（可选显示遮罩由 DOM 负责）
                // 仍然绘制当前画面（如需要也可不绘制
                
                if (this.cg == false) {
                    if (this.night == false || (this.nightmanager && this.nightmanager.isActive && !this.nightmanager.isActive())) {
                        this.mapmanager.draw(this.env);
                    } else {
                        this.mapmanager.draw(this.env);
                    }
                }
                this.enemymanager.draw(this.ctx);
                this.enemy2manager.draw(this.ctx);
                this.baguamanager.draw(this.ctx);
                this.mapmanager.drawPortals();
                this.mapmanager.drawPeople();
                this.entitymanager.drawPlayer();
                this.hp.drawblood();
                if (this.canmove) {
                    this.expmanager.update(16);
                    this.expmanager.draw(this.ctx);
                }

                // 更新HP系统（暂停时也需要更新动画）
                this.hp.update(16.6667);

                this.hp.draw(this.ctx, this.width, this.height);

                // 绘制感叹号提示
                this.drawExclamationPrompt();
                break;
            case "over":
                console.log("游戏结束");
                if (this.cg == false) {
                    if (this.night == false) {
                        //                console.log('Night state before drawing:', this.night);  // 打印 night 状态
                        this.mapmanager.drawbg(this.env);
                    } else {
                        this.ctx.fillStyle = "#484848ff";
                        this.ctx.fillRect(0, 0, this.width, this.height);
                    }
                }
                // 绘制背景和场景
                if (this.cg == false) {
                    if (this.night == false || (this.nightmanager && this.nightmanager.isActive && !this.nightmanager.isActive())) {
                        this.mapmanager.draw(this.env);
                    } else {
                        this.mapmanager.draw(this.env);
                    }
                }
                if (this.canmove) {
                    this.expmanager.update(16);
                    this.expmanager.draw(this.ctx);
                }
                await this.enemy2manager.update();
                this.enemymanager.draw(this.ctx);
                this.enemy2manager.draw(this.ctx);
                this.hp.draw(this.ctx, this.width, this.height);
                await this.mapmanager.draw(this.env);

                // 绘制死亡状态的玩家（在地图和敌人之上）
                this.entitymanager.drawDeadPlayer();
                this.hp.drawblood();
                this.baguamanager.draw(this.ctx);
                this.mapmanager.drawPortals();
                this.mapmanager.drawPeople();
                this.hp.update(16.67);
                this.hp.draw(this.ctx, this.width, this.height);
                // 绘制游戏结束遮罩和文字（在最上层）
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                this.ctx.fillRect(0, 0, this.view.width, this.view.height);

                this.ctx.fillStyle = "white";
                this.ctx.font = "bold 60px Arial";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(
                    "游戏结束",
                    this.view.width / 2,
                    this.view.height / 2
                );
                this.ctx.font = "30px Arial";
                this.ctx.fillText(
                    "按 Enter 键重新开始",
                    this.view.width / 2,
                    this.view.height / 2 + 40
                );

                // 绘制感叹号提示
                this.drawExclamationPrompt();

                if (this.inputmanager.takeEnter()) {
                    await this.savemanager.load();
                    this.hp.reset();
                    this.bossmanager.resetAllBosses();
                    console.log('游戏重新开始，HP已重置');
                }
                break;
            //load...
        }

        // 帧数加 1
        this.gameFrame++;

        // 16.6667ms 大约相当于每秒 60 帧（1000 / 60 ≈ 16.67）
        // setTimeout 循环调用 update 实现游戏循环
        setTimeout(this.update.bind(this), 16.6667);
    }
}
