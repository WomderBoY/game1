// 关卡选择界面脚本

// 关卡配置 - 将从JSON文件动态加载
let levelConfig = {};
let levelsData = [];
let totalLevels = 0;

// 滑动相关变量
let currentLevelIndex = 0;
let levelsPerPage = 3; // 每页显示的关卡数

// 获取当前用户的存储键
function getUserStorageKey(baseKey) {
    const username = localStorage.getItem("yyj_username");
    return username ? `${baseKey}_${username}` : baseKey;
}

// 加载关卡配置
function loadLevelsConfig() {
    // 直接从localStorage加载配置
    const configKey = getUserStorageKey('levelsConfig');
    const savedConfig = localStorage.getItem(configKey);
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            levelsData = config.levels;
            totalLevels = levelsData.length;
            
            // 构建levelConfig对象
            levelConfig = {};
            levelsData.forEach(level => {
                levelConfig[level.file] = {
                    name: level.name,
                    unlocked: level.unlocked,
                    id: level.id,
                    order: level.order
                };
            });
            
            console.log(`成功加载 ${totalLevels} 个关卡配置`);
            console.log('构建的levelConfig:', levelConfig);
            
            // 动态生成HTML
            generateLevelsHTML();
            
            // 检查存档状态
            checkSaveData();
            
            // 初始化界面
            updateSlider();
            initTouchSupport();
            
        } catch (e) {
            console.error('从localStorage加载配置失败:', e);
            console.log('使用默认配置作为备用方案');
            useDefaultConfig();
        }
    } else {
        console.log('localStorage中没有配置，使用默认配置');
        useDefaultConfig();
    }
}

// 使用默认配置（备用方案）
function useDefaultConfig() {
    levelConfig = {
        "../map/test_1.json": { name: "待定", unlocked: false },
        "../map/test_2.json": { name: "待定", unlocked: false },
        "../map/bg-map1.json": { name: "待定", unlocked: false },
        "../map/bg-map2.json": { name: "待定", unlocked: false },
        "../map/bg-map3.json": { name: "待定", unlocked: false },
        "../map/bg-map4.json": { name: "待定", unlocked: false },
    };
    totalLevels = Object.keys(levelConfig).length;
    levelsData = Object.keys(levelConfig).map((file, index) => ({
        file: file,
        name: levelConfig[file].name,
        unlocked: levelConfig[file].unlocked,
        order: index + 1
    }));
    
    generateLevelsHTML();
    checkSaveData();
    updateSlider();
    initTouchSupport();
}

// 动态生成关卡HTML
function generateLevelsHTML() {
    const track = document.getElementById('levelTrack');
    const indicatorsContainer = document.querySelector('.level-indicators');
    
    if (!track || !indicatorsContainer) return;
    
    // 清空现有内容
    track.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    
    // 生成关卡按钮
    levelsData.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.setAttribute('data-level', level.file);
        button.setAttribute('data-index', index); // 添加索引用于调试
        button.onclick = () => selectLevel(level.file);
        
        button.innerHTML = `
            <span class="level-number">${level.order}</span>
            <span class="level-name">${level.name}</span>
        `;
        
        track.appendChild(button);
        // console.log(`创建关卡按钮 ${index + 1}: ${level.name} (${level.file})`);
    });
    
    // 生成指示器
    const totalPages = Math.ceil(totalLevels / levelsPerPage);
    // console.log(`计算指示器数量 - 总关卡数: ${totalLevels}, 每页显示: ${levelsPerPage}, 总页数: ${totalPages}`);
    
    for (let i = 0; i < totalPages; i++) {
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        indicator.setAttribute('data-index', i);
        indicator.addEventListener('click', () => goToLevel(i));
        indicatorsContainer.appendChild(indicator);
        // console.log(`创建指示器 ${i}, data-index: ${i}`);
    }
    
    // console.log(`生成了 ${totalPages} 个指示器`);
    
    // 更新解锁数量显示
    updateUnlockedCount();
}

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
    const saveDataKey = getUserStorageKey("saveData1");
    const saveData = localStorage.getItem(saveDataKey);
    const unlockedLevelsKey = getUserStorageKey("unlockedLevels");
    const unlockedLevels = JSON.parse(
        localStorage.getItem(unlockedLevelsKey) || "[]"
    );

    // 确保默认关卡总是解锁的
    const defaultUnlockedLevels = ["../map/jiaoxue1.json"]; // 根据配置，默认解锁教学关卡1
    defaultUnlockedLevels.forEach(level => {
        if (!unlockedLevels.includes(level)) {
            unlockedLevels.push(level);
        }
    });
    
    // 如果有新的解锁关卡，保存到localStorage
    if (defaultUnlockedLevels.some(level => !unlockedLevels.includes(level))) {
        localStorage.setItem(
            unlockedLevelsKey,
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
            // 重新绑定点击事件
            button.onclick = () => selectLevel(level);
            // console.log(`关卡 ${level} 已解锁，移除locked样式，当前classList:`, button.classList.toString());
        }
    });
}

