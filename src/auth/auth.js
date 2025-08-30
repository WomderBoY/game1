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
        // 播放登录 BGM（索引 0）
        if (bgmmanager) bgmmanager.play(0);
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
            usernameDisplay.textContent = `你好：${username}`;
        } else {
            usernameDisplay.textContent = '你好：旅行者';
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
        
        window.location.href = 'work/js/index.html'; // 这就是跳转到 game.html 的核心代码
    }, 500); // 500毫秒对应CSS中的淡出动画时间
}

/* ================== 弹窗 & 登出逻辑 ================== */

function getSavedAchievements(){
    try {
        const raw = localStorage.getItem('yyj_achievements_v1');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (_) { return null; }
}

function renderAchievementsList(){
    const list = document.getElementById('achievement-list');
    if (!list) return;
    list.innerHTML = '';
    const saved = getSavedAchievements();
    // 定义已知成就的基本信息（与游戏中 AchievementsManager 对应）
    const defs = {
        first_kill: { name: '初战告捷', desc: '击杀一个小怪' },
        first_toggle: { name: '阴阳初转', desc: '切换一次阴阳形态' }
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

function logout() {
    showPopup("正在退出...");
    setTimeout(() => { location.reload(); }, 1000); // 刷新页面回到登录
}

/* ================== 登录注册逻辑 ================== */

function login(onSuccessCallback) {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    if (!u || !p) { showPopup("账号或密码不能为空"); return; }
    const stored = JSON.parse(localStorage.getItem(u));
    if (!stored) { showPopup("账号未注册！"); return; }
    if (stored.password === p) {
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

function toggleForm(){
    const slider = document.getElementById('slider');
    slider.style.transform = showLogin ? 'rotateY(180deg)' : 'rotateY(0deg)';
    showLogin = !showLogin;
    
    blackMode = !blackMode;
    document.body.style.background = blackMode ? '#000' : '#fff';

    const panels = document.querySelectorAll('.panel');
    panels.forEach(p=>{
        p.style.background = blackMode ? 'rgba(30,30,30,0.85)' : 'rgba(230,230,230,0.85)';
        p.style.color = blackMode ? '#fff' : '#000';
    });
    
    // 新增：动态改变链接颜色
    const toggleLinks = document.querySelectorAll('.toggle-link');
    toggleLinks.forEach(link => {
        link.style.color = blackMode ? '#fff' : '#000';
    });

    const wave = document.getElementById('switch-wave');
    wave.style.width='0'; wave.style.height='0';
    wave.style.background=blackMode?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)';
    wave.style.transition='none';
    requestAnimationFrame(()=>{
        wave.style.transition='width 0.6s ease-out, height 0.6s ease-out';
        wave.style.width='2000px'; wave.style.height='2000px';
        setTimeout(()=>{ wave.style.width='0'; wave.style.height='0'; },600);
    });
    particles.forEach(p=>p.color=blackMode?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)');
    waves.forEach(w=>w.color=blackMode?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)');
}

function togglePassword(inputId){
    const input = document.getElementById(inputId);
    input.type = input.type==='password'?'text':'password';
}

function checkPasswordStrength(){
    const pwd = document.getElementById('register-password').value;
    const strength = document.getElementById('password-strength');
    let score=0;
    if(pwd.length>=6) score++; if(/[A-Z]/.test(pwd)) score++; if(/[0-9]/.test(pwd)) score++; if(/[\W]/.test(pwd)) score++;
    const strengths = { 0: "太短", 1: "弱", 2: "中", 3: "强", 4: "非常强" };
    const colors = { 0: "#ff4d4d", 1: "#ff4d4d", 2: "#ffa500", 3: "#9acd32", 4: "#2ecc71" };
    strength.textContent = strengths[score] || "弱";
    strength.style.color = colors[score] || "#fff";
}

function showPopup(msg){
    const popup=document.getElementById('popup');
    popup.textContent=msg;
    popup.classList.add('show');
    setTimeout(()=>popup.classList.remove('show'),1500);
}

/* ================== 背景动画 (代码不变) ================== */
const canvas=document.getElementById('bg');
const ctx=canvas.getContext('2d');
canvas.width=window.innerWidth; canvas.height=window.innerHeight;
let waveTime=0, particles=[], waves=[];
for(let i=0;i<10;i++){ waves.push({ y:Math.random()*canvas.height, amplitude:20+Math.random()*80, speed:0.001+Math.random()*0.003, phase:Math.random()*Math.PI*2, type:Math.floor(Math.random()*2), color:'rgba(255,255,255,0.3)' }); }
for(let i=0;i<150;i++){ particles.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*1.5+0.5, dx:(Math.random()-0.5)*0.6, dy:(Math.random()-0.5)*0.6, color:'rgba(255,255,255,0.5)' }); }
function drawBackground(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    waveTime+=0.01;
    waves.forEach(w=>{ ctx.beginPath(); for(let x=0;x<canvas.width;x+=3){ let t=x*0.01+waveTime*100*w.speed+w.phase; let yOffset=w.type===0?Math.sin(t)*w.amplitude:Math.cos(t)*w.amplitude; ctx.lineTo(x,w.y+yOffset); } ctx.strokeStyle=w.color; ctx.lineWidth=2; ctx.shadowBlur=10; ctx.shadowColor=w.color; ctx.stroke(); });
    particles.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=p.color; ctx.shadowBlur=5; ctx.shadowColor=p.color; ctx.fill(); p.x+=p.dx; p.y+=p.dy; if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0; if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0; });
    backgroundAnimationId=requestAnimationFrame(drawBackground);
}

/* ================== 事件监听 (代码不变) ================== */
document.addEventListener('DOMContentLoaded', ()=>{
    drawBackground();
    // 初始化 BGM 音轨（索引 0 = 登录，索引 1 = 游戏）
    bgmmanager.add("./work/bgms/bg1.mp3"); // 索引 0

    document.getElementById('start-game-btn').addEventListener('click', transitionToGame);
    document.getElementById('achievements-btn').addEventListener('click', showAchievements);
    document.getElementById('options-btn').addEventListener('click', ()=>showPopup("游戏设置功能待开发"));
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.querySelector('.modal-close-btn').addEventListener('click', hideAchievements);

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
});
window.addEventListener('resize',()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});