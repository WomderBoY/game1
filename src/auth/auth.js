/* ================== 全局变量 ================== */
let showLogin = true;
let blackMode = true;
let backgroundAnimationId = null;


/* ================== 场景切换逻辑 ================== */

function transitionToMainMenu() {
    const authScreen = document.getElementById('auth-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const sliderWrapper = document.querySelector('.slider-wrapper');
    sliderWrapper.style.opacity = '0';
    setTimeout(() => {
        sliderWrapper.style.display = 'none';
        mainMenuScreen.classList.remove('hidden');
        requestAnimationFrame(() => { mainMenuScreen.style.opacity = '1'; });
        requestAnimationFrame(() => {
            mainMenuScreen.style.opacity = '1';
            updateUsernameDisplay();
        });
    }, 500);
}

function updateUsernameDisplay() {
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        const username = localStorage.getItem('yyj_username');
        if (username) {
            usernameDisplay.textContent = '';  //你好，用户名
        } else {
            usernameDisplay.textContent = '';
        }
    }
}

function transitionToGame() {
    // 获取主菜单元素，让它优雅地淡出
    const mainMenuScreen = document.getElementById('main-menu-screen');
    if (mainMenuScreen) {
        mainMenuScreen.style.opacity = '0';
    }

    // 在淡出动画结束后 (大约半秒)，执行页面跳转
    setTimeout(() => {

        window.location.href = 'work/js/level-select.html'; // 跳转到关卡选择页面
    }, 500); // 500毫秒对应CSS中的淡出动画时间
}

/* ================== 弹窗 & 登出逻辑 ================== */

function getSavedAchievements() {
    try {
        const username = localStorage.getItem("yyj_username");
        const key = username ? `yyj_achievements_v1_${username}` : 'yyj_achievements_v1';
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (_) { return null; }
}

function renderAchievementsList() {
    const list = document.getElementById('achievement-list');
    if (!list) return;
    list.innerHTML = '';
    const saved = getSavedAchievements();
    // 定义已知成就的基本信息（与游戏中 AchievementsManager 对应）
    const defs = {
        first_kill: { name: '初战告捷', desc: '击杀一个小怪' },
        first_toggle: { name: '阴阳初转', desc: '切换一次阴阳形态' },
        first_fratile: { name: '踏碎虚空', desc: '踩碎一个易碎方块' },
        orb_death: { name: '法球之殇', desc: '被法球击杀' },
        hidden_passage: { name: '隐秘救赎', desc: '通过隐藏关并救出被困的师兄' },
        boss_slayer: { name: '精英猎手', desc: '击败至阴之物' }
    };
    const ids = Object.keys(defs);
    ids.forEach(id => {
        const unlocked = saved && saved[id] ? !!saved[id].unlocked : false;
        const li = document.createElement('li');
        li.className = 'achievement-item' + (unlocked ? '' : ' locked');
        const icon = document.createElement('div');
        icon.className = 'icon';
        icon.textContent = unlocked ? '🏆' : '🔒';
        const details = document.createElement('div');
        details.className = 'details';
        const h3 = document.createElement('h3');
        h3.textContent = defs[id].name;
        const p = document.createElement('p');
        p.textContent = defs[id].desc + (unlocked && saved[id].unlockedAt ? `（已解锁）` : '');
        details.appendChild(h3);
        details.appendChild(p);
        li.appendChild(icon);
        li.appendChild(details);
        list.appendChild(li);
    });
}


function transitionTous() {
    // 获取主菜单元素，让它优雅地淡出
    /*const mainMenuScreen = document.getElementById('main-menu-screen');
    if (mainMenuScreen) {
        mainMenuScreen.style.opacity = '0';
    }*/

    // 在淡出动画结束后 (大约半秒)，执行页面跳转
    setTimeout(() => {

        window.location.href = 'work/about-us/index.html'; // 这就是跳转到 game.html 的核心代码
    }, 500); // 500毫秒对应CSS中的淡出动画时间
}


function showAchievements() {
    const modal = document.getElementById('achievement-modal');
    renderAchievementsList();
    modal.classList.remove('hidden');
    requestAnimationFrame(() => { modal.classList.add('show'); });
}

function hideAchievements() {
    const modal = document.getElementById('achievement-modal');
    modal.classList.remove('show');
    setTimeout(() => { modal.classList.add('hidden'); }, 300); // 等待动画结束
}

function showSettings() {
    const modal = document.getElementById('settings-modal');
    initSettingsControls();
    modal.classList.remove('hidden');
    requestAnimationFrame(() => { modal.classList.add('show'); });
}

function hideSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('show');
    setTimeout(() => { modal.classList.add('hidden'); }, 300); // 等待动画结束
}

