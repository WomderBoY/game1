class Tile extends Rect {
    constructor(x, y, w, h, hp, img, event, tiling = false) {
        super(x, y, w, h);
        this.img = img;
        this.hp = hp;
        this.event = event;
        this.tiling = tiling;
        // 兼容直接访问
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    alive(game) {
        if (!this.hp) return true;
        //        console.warn('hp', this.hp, game.changetimes, game.mapmanager.hurt());
        if (
            Math.floor(game.changetimes / 2) == this.hp &&
            game.mapmanager.hurt()
        )
            return true;
        if (Math.floor(game.changetimes / 2) < this.hp) return true;
        //        console.warn('damaged!!!');
        return false;
    }
}

class mapmanager {
    static lstchange = -100;

    constructor(game) {
        this.game = game;
        this.empty();
        this.init();

        // 创建绘制管理器
        this.drawManager = new DrawManager(game);
    }

    async init() {
        this.portalImg = await this.game.datamanager.loadImg(
            "../images/portal.png"
        );
    }

    empty() {
        this.test = { yin: [], yang: [] };
        this.collidable = { yin: [], yang: [] };
        this.HP = { yin: [], yang: [] };
        this.events = { yin: [], yang: [] };
        this.app = { yin: [], yang: [] };
        this.room = "";
        this.background = { yin: [], yang: [] };
        this.atk = { yin: [], yang: [] };
        this.atkti = 0;
        this.tram = [];
    }

    cl_attack(type) {
        this.atk[type] = [];
        let len = this.collidable[type].length;
        for (let i = 0; i < len; ++i) this.atk[type].push(0);
    }

    set_attack(type, x) {
        console.warn('set attack', type, x);
        this.atkti = this.game.gameFrame;
        this.atk[type][x] = 1;
    }

    sethurt() {
        mapmanager.lstchange = this.game.gameFrame;
    }

    loadingatk() {
        return this.game.gameFrame - mapmanager.lstchange <= 100;
    }

    hurt() {
        return this.game.gameFrame - mapmanager.lstchange <= 80;
    }

    async loadMap(src) {
        this.game.canmove = false;
        console.log("开始加载地图:", src);

        // 如果是第一次加载地图，直接调用 loadNewMap
        if (this.room === "") {
            console.log("首次加载地图，跳过淡出效果");
            await this.loadNewMap(src);
            await this.resetcanmove();
            return;
        }

        this.game.env = "yang";
        this.game.changetimes = 0;

        // 设置初始透明度
        let opacity = 1;

        // 渐变淡出效果
        const fadeOut = () => {
            return new Promise((resolve) => {
                const animate = () => {
                    if (opacity > 0) {
                        opacity -= 0.05; // 逐渐减少透明度
                        this.game.ctx.globalAlpha = opacity;
                        this.game.ctx.clearRect(
                            0,
                            0,
                            this.game.view.width,
                            this.game.view.height
                        ); // 清除画布内容

                        // 绘制背景或其他需要保留的内容
                        this.drawBackground();
                        // 继续执行渐变
                        requestAnimationFrame(animate);
                    } else {
                        // 淡出完成后，调用 loadNewMap
                        console.log("淡出完成，开始加载新地图");
                        resolve();
                    }
                };
                animate(); // 启动动画
            });
        };

        // 等待 fadeOut 完成后再调用 loadNewMap
        await fadeOut();
        await this.loadNewMap(src);
        await this.resetcanmove();
    }

    async resetcanmove() {
        this.game.canmove = true;
        console.warn('mapmanager loadmap over', this.game.canmove);
    }

    // 加载新地图
    async loadNewMap(src) {
        console.log("=== loadNewMap 开始 ===");

        // 重置玩家状态、清空地图和事件
        entitymanager.vx = 0;
        entitymanager.vy = 0;
        this.game.hp.reset();
        this.empty();

        // 重置对话框样式，确保关卡切换后对话框显示正常
        if (this.game.dialog) {
            this.game.dialog.setDialogTheme("mysterious");
            this.game.dialog.setDialogBackground("../images/diagbg1.png");
            this.game.dialog.name.textContent = "旁白";
            this.game.dialog.avatar.textContent = "🔮";
            this.game.dialog.forceApplyStyles();
        }

        console.warn("LOAD NEW MAP", src);
        console.log("准备调用 datamanager.loadJSON...");

        // 加载地图数据
        let data;
        try {
            console.log("开始调用 datamanager.loadJSON...");
            data = await this.game.datamanager.loadJSON(src);
            console.log("datamanager.loadJSON 调用完成");
            console.warn("LOAD NEW MAP - 数据加载成功");
            console.warn("data 类型:", typeof data);
            console.warn("data 内容:", data);

            if (!data) {
                console.error("地图数据为空，无法加载地图:", src);
                return;
            }
        } catch (error) {
            console.error("加载地图数据失败:", error);
            console.error("地图文件:", src);
            console.error("错误堆栈:", error.stack);
            return;
        }

        // 如果地图数据中有出生点(born)，更新玩家位置
        if (data.born) {
            [this.game.player.position.x, this.game.player.position.y] =
                data.born;
            console.warn('loadmap born', this.game.player.position.x, this.game.player.position.y);
        }

        // 保存当前的地图状态
        await this.game.savemanager.save(src);
        if (data.Tram) {
            for (let i of data.Tram) {
                let [x, y, w, h] = i.hitbox;
                this.tram.push(new Trampoline(x, y, w, h));
            }
        }
        this.room = src;

        console.warn("loadmap", data);

        // 根据 data.with 字段处理特殊事件
        if (data.with) {
            console.log("发现 data.with:", data.with);
            if (Array.isArray(data.with)) {
                console.log("data.with 是数组，遍历播放");
                console.warn(data.with);
                // 如果是数组，遍历每个元素
                for (let j = 0; j < data.with.length; ++j) {
                    let i = data.with[j];
                    console.warn("addmap", j, i);
                    this.game.eventmanager.add(i, true);
                }
            } else if (typeof data.with === "object") {
                console.log("data.with 是对象，检查 event 字段");
                if (data.with.event) {
                    console.log("播放 data.with.event:", data.with.event);
                    if (this.game.cgmanager) {
                        this.game.cgmanager.play(data.with.event);
                    }
                } else {
                    console.log("直接播放 data.with:", data.with);
                    if (this.game.cgmanager) {
                        this.game.cgmanager.play(data.with);
                    }
                }
            } else {
                console.warn("data.with 既不是数组也不是对象:", data.with);
            }
        } else {
            console.log("没有 data.with 字段");
        }

        if (data.Boss) {
            console.warn("🎮 关卡包含Boss，正在创建...");
            this.game.boss = new Boss(this.game);
            console.log('✅ Boss创建完成:', this.game.boss);
            console.log('✅ Boss HP系统:', this.game.boss.HP);
        } else {
            console.log("ℹ️ 当前关卡不包含Boss");
            this.game.boss = null;
        }

        console.log("hahaha");
        // 加载 yin 和 yang 区域的瓦片
        for (let i of data.yin.tileMap) {
            await this.addTile("yin", i);
        }
        console.warn("jiazaiwancheng");
        for (let i of data.yang.tileMap) {
            await this.addTile("yang", i);
        }

        // 加载背景图
        if (data.yang.background) {
            console.log("加载 yang 背景图:", data.yang.background);
            try {
                let bg = await this.game.datamanager.loadImg(
                    data.yang.background
                );
                console.log("yang 背景图加载结果:", bg);
                this.background["yang"] = bg;
            } catch (error) {
                console.error("yang 背景图加载失败:", error);
                this.background["yang"] = ""; // 设置为空字符串，使用默认背景
            }
        }
        if (data.yin.background) {
            console.log("加载 yin 背景图:", data.yin.background);
            try {
                let bg = await this.game.datamanager.loadImg(
                    data.yin.background
                );
                console.log("yin 背景图加载结果:", bg);
                this.background["yin"] = bg;
            } catch (error) {
                console.error("yin 背景图加载失败:", error);
                this.background["yin"] = ""; // 设置为空字符串，使用默认背景
            }
        }
        console.log("events", this.collidable);

        // 加载完成后，执行淡入效果
        this.fadeIn();
        this.cl_attack('yin'), this.cl_attack('yang');
    }

    // 渐变淡入效果
    async fadeIn() {
        let opacity = 0;

        // 渐变淡入
        const animate = () => {
            if (opacity < 1) {
                opacity += 0.05; // 逐渐增加透明度
                this.game.ctx.globalAlpha = opacity;
                this.game.ctx.clearRect(
                    0,
                    0,
                    this.game.view.width,
                    this.game.view.height
                ); // 清除画布内容

                // 在这里可以绘制新场景的内容
                this.drawBackground(); // 假设你有一个方法来重新绘制背景

                // 继续执行渐变
                requestAnimationFrame(animate);
            } else {
                // 淡入完成后，可以触发其他操作
                console.warn("场景切换完成");
                this.game.ctx.globalAlpha = 1; // 确保透明度重置为1
            }
        };

        animate(); // 启动淡入效果
        console.warn('mapmanager fadein over', this.game.canmove);
    }

    loadingatk() {
        return this.game.gameFrame - this.atkti <= 300;
    }

    // 绘制背景方法
    drawBackground() {
        this.drawManager.drawBackground(this.background, this.game.view.width, this.game.view.height);
    }

    async addTile(type, i) {
        const [x, y, w, h] = i.hitbox;
        let img = [];
        if (i.img) {
            for (let path of i.img) {
                console.warn(path);
                let loadedImage = await this.game.datamanager.loadImg(path);
                if (loadedImage instanceof Image) {
                    img.push(loadedImage);
                } else {
                    console.error(`图片加载失败：${path}`);
                }
            }
        }
        let tile;
        if (i.fra) {
            console.warn("fra");
            tile = new Fratile(x, y, w, h, img, i.tiling); // 去掉 this.game
        } else if (i.move) {
            console.warn("move");
            const [xmn, xmx, ymn, ymx] = i.area;
            tile = new Movetile(
                x,
                y,
                w,
                h,
                img,
                xmn,
                xmx,
                ymn,
                ymx,
                i.vx,
                i.vy,
                i.tiling
            );
        } else {
            tile = new Tile(x, y, w, h, i.hp, img, i.event, i.tiling);
        }
        // 把 overlayImg 存进去
        //调试图片是否加载出来
        console.log("img paths:", i.img);
        console.log("overlayImg paths:", i.overlayImg);

        if (i.event && i.event.type === "kill") this.app[type].push(tile); //这是伤害的方块 不对这里
        if (i.col != false) {
            this.collidable[type].push(tile);
            if (i.hp) this.HP[type].push(new hp(i.hp));
            else this.HP[type].push(-1);
        }
        //if (i.app) this.app.push(tile);
        this.test[type].push(tile);
        if (i.event) {
            //		console.log(i.event);
            this.events[type].push(tile);
        }
    }

    getCollidable(type) {
        return this.collidable[type];
    }

    draw(type = "yin") {
        // 使用绘制管理器绘制地图
        this.drawManager.drawMap(
            type,
            this.background,
            this.collidable,
            this.tram,
            this.app,
            this.events,
            this.atk,
        );

        // 绘制血条
        this.drawhp();
    }

    async drawhp() {
        // 使用绘制管理器绘制血条
        this.drawManager.drawHP(this.collidable, this.HP, this.game.env);
    }

    drawPortals() {
        this.drawManager.drawPortals(this.portalImg, this.events, this.game.env);
    }
}
