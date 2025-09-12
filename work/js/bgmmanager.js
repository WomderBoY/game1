// ===============================
// 用于统一管理背景音乐播放、停止、切换的类
// ===============================

class BGMManager {
    constructor() {
        this.tracks = [];
        this.current = null;
        this.volume = 0.5;
        this.fadeDuration = 1800; // 默认淡入淡出时间 1 秒
    }

    // 添加一首 BGM
    add(src) {
        let audio = new Audio(src);
        audio.loop = true;
        audio.volume = this.volume;
        this.tracks.push(audio);
    }

    // 播放某一首 BGM，带淡入淡出效果
    async play(index) {

        const fadeDuration = this.fadeDuration;

        // 如果当前有正在播放的 BGM，先淡出
        if (this.current !== null && this.tracks[this.current]) {
            this.fadeOut(this.tracks[this.current], fadeDuration);
        }
        if (index < 0 || index >= this.tracks.length) return;

        this.current = index;
        const track = this.tracks[index];
        track.currentTime = 0;

        // 先静音开始，然后淡入
        track.volume = 0;
        track.play().then(() => {
            this.fadeIn(track, fadeDuration);
        }).catch(err => {
            console.warn("BGM play failed:", err);
        });
    }

    stop() {
        if (this.current !== null && this.tracks[this.current]) {
            this.tracks[this.current].pause();
            this.tracks[this.current].currentTime = 0;
            this.current = null;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, isFinite(volume) ? volume : 0.5));
        for (let track of this.tracks) {
            track.volume = this.volume;
        }
        localStorage.setItem('bgmVolume', this.volume.toString());
    }

    getVolume() {
        return this.volume;
    }

    loadVolumeSettings() {
        const savedVolume = localStorage.getItem('bgmVolume');
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
            if (!isFinite(this.volume) || this.volume < 0 || this.volume > 1) {
                this.volume = 0.5; // 避免非法值
            }
        }
    }

    // 工具：淡入
    fadeIn(track, duration) {
        const step = 50; // 每 50ms 调整一次
        const increment = this.volume / (duration / step);
        track.volume = 0;

        const fade = setInterval(() => {
            if (track.volume < this.volume - increment) {
                track.volume = Math.min(this.volume, track.volume + increment);
            } else {
                track.volume = this.volume;
                clearInterval(fade);
            }
        }, step);
    }

    // 工具：淡出
    fadeOut(track, duration) {
        return new Promise(resolve => {
            const step = 50; // 每 50ms 调整一次
            const decrement = track.volume / (duration / step);

            const fade = setInterval(() => {
                if (track.volume > decrement) {
                    track.volume = Math.max(0, track.volume - decrement);
                } else {
                    track.volume = 0;
                    track.pause();
                    clearInterval(fade);
                    resolve(); // ✅ 通知外部“淡出结束”
                }
            }, step);
        });
    }
}

// 实例挂到全局
window.bgmmanager = new BGMManager();
