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
        // BGM音量，默认为0.5
        this.volume = 0.5;
    }

    // 添加一首 BGM
    add(src) {
        // 创建一个 Audio 对象，并开启循环播放
        let audio = new Audio(src);
        audio.loop = true;
        audio.volume = this.volume; // 应用当前音量设置
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

    // 设置BGM音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume)); // 限制在0-1之间

        // 更新所有音轨的音量
        for (let track of this.tracks) {
            track.volume = this.volume;
        }

        // 保存到本地存储
        localStorage.setItem('bgmVolume', this.volume.toString());
    }

    // 获取当前BGM音量
    getVolume() {
        return this.volume;
    }

    // 从本地存储加载音量设置
    loadVolumeSettings() {
        const savedVolume = localStorage.getItem('bgmVolume');
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }
    }
}

// 把 BGMManager 的实例挂载到 window 上
// 这样其他文件就能直接通过 bgmmanager 使用，而不需要 import/export
window.bgmmanager = new BGMManager();
