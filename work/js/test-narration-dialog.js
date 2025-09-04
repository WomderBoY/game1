// 测试旁白对话框
// 用于验证系统对话框是否正确显示为旁白样式

function testNarrationDialog() {
    console.log("开始测试旁白对话框...");

    if (typeof game === 'undefined' || !game.dialog) {
        console.log("❌ 游戏实例或对话框未找到！");
        return;
    }

    const dialog = game.dialog;

    try {
        // 测试系统对话框（应该显示为旁白）
        dialog.prints(["【系统】这是一个系统对话框，应该显示为旁白样式"]);

        console.log("✅ 系统对话框测试已启动！");
        console.log("检查项目:");
        console.log("1. 显示名称是否为'旁白'");
        console.log("2. 背景图片是否显示（diagbg1.png）");
        console.log("3. 紫色主题是否正确");
        console.log("4. 水晶球图标是否显示");
        console.log("5. 文字颜色是否为深紫色");

    } catch (error) {
        console.log("❌ 测试时出错:", error);
    }
}

// 直接测试对话框设置
function testDirectDialog() {
    console.log("开始直接测试对话框设置...");

    if (typeof game === 'undefined' || !game.dialog) {
        console.log("❌ 游戏实例或对话框未找到！");
        return;
    }

    const dialog = game.dialog;

    try {
        // 直接设置系统对话框
        dialog.name.textContent = "系统";
        dialog.text.textContent = "测试系统对话框显示为旁白样式";

        console.log("设置前 - name.textContent:", dialog.name.textContent);
        console.log("设置前 - dialog.classList:", dialog.dialog.classList.toString());
        console.log("设置前 - backgroundImage:", dialog.dialog.style.backgroundImage);

        // 使用setDialogThemeBySpeaker方法
        dialog.setDialogThemeBySpeaker("系统");

        console.log("设置后 - name.textContent:", dialog.name.textContent);
        console.log("设置后 - dialog.classList:", dialog.dialog.classList.toString());
        console.log("设置后 - backgroundImage:", dialog.dialog.style.backgroundImage);
        console.log("设置后 - has-bg类存在:", dialog.dialog.classList.contains("has-bg"));

        // 显示对话框
        dialog.open();

        console.log("✅ 直接测试已启动！");
        console.log("检查项目:");
        console.log("1. 显示名称是否为'旁白'");
        console.log("2. 背景图片是否显示");
        console.log("3. 主题样式是否正确");

        // 5秒后关闭
        setTimeout(() => {
            dialog.close();
            console.log("测试完成，对话框已关闭");
        }, 5000);

    } catch (error) {
        console.log("❌ 直接测试时出错:", error);
    }
}

// 等待游戏初始化完成
function waitForGameInit() {
    return new Promise((resolve) => {
        const checkGame = () => {
            if (typeof game !== 'undefined' &&
                game.dialog &&
                game.dialog.name &&
                game.dialog.text &&
                game.dialog.avatar) {
                console.log("✅ 游戏初始化完成！");
                resolve();
            } else {
                console.log("⏳ 等待游戏初始化...");
                setTimeout(checkGame, 100);
            }
        };
        checkGame();
    });
}

// 自动测试函数
async function autoTestDirectDialog() {
    console.log("等待游戏初始化...");
    await waitForGameInit();
    console.log("开始自动测试对话框设置");
    testDirectDialog();
}

// 检查游戏状态
function checkGameStatus() {
    console.log("=== 游戏状态检查 ===");
    console.log("game对象存在:", typeof game !== 'undefined');

    if (typeof game !== 'undefined') {
        console.log("game.dialog存在:", !!game.dialog);

        if (game.dialog) {
            console.log("game.dialog.name存在:", !!game.dialog.name);
            console.log("game.dialog.text存在:", !!game.dialog.text);
            console.log("game.dialog.avatar存在:", !!game.dialog.avatar);
            console.log("game.dialog.dialog存在:", !!game.dialog.dialog);
        }
    }

    console.log("==================");
}

// 简单测试函数
function simpleTest() {
    console.log("开始简单测试...");

    if (typeof game === 'undefined') {
        console.log("❌ game对象未找到！");
        console.log("请等待页面完全加载后再测试");
        return;
    }

    if (!game.dialog) {
        console.log("❌ game.dialog未找到！");
        console.log("游戏可能还在初始化中");
        return;
    }

    console.log("✅ game.dialog存在！");

    // 逐步测试每个组件
    try {
        console.log("步骤1: 设置name元素...");
        game.dialog.name.textContent = "系统";
        console.log("name设置完成:", game.dialog.name.textContent);

        console.log("步骤2: 设置text元素...");
        game.dialog.text.textContent = "测试系统对话框显示为旁白样式";
        console.log("text设置完成:", game.dialog.text.textContent);

        console.log("步骤3: 调用setDialogThemeBySpeaker...");
        game.dialog.setDialogThemeBySpeaker("系统");
        console.log("setDialogThemeBySpeaker完成");

        console.log("步骤4: 检查设置结果...");
        console.log("显示名称:", game.dialog.name.textContent);
        console.log("CSS类:", game.dialog.dialog.classList.toString());
        console.log("背景图片:", game.dialog.dialog.style.backgroundImage);
        console.log("has-bg类存在:", game.dialog.dialog.classList.contains("has-bg"));

        console.log("步骤5: 显示对话框...");
        game.dialog.open();
        console.log("✅ 对话框已显示！");

    } catch (error) {
        console.log("❌ 测试出错:", error);
        console.log("错误堆栈:", error.stack);
    }
}

