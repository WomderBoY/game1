// 游戏环境对话框诊断脚本
console.log("🔍 游戏环境对话框诊断脚本已加载");

// 诊断函数
function diagnoseGameDialog() {
    console.clear();
    console.log("🔍 开始诊断游戏环境中的对话框...");

    // 1. 检查游戏对象
    console.log("1. 检查游戏对象:");
    if (typeof game === 'undefined') {
        console.log("❌ 游戏对象未定义");
        return;
    }
    console.log("✅ 游戏对象存在:", game);

    // 2. 检查对话框对象
    console.log("2. 检查对话框对象:");
    if (!game.dialog) {
        console.log("❌ 游戏对话框对象不存在");
        return;
    }
    console.log("✅ 对话框对象存在:", game.dialog);

    // 3. 检查对话框DOM元素
    console.log("3. 检查对话框DOM元素:");
    const dialogElement = game.dialog.dialog;
    if (!dialogElement) {
        console.log("❌ 对话框DOM元素不存在");
        return;
    }
    console.log("✅ 对话框DOM元素存在:", dialogElement);

    // 4. 检查对话框样式
    console.log("4. 检查对话框样式:");
    const computedStyle = window.getComputedStyle(dialogElement);
    console.log("   - display:", computedStyle.display);
    console.log("   - position:", computedStyle.position);
    console.log("   - z-index:", computedStyle.zIndex);
    console.log("   - background-image:", computedStyle.backgroundImage);
    console.log("   - background-size:", computedStyle.backgroundSize);
    console.log("   - background-position:", computedStyle.backgroundPosition);
    console.log("   - background-repeat:", computedStyle.backgroundRepeat);

    // 5. 检查对话框类名
    console.log("5. 检查对话框类名:");
    console.log("   - className:", dialogElement.className);
    console.log("   - classList:", dialogElement.classList.toString());
    console.log("   - has-bg类存在:", dialogElement.classList.contains("has-bg"));
    console.log("   - mysterious类存在:", dialogElement.classList.contains("mysterious"));
    console.log("   - system类存在:", dialogElement.classList.contains("system"));

    // 6. 检查对话框内容
    console.log("6. 检查对话框内容:");
    console.log("   - name元素:", game.dialog.name);
    console.log("   - name文本:", game.dialog.name ? game.dialog.name.textContent : "无");
    console.log("   - text元素:", game.dialog.text);
    console.log("   - text文本:", game.dialog.text ? game.dialog.text.textContent : "无");
    console.log("   - avatar元素:", game.dialog.avatar);
    console.log("   - avatar文本:", game.dialog.avatar ? game.dialog.avatar.textContent : "无");

    // 7. 检查内联样式
    console.log("7. 检查内联样式:");
    console.log("   - style.backgroundImage:", dialogElement.style.backgroundImage);
    console.log("   - style.backgroundSize:", dialogElement.style.backgroundSize);
    console.log("   - style.backgroundPosition:", dialogElement.style.backgroundPosition);
    console.log("   - style.backgroundRepeat:", dialogElement.style.backgroundRepeat);
    console.log("   - style.display:", dialogElement.style.display);
    console.log("   - style.zIndex:", dialogElement.style.zIndex);

    // 8. 检查CSS文件加载
    console.log("8. 检查CSS文件加载:");
    const stylesheets = document.styleSheets;
    let dialogCSSFound = false;
    for (let i = 0; i < stylesheets.length; i++) {
        const sheet = stylesheets[i];
        try {
            const href = sheet.href;
            if (href && href.includes('dialog-style.css')) {
                console.log("✅ 找到dialog-style.css:", href);
                dialogCSSFound = true;

                // 检查CSS规则
                const rules = sheet.cssRules || sheet.rules;
                console.log("   - CSS规则数量:", rules ? rules.length : 0);

                // 查找关键规则
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.selectorText && rule.selectorText.includes('.dialog-container')) {
                        console.log("   - 找到对话框规则:", rule.selectorText);
                    }
                }
                break;
            }
        } catch (e) {
            console.log("   - 无法访问样式表:", i);
        }
    }
    if (!dialogCSSFound) {
        console.log("❌ 未找到dialog-style.css");
    }

    // 9. 检查其他可能冲突的元素
    console.log("9. 检查其他可能冲突的元素:");
    const achievementToast = document.getElementById('achievement-toast');
    if (achievementToast) {
        const toastStyle = window.getComputedStyle(achievementToast);
        console.log("   - achievement-toast z-index:", toastStyle.zIndex);
        console.log("   - achievement-toast display:", toastStyle.display);
    }

    const pauseMenu = document.getElementById('pauseMenu');
    if (pauseMenu) {
        const menuStyle = window.getComputedStyle(pauseMenu);
        console.log("   - pauseMenu z-index:", menuStyle.zIndex);
        console.log("   - pauseMenu display:", menuStyle.display);
    }

    console.log("✅ 诊断完成！");
}

