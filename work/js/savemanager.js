class SaveManager {
    constructor(game) {
        this.game = game;
        this.makeEmptyData();
        console.log("SaveManager 构造函数完成，this.data:", this.data);
    }
    makeEmptyData() {
        this.data = {
            room: "../map/test_1.json",
            player: { x: 0, y: 0 },
            event: null,
        };
        console.log("初始化数据:", this.data);
    }

    async save(src) {
        console.log("保存游戏", src);
        this.data.room = src;
        this.data.player.x = this.game.player.position.x;
        this.data.player.y = this.game.player.position.y;
        console.warn('savemanager save', this.game.player.position.x, this.game.player.position.y);

        // 确保 yingyang 字段正确设置
        if (this.game.yingyang !== undefined) {
            this.data.player.yingyang = this.game.yingyang;
        } else {
            this.data.player.yingyang = null; // 使用 null 而不是 undefined
        }

        // 修复：正确处理 event 数据
        if (this.game.eventmanager.event && this.game.eventmanager.event.with) {
            this.data.event = this.game.eventmanager.event.with;
        } else {
            this.data.event = null; // 使用 null 而不是 undefined，确保字段被保存
        }

        console.log("with = ", this.game.eventmanager.event?.with);
        console.log("this.data", this.data);
        let data = JSON.stringify(this.data);
        localStorage.setItem("saveData1", data);
        console.log("游戏已保存", data);
        console.log("youxibaocun", this.data);
    }

    async load() {
        console.log("=== 开始加载存档 ===");
        console.log("加载前的 this.data:", this.data);
        this.game.nightmanager.deactivateNight();

        let data = localStorage.getItem("saveData1");
        if (!data) {
            console.warn("没有找到保存的数据");
            return;
        }

        try {
            console.log("即将解析的数据:", data);
            const parsedData = JSON.parse(data);

            // 使用 Object.assign 来安全地更新对象属性，而不是完全重新赋值
            let dt = Object.assign({}, this.data, parsedData);

            console.log("解析后的数据:", dt);
            console.log("event 字段:", dt.event);
            console.log("event 字段类型:", typeof dt.event);
            console.log("event 字段是否为 null:", dt.event === null);
            console.log("event 字段是否为 undefined:", dt.event === undefined);
            console.log("完整的 this.data 对象:", JSON.stringify(dt, null, 2));

            // 检查对象的所有属性
            console.log("dt 的所有属性:");
            for (let key in this.data) {
                console.log(`  ${key}:`, dt[key], `(类型: ${typeof dt[key]})`);
            }

            if (dt.room) {
                this.game.player.position.x = dt.player.x;
                this.game.player.position.y = dt.player.y;
                entitymanager.vx = 0;
                entitymanager.vy = 0;
                this.game.yingyang = dt.player.yingyang;
<<<<<<< HEAD
                await this.game.mapmanager.loadMap(dt.room);
                await this.game.enemymanager.LoadEnemy(dt.room);
                await this.game.enemy2manager.LoadEnemy2(dt.room);
=======
                this.game.mapmanager.loadMap(dt.room);
                this.game.enemymanager.LoadEnemy(dt.room);
                this.game.enemy2manager.LoadEnemy2(dt.room);
                this.game.baguamanager.LoadBagua(dt.room);
>>>>>>> 2b3411f9d17b6c4ed3c858dea468352662943fa8
                this.game.status = "running";

                // 只有当 event 不为 null 时才添加到事件管理器
            }
        } catch (error) {
            console.error("加载存档时发生错误:", error);
            console.error("原始数据:", data);
        }
    }
}
