// AnimationMachine 类：管理精灵动画的播放
class AnimationMachine {
    // 构造函数
    // s1：正向精灵表对象
    // s2：反向精灵表对象（用于角色翻转，比如左右移动）
    constructor(game, s0, s1) {
        this.game = game;
        this.spritesheet0 = s0;
        this.spritesheet1 = s1;
        this.timer = 0;                 // 动画计时器，用于控制帧切换
        this.current = 'stand';            // 当前动画名称，例如 "run"、"jump" 等
        this.currentFrame = 0;          // 当前帧索引
    }

    // 切换动画
    // name：动画名称
    changeAnimation(name) {
        this.timer = 0;         // 重置计时器
        this.current = name;    // 设置当前动画
        this.currentFrame = 0;  // 从第一帧开始播放
    }

    // 绘制当前动画帧
    // pos：角色位置对象 {x, y} 
    // inverted：是否翻转（左右方向）
    draw(pos, inverted, type) {
        // 选择正向或反向精灵表
        let s;
        if (type == true) {
            s = this.spritesheet1;
        }
        else {
            s = this.spritesheet0;
        }

        // 获取当前动画的当前帧关键帧
        let key = s.animation[this.current][this.currentFrame];

        // 绘制当前帧
        s.draw(key, pos, inverted);
    }
}
