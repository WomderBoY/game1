// 游戏UI交互脚本
window.addEventListener('load', async function () {
    // 初始化游戏
    window.game = new game();
    // 等待游戏完全初始化
    await window.game.init();

    // 键盘事件监听
    document.addEventListener("keydown", function (e) {
        if (e.code === "Escape") {
            if (window.game &&
                window.game.status !== "paused" &&
                window.game.status !== "over") {
                window.game.pauseGame();
            } else if (window.game &&
                window.game.status === "paused") {
                window.game.resumeGame();
            }
        }

        if (e.code === "Enter") {
            if (window.game &&
                window.game.status === "paused") {
                window.game.resumeGame();
            }
        }
    });

    // 按钮事件监听
    const resumeBtn = document.getElementById("btnResume");
    const restartBtn = document.getElementById("btnRestart");
    const menuBtn = document.getElementById("btnMenu");

    if (resumeBtn) {
        resumeBtn.addEventListener("click", () => {
            if (window.game) {
                window.game.resumeGame();
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener("click", () => {
            if (window.game) {
                window.game.restartLevel();
            }
        });
    }

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            if (window.game) {
                window.game.returnToMainMenu();
            }
        });
    }

    // 成就提示动画
    window.showAchievementToast = function (title, description) {
        const toast = document.getElementById("achievement-toast");
        if (toast) {
            const titleEl = toast.querySelector(".t-title");
            const descEl = toast.querySelector(".t-desc");

            if (titleEl) titleEl.textContent = title;
            if (descEl) descEl.textContent = description;

            toast.style.display = "block";
            setTimeout(() => {
                toast.classList.add("show");
            }, 10);

            setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => {
                    toast.style.display = "none";
                }, 300);
            }, 3000);
        }
    };
});

