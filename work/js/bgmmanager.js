// 背景音乐管理器
class bgmmanager {
    constructor(game) {
        this.game = game;

        // 当前播放的 Audio 对象
        this.currentBGM = null;

        // BGM 列表，key 为名字，value 为音频路径
        this.bgms = {};

        // 是否循环播放
        this.loop = true;

        // 音量 0~1
        this.volume = 0.5;

        // 当前是否静音
        this.muted = false;
    }

    /**
     * 添加 BGM
     * @param {string} name 音乐名称
     * @param {string} src 音乐文件路径
     */
    addBGM(name, src) {
        this.bgms[name] = src;
    }

    /**
     * 播放 BGM
     * @param {string} name 音乐名称
     * @param {boolean} loop 是否循环播放
     */
    play(name, loop = true) {
        if (!this.bgms[name]) {
            console.warn(`BGM ${name} 不存在`);
            return;
        }

        // 如果有正在播放的音乐，先停止
        if (this.currentBGM) {
            this.currentBGM.pause();
            this.currentBGM.currentTime = 0;
        }

        this.currentBGM = new Audio(this.bgms[name]);
        this.currentBGM.loop = loop;
        this.currentBGM.volume = this.muted ? 0 : this.volume;
        this.currentBGM.play();
    }

    /**
     * 暂停当前 BGM
     */
    pause() {
        if (this.currentBGM) {
            this.currentBGM.pause();
        }
    }

    /**
     * 继续播放当前 BGM
     */
    resume() {
        if (this.currentBGM) {
            this.currentBGM.play();
        }
    }

    /**
     * 停止当前 BGM
     */
    stop() {
        if (this.currentBGM) {
            this.currentBGM.pause();
            this.currentBGM.currentTime = 0;
        }
    }

    /**
     * 切换音量
     * @param {number} vol 0~1
     */
    setVolume(vol) {
        this.volume = Math.min(Math.max(vol, 0), 1);
        if (this.currentBGM && !this.muted) {
            this.currentBGM.volume = this.volume;
        }
    }

    /**
     * 静音/取消静音
     * @param {boolean} flag
     */
    setMute(flag) {
        this.muted = flag;
        if (this.currentBGM) {
            this.currentBGM.volume = this.muted ? 0 : this.volume;
        }
    }
}