// 初始化设置控件
function initSettingsControls() {
    // 初始化BGM音量控制
    const bgmSlider = document.getElementById('main-bgm-volume-slider');
    const bgmValue = document.getElementById('main-bgm-volume-value');

    if (bgmSlider && bgmValue) {
        // 从本地存储加载BGM音量设置
        const savedBgmVolume = localStorage.getItem('bgmVolume');
        if (savedBgmVolume !== null) {
            const volume = parseFloat(savedBgmVolume);
            const volumePercent = Math.round(volume * 100);
            bgmSlider.value = volumePercent;
            bgmValue.textContent = volumePercent + '%';
        }

        // 监听BGM音量滑块变化
        bgmSlider.addEventListener('input', function () {
            const volumePercent = parseInt(this.value);
            const volume = volumePercent / 100;

            // 更新显示
            bgmValue.textContent = volumePercent + '%';

            // 更新BGM音量
            if (window.bgmmanager) {
                window.bgmmanager.setVolume(volume);
            }
        });
    }

    // 初始化音效音量控制
    const sfxSlider = document.getElementById('sfx-volume-slider');
    const sfxValue = document.getElementById('sfx-volume-value');

    if (sfxSlider && sfxValue) {
        // 从本地存储加载音效音量设置
        const savedSfxVolume = localStorage.getItem('sfxVolume');
        if (savedSfxVolume !== null) {
            const volume = parseFloat(savedSfxVolume);
            const volumePercent = Math.round(volume * 100);
            sfxSlider.value = volumePercent;
            sfxValue.textContent = volumePercent + '%';
        } else {
            // 默认音效音量为50%
            sfxSlider.value = 50;
            sfxValue.textContent = '50%';
        }

        // 监听音效音量滑块变化
        sfxSlider.addEventListener('input', function () {
            const volumePercent = parseInt(this.value);
            const volume = volumePercent / 100;

            // 更新显示
            sfxValue.textContent = volumePercent + '%';

            // 保存音效音量设置
            localStorage.setItem('sfxVolume', volume.toString());
        });
    }
}

function logout() {
    showPopup("正在退出...");
    setTimeout(() => {
        // 清除 hash，刷新页面
        window.location.hash = '';
        location.reload();
    }, 1000);
}

/* ================== 删除存档功能 ================== */

function deleteUserSaveData() {
    const username = localStorage.getItem("yyj_username");
    if (!username) {
        showPopup("未找到当前用户信息");
        return;
    }

    // 显示确认对话框
    const confirmed = confirm(
        `确定要删除用户 "${username}" 的所有存档数据吗？\n\n` +
        `这将删除：\n` +
        `• 游戏进度存档\n` +
        `• 所有成就数据\n` +
        `• 关卡解锁状态\n` +
        `• 关卡配置数据\n\n` +
        `此操作不可撤销！`
    );

    if (!confirmed) {
        return;
    }

    // 再次确认
    const doubleConfirmed = confirm(
        `最后确认：您真的要删除用户 "${username}" 的所有数据吗？\n\n` +
        `删除后需要重新开始游戏！`
    );

    if (!doubleConfirmed) {
        return;
    }

    try {
        // 删除所有与当前用户相关的数据
        const keysToDelete = [
            `saveData1_${username}`,
            `yyj_achievements_v1_${username}`,
            `levelsConfig_${username}`,
            `unlockedLevels_${username}`,
            `selectedLevel_${username}`
        ];

        let deletedCount = 0;
        keysToDelete.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                deletedCount++;
                console.log(`已删除: ${key}`);
            }
        });

        // 显示删除结果
        if (deletedCount > 0) {
            showPopup(`成功删除 ${deletedCount} 项存档数据！`);
            console.log(`用户 ${username} 的存档数据已全部删除`);
            
            // 验证删除结果
            console.log("=== 删除验证 ===");
            keysToDelete.forEach(key => {
                const remaining = localStorage.getItem(key);
                console.log(`${key}: ${remaining ? '仍存在' : '已删除'}`);
            });
        } else {
            showPopup("没有找到需要删除的存档数据");
        }

        // 关闭设置弹窗
        hideSettings();

    } catch (error) {
        console.error("删除存档数据时发生错误:", error);
        showPopup("删除存档时发生错误，请重试");
    }
}

