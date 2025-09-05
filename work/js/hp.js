class hp {
    constructor(maxHP = 5, game) {
        this.maxHP = maxHP; // 最大血量
        console.warn('set hp = ', maxHP);
        this.currentHP = maxHP; // 当前血量
        this.game = game; // 游戏实例

        this.displayHP = maxHP; // 用于显示平滑过渡的血量
        this.damageEffectDuration = 300; // 扣血动画持续时间（毫秒）
        this.damageEffectTimer = 0; // 扣血动画计时器

        this.particles = []; // 存储血液粒子
    }

    // 设置血量
    sethp(amount) {
        this.currentHP = amount;
        // 如果是直接设置，立即更新显示血量
        this.displayHP = this.currentHP;
    }

    // 减少血量
    decrease(amount, x, y) {
        const oldHP = this.currentHP;
        this.currentHP -= amount;
        if (this.currentHP < 0) this.currentHP = 0;

        // 触发扣血动画和粒子效果
        if (this.currentHP < oldHP) {
            this.damageEffectTimer = this.damageEffectDuration;
            console.log(`扣血触发: 从${oldHP}减少到${this.currentHP}, 动画计时器=${this.damageEffectTimer}`);
            
            // 立即创建一些血液粒子
            this.createBloodParticles(amount, x, y);
        }
        return this.isDead();
    }

    // 增加血量
    increase(amount = 1) {
        this.currentHP += amount;
        if (this.currentHP > this.maxHP) this.currentHP = this.maxHP;
        // 增加血量时也立即更新显示血量，或者可以添加一个回血动画
        this.displayHP = this.currentHP;
    }

    // 重置血量
    reset() {
        this.currentHP = this.maxHP;
        this.displayHP = this.maxHP;
    }

    // 判断是否死亡
    isDead() {
        return this.currentHP === 0;
    }
    
    // 创建血液粒子
    async createBloodParticles(damageAmount, x, y) {
        const particleCount = Math.min(damageAmount * 3, 100); // 每次扣血生成最多10个粒子
        
        for (let i = 0; i < particleCount; i++) {
            // 粒子生成位置在血条附近
            const particleX = x + Math.random() * 100;
            const particleY = y + Math.random() * 20;
            this.particles.push(new BloodParticle(particleX, particleY));
        }
        console.log(`创建了${particleCount}个血液粒子，当前粒子总数: ${this.particles.length}`);
    }

    drawblood(canvasWidth = 1280, canvasHeight = 720, deltaTime = 16.67) {
        const scaleX = this.game.ctx.canvas.width / canvasWidth;
        const scaleY = this.game.ctx.canvas.height / canvasHeight;
        this.particles.forEach(particle => {
            particle.draw(this.game.ctx, scaleX, scaleY);
        });
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (this.particles[i].markedForDeletion) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // 调试信息
    debug() {
        console.log(`HP状态: 当前=${this.currentHP}, 显示=${this.displayHP.toFixed(2)}`);
        console.log(`扣血动画计时器=${this.damageEffectTimer}, 粒子数量=${this.particles.length}`);
    }

    // 更新逻辑，用于平滑过渡和粒子更新
    update(deltaTime = 16.67) { // 默认60FPS
        // 平滑过渡显示血量
        if (this.displayHP > this.currentHP) {
            this.displayHP -= (this.displayHP - this.currentHP) * 0.1; // 缓动效果
            if (this.displayHP < this.currentHP + 0.1) { // 避免无限接近
                this.displayHP = this.currentHP;
            }
        } else if (this.displayHP < this.currentHP) {
            // 如果血量增加，可以快速追上，或者也做一个平滑过渡
            this.displayHP += (this.currentHP - this.displayHP) * 0.2;
            if (this.displayHP > this.currentHP - 0.1) {
                this.displayHP = this.currentHP;
            }
        }

        // 扣血动画计时器
        if (this.damageEffectTimer > 0) {
            this.damageEffectTimer -= deltaTime;
            if (this.damageEffectTimer <= 0) {
                this.damageEffectTimer = 0;
                console.log('扣血动画结束');
            }
        }

        // 更新和移除粒子
    }

    //绘制圆角矩形
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    // 绘制方法（通用版）- 美化版
    draw(ctx, canvasWidth = 1280, canvasHeight = 720) {
        const scaleX = ctx.canvas.width / canvasWidth;
        const scaleY = ctx.canvas.height / canvasHeight;
        const scale = Math.min(scaleX, scaleY);

        // 血条配置
        const padding = 5 * scale;
        const borderWidth = 2 * scale;
        const radius = 8 * scale;
        const barHeight = 20 * scale;
        const totalWidth = this.maxHP * 30 * scaleX;
        
        // 位置调整
        const x = 20 * scaleX;
        const y = 20 * scaleY;
        
        // HP文字框位置（右侧）
        const textboxX = x + totalWidth + 15 * scaleX;
        const textboxY = y;
        const textboxWidth = 80 * scaleX;
        const textboxHeight = barHeight;

        // 绘制HP文字背景框
        ctx.fillStyle = "rgba(30, 30, 30, 0.8)";
        this.drawRoundedRect(ctx, textboxX, textboxY, textboxWidth, textboxHeight, radius);
        ctx.fill();
        
        // 绘制文字框边框
        ctx.strokeStyle = "rgba(200, 200, 200, 0.8)";
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        // 绘制HP文字
        ctx.fillStyle = "white";
        ctx.font = `${14 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            `HP: ${Math.ceil(this.displayHP)}/${this.maxHP}`,
            textboxX + textboxWidth / 2,
            textboxY + textboxHeight / 2
        );

        // 绘制血条外框
        ctx.fillStyle = "rgba(50, 50, 50, 0.9)";
        this.drawRoundedRect(ctx, x, y, totalWidth, barHeight, radius);
        ctx.fill();
        
        // 绘制血条边框
        ctx.strokeStyle = "rgba(200, 200, 200, 0.6)";
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        // 计算当前血量宽度（考虑内边距）
        const currentDisplayWidth = this.displayHP * 30 * scaleX;
        const innerX = x + padding;
        const innerY = y + padding;
        const innerWidth = Math.max(0, currentDisplayWidth - padding * 2);
        const innerHeight = barHeight - padding * 2;

        // 根据血量设置不同颜色
        let fillColor;
        if (this.displayHP / this.maxHP > 0.5) {
            // 健康状态 - 绿色渐变
            fillColor = ctx.createLinearGradient(innerX, innerY, innerX + innerWidth, innerY);
            fillColor.addColorStop(0, "#4CAF50");
            fillColor.addColorStop(1, "#8BC34A");
        } else if (this.displayHP / this.maxHP > 0.2) {
            // 警告状态 - 黄色渐变
            fillColor = ctx.createLinearGradient(innerX, innerY, innerX + innerWidth, innerY);
            fillColor.addColorStop(0, "#FFC107");
            fillColor.addColorStop(1, "#FFEB3B");
        } else {
            // 危险状态 - 红色渐变
            fillColor = ctx.createLinearGradient(innerX, innerY, innerX + innerWidth, innerY);
            fillColor.addColorStop(0, "#F44336");
            fillColor.addColorStop(1, "#FF5722");
        }

        // 绘制当前血量
        if (innerWidth > 0) {
            ctx.fillStyle = fillColor;
            this.drawRoundedRect(ctx, innerX, innerY, innerWidth, innerHeight, radius / 2);
            ctx.fill();
        }

        // 扣血时的闪烁效果
        if (this.damageEffectTimer > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * this.damageEffectTimer / this.damageEffectDuration})`;
            this.drawRoundedRect(ctx, x, y, totalWidth, barHeight, radius);
            ctx.fill();
        }

        // // 绘制粒子
        // this.particles.forEach(particle => {
        //     particle.draw(ctx, scaleX, scaleY);
        // });
    }

    // 绘制方法（中心版）- 美化版
    draw2(ctx, centerX, centerY, canvasWidth = 1280, canvasHeight = 720) {
        const scaleX = ctx.canvas.width / canvasWidth;
        const scaleY = ctx.canvas.height / canvasHeight;
        const scale = Math.min(scaleX, scaleY);

        // 血条配置
        const padding = 5 * scale;
        const borderWidth = 2 * scale;
        const radius = 8 * scale;
        const barHeight = 20 * scale;
        const totalWidth = this.maxHP * 30 * scaleX;
        
        // 中心位置调整
        const cx = centerX * scaleX;
        const cy = centerY * scaleY;
        const x = cx - totalWidth / 2;
        const y = cy - barHeight / 2;
        
        // HP文字框位置（上方）
        const textboxX = x;
        const textboxY = y - barHeight - 10 * scaleY;
        const textboxWidth = totalWidth;
        const textboxHeight = barHeight;

        // 绘制血条外框
        ctx.fillStyle = "rgba(50, 50, 50, 0.9)";
        this.drawRoundedRect(ctx, x, y, totalWidth, barHeight, radius);
        ctx.fill();
        
        // 绘制血条边框
        ctx.strokeStyle = "rgba(200, 200, 200, 0.6)";
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        // 计算当前血量宽度（考虑内边距）
        const currentDisplayWidth = this.displayHP * 30 * scaleX;
        const innerX = x + padding;
        const innerY = y + padding;
        const innerWidth = Math.max(0, currentDisplayWidth - padding * 2);
        const innerHeight = barHeight - padding * 2;

        // 根据血量设置不同颜色
        let fillColor;
        if (this.displayHP / this.maxHP > 0.5) {
            // 健康状态 - 绿色渐变
            fillColor = ctx.createLinearGradient(innerX, innerY, innerX + innerWidth, innerY);
            fillColor.addColorStop(0, "#4CAF50");
            fillColor.addColorStop(1, "#8BC34A");
        } else if (this.displayHP / this.maxHP > 0.2) {
            // 警告状态 - 黄色渐变
            fillColor = ctx.createLinearGradient(innerX, innerY, innerX + innerWidth, innerY);
            fillColor.addColorStop(0, "#FFC107");
            fillColor.addColorStop(1, "#FFEB3B");
        } else {
            // 危险状态 - 红色渐变
            fillColor = ctx.createLinearGradient(innerX, innerY, innerX + innerWidth, innerY);
            fillColor.addColorStop(0, "#F44336");
            fillColor.addColorStop(1, "#FF5722");
        }

        // 绘制当前血量
        if (innerWidth > 0) {
            ctx.fillStyle = fillColor;
            this.drawRoundedRect(ctx, innerX, innerY, innerWidth, innerHeight, radius / 2);
            ctx.fill();
        }

        // 扣血时的闪烁效果
        if (this.damageEffectTimer > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * this.damageEffectTimer / this.damageEffectDuration})`;
            this.drawRoundedRect(ctx, x, y, totalWidth, barHeight, radius);
            ctx.fill();
        }

        // 血量文字（放在血条中间）
        ctx.fillStyle = "white";
        ctx.font = `${16 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // 确保文字在血条内部，如果血条太窄则调整字体大小
        const text = `HP: ${Math.ceil(this.displayHP)}/${this.maxHP}`;
        let fontSize = 16 * scale;
        let finalFont = `${fontSize}px Arial`;
        
        // 检查文字是否会超出血条宽度
        ctx.font = finalFont;
        const textWidth = ctx.measureText(text).width;
        
        if (textWidth > totalWidth - 10 * scaleX) {
            // 如果文字太宽，减小字体大小
            fontSize = Math.max(8 * scale, (totalWidth - 10 * scaleX) / text.length * 0.8);
            finalFont = `${fontSize}px Arial`;
            ctx.font = finalFont;
        }
        
        ctx.fillText(text, cx, cy);

        // // 绘制粒子
        // this.particles.forEach(particle => {
        //     particle.draw(ctx, scaleX, scaleY);
        // });
    }
}

// 血液粒子类
class BloodParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2; // 粒子大小
        this.color = `rgba(200, 0, 0, ${Math.random() * 0.5 + 0.5})`; // 红色半透明
        this.velocity = {
            x: (Math.random() - 0.5) * 5, // 水平方向随机速度
            y: Math.random() * -3 - 2 // 向上溅射的速度
        };
        this.gravity = 0.1; // 重力
        this.alpha = 1; // 透明度
        this.friction = 0.98; // 摩擦力
        this.lifeSpan = 800; // 固定粒子生命周期（毫秒）
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.velocity.y += this.gravity; // 应用重力
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.velocity.x *= this.friction; // 应用摩擦力

        this.lifeSpan -= deltaTime;
        
        // 修复透明度计算 - 使用固定的初始生命周期
        const initialLifeSpan = 800; // 固定初始值
        this.alpha = Math.max(0, this.lifeSpan / initialLifeSpan);

        if (this.lifeSpan <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx, scaleX = 1, scaleY = 1) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x * scaleX, this.y * scaleY, this.size * Math.min(scaleX, scaleY) / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}