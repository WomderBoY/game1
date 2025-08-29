class Tile extends Rect {
    constructor(x, y, w, h, img, event) {
        super(x, y, w, h);
        this.img = img;
        this.event = event;
        // 兼容直接访问
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class mapmanager {
    constructor(game) {
        this.game = game;
        this.empty();
    }

	empty() {
        this.test = {"yin":[], "yang":[]};
        this.collidable = {"yin":[], "yang":[]};
        this.events = {"yin":[], "yang":[]};
		this.app = {"yin":[], "yang":[]};
        this.room = "";
		this.background = "";
	}

    async loadMap(src) {
        this.game.savemanager.save(src);
        // 使用传入的 game 实例
        this.room = src;
        let data = await this.game.datamanager.loadJSON(src);
		entitymanager.vx = 0;
		entitymanager.vy = 0;
		
        this.game.hp.reset();
        this.empty();

        for (let i of data.yin.tileMap) {
            await this.addTile("yin", i);
//			console.log('block', i)
        }
        for (let i of data.yang.tileMap) {
            await this.addTile("yang", i);
        }


		if (data.yang.background) {
			let bg = await this.game.datamanager.loadImg(data.yang.background);
			this.background = bg;
		}
//		console.log('events', this.events);
    }

    async addTile(type, i) {
		const [x, y, w, h] = i.hitbox;
		let img = null;
		let tile = new Tile(x, y, w, h, img, i.event); // 去掉 this.game   
		
		if (i.event && i.event.type === 'kill') this.app[type].push(tile);     //这是伤害的方块 不对这里
		if (i.col != false) this.collidable[type].push(tile);
		//if (i.app) this.app.push(tile);
		this.test[type].push(tile);
		if (i.event) {
	//		console.log(i.event);
			 this.events[type].push(tile);
		}
		for (let tile of this.game.mapmanager.events[type]) {
			console.log(tile.event[type]);
    	}
	}

    getCollidable(type) {
        return this.collidable[type];
    }

	draw(type = "yang") {
    // 绘制背景
    if (!this.background) {
        this.game.ctx.fillStyle = "#87cefa";
        this.game.ctx.fillRect(0, 0, this.game.width, this.game.height);
    } else {
        this.game.ctx.drawImage(this.background, 0, 0, this.game.width, this.game.height);
    }

    // 遍历所有元素
    for (let i of this.collidable[type]) {
        const ctx = this.game.ctx;
        const { x, y, w, h } = i;

        // 检查是否为实体碰撞区域（根据你的实际属性名调整，比如i.collision或i.solid）
         // 明确判断为true的情况
	//		console.log('进入染色');
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
        // 非碰撞区域不绘制石板效果，保持原样
        // 如果你需要绘制非碰撞区域的其他样式，可以在这里添加
        // else {
        //   // 非碰撞区域的绘制代码
        // }
    }

	// 遍历所有元素
    for (let i of this.app[type]) {
    const ctx = this.game.ctx;
    const { x, y, w, h } = i;

    console.log('进入岩浆绘制');

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
    

}