// 调试功能：显示当前用户的所有存档数据
function debugUserSaveData() {
    const username = localStorage.getItem("yyj_username");
    if (!username) {
        console.log("未找到当前用户信息");
        return;
    }

    console.log(`=== 用户 ${username} 的存档数据调试 ===`);
    
    const keysToCheck = [
        `saveData1_${username}`,
        `yyj_achievements_v1_${username}`,
        `levelsConfig_${username}`,
        `unlockedLevels_${username}`,
        `selectedLevel_${username}`
    ];

    keysToCheck.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                console.log(`${key}:`, parsed);
            } catch (e) {
                console.log(`${key}: ${data}`);
            }
        } else {
            console.log(`${key}: 不存在`);
        }
    });
}

// 将调试函数暴露到全局，方便在控制台调用
window.debugUserSaveData = debugUserSaveData;

/* ================== 登录注册逻辑 ================== */

function login(onSuccessCallback) {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    if (!u || !p) { showPopup("账号或密码不能为空"); return; }
    const stored = JSON.parse(localStorage.getItem(u));
    if (!stored) { showPopup("账号未注册！"); return; }
    if (stored.password === p) {
        // 保存当前登录的用户名
        localStorage.setItem("yyj_username", u);
        showPopup(`登录成功！欢迎，${u}`);
        setTimeout(onSuccessCallback, 1500);
    } else { showPopup("密码错误！"); }
}

function register() {
    const u = document.getElementById('register-username').value;
    const p = document.getElementById('register-password').value;
    // 新增：获取确认密码的值
    const cp = document.getElementById('register-confirm-password').value;

    if (!u || !p || !cp) {
        showPopup("请完整填写信息");
        return;
    }
    // 新增：验证两次密码是否一致
    if (p !== cp) {
        showPopup("两次输入的密码不一致！");
        return;
    }
    if (localStorage.getItem(u)) {
        showPopup("账号已存在！");
        return;
    }
    localStorage.setItem(u, JSON.stringify({ password: p }));
    showPopup(`注册成功！账号：${u}`);
    setTimeout(toggleForm, 1500);
}

/* ================== 其他UI逻辑 ================== */

function toggleForm() {
    const slider = document.getElementById('slider');
    slider.style.transform = showLogin ? 'rotateY(180deg)' : 'rotateY(0deg)';
    showLogin = !showLogin;

    blackMode = !blackMode;
    document.body.style.background = blackMode ? '#000' : '#fff';

    const panels = document.querySelectorAll('.panel');
    panels.forEach(p => {
        p.style.background = blackMode ? 'rgba(30,30,30,0.85)' : 'rgba(230,230,230,0.85)';
        p.style.color = blackMode ? '#fff' : '#000';
    });

    // 新增：动态改变链接颜色
    const toggleLinks = document.querySelectorAll('.toggle-link');
    toggleLinks.forEach(link => {
        link.style.color = blackMode ? '#fff' : '#000';
    });

    const wave = document.getElementById('switch-wave');
    wave.style.width = '0'; wave.style.height = '0';
    wave.style.background = blackMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
    wave.style.transition = 'none';
    requestAnimationFrame(() => {
        wave.style.transition = 'width 0.6s ease-out, height 0.6s ease-out';
        wave.style.width = '2000px'; wave.style.height = '2000px';
        setTimeout(() => { wave.style.width = '0'; wave.style.height = '0'; }, 600);
    });
    particles.forEach(p => p.color = blackMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)');
    waves.forEach(w => w.color = blackMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function checkPasswordStrength() {
    const pwd = document.getElementById('register-password').value;
    const strength = document.getElementById('password-strength');
    let score = 0;
    if (pwd.length >= 6) score++; if (/[A-Z]/.test(pwd)) score++; if (/[0-9]/.test(pwd)) score++; if (/[\W]/.test(pwd)) score++;
    const strengths = { 0: "太短", 1: "弱", 2: "中", 3: "强", 4: "非常强" };
    const colors = { 0: "#ff4d4d", 1: "#ff4d4d", 2: "#ffa500", 3: "#9acd32", 4: "#2ecc71" };
    strength.textContent = strengths[score] || "弱";
    strength.style.color = colors[score] || "#fff";
}

function showPopup(msg) {
    const popup = document.getElementById('popup');
    popup.textContent = msg;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 1500);
}

/* ================== 背景动画 (代码不变) ================== */
let backgroundRunning = false;
let canvas = document.getElementById('bg');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let waveTime = 0;
let waves = [];
let particles = [];

// 初始化波浪和粒子
function initBackgroundElements() {
    waves = [];
    particles = [];
    for (let i = 0; i < 10; i++) {
        waves.push({
            y: Math.random() * canvas.height,
            amplitude: 20 + Math.random() * 80,
            speed: 0.001 + Math.random() * 0.003,
            phase: Math.random() * Math.PI * 2,
            type: Math.floor(Math.random() * 2),
            color: 'rgba(255,255,255,0.3)'
        });
    }
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.5,
            dx: (Math.random() - 0.5) * 0.6,
            dy: (Math.random() - 0.5) * 0.6,
            color: 'rgba(255,255,255,0.5)'
        });
    }
}

