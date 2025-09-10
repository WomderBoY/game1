class OverManager {
    constructor(game) {
        this.game = game;
        this.type = -1;
        this.init();
    }

    async init() {
        this.over = [];
        let data = await this.game.datamanager.loadJSON("../over/over.json");
        console.warn(data);
        for (let i of data)
            this.over.push(i);
    }

    gettype() {
        return this.type;
    }

    settype(x) {
        this.type = x;
    }

    async gameover() {
        this.game.eventmanager.add(this.over[this.type]);
    }
}