// 修复函数
function fixGameDialog() {
    console.log("🔧 开始修复游戏环境中的对话框...");

    if (!game || !game.dialog) {
        console.log("❌ 游戏或对话框对象不存在");
        return;
    }

    const dialog = game.dialog;
    const dialogElement = dialog.dialog;

    // 1. 强制设置z-index
    dialogElement.style.zIndex = "10002";
    console.log("✅ 设置z-index为10002");

    // 2. 强制设置背景图片
    dialogElement.style.backgroundImage = "url(../images/diagbg4.png)";
    dialogElement.style.backgroundSize = "cover";
    dialogElement.style.backgroundPosition = "center";
    dialogElement.style.backgroundRepeat = "no-repeat";
    dialogElement.classList.add("has-bg");
    console.log("✅ 强制设置背景图片");

    // 3. 强制设置主题类
    dialogElement.classList.remove("system", "player", "npc", "boss", "mysterious");
    dialogElement.classList.add("mysterious");
    console.log("✅ 强制设置主题类");

    // 4. 强制设置名称样式
    if (dialog.name) {
        dialog.name.textContent = "旁白";
        dialog.name.style.color = "#330066";
        dialog.name.style.fontSize = "22px";
        dialog.name.style.fontWeight = "bold";
        console.log("✅ 强制设置名称样式");
    }

    // 5. 强制设置头像样式
    if (dialog.avatar) {
        dialog.avatar.textContent = "🔮";
        dialog.avatar.style.background = "linear-gradient(145deg,rgb(255, 230, 154),rgb(255, 223, 84))";
        dialog.avatar.style.border = "2px solid rgba(77, 60, 21, 0.6)";
        console.log("✅ 强制设置头像样式");
    }

    // 6. 强制显示对话框
    dialogElement.style.display = "block";
    dialogElement.style.visibility = "visible";
    dialogElement.style.opacity = "1";
    console.log("✅ 强制显示对话框");

    console.log("✅ 修复完成！");
}

// 测试函数
function testGameDialog() {
    console.log("🧪 测试游戏环境中的对话框...");

    if (!game || !game.dialog) {
        console.log("❌ 游戏或对话框对象不存在");
        return;
    }

    // 显示测试对话框
    game.dialog.prints(["【系统】这是一个测试系统对话框，应该显示为旁白样式"]);

    // 延迟检查结果
    setTimeout(() => {
        console.log("📋 测试结果检查:");
        const dialogElement = game.dialog.dialog;
        const computedStyle = window.getComputedStyle(dialogElement);

        console.log("   - 显示状态:", computedStyle.display);
        console.log("   - 背景图片:", computedStyle.backgroundImage);
        console.log("   - 名称文本:", game.dialog.name.textContent);
        console.log("   - 头像文本:", game.dialog.avatar.textContent);
        console.log("   - 主题类:", dialogElement.classList.toString());

        if (computedStyle.backgroundImage !== "none" &&
            game.dialog.name.textContent === "旁白" &&
            game.dialog.avatar.textContent === "🔮") {
            console.log("✅ 测试成功！对话框显示正常");
        } else {
            console.log("❌ 测试失败！对话框显示异常");
        }
    }, 1000);
}

// 导出函数到全局
window.diagnoseGameDialog = diagnoseGameDialog;
window.fixGameDialog = fixGameDialog;
window.testGameDialog = testGameDialog;

