// 关卡选择界面脚本

// 关卡配置
const levelConfig = {
    "../map/test_1.json": { name: "待定", unlocked: true },
    "../map/test_2.json": { name: "待定", unlocked: false },
    "../map/bg-map1.json": { name: "待定", unlocked: false },
    "../map/bg-map2.json": { name: "待定", unlocked: false },
    "../map/bg-map3.json": { name: "待定", unlocked: false },
    "../map/bg-map4.json": { name: "待定", unlocked: false },
};

// 滑动相关变量
let currentLevelIndex = 0;
let levelsPerPage = 3; // 每页显示的关卡数
const totalLevels = Object.keys(levelConfig).length;

// 根据屏幕尺寸调整每页显示的关卡数
function updateLevelsPerPage() {
    const width = window.innerWidth;
    if (width <= 480) {
        levelsPerPage = 1;
    } else if (width <= 768) {
        levelsPerPage = 2;
    } else {
        levelsPerPage = 3;
    }
}

// 检查存档状态
function checkSaveData() {
    const saveData = localStorage.getItem("saveData");
    const unlockedLevels = JSON.parse(
        localStorage.getItem("unlockedLevels") || "[]"
    );

    // 确保第一关总是解锁的
    if (!unlockedLevels.includes("../map/test_1.json")) {
        unlockedLevels.push("../map/test_1.json");
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
    
    // 调试：打印当前解锁状态
    // console.log("=== 关卡解锁状态调试 ===");
    // console.log("localStorage中的unlockedLevels:", unlockedLevels);
    // console.log("更新后的levelConfig:", levelConfig);

    if (saveData) {
        const data = JSON.parse(saveData);
        const currentLevel = data.room;

        // 更新进度显示（如果元素存在的话）
        const progressElement = document.getElementById("current-progress");
        if (progressElement) {
            progressElement.textContent = levelConfig[currentLevel]?.name || "第1关";
        }
    }
    // 注释掉进度显示相关代码，因为HTML中该元素已被注释

    // 更新解锁状态显示
    updateLevelButtons();
    updateUnlockedCount();
}

// 更新关卡按钮状态
function updateLevelButtons() {
    const buttons = document.querySelectorAll(".level-button");
    // console.log(`找到 ${buttons.length} 个关卡按钮`);
    
    buttons.forEach((button, index) => {
        const level = button.getAttribute("data-level");
        const isUnlocked = levelConfig[level] && levelConfig[level].unlocked;
        
        // console.log(`按钮 ${index + 1}: ${level}, 解锁状态: ${isUnlocked}`);
        
        if (levelConfig[level] && !levelConfig[level].unlocked) {
            button.classList.add("locked");
            button.onclick = null;
            // console.log(`关卡 ${level} 已锁定，添加locked样式，当前classList:`, button.classList.toString());
        } else {
            button.classList.remove("locked");
            // console.log(`关卡 ${level} 已解锁，移除locked样式，当前classList:`, button.classList.toString());
        }
    });
}

// 更新已解锁关卡数量
function updateUnlockedCount() {
    const unlockedCount = Object.values(levelConfig).filter(
        (level) => level.unlocked
    ).length;
    document.getElementById("unlocked-levels").textContent = `${unlockedCount}/6`;
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
    console.log("=== 关卡选择界面解锁状态调试 ===");
    console.log("已解锁关卡:", unlockedLevels);
    console.log("存档数据:", saveData ? JSON.parse(saveData) : "无");
    console.log("当前关卡配置:", levelConfig);
    
    // 检查每个关卡的解锁状态
    Object.keys(levelConfig).forEach(level => {
        const isUnlocked = unlockedLevels.includes(level);
        console.log(`关卡 ${level}: ${isUnlocked ? '已解锁' : '未解锁'}`);
    });
}

// 手动解锁所有关卡（调试用）
function unlockAllLevels() {
    const allLevels = Object.keys(levelConfig);
    localStorage.setItem("unlockedLevels", JSON.stringify(allLevels));
    console.log("已解锁所有关卡:", allLevels);
    location.reload(); // 重新加载页面以更新界面
}

// 强制重置为只解锁第一关（调试用）
function resetToFirstLevel() {
    localStorage.setItem("unlockedLevels", JSON.stringify(["../map/test_1.json"]));
    console.log("已重置为只解锁第一关");
    location.reload(); // 重新加载页面以更新界面
}

// 测试CSS样式是否正确加载
function testCSSLoading() {
    console.log("=== CSS样式测试 ===");
    
    // 测试locked样式是否存在
    const testButton = document.querySelector('.level-button');
    if (testButton) {
        console.log("找到关卡按钮，测试添加locked样式");
        testButton.classList.add("locked");
        console.log("添加locked后，classList:", testButton.classList.toString());
        console.log("计算后的样式:", window.getComputedStyle(testButton).background);
        
        // 移除测试样式
        testButton.classList.remove("locked");
        console.log("移除locked后，classList:", testButton.classList.toString());
    } else {
        console.log("未找到关卡按钮");
    }
}

// 将解锁函数暴露到全局作用域，方便调试
window.unlockAllLevels = unlockAllLevels;
window.resetToFirstLevel = resetToFirstLevel;
window.testCSSLoading = testCSSLoading;

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

// 滑动功能
function updateSlider() {
    updateLevelsPerPage(); // 更新每页显示的关卡数
    
    const track = document.getElementById('levelTrack');
    const levelWidth = 220; // 每个关卡按钮的宽度 + 间距
    const offset = -currentLevelIndex * levelWidth;
    
    track.style.transform = `translateX(${offset}px)`;
    
    // 更新导航按钮状态
    const prevBtn = document.querySelector('.prev-button');
    const nextBtn = document.querySelector('.next-button');
    
    prevBtn.disabled = currentLevelIndex === 0;
    nextBtn.disabled = currentLevelIndex >= totalLevels - levelsPerPage;
    
    // 更新指示器
    updateIndicators();
}

function previousLevel() {
    if (currentLevelIndex > 0) {
        currentLevelIndex--;
        updateSlider();
    }
}

function nextLevel() {
    if (currentLevelIndex < totalLevels - levelsPerPage) {
        currentLevelIndex++;
        updateSlider();
    }
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        const indicatorIndex = parseInt(indicator.dataset.index);
        const isVisible = indicatorIndex >= currentLevelIndex && 
                         indicatorIndex < currentLevelIndex + levelsPerPage;
        
        indicator.classList.toggle('active', isVisible);
        indicator.classList.toggle('visible', isVisible);
    });
}

// 点击指示器跳转到对应关卡
function goToLevel(index) {
    if (index >= 0 && index <= totalLevels - levelsPerPage) {
        currentLevelIndex = index;
        updateSlider();
    }
}

// 添加触摸滑动支持
function initTouchSupport() {
    const slider = document.querySelector('.level-slider');
    let startX = 0;
    let isDragging = false;
    
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    slider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });
    
    slider.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) { // 最小滑动距离
            if (diff > 0) {
                nextLevel(); // 向左滑动，显示下一组
            } else {
                previousLevel(); // 向右滑动，显示上一组
            }
        }
    });
}

// 页面加载时检查存档
window.addEventListener("load", () => {
    checkSaveData();
    debugUnlockStatus(); // 显示调试信息
    
    // 初始化滑动器
    updateSlider();
    initTouchSupport();
    
    // 添加指示器点击事件
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToLevel(index);
        });
    });
    
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

// 监听窗口大小变化
window.addEventListener('resize', () => {
    updateSlider();
});