// 测试背景图片路径
function testBackgroundImage() {
    console.log("测试背景图片路径...");

    const img = new Image();

    img.onload = function () {
        console.log("✅ 背景图片加载成功: ../images/diagbg1.png");
        console.log(`图片尺寸: ${img.width} x ${img.height}`);
    };

    img.onerror = function () {
        console.log("❌ 背景图片加载失败: ../images/diagbg1.png");
        console.log("请检查图片路径是否正确");
    };

    img.src = "../images/diagbg1.png";
}

// 直接设置对话框
function directSetDialog() {
    console.log("直接设置对话框...");

    if (typeof game === 'undefined') {
        console.log("❌ game对象未找到！");
        return;
    }

    if (!game.dialog) {
        console.log("❌ game.dialog未找到！");
        console.log("尝试等待游戏初始化...");

        // 等待一下再试
        setTimeout(() => {
            if (game.dialog) {
                console.log("✅ 游戏初始化完成，重新尝试...");
                directSetDialog();
            } else {
                console.log("❌ 游戏仍未初始化完成");
            }
        }, 1000);
        return;
    }

    try {
        console.log("开始直接设置对话框属性...");

        // 直接设置所有属性
        game.dialog.name.textContent = "旁白";
        console.log("✅ 设置显示名称为'旁白'");

        game.dialog.text.textContent = "直接设置测试";
        console.log("✅ 设置文本内容");

        game.dialog.dialog.classList.remove("system", "player", "npc", "boss", "mysterious");
        game.dialog.dialog.classList.add("mysterious");
        console.log("✅ 设置CSS类为mysterious");

        game.dialog.dialog.style.backgroundImage = "url(../images/diagbg1.png)";
        game.dialog.dialog.classList.add("has-bg");
        console.log("✅ 设置背景图片");

        game.dialog.avatar.textContent = "🔮";
        console.log("✅ 设置头像图标");

        game.dialog.open();
        console.log("✅ 显示对话框");

        console.log("=== 最终检查 ===");
        console.log("显示名称:", game.dialog.name.textContent);
        console.log("CSS类:", game.dialog.dialog.classList.toString());
        console.log("背景图片:", game.dialog.dialog.style.backgroundImage);
        console.log("has-bg类存在:", game.dialog.dialog.classList.contains("has-bg"));

    } catch (error) {
        console.log("❌ 直接设置出错:", error);
        console.log("错误堆栈:", error.stack);
    }
}

// 直接DOM操作修复
function directDOMFix() {
    console.log("=== 直接DOM操作修复 ===");

    // 先检查所有可能的对话框元素
    console.log("检查所有对话框相关元素...");
    const allDialogs = document.querySelectorAll('[class*="dialog"]');
    console.log("找到的对话框元素数量:", allDialogs.length);

    allDialogs.forEach((el, index) => {
        console.log(`元素${index}:`, el.className, el.tagName);
    });

    // 尝试多种选择器
    let dialogElement = document.querySelector('.dialog-container');
    if (!dialogElement) {
        dialogElement = document.querySelector('[class*="dialog"]');
    }
    if (!dialogElement) {
        dialogElement = document.querySelector('.dialog');
    }

    if (!dialogElement) {
        console.log("❌ 找不到对话框元素");
        console.log("尝试查找所有包含'dialog'的元素...");
        const allElements = document.querySelectorAll('*');
        for (let el of allElements) {
            if (el.className && el.className.includes('dialog')) {
                console.log("找到可能的对话框元素:", el.className, el);
                dialogElement = el;
                break;
            }
        }
    }

    if (!dialogElement) {
        console.log("❌ 仍然找不到对话框元素");
        return;
    }

    console.log("找到对话框元素:", dialogElement.className);

    // 查找子元素
    const nameElement = dialogElement.querySelector('.dialog-name') ||
        dialogElement.querySelector('[class*="name"]') ||
        dialogElement.querySelector('span') ||
        dialogElement.querySelector('div');

    const textElement = dialogElement.querySelector('.dialog-text') ||
        dialogElement.querySelector('[class*="text"]') ||
        dialogElement.querySelector('p');

    const avatarElement = dialogElement.querySelector('.dialog-avatar') ||
        dialogElement.querySelector('[class*="avatar"]');

    console.log("找到的元素:");
    console.log("- 名称元素:", nameElement ? nameElement.className : "未找到");
    console.log("- 文本元素:", textElement ? textElement.className : "未找到");
    console.log("- 头像元素:", avatarElement ? avatarElement.className : "未找到");

    // 1. 强制设置显示名称
    if (nameElement) {
        nameElement.textContent = "旁白";
        nameElement.style.color = "#330066";
        nameElement.style.fontSize = "22px";
        nameElement.style.fontWeight = "bold";
        console.log("✅ 设置显示名称和样式");
    } else {
        console.log("❌ 未找到名称元素");
    }

    // 2. 强制设置文本内容
    if (textElement) {
        textElement.textContent = "直接DOM修复测试 - 旁白对话框";
        console.log("✅ 设置文本内容");
    } else {
        console.log("❌ 未找到文本元素");
    }

    // 3. 强制设置头像
    if (avatarElement) {
        avatarElement.textContent = "🔮";
        avatarElement.style.background = "linear-gradient(145deg, #9666ff, #7744ff)";
        avatarElement.style.border = "2px solid rgba(150, 100, 255, 0.6)";
        console.log("✅ 设置头像");
    } else {
        console.log("❌ 未找到头像元素");
    }

    // 4. 强制设置对话框样式
    dialogElement.className = "dialog-container mysterious has-bg";
    dialogElement.style.background = "url(../images/diagbg1.png)";
    dialogElement.style.backgroundSize = "cover";
    dialogElement.style.backgroundPosition = "center";
    dialogElement.style.backgroundRepeat = "no-repeat";
    dialogElement.style.border = "2px solid rgba(150, 100, 255, 0.6)";
    dialogElement.style.borderRadius = "20px";
    dialogElement.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(150, 100, 255, 0.3)";
    dialogElement.style.display = "block";
    dialogElement.style.opacity = "1";
    dialogElement.style.visibility = "visible";
    console.log("✅ 设置对话框样式");

    // 5. 最终验证
    setTimeout(() => {
        console.log("=== 最终验证 ===");
        console.log("显示名称:", nameElement ? nameElement.textContent : "未找到");
        console.log("文本内容:", textElement ? textElement.textContent : "未找到");
        console.log("CSS类:", dialogElement.className);
        console.log("背景图片:", dialogElement.style.background);
        console.log("显示状态:", dialogElement.style.display);
        console.log("✅ 直接DOM修复完成！");
    }, 100);
}

