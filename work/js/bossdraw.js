// 绘制管理器 - 负责所有地图元素的绘制逻辑
class DrawManager {
    // 已有的其他方法保持不变...

    // 绘制BOSS
    drawBoss(bossImg, events, env) {
        if (!bossImg) return;

        for (let e of events[env]) {
            if (e.event && e.event.type === "boss") {
                // 计算BOSS绘制位置（居中显示在事件区域）
                const bossX = e.x + (e.w - bossImg.width) / 2;
                const bossY = e.y + (e.h - bossImg.height) / 2;

                // 添加BOSS专属动画效果（缩放+旋转组合动画）
                const gameFrame = this.game.gameFrame;
                // 呼吸缩放效果（1.0~1.1倍缩放）
                const scale = 1 + 0.1 * Math.sin(gameFrame * 0.05);
                // 轻微旋转效果（-5°~5°）
                const rotate = (5 * Math.PI / 180) * Math.sin(gameFrame * 0.03);
                
                // 计算缩放后的尺寸和偏移量
                const scaledWidth = bossImg.width * scale;
                const scaledHeight = bossImg.height * scale;
                const offsetX = (scaledWidth - bossImg.width) / 2;
                const offsetY = (scaledHeight - bossImg.height) / 2;

                this.game.ctx.save();
                // 设置透明度变化（0.9~1.0）
                this.game.ctx.globalAlpha = 0.9 + 0.1 * Math.sin(gameFrame * 0.07);
                
                // 平移到BOSS中心进行旋转
                this.game.ctx.translate(bossX + bossImg.width / 2, bossY + bossImg.height / 2);
                this.game.ctx.rotate(rotate);
                // 绘制缩放后的BOSS图像
                this.game.ctx.drawImage(
                    bossImg,
                    -scaledWidth / 2,  // 基于旋转中心偏移
                    -scaledHeight / 2,
                    scaledWidth,
                    scaledHeight
                );
                
                this.game.ctx.restore();
            }
        }
    }

}