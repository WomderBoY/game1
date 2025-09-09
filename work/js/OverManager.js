class OverManager {
    constructor(game) {
        this.game = game;
        this.init();
    }

    init() {
        this.over = [];
        let data = this.game.datamanager.loadJSON("../over/over.json");
        for (let i of data.over)
            this.over.push(i);
    }

    
}