function drawBackground(force = false) {
    if (backgroundRunning && !force) return; // 非强制情况下已运行就不重复启动
    backgroundRunning = true;

    initBackgroundElements(); // 初始化粒子和波浪

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        waveTime += 0.01;

        waves.forEach(w => {
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x += 3) {
                let t = x * 0.01 + waveTime * 100 * w.speed + w.phase;
                let yOffset = w.type === 0 ? Math.sin(t) * w.amplitude : Math.cos(t) * w.amplitude;
                ctx.lineTo(x, w.y + yOffset);
            }
            ctx.strokeStyle = w.color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = w.color;
            ctx.stroke();
        });

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = p.color;
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        });

        requestAnimationFrame(loop);
    }

    loop();
}


// 调整窗口大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBackgroundElements(); // 保持元素数量和位置合理
});


/* ================== 键盘事件监听 ================== */

// 为登录表单添加键盘监听
function addLoginKeyboardListeners() {
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');

    if (loginUsername && loginPassword) {
        // 在密码框按Enter键时触发登录
        loginPassword.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                login(transitionToMainMenu);
            }
        });

        // 在用户名框按Enter键时，焦点移到密码框
        loginUsername.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                loginPassword.focus();
            }
        });
    }
}

// 为注册表单添加键盘监听
function addRegisterKeyboardListeners() {
    const registerUsername = document.getElementById('register-username');
    const registerPassword = document.getElementById('register-password');
    const registerConfirmPassword = document.getElementById('register-confirm-password');

    if (registerUsername && registerPassword && registerConfirmPassword) {
        // 在确认密码框按Enter键时触发注册
        registerConfirmPassword.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                register();
            }
        });

        // 在密码框按Enter键时，焦点移到确认密码框
        registerPassword.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                registerConfirmPassword.focus();
            }
        });

        // 在用户名框按Enter键时，焦点移到密码框
        registerUsername.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                registerPassword.focus();
            }
        });
    }
}

/* ================== 事件监听 (代码不变) ================== */
document.addEventListener('DOMContentLoaded', () => {
    drawBackground();
    // 初始化 BGM 音轨（索引 0 = 登录，索引 1 = 游戏）
    bgmmanager.add("./work/bgms/bg1.mp3"); // 索引 0

    // 添加键盘监听事件
    addLoginKeyboardListeners();
    addRegisterKeyboardListeners();

    document.getElementById('start-game-btn').addEventListener('click', transitionToGame);
    document.getElementById('achievements-btn').addEventListener('click', showAchievements);
    document.getElementById('options-btn').addEventListener('click', showSettings);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.querySelector('.modal-close-btn').addEventListener('click', hideAchievements);
    document.getElementById('settings-close-btn').addEventListener('click', hideSettings);
    document.getElementById('about-us').addEventListener('click', transitionTous);
    
    // 删除存档按钮事件监听
    const deleteSaveBtn = document.getElementById('delete-save-btn');
    if (deleteSaveBtn) {
        deleteSaveBtn.addEventListener('click', deleteUserSaveData);
    }

    // 如果 URL 带有 #menu，直接展示主菜单界面
    if (window.location.hash === '#menu') {
        const authScreen = document.getElementById('auth-screen');
        const mainMenuScreen = document.getElementById('main-menu-screen');
        const sliderWrapper = document.querySelector('.slider-wrapper');
        if (sliderWrapper) {
            sliderWrapper.style.display = 'none';
        }
        if (authScreen) {
            authScreen.style.display = '';
        }
        if (mainMenuScreen) {
            mainMenuScreen.classList.remove('hidden');
            mainMenuScreen.style.opacity = '1';
            updateUsernameDisplay();
        }
    }
    // 如果是从游戏返回，直接播放 BGM
    if (window.location.hash.includes('fromGame=true')) {
        bgmmanager.play(0);
    }

    // 普通首次访问，等待用户交互再播放
    else {
        const play = () => {
            bgmmanager.play(0);
            document.removeEventListener('click', play);
            document.removeEventListener('keydown', play);
        };
        document.addEventListener('click', play);
        document.addEventListener('keydown', play);
    }
});
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});