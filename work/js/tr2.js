
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// 全局加载角色图片
const playerImg = new Image();
playerImg.src = '../images/player.png';
// 角色参数
const player = {
  x: 100,
  y: 400,
  width: 50,
  height: 50,
  vx: 0,
  vy: 0,
  ax: 0.8,         // 加大水平加速度，让响应更快
  friction: 0.9,   // 摩擦系数更高，松开键时减速更自然
  gravity: 1,
  jumpPower: -20,
  onGround: false,
  maxSpeed: 10,     // 允许最大速度稍微提高
  facing: 'right'
};

// 平台列表
const platforms = [
  { x: 0, y: 450, width: 3000, height: 150, vx: 0 },
  { x: 150, y: 350, width: 120, height: 20, vx: 1 },
  { x: 400, y: 300, width: 120, height: 20, vx: -1 },
  { x: 600, y: 250, width: 100, height: 20, vx: 0 }
];

// 键盘状态
const keys = { left: false, right: false, up: false };

window.addEventListener('keydown', e => {
  if (e.code === 'KeyA') keys.left = true;
  if (e.code === 'KeyD') keys.right = true;
  if (e.code === 'KeyW') {
    if (player.onGround) {
      player.vy = player.jumpPower;
      player.onGround = false;
    }
  }
});
window.addEventListener('keyup', e => {
  if (e.code === 'KeyA') keys.left = false;
  if (e.code === 'KeyD') keys.right = false;
});

// AABB碰撞检测
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}


// 更新逻辑优化
function update() {
  // 水平移动
  if (keys.left) {
    player.vx -= player.ax;
    player.facing = 'left';
  }
  if (keys.right) {
    player.vx += player.ax;
    player.facing = 'right';
  }

  // 松开按键减速
  if (!keys.left && !keys.right) {
    player.vx *= player.friction;
    if (Math.abs(player.vx) < 0.1) player.vx = 0; // 提高阈值，更快停止
  }

  // 限制最大速度
  if (player.vx > player.maxSpeed) player.vx = player.maxSpeed;
  if (player.vx < -player.maxSpeed) player.vx = -player.maxSpeed;

  player.x += player.vx;

  // 垂直移动
  player.vy += player.gravity;
  player.y += player.vy;
  player.onGround = false;

  // 平台移动 & 碰撞逻辑不变
  platforms.forEach(p => {
    p.x += p.vx;
    if (p.x < 0 || p.x + p.width > canvas.width) p.vx *= -1;

    if (checkCollision(player, p)) {
      const prevX = player.x - player.vx;
      const prevY = player.y - player.vy;

      // 上方碰撞
      if (prevY + player.height <= p.y) {
        player.y = p.y - player.height;
        player.vy = 0;
        player.onGround = true;
        player.x += p.vx;
      }
      // 下方碰撞
      else if (prevY >= p.y + p.height) {
        player.y = p.y + p.height;
        player.vy = 0;
      }
      // 左侧碰撞
      else if (prevX + player.width <= p.x) {
        player.x = p.x - player.width;
        player.vx = 0;
      }
      // 右侧碰撞
      else if (prevX >= p.x + p.width) {
        player.x = p.x + p.width;
        player.vx = 0;
      }
    }
  });

  // 边界限制
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.vy = 0;
    player.onGround = true;
  }
}

// 绘制逻辑
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制平台
  platforms.forEach(p => {
    ctx.fillStyle = 'green';
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // 绘制角色图片
  ctx.save();
  ctx.translate(player.x + player.width/2, player.y + player.height/2);
  if (player.facing === 'left') ctx.scale(-1, 1); // 左移翻转
  ctx.drawImage(playerImg, -player.width/2, -player.height/2, player.width, player.height);
  ctx.restore();
}

// 游戏循环
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// 图片加载完成后开始游戏
playerImg.onload = () => {
  gameLoop();
};