// 测试关卡切换后的对话框
function testLevelSwitchDialog() {
    console.log("🧪 测试关卡切换后的对话框...");

    if (!game || !game.dialog) {
        console.log("❌ 游戏或对话框对象不存在");
        return;
    }

    // 模拟关卡切换后的对话框显示
    console.log("1. 模拟关卡切换后的对话框显示...");
    game.dialog.prints(["【系统】这是关卡切换后的测试对话框，应该显示为旁白样式"]);

    // 延迟检查结果
    setTimeout(() => {
        console.log("📋 关卡切换测试结果检查:");
        const dialogElement = game.dialog.dialog;
        const computedStyle = window.getComputedStyle(dialogElement);

        console.log("   - 显示状态:", computedStyle.display);
        console.log("   - 背景图片:", computedStyle.backgroundImage);
        console.log("   - 名称文本:", game.dialog.name.textContent);
        console.log("   - 头像文本:", game.dialog.avatar.textContent);
        console.log("   - 主题类:", dialogElement.classList.toString());

        if (computedStyle.backgroundImage !== "none" &&
            game.dialog.name.textContent === "旁白" &&
            game.dialog.avatar.textContent === "🔮") {
            console.log("✅ 关卡切换测试成功！对话框显示正常");
        } else {
            console.log("❌ 关卡切换测试失败！对话框显示异常");
        }
    }, 1000);
}

// 测试玩家对话框是否已改为旁白
function testPlayerDialogFixed() {
    console.log("🧪 测试玩家对话框是否已改为旁白...");

    if (!game || !game.dialog) {
        console.log("❌ 游戏或对话框对象不存在");
        return;
    }

    // 测试玩家对话框
    console.log("1. 测试玩家对话框...");
    game.dialog.prints(["【玩家】这是玩家对话框，现在应该显示为旁白样式"]);

    // 延迟检查结果
    setTimeout(() => {
        console.log("📋 玩家对话框测试结果检查:");
        const dialogElement = game.dialog.dialog;
        const computedStyle = window.getComputedStyle(dialogElement);

        console.log("   - 显示状态:", computedStyle.display);
        console.log("   - 背景图片:", computedStyle.backgroundImage);
        console.log("   - 名称文本:", game.dialog.name.textContent);
        console.log("   - 头像文本:", game.dialog.avatar.textContent);
        console.log("   - 主题类:", dialogElement.classList.toString());

        if (game.dialog.name.textContent === "旁白" &&
            game.dialog.avatar.textContent === "🔮") {
            console.log("✅ 玩家对话框修复成功！现在显示为旁白样式");
        } else {
            console.log("❌ 玩家对话框修复失败！仍然显示异常");
        }
    }, 1000);
}

// 导出新函数到全局
window.testLevelSwitchDialog = testLevelSwitchDialog;
window.testPlayerDialogFixed = testPlayerDialogFixed;

// 测试传送门对话框
function testPortalDialog() {
    console.log("🧪 测试传送门对话框...");

    if (!game || !game.dialog) {
        console.log("❌ 游戏或对话框对象不存在");
        return;
    }

    // 模拟传送门对话框
    console.log("1. 模拟传送门对话框...");
    game.dialog.prints(["这是传送门"]);

    // 延迟检查结果
    setTimeout(() => {
        console.log("📋 传送门对话框测试结果检查:");
        const dialogElement = game.dialog.dialog;
        const computedStyle = window.getComputedStyle(dialogElement);

        console.log("   - 显示状态:", computedStyle.display);
        console.log("   - 背景图片:", computedStyle.backgroundImage);
        console.log("   - 名称文本:", game.dialog.name.textContent);
        console.log("   - 头像文本:", game.dialog.avatar.textContent);
        console.log("   - 对话文本:", game.dialog.text.textContent);
        console.log("   - 主题类:", dialogElement.classList.toString());

        if (game.dialog.text.textContent === "这是传送门" &&
            game.dialog.name.textContent === "旁白" &&
            game.dialog.avatar.textContent === "🔮") {
            console.log("✅ 传送门对话框测试成功！文字显示正常");
        } else {
            console.log("❌ 传送门对话框测试失败！文字显示异常");
        }
    }, 1000);
}

