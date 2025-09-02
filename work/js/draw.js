// 绘制管理器 - 负责所有地图元素的绘制逻辑
class DrawManager {
    constructor(game) {
        this.game = game;
    }

    // 绘制背景
    drawBackground(background, width, height) {
        // 清空画布并绘制背景（如果背景存在）
        if (background["yang"] && background["yang"] instanceof Image) {
            this.game.ctx.drawImage(background["yang"], 0, 0, width, height);
        } else if (background["yang"] === "") {
            // 如果没有背景图，绘制默认背景色
            this.game.ctx.fillStyle = "#87cefa";
            this.game.ctx.fillRect(0, 0, width, height);
        }

        if (background["yin"] && background["yin"] instanceof Image) {
            this.game.ctx.drawImage(background["yin"], 0, 0, width, height);
        } else if (background["yin"] === "") {
            // 如果没有背景图，绘制默认背景色
            this.game.ctx.fillStyle = "#87cefa";
            this.game.ctx.fillRect(0, 0, width, height);
        }
    }

    // 绘制主要地图内容
    drawMap(type, background, collidable, tram, app, events, atk) {
        let detype = type == "yang" ? "yin" : "yang";

        // 绘制背景
        if (background[type] == "") {
            this.game.ctx.fillStyle = "#87cefa";
            this.game.ctx.fillRect(0, 0, this.game.width, this.game.height);
        } else {
            this.game.ctx.drawImage(
                background[type],
                0,
                0,
                this.game.width,
                this.game.height
            );
        }

        // 绘制弹跳箱
        for (let i of tram) {
            i.draw(this.game);
        }

        // 绘制相反属性的虚化砖块
        this.drawPhantomBlocks(collidable[detype], atk[type]);

        // 绘制当前属性的碰撞元素
        this.drawCollidableElements(collidable[type], atk[type]);

        // 绘制危险元素（岩浆等）
        this.drawDangerElements(app[type]);
    }

    drawpblock(x, y, w, h) {
        const ctx = this.game.ctx;
        // 虚化砖块效果
        ctx.save();

        // 设置透明度
        ctx.globalAlpha = 0.8;

        // 1. 虚化底色（半透明）
        ctx.fillStyle = "rgba(139, 139, 122, 0.5)";
        ctx.fillRect(x, y, w, h);

        // 2. 虚化边框（半透明）
        ctx.strokeStyle = "rgba(109, 109, 90, 0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // 3. 虚化纹理线条（半透明）
        ctx.strokeStyle = "rgba(125, 125, 106, 0.4)";
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

        // 4. 虚化高光效果
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(x, y, w, 2); // 顶部边缘
        ctx.fillRect(x, y, 2, h); // 左侧边缘

        ctx.restore();
    }

    // 绘制虚化砖块（相反属性的碰撞箱）
    drawPhantomBlocks(phantomCollidable, atk) {
        for (let j = 0; j < phantomCollidable.length; ++j) {
            let i = phantomCollidable[j];
            let x = i.position.x,
                y = i.position.y,
                w = i.size.x,
                h = i.size.y;
            if (i instanceof Tile && i.img.length == 0) {
                //                console.warn(atk[j], this.game.mapmanager.loadingatk());
                if (atk[j]) {
                    if (this.game.mapmanager.loadingatk()) {
                        this.drawunstable(x, y, w, h);
                    } else {
                        this.drawpdg(x, y, w, h);
                    }
                } else {
                    this.drawpblock(x, y, w, h);
                }
            }
        }
    }

    drawunstable(x, y, w, h) {
        if (this.game.gameFrame % 2 == 1) {
            this.drawStoneTile(x, y, w, h);
        }
    }

    drawpunstable(x, y, w, h, img = null) {
        if (this.game.gameFrame % 2 == 1) {
            this.drawpblock(x, y, w, h);
        }
    }

    // 绘制碰撞元素
    drawCollidableElements(collidable, atk) {
        for (let j = 0; j < collidable.length; ++j) {
            let i = collidable[j];
            const ctx = this.game.ctx;
            let x = i.position.x,
                y = i.position.y,
                w = i.size.x,
                h = i.size.y;

            if (i instanceof Tile) {
                if (i.img.length == 0) {
                    // 石板砖块效果
                    if (atk[j]) {
                        if (this.game.mapmanager.loadingatk()) {
                            this.drawunstable(x, y, w, h);
                        } else {
                            this.drawdg(x, y, w, h);
                        }
                    } else this.drawStoneTile(x, y, w, h);
                } else {
                    // 绘制贴纸/装饰图层
                    this.drawImageTile(ctx, i, x, y, w, h, atk[j]);
                }
            } else if (i instanceof Fratile) {
                i.draw(this.game);
            } else if (i instanceof Movetile) {
                i.draw(this.game);
            }
        }
    }

