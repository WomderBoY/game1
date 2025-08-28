class SaveManager{
    constructor(game){
        this.game = game;
		this.makeEmptyData();
	}
	makeEmptyData(){
		this.data={
			"room":"bg.json",
            "player":{ x:0, y:0}
		};
	}

    async save(src){
        console.log("保存游戏", src);
        this.data.room = src;
        this.data.player.x = this.game.player.position.x;
        this.data.player.y = this.game.player.position.y;
        this.data.player.yingyang = this.game.yingyang;
        let data = JSON.stringify(this.data);
        localStorage.setItem("saveData", data);
        console.log("游戏已保存", data);
    }

    async load(){
        let data = localStorage.getItem("saveData");
        if (!data) {
            console.warn("没有找到保存的数据");
            return;
        }
        this.data = JSON.parse(data);
        console.log("游戏已加载", this.data);
        if (this.data.room) {
            let e = {"type":"changemap","target":this.data.room, "x":this.data.player.x,"y":this.data.player.y };
            this.game.player.position.x = this.data.player.x;
            this.game.player.position.y = this.data.player.y;
            entitymanager.vx = 0;
            entitymanager.vy = 0;
            this.game.yingyang = this.data.player.yingyang;
            this.game.eventmanager.add(e);
        }
    }
}