class NightManager {
    constructor(game) {
        this.game = game; // 游戏实例
    }

    // 激活夜晚模式
    activateNight() {
        console.log("Night mode activation started");
        console.log("Current night state before delay:", this.game.night);

        // 延迟 2 秒后将 night 状态设置为 true
        setTimeout(() => {
            this.game.night = true;
            console.log("Night mode activated after 2 seconds");
            console.log("Current night state after delay:", this.game.night); // 输出确认
        }, 2000); // 2000 毫秒 = 2 秒
    }

    // 取消夜晚模式
    deactivateNight() {
        this.game.night = false; // 设置夜晚状态为 false
        console.log("Night mode deactivated");
    }
}

//export default NightManager;
