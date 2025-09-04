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
        this.drawPhantomBlocks(collidable[detype], atk[detype]);

        // 绘制当前属性的碰撞元素
        this.drawCollidableElements(collidable[type], atk[type]);

        // 绘制危险元素（岩浆等）
        this.drawDangerElements(app[type]);
    }

    // 绘制虚化砖块（相反属性的碰撞箱）
    drawPhantomBlocks(phantomCollidable, atk) {
        for (let j = 0; j < phantomCollidable.length; ++j) {
            let i = phantomCollidable[j];
            let x = i.position.x,
                y = i.position.y,
                w = i.size.x,
                h = i.size.y;
            if (i instanceof Tile) {
                this.drawPhantomTile(i, atk[j]);
            } else if (i instanceof Fratile) {
                // 绘制虚化的可破坏砖块
                this.drawPhantomFratile(i);
            } else if (i instanceof Movetile) {
                // 绘制虚化的移动砖块
                this.drawPhantomMovetile(i);
            } else if (i instanceof Trampoline) {
                // 绘制虚化的弹跳板
                this.drawPhantomTrampoline(i);
            }
        }
    }

        // 绘制虚化的有血量方块
    drawPhantomTile(tile, atk) {
        const ctx = this.game.ctx;
        ctx.save();

        // 设置透明度
        ctx.globalAlpha = 0.6;

        if (tile.hp) {
            // 有生命值的方块，根据当前状态选择对应图片
            //         if (this.game.changetimes == 0
            //            || !this.game.mapmanager.hurt()
            //         ) {
            let o = tile.hp - Math.floor(this.game.changetimes / 2);
            let k = o - 1;
            if (this.game.changetimes % 2 == 0) ++k;
            if (k >= 0) {
                ctx.drawImage(tile.img[k], tile.x, tile.y, tile.w, tile.h);
            }
            // }
            // else if (
            //     this.game.mapmanager.hurt() &&
            //     this.game.gameFrame % 2 == 1 &&
            //     Math.floor(this.game.changetimes / 2) <= tile.hp
            // ) {
            //     // 受伤状态的闪烁效果
            //     let imgIndex = Math.max(0, tile.hp - Math.floor(this.game.changetimes / 2));
            //     if (tile.img[imgIndex]) {
            //         ctx.drawImage(tile.img[imgIndex], tile.x, tile.y, tile.w, tile.h);
            //     }
            // }
        } else {
            // 无生命值的普通图片方块
            if (tile.img && tile.img[0]) {
                if (atk) {
                    if (this.game.mapmanager.loadingatk()) {
                        if (this.game.gameFrame % 2 == 1) {
                            if (tile.tiling) {
                                this.drawNinePatch(ctx, tile.img[0], tile.x, tile.y, tile.w, tile.h);
                            } else {
                                ctx.drawImage(tile.img[0], tile.x, tile.y, tile.w, tile.h);
                            }
                        }
                    }
                    else {
                        if (this.game.mapmanager.startatk()) {
                            this.game.expmanager.addexp(tile.x, tile.y, tile.w, tile.h);
                        }
                        this.drawdg(tile.x, tile.y, tile.w, tile.h);
                    }
                }
                else {
                    // 绘制图片作为虚化效果
                    if (tile.tiling) {
                        this.drawNinePatch(ctx, tile.img[0], tile.x, tile.y, tile.w, tile.h);
                    } else {
                        ctx.drawImage(tile.img[0], tile.x, tile.y, tile.w, tile.h);
                    }
                }
            }
        }

        ctx.restore();
    }

    // 绘制虚化的可破坏砖块
    drawPhantomFratile(fratile) {
        // 检查砖块是否还活着，如果被破坏则不绘制虚化效果
        if (!fratile.alive(this.game)) {
            return;
        }

        const ctx = this.game.ctx;
        ctx.save();

        // 设置透明度
        ctx.globalAlpha = 0.6;

        // 绘制原始图片作为虚化效果
        if (fratile.img && fratile.img[0]) {
            if (fratile.tiling) {
                this.drawNinePatch(ctx, fratile.img[0], fratile.x, fratile.y, fratile.w, fratile.h);
            } else {
                ctx.drawImage(fratile.img[0], fratile.x, fratile.y, fratile.w, fratile.h);
            }
        }

        // 移除虚化边框，保持完全透明的效果

        // 添加虚化纹理
        ctx.strokeStyle = "rgba(125, 125, 106, 0.6)";
        ctx.lineWidth = 1;
        const lineSpacing = 20;

        // 横向纹理
        for (let ly = fratile.y + lineSpacing; ly < fratile.y + fratile.h; ly += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(fratile.x + 2, ly);
            ctx.lineTo(fratile.x + fratile.w - 2, ly);
            ctx.stroke();
        }

        // 纵向纹理
        for (let lx = fratile.x + lineSpacing; lx < fratile.x + fratile.w; lx += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(lx, fratile.y + 2);
            ctx.lineTo(lx, fratile.y + fratile.h - 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // 绘制虚化的移动砖块
    drawPhantomMovetile(movetile) {
        const ctx = this.game.ctx;
        ctx.save();

        // 设置透明度
        ctx.globalAlpha = 0.6;

        // 绘制原始图片作为虚化效果
        if (movetile.img && movetile.img[0]) {
            if (movetile.tiling) {
                this.drawNinePatch(ctx, movetile.img[0], movetile.x, movetile.y, movetile.w, movetile.h);
            } else {
                ctx.drawImage(movetile.img[0], movetile.x, movetile.y, movetile.w, movetile.h);
            }
        }

        // 移除虚化边框，保持完全透明的效果

        // 添加移动指示箭头（表示这是移动的砖块）
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 2;
        const centerX = movetile.x + movetile.w / 2;
        const centerY = movetile.y + movetile.h / 2;

        // 绘制移动方向指示器
        if (movetile.vx !== 0) {
            // 水平移动
            const arrowLength = Math.min(movetile.w, movetile.h) / 3;
            ctx.beginPath();
            if (movetile.vx > 0) {
                // 向右移动
                ctx.moveTo(centerX - arrowLength / 2, centerY);
                ctx.lineTo(centerX + arrowLength / 2, centerY);
                ctx.lineTo(centerX + arrowLength / 2 - 5, centerY - 5);
                ctx.moveTo(centerX + arrowLength / 2, centerY);
                ctx.lineTo(centerX + arrowLength / 2 - 5, centerY + 5);
            } else {
                // 向左移动
                ctx.moveTo(centerX + arrowLength / 2, centerY);
                ctx.lineTo(centerX - arrowLength / 2, centerY);
                ctx.lineTo(centerX - arrowLength / 2 + 5, centerY - 5);
                ctx.moveTo(centerX - arrowLength / 2, centerY);
                ctx.lineTo(centerX - arrowLength / 2 + 5, centerY + 5);
            }
            ctx.stroke();
        }

        if (movetile.vy !== 0) {
            // 垂直移动
            const arrowLength = Math.min(movetile.w, movetile.h) / 3;
            ctx.beginPath();
            if (movetile.vy > 0) {
                // 向下移动
                ctx.moveTo(centerX, centerY - arrowLength / 2);
                ctx.lineTo(centerX, centerY + arrowLength / 2);
                ctx.lineTo(centerX - 5, centerY + arrowLength / 2 - 5);
                ctx.moveTo(centerX, centerY + arrowLength / 2);
                ctx.lineTo(centerX + 5, centerY + arrowLength / 2 - 5);
            } else {
                // 向上移动
                ctx.moveTo(centerX, centerY + arrowLength / 2);
                ctx.lineTo(centerX, centerY - arrowLength / 2);
                ctx.lineTo(centerX - 5, centerY - arrowLength / 2 + 5);
                ctx.moveTo(centerX, centerY - arrowLength / 2);
                ctx.lineTo(centerX + 5, centerY - arrowLength / 2 + 5);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    // drawunstable(img, x, y, w, h) {
    //     if (this.game.gameFrame % 2 == 1) {
    //         this.drawImage(img, x, y, w, h);
    //     }
    // }

    // drawpunstable(x, y, w, h, img = null) {
    //     if (this.game.gameFrame % 2 == 1) {
    //         this.drawpblock(x, y, w, h);
    //     }
    // }

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
                this.drawImageTile(this.game.ctx, i, x, y, w, h, atk[j]);
            }
            else if (i instanceof Fratile) {
                i.draw(this.game);
            } else if (i instanceof Movetile) {
                i.draw(this.game);
            }
        }
    }

    // 绘制图片砖块
    drawImageTile(ctx, tile, x, y, w, h, atk) {
        if (tile.hp) {
            if (this.game.changetimes == 0 || !this.game.mapmanager.hurt()) {
                let o = tile.hp - Math.floor(this.game.changetimes / 2);
                if (o > 0) {
                    let k = o - 1;
                    if (tile.tiling== true) {
                        this.drawNinePatch(ctx, tile.img[k], x, y, w, h);
                    } else {
                        ctx.drawImage(tile.img[k], x, y, w, h);
                    }
                }
            // } else if (
            //     this.game.mapmanager.hurt() &&
            //     Math.floor(this.game.changetimes / 2) < tile.hp
            // ) {
            //     console.warn(
            //         tile.hp,
            //         tile.hp - Math.floor(this.game.changetimes / 2)
            //     );
            //     const imgIndex = Math.max(
            //         0,
            //         tile.hp - Math.floor(this.game.changetimes / 2)
            //     );
            //     if (this.game.mapmanager.starthurt()) {
            //         this.game.expmanager.addexp(x, y, w, h);
            //     }
            //     if (tile.tiling) {
            //         this.drawNinePatch(ctx, tile.img[imgIndex], x, y, w, h);
            //     } else {
            //         ctx.drawImage(tile.img[imgIndex], x, y, w, h);
            //     }
            } else if (Math.floor(this.game.changetimes / 2) <= tile.hp
                    && this.game.mapmanager.hurt()) {
                if (this.game.mapmanager.starthurt()) {
                    this.game.expmanager.addexp(x, y, w, h);
                }
                if (this.game.gameFrame % 2 == 1) {
                     const imgIndex = Math.max(
                        0,
                        tile.hp - Math.floor(this.game.changetimes / 2)
                    );
                    if (tile.tiling == true) {
                        this.drawNinePatch(ctx, tile.img[imgIndex], x, y, w, h);
                    } else {
                        ctx.drawImage(tile.img[imgIndex], x, y, w, h);
                    }
                }
            }
        } else {
            if (atk) {
                if (this.game.mapmanager.loadingatk()) {
                    if (this.game.gameFrame % 2 == 1) {
                        if (tile.tiling) {
                            this.drawNinePatch(ctx, tile.img[0], tile.x, tile.y, tile.w, tile.h);
                        } else {
                            ctx.drawImage(tile.img[0], tile.x, tile.y, tile.w, tile.h);
                        }
                    }
                }
                else {
                    if (this.game.mapmanager.startatk()) {
                        this.game.expmanager.addexp(x, y, w, h);
                    }
                    this.drawdg(x, y, w, h);
                }
            }else {
                if (tile.tiling == true) {
                    this.drawNinePatch(ctx, tile.img[0], x, y, w, h);
                } else {
                    ctx.drawImage(tile.img[0], x, y, w, h);
                }
            }
        }
    }

    // 平铺贴图绘制函数 - 先缩小再平铺
    drawNinePatch(ctx, img, x, y, w, h) {
        if (!img || !img.complete) {
            // 如果图片未加载，使用默认绘制
            ctx.drawImage(img, x, y, w, h);
            return;
        }

        const imgW = img.width;
        const imgH = img.height;

        // 如果目标区域太小，直接使用原始绘制
        if (w < 10 || h < 10) {
            ctx.drawImage(img, x, y, w, h);
            return;
        }

        // 计算合适的贴图尺寸（先缩小图片）
        // 使用碰撞箱尺寸的1/4到1/8作为贴图大小，确保有足够的重复
        const scaleFactor = Math.min(w / imgW, h / imgH); // 缩小到碰撞箱短边
        const tileW = Math.max(8, Math.floor(imgW * scaleFactor)); // 最小8像素
        const tileH = Math.max(8, Math.floor(imgH * scaleFactor)); // 最小8像素

        // 计算需要平铺的次数
        const tilesX = Math.ceil(w / tileW);
        const tilesY = Math.ceil(h / tileH);

        // 平铺绘制
        for (let ty = 0; ty < tilesY; ty++) {
            for (let tx = 0; tx < tilesX; tx++) {
                const currentX = x + tx * tileW;
                const currentY = y + ty * tileH;
                const currentW = Math.min(tileW, x + w - currentX);
                const currentH = Math.min(tileH, y + h - currentY);

                if (currentW > 0 && currentH > 0) {
                    ctx.drawImage(
                        img,
                        0, 0, imgW, imgH,  // 使用完整的源图片
                        currentX, currentY, currentW, currentH  // 缩放到目标区域
                    );
                }
            }
        }
    }

    drawdg(x, y, w, h) {
        const ctx = this.game.ctx;
        ctx.save();

        // 像素风岩浆绘制
        this.drawPixelLava(ctx, x, y, w, h);

        ctx.restore();
    }

    // 像素风岩浆绘制函数 - 改进版
    drawPixelLava(ctx, x, y, w, h) {
        // 更美观的像素风配色方案
        const colors = {
            deep: "#1A0A0A",    // 深黑红
            dark: "#2D0F0F",    // 深红
            medium: "#5C1A1A",  // 中深红
            bright: "#8B2C2C",  // 中红
            hot: "#CD5C5C",     // 亮红
            orange: "#FF6347",  // 橙红
            yellow: "#FFD700",  // 金黄
            white: "#FFF8DC"    // 米白
        };

        // 1. 基础岩浆层 - 渐变背景
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, colors.deep);
        gradient.addColorStop(0.3, colors.dark);
        gradient.addColorStop(0.7, colors.medium);
        gradient.addColorStop(1, colors.bright);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);

        // 2. 像素化的岩浆纹理 - 使用更大的像素块，更清晰的像素风
        const pixelSize = 4; // 4x4像素块，更清晰的像素风
        for (let py = y; py < y + h; py += pixelSize) {
            for (let px = x; px < x + w; px += pixelSize) {
                // 使用更复杂的噪声函数创建流动效果
                const noise1 = Math.sin(px * 0.05 + this.game.gameFrame * 0.02) +
                    Math.cos(py * 0.05 + this.game.gameFrame * 0.015);
                const noise2 = Math.sin(px * 0.1 + py * 0.08 + this.game.gameFrame * 0.01);
                const noise3 = Math.sin(px * 0.03) * Math.cos(py * 0.03);
                const wave = (noise1 + noise2 * 0.5 + noise3 * 0.3) / 1.8;

                // 更细致的颜色分层，创造更丰富的视觉效果
                if (wave > 0.7) {
                    ctx.fillStyle = colors.white;
                } else if (wave > 0.5) {
                    ctx.fillStyle = colors.yellow;
                } else if (wave > 0.3) {
                    ctx.fillStyle = colors.orange;
                } else if (wave > 0.1) {
                    ctx.fillStyle = colors.hot;
                } else if (wave > -0.1) {
                    ctx.fillStyle = colors.bright;
                } else if (wave > -0.3) {
                    ctx.fillStyle = colors.medium;
                } else if (wave > -0.5) {
                    ctx.fillStyle = colors.dark;
                } else {
                    ctx.fillStyle = colors.deep;
                }

                ctx.fillRect(px, py, pixelSize, pixelSize);
            }
        }

        // 4. 像素风格的高光边缘 - 更明显
        ctx.fillStyle = colors.white;
        ctx.fillRect(x, y, w, 2); // 顶部
        ctx.fillRect(x, y, 2, h); // 左侧
        ctx.fillRect(x + w - 2, y, 2, h); // 右侧
        ctx.fillRect(x, y + h - 2, w, 2); // 底部

        // 5. 添加一些随机的亮点和火花
        ctx.fillStyle = colors.white;
        for (let i = 0; i < 5; i++) {
            const spotX = x + Math.random() * w;
            const spotY = y + Math.random() * h;
            ctx.fillRect(Math.floor(spotX), Math.floor(spotY), 2, 2);
        }

        // 6. 添加一些橙色的火花
        ctx.fillStyle = colors.orange;
        for (let i = 0; i < 3; i++) {
            const spotX = x + Math.random() * w;
            const spotY = y + Math.random() * h;
            ctx.fillRect(Math.floor(spotX), Math.floor(spotY), 1, 1);
        }

        // 7. 像素风格的发光效果 - 更明显
        ctx.fillStyle = "rgba(255, 100, 0, 0.1)";
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

        // 8. 添加一些流动的岩浆效果
        ctx.fillStyle = colors.hot;
        for (let i = 0; i < 2; i++) {
            const flowX = x + Math.sin(this.game.gameFrame * 0.02 + i) * (w * 0.1);
            const flowY = y + i * (h / 3);
            ctx.fillRect(Math.floor(flowX), Math.floor(flowY), 3, 1);
        }
    }

    drawpdg(x, y, w, h, alpha = 0.3) {
        // 新增参数 alpha 控制透明度
        const ctx = this.game.ctx;
        ctx.save();

        // 设置整体透明度（0 ~ 1）
        ctx.globalAlpha = alpha;

        // 使用像素风岩浆绘制
        this.drawPixelLava(ctx, x, y, w, h);

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
        // 绘制当前环境的血量条
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

        // 绘制相反环境的虚化血量条
        // let oppositeEnv = env === "yang" ? "yin" : "yang";
        // if (collidable[oppositeEnv] && HP[oppositeEnv]) {
        //     for (let j = 0; j < collidable[oppositeEnv].length; ++j) {
        //         let p = collidable[oppositeEnv][j];
        //         if (!p.hp || !p.alive(this.game)) continue;
        //         if (!this.game.inputmanager.isOver(p.x, p.y, p.w, p.h)) {
        //             continue;
        //         }
        //         let o = p.hp - Math.floor(this.game.changetimes / 2);
        //         if (o > 0) { // 只显示还有生命值的虚化方块的血量条
        //             console.warn("draw phantom hp p = ", p, "HP = ", HP[oppositeEnv][j]);
        //             HP[oppositeEnv][j].sethp(o);
        //             HP[oppositeEnv][j].draw2(this.game.ctx, p.x + p.w / 2, p.y + p.h / 2);
        //         }
        //     }
        // }
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
