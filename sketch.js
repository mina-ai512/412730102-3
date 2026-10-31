// ==========================================
// 全局變數定義 (Global Variables)
// ==========================================

// 關卡資料集 (包含品牌、寫實照片、介紹、價格資訊及取材自介紹內容的選擇題)
let questionsData = [
  {
    brand: "賓士 (Mercedes-Benz)",                                                   // 品牌名稱
    imgUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop", // 賓士寫實照片網址
    intro: "德國經典豪華汽車品牌，以精湛工程品質、極佳行車舒適性與尊榮品質聞名全台。",       // 品牌介紹
    price: "約 NT$ 210 萬 - 1,500 萬元起",                                            // 參考價格
    quiz: {
      question: "根據上方品牌介紹，賓士（Mercedes-Benz）在全台聞名是以什麼著稱？",
      options: ["以精湛工程品質與極佳行車舒適性聞名", "以純電動車與極簡座艙設計聞名", "以雙腎型水箱護罩與純粹駕馭樂趣聞名", "以平價經濟與保養便利聞名"],
      correct: 0
    }
  },
  {
    brand: "特斯拉 (Tesla)",                                                        // 品牌名稱
    imgUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop", // 特斯拉寫實照片網址
    intro: "全球電動車領導品牌，具備極簡座艙設計、強勁加速性能與先進 Autopilot 輔助駕駛。",    // 品牌介紹
    price: "約 NT$ 175 萬 - 380 萬元起",                                            // 參考價格
    quiz: {
      question: "根據上方品牌介紹，特斯拉（Tesla）具備下列哪一項車室內裝與性能特色？",
      options: ["雙腎型水箱護罩與靈敏操控", "極簡座艙設計與強勁加速性能", "傳統機械儀表與手排變速箱", "豪華木紋飾板與後座買家定位"],
      correct: 1
    }
  },
  {
    brand: "寶馬 (BMW)",                                                            // 品牌名稱
    imgUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop", // 寶馬寫實照片網址
    intro: "標榜「純粹駕馭樂趣」的德國豪華品牌，以靈敏操控性、雙腎型水箱護罩特色廣受喜愛。",      // 品牌介紹
    price: "約 NT$ 205 萬 - 1,000 萬元起",                                           // 參考價格
    quiz: {
      question: "根據上方品牌介紹，寶馬（BMW）廣受喜愛的特色造型之一是什麼？",
      options: ["三芒星標誌", "鷗翼式車門", "雙腎型水箱護罩", "封閉式前保桿"],
      correct: 2
    }
  }
];

let currentLevel = 0;           // 當前關卡索引 (0, 1, 2)
let currentImg = null;          // 當前載入的汽車圖片物件
let pieces = [];                // 存放 9 塊正方形拼圖物件的陣列
let boardCells = [];            // 左側目標拼圖格子的座標資訊

// 遊戲狀態控制 ("START", "PLAYING", "LEVEL_CLEAR", "QUIZ", "GAME_OVER")
let gameState = "START";        // 遊戲初始狀態設為首頁開始畫面
let startTime = 0;              // 遊戲開始的時間戳記 (毫秒)
let totalElapsedTime = 0;       // 完成三關總共耗時 (秒)
let fireworks = [];             // 存放通關煙火粒子的陣列
let selectedOption = null;      // 記錄玩家在選擇題中點選的選項索引
let quizFeedback = "";          // 答題回饋訊息

// 音效控制變數
let bgmMusic;                   // 宣告背景音樂變數

// 拖曳狀態管理
let draggedPiece = null;        // 當前正在被滑鼠拖曳的拼圖物件
let offsetX = 0;                // 拖曳時滑鼠與拼圖左上角的 X 軸偏移量
let offsetY = 0;                // 拖曳時滑鼠與拼圖左上角的 Y 軸偏移量

// ==========================================
// p5.js 預載與初始化函數 (Preload & Setup)
// ==========================================

function preload() {
  loadLevelImage(currentLevel); 
  bgmMusic = loadSound('mickeyscat-old-film-ragtime-627015.mp3'); 
}

