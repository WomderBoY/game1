class Tile extends Rect {
    constructor(x, y, w, h, hp, img, event) {
        super(x, y, w, h);
        this.img = img;
        this.hp = hp;
        this.event = event;
        // 兼容直接访问
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    alive(game) {
        if (!this.hp) return true;
        //        console.warn('hp', this.hp, game.changetimes, game.mapmanager.hurt());
        if (Math.floor(game.changetimes / 2) == this.hp && game.mapmanager.hurt())
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
    }

    async init() {
        this.portalImg = await this.game.datamanager.loadImg(
            "../images/portal.png"
        );
    }

    empty() {
        this.test = { yin: [], yang: [] };
        this.collidable = { yin: [], yang: [] };
        this.HP = {yin:[], yang:[]}
        this.events = { yin: [], yang: [] };
        this.app = { yin: [], yang: [] };
        this.room = "";
        this.background = { yin: [], yang: [] };
        this.tram = [];
    }

    sethurt() {
        mapmanager.lstchange = this.game.gameFrame;
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
            return;
        }

        this.game.env = 'yang';
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
        fadeOut();
        await this.loadNewMap(src);
        this.game.canmove = true;
    }

    // 加载新地图
    async loadNewMap(src) {
        console.log("=== loadNewMap 开始 ===");

        // 重置玩家状态、清空地图和事件
        entitymanager.vx = 0;
        entitymanager.vy = 0;
        this.game.hp.reset();
        this.empty();

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
                    this.cgmanager.play(data.with.event);
                } else {
                    console.log("直接播放 data.with:", data.with);
                    this.cgmanager.play(data.with);
                }
            } else {
                console.warn("data.with 既不是数组也不是对象:", data.with);
            }
        } else {
            console.log("没有 data.with 字段");
        }

        console.log("hahaha");
        // 加载 yin 和 yang 区域的瓦片
        for (let i of data.yin.tileMap) {
            await this.addTile("yin", i);
        }
        console.warn('jiazaiwancheng');
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
    }

    // 渐变淡入效果
    fadeIn() {
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
    }

    // 假设你有一个绘制背景的方法
    drawBackground() {
        // 清空画布并绘制背景（如果背景存在）
        if (
            this.background["yang"] &&
            this.background["yang"] instanceof Image
        ) {
            this.game.ctx.drawImage(
                this.background["yang"],
                0,
                0,
                this.game.view.width,
                this.game.view.height
            );
        } else if (this.background["yang"] === "") {
            // 如果没有背景图，绘制默认背景色
            this.game.ctx.fillStyle = "#87cefa";
            this.game.ctx.fillRect(
                0,
                0,
                this.game.view.width,
                this.game.view.height
            );
        }

        if (this.background["yin"] && this.background["yin"] instanceof Image) {
            this.game.ctx.drawImage(
                this.background["yin"],
                0,
                0,
                this.game.view.width,
                this.game.view.height
            );
        } else if (this.background["yin"] === "") {
            // 如果没有背景图，绘制默认背景色
            this.game.ctx.fillStyle = "#87cefa";
            this.game.ctx.fillRect(
                0,
                0,
                this.game.view.width,
                this.game.view.height
            );
        }
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
            console.warn('fra');
            tile = new Fratile(x, y, w, h, img); // 去掉 this.game
        }
        else if (i.move) {
            console.warn('move');
            const [xmn, xmx, ymn, ymx] = i.area;
            tile = new Movetile(x, y, w, h, img, xmn, xmx, ymn, ymx, i.vx, i.vy);
        }
        else {
            tile = new Tile(x, y, w, h, i.hp, img, i.event);
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
        // 绘制背景
        //    console.log(type);
        //    console.log(this.background);
        if (this.background[type] == "") {
            this.game.ctx.fillStyle = "#87cefa";
            this.game.ctx.fillRect(0, 0, this.game.width, this.game.height);
        } else {
            this.game.ctx.drawImage(
                this.background[type],
                0,
                0,
                this.game.width,
                this.game.height
            );
        }

        //绘制tram
        for (let i of this.tram) {
  //          console.warn("start draw tram", i);
            i.draw(this.game);
        }

        this.drawhp();

        // 遍历所有元素
        for (let i of this.collidable[type]) {
            const ctx = this.game.ctx;
            const { x, y, w, h } = i;

            // 检查是否为实体碰撞区域（根据你的实际属性名调整，比如i.collision或i.solid）
            // 明确判断为true的情况
            //		console.log('进入染色');
            if (i instanceof Tile) {
                if (i.img.length == 0) {
                    // 石板砖块效果
                    ctx.save(); // 保存当前绘图状态

                    // 1. 砖块底色
                    ctx.fillStyle = "#8B8B7A";
                    ctx.fillRect(x, y, w, h);

                    // 2. 砖块边框
                    ctx.strokeStyle = "#6D6D5A";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, w, h);

                    // 3. 纹理线条
                    ctx.strokeStyle = "#7D7D6A";
                    ctx.lineWidth = 1;
                    const lineSpacing = 25;

                    // 横向纹理
                    for (let ly = y + lineSpacing; ly < y + h; ly += lineSpacing) {
                        ctx.beginPath();
                        ctx.moveTo(x + 2, ly);
                        ctx.lineTo(x + w - 2, ly);
                        ctx.stroke();
                    }

                    // 纵向纹理
                    for (let lx = x + lineSpacing; lx < x + w; lx += lineSpacing) {
                        ctx.beginPath();
                        ctx.moveTo(lx, y + 2);
                        ctx.lineTo(lx, y + h - 2);
                        ctx.stroke();
                    }

                    // 4. 高光效果
                    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                    ctx.fillRect(x, y, w, 2); // 顶部边缘
                    ctx.fillRect(x, y, 2, h); // 左侧边缘

                    ctx.restore(); // 恢复绘图状态
                }
                // 绘制贴纸/装饰图层（每个碰撞箱都使用同一张贴纸）
                else {
                    if (i.hp) {
    //                    console.warn("draw image", this.game.changetimes, this.game.mapmanager.hurt());
                        if (this.game.changetimes == 0 || !this.game.mapmanager.hurt()) {
                            let o = i.hp - Math.floor(this.game.changetimes / 2);
                            if (o > 0) {
                                let k = o - 1;
                                ctx.drawImage(i.img[k], x, y, w, h);
                            }
                        } else if (
                            this.game.mapmanager.hurt() &&
                            this.game.gameFrame % 2 == 1 &&
                            Math.floor(this.game.changetimes / 2) <= i.hp
                        ) {
                            console.warn(i.hp, i.hp - Math.floor(this.game.changetimes / 2));
                            ctx.drawImage(
                                i.img[
                                    Math.max(
                                        0,
                                        i.hp - Math.floor(this.game.changetimes / 2)
                                    )
                                ],
                                x,
                                y,
                                w,
                                h
                            );
                        }
                    } else {
                        ctx.drawImage(i.img[0], x, y, w, h);
                    }
                }
            }
            else if (i instanceof Fratile) {
                i.draw(this.game);
            }
            else if (i instanceof Movetile) {
 //               i.update();
                i.draw(this.game);
            }
        }
        // 非碰撞区域不绘制石板效果，保持原样
        // 如果你需要绘制非碰撞区域的其他样式，可以在这里添加
        // else {
        //   // 非碰撞区域的绘制代码
        // }
        // console.log('Collidable object:', i);//调试代码


        // 遍历所有元素，这里其实只花了那个app类型的
        for (let i of this.app[type]) {
            const ctx = this.game.ctx;
            const { x, y, w, h } = i;

            //   console.log('进入岩浆绘制');

            ctx.save();

            // 1. 岩浆底色（深红）
            const lavaGradient = ctx.createLinearGradient(x, y, x, y + h);
            lavaGradient.addColorStop(0, "#8B0000"); // 深红
            lavaGradient.addColorStop(0.5, "#FF4500"); // 橙红
            lavaGradient.addColorStop(1, "#FF6347"); // 番茄红
            ctx.fillStyle = lavaGradient;
            ctx.fillRect(x, y, w, h);

            // 2. 岩浆裂纹（亮橙/黄色）
            ctx.strokeStyle = "#FFD700"; // 金黄
            ctx.lineWidth = 2;

            // 横向裂纹
            for (let ly = y + 10; ly < y + h; ly += 20) {
                ctx.beginPath();
                ctx.moveTo(x, ly);
                ctx.lineTo(x + w, ly + Math.sin(ly * 0.3) * 5); // 不规则波动
                ctx.stroke();
            }

            // 纵向裂纹
            for (let lx = x + 10; lx < x + w; lx += 20) {
                ctx.beginPath();
                ctx.moveTo(lx, y);
                ctx.lineTo(lx + Math.sin(lx * 0.3) * 5, y + h);
                ctx.stroke();
            }

            // 3. 熔岩高光（模拟发光边缘）
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillRect(x, y, w, 3); // 顶部高光
            ctx.fillRect(x, y, 3, h); // 左侧高光

            // 4. 发光外晕（危险感）
            ctx.shadowColor = "rgba(255, 69, 0, 0.8)";
            ctx.shadowBlur = 20;
            ctx.fillStyle = "rgba(255, 69, 0, 0.2)";
            ctx.fillRect(x, y, w, h);

            ctx.restore();
        }
    }
    
    async drawhp() {
        const type = this.game.env;
        for (let j = 0; j < this.collidable[type].length; ++j) {
            let p = this.collidable[type][j];
            if (!p.hp || !p.alive(this.game)) continue;
            if (!this.game.inputmanager.isOver(p.x, p.y, p.w, p.h)) {
                continue;
            }
            let o = p.hp - Math.floor(this.game.changetimes / 2);
            console.warn('drawhp p = ', p, 'HP = ', this.HP[type][j]);
            this.HP[type][j].sethp(o);
            this.HP[type][j].draw2(this.game.ctx, p.x + p.w / 2, p.y + p.h / 2);
        }
    }

    drawPortals() {
        if (!this.portalImg) return;

        for (let e of this.game.mapmanager.events[this.game.env]) {
            if (e.event && e.event.type === "changemap") {
                // 计算传送门位置（居中显示在事件区域）
                const portalX = e.x + (e.w - this.portalImg.width) / 2;
                const portalY = e.y + (e.h - this.portalImg.height) / 2;

                // 添加简单的呼吸动画效果
                const scale = 1 + 0.1 * Math.sin(this.game.gameFrame * 0.1);
                const scaledWidth = this.portalImg.width * scale;
                const scaledHeight = this.portalImg.height * scale;
                const offsetX = (scaledWidth - this.portalImg.width) / 2;
                const offsetY = (scaledHeight - this.portalImg.height) / 2;

                this.game.ctx.save();
                this.game.ctx.globalAlpha =
                    0.8 + 0.2 * Math.sin(this.game.gameFrame * 0.15);
                this.game.ctx.drawImage(
                    this.portalImg,
                    portalX - offsetX,
                    portalY - offsetY,
                    scaledWidth,
                    scaledHeight
                );
                this.game.ctx.restore();
            }
        }
    }
}