// 更新已解锁关卡数量
function updateUnlockedCount() {
    const unlockedCount = Object.values(levelConfig).filter(
        (level) => level.unlocked
    ).length;
    document.getElementById("unlocked-levels").textContent = `${unlockedCount}/${totalLevels}`;
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
    const selectedLevelKey = getUserStorageKey("selectedLevel");
    localStorage.setItem(selectedLevelKey, levelFile);

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
        localStorage.removeItem(getUserStorageKey("saveData1"));
        localStorage.removeItem(getUserStorageKey("unlockedLevels"));
        localStorage.removeItem(getUserStorageKey("yyj_achievements_v1"));
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
    const unlockedLevelsKey = getUserStorageKey("unlockedLevels");
    const unlockedLevels = JSON.parse(
        localStorage.getItem(unlockedLevelsKey) || "[]"
    );
    const saveDataKey = getUserStorageKey("saveData1");
    const saveData = localStorage.getItem(saveDataKey);
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

// 一键解锁所有关卡
function unlockAllLevels() {
    if (confirm("确定要解锁所有关卡吗？这将跳过游戏进度直接解锁所有关卡。")) {
        const allLevels = Object.keys(levelConfig);

        // 更新localStorage
        const unlockedLevelsKey = getUserStorageKey("unlockedLevels");
        localStorage.setItem(unlockedLevelsKey, JSON.stringify(allLevels));

        // 更新当前配置
        allLevels.forEach(level => {
            if (levelConfig[level]) {
                levelConfig[level].unlocked = true;
            }
        });

        // 显示成功消息
        showMessage("所有关卡已解锁！", "success");

        // 更新界面显示
        updateLevelButtons();
        updateUnlockedCount();

        console.log("已解锁所有关卡:", allLevels);
    }
}

// 强制重置为只解锁第一关（调试用）
function resetToFirstLevel() {
    const unlockedLevelsKey = getUserStorageKey("unlockedLevels");
    localStorage.setItem(unlockedLevelsKey, JSON.stringify(["../map/jiaoxue1.json"]));
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

// 将调试函数暴露到全局作用域，方便调试
window.resetToFirstLevel = resetToFirstLevel;
window.testCSSLoading = testCSSLoading;

// 调试函数：检查当前滑动状态
// window.debugSliderState = function() {
//     console.log('=== 滑动状态调试 ===');
//     console.log('总关卡数:', totalLevels);
//     console.log('每页显示:', levelsPerPage);
//     console.log('总页数:', Math.ceil(totalLevels / levelsPerPage));
//     console.log('当前页索引:', currentLevelIndex);
//     console.log('指示器数量:', document.querySelectorAll('.indicator').length);
    
//     const indicators = document.querySelectorAll('.indicator');
//     indicators.forEach((indicator, index) => {
//         console.log(`指示器 ${index}: data-index="${indicator.dataset.index}", classList="${indicator.classList.toString()}"`);
//     });
// };

// 添加键盘快捷键支持
document.addEventListener("keydown", function (e) {
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
    const levelWidth = 180; // 缩小：每个关卡按钮的宽度 + 间距（从220改为180）
    
    // 修复：每页显示3个关卡，所以偏移量应该是3的倍数
    const offset = -currentLevelIndex * (levelWidth * levelsPerPage);
    
    // console.log(`滑动更新 - 当前页: ${currentLevelIndex}, 偏移量: ${offset}px, 每页关卡数: ${levelsPerPage}`);

    track.style.transform = `translateX(${offset}px)`;

    // 更新导航按钮状态
    const prevBtn = document.querySelector('.prev-button');
    const nextBtn = document.querySelector('.next-button');
    const maxIndex = Math.ceil(totalLevels / levelsPerPage) - 1;

    prevBtn.disabled = currentLevelIndex === 0;
    nextBtn.disabled = currentLevelIndex >= maxIndex;

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
    const maxIndex = Math.ceil(totalLevels / levelsPerPage) - 1;
    if (currentLevelIndex < maxIndex) {
        currentLevelIndex++;
        updateSlider();
    }
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    const totalPages = Math.ceil(totalLevels / levelsPerPage);
    
    indicators.forEach((indicator, index) => {
        const indicatorIndex = parseInt(indicator.dataset.index);
        
        // 当前页的指示器应该是active状态
        const isActive = indicatorIndex === currentLevelIndex;
        
        // 所有指示器都应该是visible状态
        const isVisible = true;
        
        indicator.classList.toggle('active', isActive);
        indicator.classList.toggle('visible', isVisible);
        
        // 调试信息
        // if (index === 0) {
        //     console.log(`更新指示器状态 - 当前页: ${currentLevelIndex}, 总页数: ${totalPages}, 指示器索引: ${indicatorIndex}, 是否激活: ${isActive}`);
        // }
    });
}

// 点击指示器跳转到对应关卡
function goToLevel(index) {
    const maxIndex = Math.ceil(totalLevels / levelsPerPage) - 1;
    if (index >= 0 && index <= maxIndex) {
        currentLevelIndex = index;
        updateSlider();
    }
}

// 添加触摸和鼠标拖动支持
function initTouchSupport() {
    const slider = document.querySelector('.level-slider');
    const track = document.getElementById('levelTrack');
    let startX = 0;
    let isDragging = false;
    let currentX = 0;
    let startTransform = 0;
    let isMouseDown = false;

    // 触摸事件
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        track.style.transition = 'none';
        slider.classList.add('dragging');
    });

    slider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const currentTouchX = e.touches[0].clientX;
        const diff = currentTouchX - startX;
        const levelWidth = 180; // 同步缩小触摸拖动的宽度
        const offset = -currentLevelIndex * (levelWidth * levelsPerPage) + diff;

        track.style.transform = `translateX(${offset}px)`;
    });

    slider.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        // 移除拖动状态
        slider.classList.remove('dragging');
        track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        if (Math.abs(diff) > 50) { // 最小滑动距离
            if (diff > 0) {
                // 向左滑动，显示下一组（需要检查是否已经是最后一页）
                const maxIndex = Math.ceil(totalLevels / levelsPerPage) - 1;
                if (currentLevelIndex < maxIndex) {
                    nextLevel();
                } else {
                    // 已经是最后一页，回弹
                    updateSlider();
                }
            } else {
                // 向右滑动，显示上一组（需要检查是否已经是第一页）
                if (currentLevelIndex > 0) {
                    previousLevel();
                } else {
                    // 已经是第一页，回弹
                    updateSlider();
                }
            }
        } else {
            // 回弹到原位置
            updateSlider();
        }
    });

    // 鼠标事件
    slider.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        isMouseDown = true;
        isDragging = true;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';

        // 添加拖动时的视觉反馈
        slider.style.cursor = 'grabbing';
        slider.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseDown || !isDragging) return;
        e.preventDefault();

        const currentMouseX = e.clientX;
        const diff = currentMouseX - startX;
        const levelWidth = 180; // 同步缩小鼠标拖动的宽度
        const offset = -currentLevelIndex * (levelWidth * levelsPerPage) + diff;

        track.style.transform = `translateX(${offset}px)`;
    });

    document.addEventListener('mouseup', (e) => {
        if (!isMouseDown || !isDragging) return;
        isMouseDown = false;
        isDragging = false;

        const endX = e.clientX;
        const diff = startX - endX;

        // 移除拖动状态
        slider.classList.remove('dragging');
        track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        track.style.cursor = 'grab';
        slider.style.cursor = 'grab';

        if (Math.abs(diff) > 50) { // 最小拖动距离
            if (diff > 0) {
                // 向左拖动，显示下一组（需要检查是否已经是最后一页）
                const maxIndex = Math.ceil(totalLevels / levelsPerPage) - 1;
                if (currentLevelIndex < maxIndex) {
                    nextLevel();
                } else {
                    // 已经是最后一页，回弹
                    updateSlider();
                }
            } else {
                // 向右拖动，显示上一组（需要检查是否已经是第一页）
                if (currentLevelIndex > 0) {
                    previousLevel();
                } else {
                    // 已经是第一页，回弹
                    updateSlider();
                }
            }
        } else {
            // 回弹到原位置
            updateSlider();
        }
    });

    // 防止在拖动时选中文本
    slider.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });

    // 设置初始光标样式
    slider.style.cursor = 'grab';
    track.style.cursor = 'grab';
}

// 页面加载时检查存档
window.addEventListener("load", () => {
    loadLevelsConfig(); // 加载关卡配置
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

// 监听窗口大小变化
window.addEventListener('resize', () => {
    updateSlider();
});