function loadLevelImage(levelIndex) {
  currentImg = loadImage(questionsData[levelIndex].imgUrl, () => {
    initPuzzleBoard(); 
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight); 
  rectMode(CORNER);                        
  initPuzzleBoard();                       
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  initPuzzleBoard();                       
}

// ==========================================
// 拼圖板與正方形拼圖碎片初始化邏輯
// ==========================================

function initPuzzleBoard() {
  boardCells = []; 
  pieces = [];     
  
  let halfWidth = width / 2; 
  let maxW = halfWidth * 0.75; 
  let maxH = height * 0.55;    
  
  let boardW = maxW; 
  let boardH = boardW * (2 / 3); 
  
  if (boardH > maxH) { 
    boardH = maxH; 
    boardW = boardH * (1.5); 
  }
  
  let boardStartX = (halfWidth - boardW) / 2; 
  let boardStartY = (height - boardH) / 2 + 30; 
  
  let cellW = boardW / 3; 
  let cellH = boardH / 3; 
  
  let slots = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      slots.push({ r: r, c: c });
    }
  }
  slots = shuffle(slots); 

  let index = 0; 
  for (let r = 0; r < 3; r++) { 
    for (let c = 0; c < 3; c++) { 
      let targetX = boardStartX + c * cellW; 
      let targetY = boardStartY + r * cellH; 
      
      boardCells.push({ 
        x: targetX, 
        y: targetY, 
        w: cellW,   
        h: cellH    
      });
      
      let slot = slots[index];
      let rightStartX = halfWidth + (halfWidth - boardW) / 2; 
      let randomX = rightStartX + slot.c * cellW;             
      let randomY = boardStartY + slot.r * cellH;             
      
      pieces.push({ 
        id: index,               
        row: r,                  
        col: c,                  
        x: randomX,              
        y: randomY,              
        targetX: targetX,        
        targetY: targetY,        
        w: cellW,                
        h: cellH,                
        isUnlocked: true,        
        isSnapped: false         
      });
      
      index++; 
    }
  }
}

// ==========================================
// p5.js 繪圖主迴圈 (draw)
// ==========================================

function draw() {
  background(168, 218, 220); 
  
  if (gameState === "START") {
    drawStartScreen();     
  } else if (gameState === "PLAYING" || gameState === "LEVEL_CLEAR") { 
    drawHeaderUI();        
    drawLeftBoard();       
    drawRightArea();       
    
    if (gameState === "LEVEL_CLEAR") { 
      drawLevelClearBanner(); 
    }
  } else if (gameState === "QUIZ") {
    drawHeaderUI();
    drawLeftBoard();
    drawRightArea();
    drawQuizModal();       
  } else if (gameState === "GAME_OVER") { 
    drawGameOverScreen();  
  }
}

// ==========================================
// 介面與圖形繪製函數 (UI & Rendering)
// ==========================================

function drawStartScreen() {
  let cardW = min(500, width * 0.85); 
  let cardH = 300;                    
  let cardX = (width - cardW) / 2;    
  let cardY = (height - cardH) / 2;   

  fill(255, 255, 255, 230);
  stroke(69, 123, 157);
  strokeWeight(3);
  rect(cardX, cardY, cardW, cardH, 16);

  fill(29, 53, 87);
  textAlign(CENTER, CENTER);
  textSize(28);
  textStyle(BOLD);
  text("台灣常見汽車品牌拼圖教學測驗", width / 2, cardY + 70);

  textSize(16);
  textStyle(NORMAL);
  fill(69, 123, 157);
  text("探索台灣熱門汽車品牌，動手拼出精美寫實車照！", width / 2, cardY + 120);

  let btnW = 180;
  let btnH = 50;
  let btnX = width / 2 - btnW / 2;
  let btnY = cardY + cardH - 90;
  
  let isHover = mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH;

  fill(isHover ? color(230, 57, 70) : color(29, 53, 87));
  noStroke();
  rect(btnX, btnY, btnW, btnH, 10);

  fill(255);
  textSize(18);
  textStyle(BOLD);
  text("開始測驗", width / 2, btnY + btnH / 2);
}

function drawHeaderUI() {
  fill(29, 53, 87); 
  textAlign(CENTER, TOP); 
  
  textSize(24); 
  textStyle(BOLD); 
  text("台灣常見汽車品牌拼圖教學測驗", width / 2, 12); 
  
  textSize(16); 
  textStyle(BOLD); 
  fill(230, 57, 70); 
  let levelText = `第 ${currentLevel + 1} / 3 關：${questionsData[currentLevel].brand}`; 
  text(levelText, width / 2, 42); 

  textSize(14);
  textStyle(NORMAL);
  fill(29, 53, 87);
  let infoText = `【參考價格】：${questionsData[currentLevel].price}   |   ${questionsData[currentLevel].intro}`;
  text(infoText, width / 2, 66);
}

