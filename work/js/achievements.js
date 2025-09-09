class AchievementsManager {
    constructor(game) {
        this.game = game;
        this.baseKey = 'yyj_achievements_v1';
        this.achievements = {
            first_kill: { id: 'first_kill', name: '初战告捷', desc: '击杀一个小怪', unlocked: false, unlockedAt: null },
            first_toggle: { id: 'first_toggle', name: '阴阳初转', desc: '切换一次阴阳形态', unlocked: false, unlockedAt: null },
            first_fratile: { id: 'first_fratile', name: '踏碎虚空', desc: '踩碎一个易碎方块', unlocked: false, unlockedAt: null },
            orb_death: { id: 'orb_death', name: '法球之殇', desc: '被法球击杀', unlocked: false, unlockedAt: null },
        };
        this.load();
        this.toastQueue = [];
        this.isToasting = false;
    }
    
    // 获取当前用户的存储键
    getUserStorageKey() {
        const username = localStorage.getItem("yyj_username");
        return username ? `${this.baseKey}_${username}` : this.baseKey;
    }

    load() {
        try {
            const key = this.getUserStorageKey();
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const saved = JSON.parse(raw);
            Object.keys(this.achievements).forEach(id => {
                if (saved[id]) this.achievements[id] = { ...this.achievements[id], ...saved[id] };
            });
        } catch (_) {}
    }

    save() {
        try {
            const key = this.getUserStorageKey();
            localStorage.setItem(key, JSON.stringify(this.achievements));
        } catch (_) {}
    }

    isUnlocked(id) {
        const a = this.achievements[id];
        return a ? !!a.unlocked : false;
    }

    unlock(id) {
        const a = this.achievements[id];
        if (!a || a.unlocked) return false;
        a.unlocked = true;
        a.unlockedAt = Date.now();
        this.save();
        this.enqueueToast(a.name, a.desc);
        return true;
    }

    enqueueToast(title, desc) {
        this.toastQueue.push({ title, desc });
        if (!this.isToasting) this.showNextToast();
    }

    showNextToast() {
        if (this.toastQueue.length === 0) { this.isToasting = false; return; }
        this.isToasting = true;
        const { title, desc } = this.toastQueue.shift();
        const toast = document.getElementById('achievement-toast');
        if (!toast) { this.isToasting = false; return; }
        const tTitle = toast.querySelector('.t-title');
        const tDesc = toast.querySelector('.t-desc');
        if (tTitle) tTitle.textContent = title;
        if (tDesc) tDesc.textContent = desc;
        toast.style.display = 'block';
        requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => {
                toast.style.display = 'none';
                this.showNextToast();
            }, 300);
        }, 1800);
    }
}
