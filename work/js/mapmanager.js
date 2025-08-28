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
        this.test = [];
        this.collidable = [];
        this.events = [];
		this.background = "";
    }

	empty() {
		this.test = [];
		this.collidable = [];
		this.events = [];
		this.background = "";
	}

    async loadMap(src) {
        // 使用传入的 game 实例
        let data = await this.game.datamanager.loadJSON(src);

        this.empty();

        for (let i of data.tileMap) {
            await this.addTile(i);
        }

		if (data.background) {
			let bg = await this.game.datamanager.loadImg(data.background);
			this.background = bg;
		}
    }

    async addTile(i) {
		const [x, y, w, h] = i.hitbox;
		let img = null;
		let tile = new Tile(x, y, w, h, img, i.event); // 去掉 this.game

		if (i.col != false) this.collidable.push(tile);
		this.test.push(tile);
		if (i.event) {
	//		console.log(i.event);
			 this.events.push(tile);
		}
		for (let tile of this.game.mapmanager.events) {
			console.log(tile.event);
    	}
	}

    getCollidable() {
        return this.collidable;
    }

	draw() {
//		console.log(this.background);
		if (!this.background) {
			this.game.ctx.fillStyle = "#87cefa";
			this.game.ctx.fillRect(0, 0, this.game.width, this.game.height);
		}
		else {
			this.game.ctx.drawImage(this.background, 0, 0, this.game.width, this.game.height);
		}

		for (let i of this.test) {
			this.game.ctx.fillStyle = '#a020f0';
			// 用 Tile 的 x, y, w, h 属性
			this.game.ctx.fillRect(i.x, i.y, i.w, i.h);
	//		console.log(i.x, i.y, i.w, i.h);
		}
	}
}