function drawLeftBoard() {
  if (boardCells.length === 0) return; 
  
  let boardX = boardCells[0].x; 
  let boardY = boardCells[0].y; 
  let boardW = boardCells[2].w * 3; 
  let boardH = boardCells[8].h * 3; 
  
  fill(29, 53, 87); 
  textSize(15); 
  textStyle(BOLD);
  textAlign(CENTER, BOTTOM); 
  text("【對應拼圖板 (半透明原圖)】", boardX + boardW / 2, boardY - 8); 
  
  if (currentImg) { 
    tint(255, 95); 
    image(currentImg, boardX, boardY, boardW, boardH); 
    noTint(); 
  }
  
  stroke(29, 53, 87, 120); 
  strokeWeight(2); 
  noFill(); 
  rect(boardX, boardY, boardW, boardH, 4); 
  
  stroke(29, 53, 87, 50); 
  strokeWeight(1); 
  for (let r = 0; r < 3; r++) { 
    for (let c = 0; c < 3; c++) { 
      let cell = boardCells[r * 3 + c]; 
      rect(cell.x, cell.y, cell.w, cell.h); 
    }
  }
  
  for (let p of pieces) { 
    if (p.isSnapped) { 
      drawSquarePiece(p); 
    }
  }
}

function drawRightArea() {
  if (boardCells.length === 0) return;
  let halfWidth = width / 2; 
  let boardY = boardCells[0].y; 
  
  fill(29, 53, 87); 
  textSize(15); 
  textStyle(BOLD);
  textAlign(CENTER, BOTTOM); 
  text("【拖曳拼圖區 (正方形)】", halfWidth + (width - halfWidth) / 2, boardY - 8); 
  
  for (let p of pieces) { 
    if (!p.isSnapped) { 
      drawSquarePiece(p); 
    }
  }
}

function drawSquarePiece(p) {
  push(); 
  translate(p.x, p.y); 
  
  if (currentImg) { 
    let sx = (p.col / 3) * currentImg.width;  
    let sy = (p.row / 3) * currentImg.height; 
    let sw = currentImg.width / 3;            
    let sh = currentImg.height / 3;           
    
    image(currentImg, 0, 0, p.w, p.h, sx, sy, sw, sh); 
  }
  
  stroke(255, 255, 255, 230); 
  strokeWeight(2); 
  noFill(); 
  rect(0, 0, p.w, p.h); 
  
  stroke(29, 53, 87, 60); 
  strokeWeight(1); 
  rect(0, 0, p.w, p.h); 
  
  pop(); 
}

function drawLevelClearBanner() {
  fill(29, 53, 87, 230); 
  rect(0, height / 2 - 50, width, 100); 
  
  fill(255); 
  textAlign(CENTER, CENTER); 
  textSize(26); 
  textStyle(BOLD); 
  text(`🎉 恭喜完成【${questionsData[currentLevel].brand}】拼圖！`, width / 2, height / 2 - 10); 
  
  textSize(15); 
  textStyle(NORMAL); 
  text("點擊畫布任意處回答本關品牌挑戰題...", width / 2, height / 2 + 25); 
}

function drawQuizModal() {
  fill(15, 23, 42, 180);
  rect(0, 0, width, height);

  let boxW = min(600, width * 0.85);
  let boxH = 420;
  let boxX = (width - boxW) / 2;
  let boxY = (height - boxH) / 2;

  fill(255);
  stroke(29, 53, 87);
  strokeWeight(3);
  rect(boxX, boxY, boxW, boxH, 16);

  fill(230, 57, 70);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  textStyle(BOLD);
  text(`📝 ${questionsData[currentLevel].brand} - 品牌小學堂`, width / 2, boxY + 25);

  fill(29, 53, 87);
  textSize(16);
  textStyle(BOLD);
  let quizData = questionsData[currentLevel].quiz;
  text(quizData.question, width / 2, boxY + 75);

  let optY = boxY + 125;
  let optH = 45;
  let optSpacing = 55;

  for (let i = 0; i < quizData.options.length; i++) {
    let btnX = boxX + 30;
    let btnW = boxW - 60;
    let currentOptY = optY + i * optSpacing;

    let isHover = mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= currentOptY && mouseY <= currentOptY + optH;

    if (selectedOption === i) {
      fill(isHover ? color(200, 220, 240) : color(220, 235, 250));
      stroke(30, 144, 255);
      strokeWeight(2);
    } else {
      fill(isHover ? 240 : 248, 250, 252);
      stroke(203, 213, 225);
      strokeWeight(1);
    }

    rect(btnX, currentOptY, btnW, optH, 8);

    fill(29, 53, 87);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(15);
    textStyle(NORMAL);
    text(`${i + 1}. ${quizData.options[i]}`, btnX + 15, currentOptY + optH / 2);
  }

  if (quizFeedback !== "") {
    textAlign(CENTER, CENTER);
    textSize(15);
    textStyle(BOLD);
    fill(quizFeedback.includes("答對") ? color(16, 185, 129) : color(230, 57, 70));
    text(quizFeedback, width / 2, boxY + boxH - 45);
  }
}

