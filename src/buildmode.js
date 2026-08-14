/* ==== DANTE PATCH LAB — BUILD MODE (v1.4β) ====
   自由構築サンドボックス。sysを動的に組み立て、既存diagnosticsが審判を務める。
   本体(app.js)への依存: sys/CAT/makeDev/refresh/runDiag/countEW/abortChallenge/
   assignIPs/rxDevices/loadPreset/log/SFX/PRESETS/presetKey/W/H/cv */
window.BUILDMODE=(function(){
  const PALETTE=[
    {g:'卓',   m:'DM7'},{g:'卓',m:'DM7 Compact'},
    {g:'I/O',  m:'Rio3224-D2'},{g:'I/O',m:'Rio1608-D2'},
    {g:'SW P', m:'SWP1-8',net:'P'},{g:'SW P',m:'SWP1-16MMF',net:'P'},{g:'SW P',m:'SWP2-10MMF',net:'P'},
    {g:'SW S', m:'SWP1-8',net:'S'},{g:'SW S',m:'SWP1-16MMF',net:'S'},{g:'SW S',m:'SWP2-10MMF',net:'S'},
    {g:'AVIO', m:'AVIO AI2'},{g:'AVIO',m:'AVIO AO2'},{g:'AVIO',m:'AVIO USB'},
    {g:'PC',   m:'REC PC'},
  ];
  const SHORT={'DM7':'DM7','DM7 Compact':'DM7C','Rio3224-D2':'Rio32','Rio1608-D2':'Rio16',
    'SWP1-8':'SW','SWP1-16MMF':'SW16','SWP2-10MMF':'SW2','AVIO AI2':'AI2','AVIO AO2':'AO2','AVIO USB':'USB','REC PC':'PC'};

  let on=false,tool='select',pending=null,linkFrom=null,greenOnce=false,seq=1,
      drag=null,dragMoved=false;

  const emptySys=()=>({devices:{},links:[],igmp:true,latency:1,querier:true,subs:{},mcast:{},ha:{}});

  /* ---------- 入退場 ---------- */
  function enter(){
    abortChallenge();
    on=true;tool='select';pending=null;linkFrom=null;greenOnce=false;seq=1;
    presetKey='BUILD';
    sys=emptySys();selDev=null;rxSel=null;packets=[];
    document.getElementById('sys-title').innerHTML='TOPOLOGY<span class="desc">BUILD — 自由構築 (β)</span>';
    document.querySelectorAll('#preset-tabs .tab').forEach(b=>b.classList.toggle('on',b.id==='tab-build'));
    const ip=document.getElementById('ins-panel');if(ip)ip.classList.remove('open');
    refresh();renderBar();
    log('sys','🏗 <b>BUILD</b> — 機材パレットから選んでキャンバスをクリック配置。⚡接続でケーブル、設定は機器クリック。ALL GREENを出せばSAVEできる');
  }
  function leave(){
    on=false;pending=null;linkFrom=null;drag=null;
    const t=document.getElementById('tab-build');if(t)t.classList.remove('on');
  }

  /* ---------- 機材の追加/削除/接続 ---------- */
  function nextUnitId(){
    let u=1;const used=new Set(Object.values(sys.devices).filter(d=>CAT[d.model].cat==='rio').map(d=>d.unitId));
    while(used.has(u))u++;return u;
  }
  function armPlace(m,net){
    pending={m,net:net||null};linkFrom=null;
    if(typeof SFX!=='undefined')SFX.play('swish');
    log('sys',`配置モード: <b>${m}</b>${net?` (${net}系)`:''} — キャンバスの置きたい場所をクリック`);
    renderBar();
  }
  function place(x,y){
    const {m,net}=pending;
    const id='b'+(seq++);
    const cnt=Object.values(sys.devices).filter(d=>d.model===m).length+1;
    const opt={};
    if(net)opt.net=net;
    if(CAT[m].cat==='rio')opt.unitId=nextUnitId();
    sys.devices[id]=makeDev(id,m,`${SHORT[m]||m}-${cnt}`,
      Math.max(60,Math.min(W-60,x)),Math.max(40,Math.min(H-40,y)),opt);
    assignIPs();
    if(!rxSel&&CAT[m].rx>0)rxSel=id;
    pending=null;
    if(typeof SFX!=='undefined')SFX.play('press');
    refresh();renderBar();
  }
  function delDev(id){
    const d=sys.devices[id];if(!d)return;
    delete sys.devices[id];
    sys.links=sys.links.filter(l=>l.a!==id&&l.b!==id);
    for(const k of Object.keys(sys.subs)){
      if(k.split(':')[0]===id||sys.subs[k].tx===id)delete sys.subs[k];
    }
    for(const k of Object.keys(sys.ha||{})){
      if(k===id)delete sys.ha[k];
      else sys.ha[k]=(sys.ha[k]||[]).filter(v=>v!==id);
    }
    if(rxSel===id)rxSel=(rxDevices()[0]||{}).id||null;
    if(selDev===id)selDev=null;
    if(typeof SFX!=='undefined')SFX.play('swish');
    log('sys',`🗑 撤去: <b>${d.name}</b>(ケーブル・パッチも同時に撤去)`);
    refresh();renderBar();
  }
  function toggleLink(aid,bid){
    const i=sys.links.findIndex(l=>(l.a===aid&&l.b===bid)||(l.a===bid&&l.b===aid));
    const A=sys.devices[aid],B=sys.devices[bid];
    if(i>=0){
      sys.links.splice(i,1);
      log('sys',`✂ ケーブル撤去: ${A.name} ↔ ${B.name}`);
    }else{
      const avio=CAT[A.model].cat==='avio'||CAT[B.model].cat==='avio';
      sys.links.push({a:aid,b:bid,speed:avio?100:1000});
      log('sys',`⚡ 接続: <b>${A.name} ↔ ${B.name}</b> ${avio?'(100M — AVIOはUltimo)':'(1G)'}`);
    }
    if(typeof SFX!=='undefined')SFX.play('press');
    refresh();renderBar();
  }
  function clearAll(){
    sys=emptySys();selDev=null;rxSel=null;packets=[];greenOnce=false;seq=1;linkFrom=null;pending=null;
    log('sys','🗑 全消去 — まっさらな現場から');
    refresh();renderBar();
  }

  /* ---------- キャンバス操作 (capture段で本体より先に処理) ---------- */
  const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
  cv.addEventListener('mousedown',e=>{
    if(!on||pending)return;
    const[x,y]=pos(e);const id=devAt(x,y);
    if(id&&tool!=='del'){const d=sys.devices[id];drag={id,dx:d.x-x,dy:d.y-y};dragMoved=false;}
  });
  cv.addEventListener('mousemove',e=>{
    if(!on||!drag)return;
    const[x,y]=pos(e);const d=sys.devices[drag.id];if(!d){drag=null;return}
    const nx=Math.max(60,Math.min(W-60,x+drag.dx)),ny=Math.max(40,Math.min(H-40,y+drag.dy));
    if(Math.abs(nx-d.x)>3||Math.abs(ny-d.y)>3)dragMoved=true;
    d.x=nx;d.y=ny;
  });
  window.addEventListener('mouseup',()=>{if(drag){drag=null;if(dragMoved)refresh();}});
  cv.addEventListener('click',e=>{
    if(!on)return;
    if(dragMoved){e.stopImmediatePropagation();dragMoved=false;return;}
    const[x,y]=pos(e);const id=devAt(x,y);
    if(pending){e.stopImmediatePropagation();place(x,y);return;}
    if(tool==='connect'){
      e.stopImmediatePropagation();
      if(!id){linkFrom=null;renderBar();return;}
      if(!linkFrom){linkFrom=id;log('sys',`接続元: <b>${sys.devices[id].name}</b> — 接続先をクリック`);renderBar();return;}
      if(linkFrom===id){linkFrom=null;renderBar();return;}
      const from=linkFrom;linkFrom=null;toggleLink(from,id);return;
    }
    if(tool==='del'){
      e.stopImmediatePropagation();
      if(id)delDev(id);
      return;
    }
    /* tool==='select' は本体のクリック処理(インスペクター)に委ねる */
  },true);

  /* ---------- ビルドバー ---------- */
  function setTool(t){tool=t;pending=null;linkFrom=null;renderBar();}
  function renderBar(){
    const el=document.getElementById('chbar');if(!el||!on)return;
    const items=runDiag(),ew=countEW(items);
    const patched=Object.keys(sys.subs).length>=1;
    const ok=Object.keys(sys.devices).length>=2&&sys.links.length>=1&&patched&&ew===0;
    if(ok)greenOnce=true;
    const pal=PALETTE.map(p=>
      `<button class="bd-p${pending&&pending.m===p.m&&(pending.net||null)===(p.net||null)?' on':''}" onclick="BUILDMODE.armPlace('${p.m}','${p.net||''}')" title="${CAT[p.m].desc}">${p.g==='SW S'?'<s-ico>S</s-ico>':''}${SHORT[p.m]}${p.net==='P'?'ᴾ':p.net==='S'?'ˢ':''}</button>`).join('');
    const stat=ok?'<span class="bd-green">✓ ALL GREEN</span>'
      :ew?`<span class="bd-ng">要修正 ${ew}件</span>`
      :!patched&&Object.keys(sys.devices).length>=2?'<span style="color:var(--faint)">PATCH MATRIXで購読を1つ以上 — 音が通って初めてシステム</span>'
      :'<span style="color:var(--faint)">機材2台+ケーブル1本から診断開始</span>';
    el.innerHTML=`<span class="ch-title">BUILD</span>
      <div class="seg bd-pal">${pal}</div>
      <div class="seg">
        <button class="${tool==='select'?'on c-cyan':''}" onclick="BUILDMODE.setTool('select')">☝ 選択/設定</button>
        <button class="${tool==='connect'?'on c-cyan':''}" onclick="BUILDMODE.setTool('connect')">⚡ 接続${linkFrom?'…':''}</button>
        <button class="${tool==='del'?'on c-cyan':''}" onclick="BUILDMODE.setTool('del')">🗑 撤去</button>
      </div>
      <button class="btn" onclick="BUILDMODE.clearAll()">全消去</button>
      ${greenOnce?`<button class="ch-start bd-save" ${ok?'':'disabled'} onclick="BUILDMODE.saveCustom()">💾 SAVE<span class="subl">カスタム登録</span></button>`:''}
      <button class="btn" onclick="loadPreset('S')">← 戻る</button>
      ${stat}`;
  }

  /* ---------- SAVE → カスタム登録 ---------- */
  function serial(){
    return JSON.parse(JSON.stringify({devices:sys.devices,links:sys.links,
      igmp:sys.igmp,latency:sys.latency,querier:sys.querier,subs:sys.subs,mcast:sys.mcast,ha:sys.ha||{}}));
  }
  function saveCustom(){
    const items=runDiag();
    if(countEW(items)!==0||Object.keys(sys.devices).length<2||Object.keys(sys.subs).length<1)return;
    try{localStorage.setItem('dpl_custom',JSON.stringify({v:1,sys:serial()}));}catch(e){log('ng','保存失敗(ストレージ)');return;}
    registerCustom();
    if(typeof SFX!=='undefined')SFX.play('resolve');
    log('ok','💾 <b>カスタム登録!</b> SYSTEMセレクトに「自 カスタム」が出現 — CHALLENGEの題材に使える(TROUBLEは監査後に解禁予定)');
    renderBar();
  }
  function registerCustom(){
    let data=null;
    try{data=JSON.parse(localStorage.getItem('dpl_custom')||'null');}catch(e){}
    if(!data||data.v!==1||!data.sys)return;
    PRESETS.C={title:'カスタム — 自作システム (β)',build(){
      const s=JSON.parse(JSON.stringify(data.sys));
      if(s.querier===undefined)s.querier=true;
      return s;
    }};
    const t=document.getElementById('tab-custom');if(t)t.style.display='';
  }
  registerCustom();

  return {get on(){return on},enter,leave,armPlace,setTool,clearAll,saveCustom,renderBar,registerCustom};
})();
