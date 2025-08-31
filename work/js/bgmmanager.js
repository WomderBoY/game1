// ===============================
// 用于统一管理背景音乐播放、停止、切换的类
// ===============================

// 定义 BGMManager 类
class BGMManager {
    constructor() {
        // 用来存放所有的 BGM 音频对象（Audio 实例）
        this.tracks = [];
        // 当前正在播放的音轨索引
        this.current = null;
    }

    // 添加一首 BGM
    add(src) {
        // 创建一个 Audio 对象，并开启循环播放
        let audio = new Audio(src);
        audio.loop = true;
        // 把这个音频对象放到 tracks 列表里
        this.tracks.push(audio);
    }

    // 播放某一首 BGM
    play(index) {
        // 如果传入的索引不合法（超出范围），直接返回
        if (index < 0 || index >= this.tracks.length) return;

        // 如果当前有正在播放的 BGM，先暂停并重置进度
        if (this.current !== null) {
            this.tracks[this.current].pause();
            this.tracks[this.current].currentTime = 0;
        }

        // 切换到新曲目
        this.current = index;

        // 从头播放选中的曲目
        this.tracks[index].currentTime = 0;
        this.tracks[index].play();
    }

    // 停止播放（暂停并从头复位）
    stop() {
        if (this.current !== null) {
            this.tracks[this.current].pause();
            this.tracks[this.current].currentTime = 0;
            this.current = null;
        }
    }
}

// 把 BGMManager 的实例挂载到 window 上
// 这样其他文件就能直接通过 bgmmanager 使用，而不需要 import/export
window.bgmmanager = new BGMManager();