// 终极修复方案
function ultimateFix() {
    console.log("=== 终极修复方案 ===");

    if (typeof game === 'undefined' || !game.dialog) {
        console.log("❌ 游戏未准备好");
        return;
    }

    const dialog = game.dialog;
    const dialogElement = dialog.dialog;
    const nameElement = dialog.name;
    const textElement = dialog.text;
    const avatarElement = dialog.avatar;

    console.log("开始终极修复...");

    // 1. 强制设置显示名称
    nameElement.textContent = "旁白";
    nameElement.style.color = "#330066";
    nameElement.style.fontSize = "22px";
    console.log("✅ 设置显示名称和样式");

    // 2. 强制设置文本内容
    textElement.textContent = "终极修复测试 - 旁白对话框";
    console.log("✅ 设置文本内容");

    // 3. 强制设置头像
    avatarElement.textContent = "🔮";
    avatarElement.style.background = "linear-gradient(145deg, #9666ff, #7744ff)";
    console.log("✅ 设置头像");

    // 4. 强制设置对话框样式
    dialogElement.className = "dialog-container mysterious has-bg";
    dialogElement.style.background = "url(../images/diagbg1.png)";
    dialogElement.style.backgroundSize = "cover";
    dialogElement.style.backgroundPosition = "center";
    dialogElement.style.backgroundRepeat = "no-repeat";
    dialogElement.style.border = "2px solid rgba(150, 100, 255, 0.6)";
    dialogElement.style.borderRadius = "20px";
    dialogElement.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(150, 100, 255, 0.3)";
    console.log("✅ 设置对话框样式");

    // 5. 显示对话框
    dialogElement.style.display = "block";
    dialogElement.style.opacity = "1";
    dialogElement.style.visibility = "visible";
    console.log("✅ 显示对话框");

    // 6. 最终验证
    setTimeout(() => {
        console.log("=== 最终验证 ===");
        console.log("显示名称:", nameElement.textContent);
        console.log("文本内容:", textElement.textContent);
        console.log("CSS类:", dialogElement.className);
        console.log("背景图片:", dialogElement.style.background);
        console.log("显示状态:", dialogElement.style.display);
        console.log("✅ 终极修复完成！");
    }, 100);
}

// 强制修复对话框
function forceFixDialog() {
    console.log("=== 强制修复对话框 ===");

    if (typeof game === 'undefined') {
        console.log("❌ game对象未找到");
        return;
    }

    if (!game.dialog) {
        console.log("❌ game.dialog未找到");
        return;
    }

    const dialog = game.dialog;

    console.log("开始强制修复...");

    // 直接操作DOM元素
    const dialogElement = dialog.dialog;
    const nameElement = dialog.name;
    const textElement = dialog.text;
    const avatarElement = dialog.avatar;

    // 强制设置显示名称
    nameElement.textContent = "旁白";
    console.log("✅ 设置显示名称为'旁白'");

    // 强制设置文本内容
    textElement.textContent = "强制修复测试 - 旁白对话框";
    console.log("✅ 设置文本内容");

    // 强制设置CSS类和样式
    dialogElement.className = "dialog-container mysterious has-bg";
    dialogElement.style.backgroundImage = "url(../images/diagbg1.png)";
    dialogElement.style.backgroundSize = "cover";
    dialogElement.style.backgroundPosition = "center";
    dialogElement.style.backgroundRepeat = "no-repeat";
    console.log("✅ 设置CSS类和背景图片");

    // 强制设置头像
    avatarElement.textContent = "🔮";
    console.log("✅ 设置头像图标");

    // 显示对话框
    dialogElement.style.display = "block";
    dialogElement.classList.add("show");
    dialogElement.classList.remove("hide");
    console.log("✅ 显示对话框");

    console.log("=== 最终检查 ===");
    console.log("显示名称:", nameElement.textContent);
    console.log("文本内容:", textElement.textContent);
    console.log("CSS类:", dialogElement.className);
    console.log("背景图片:", dialogElement.style.backgroundImage);
    console.log("has-bg类:", dialogElement.classList.contains("has-bg"));
    console.log("显示状态:", dialogElement.style.display);

    console.log("✅ 强制修复完成！");
}

