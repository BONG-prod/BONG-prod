(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = 1100, H = 560, GROUND = 445;
  const $ = (id) => document.getElementById(id);
  const ui = {
    level: $("levelName"), subtitle: $("levelSubtitle"), icon: $("worldIcon"),
    score: $("score"), coins: $("coins"), lives: $("lives"), best: $("best"),
    progress: $("progress"), progressText: $("progressText"), stage: $("stageCounter"),
    mode: $("modeLabel"), toast: $("canvasMessage"), auto: $("autoBtn"),
    autoText: $("autoText"), pause: $("pauseBtn"), sound: $("soundBtn"), soundText: $("soundText")
  };

  const makeCoins = (groups) => {
    const out = [];
    groups.forEach((g) => {
      for (let i = 0; i < g.count; i += 1) {
        const t = g.count === 1 ? 0 : i / (g.count - 1);
        const arc = g.arc || 0;
        out.push({ x: g.x + i * g.step, y: g.y - Math.sin(t * Math.PI) * arc, taken: false, phase: i * 0.83 + g.x * 0.013 });
      }
    });
    return out;
  };

  const worlds = [
    {
      name:"Neon Outskirts", subtitle:"Twilight fields", icon:"✦", scene:"meadow", length:5000, speed:4.35,
      theme:{top:"#18294c",bottom:"#586286",far:"#435078",mid:"#2b4162",ground:"#263e4c",topline:"#8ca7d7",accent:"#8ca6ff",glow:"#a6a4ff",coin:"#ffd878",pit:"#141d36",particle:"#b9c8ff"},
      hazards:[
        {type:"crate",x:600,w:52,h:44},
        {type:"tunnel",x:1030,w:180,h:30},
        {type:"gap",x:1600,w:100},
        {type:"spikes",x:2090,w:84,h:22},
        {type:"saw",x:2560,w:44,h:32},
        {type:"tunnel",x:3010,w:190,h:30},
        {type:"spikes",x:3610,w:48,h:22},
        {type:"crate",x:4080,w:54,h:44},
        {type:"gap",x:4540,w:105}
      ],
      coinGroups:[{x:325,y:397,count:5,step:42},{x:545,y:300,count:4,step:43,arc:42},{x:850,y:325,count:5,step:42,arc:23},{x:1300,y:395,count:4,step:43},{x:1455,y:306,count:5,step:41,arc:40},{x:1830,y:325,count:4,step:43,arc:24},{x:2250,y:395,count:5,step:42},{x:2370,y:290,count:4,step:43,arc:39},{x:2670,y:320,count:5,step:42,arc:22},{x:3100,y:395,count:4,step:42},{x:3500,y:305,count:5,step:42,arc:38}]
    },
    {
      name:"Crystal Caves", subtitle:"Deep blue caverns", icon:"◇", scene:"cave", length:4050, speed:4.65,
      theme:{top:"#101d3d",bottom:"#314b76",far:"#243a64",mid:"#1a3151",ground:"#1d3448",topline:"#78c7e5",accent:"#74d8ff",glow:"#74bfff",coin:"#8df1ed",pit:"#09172d",particle:"#9ce7ff"},
      hazards:[
        {type:"spikes",x:530,w:84,h:22},
        {type:"gap",x:950,w:100},
        {type:"drone",x:1370,w:50,h:32},
        {type:"tunnel",x:1800,w:180,h:30},
        {type:"gap",x:2300,w:105},
        {type:"crate",x:2780,w:54,h:46},
        {type:"saw",x:3240,w:44,h:32}
      ],
      coinGroups:[{x:290,y:395,count:5,step:43},{x:495,y:302,count:5,step:42,arc:38},{x:790,y:333,count:5,step:42,arc:22},{x:1240,y:395,count:4,step:43},{x:1350,y:292,count:5,step:42,arc:46},{x:1660,y:330,count:5,step:43,arc:20},{x:2070,y:395,count:4,step:43},{x:2210,y:300,count:5,step:42,arc:39},{x:2540,y:330,count:5,step:42,arc:24},{x:2920,y:395,count:4,step:43},{x:3070,y:300,count:5,step:42,arc:38},{x:3410,y:335,count:5,step:42,arc:21},{x:3750,y:395,count:4,step:43}]
    },
    {
      name:"Neon District", subtitle:"After-dark city", icon:"▦", scene:"city", length:4200, speed:4.8,
      theme:{top:"#100f2c",bottom:"#44396c",far:"#29244f",mid:"#211f43",ground:"#25233f",topline:"#c58cff",accent:"#d18cff",glow:"#9a78ff",coin:"#ffe08a",pit:"#0d0d28",particle:"#d6a5ff"},
      hazards:[
        {type:"crate",x:560,w:52,h:44},
        {type:"saw",x:960,w:44,h:32},
        {type:"gap",x:1360,w:105},
        {type:"drone",x:1780,w:50,h:32},
        {type:"tunnel",x:2230,w:170,h:30},
        {type:"spikes",x:2700,w:84,h:22},
        {type:"crate",x:3140,w:54,h:46},
        {type:"gap",x:3560,w:105},
        {type:"spikes",x:3970,w:82,h:22}
      ],
      coinGroups:[{x:305,y:395,count:5,step:43},{x:530,y:300,count:5,step:42,arc:42},{x:830,y:320,count:5,step:42,arc:25},{x:1210,y:395,count:4,step:43},{x:1300,y:294,count:5,step:42,arc:42},{x:1640,y:325,count:5,step:42,arc:22},{x:2040,y:395,count:4,step:43},{x:2200,y:305,count:5,step:42,arc:39},{x:2500,y:326,count:5,step:42,arc:21},{x:2950,y:395,count:4,step:43},{x:3070,y:300,count:5,step:42,arc:42},{x:3400,y:325,count:5,step:42,arc:22},{x:3740,y:395,count:4,step:43}]
    },
    {
      name:"Ember Foundry", subtitle:"Hot metal & sparks", icon:"♨", scene:"foundry", length:4300, speed:4.95,
      theme:{top:"#281728",bottom:"#6e3c45",far:"#5c3546",mid:"#422b3d",ground:"#382a35",topline:"#f4a06f",accent:"#ff986f",glow:"#ff825f",coin:"#ffe08c",pit:"#1d111d",particle:"#ffb07f"},
      hazards:[
        {type:"saw",x:520,w:44,h:32},
        {type:"gap",x:940,w:105},
        {type:"tunnel",x:1360,w:170,h:30},
        {type:"spikes",x:1800,w:84,h:22},
        {type:"gap",x:2220,w:110},
        {type:"drone",x:2660,w:50,h:32},
        {type:"crate",x:3100,w:54,h:46},
        {type:"gap",x:3530,w:108},
        {type:"spikes",x:3970,w:88,h:22}
      ],
      coinGroups:[{x:280,y:395,count:5,step:43},{x:490,y:303,count:5,step:42,arc:42},{x:785,y:325,count:5,step:42,arc:24},{x:1230,y:395,count:4,step:43},{x:1330,y:294,count:5,step:42,arc:40},{x:1640,y:325,count:5,step:42,arc:22},{x:2050,y:395,count:4,step:43},{x:2170,y:299,count:5,step:42,arc:40},{x:2500,y:325,count:5,step:42,arc:21},{x:2940,y:395,count:4,step:43},{x:3070,y:294,count:5,step:42,arc:41},{x:3400,y:325,count:5,step:42,arc:22},{x:3840,y:395,count:4,step:43}]
    },
    {
      name:"Frostbyte Peaks", subtitle:"Frozen frontier", icon:"❄", scene:"ice", length:4420, speed:5.05,
      theme:{top:"#152b46",bottom:"#7095aa",far:"#52768e",mid:"#3d637e",ground:"#345164",topline:"#b2eafa",accent:"#9ae8ff",glow:"#b5f2ff",coin:"#ffe89c",pit:"#132b44",particle:"#d5f7ff"},
      hazards:[
        {type:"crate",x:540,w:54,h:46},
        {type:"gap",x:980,w:105},
        {type:"saw",x:1440,w:44,h:32},
        {type:"tunnel",x:1900,w:180,h:30},
        {type:"spikes",x:2350,w:84,h:22},
        {type:"gap",x:2780,w:110},
        {type:"drone",x:3240,w:50,h:32},
        {type:"crate",x:3700,w:54,h:46},
        {type:"gap",x:4140,w:108}
      ],
      coinGroups:[{x:295,y:395,count:5,step:43},{x:510,y:300,count:5,step:42,arc:42},{x:870,y:325,count:5,step:42,arc:22},{x:1290,y:395,count:4,step:43},{x:1420,y:295,count:5,step:42,arc:41},{x:1740,y:326,count:5,step:42,arc:22},{x:2150,y:395,count:4,step:43},{x:2290,y:300,count:5,step:42,arc:40},{x:2600,y:325,count:5,step:42,arc:22},{x:3030,y:395,count:4,step:43},{x:3190,y:295,count:5,step:42,arc:40},{x:3490,y:326,count:5,step:42,arc:22},{x:3890,y:395,count:4,step:43},{x:4150,y:325,count:4,step:42}]
    },
    {
      name:"Orbit Core", subtitle:"Beyond the stars", icon:"✧", scene:"space", length:4650, speed:5.2,
      theme:{top:"#090f2a",bottom:"#2c2c61",far:"#25275a",mid:"#1b2048",ground:"#202544",topline:"#9ca6ff",accent:"#a99bff",glow:"#a58bff",coin:"#ffe28b",pit:"#080d22",particle:"#c3b8ff"},
      hazards:[
        {type:"drone",x:530,w:50,h:32},
        {type:"gap",x:960,w:105},
        {type:"crate",x:1425,w:54,h:46},
        {type:"saw",x:1880,w:44,h:32},
        {type:"gap",x:2300,w:110},
        {type:"tunnel",x:2800,w:180,h:30},
        {type:"spikes",x:3280,w:84,h:22},
        {type:"crate",x:3750,w:54,h:46},
        {type:"gap",x:4200,w:108}
      ],
      coinGroups:[{x:280,y:395,count:5,step:43},{x:500,y:294,count:5,step:42,arc:42},{x:850,y:325,count:5,step:42,arc:22},{x:1270,y:395,count:4,step:43},{x:1400,y:295,count:5,step:42,arc:42},{x:1730,y:325,count:5,step:42,arc:22},{x:2150,y:395,count:4,step:43},{x:2290,y:298,count:5,step:42,arc:40},{x:2610,y:325,count:5,step:42,arc:22},{x:3020,y:395,count:4,step:43},{x:3180,y:293,count:5,step:42,arc:42},{x:3500,y:325,count:5,step:42,arc:22},{x:3950,y:395,count:4,step:43},{x:4250,y:300,count:5,step:42,arc:38}]
    }
,
    {
      name:"Skyrail Heights",subtitle:"Above the cloudline",icon:"☁",scene:"ice",length:4750,speed:5.15,
      theme:{top:"#132643",bottom:"#6d93b1",far:"#547b9d",mid:"#365b7d",ground:"#2b4a61",topline:"#c3edff",accent:"#9de3ff",glow:"#8edcff",coin:"#ffe39b",pit:"#10233e",particle:"#d5f5ff"},
      hazards:[
        {type:"tunnel",x:510,w:180,h:30},
        {type:"gap",x:900,w:105},
        {type:"crate",x:1340,w:54,h:46},
        {type:"saw",x:1760,w:44,h:32},
        {type:"tunnel",x:2150,w:180,h:30},
        {type:"spikes",x:2540,w:84,h:22},
        {type:"drone",x:2960,w:50,h:32},
        {type:"gap",x:3370,w:108},
        {type:"crate",x:3820,w:54,h:46},
        {type:"tunnel",x:4240,w:170,h:30}
      ],
      coinGroups:Array.from({length:13},(_,i)=>({x:280+i*340,y:i%2?320:395,count:4,step:43,arc:i%2?22:0}))
    },
    {
      name:"Verdant Circuit",subtitle:"The overgrown network",icon:"❧",scene:"meadow",length:4950,speed:5.25,
      theme:{top:"#122b2a",bottom:"#49776a",far:"#35675b",mid:"#234f46",ground:"#23443c",topline:"#a4e8bd",accent:"#8ce9a8",glow:"#75e6a2",coin:"#ffe58c",pit:"#0d2421",particle:"#b1f3ca"},
      hazards:[
        {type:"spikes",x:520,w:84,h:22},
        {type:"gap",x:920,w:105},
        {type:"tunnel",x:1300,w:180,h:30},
        {type:"drone",x:1700,w:50,h:32},
        {type:"saw",x:2100,w:44,h:32},
        {type:"gap",x:2520,w:108},
        {type:"crate",x:2990,w:54,h:46},
        {type:"tunnel",x:3430,w:180,h:30},
        {type:"spikes",x:4000,w:84,h:22},
        {type:"gap",x:4500,w:110}
      ],
      coinGroups:Array.from({length:14},(_,i)=>({x:260+i*335,y:i%2?322:395,count:4,step:43,arc:i%2?24:0}))
    },
    {
      name:"Magma Frontier",subtitle:"The furnace below",icon:"♨",scene:"foundry",length:5150,speed:5.4,
      theme:{top:"#2a1525",bottom:"#7a3d3f",far:"#6e3944",mid:"#4a2939",ground:"#3b2634",topline:"#ffb078",accent:"#ff956c",glow:"#ff704f",coin:"#ffe28b",pit:"#1b101c",particle:"#ffb18a"},
      hazards:[{type:"crate",x:500,w:58,h:55},{type:"tunnel",x:850,w:210,h:30},{type:"gap",x:1200,w:136},{type:"saw",x:1660,w:50,h:39},{type:"spikes",x:2050,w:108,h:22},{type:"drone",x:2460,w:56,h:36},{type:"gap",x:2870,w:138},{type:"tunnel",x:3320,w:230,h:30},{type:"crate",x:3740,w:62,h:58},{type:"saw",x:4170,w:50,h:39},{type:"gap",x:4560,w:140}],
      coinGroups:Array.from({length:15},(_,i)=>({x:250+i*335,y:i%2?322:395,count:4,step:43,arc:i%2?24:0}))
    },
    {
      name:"Quantum Citadel",subtitle:"The final frontier",icon:"✧",scene:"space",length:5500,speed:5.55,
      theme:{top:"#090e2b",bottom:"#37316d",far:"#2e2a63",mid:"#211f50",ground:"#252747",topline:"#b5a6ff",accent:"#b59bff",glow:"#a98aff",coin:"#ffe18c",pit:"#080c20",particle:"#d0baff"},
      hazards:[{type:"drone",x:530,w:58,h:36},{type:"tunnel",x:890,w:230,h:30},{type:"spikes",x:1270,w:108,h:22},{type:"gap",x:1690,w:140},{type:"crate",x:2150,w:62,h:58},{type:"saw",x:2570,w:50,h:39},{type:"tunnel",x:3000,w:240,h:30},{type:"gap",x:3440,w:142},{type:"drone",x:3900,w:58,h:36},{type:"spikes",x:4310,w:110,h:22},{type:"gap",x:4750,w:144},{type:"crate",x:5190,w:64,h:60}],
      coinGroups:Array.from({length:16},(_,i)=>({x:260+i*330,y:i%2?322:395,count:4,step:43,arc:i%2?24:0}))
    }
  ];

  function readNumber(key,fallback){try{return Number(localStorage.getItem(key))||fallback;}catch(_){return fallback;}}

  const state = {
    index:0, score:0, coins:0, lives:3, runs:1, best:readNumber("bongRunnerBest",0),
    auto:true, paused:false, sound:false, started:false, time:0, last:0, camera:0,
    transition:0, messageTimer:0, shake:0, distanceScore:0, maxUnlocked:readNumber("bongRunnerUnlocked",0), lastTrailTick:-1
  };
  const player = {x:140,y:GROUND-58,w:40,h:58,vy:0,grounded:true,run:0,blink:0,trail:[]};
  let level = worlds[0], hazards = [], coins = [], particles = [], audioContext = null;
  const SPEED = 4.65, GRAVITY = 0.66, JUMP = -17.4;
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR,0,0,DPR,0,0); ctx.imageSmoothingEnabled = true;

  function soundTone(freq,duration,type,volume) {
    if(!state.sound) return;
    try {
      if(!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if(audioContext.state === "suspended") audioContext.resume();
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.type = type || "sine"; osc.frequency.setValueAtTime(freq,audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(45,freq*0.55),audioContext.currentTime+duration);
      gain.gain.setValueAtTime(volume || 0.035,audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,audioContext.currentTime+duration);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime+duration);
    } catch (_) {}
  }

  function notify(title,subtitle,duration) {
    ui.toast.innerHTML = '<span class="message-kicker">BONG-PROD ARCADE</span><strong>' + title + '</strong><small>' + subtitle + '</small>';
    ui.toast.classList.remove("hidden");
    state.messageTimer = duration || 1150;
  }
  function hideNotify() { ui.toast.classList.add("hidden"); }
  function addParticles(x,y,count,color,speed,life,size) {
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, v=(0.7+Math.random()*2.8)*(speed||1);
      particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-0.7,life:(life||34)*(0.55+Math.random()*0.65),max:life||34,size:(size||3)*(0.6+Math.random()*0.8),color:color||level.theme.particle});
    }
    if(particles.length>180) particles.splice(0,particles.length-180);
  }
  function updateBest() {
    if(state.score > state.best) {
      state.best = state.score;
      try { localStorage.setItem("bongRunnerBest",String(state.best)); } catch (_) {}
    }
  }
  function loadLevel(index,showMessage) {
    state.index = Math.max(0,Math.min(worlds.length-1,index));
    level = worlds[state.index];
    hazards = level.hazards.map((h,i)=>({...h,passed:false,phase:i*1.7})).sort((a,b)=>a.x-b.x);
    hazards.forEach(h=>{if(h.type==="tunnel")h.floorY=getBaseGroundY(h.x+h.w/2);});
    coins = makeCoins(level.coinGroups);
    particles = []; state.camera = 0; state.transition = 0; state.distanceScore = 0;
    player.x=140; player.ducking=false; player.duckRequested=false; player.h=58; player.y=getGroundY(player.x+player.w/2)-player.h; player.vy=0; player.grounded=true; player.run=0; player.trail=[];
    updateUI();
    updateWorldCards();
    if(showMessage) notify("WORLD " + String(state.index+1).padStart(2,"0"),level.name.toUpperCase(),1050);
    else hideNotify();
  }
  function updateWorldCards() {
    document.querySelectorAll(".world-card").forEach((button)=>{
      const active=Number(button.dataset.level)===state.index;
      button.classList.toggle("active",active);
      button.classList.toggle("cleared",Number(button.dataset.level)<state.maxUnlocked);
      button.setAttribute("aria-pressed",String(active));
    });
  }
  function updateUI() {
    ui.level.textContent=String(state.index+1).padStart(2,"0")+" · "+level.name;
    ui.subtitle.textContent=level.subtitle; ui.icon.textContent=level.icon;
    ui.score.textContent=String(state.score).padStart(6,"0");
    ui.coins.textContent=String(state.coins).padStart(2,"0");
    ui.lives.textContent="♥".repeat(Math.max(0,state.lives))+"♡".repeat(3-Math.max(0,state.lives));
    ui.best.textContent=String(state.best).padStart(6,"0");
    ui.stage.textContent=String(state.index+1).padStart(2,"0")+" / "+String(worlds.length).padStart(2,"0");
    ui.mode.textContent=state.auto?"AUTOPILOT ACTIVE":"MANUAL CONTROL";
    ui.auto.classList.toggle("off",!state.auto);
    ui.auto.setAttribute("aria-pressed",String(state.auto));
    ui.autoText.textContent="Autopilot "+(state.auto?"ON":"OFF");
    ui.pause.innerHTML=state.paused?'<span class="control-icon">▶</span> Resume':'<span class="control-icon">Ⅱ</span> Pause';
    ui.sound.setAttribute("aria-pressed",String(state.sound));
    ui.soundText.textContent=state.sound?"Sound on":"Sound off";
  }
  function updateProgress() {
    const pct=Math.max(0,Math.min(100,(player.x/level.length)*100));
    ui.progress.style.width=pct.toFixed(1)+"%"; ui.progressText.textContent=Math.floor(pct)+"%";
  }
  function smoothStep(value) {
    const t=Math.max(0,Math.min(1,value));
    return t*t*(3-2*t);
  }
  function getBaseGroundY(x) {
    const cycle=1260,offset=state.index*187+93;
    const p=((x+offset)%cycle+cycle)%cycle;
    let shape=0;
    if(p<280) shape=-94*smoothStep(p/280);
    else if(p<520) shape=-94;
    else if(p<800) shape=-94+94*smoothStep((p-520)/280);
    else if(p<920) shape=0;
    else if(p<1040) shape=58*smoothStep((p-920)/120);
    else if(p<1140) shape=58;
    else shape=58*(1-smoothStep((p-1140)/120));
    const smallBumps=Math.sin((x+offset)*0.008)*5+Math.sin((x+offset)*0.019)*2.2;
    return GROUND+shape+smallBumps;
  }
  function getGroundY(x) {
    const tunnel=hazards.find(h=>h.type==="tunnel" && x>=h.x-70 && x<=h.x+h.w+70);
    if(!tunnel || !Number.isFinite(tunnel.floorY)) return getBaseGroundY(x);
    const base=getBaseGroundY(x),floor=tunnel.floorY;
    if(x<tunnel.x){
      const blend=smoothStep((x-(tunnel.x-70))/70);
      return base+(floor-base)*blend;
    }
    if(x<=tunnel.x+tunnel.w) return floor;
    const blend=smoothStep((x-(tunnel.x+tunnel.w))/70);
    return floor+(base-floor)*blend;
  }

  function getGapAt(x) { return hazards.find(h=>h.type==="gap" && x>=h.x && x<=h.x+h.w); }
  function setDuck(value) {
    value=Boolean(value);
    player.duckRequested=value;
    if(value && !player.grounded) return;
    if(player.ducking===value) return;
    const feet=player.y+player.h;
    player.ducking=value;player.h=value?34:58;player.y=feet-player.h;
  }
  function beginManualDuck() {
    if(state.auto) setAutopilot(false);
    setDuck(true);
  }
  function endManualDuck() { setDuck(false); }
  function triggerJump() {
    if(!player.grounded || state.paused || state.transition>0) return false;
    setDuck(false);
    player.vy=JUMP; player.grounded=false; player.run+=0.3;
    addParticles(player.x+15,getGroundY(player.x+20)-4,8,level.theme.particle,1.1,22,2.5);
    soundTone(390,0.13,"triangle",0.025);
    return true;
  }
  function nearestHazard() {
    let nearest=null, bestDist=Infinity;
    for(const h of hazards){
      if(h.passed || h.x+h.w<player.x-22) continue;
      const d=h.x-(player.x+player.w);
      if(d<bestDist){bestDist=d;nearest=h;}
    }
    return nearest?{hazard:nearest,distance:bestDist}:null;
  }
  function jumpLead(h) {
    const flightFrames=(2*Math.abs(JUMP))/GRAVITY;
    const jumpRange=level.speed*flightFrames;
    if(h.type==="gap") return Math.max(54,Math.min(112,jumpRange-h.w-player.w/2-18));
    if(h.type==="drone") return Math.min(150,level.speed*28);
    if(h.type==="saw") return Math.min(138,level.speed*27);
    return Math.min(128,level.speed*25);
  }
  function autopilot() {
    if(!state.auto) return;
    const next=nearestHazard();
    if(!next){if(player.ducking||player.duckRequested)setDuck(false);return;}
    const h=next.hazard,distance=next.distance;
    if(h.type==="beam" || h.type==="tunnel"){
      const enterAt=Math.min(245,level.speed*43);
      const leaveAt=-h.w-player.w-8;
      setDuck(distance<=enterAt && distance>leaveAt);
      return;
    }
    if(player.ducking||player.duckRequested)setDuck(false);
    if(!player.grounded) return;
    const lead=jumpLead(h);
    if(distance<=lead && distance>=-player.w*.4) triggerJump();
  }
  function rectsOverlap(a,b) {
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }
  function hazardRect(h) {
    const ground=getGroundY(h.x+h.w/2);
    if(h.type==="crate") return {x:h.x+5,y:ground-h.h+5,w:h.w-10,h:h.h-5};
    if(h.type==="spikes") return {x:h.x+5,y:ground-h.h+6,w:h.w-10,h:h.h-6};
    if(h.type==="saw") return {x:h.x+5,y:ground-38,w:h.w-10,h:34};
    if(h.type==="drone") return {x:h.x+4,y:ground-44+Math.sin(state.time*2.1+h.phase)*8,w:h.w-8,h:24};
    if(h.type==="beam") return {x:h.x+5,y:getGroundY(h.x+h.w/2)-61,w:h.w-10,h:25};
    if(h.type==="tunnel") return {x:h.x+4,y:h.floorY-70,w:h.w-8,h:28};
    return null;
  }
  function respawn() {
    state.lives-=1; state.shake=16;
    soundTone(145,0.28,"sawtooth",0.04);
    if(state.lives<=0) {
      state.lives=3; state.score=Math.floor(state.score*0.72);
      loadLevel(state.index,false);
      addParticles(player.x+20,GROUND-4,26,"#ff98a8",2.2,42,3);
      notify("RUN RESET","THREE NEW LIVES. TAKE ANOTHER SHOT.",1450);
    } else {
      player.x=140; player.ducking=false; player.duckRequested=false; player.h=58; player.y=getGroundY(player.x+player.w/2)-player.h; player.vy=0; player.grounded=true; player.run=0; player.trail=[];
      state.camera=0; particles=[];
      hazards.forEach(h=>h.passed=false);
      coins=makeCoins(level.coinGroups);
      addParticles(player.x+20,GROUND-4,26,"#ff98a8",2.2,42,3);
      notify("OOPS!","THE BOT IS BACK ON TRACK · "+state.lives+" LIVES LEFT",1050);
    }
    updateUI();
  }
  function completeLevel() {
    state.score+=600+state.lives*125+Math.max(0,Math.floor((level.length-player.x)*0.18));
    updateBest(); state.maxUnlocked=Math.max(state.maxUnlocked,Math.min(worlds.length-1,state.index+1));
    try { localStorage.setItem("bongRunnerUnlocked",String(state.maxUnlocked)); } catch (_) {}
    addParticles(player.x+W*.78,GROUND-80,55,level.theme.glow,2.6,70,4);
    soundTone(720,0.24,"sine",0.04); state.transition=115;
    notify("WORLD CLEARED!",""+level.name.toUpperCase()+" · NEXT WORLD LOADING",1900);
    updateUI();
  }

  function update(dt) {
    state.time+=dt/60;
    if(state.messageTimer>0){state.messageTimer-=dt*16.667;if(state.messageTimer<=0)hideNotify();}
    if(state.shake>0)state.shake=Math.max(0,state.shake-dt);
    if(state.transition>0){
      state.transition-=dt;
      if(state.transition<=0){
        if(state.index>=worlds.length-1){state.runs+=1;state.index=0;state.lives=3;notify("ALL 10 WORLDS CLEARED","ANOTHER RUN? LET'S GO.",1500);}
        else state.index+=1;
        loadLevel(state.index,false);
      }
      updateParticles(dt); return;
    }
    autopilot();

    const wasGrounded=player.grounded;
    player.x += level.speed*dt;
    const center=player.x+player.w*0.52,groundY=getGroundY(center);
    const inGap=Boolean(getGapAt(center));
    if(wasGrounded && !inGap){
      player.y=groundY-player.h;player.vy=0;player.grounded=true;
    } else {
      player.vy+=GRAVITY*dt;player.y+=player.vy*dt;
      if(player.y+player.h>=groundY && !inGap && player.vy>=0){
        player.y=groundY-player.h;player.vy=0;
        if(!wasGrounded)addParticles(player.x+20,groundY-2,5,level.theme.particle,.6,17,2);
        player.grounded=true;
      } else player.grounded=false;
    }
    if(player.grounded && player.duckRequested && !player.ducking) setDuck(true);

    player.run+=dt*(player.grounded?0.23:0.075);
    player.blink+=dt;
    const trailTick=Math.floor(state.time*24);
    if(trailTick!==state.lastTrailTick){state.lastTrailTick=trailTick;player.trail.push({x:player.x-5,y:player.y+8});if(player.trail.length>7)player.trail.shift();}
    if(player.y>H+110){respawn();return;}

    const body={x:player.x+5,y:player.y+(player.ducking?3:5),w:player.w-10,h:player.h-(player.ducking?5:7)};
    for(const h of hazards){
      if(player.x>h.x+h.w+player.w)h.passed=true;
      if(h.type==="gap")continue;
      const hitboxes=hazardRect(h);
      const hit=Array.isArray(hitboxes)?hitboxes.some(r=>rectsOverlap(body,r)):Boolean(hitboxes&&rectsOverlap(body,hitboxes));
      if(hit){respawn();return;}
    }

    for(const c of coins){
      if(c.taken)continue;
      const cy=c.y+Math.sin(state.time*4+c.phase)*4;
      const dx=(player.x+player.w/2)-c.x, dy=(player.y+player.h/2)-cy;
      if(dx*dx+dy*dy<36*36){
        c.taken=true;state.coins+=1;state.score+=100;
        addParticles(c.x,cy,10,level.theme.coin,1.8,28,2.6);
        soundTone(800+(state.coins%4)*90,0.11,"sine",0.025);
      }
    }

    state.camera=Math.max(0,player.x-265);
    const scoreDistance=Math.floor(player.x/120);
    if(scoreDistance>state.distanceScore){state.score+=(scoreDistance-state.distanceScore)*2;state.distanceScore=scoreDistance;}
    updateBest();updateUI();updateProgress();updateParticles(dt);
    if(player.x+player.w>=level.length)completeLevel();
  }

  function updateParticles(dt) {
    particles=particles.filter(p=>p.life>0);
    for(const p of particles){
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=0.09*dt;p.vx*=Math.pow(.985,dt);p.life-=dt;
    }
  }

  function rounded(x,y,w,h,r,color) {
    ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
  }
  function glowCircle(x,y,r,color,alpha) {
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.globalAlpha=alpha===undefined?1:alpha;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  function drawSky() {
    const t=level.theme;
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,t.top);sky.addColorStop(.62,t.bottom);sky.addColorStop(1,t.mid);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    glowCircle(820,125,280,t.glow,.5);
    const haze=ctx.createLinearGradient(0,H*.42,0,H);
    haze.addColorStop(0,"rgba(0,0,0,0)");haze.addColorStop(.7,"rgba(0,0,0,.03)");haze.addColorStop(1,"rgba(0,0,0,.25)");
    ctx.fillStyle=haze;ctx.fillRect(0,0,W,H);
    if(level.scene==="space"){
      ctx.save();ctx.strokeStyle="rgba(192,190,255,.18)";ctx.lineWidth=1;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(820,128,85+i*28,34+i*13,-.3,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
      glowCircle(820,125,44,"#b6a1ff",.3);
    } else {
      ctx.fillStyle="rgba(255,255,255,.20)";ctx.beginPath();ctx.arc(825,138,52,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=t.accent;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(825,138,36,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    }
    for(let i=0;i<85;i++){
      const x=((i*157-state.camera*(level.scene==="space"?.035:.07))%(W+40)+(W+40))%(W+40);
      const y=24+(i*73)%305;
      const a=.22+((i*17)%65)/100;
      ctx.fillStyle="rgba(229,238,255,"+a+")";ctx.fillRect(x,y,(i%9===0)?3:1.5,(i%9===0)?3:1.5);
    }
    drawClouds();
    drawMountains(t.far,.12,355,120);
    drawMountains(t.mid,.23,402,88);
    drawSceneDetails();
  }
  function drawClouds(){
    if(level.scene==="space")return;
    for(let i=0;i<6;i++){
      const x=((i*255-state.camera*.16)%(W+260)+(W+260))%(W+260)-110;
      const y=86+(i*61)%120;
      ctx.fillStyle="rgba(222,231,255,.075)";
      ctx.beginPath();ctx.ellipse(x,y,42,12,0,0,Math.PI*2);ctx.ellipse(x+28,y-7,27,17,0,0,Math.PI*2);ctx.ellipse(x+52,y,35,12,0,0,Math.PI*2);ctx.fill();
    }
  }
  function drawMountains(color,factor,base,amp){
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,H);
    for(let x=0;x<=W+10;x+=10){
      const wx=x+state.camera*factor;
      const y=base-Math.sin(wx*.0028)*amp*.37-Math.sin(wx*.0062+1.4)*amp*.24-Math.sin(wx*.0013+2)*amp*.25;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  }
  function drawSceneDetails(){
    const scene=level.scene;
    if(scene==="city"||scene==="foundry"){
      for(let i=0;i<15;i++){
        const x=((i*105-state.camera*.36)%(W+150)+(W+150))%(W+150)-50;
        const h=65+(i*37)%145,w=43+(i%3)*13,y=GROUND-h;
        ctx.fillStyle=scene==="city"?"rgba(18,20,52,.85)":"rgba(44,27,42,.8)";ctx.fillRect(x,y,w,h);
        ctx.fillStyle=level.theme.accent;ctx.globalAlpha=.12;
        for(let wy=y+14;wy<GROUND-9;wy+=21)for(let wx=x+8;wx<x+w-5;wx+=15)ctx.fillRect(wx,wy,5,7);
        ctx.globalAlpha=1;
        ctx.fillStyle=scene==="city"?"rgba(206,153,255,.42)":"rgba(255,151,108,.35)";ctx.fillRect(x+5,y+5,w-10,2);
      }
    } else if(scene==="cave"){
      for(let i=0;i<14;i++){
        const x=((i*104-state.camera*.32)%(W+110)+(W+110))%(W+110)-40;
        const h=34+(i*31)%85;
        ctx.fillStyle="rgba(12,29,52,.65)";ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+12,0);ctx.lineTo(x+7, h);ctx.lineTo(x+3,h+12);ctx.lineTo(x-5,h);ctx.closePath();ctx.fill();
        ctx.fillStyle="rgba(132,224,255,.32)";ctx.fillRect(x+3,h-6,2,8);
      }
    } else if(scene==="ice"){
      for(let i=0;i<13;i++){
        const x=((i*116-state.camera*.3)%(W+120)+(W+120))%(W+120)-40;
        const h=50+(i*23)%95;
        ctx.fillStyle="rgba(194,235,255,.12)";ctx.beginPath();ctx.moveTo(x,GROUND-12);ctx.lineTo(x+20,GROUND-h);ctx.lineTo(x+41,GROUND-12);ctx.closePath();ctx.fill();
        ctx.strokeStyle="rgba(218,248,255,.18)";ctx.beginPath();ctx.moveTo(x+20,GROUND-h);ctx.lineTo(x+20,GROUND-12);ctx.stroke();
      }
    } else if(scene==="meadow"){
      for(let i=0;i<18;i++){
        const x=((i*89-state.camera*.4)%(W+90)+(W+90))%(W+90)-25;
        const y=GROUND-35-(i*19)%35;
        ctx.fillStyle="rgba(157,197,170,.18)";ctx.beginPath();ctx.arc(x,y,10+(i%3)*4,Math.PI,Math.PI*2);ctx.fill();
      }
    } else if(scene==="space"){
      for(let i=0;i<8;i++){
        const x=((i*177-state.camera*.18)%(W+200)+(W+200))%(W+200)-50;
        const y=100+(i*73)%220;
        ctx.strokeStyle="rgba(175,161,255,.18)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,17+(i%3)*8,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle="rgba(176,164,255,.28)";ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
      }
    }
  }

  function drawGround(){
    const t=level.theme,step=10,left=Math.floor(state.camera/step)*step-step,right=state.camera+W+step;
    let points=[];
    const paintSegment=()=>{
      if(points.length<2){points=[];return;}
      ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
      ctx.lineTo(points[points.length-1].x,H);ctx.lineTo(points[0].x,H);ctx.closePath();
      const fill=ctx.createLinearGradient(0,GROUND-40,0,H);fill.addColorStop(0,t.ground);fill.addColorStop(1,"#101827");ctx.fillStyle=fill;ctx.fill();
      ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
      ctx.strokeStyle=t.topline;ctx.lineWidth=5;ctx.lineJoin="round";ctx.stroke();ctx.strokeStyle="rgba(5,11,24,.24)";ctx.lineWidth=1;
      for(let i=0;i<points.length-1;i+=5){ctx.beginPath();ctx.moveTo(points[i].x,points[i].y+8);ctx.lineTo(points[i].x,Math.min(H,points[i].y+38));ctx.stroke();}
      points=[];
    };
    for(let wx=left;wx<=right;wx+=step){if(getGapAt(wx+step/2)){paintSegment();continue;}points.push({x:wx-state.camera,y:getGroundY(wx)});}paintSegment();
    for(let wx=Math.floor(state.camera/96)*96;wx<right;wx+=96){
      if(getGapAt(wx+22))continue;const x=wx-state.camera,y=getGroundY(wx+22);
      ctx.fillStyle="rgba(225,238,255,.11)";ctx.fillRect(x+7,y+18,11,2);ctx.fillRect(x+39,y+34,7,2);
      if(level.scene==="foundry"&&wx%192===0){ctx.fillStyle="rgba(255,151,99,.28)";ctx.fillRect(x+17,y+7,2,18);}
      if(level.scene==="ice"&&wx%192===0){ctx.fillStyle="rgba(211,249,255,.32)";ctx.fillRect(x+10,y+8,20,2);}
    }
    for(const h of hazards.filter(h=>h.type==="gap")){
      const x=h.x-state.camera,gy1=getGroundY(h.x),gy2=getGroundY(h.x+h.w);if(x>W||x+h.w<0)continue;
      const pit=ctx.createLinearGradient(0,Math.min(gy1,gy2),0,H);pit.addColorStop(0,t.pit);pit.addColorStop(1,"rgba(5,8,18,.98)");
      ctx.fillStyle=pit;ctx.beginPath();ctx.moveTo(x,gy1);ctx.lineTo(x+8,gy1+15);ctx.lineTo(x+h.w-8,gy2+15);ctx.lineTo(x+h.w,gy2);ctx.lineTo(x+h.w,H);ctx.lineTo(x,H);ctx.closePath();ctx.fill();
      ctx.fillStyle=t.accent;ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(x,gy1);ctx.lineTo(x+8,gy1+15);ctx.lineTo(x+8,gy1+19);ctx.lineTo(x,gy1+4);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
      if(level.scene==="foundry"){ctx.fillStyle="rgba(255,103,69,.35)";for(let sx=x+10;sx<x+h.w;sx+=28){ctx.beginPath();ctx.arc(sx,GROUND+75+Math.sin(state.time*3+sx)*12,7,0,Math.PI*2);ctx.fill();}}
      else if(level.scene==="space"){ctx.fillStyle="rgba(158,139,255,.36)";ctx.fillRect(x+8,GROUND+85,h.w-16,2);}
    }
  }
  function drawCrate(h,x){
    const y=getGroundY(h.x+h.w/2)-h.h;
    const gr=ctx.createLinearGradient(x,y,x+h.w,y+h.h);gr.addColorStop(0,level.theme.topline);gr.addColorStop(.45,level.theme.accent);gr.addColorStop(1,level.theme.mid);
    rounded(x,y,h.w,h.h,7,gr);
    ctx.strokeStyle="rgba(255,255,255,.66)";ctx.lineWidth=2;ctx.strokeRect(x+6,y+6,h.w-12,h.h-12);
    ctx.strokeStyle="rgba(8,12,24,.58)";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+8,y+8);ctx.lineTo(x+h.w-8,y+h.h-8);ctx.moveTo(x+h.w-8,y+8);ctx.lineTo(x+8,y+h.h-8);ctx.stroke();
    ctx.fillStyle="#d9d6ea";for(const p of [[x+7,y+7],[x+h.w-10,y+7],[x+7,y+h.h-10],[x+h.w-10,y+h.h-10]]){ctx.beginPath();ctx.arc(p[0],p[1],2,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle="rgba(255,255,255,.16)";ctx.fillRect(x+9,y+7,h.w-18,3);
  }
  function drawSpikes(h,x){
    const base=getGroundY(h.x+h.w/2),y=base-h.h;
    ctx.shadowColor=level.theme.accent;ctx.shadowBlur=10;ctx.fillStyle=level.theme.accent;
    ctx.beginPath();for(let sx=x;sx<x+h.w;sx+=20){ctx.moveTo(sx,base);ctx.lineTo(sx+10,y);ctx.lineTo(sx+20,base);}ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,255,255,.62)";for(let sx=x+7;sx<x+h.w;sx+=20){ctx.beginPath();ctx.moveTo(sx,base-4);ctx.lineTo(sx+3,y+13);ctx.lineTo(sx+7,base-4);ctx.fill();}
  }
  function drawSaw(h,x){
    const y=getGroundY(h.x+h.w/2)-20,rot=state.time*5+h.phase;
    ctx.save();ctx.translate(x+h.w/2,y);ctx.rotate(rot);
    ctx.shadowColor="#ff98b4";ctx.shadowBlur=14;
    ctx.fillStyle=level.theme.topline;ctx.beginPath();
    for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2===0?24:17;const px=Math.cos(a)*r,py=Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle="#59678e";ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#c4ceef";ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawDrone(h,x){
    const y=getGroundY(h.x+h.w/2)-50+Math.sin(state.time*2.1+h.phase)*8;
    ctx.save();ctx.translate(x+h.w/2,y+h.h/2);
    ctx.shadowColor=level.theme.glow;ctx.shadowBlur=18;
    rounded(-23,-12,46,24,10,level.theme.mid);ctx.shadowBlur=0;
    rounded(-16,-8,32,14,7,level.theme.accent);
    ctx.fillStyle="#a7fff0";ctx.fillRect(-8,-2,5,4);ctx.fillRect(5,-2,5,4);
    ctx.strokeStyle=level.theme.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-18,-13);ctx.lineTo(-25,-20);ctx.moveTo(18,-13);ctx.lineTo(25,-20);ctx.stroke();
    ctx.fillStyle="#e2e7ff";ctx.fillRect(-28,-22,12,3);ctx.fillRect(16,-22,12,3);
    ctx.restore();
  }
  function drawBeam(h,x){
    const y=getGroundY(h.x+h.w/2)-61;ctx.save();ctx.shadowColor=level.theme.glow;ctx.shadowBlur=15;
    const gradient=ctx.createLinearGradient(x,y,x,y+26);gradient.addColorStop(0,"#f8f6ff");gradient.addColorStop(.35,level.theme.accent);gradient.addColorStop(1,"#394566");
    rounded(x,y,h.w,26,6,gradient);ctx.shadowBlur=0;ctx.fillStyle="rgba(8,13,28,.8)";
    for(let sx=x+10;sx<x+h.w-5;sx+=18)ctx.fillRect(sx,y+8,8,4);
    ctx.fillStyle="#fff";ctx.globalAlpha=.7;ctx.fillRect(x+7,y+3,h.w-14,2);ctx.globalAlpha=1;ctx.strokeStyle=level.theme.glow;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x+8,y+26);ctx.lineTo(x+8,y+33);ctx.moveTo(x+h.w-8,y+26);ctx.lineTo(x+h.w-8,y+33);ctx.stroke();ctx.restore();
  }
  function drawTunnel(h,x){
    const roofY=h.floorY-70;
    const grad=ctx.createLinearGradient(x,roofY,x,roofY+28);
    grad.addColorStop(0,level.theme.topline);grad.addColorStop(.45,level.theme.accent);grad.addColorStop(1,level.theme.mid);
    ctx.save();ctx.shadowColor=level.theme.glow;ctx.shadowBlur=18;
    rounded(x,roofY,h.w,28,8,grad);ctx.shadowBlur=0;
    ctx.fillStyle="rgba(8,12,24,.7)";
    for(let sx=x+16;sx<x+h.w-12;sx+=28)ctx.fillRect(sx,roofY+9,13,5);
    rounded(x,roofY+28,12,Math.max(8,h.floorY-roofY-28),4,level.theme.mid);
    rounded(x+h.w-12,roofY+28,12,Math.max(8,h.floorY-roofY-28),4,level.theme.mid);
    ctx.fillStyle="#fff";ctx.globalAlpha=.95;ctx.font="800 10px Manrope,Arial";ctx.textAlign="center";
    ctx.fillText("DUCK  ↓",x+h.w/2,h.floorY-49);ctx.globalAlpha=1;ctx.restore();
  }
  function drawHazards(){
    for(const h of hazards){
      if(h.type==="gap"||h.x-state.camera>W+100||h.x+h.w-state.camera<-100)continue;const x=h.x-state.camera;
      if(h.type==="crate")drawCrate(h,x);else if(h.type==="spikes")drawSpikes(h,x);else if(h.type==="saw")drawSaw(h,x);else if(h.type==="drone")drawDrone(h,x);else if(h.type==="beam")drawBeam(h,x);else if(h.type==="tunnel")drawTunnel(h,x);
    }
  }

  function drawCoins(){
    for(const c of coins){
      if(c.taken)continue;
      const x=c.x-state.camera;if(x<-30||x>W+30)continue;
      const y=c.y+Math.sin(state.time*4+c.phase)*5;
      const scale=.35+Math.abs(Math.sin(state.time*3+c.phase))*.65;
      ctx.save();ctx.translate(x,y);ctx.scale(scale,1);
      ctx.shadowColor=level.theme.coin;ctx.shadowBlur=16;ctx.fillStyle=level.theme.coin;
      ctx.beginPath();ctx.ellipse(0,0,8,11,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      ctx.strokeStyle="#fff5c8";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,3,7,0,0,Math.PI*2);ctx.stroke();
      ctx.restore();
      ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect(x-1,y-15,2,3);
    }
  }
  function drawGoal(){
    const x=level.length-state.camera-38;if(x<-80||x>W+100)return;
    const y=getGroundY(level.length-38)-94,phase=state.time*2;
    glowCircle(x+25,y+45,72,level.theme.glow,.32);
    ctx.save();ctx.translate(x+25,y+45);ctx.rotate(phase*.16);
    ctx.strokeStyle=level.theme.accent;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,22,45,0,0,Math.PI*2);ctx.stroke();
    ctx.rotate(-phase*.32);ctx.strokeStyle="rgba(231,229,255,.75)";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,35,18,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();
    rounded(x+9,y+5,32,83,16,"rgba(177,169,255,.1)");
    ctx.strokeStyle="rgba(220,222,255,.75)";ctx.lineWidth=2;ctx.strokeRect(x+9,y+5,32,83);
  }

  function drawPlayer(){
    const x=player.x-state.camera,y=player.y;
    const run=player.grounded?Math.sin(player.run*2.5):0;
    const scarf=Math.sin(state.time*11)*3;
    const ground=getGroundY(player.x+player.w/2);
    const shadowScale=Math.max(.45,1-Math.max(0,ground-(y+player.h))*.003);
    ctx.fillStyle="rgba(4,8,18,.36)";ctx.beginPath();ctx.ellipse(x+20,ground+4,22*shadowScale,5*shadowScale,0,0,Math.PI*2);ctx.fill();

    for(let i=player.trail.length-1;i>=0;i--){
      const p=player.trail[i],tx=p.x-state.camera;
      ctx.globalAlpha=(i/player.trail.length)*.12;rounded(tx,p.y+7,player.w-6,player.h-12,11,level.theme.accent);
    }
    ctx.globalAlpha=1;

    ctx.save();
    if(player.ducking){ctx.translate(Math.round(x),Math.round(y+player.h));ctx.scale(1,player.h/58);ctx.translate(0,-58);}
    else ctx.translate(Math.round(x),Math.round(y));
    // scarf fluttering behind the runner
    ctx.fillStyle=level.theme.glow;ctx.beginPath();ctx.moveTo(7,25);ctx.quadraticCurveTo(-10,20+scarf,-18,29+scarf);ctx.lineTo(-10,34+scarf);ctx.lineTo(8,32);ctx.closePath();ctx.fill();
    // animated legs and boots
    const legA=run*7,legB=-run*7;
    ctx.save();ctx.translate(12,41);ctx.rotate(legA*.045);rounded(-5,-1,10,14,4,level.theme.mid);rounded(-7,9,14,7,4,level.theme.topline);ctx.restore();
    ctx.save();ctx.translate(29,41);ctx.rotate(legB*.045);rounded(-5,-1,10,14,4,level.theme.mid);rounded(-7,9,14,7,4,level.theme.topline);ctx.restore();
    // arms
    ctx.save();ctx.translate(7,28);ctx.rotate(-run*.11);rounded(-5,0,8,18,4,"#8298d6");ctx.restore();
    ctx.save();ctx.translate(34,28);ctx.rotate(run*.11);rounded(-3,0,8,18,4,"#8298d6");ctx.restore();
    // body
    ctx.shadowColor=level.theme.glow;ctx.shadowBlur=10;rounded(5,20,31,27,9,level.theme.accent);ctx.shadowBlur=0;
    rounded(7,23,27,10,4,level.theme.topline);rounded(11,35,18,4,2,"rgba(222,233,255,.72)");
    // helmet
    ctx.shadowColor="#adbcff";ctx.shadowBlur=12;rounded(2,1,38,29,11,"#e3ebff");ctx.shadowBlur=0;
    rounded(6,5,30,21,8,"#6076af");rounded(9,10,24,11,5,"#111b35");
    ctx.fillStyle="#a8ffe7";ctx.shadowColor="#9affdf";ctx.shadowBlur=8;ctx.fillRect(13,13,5,4);ctx.fillRect(24,13,5,4);ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,255,255,.65)";ctx.fillRect(8,6,9,2);
    // chest light
    ctx.fillStyle=level.theme.accent;ctx.shadowColor=level.theme.accent;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(21,31,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.restore();
  }

  function drawParticles(){
    for(const p of particles){
      const alpha=Math.max(0,p.life/p.max);
      ctx.globalAlpha=alpha;ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x-state.camera,p.y,p.size*alpha,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  function drawPause(){
    if(!state.paused)return;
    ctx.fillStyle="rgba(5,10,22,.62)";ctx.fillRect(0,0,W,H);
    ctx.textAlign="center";ctx.fillStyle="#fff";ctx.font="800 39px Manrope,Arial";ctx.fillText("PAUSED",W/2,H/2-5);
    ctx.fillStyle="#aab8d7";ctx.font="13px 'DM Mono',monospace";ctx.fillText("PRESS P OR RESUME TO CONTINUE",W/2,H/2+28);
  }
  function draw(){
    const shake=state.shake>0?(Math.random()-.5)*state.shake:0;
    ctx.save();ctx.translate(shake,0);
    drawSky();drawGround();drawGoal();drawHazards();drawCoins();drawParticles();drawPlayer();
    ctx.restore();drawPause();
  }

  function setAutopilot(value){
    state.auto=value;updateUI();
    if(value)notify("AUTOPILOT ENGAGED","THE BOT HAS THE CONTROLS",750);
    else notify("MANUAL CONTROL","SPACE / ↑ / W TO JUMP",750);
  }
  function togglePause(){
    state.paused=!state.paused;updateUI();
    if(state.paused)notify("PAUSED","TAKE A BREATHER",500);else hideNotify();
  }
  function restart(){
    state.lives=3;state.coins=0;state.score=0;state.runs=1;loadLevel(state.index,false);
    notify("FRESH RUN","LET'S MAKE THIS ONE COUNT",900);
  }
  function toggleSound(){
    state.sound=!state.sound;
    if(state.sound){soundTone(520,.1,"sine",.02);soundTone(740,.12,"sine",.018);}
    updateUI();
  }
  function chooseLevel(index){
    state.lives=3;state.coins=0;state.score=0;loadLevel(index,true);
  }

  function frame(now){
    const dt=state.last?Math.min(2.25,(now-state.last)/16.6667):1;state.last=now;
    if(!state.paused)update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  function onKey(event){
    if(event.code==="Space"||event.code==="ArrowUp"||event.code==="KeyW"){event.preventDefault();state.started=true;if(!state.auto)triggerJump();else if(player.grounded)triggerJump();}
    if(event.code==="ArrowDown"||event.code==="KeyS"||event.code==="ShiftLeft"||event.code==="ShiftRight"){
      event.preventDefault();
      if(!event.repeat) beginManualDuck();
      else if(!player.duckRequested) setDuck(true);
    }
    if(event.code==="KeyP"){event.preventDefault();togglePause();}
    if(event.code==="KeyR"){event.preventDefault();restart();}
  }
  function onKeyUp(event){if(event.code==="ArrowDown"||event.code==="KeyS"||event.code==="ShiftLeft"||event.code==="ShiftRight")endManualDuck();}
  window.addEventListener("keydown",onKey);
  window.addEventListener("keyup",onKeyUp);
  window.addEventListener("blur",endManualDuck);
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&!state.paused){state.paused=true;setDuck(false);updateUI();}});
  $("autoBtn").addEventListener("click",()=>setAutopilot(!state.auto));
  $("pauseBtn").addEventListener("click",togglePause);
  $("restartBtn").addEventListener("click",restart);
  $("jumpBtn").addEventListener("click",()=>{if(state.auto)setAutopilot(false);triggerJump();});
  const duckButton=$("duckBtn"),beginDuck=(event)=>{event.preventDefault();beginManualDuck();},endDuck=()=>endManualDuck();
  duckButton.addEventListener("pointerdown",beginDuck);
  ["pointerup","pointercancel","pointerleave","lostpointercapture"].forEach(name=>duckButton.addEventListener(name,endDuck));
  $("soundBtn").addEventListener("click",toggleSound);
  document.querySelectorAll(".world-card").forEach((button)=>button.addEventListener("click",()=>chooseLevel(Number(button.dataset.level))));
  canvas.addEventListener("pointerdown",()=>{if(!state.auto)triggerJump();});
  canvas.addEventListener("contextmenu",(e)=>e.preventDefault());

  loadLevel(0,false);
  notify("READY TO RUN?","THE AUTOPILOT IS WARMING UP",1450);
  updateUI();
  requestAnimationFrame(frame);
})();