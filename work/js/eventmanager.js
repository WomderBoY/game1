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
    this.event = null;

    // 当前事件处理进度标识：null/'start'/'processing'/'end'
    // 'start' 表示事件已设置但尚未开始执行（handle 会接管）
    this.progress = null;
  }

  // 直接设置当前事件并将进度置为开始
  set(e) {
    this.event = e;
    this.progress = 'start';
  }

  // 将新事件加入队列
  add(e) {
    // 如果当前没有事件，直接 set 并马上准备处理
    if (!this.event) {
      this.set(e);
      return;
    }
    // 如果已有事件，将新的事件插入到当前事件的 next 队列（作为下一个要执行的事件）
    if (!this.event.next) this.event.next = [];
    // 使用 unshift 将新的事件放到数组前端（意味着新加入的事件会被优先执行）
    // （注意：这种策略会使得后加入的事件优先于之前加入的事件执行）
    this.event.next.unshift(e);
  }

  // 处理当前事件（主事件处理器）
  // 只有当 progress === 'start' 时才会真正启动处理，避免重复并发执行
  async handle() {
    if (this.progress != 'start') return; // 如果不在 start 状态，直接返回（已在处理或已结束）
    let e = this.event;
    this.progress = 'processing';

//    this.game.status = 'event'; // 切换游戏状态到事件处理态
    this.game.canmove = false; // 禁止玩家移动
    if (e.type === 'dialog') {
        await this.game.dialog.prints(e.text);
    }
    if (e.type === 'changemap') {
        // 先加载目标地图（loadMap 内部可能处理淡入淡出、tiles、背景等）
        await this.game.mapmanager.loadMap(e.target);
        await this.game.enemymanager.LoadEnemy(e.target);
        // 将玩家定位到指定位置与朝向（e.playerStatus 应包含 position 和 facing）
        this.game.player.position.x = e.x;
        this.game.player.position.y = e.y;
//        this.game.player.facing = e.facing;
    }

    // 如果当前事件有链式 next 事件（数组），取出一个继续处理
    if (e.next && e.next.length > 0) {
      // 从 e.next 队列中取出下一个事件（shift 从数组前端取出）
      let next = e.next.shift();
      // 把剩余的 next 继续传递下去（维持链式关系）
      next.next = e.next;
      // 设置为当前事件并置入 start 状态，下次 handle 会处理它
      this.set(next);
    } else {
      // 没有后续事件，清空当前事件并标记结束
      this.event = null;
      this.progress = 'end';
   //     this.game.status = 'running'; // 恢复游戏运行态
        this.game.canmove = true; // 允许玩家移动
    }
  }
}