// 详细诊断
function diagnoseDialog() {
    console.log("=== 详细诊断对话框 ===");

    if (typeof game === 'undefined' || !game.dialog) {
        console.log("❌ 游戏未初始化");
        return;
    }

    const dialog = game.dialog;

    console.log("1. 检查对话框元素:");
    console.log("   - dialog.dialog存在:", !!dialog.dialog);
    console.log("   - dialog.name存在:", !!dialog.name);
    console.log("   - dialog.text存在:", !!dialog.text);
    console.log("   - dialog.avatar存在:", !!dialog.avatar);

    console.log("2. 当前状态:");
    console.log("   - 显示名称:", dialog.name.textContent);
    console.log("   - 文本内容:", dialog.text.textContent);
    console.log("   - CSS类:", dialog.dialog.className);
    console.log("   - 背景图片:", dialog.dialog.style.backgroundImage);
    console.log("   - has-bg类:", dialog.dialog.classList.contains("has-bg"));

    console.log("3. 尝试修复:");

    // 强制设置所有属性
    dialog.name.textContent = "旁白";
    dialog.text.textContent = "诊断测试";
    dialog.dialog.className = "dialog-container mysterious has-bg";
    dialog.dialog.style.backgroundImage = "url(../images/diagbg1.png)";
    dialog.dialog.style.backgroundSize = "cover";
    dialog.dialog.style.backgroundPosition = "center";
    dialog.dialog.style.backgroundRepeat = "no-repeat";
    dialog.avatar.textContent = "🔮";

    console.log("4. 修复后状态:");
    console.log("   - 显示名称:", dialog.name.textContent);
    console.log("   - CSS类:", dialog.dialog.className);
    console.log("   - 背景图片:", dialog.dialog.style.backgroundImage);
    console.log("   - has-bg类:", dialog.dialog.classList.contains("has-bg"));

    dialog.open();
    console.log("✅ 诊断完成，对话框已显示");
}

// 等待并测试
function waitAndTest() {
    console.log("等待游戏初始化...");

    const checkGame = () => {
        if (typeof game !== 'undefined' && game.dialog) {
            console.log("✅ 游戏已初始化完成！");
            forceFixDialog();
        } else {
            console.log("⏳ 等待中...");
            setTimeout(checkGame, 500);
        }
    };

    checkGame();
}

// 简单直接测试
function quickTest() {
    console.log("快速测试...");

    if (typeof game === 'undefined' || !game.dialog) {
        console.log("❌ 游戏未准备好，请等待页面完全加载");
        return;
    }

    console.log("✅ 游戏已准备好，开始测试");

    // 直接设置
    game.dialog.name.textContent = "旁白";
    game.dialog.text.textContent = "快速测试";
    game.dialog.dialog.className = "dialog-container mysterious has-bg";
    game.dialog.dialog.style.backgroundImage = "url(../images/diagbg1.png)";
    game.dialog.avatar.textContent = "🔮";
    game.dialog.open();

    console.log("✅ 快速测试完成！");
    console.log("显示名称:", game.dialog.name.textContent);
    console.log("CSS类:", game.dialog.dialog.className);
    console.log("背景图片:", game.dialog.dialog.style.backgroundImage);
}

// 简单诊断函数
function simpleDiagnose() {
    console.log("=== 简单诊断 ===");

    try {
        console.log("1. 检查所有元素...");
        const allElements = document.querySelectorAll('*');
        console.log("页面总元素数量:", allElements.length);

        console.log("2. 查找包含'dialog'的元素...");
        let dialogElements = [];
        for (let el of allElements) {
            if (el.className && el.className.toString().includes('dialog')) {
                dialogElements.push(el);
            }
        }
        console.log("找到的对话框元素数量:", dialogElements.length);

        if (dialogElements.length > 0) {
            dialogElements.forEach((el, index) => {
                console.log(`对话框${index}:`, el.className, el.tagName);
                console.log("  - 子元素数量:", el.children.length);
                for (let child of el.children) {
                    console.log("    - 子元素:", child.className, child.tagName, child.textContent?.substring(0, 20));
                }
            });
        }

        console.log("3. 查找所有div元素...");
        const allDivs = document.querySelectorAll('div');
        console.log("div元素数量:", allDivs.length);

        console.log("4. 查找所有span元素...");
        const allSpans = document.querySelectorAll('span');
        console.log("span元素数量:", allSpans.length);

        console.log("5. 查找所有p元素...");
        const allPs = document.querySelectorAll('p');
        console.log("p元素数量:", allPs.length);

    } catch (error) {
        console.log("❌ 诊断出错:", error);
    }
}

// 检查CSS文件加载
function checkCSS() {
    console.log("=== 检查CSS文件 ===");

    // 检查dialog-style.css是否加载
    const stylesheets = document.styleSheets;
    console.log("页面样式表数量:", stylesheets.length);

    for (let i = 0; i < stylesheets.length; i++) {
        const sheet = stylesheets[i];
        try {
            const href = sheet.href;
            if (href && href.includes('dialog-style.css')) {
                console.log("✅ 找到dialog-style.css:", href);

                // 检查CSS规则
                const rules = sheet.cssRules || sheet.rules;
                console.log("CSS规则数量:", rules.length);

                // 查找关键规则
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.selectorText && rule.selectorText.includes('dialog-container')) {
                        console.log("找到对话框规则:", rule.selectorText);
                    }
                }
            }
        } catch (e) {
            console.log("无法访问样式表", i, ":", e.message);
        }
    }
}