    // 绘制石板砖块
    drawStoneTile(x, y, w, h) {
        const ctx = this.game.ctx;
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

    // 绘制图片砖块
    drawImageTile(ctx, tile, x, y, w, h, atk) {
        if (tile.hp) {
            if (this.game.changetimes == 0 || !this.game.mapmanager.hurt()) {
                let o = tile.hp - Math.floor(this.game.changetimes / 2);
                if (o > 0) {
                    let k = o - 1;
                    ctx.drawImage(tile.img[k], x, y, w, h);
                }
            } else if (
                this.game.mapmanager.hurt() &&
                this.game.gameFrame % 2 == 1 &&
                Math.floor(this.game.changetimes / 2) <= tile.hp
            ) {
                console.warn(
                    tile.hp,
                    tile.hp - Math.floor(this.game.changetimes / 2)
                );
                ctx.drawImage(
                    tile.img[
                        Math.max(
                            0,
                            tile.hp - Math.floor(this.game.changetimes / 2)
                        )
                    ],
                    x,
                    y,
                    w,
                    h
                );
            }
        } else {
            if (atk && this.game.mapmanager.loadingatk()) {
                this.drawunstable(tile.img[0], x, y, w, h);
            } else ctx.drawImage(tile.img[0], x, y, w, h);
        }
    }

    drawdg(x, y, w, h) {
        const ctx = this.game.ctx;
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

    drawpdg(x, y, w, h, alpha = 0.7) {
        // 新增参数 alpha 控制透明度
        const ctx = this.game.ctx;
        ctx.save();

        // 设置整体透明度（0 ~ 1）
        ctx.globalAlpha = alpha;

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
            ctx.lineTo(x + w, ly + Math.sin(ly * 0.3) * 5);
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
        ctx.fillRect(x, y, w, 3);
        ctx.fillRect(x, y, 3, h);

        // 4. 发光外晕（危险感）
        ctx.shadowColor = "rgba(255, 69, 0, 0.8)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "rgba(255, 69, 0, 0.2)";
        ctx.fillRect(x, y, w, h);

        ctx.restore();
    }

    // 绘制危险元素（岩浆等）
    drawDangerElements(dangerElements) {
        for (let i of dangerElements) {
            const ctx = this.game.ctx;
            const { x, y, w, h } = i;
            this.drawdg(x, y, w, h);
        }
    }

    // 绘制血条
    drawHP(collidable, HP, env) {
        for (let j = 0; j < collidable[env].length; ++j) {
            let p = collidable[env][j];
            if (!p.hp || !p.alive(this.game)) continue;
            if (!this.game.inputmanager.isOver(p.x, p.y, p.w, p.h)) {
                continue;
            }
            let o = p.hp - Math.floor(this.game.changetimes / 2);
            console.warn("drawhp p = ", p, "HP = ", HP[env][j]);
            HP[env][j].sethp(o);
            HP[env][j].draw2(this.game.ctx, p.x + p.w / 2, p.y + p.h / 2);
        }
    }

    // 绘制传送门
    drawPortals(portalImg, events, env) {
        if (!portalImg) return;

        for (let e of events[env]) {
            if (e.event && e.event.type === "changemap") {
                // 计算传送门位置（居中显示在事件区域）
                const portalX = e.x + (e.w - portalImg.width) / 2;
                const portalY = e.y + (e.h - portalImg.height) / 2;

                // 添加简单的呼吸动画效果
                const scale = 1 + 0.1 * Math.sin(this.game.gameFrame * 0.1);
                const scaledWidth = portalImg.width * scale;
                const scaledHeight = portalImg.height * scale;
                const offsetX = (scaledWidth - portalImg.width) / 2;
                const offsetY = (scaledHeight - portalImg.height) / 2;

                this.game.ctx.save();
                this.game.ctx.globalAlpha =
                    0.8 + 0.2 * Math.sin(this.game.gameFrame * 0.15);
                this.game.ctx.drawImage(
                    portalImg,
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
