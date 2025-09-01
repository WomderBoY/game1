// 关卡选择界面脚本

// 关卡配置
const levelConfig = {
    "../map/bg.json": { name: "图书馆入口", unlocked: true },
    "../map/bg2.json": { name: "神秘教室", unlocked: false },
    "../map/bg-map1.json": { name: "图书馆深处", unlocked: false },
};

// 检查存档状态
function checkSaveData() {
    const saveData = localStorage.getItem("saveData");
    const unlockedLevels = JSON.parse(
        localStorage.getItem("unlockedLevels") || "[]"
    );

    // 确保第一关总是解锁的
    if (!unlockedLevels.includes("../map/bg.json")) {
        unlockedLevels.push("../map/bg.json");
        localStorage.setItem(
            "unlockedLevels",
            JSON.stringify(unlockedLevels)
        );
    }

    // 根据解锁状态设置关卡
    unlockedLevels.forEach((level) => {
        if (levelConfig[level]) {
            levelConfig[level].unlocked = true;
        }
    });

    if (saveData) {
        const data = JSON.parse(saveData);
        const currentLevel = data.room;

        // 更新进度显示
        document.getElementById("current-progress").textContent =
            levelConfig[currentLevel]?.name || "第1关";
    } else {
        // 没有存档时，只解锁第一关
        document.getElementById("current-progress").textContent = "第1关";
    }

    // 更新解锁状态显示
    updateLevelButtons();
    updateUnlockedCount();
}

// 更新关卡按钮状态
function updateLevelButtons() {
    const buttons = document.querySelectorAll(".level-button");
    buttons.forEach((button) => {
        const level = button.getAttribute("data-level");
        if (levelConfig[level] && !levelConfig[level].unlocked) {
            button.classList.add("locked");
            button.onclick = null;
        } else {
            button.classList.remove("locked");
        }
    });
}

// 更新已解锁关卡数量
function updateUnlockedCount() {
    const unlockedCount = Object.values(levelConfig).filter(
        (level) => level.unlocked
    ).length;
    document.getElementById("unlocked-levels").textContent = `${unlockedCount}/3`;
}

// 选择关卡
function selectLevel(levelFile) {
    if (!levelConfig[levelFile] || !levelConfig[levelFile].unlocked) {
        showMessage("该关卡尚未解锁！", "warning");
        return;
    }

    // 添加点击动画效果
    const button = document.querySelector(`[data-level="${levelFile}"]`);
    if (button) {
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
            button.style.transform = "";
        }, 150);
    }

    // 保存选择的关卡到localStorage
    localStorage.setItem("selectedLevel", levelFile);

    // 跳转到游戏页面
    setTimeout(() => {
        window.location.href = "game.html";
    }, 200);
}

// 返回主菜单
function goBack() {
    const button = document.querySelector('.back-button');
    if (button) {
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
            button.style.transform = "";
        }, 150);
    }
    
    setTimeout(() => {
        window.location.href = "../../index.html#menu";
    }, 200);
}

// 清除存档
function clearSave() {
    if (confirm("确定要清除所有游戏存档吗？这将重置游戏进度到第一关。")) {
        localStorage.removeItem("saveData");
        localStorage.removeItem("unlockedLevels");
        localStorage.removeItem("yyj_achievements_v1");
        showMessage("存档已清除！", "success");
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// 显示消息提示
function showMessage(message, type = "info") {
    // 创建消息元素
    const messageEl = document.createElement("div");
    messageEl.className = `message-toast ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${type === "success" ? "linear-gradient(145deg, #4caf50, #45a049)" : 
                    type === "warning" ? "linear-gradient(145deg, #ff9800, #f57c00)" : 
                    "linear-gradient(145deg, #1a1a1a, #2a2a2a)"};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // 显示动画
    setTimeout(() => {
        messageEl.style.transform = "translateX(-50%) translateY(0)";
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        messageEl.style.transform = "translateX(-50%) translateY(-100px)";
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}

// 调试功能：在控制台显示解锁状态
function debugUnlockStatus() {
    const unlockedLevels = JSON.parse(
        localStorage.getItem("unlockedLevels") || "[]"
    );
    const saveData = localStorage.getItem("saveData");
    console.log("=== 关卡解锁状态调试 ===");
    console.log("已解锁关卡:", unlockedLevels);
    console.log("存档数据:", saveData ? JSON.parse(saveData) : "无");
    console.log("当前关卡配置:", levelConfig);
}

// 添加键盘快捷键支持
document.addEventListener("keydown", function(e) {
    // ESC键返回主菜单
    if (e.code === "Escape") {
        goBack();
    }
    
    // 数字键快速选择关卡
    if (e.code >= "Digit1" && e.code <= "Digit3") {
        const levelIndex = parseInt(e.code.replace("Digit", "")) - 1;
        const levelFiles = Object.keys(levelConfig);
        if (levelFiles[levelIndex]) {
            selectLevel(levelFiles[levelIndex]);
        }
    }
});

// 页面加载时检查存档
window.addEventListener("load", () => {
    checkSaveData();
    debugUnlockStatus(); // 显示调试信息
    
    // 添加页面加载动画
    const container = document.querySelector('.level-select-container');
    if (container) {
        container.style.opacity = "0";
        container.style.transform = "translateY(20px)";
        setTimeout(() => {
            container.style.transition = "all 0.6s ease";
            container.style.opacity = "1";
            container.style.transform = "translateY(0)";
        }, 100);
    }
});
