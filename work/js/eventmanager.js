// 事件管理器：负责接收、排队并按顺序执行游戏中的事件（剧情、淡入淡出、换地图、小游戏等）
class eventmanager {
    constructor(game) {
        // 当前正在处理（或准备处理）的事件对象
        // 事件对象的结构示例（常见字段）：
        // {
        //   type: "dialog" | "delay" | "changeMap" | ...,
        //   text: [...],           // 对话文本（dialog）
        //   time: 1000,            // 延时毫秒（delay）
        //   target: "map.json",    // 目标地图（changeMap）
        //   playerStatus: { position: [x,y], facing: 1 }, // 切图时设置玩家位置
        //   src: "cg.png",         // CG 图像路径（showCG）
        //   tile: {...},           // addTile 的描述对象
        //   id: "tile1",           // removeTile 的 id
        //   flag: ["someFlag"]     // 处理完后要加入到存档的 flag（可选）
        //   next: [...]            // 链式事件数组（处理完当前后执行）
        // }
        this.game = game;
        this.event = [];

        // 当前事件处理进度标识：null/'start'/'processing'/'end'
        // 'start' 表示事件已设置但尚未开始执行（handle 会接管）
        this.progress = 'start';
        this.front = 1, this.rear = 0;
    }

    // 直接设置当前事件并将进度置为开始

    // 将新事件加入队列
    add(e, force = false) {
        // 如果当前没有事件，直接 set 并马上准备处理
        console.warn("ADD", e, force);
        if (this.game.canmove == false && !force) return;
        console.warn("加入新event", e, this.game.canmove);
        console.log(this.game.canmove);
        this.event[++this.rear] = e;
        // 如果已有事件，将新的事件插入到当前事件的 next 队列（作为下一个要执行的事件）
        console.warn('now first = ', this.event[this.front]);
    }

    // 处理当前事件（主事件处理器）
    // 只有当 progress === 'start' 时才会真正启动处理，避免重复并发执行
    async handle() {
        //console.log('shijian', this.game.canmove);\
//        console.warn(this.front, this.rear);
        if (this.front > this.rear || this.progress != 'start') return; // 如果不在 start 状态，直接返回（已在处理或已结束）
        
        let e = this.event[this.front];
        ++this.front;
        this.progress = "processing";
        console.warn("handle", e);
        //    this.game.status = 'event'; // 切换游戏状态到事件处理态
        this.game.canmove = false; // 禁止玩家移动
        if (e.type === "dialog") {
            this.game.canmove = false;
            await this.game.dialog.prints(e.text);
            this.game.canmove = true;
        }
        if (e.type === "changemap"||e.type ==="man") {
            // 先加载目标地图（loadMap 内部可能处理淡入淡出、tiles、背景等）
            if (e.with) {
                console.warn("start", this.event.next);
                await this.game.cgmanager.play(e.with);
            }
            this.game.player.position.x = e.x;
            this.game.player.position.y = e.y;
            await this.game.mapmanager.loadMap(e.target);
            await this.game.enemymanager.LoadEnemy(e.target);
            await this.game.enemy2manager.LoadEnemy2(e.target); //新加的敌人类型
            await this.game.baguamanager.LoadBagua(e.target);
            await this.game.bossmanager.loadBoss(e.target);
            // 将玩家定位到指定位置与朝向（e.playerStatus 应包含 position 和 facing）
            this.game.status = "running";
            console.log(
                "player pos",
                this.game.player.position.x,
                this.game.player.position.y
            );

            // 自动保存当前进度
            if (this.game.savemanager) {
                await this.game.savemanager.save(e.target);
            }

            // 解锁下一个关卡
            if (this.game.unlockNextLevel) {
                this.game.unlockNextLevel(e.target);
            }
            console.warn("loadmap over");
            //        this.game.player.facing = e.facing;
        }
        if (e.type === "cg") {
            // this.game.status = "cg"; // 进入CG状态
            //
            console.log("startcg");
            await this.game.cgmanager.play(e); // 触发CG播放
            console.log("endcg");
        }
        if (e.type === "night") {
            this.game.nightmanager.activateNight();
        }
        if (e.type === "day") {
            this.game.nightmanager.deactivateNight();
            if (e.with) {
                this.game.canmove = false;
                await this.game.dialog.prints(e.with.text);
                this.game.canmove = true;
            }
        }

        if (e.type === "kill"||e.type ==="kill-2") {
            this.game.hp.decrease(10);
        }

        // 如果当前事件有链式 next 事件（数组），取出一个继续处理
        if (this.front > this.rear){
            // 没有后续事件，清空当前事件并标记结束
            this.event = [];
            this.front = 1,  this.rear = 0;
            this.progress = "end";
            //     this.game.status = 'running'; // 恢复游戏运行态
            this.game.canmove = true; // 允许玩家移动
        }
        this.progress = 'start';
    }
}
