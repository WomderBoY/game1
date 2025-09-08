function returnFromAbout() {
    const mainMenu = document.getElementById('main-menu-screen');
    const authScreen = document.getElementById('auth-screen');
    authScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.style.opacity = '1';

    // 显示 canvas
    const canvas = document.getElementById('bg');
    canvas.style.display = 'block';
    canvas.style.zIndex = 0;

    // 如果动画没跑，启动动画
    if (!backgroundRunning) drawBackground();

    updateUsernameDisplay();
}
document.getElementById('back-to-menu').addEventListener('click', () => {
    window.location.href = '../index.html'; // 如果需要返回主页
    setTimeout(() => {
        returnFromAbout();
    }, 50); // 确保页面加载完成后再调用动画
});