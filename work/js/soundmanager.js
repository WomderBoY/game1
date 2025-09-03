class SoundManager {
    constructor() {
        this.buffers = {}; // 已加载的音效
        this.instances = {}; // 正在播放的实例列表
        this.loopSources = {}; // 循环音效单独存储
    }

    async init() {
        await this.load("run", "../sound/move.mp3");
        await this.load("jump", "../sound/jump.mp3");
        await this.load("land", "../sound/fallog.mp3");
        await this.load("typing", "../sound/typing.mp3");
        await this.load("death", "../sound/death.mp3");
        await this.load("enemydeath", "../sound/enemydeath.mp3");
        await this.load("change", "../sound/change.mp3");
        await this.load("wood_snap", "../sound/wood_snap.wav");
    }

    /** 加载音效 */
    async load(name, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            audio.preload = "auto"; // 预加载音频

            audio.oncanplaythrough = () => {
                console.log(`音效加载成功: ${name}`);
                this.buffers[name] = audio;
                this.instances[name] = [];
                resolve();
            };

            audio.onerror = (error) => {
                console.error(`音效加载失败: ${name}`, error);
                reject(error);
            };

            // 开始加载
            audio.load();
        });
    }

    /** 播放一次性音效 */
    playOnce(name, volume = 1, playbackRate = 1) {
        console.log(name, volume);
        if (!this.buffers[name]) return null;

        // 验证音量参数
        if (volume < 0 || volume > 1) {
            console.warn(
                `警告：音量值 ${volume} 超出有效范围 [0,1]，已调整为 ${Math.max(
                    0,
                    Math.min(1, volume)
                )}`
            );
            volume = Math.max(0, Math.min(1, volume));
        }

        const audio = this.buffers[name].cloneNode(); // 克隆一个新的音频元素
        audio.volume = volume;
        audio.playbackRate = playbackRate;

        audio.play().catch((e) => console.error("音效播放失败", e));

        const instance = { audio };
        this.instances[name].push(instance);

        audio.onended = () => {
            const idx = this.instances[name].indexOf(instance);
            if (idx !== -1) this.instances[name].splice(idx, 1);
        };

        return instance;
    }

    /** 循环播放音效 */
    playLoop(name, volume = 1, playbackRate = 1) {
        console.log(name, volume);
        if (this.loopSources[name]) return; // 已经在循环播放

        if (!this.buffers[name]) return null;

        // 验证音量参数
        if (volume < 0 || volume > 1) {
            console.warn(
                `警告：音量值 ${volume} 超出有效范围 [0,1]，已调整为 ${Math.max(
                    0,
                    Math.min(1, volume)
                )}`
            );
            volume = Math.max(0, Math.min(1, volume));
        }

        const audio = this.buffers[name].cloneNode(); // 克隆一个新的音频元素
        audio.loop = true;
        audio.volume = volume;
        audio.playbackRate = playbackRate;

        audio.play().catch((e) => console.error("音效播放失败", e));

        this.loopSources[name] = audio;
    }

    /** 停止循环播放 */
    stopLoop(name) {
        if (!this.loopSources[name]) return;

        const audio = this.loopSources[name];
        audio.pause();
        audio.currentTime = 0; // 重置播放位置
        delete this.loopSources[name];
    }

    /** 淡出循环音效 */
    fadeLoop(name, duration = 0.1) {
        if (!this.loopSources[name]) return;

        const audio = this.loopSources[name];
        const initialVolume = audio.volume;

        // 渐变音量
        let fadeInterval = setInterval(() => {
            if (audio.volume > 0) {
                // 修复：确保音量不会变成负数
                const decreaseAmount = initialVolume / (duration * 10);
                const newVolume = Math.max(0, audio.volume - decreaseAmount);

                // 监控音量变化
                if (newVolume !== audio.volume) {
                    console.log(
                        `音效 ${name} 音量变化: ${audio.volume.toFixed(
                            3
                        )} -> ${newVolume.toFixed(3)}`
                    );
                }

                audio.volume = newVolume;

                // 如果音量已经接近0，直接停止
                if (audio.volume <= 0.01) {
                    clearInterval(fadeInterval);
                    this.stopLoop(name);
                }
            } else {
                clearInterval(fadeInterval);
                this.stopLoop(name);
            }
        }, 100); // 每100ms减少音量

        this.loopSources[name] = audio; // 保证播放中的音频持续管理
    }

    /** 判断音效是否在播放 */
    isPlay(name) {
        return (
            (this.instances[name] && this.instances[name].length > 0) ||
            !!this.loopSources[name]
        );
    }
}