// 直接操作CSS样式
function directCSSFix() {
    console.log("=== 直接CSS修复 ===");

    try {
        // 查找对话框元素
        const dialogElement = document.querySelector('.dialog-container');
        if (!dialogElement) {
            console.log("❌ 找不到对话框元素");
            return;
        }

        console.log("找到对话框元素:", dialogElement.className);

        // 直接添加CSS样式到页面
        const style = document.createElement('style');
        style.textContent = `
            .dialog-container.mysterious {
                border-color: rgba(150, 100, 255, 0.6) !important;
                background: linear-gradient(145deg, rgba(30, 20, 40, 0.95), rgba(50, 30, 60, 0.95)) !important;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(150, 100, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
            }
            .dialog-container.mysterious.has-bg {
                background: url(../images/diagbg1.png) !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
            }
            .dialog-container.mysterious .dialog-name {
                color: #330066 !important;
                font-size: 22px !important;
                text-shadow: 0 2px 4px rgba(150, 100, 255, 0.3) !important;
            }
            .dialog-container.mysterious .dialog-avatar {
                background: linear-gradient(145deg, #9666ff, #7744ff) !important;
                border-color: rgba(150, 100, 255, 0.6) !important;
                box-shadow: 0 4px 8px rgba(150, 100, 255, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
        console.log("✅ 添加了CSS样式");

        // 设置对话框类名和属性
        dialogElement.className = "dialog-container mysterious has-bg";
        dialogElement.style.background = "url(../images/diagbg1.png)";
        dialogElement.style.backgroundSize = "cover";
        dialogElement.style.backgroundPosition = "center";
        dialogElement.style.backgroundRepeat = "no-repeat";

        // 查找并设置名称元素
        const nameElement = dialogElement.querySelector('.dialog-name');
        if (nameElement) {
            nameElement.textContent = "旁白";
            nameElement.style.color = "#330066";
            nameElement.style.fontSize = "22px";
            nameElement.style.fontWeight = "bold";
            console.log("✅ 设置名称元素");
        }

        // 查找并设置头像元素
        const avatarElement = dialogElement.querySelector('.dialog-avatar');
        if (avatarElement) {
            avatarElement.textContent = "🔮";
            avatarElement.style.background = "linear-gradient(145deg, #9666ff, #7744ff)";
            avatarElement.style.border = "2px solid rgba(150, 100, 255, 0.6)";
            console.log("✅ 设置头像元素");
        }

        console.log("✅ 直接CSS修复完成！");

    } catch (error) {
        console.log("❌ 直接CSS修复出错:", error);
    }
}

// 超简单修复方案
function superSimpleFix() {
    console.log("=== 超简单修复方案 ===");

    try {
        // 查找所有div元素
        const allDivs = document.querySelectorAll('div');
        console.log("找到div元素数量:", allDivs.length);

        // 查找对话框元素（通过位置和样式特征）
        let dialogElement = null;
        for (let div of allDivs) {
            const style = window.getComputedStyle(div);
            if (style.position === 'fixed' &&
                style.bottom &&
                style.left &&
                style.transform &&
                style.transform.includes('translateX')) {
                dialogElement = div;
                console.log("找到对话框元素:", div.className);
                break;
            }
        }

        if (!dialogElement) {
            console.log("❌ 找不到对话框元素");
            return;
        }

        // 直接设置背景图片
        dialogElement.style.background = "url(../images/diagbg1.png)";
        dialogElement.style.backgroundSize = "cover";
        dialogElement.style.backgroundPosition = "center";
        dialogElement.style.backgroundRepeat = "no-repeat";
        console.log("✅ 设置背景图片");

        // 查找并设置名称元素
        const allElements = dialogElement.querySelectorAll('*');
        for (let el of allElements) {
            if (el.tagName === 'H3' || el.className.includes('name')) {
                el.textContent = "旁白";
                el.style.color = "#330066";
                el.style.fontSize = "22px";
                el.style.fontWeight = "bold";
                console.log("✅ 设置名称元素:", el.className);
                break;
            }
        }

        // 查找并设置头像元素
        for (let el of allElements) {
            if (el.className.includes('avatar') || el.style.borderRadius === '50%') {
                el.textContent = "🔮";
                el.style.background = "linear-gradient(145deg, #9666ff, #7744ff)";
                el.style.border = "2px solid rgba(150, 100, 255, 0.6)";
                console.log("✅ 设置头像元素:", el.className);
                break;
            }
        }

        console.log("✅ 超简单修复完成！");

    } catch (error) {
        console.log("❌ 超简单修复出错:", error);
    }
}

// 终极暴力修复方案
function ultimateViolentFix() {
    console.log("=== 终极暴力修复方案 ===");

    try {
        // 查找所有div元素
        const allDivs = document.querySelectorAll('div');
        console.log("找到div元素数量:", allDivs.length);

        // 暴力查找：检查每个div的样式
        let dialogElement = null;
        for (let i = 0; i < allDivs.length; i++) {
            const div = allDivs[i];
            const style = window.getComputedStyle(div);

            // 检查是否是对话框（通过多种特征）
            if (style.position === 'fixed' ||
                style.position === 'absolute' ||
                (style.bottom && style.bottom !== 'auto') ||
                (style.left && style.left !== 'auto') ||
                (style.transform && style.transform !== 'none')) {

                console.log(`检查div ${i}:`, div.className, style.position, style.bottom, style.left);

                // 如果这个div包含中文文本，很可能是对话框
                if (div.textContent && div.textContent.includes('我是一名')) {
                    dialogElement = div;
                    console.log("✅ 找到对话框元素（通过文本内容）:", div.className);
                    break;
                }
            }
        }

        if (!dialogElement) {
            console.log("❌ 找不到对话框元素，尝试其他方法...");

            // 尝试通过文本内容查找
            for (let div of allDivs) {
                if (div.textContent && div.textContent.includes('我是一名')) {
                    dialogElement = div;
                    console.log("✅ 通过文本内容找到对话框:", div.className);
                    break;
                }
            }
        }

        if (!dialogElement) {
            console.log("❌ 仍然找不到对话框元素");
            return;
        }

        console.log("开始修复对话框...");

        // 直接设置背景图片
        dialogElement.style.background = "url(../images/diagbg1.png)";
        dialogElement.style.backgroundSize = "cover";
        dialogElement.style.backgroundPosition = "center";
        dialogElement.style.backgroundRepeat = "no-repeat";
        dialogElement.style.border = "2px solid rgba(150, 100, 255, 0.6)";
        dialogElement.style.borderRadius = "20px";
        dialogElement.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(150, 100, 255, 0.3)";
        console.log("✅ 设置背景图片和样式");

        // 查找并设置名称元素
        const allElements = dialogElement.querySelectorAll('*');
        let nameFound = false;
        for (let el of allElements) {
            if (el.tagName === 'H3' || el.className.includes('name') || el.tagName === 'SPAN') {
                el.textContent = "旁白";
                el.style.color = "#330066";
                el.style.fontSize = "22px";
                el.style.fontWeight = "bold";
                el.style.display = "block";
                el.style.marginBottom = "10px";
                console.log("✅ 设置名称元素:", el.className, el.tagName);
                nameFound = true;
                break;
            }
        }

        if (!nameFound) {
            // 如果没有找到名称元素，创建一个
            const nameElement = document.createElement('h3');
            nameElement.textContent = "旁白";
            nameElement.style.color = "#330066";
            nameElement.style.fontSize = "22px";
            nameElement.style.fontWeight = "bold";
            nameElement.style.margin = "0 0 10px 0";
            nameElement.style.display = "block";

            // 插入到对话框的开头
            dialogElement.insertBefore(nameElement, dialogElement.firstChild);
            console.log("✅ 创建并插入名称元素");
        }

        // 查找并设置头像元素
        for (let el of allElements) {
            if (el.className.includes('avatar') || el.style.borderRadius === '50%' || el.tagName === 'DIV') {
                el.textContent = "🔮";
                el.style.background = "linear-gradient(145deg, #9666ff, #7744ff)";
                el.style.border = "2px solid rgba(150, 100, 255, 0.6)";
                el.style.borderRadius = "50%";
                el.style.width = "50px";
                el.style.height = "50px";
                el.style.display = "flex";
                el.style.alignItems = "center";
                el.style.justifyContent = "center";
                el.style.fontSize = "20px";
                console.log("✅ 设置头像元素:", el.className);
                break;
            }
        }

        console.log("✅ 终极暴力修复完成！");

    } catch (error) {
        console.log("❌ 终极暴力修复出错:", error);
    }
}

// 测试修复后的对话框系统
function testFixedDialog() {
    console.clear();
    console.log("🧪 测试修复后的对话框系统");

    if (typeof game === 'undefined' || !game.dialog) {
        console.log("❌ 游戏或对话框未初始化");
        return;
    }

    console.log("✅ 游戏和对话框已初始化");

    // 测试系统对话框
    console.log("测试系统对话框...");
    game.dialog.prints(["【系统】这是一个测试系统对话框，应该显示为旁白样式"]);

    console.log("✅ 测试完成！请检查对话框是否显示：");
    console.log("1. 背景图片是否正确显示");
    console.log("2. 是否显示'旁白'文字");
    console.log("3. 文字颜色是否为深紫色");
    console.log("4. 是否显示水晶球头像");
}

// 直接修复对话框
function directFix() {
    console.clear();
    console.log("🔧 直接修复对话框");

    // 直接查找包含文本的div
    const allDivs = document.querySelectorAll('div');
    let dialogElement = null;

    for (let div of allDivs) {
        if (div.textContent && div.textContent.includes('我是一名')) {
            dialogElement = div;
            break;
        }
    }

    if (!dialogElement) {
        console.log("❌ 找不到对话框");
        return;
    }

    console.log("✅ 找到对话框:", dialogElement.className);

    // 强制设置背景图片
    dialogElement.style.background = "url(../images/diagbg1.png)";
    dialogElement.style.backgroundSize = "cover";
    dialogElement.style.backgroundPosition = "center";
    dialogElement.style.backgroundRepeat = "no-repeat";
    dialogElement.style.border = "2px solid rgba(150, 100, 255, 0.6)";
    dialogElement.style.borderRadius = "20px";
    dialogElement.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(150, 100, 255, 0.3)";
    console.log("✅ 设置背景图片");

    // 查找并设置名称元素
    const allElements = dialogElement.querySelectorAll('*');
    let nameFound = false;

    for (let el of allElements) {
        if (el.tagName === 'H3' || el.className.includes('name') || el.tagName === 'SPAN') {
            el.textContent = "旁白";
            el.style.color = "#330066";
            el.style.fontSize = "22px";
            el.style.fontWeight = "bold";
            el.style.display = "block";
            el.style.marginBottom = "10px";
            console.log("✅ 设置名称元素:", el.className);
            nameFound = true;
            break;
        }
    }

    if (!nameFound) {
        // 创建名称元素
        const nameElement = document.createElement('h3');
        nameElement.textContent = "旁白";
        nameElement.style.color = "#330066";
        nameElement.style.fontSize = "22px";
        nameElement.style.fontWeight = "bold";
        nameElement.style.margin = "0 0 10px 0";
        nameElement.style.display = "block";
        nameElement.style.position = "relative";
        nameElement.style.zIndex = "10";

        // 插入到对话框开头
        dialogElement.insertBefore(nameElement, dialogElement.firstChild);
        console.log("✅ 创建名称元素");
    }

    // 设置头像
    for (let el of allElements) {
        if (el.className.includes('avatar') || el.style.borderRadius === '50%') {
            el.textContent = "🔮";
            el.style.background = "linear-gradient(145deg, #9666ff, #7744ff)";
            el.style.border = "2px solid rgba(150, 100, 255, 0.6)";
            el.style.borderRadius = "50%";
            el.style.width = "50px";
            el.style.height = "50px";
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.justifyContent = "center";
            el.style.fontSize = "20px";
            console.log("✅ 设置头像");
            break;
        }
    }

    console.log("✅ 直接修复完成！");
}

// 清理控制台并执行分步测试
function clearAndTest() {
    // 清理控制台
    console.clear();
    console.log("🧹 控制台已清理");
    console.log("=== 分步测试开始 ===");

    // 步骤1：查找所有div
    const allDivs = document.querySelectorAll('div');
    console.log("步骤1 - 找到div元素数量:", allDivs.length);

    // 步骤2：查找包含文本的div
    let textDivs = [];
    for (let i = 0; i < allDivs.length; i++) {
        const div = allDivs[i];
        if (div.textContent && div.textContent.includes('我是一名')) {
            textDivs.push({ index: i, div: div, className: div.className });
        }
    }
    console.log("步骤2 - 包含'我是一名'的div数量:", textDivs.length);

    if (textDivs.length > 0) {
        console.log("步骤3 - 找到的对话框元素:");
        textDivs.forEach((item, idx) => {
            console.log(`  对话框${idx}:`, item.className, "索引:", item.index);
        });

        // 步骤4：选择第一个对话框进行修复
        const dialogElement = textDivs[0].div;
        console.log("步骤4 - 选择第一个对话框进行修复:", dialogElement.className);

        // 步骤5：设置背景图片
        dialogElement.style.background = "url(../images/diagbg1.png)";
        dialogElement.style.backgroundSize = "cover";
        dialogElement.style.backgroundPosition = "center";
        dialogElement.style.backgroundRepeat = "no-repeat";
        console.log("步骤5 - 设置背景图片完成");

        // 步骤6：查找名称元素
        const allElements = dialogElement.querySelectorAll('*');
        console.log("步骤6 - 对话框内元素数量:", allElements.length);

        let nameFound = false;
        for (let el of allElements) {
            if (el.tagName === 'H3' || el.className.includes('name') || el.tagName === 'SPAN') {
                el.textContent = "旁白";
                el.style.color = "#330066";
                el.style.fontSize = "22px";
                el.style.fontWeight = "bold";
                console.log("步骤7 - 设置名称元素:", el.className, el.tagName);
                nameFound = true;
                break;
            }
        }

        if (!nameFound) {
            const nameElement = document.createElement('h3');
            nameElement.textContent = "旁白";
            nameElement.style.color = "#330066";
            nameElement.style.fontSize = "22px";
            nameElement.style.fontWeight = "bold";
            nameElement.style.margin = "0 0 10px 0";
            nameElement.style.display = "block";
            dialogElement.insertBefore(nameElement, dialogElement.firstChild);
            console.log("步骤8 - 创建并插入名称元素");
        }

        console.log("✅ 分步测试完成！");
    } else {
        console.log("❌ 没有找到包含'我是一名'的div元素");
    }
}

// 分步测试函数
function stepByStepTest() {
    console.log("=== 分步测试 ===");

    // 步骤1：查找所有div
    const allDivs = document.querySelectorAll('div');
    console.log("步骤1 - 找到div元素数量:", allDivs.length);

    // 步骤2：查找包含文本的div
    let textDivs = [];
    for (let i = 0; i < allDivs.length; i++) {
        const div = allDivs[i];
        if (div.textContent && div.textContent.includes('我是一名')) {
            textDivs.push({ index: i, div: div, className: div.className });
        }
    }
    console.log("步骤2 - 包含'我是一名'的div数量:", textDivs.length);

    if (textDivs.length > 0) {
        console.log("步骤3 - 找到的对话框元素:");
        textDivs.forEach((item, idx) => {
            console.log(`  对话框${idx}:`, item.className, "索引:", item.index);
        });

        // 步骤4：选择第一个对话框进行修复
        const dialogElement = textDivs[0].div;
        console.log("步骤4 - 选择第一个对话框进行修复:", dialogElement.className);

        // 步骤5：设置背景图片
        dialogElement.style.background = "url(../images/diagbg1.png)";
        dialogElement.style.backgroundSize = "cover";
        dialogElement.style.backgroundPosition = "center";
        dialogElement.style.backgroundRepeat = "no-repeat";
        console.log("步骤5 - 设置背景图片完成");

        // 步骤6：查找名称元素
        const allElements = dialogElement.querySelectorAll('*');
        console.log("步骤6 - 对话框内元素数量:", allElements.length);

        let nameFound = false;
        for (let el of allElements) {
            if (el.tagName === 'H3' || el.className.includes('name') || el.tagName === 'SPAN') {
                el.textContent = "旁白";
                el.style.color = "#330066";
                el.style.fontSize = "22px";
                el.style.fontWeight = "bold";
                console.log("步骤7 - 设置名称元素:", el.className, el.tagName);
                nameFound = true;
                break;
            }
        }

        if (!nameFound) {
            const nameElement = document.createElement('h3');
            nameElement.textContent = "旁白";
            nameElement.style.color = "#330066";
            nameElement.style.fontSize = "22px";
            nameElement.style.fontWeight = "bold";
            nameElement.style.margin = "0 0 10px 0";
            nameElement.style.display = "block";
            dialogElement.insertBefore(nameElement, dialogElement.firstChild);
            console.log("步骤8 - 创建并插入名称元素");
        }

        console.log("✅ 分步测试完成！");
    } else {
        console.log("❌ 没有找到包含'我是一名'的div元素");
    }
}

// 强制修复函数
function forceFix() {
    console.log("=== 强制修复 ===");

    try {
        // 查找所有可能的对话框元素
        const allElements = document.querySelectorAll('*');
        let dialogElement = null;

        for (let el of allElements) {
            if (el.className && el.className.toString().includes('dialog')) {
                dialogElement = el;
                break;
            }
        }

        if (!dialogElement) {
            console.log("❌ 找不到对话框元素");
            return;
        }

        console.log("找到对话框元素:", dialogElement.className);

        // 直接设置样式
        dialogElement.style.background = "url(../images/diagbg1.png)";
        dialogElement.style.backgroundSize = "cover";
        dialogElement.style.backgroundPosition = "center";
        dialogElement.style.backgroundRepeat = "no-repeat";
        dialogElement.style.border = "2px solid rgba(150, 100, 255, 0.6)";
        dialogElement.style.borderRadius = "20px";
        dialogElement.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(150, 100, 255, 0.3)";

        console.log("✅ 设置对话框背景样式");

        // 查找并设置名称元素
        for (let child of dialogElement.children) {
            if (child.textContent && child.textContent.length < 10) {
                child.textContent = "旁白";
                child.style.color = "#330066";
                child.style.fontSize = "22px";
                child.style.fontWeight = "bold";
                console.log("✅ 设置名称元素:", child.className);
                break;
            }
        }

        // 查找并设置头像元素
        for (let child of dialogElement.children) {
            if (child.className && child.className.toString().includes('avatar')) {
                child.textContent = "🔮";
                child.style.background = "linear-gradient(145deg, #9666ff, #7744ff)";
                child.style.border = "2px solid rgba(150, 100, 255, 0.6)";
                console.log("✅ 设置头像元素:", child.className);
                break;
            }
        }

        console.log("✅ 强制修复完成！");

    } catch (error) {
        console.log("❌ 强制修复出错:", error);
    }
}

// 导出到全局作用域
window.testNarrationDialog = testNarrationDialog;
window.testDirectDialog = testDirectDialog;
window.waitForGameInit = waitForGameInit;
window.autoTestDirectDialog = autoTestDirectDialog;
window.simpleTest = simpleTest;
window.checkGameStatus = checkGameStatus;
window.testBackgroundImage = testBackgroundImage;
window.directSetDialog = directSetDialog;
window.quickTest = quickTest;
window.waitAndTest = waitAndTest;
window.diagnoseDialog = diagnoseDialog;
window.forceFixDialog = forceFixDialog;
window.ultimateFix = ultimateFix;
window.directDOMFix = directDOMFix;
window.simpleDiagnose = simpleDiagnose;
window.forceFix = forceFix;
window.checkCSS = checkCSS;
window.directCSSFix = directCSSFix;
window.superSimpleFix = superSimpleFix;
window.ultimateViolentFix = ultimateViolentFix;
window.stepByStepTest = stepByStepTest;
window.clearAndTest = clearAndTest;
window.directFix = directFix;
window.testFixedDialog = testFixedDialog;

console.log("旁白对话框测试脚本已加载！");
console.log("可用函数:");
console.log("- testFixedDialog(): 测试修复后的对话框系统（强烈推荐）");
console.log("- directFix(): 直接修复对话框");
console.log("- clearAndTest(): 清理控制台并分步测试");
console.log("- stepByStepTest(): 分步测试");
console.log("- ultimateViolentFix(): 终极暴力修复方案");
console.log("- superSimpleFix(): 超简单修复方案");
console.log("- checkCSS(): 检查CSS文件加载");
console.log("- directCSSFix(): 直接CSS修复");
console.log("- simpleDiagnose(): 简单诊断页面元素");
console.log("- forceFix(): 强制修复对话框");
console.log("- directDOMFix(): 直接DOM操作修复");
console.log("- ultimateFix(): 终极修复方案");
console.log("- forceFixDialog(): 强制修复对话框");
console.log("- waitAndTest(): 等待游戏初始化并强制修复");
console.log("- diagnoseDialog(): 详细诊断对话框状态");
console.log("- quickTest(): 快速测试");
console.log("- checkGameStatus(): 检查游戏状态");
console.log("- testBackgroundImage(): 测试背景图片路径");
console.log("- directSetDialog(): 直接设置对话框");
console.log("- simpleTest(): 简单测试对话框功能");
console.log("- testNarrationDialog(): 测试系统对话框显示为旁白");
console.log("- testDirectDialog(): 直接测试对话框设置");
console.log("- autoTestDirectDialog(): 自动等待并测试");
console.log("- waitForGameInit(): 等待游戏初始化完成");
console.log("");
console.log("推荐测试步骤:");
console.log("1. testFixedDialog() - 测试修复后的对话框系统（强烈推荐）");
console.log("2. directFix() - 直接修复对话框");
console.log("3. clearAndTest() - 清理控制台并分步测试");
console.log("4. stepByStepTest() - 分步测试");
console.log("5. ultimateViolentFix() - 终极暴力修复方案");
