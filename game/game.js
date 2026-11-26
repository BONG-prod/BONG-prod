(() => {
  "use strict";
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height, GROUND = 414;
  const el = (id) => document.getElementById(id);
  const ui = { level: el("levelName"), score: el("score"), coins: el("coins"), runs: el("runs"), progress: el("progress"), progressText: el("progressText"), toast: el("toast"), auto: el("autoBtn") };

  const stages = [
    { name: "Neon Outskirts", length: 2260, hazards: [{type:"crate",x:540,w:48,h:44},{type:"gap",x:900,w:108},{type:"spikes",x:1290,w:76,h:22},{type:"crate",x:1660,w:50,h:46},{type:"gap",x:1970,w:110}], coins: [330,380,430,690,740,790,1050,1100,1150,1450,1500,1550,1810,1860,1910,2150] },
    { name: "Data Canyon", length: 2320, hazards: [{type:"spikes",x:500,w:74,h:22},{type:"gap",x:850,w:110},{type:"crate",x:1200,w:50,h:48},{type:"gap",x:1550,w:118},{type:"spikes",x:1910,w:82,h:24}], coins: [300,350,400,650,700,750,1030,1080,1130,1370,1420,1470,1740,1790,1840,2150] },
    { name: "Violet Factory", length: 2380, hazards: [{type:"crate",x:520,w:48,h:42},{type:"crate",x:830,w:50,h:48},{type:"gap",x:1190,w:112},{type:"spikes",x:1570,w:82,h:24},{type:"gap",x:1930,w:116}], coins: [290,340,390,620,670,720,980,1030,1080,1390,1440,1490,1760,1810,1860,2200] },
    { name: "Core Overdrive", length: 2450, hazards: [{type:"gap",x:520,w:104},{type:"crate",x:900,w:50,h:46},{type:"spikes",x:1260,w:86,h:24},{type:"gap",x:1630,w:118},{type:"crate",x:2010,w:54,h:50}], coins: [300,350,400,690,740,790,1050,1100,1150,1420,1470,1520,1800,1850,1900,2290] }
  ];

  let stageIndex = 0, score = 0, coinCount = 0, runs = 1, auto = true, paused = false, lastTime = 0, elapsed = 0, toastTimer = 0;
  let stage = stages[stageIndex], hazards = [], coins = [], cameraX = 0;
  const player = { x: 120, y: GROUND - 48, w: 34, h: 48, vy: 0, onGround: true, runFrame: 0, blink: 0 };
  const SPEED = 3.65, GRAVITY = 0.52, JUMP = -15.5;

  function notify(message) { ui.toast.textContent = message; toastTimer = 1400; }
  function setAutopilot(value) { auto = value; ui.auto.classList.toggle("off", !auto); ui.auto.setAttribute("aria-pressed", String(auto)); ui.auto.innerHTML = '<span class="button-dot"></span> Autopilot ' + (auto ? "ON" : "OFF"); notify(auto ? "AUTOPILOT ONLINE" : "MANUAL CONTROL"); }
  function loadStage() {
    stage = stages[stageIndex];
    hazards = stage.hazards.map((h) => ({...h, passed:false}));
    coins = stage.coins.map((x, i) => ({x, y: i % 3 === 0 ? 330 : (i % 3 === 1 ? 355 : 375), taken:false, phase:i * .7}));
    player.x = 120; player.y = GROUND - player.h; player.vy = 0; player.onGround = true; player.runFrame = 0; cameraX = 0;
    ui.level.textContent = String(stageIndex + 1).padStart(2,"0") + " / " + stage.name;
    updateHud();
  }
  function updateHud() {
    ui.score.textContent = String(score).padStart(6,"0");
    ui.coins.textContent = String(coinCount).padStart(2,"0");
    ui.runs.textContent = String(runs).padStart(2,"0");
    const pct = Math.max(0, Math.min(100, (player.x / stage.length) * 100));
    ui.progress.style.width = pct.toFixed(1) + "%"; ui.progressText.textContent = Math.floor(pct) + "%";
  }
  function resetRun() { score = 0; coinCount = 0; stageIndex = 0; runs = 1; loadStage(); notify("NEW RUN — GOOD LUCK"); }
  function jump() { if (player.onGround && !paused) { player.vy = JUMP; player.onGround = false; player.runFrame += 1; } }
  function getGapAt(x) { return hazards.find(h => h.type === "gap" && x >= h.x && x <= h.x + h.w); }

  function update(dt) {
    elapsed += dt;
    if (auto && player.onGround) {
      const next = hazards.find(h => !h.passed && h.x + h.w > player.x + 2);
      if (next) {
        const distance = next.x - (player.x + player.w);
        if (distance <= 75 && distance > -8) jump();
      }
    }
    player.x += SPEED * dt;
    player.runFrame += (player.onGround ? 0.22 : 0.08) * dt;
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;

    const footX = player.x + player.w * 0.56;
    const overGap = Boolean(getGapAt(footX));
    if (player.y + player.h >= GROUND && !overGap && player.vy >= 0) { player.y = GROUND - player.h; player.vy = 0; player.onGround = true; }
    else { player.onGround = false; }

    for (const h of hazards) {
      if (player.x > h.x + h.w + 46) h.passed = true;
      if (h.type !== "gap" && player.x + player.w > h.x + 5 && player.x < h.x + h.w - 4) {
        const top = GROUND - h.h;
        if (player.y + player.h > top + 4) { crash(); return; }
      }
    }
    if (player.y > H + 90) { crash(); return; }

    for (const c of coins) {
      if (!c.taken && Math.abs((player.x + player.w/2) - c.x) < 25 && Math.abs((player.y + player.h/2) - c.y) < 42) {
        c.taken = true; coinCount += 1; score += 100;
      }
    }
    cameraX = Math.max(0, player.x - 190);
    if (player.x + player.w >= stage.length) completeStage();
    updateHud();
  }

  function crash() {
    score = Math.max(0, score - 100);
    player.x = 120; player.y = GROUND - player.h; player.vy = 0; player.onGround = true;
    hazards.forEach(h => h.passed = false); coins.forEach(c => { if (c.x > 120) c.taken = false; });
    cameraX = 0; notify(auto ? "OOPS — RETRYING THE STAGE" : "OOPS — PRESS SPACE TO TRY AGAIN");
  }
  function completeStage() {
    score += 500 + Math.max(0, 400 - Math.floor((elapsed / 1000) * 2));
    stageIndex += 1;
    if (stageIndex >= stages.length) { stageIndex = 0; runs += 1; notify("ALL STAGES CLEARED — NEXT RUN!"); }
    else notify("STAGE CLEAR — NEXT: " + stages[stageIndex].name.toUpperCase());
    loadStage();
  }

  function roundedRect(x,y,w,h,r,fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); }
  function drawBackground() {
    const grad = ctx.createLinearGradient(0,0,0,H); grad.addColorStop(0,"#17294b"); grad.addColorStop(.58,"#26365c"); grad.addColorStop(1,"#34466c"); ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);
    const sunX = 760 - cameraX * .08; const sunY = 118;
    const glow = ctx.createRadialGradient(sunX,sunY,4,sunX,sunY,110); glow.addColorStop(0,"rgba(184,191,255,.36)"); glow.addColorStop(1,"rgba(184,191,255,0)"); ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = "rgba(224,232,255,.68)";
    for (let i=0;i<42;i++) { const x = ((i*173 - cameraX*.16) % (W+30) + W+30) % (W+30); const y = 34 + (i*47)%210; ctx.fillRect(x,y,2,2); }
    drawHills("#31436f", .18, 326, 150); drawHills("#28395f", .31, 365, 118);
    for(let i=0;i<13;i++){ const x=((i*112-cameraX*.42)%(W+130)+(W+130))%(W+130)-40; const height=35+(i*29)%90; ctx.fillStyle=i%2?"#1c2b4d":"#202f53"; ctx.fillRect(x,GROUND-height,58,height); ctx.fillStyle="rgba(133,159,226,.18)"; for(let wy=GROUND-height+12;wy<GROUND-12;wy+=18) for(let wx=x+10;wx<x+50;wx+=17) ctx.fillRect(wx,wy,5,5); }
  }
  function drawHills(color, factor, base, amp) {
    ctx.fillStyle=color; ctx.beginPath(); ctx.moveTo(0,H);
    for(let x=0;x<=W+12;x+=12){ const wx=x+cameraX*factor; const y=base-Math.sin(wx*.004)*amp*.40-Math.sin(wx*.009+1.2)*amp*.18; ctx.lineTo(x,y); }
    ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  }
  function drawGround() {
    const start = Math.floor(cameraX/40)*40 - 40;
    for(let wx=start; wx<cameraX+W+60; wx+=40){
      const gap = getGapAt(wx+20); if(gap) continue;
      const x=wx-cameraX;
      const gr=ctx.createLinearGradient(0,GROUND,0,H); gr.addColorStop(0,"#263b55"); gr.addColorStop(1,"#101a2b"); ctx.fillStyle=gr; ctx.fillRect(x,GROUND,41,H-GROUND);
      ctx.fillStyle="#6e8ee4"; ctx.fillRect(x,GROUND,40,5); ctx.fillStyle="rgba(172,192,255,.18)"; ctx.fillRect(x+4,GROUND+12,14,3); ctx.fillRect(x+22,GROUND+28,10,3);
      ctx.strokeStyle="rgba(8,15,29,.35)"; ctx.strokeRect(x,GROUND,40,H-GROUND);
    }
    ctx.fillStyle="rgba(8,14,25,.3)"; ctx.fillRect(0,GROUND+5,W,5);
  }
  function drawHazards() {
    for(const h of hazards){ const x=h.x-cameraX; if(x < -150 || x > W+150) continue;
      if(h.type==="crate"){
        const y=GROUND-h.h; const g=ctx.createLinearGradient(x,y,x+h.w,y+h.h); g.addColorStop(0,"#b58b70"); g.addColorStop(1,"#694e69"); roundedRect(x,y,h.w,h.h,5,g);
        ctx.strokeStyle="rgba(255,224,197,.35)"; ctx.lineWidth=2; ctx.strokeRect(x+6,y+6,h.w-12,h.h-12); ctx.beginPath();ctx.moveTo(x+7,y+7);ctx.lineTo(x+h.w-7,y+h.h-7);ctx.moveTo(x+h.w-7,y+7);ctx.lineTo(x+7,y+h.h-7);ctx.stroke();
      } else if(h.type==="spikes"){
        ctx.fillStyle="#ef8f9c"; ctx.beginPath(); for(let sx=x; sx<x+h.w; sx+=19){ctx.moveTo(sx,GROUND);ctx.lineTo(sx+9.5,GROUND-h.h);ctx.lineTo(sx+19,GROUND);} ctx.closePath();ctx.fill();
        ctx.fillStyle="#ffd5dc"; for(let sx=x+7;sx<x+h.w;sx+=19){ctx.fillRect(sx,GROUND-h.h+8,3,5);}
      }
    }
  }
  function drawCoins() {
    for(const c of coins){ if(c.taken) continue; const x=c.x-cameraX; if(x < -30 || x>W+30) continue; const bob=Math.sin(elapsed*.006+c.phase)*4; const y=c.y+bob;
      ctx.save(); ctx.translate(x,y); ctx.shadowColor="#ffd86e"; ctx.shadowBlur=14; ctx.fillStyle="#ffd66e"; ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle="#fff1ae";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,3,6,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }
  function drawGoal() {
    const x=stage.length-cameraX-28; if(x < -90 || x>W+90) return;
    ctx.save(); ctx.shadowColor="#9f86ff";ctx.shadowBlur=24;roundedRect(x,GROUND-110,45,110,22,"rgba(120,105,220,.18)");ctx.shadowBlur=0;
    ctx.strokeStyle="#c0b4ff";ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(x,GROUND-110,45,110,22);ctx.stroke();
    const g=ctx.createLinearGradient(x,0,x+45,0);g.addColorStop(0,"rgba(115,151,255,.15)");g.addColorStop(.5,"rgba(191,158,255,.65)");g.addColorStop(1,"rgba(115,151,255,.15)");ctx.fillStyle=g;ctx.fillRect(x+6,GROUND-101,33,99);
    ctx.restore();
  }
  function drawPlayer() {
    const x=player.x-cameraX, y=player.y; const step=Math.sin(player.runFrame)*5;
    ctx.fillStyle="rgba(4,9,18,.35)";ctx.beginPath();ctx.ellipse(x+17,GROUND+3,22,5,0,0,Math.PI*2);ctx.fill();
    // Original little runner bot — drawn from simple shapes, no third-party sprites.
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    // legs
    roundedRect(7,34+Math.max(0,step),8,13,3,"#263a70");roundedRect(21,34+Math.max(0,-step),8,13,3,"#263a70");
    roundedRect(4,43+Math.max(0,step),12,5,2,"#9aaeff");roundedRect(19,43+Math.max(0,-step),12,5,2,"#9aaeff");
    // body and scarf
    roundedRect(5,20,25,20,6,"#617fe0");roundedRect(3,24,29,7,3,"#9e7bea");
    // helmet
    roundedRect(3,2,30,25,9,"#dce5ff");roundedRect(6,5,24,18,7,"#6377bb");
    roundedRect(9,10,18,8,4,"#101a32");
    ctx.fillStyle="#aaf3df";ctx.fillRect(13,12,4,3);ctx.fillRect(21,12,4,3);
    ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillRect(8,7,7,2);
    roundedRect(11,29,12,4,2,"#d7e1ff");
    ctx.restore();
  }
  function drawOverlay() {
    if(paused){ctx.fillStyle="rgba(5,10,20,.58)";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="800 34px Manrope,Arial";ctx.fillText("PAUSED",W/2,H/2);ctx.font="14px monospace";ctx.fillStyle="#b4c0de";ctx.fillText("Press P to continue",W/2,H/2+30);}
  }
  function draw() {
    ctx.clearRect(0,0,W,H);drawBackground();drawGround();drawHazards();drawCoins();drawGoal();drawPlayer();drawOverlay();
  }

  function frame(now) {
    const dt = lastTime ? Math.min(2.2,(now-lastTime)/16.6667) : 1; lastTime=now;
    if(!paused) update(dt); draw();
    if(toastTimer>0){toastTimer-=16.67*dt;if(toastTimer<=0)ui.toast.textContent=auto?"AUTOPILOT ONLINE":"MANUAL CONTROL";}
    requestAnimationFrame(frame);
  }
  function handleJumpKey(event) {
    if(event.code==="Space" || event.code==="ArrowUp" || event.code==="KeyW"){event.preventDefault();if(!auto)jump();else if(player.onGround)jump();}
    if(event.code==="KeyP"){paused=!paused;notify(paused?"GAME PAUSED":"BACK IN THE GAME");}
  }
  window.addEventListener("keydown",handleJumpKey);
  canvas.addEventListener("pointerdown",()=>{if(!auto)jump();});
  ui.auto.addEventListener("click",()=>setAutopilot(!auto));
  el("restartBtn").addEventListener("click",resetRun);
  setAutopilot(true);loadStage();requestAnimationFrame(frame);
})();