// 测试传送门对话框的第二句话
function testPortalDialog2() {
    console.log("🧪 测试传送门对话框第二句话...");

    if (!game || !game.dialog) {
        console.log("❌ 游戏或对话框对象不存在");
        return;
    }

    // 模拟传送门对话框第二句话
    console.log("1. 模拟传送门对话框第二句话...");
    game.dialog.prints(["将你传送到下一关"]);

    // 延迟检查结果
    setTimeout(() => {
        console.log("📋 传送门对话框第二句话测试结果检查:");
        const dialogElement = game.dialog.dialog;
        const computedStyle = window.getComputedStyle(dialogElement);

        console.log("   - 显示状态:", computedStyle.display);
        console.log("   - 背景图片:", computedStyle.backgroundImage);
        console.log("   - 名称文本:", game.dialog.name.textContent);
        console.log("   - 头像文本:", game.dialog.avatar.textContent);
        console.log("   - 对话文本:", game.dialog.text.textContent);
        console.log("   - 主题类:", dialogElement.classList.toString());

        if (game.dialog.text.textContent === "将你传送到下一关" &&
            game.dialog.name.textContent === "旁白" &&
            game.dialog.avatar.textContent === "🔮") {
            console.log("✅ 传送门对话框第二句话测试成功！文字显示正常");
        } else {
            console.log("❌ 传送门对话框第二句话测试失败！文字显示异常");
        }
    }, 1000);
}

// 导出新函数到全局
window.testPortalDialog = testPortalDialog;
window.testPortalDialog2 = testPortalDialog2;

// 详细诊断传送门对话框问题
function diagnosePortalDialog() {
    console.log("🔍 详细诊断传送门对话框问题...");

    if (!game || !game.dialog) {
        console.log("❌ 游戏或对话框对象不存在");
        return;
    }

    console.log("1. 检查CGManager:");
    console.log("   - CGManager存在:", !!game.cgmanager);
    console.log("   - CGManager的dialog引用:", game.cgmanager ? game.cgmanager.dialog : "无");
    console.log("   - CGManager的game.dialog引用:", game.cgmanager ? game.cgmanager.game.dialog : "无");

    console.log("2. 检查对话框对象:");
    console.log("   - game.dialog存在:", !!game.dialog);
    console.log("   - dialog.prints方法存在:", typeof game.dialog.prints);
    console.log("   - dialog.text元素存在:", !!game.dialog.text);
    console.log("   - dialog.name元素存在:", !!game.dialog.name);
    console.log("   - dialog.avatar元素存在:", !!game.dialog.avatar);

    console.log("3. 测试直接调用对话框:");
    try {
        game.dialog.prints(["测试文本"]);
        console.log("   ✅ 直接调用对话框成功");
    } catch (error) {
        console.log("   ❌ 直接调用对话框失败:", error);
    }

    console.log("4. 检查地图数据:");
    // 这里可以添加检查地图数据的代码

    console.log("✅ 诊断完成！");
}

// 模拟CGManager调用
function simulateCGManagerCall() {
    console.log("🧪 模拟CGManager调用传送门对话框...");

    if (!game || !game.cgmanager) {
        console.log("❌ 游戏或CGManager对象不存在");
        return;
    }

    // 模拟CGManager的调用方式
    const mockEvent = {
        images: ["../images/black-right2-0.png"],
        text: [
            ["这是传送门"],
            ["将你传送到下一关"]
        ]
    };

    console.log("模拟事件数据:", mockEvent);
    game.cgmanager.play(mockEvent);
}

// 导出新函数到全局
window.diagnosePortalDialog = diagnosePortalDialog;
window.simulateCGManagerCall = simulateCGManagerCall;

console.log("🎯 可用函数:");
console.log("- diagnoseGameDialog(): 诊断游戏环境中的对话框");
console.log("- fixGameDialog(): 修复游戏环境中的对话框");
console.log("- testGameDialog(): 测试游戏环境中的对话框");
console.log("- testLevelSwitchDialog(): 测试关卡切换后的对话框");
console.log("- testPlayerDialogFixed(): 测试玩家对话框是否已改为旁白");
console.log("- testPortalDialog(): 测试传送门对话框");
console.log("- testPortalDialog2(): 测试传送门对话框第二句话");
console.log("- diagnosePortalDialog(): 详细诊断传送门对话框问题");
console.log("- simulateCGManagerCall(): 模拟CGManager调用传送门对话框");
