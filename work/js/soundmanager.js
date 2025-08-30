class SoundManager {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {};        // 已解码音效
        this.instances = {};      // 正在播放的实例列表
        this.loopSources = {};    // 循环音效单独存储
    }

    async init() {
        await this.load("run", "../sound/move.mp3");
        await this.load("jump", "../sound/jump.mp3");
        await this.load("land", "../sound/fallog.mp3");
        await this.load("typing", "../sound/typing.mp3");
        await this.load("death", "../sound/death.mp3");
        await this.load('enemydeath', "../sound/enemydeath.mp3");
    }

    async load(name, url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
        this.buffers[name] = audioBuffer;
        this.instances[name] = [];
    }

    /** 播放一次性音效 */
    playOnce(name, volume = 1, playbackRate = 1) {
        if (!this.buffers[name]) return null;

        const source = this.audioCtx.createBufferSource();
        source.buffer = this.buffers[name];
        source.playbackRate.value = playbackRate;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode).connect(this.audioCtx.destination);
        source.start(0);

        const instance = { source, gainNode };
        this.instances[name].push(instance);

        source.onended = () => {
            const idx = this.instances[name].indexOf(instance);
            if (idx !== -1) this.instances[name].splice(idx, 1);
        };

        return instance;
    }

    /** 循环播放音效 */
    playLoop(name, volume = 1, playbackRate = 1) {
        if (this.loopSources[name]) return; // 已经在循环播放

        if (!this.buffers[name]) return null;
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.buffers[name];
        source.loop = true;
        source.playbackRate.value = playbackRate;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode).connect(this.audioCtx.destination);
        source.start(0);

        this.loopSources[name] = { source, gainNode };
    }

    /** 停止循环播放 */
    stopLoop(name) {
        if (!this.loopSources[name]) return;
        const { source } = this.loopSources[name];
        source.stop();
        delete this.loopSources[name];
    }

    /** 淡出循环音效 */
    fadeLoop(name, duration = 0.1) {
        if (!this.loopSources[name]) return;
        const { source, gainNode } = this.loopSources[name];
        gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + duration);
        source.stop(this.audioCtx.currentTime + duration);
        delete this.loopSources[name];
    }

    /** 判断音效是否在播放 */
    isPlay(name) {
        return (this.instances[name] && this.instances[name].length > 0) || !!this.loopSources[name];
    }
}
