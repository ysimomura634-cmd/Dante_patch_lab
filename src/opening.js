/* ==== DANTE PATCH LAB — OPENING & SFX (Ver 1.1) ==== */
const SFX={
  ctx:null,muted:false,
  init(){
    if(this.ctx)return;
    try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}
    try{this.muted=localStorage.getItem('dpl_mute')==='1';}catch(e){}
    this._updateBtn();
  },
  _updateBtn(){
    const b=document.getElementById('sfx-btn');
    if(b)b.textContent=this.muted?'🔇':'🔊';
  },
  toggle(){
    this.muted=!this.muted;
    try{localStorage.setItem('dpl_mute',this.muted?'1':'0');}catch(e){}
    this._updateBtn();
    if(!this.muted)this.play('tick');
  },
  _env(node,t,a,d,peak){ // attack/decay envelope
    const g=this.ctx.createGain();
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(peak,t+a);
    g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);
    node.connect(g);g.connect(this.ctx.destination);
    return g;
  },
  _osc(type,f0,f1,t,dur){
    const o=this.ctx.createOscillator();
    o.type=type;o.frequency.setValueAtTime(f0,t);
    if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    o.start(t);o.stop(t+dur+0.05);
    return o;
  },
  _noise(t,dur){
    const len=Math.max(1,Math.floor(this.ctx.sampleRate*dur));
    const buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    const s=this.ctx.createBufferSource();s.buffer=buf;s.start(t);
    return s;
  },
  play(name){
    if(this.muted||!this.ctx)return;
    if(this.ctx.state==='suspended')this.ctx.resume();
    const t=this.ctx.currentTime+0.01;
    try{
      switch(name){
        case 'press':{ // タイトル決定
          this._env(this._osc('square',220,660,t,.18),t,.005,.22,.12);
          this._env(this._osc('sine',440,1320,t,.18),t,.005,.25,.08);
          break;}
        case 'start':{ // 出題開始: 上昇スイープ
          this._env(this._osc('sawtooth',300,900,t,.28),t,.01,.3,.07);
          break;}
        case 'clear':{ // ★CLEAR「バコン」+チャイム
          const th=this._osc('sine',110,55,t,.22);        // 低音の胴
          this._env(th,t,.002,.3,.35);
          const nz=this._noise(t,.14);                     // 打撃ノイズ
          const bp=this.ctx.createBiquadFilter();
          bp.type='bandpass';bp.frequency.value=1800;bp.Q.value=.8;
          nz.connect(bp);
          const g=this.ctx.createGain();
          g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.0001,t+.14);
          bp.connect(g);g.connect(this.ctx.destination);
          [659.25,830.61,987.77].forEach((f,i)=>{          // E5-G#5-B5 チャイム
            this._env(this._osc('sine',f,null,t+.1+i*.07,.6),t+.1+i*.07,.01,.6,.10);
          });
          break;}
        case 'resolve':{ // 適正化「キラン」
          this._env(this._osc('sine',1318,1760,t,.12),t,.005,.28,.09);
          this._env(this._osc('sine',1760,2637,t+.08,.14),t+.08,.005,.3,.07);
          break;}
        case 'giveup':{ // 「しゅん…」
          this._env(this._osc('sine',520,240,t,.4),t,.01,.45,.09);
          break;}
        case 'swish':{ // インスペクタ「にゅっ」
          const nz=this._noise(t,.2);
          const f=this.ctx.createBiquadFilter();
          f.type='bandpass';f.Q.value=1.2;
          f.frequency.setValueAtTime(500,t);
          f.frequency.exponentialRampToValueAtTime(2600,t+.18);
          nz.connect(f);
          const g=this.ctx.createGain();
          g.gain.setValueAtTime(.0001,t);
          g.gain.exponentialRampToValueAtTime(.09,t+.04);
          g.gain.exponentialRampToValueAtTime(.0001,t+.2);
          f.connect(g);g.connect(this.ctx.destination);
          break;}
        case 'tick':{ // パッチ操作の小さなクリック
          this._env(this._osc('square',1500,null,t,.03),t,.001,.04,.05);
          break;}
      }
    }catch(e){/* 音は演出。失敗しても学習は止めない */}
  }
};
window.toggleSfx=()=>{SFX.init();SFX.toggle()};

/* ---- OPENING ---- */
(function(){
  const op=document.getElementById('opening');
  if(!op)return;
  let done=false;
  const dismiss=()=>{
    if(done)return;done=true;
    SFX.init();SFX.play('press');
    op.classList.add('op-hide');
    setTimeout(()=>op.remove(),900);
    window.removeEventListener('keydown',dismiss);
  };
  op.addEventListener('click',dismiss);
  window.addEventListener('keydown',dismiss);
})();