// ==========================================
// 最終結算與煙火特效 (Game Over & Fireworks)
// ==========================================

function drawGameOverScreen() {
  if (random(1) < 0.08) { 
    fireworks.push(new Firework()); 
  }
  
  for (let i = fireworks.length - 1; i >= 0; i--) { 
    fireworks[i].update(); 
    fireworks[i].show();    
    if (fireworks[i].done()) { 
      fireworks.splice(i, 1); 
    }
  }
  
  let cardW = min(560, width * 0.9); 
  let cardH = 440; 
  let cardX = (width - cardW) / 2; 
  let cardY = (height - cardH) / 2; 
  
  fill(255, 255, 255, 240); 
  stroke(29, 53, 87); 
  strokeWeight(3); 
  rect(cardX, cardY, cardW, cardH, 20); 
  
  fill(230, 57, 70); 
  textAlign(CENTER, TOP); 
  textSize(28); 
  textStyle(BOLD); 
  text("🏆 恭喜完成全部三關拼圖挑戰！", width / 2, cardY + 30); 
  
  fill(29, 53, 87); 
  textSize(18); 
  textStyle(NORMAL); 
  text(`總共花費時間：${totalElapsedTime} 秒`, width / 2, cardY + 75); 
  
  let gridStartY = cardY + 120; 
  let gridCellW = 140; 
  let gridCellH = 90;  
  let gap = 15;        
  let totalGridW = 3 * gridCellW + 2 * gap; 
  let startX = (width - totalGridW) / 2; 
  
  for (let i = 0; i < 3; i++) { 
    let gx = startX + i * (gridCellW + gap); 
    
    fill(241, 245, 249); 
    stroke(148, 163, 184); 
    strokeWeight(1); 
    rect(gx, gridStartY, gridCellW, gridCellH, 10); 
    
    fill(29, 53, 87); 
    textSize(14); 
    textStyle(BOLD); 
    text(`第 ${i + 1} 關`, gx + gridCellW / 2, gridStartY + 12); 
    
    textSize(12); 
    textStyle(NORMAL); 
    fill(69, 123, 157); 
    text(questionsData[i].brand.split(" ")[0], gx + gridCellW / 2, gridStartY + 35); 
    
    fill(16, 185, 129); 
    textStyle(BOLD);
    text("通關完成 ✔", gx + gridCellW / 2, gridStartY + 62); 
  }
  
  fill(69, 123, 157); 
  textSize(15); 
  textStyle(NORMAL);
  text("按下 [ F5 ] 或重新整理網頁即可重新挑戰！", width / 2, cardY + cardH - 40); 
}

// ==========================================
// 使用者互動控制 (Mouse Events)
// ==========================================

function mousePressed() {
  if (gameState === "START") {
    let cardW = min(500, width * 0.85);
    let cardH = 300;
    let cardY = (height - cardH) / 2;
    let btnW = 180;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = cardY + cardH - 90;

    if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
      gameState = "PLAYING";      
      startTime = millis();       
      
      if (bgmMusic && !bgmMusic.isPlaying()) {
        bgmMusic.loop();          
      }
    }
    return;
  }

  if (gameState === "LEVEL_CLEAR") { 
    gameState = "QUIZ";
    selectedOption = null;
    quizFeedback = "";
    return; 
  }

  if (gameState === "QUIZ") {
    let boxW = min(600, width * 0.85);
    let boxH = 420;
    let boxX = (width - boxW) / 2;
    let boxY = (height - boxH) / 2;

    let optY = boxY + 125;
    let optH = 45;
    let optSpacing = 55;
    let quizData = questionsData[currentLevel].quiz;

    for (let i = 0; i < quizData.options.length; i++) {
      let btnX = boxX + 30;
      let btnW = boxW - 60;
      let currentOptY = optY + i * optSpacing;

      if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= currentOptY && mouseY <= currentOptY + optH) {
        selectedOption = i;
        if (selectedOption === quizData.correct) {
          quizFeedback = "🎉 答對了！點擊任意處進入下一關";
        } else {
          quizFeedback = "❌ 答錯囉！請根據上方品牌介紹再試一次";
        }
      }
    }

    if (quizFeedback.includes("答對")) {
      currentLevel++; 
      if (currentLevel < questionsData.length) { 
        gameState = "PLAYING"; 
        loadLevelImage(currentLevel); 
      } else { 
        gameState = "GAME_OVER"; 
        totalElapsedTime = floor((millis() - startTime) / 1000); 
      }
    }
    return;
  }
  
  if (gameState === "PLAYING") { 
    for (let i = pieces.length - 1; i >= 0; i--) { 
      let p = pieces[i]; 
      
      if (p.isSnapped) continue; 
      
      if (mouseX > p.x && mouseX < p.x + p.w &&
          mouseY > p.y && mouseY < p.y + p.h) { 
          
        draggedPiece = p;               
        offsetX = mouseX - p.x;         
        offsetY = mouseY - p.y;         
        
        pieces.splice(i, 1); 
        pieces.push(p);     
        break; 
      }
    }
  }
}

function mouseDragged() {
  if (draggedPiece) { 
    draggedPiece.x = mouseX - offsetX; 
    draggedPiece.y = mouseY - offsetY; 
  }
}

function mouseReleased() {
  if (draggedPiece) { 
    let distanceThreshold = 45; 
    let d = dist(draggedPiece.x, draggedPiece.y, draggedPiece.targetX, draggedPiece.targetY); 
    
    if (d < distanceThreshold) { 
      draggedPiece.x = draggedPiece.targetX; 
      draggedPiece.y = draggedPiece.targetY; 
      draggedPiece.isSnapped = true;          
    } else {
      draggedPiece.isSnapped = false; 
    }
    
    draggedPiece = null;     
    checkLevelCompletion();  
  }
}

function checkLevelCompletion() {
  let allSnapped = pieces.every(p => p.isSnapped); 
  if (allSnapped) { 
    gameState = "LEVEL_CLEAR"; 
  }
}

// ==========================================
// 煙火特效粒子系統 (Firework Particle System)
// ==========================================

class Firework {
  constructor() {
    this.x = random(width * 0.1, width * 0.9); 
    this.firework = new Particle(this.x, height, true); 
    this.exploded = false; 
    this.particles = [];    
  }
  
  update() {
    if (!this.exploded) { 
      this.firework.applyForce(createVector(0, 0.2)); 
      this.firework.update(); 
      
      if (this.firework.vel.y >= 0) { 
        this.exploded = true; 
        this.explode();        
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) { 
      this.particles[i].applyForce(createVector(0, 0.15)); 
      this.particles[i].update(); 
      if (this.particles[i].done()) { 
        this.particles.splice(i, 1); 
      }
    }
  }
  
  explode() {
    let particleCount = 65; 
    let hu = random(255);    
    for (let i = 0; i < particleCount; i++) { 
      let p = new Particle(this.firework.pos.x, this.firework.pos.y, false, hu); 
      this.particles.push(p); 
    }
  }
  
  done() {
    return this.exploded && this.particles.length === 0; 
  }
  
  show() {
    if (!this.exploded) { 
      this.firework.show(); 
    }
    for (let p of this.particles) { 
      p.show(); 
    }
  }
}

class Particle {
  constructor(x, y, isSeed, hueVal) {
    this.pos = createVector(x, y); 
    this.isSeed = isSeed;          
    this.lifespan = 255;            
    
    if (this.isSeed) { 
      this.vel = createVector(0, random(-14, -18)); 
    } else { 
      this.vel = p5.Vector.random2D(); 
      this.vel.mult(random(2, 10));    
    }
    this.acc = createVector(0, 0); 
    this.color = hueVal || random(255); 
  }
  
  applyForce(force) {
    this.acc.add(force); 
  }
  
  update() {
    if (!this.isSeed) { 
      this.vel.mult(0.92); 
      this.lifespan -= 4;  
    }
    this.vel.add(this.acc); 
    this.pos.add(this.vel); 
    this.acc.mult(0);       
  }
  
  done() {
    return this.lifespan < 0; 
  }
  
  show() {
    colorMode(HSB, 255); 
    if (this.isSeed) { 
      strokeWeight(6); 
      stroke(this.color, 255, 255); 
    } else { 
      strokeWeight(4); 
      stroke(this.color, 255, 255, this.lifespan); 
    }
    point(this.pos.x, this.pos.y); 
    colorMode(RGB, 255); 
  }
}