// Always open at the top (stop the browser restoring an old scroll position)
  try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}
  (function(){
    function toTop(){if(!location.hash)window.scrollTo(0,0);}
    toTop();
    document.addEventListener('DOMContentLoaded',toTop);
    window.addEventListener('load',function(){toTop();setTimeout(toTop,50);});
    window.addEventListener('pageshow',function(e){if(e.persisted)toTop();});
  })();

(function(){
  var i=document.getElementById('intro'); if(!i) return;
  var seen=false;
  try{ seen=sessionStorage.getItem('craic-intro')==='1'; sessionStorage.setItem('craic-intro','1'); }catch(e){}
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function gone(){ if(i && i.parentNode) i.parentNode.removeChild(i); i=null; }
  if(seen||reduce){ gone(); return; }
  function bye(){ if(!i) return; i.classList.add('bye'); setTimeout(gone,450); }
  i.addEventListener('click',bye);
  i.addEventListener('touchstart',bye,{passive:true});
  setTimeout(bye,3200);
})();

(function(){
  // Tabs
  var tabs = document.querySelectorAll('.days button');
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      tabs.forEach(function(x){ x.setAttribute('aria-selected','false'); });
      document.querySelectorAll('.day').forEach(function(d){ d.classList.remove('on'); });
      t.setAttribute('aria-selected','true');
      document.getElementById(t.dataset.d).classList.add('on');
    });
  });

  // Countdown pint
  var dep = new Date('2026-10-23T08:50:00+01:00').getTime();
  var start = new Date('2026-09-01T00:00:00+01:00').getTime();
  function tick(){
    var now = Date.now(), ms = dep - now;
    var cd = document.getElementById('cd'), txt = document.getElementById('cdtxt');
    var land = new Date('2026-10-23T10:15:00+01:00').getTime();
    if (ms <= 0 && now < land){
      cd.textContent = 'Wheels up!';
      txt.textContent = 'In the air. Landing in Dublin at 10:15.';
    } else if (ms <= 0){
      cd.textContent = 'Sláinte!';
      txt.textContent = now < new Date('2026-10-25T15:35:00+00:00').getTime() ? "We're in Dublin. Put the phone down and get a round in." : 'That was gas. Same again next year?';
    } else {
      var d = Math.floor(ms/86400000), h = Math.floor(ms%86400000/3600000), m = Math.max(1, Math.ceil(ms%3600000/60000));
      cd.textContent = d > 0 ? d + (d===1?' day':' days') + ', ' + h + 'h'
        : h > 0 ? h + 'h ' + m + 'm to go'
        : m + (m===1?' minute':' minutes') + ' to go';
    }
    var f = Math.max(0, Math.min(1, (now - start)/(dep - start)));
    var top = 146, full = 136*f, headH = f > 0.02 ? Math.min(14, full) : 0;
    var beer = document.getElementById('beer'), froth = document.getElementById('froth');
    beer.setAttribute('y', top - full + headH); beer.setAttribute('height', Math.max(0, full - headH));
    froth.setAttribute('y', top - full); froth.setAttribute('height', headH);
  }
  // Finale: the pint overflows at take-off (once per phone; ?finale forces it for testing)
  var wasCounting = Date.now() < dep;
  function finale(){
    var pint=document.querySelector('.pint'), cd=document.getElementById('cd');
    if(!pint) return;
    var beer=document.getElementById('beer'), froth=document.getElementById('froth');
    beer.setAttribute('y',24); beer.setAttribute('height',122); froth.setAttribute('y',6); froth.setAttribute('height',18);
    pint.classList.remove('finale'); void pint.offsetWidth; pint.classList.add('finale');
    cd.textContent='Wheels up!'; cd.classList.remove('wheels'); void cd.offsetWidth; cd.classList.add('wheels');
    document.getElementById('cdtxt').textContent='The pint is full. We are officially on our way.';
    try{ localStorage.setItem('craicpack-finale','1'); }catch(e){}
  }
  tick();
  (function(){
    var now=Date.now(), seen=false; try{ seen=localStorage.getItem('craicpack-finale')==='1'; }catch(e){}
    var land=new Date('2026-10-23T10:15:00+01:00').getTime();
    if (/[?&]finale/.test(location.search) || (now>=dep && now<land && !seen)) setTimeout(finale,900);
  })();
  setInterval(function(){ tick(); if (wasCounting && Date.now() >= dep){ wasCounting=false; finale(); } }, 30000);

  // Pint-o-meter (per viewer)
  var KEY = Date.now() < new Date('2026-10-23T06:00:00+01:00').getTime() ? 'craicpack-pints-test' : 'craicpack-pints', n = 0;
  try { n = parseInt(localStorage.getItem(KEY) || '0', 10) || 0; } catch(e){}
  var lines = [
    [0,  'Stone cold sober. Suspicious.'],
    [1,  'Warming up nicely.'],
    [3,  'Now we are talking.'],
    [5,  'Fluent in Irish, apparently.'],
    [8,  'Challenging locals to a jig.'],
    [11, 'Legend. Hydrate, please.'],
    [15, 'Right. Hand over the phone.']
  ];
  function render(){
    document.getElementById('n').textContent = n;
    var v = lines[0][1];
    lines.forEach(function(l){ if (n >= l[0]) v = l[1]; });
    document.getElementById('verdict').textContent = v;
    try { localStorage.setItem(KEY, String(n)); } catch(e){}
  }
  // Shared group total via Abacus (works on the GitHub site; hidden if unreachable)
  var G=(function(){
    var NS='craicpack-dublin-2026', LIVE=new Date('2026-10-23T06:00:00+01:00').getTime();
    var test=Date.now()<LIVE, KEYN=test?'pints-test-2':'pints', BASE='https://abacus.jasoncameron.dev/';
    var box=document.getElementById('grp'), num=document.getElementById('gn'), val=null;
    function off(){ if(val!==null)return; num.textContent='–'; document.getElementById('goff').hidden=false; document.getElementById('gtest').hidden=true; }
    function show(v,bump){ if(typeof v!=='number'||isNaN(v))return; val=v; num.textContent=v; box.hidden=false; document.getElementById('goff').hidden=true; document.getElementById('gtest').hidden=!test;
      if(bump){box.classList.remove('bump');void box.offsetWidth;box.classList.add('bump');} }
    function call(op){ return fetch(BASE+op+'/'+NS+'/'+KEYN,{cache:'no-store'}).then(function(r){ if(r.status===404&&op==='get') return {value:0}; if(!r.ok) throw 0; return r.json(); }); }
    function refresh(){ call('get').then(function(d){ show(d.value); }).catch(off); }
    function hit(){ if(val!==null) show(val+1,true); call('hit').then(function(d){ show(d.value,false); }).catch(off); }
    refresh(); setInterval(function(){ if(!document.hidden) refresh(); },30000);
    document.addEventListener('visibilitychange',function(){ if(!document.hidden) refresh(); });
    return {hit:hit};
  })();
  document.getElementById('add').addEventListener('click', function(){ n++; render(); G.hit();
    if (n === 6) setTimeout(function(){
      CraicImageLoader.extras(function(){
        var im=document.getElementById('spicyimg'), lbi=document.getElementById('lbimg');
        lbi.src=im.src; lbi.alt=im.alt;
        document.getElementById('lbcap').textContent='Six pints in. Soakage required: find a spice bag. Louise already has.';
        if (lb.showModal) lb.showModal();
      });
    }, 450);
  });
  document.getElementById('undo').addEventListener('click', function(){ if (n > 0) n--; render(); });
  render();
  // Before / after toggle
  (function(){
    var caps={before:'The Craic Pack, dressed for the occasion. Dublin has been warned.',after:'The Craic Pack, 48 hours later. Dublin won.'};
    var btns=document.querySelectorAll('.ba-btn'), imgs=document.querySelectorAll('.ba-img');
    function show(v){
      btns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===v?'true':'false');});
      imgs.forEach(function(i){var on=i.dataset.v===v;i.classList.toggle('shown',on);i.setAttribute('aria-hidden',on?'false':'true');});
      document.getElementById('bacap').textContent=caps[v];
    }
    btns.forEach(function(b){b.addEventListener('click',function(){show(b.dataset.v);});});
  })();

  // ---------- Now & Next ----------
  (function(){
    var M='The Morgan Hotel, 10 Fleet Street, Dublin';
    var E=[
      ['2026-10-23T08:50:00+01:00','Wheels up: BA5953','Heathrow T2 to Dublin T2. Aer Lingus check-in.','fri',null,null],
      ['2026-10-23T10:15:00+01:00','Land in Dublin','One taxi into town. Jeff and Helen are already scouting.','fri',0,[M,'driving']],
      ['2026-10-23T11:15:00+01:00','Drop bags at The Morgan','10 Fleet St. Then lunch wherever looks good.','fri',1,[M,'walking']],
      ['2026-10-23T14:45:00+01:00','Viking Splash','St Stephen\'s Green North, about 12 minutes\' walk. Be there 15 minutes early.','fri',2,['Viking Splash Tours, St Stephen\'s Green North, Dublin','walking']],
      ['2026-10-23T16:30:00+01:00','Pints','Wherever we end up.','fri',3,null],
      ['2026-10-23T20:00:00+01:00','Dinner at Sophie\'s','Rooftop at The Dean, Harcourt St. About 20 minutes\' walk.','fri',4,['Sophie\'s at The Dean, Harcourt Street, Dublin','walking']],
      ['2026-10-23T22:30:00+01:00','See how we feel','The Palace Bar is next door to the hotel.','fri',5,['The Palace Bar, 21 Fleet Street, Dublin','walking']],
      ['2026-10-24T08:30:00+01:00','Breakfast at The Morgan','Strong coffee, full Irish.','sat',0,null],
      ['2026-10-24T12:00:00+01:00','Irish dancing lesson','Merchant\'s Arch, 5 minutes from the hotel. Arms straight.','sat',1,['Merchant\'s Arch, Wellington Quay, Dublin','walking']],
      ['2026-10-24T14:00:00+01:00','Split shift','Girls: Grafton Street and Powerscourt. Boys: Sinnott\'s for the Arsenal.','sat',2,['Grafton Street, Dublin','walking']],['2026-10-24T15:00:00+01:00','Kick-off: Arsenal v Everton','Sinnott\'s, South King St. Girls still shopping.','sat',2,['Sinnott\'s Bar, South King Street, Dublin','walking']],['2026-10-24T17:00:00+01:00','Back together','Meet at Sinnott\'s, top of Grafton St, then the hotel to change.','sat',2,['Sinnott\'s Bar, South King Street, Dublin','walking']],
      ['2026-10-24T19:30:00+01:00','Dinner at The Church','Mary St, about 12 minutes\' walk over the river. Trad music and dancing later.','sat',3,['The Church, Mary Street, Dublin','walking']],
      ['2026-10-24T22:00:00+01:00','Fitzsimons: where it all began','Over the Ha\'penny Bridge, about 8 minutes from The Church. First round: a toast to Seymon and Louise.','sat',4,['Fitzsimons, 21 Wellington Quay, Dublin','walking']],
      ['2026-10-25T09:00:00+00:00','Breakfast, slowly','Coffee and quiet reflection.','sun',0,null],
      ['2026-10-25T12:00:00+00:00','Check out, taxi to the airport','Terminal 2, about 30 minutes.','sun',1,['Dublin Airport Terminal 2','driving']],
      ['2026-10-25T14:15:00+00:00','Fly home: BA5968','Lands Heathrow 15:35. Pretend to be fine on Monday.','sun',2,null]
    ].map(function(e){return {t:new Date(e[0]).getTime(),what:e[1],where:e[2],day:e[3],stop:e[4],dest:e[5]};});
    var LIVE_FROM=new Date('2026-10-23T06:00:00+01:00').getTime();
    var LIVE_TO=new Date('2026-10-25T15:35:00+00:00').getTime();
    var CLOCKS=new Date('2026-10-25T01:00:00+00:00').getTime();
    var sim=null, autoDone=false;
    var body=document.getElementById('lvbody'), pill=document.getElementById('lvpill');
    function hhmm(t){return new Date(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Dublin'});}
    function dayname(t){return new Date(t).toLocaleDateString('en-GB',{weekday:'short',timeZone:'Europe/Dublin'});}
    function until(ms){var m=Math.round(ms/60000);if(m<1)return 'any minute';if(m<60)return 'in '+m+' min';var h=Math.floor(m/60),r=m%60;return 'in '+h+'h'+(r?' '+r+'m':'');}
    function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
    function dirs(e){if(!e.dest)return '';return '<a class="go" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(e.dest[0])+'&travelmode='+e.dest[1]+'">'+(e.dest[1]==='driving'?'Taxi route':'Directions')+'</a>';}
    function icon(e){var el=stopEl(e)||document.querySelectorAll('#sun .stop')[2];var i=el&&el.querySelector('.ic');return i?i.outerHTML:'';}
    function stopEl(e){if(e.stop==null)return null;var d=document.getElementById(e.day);return d?d.querySelectorAll('.stop')[e.stop]:null;}
    function openDay(day){var b=document.querySelector('.days button[data-d="'+day+'"]');if(b)b.click();}
    function mark(e){document.querySelectorAll('.stop.live-now').forEach(function(x){x.classList.remove('live-now','sim');});var el=e&&stopEl(e);if(el){el.classList.add('live-now');if(sim!==null)el.classList.add('sim');}}
    function render(){
      var real=Date.now(), now=sim!==null?sim:real;
      var h='';
      if(sim===null && now<LIVE_FROM){
        pill.className='pill';pill.textContent='From Fri 23rd';
        h='<p class="msg">This goes live on the Friday morning. It\'ll show what\'s on now, what\'s next, how long until it starts, and one-tap directions.</p>'+
          '<div class="acts"><button type="button" class="ghost" data-sim="2026-10-23T19:25:00+01:00">Preview Friday night</button><button type="button" class="ghost" data-sim="2026-10-24T11:20:00+01:00">Preview Saturday</button></div>';
        body.innerHTML=h;mark(null);return;
      }
      if(now>=LIVE_TO){
        pill.className='pill';pill.textContent='Done';
        body.innerHTML='<p class="msg">That was gas. Same again next year?</p>'+(sim!==null?'<div class="acts"><button type="button" class="ghost" data-sim="off">Back to real time</button></div>':'');mark(null);return;
      }
      var i=-1;E.forEach(function(e,k){if(e.t<=now)i=k;});
      var cur=i>=0?E[i]:null, nxt=E[i+1]||null;
      pill.className=sim!==null?'pill':'pill on';pill.textContent=sim!==null?'Preview · '+dayname(now)+' '+hhmm(now):'Live';
      if(cur){h+='<div class="row"><div class="lab">Now</div><div><div class="what">'+icon(cur)+esc(cur.what)+'</div><div class="where">'+esc(cur.where)+'</div></div></div>';}
      else{h+='<div class="row"><div class="lab">Now</div><div><div class="what">Getting to Heathrow</div><div class="where">Terminal 2. Passports. Phones charged.</div></div></div>';}
      if(nxt){
        var from=cur?cur.t:LIVE_FROM, pct=Math.max(0,Math.min(100,(now-from)/(nxt.t-from)*100));
        h+='<div class="row"><div class="lab">Next</div><div><div class="what">'+icon(nxt)+esc(nxt.what)+'</div><div class="where">'+esc(nxt.where)+'</div><div class="when">'+hhmm(nxt.t)+' · '+until(nxt.t-now)+'</div></div></div>';
        h+='<div class="bar" aria-hidden="true"><i style="width:'+pct.toFixed(1)+'%"></i></div>';
      }
      h+='<div class="acts">'+(nxt?dirs(nxt):'')+(cur&&cur.stop!=null?'<button type="button" class="ghost" data-show="1">Show on the plan</button>':'')+(sim!==null?'<button type="button" class="ghost" data-sim="off">Back to real time</button>':'')+'</div>';
      if(now<CLOCKS && now>new Date('2026-10-24T18:00:00+01:00').getTime()) h+='<p class="extra">☘ Clocks go back an hour tonight. That\'s a bonus hour in the pub.</p>';
      body.innerHTML=h;
      mark(cur);
      if(sim===null && !autoDone && cur){autoDone=true;openDay(cur.day);}
      body._cur=cur;
    }
    body.addEventListener('click',function(ev){
      var b=ev.target.closest('button');if(!b)return;
      if(b.dataset.sim){sim=b.dataset.sim==='off'?null:new Date(b.dataset.sim).getTime();if(sim!==null){var c=null;E.forEach(function(e){if(e.t<=sim)c=e;});if(c)openDay(c.day);}render();}
      else if(b.dataset.show){var c=body._cur;if(!c)return;openDay(c.day);var el=stopEl(c);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');}}
    });
    render();setInterval(function(){if(sim===null)render();},20000);
    document.addEventListener('visibilitychange',function(){if(!document.hidden&&sim===null)render();});
  })();

  // ---------- Split the G ----------
  (function(){
    var stout=document.getElementById('gstout'), head=document.getElementById('ghead'), cream=document.getElementById('gcream');
    var gline=document.getElementById('gline'), gbound=document.getElementById('gbound');
    var sip=document.getElementById('gsip'), again=document.getElementById('gagain'), glass=document.getElementById('gglass');
    var res=document.getElementById('gres'), title=document.getElementById('gtitle'), bestEl=document.getElementById('gbest');
    var TOP=12, HEAD=14, GY=100, MAXL=150;
    var L=TOP, holding=false, done=false, t0=0, raf=0, last=0, v=0;
    var KEY='craicpack-splitg', st={best:null,pints:0,splits:0};
    try{var raw=localStorage.getItem(KEY);if(raw)st=JSON.parse(raw)||st;}catch(e){}
    function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
    function showBest(){bestEl.textContent=st.pints?('Your best: '+st.best.toFixed(1)+' mm off · Pints: '+st.pints+(st.splits?' · Perfect splits: '+st.splits:'')):'';}
    function draw(){head.setAttribute('y',L);cream.setAttribute('y',L+HEAD-2);stout.setAttribute('y',L+HEAD);gbound.setAttribute('y1',L+HEAD);gbound.setAttribute('y2',L+HEAD);}
    function step(ts){
      if(!holding)return;
      var dt=Math.min(.05,(ts-last)/1000);last=ts;
      var el=(ts-t0)/1000; v=24+75*el;
      L=Math.min(MAXL,L+v*dt);draw();
      if(L>=MAXL){stop();return;}
      raf=requestAnimationFrame(step);
    }
    function start(e){
      if(done||holding)return; if(e&&e.cancelable)e.preventDefault();
      holding=true;sip.classList.add('held');title.textContent='Glug, glug…';res.textContent='';
      t0=last=performance.now();raf=requestAnimationFrame(step);
    }
    function stop(){
      if(!holding)return;holding=false;done=true;cancelAnimationFrame(raf);sip.classList.remove('held');sip.disabled=true;
      var err=(L+HEAD)-GY, a=Math.abs(err), msg, t;
      if(a<=1.5){t='You split the G!';msg='Absolute legend. Frame it, then drink it.';}
      else if(a<=4){t='So close.';msg=err>0?'Just a touch too keen.':'Still respectable.';}
      else if(a<=9){t=err>0?'Bit thirsty there.':'Timid sip.';msg=err>0?'Slow down, it\'s a long weekend.':'Get stuck in.';}
      else if(a<=20){t=err>0?'Eejit.':'That\'s a sniff, not a sip.';msg=err>0?'The G is a guide, not a suggestion.':'The barman is judging you.';}
      else{t=err>0?'Half the pint in one go?':'Did you even drink?';msg=err>0?'Respect, but that\'s not how it works.':'Try actually drinking it.';}
      title.textContent=t;
      res.innerHTML='<b>'+a.toFixed(1)+' mm</b> '+(err>0?'below':'above')+' the middle. '+msg;
      gline.setAttribute('opacity','.9');gbound.setAttribute('opacity','1');
      st.pints++; if(st.best===null||a<st.best)st.best=a; if(a<=1.5)st.splits++; save();showBest();
      if(a<=1.5)confetti();
      try{if(a<=1.5&&navigator.vibrate)navigator.vibrate([40,40,80]);}catch(e){}
      again.hidden=false;again.focus({preventScroll:true});
    }
    function pour(){
      again.hidden=true;gline.setAttribute('opacity','0');gbound.setAttribute('opacity','0');
      title.textContent='Pouring…';res.textContent='Let it settle. Patience is part of it.';
      var from=L, t1=performance.now(), dur=900;
      (function anim(ts){var k=Math.min(1,(ts-t1)/dur);k=1-Math.pow(1-k,3);L=from+(TOP-from)*k;draw();if(k<1)requestAnimationFrame(anim);else{L=TOP;draw();done=false;sip.disabled=false;title.textContent='A fresh pint, settled.';res.textContent='Hold to sip. Let go to stop.';}})(t1);
    }
    function confetti(){
      var box=document.createElement('div');box.className='shams';box.setAttribute('aria-hidden','true');
      for(var k=0;k<24;k++){var sp=document.createElement('span');sp.textContent='☘';sp.style.left=(Math.random()*100)+'vw';sp.style.animationDelay=(Math.random()*.6)+'s';sp.style.color=['#3FA564','#D6AE55','#1E5C43'][k%3];box.appendChild(sp);}
      document.body.appendChild(box);setTimeout(function(){box.remove();},3200);
    }
    [sip,glass].forEach(function(el){
      el.addEventListener('pointerdown',function(e){if(el.setPointerCapture)try{el.setPointerCapture(e.pointerId);}catch(x){}start(e);});
      el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);el.addEventListener('lostpointercapture',stop);
      el.addEventListener('contextmenu',function(e){e.preventDefault();});
    });
    sip.addEventListener('keydown',function(e){if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();start();}});
    sip.addEventListener('keyup',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();stop();}});
    again.addEventListener('click',pour);
    draw();showBest();
  })();

  // ---------- Jig-off ----------
  (function(){
    var troupe=document.querySelector('.dancefloor .troupe'); if(!troupe)return;
    var stage=troupe.closest('.stage'), cap=stage.querySelector('.stagecap');
    var ds=[].slice.call(troupe.querySelectorAll('.dancer'));
    var names=['Seymon','Louise','Jeff','Helen','Steve','Vicky'];
    var shouts=['Go on, {n}!','Lash it out, {n}!','Show us, {n}!','{n}! Legend!','Hup, {n}!','Mighty stuff, {n}!'];
    var timer=0;
    function reset(){clearTimeout(timer);troupe.classList.remove('jigoff');ds.forEach(function(x){x.classList.remove('solo','spin');});cap.textContent=cap.getAttribute('data-cap');}
    ds.forEach(function(d,k){
      d.setAttribute('role','button');d.setAttribute('tabindex','0');d.setAttribute('aria-label','Solo for '+names[k]);
      function go(e){
        if(e)e.stopPropagation();
        var on=d.classList.contains('solo'); reset(); if(on)return;
        stage.classList.remove('paused');
        troupe.classList.add('jigoff'); d.classList.add('solo','spin');
        setTimeout(function(){d.classList.remove('spin');},750);
        cap.textContent=shouts[Math.floor(Math.random()*shouts.length)].replace('{n}',names[k])+' Tap again to stop.';
        timer=setTimeout(reset,7000);
      }
      d.addEventListener('click',go);
      d.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go(e);}});
    });
  })();

  // ---------- Slainte ----------
  (function(){
    var btn=document.getElementById('cbtn'); if(!btn)return;
    var NS='http://www.w3.org/2000/svg', svg=document.getElementById('csvg'), fx=document.getElementById('cfx'), txt=document.getElementById('ctext');
    var ps=[].slice.call(document.querySelectorAll('.cpint')), BASE=110, busy=false;
    var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function place(g,x,y,r){g.setAttribute('transform','translate('+x.toFixed(1)+','+y.toFixed(1)+') rotate('+r.toFixed(1)+',0,34)');}
    ps.forEach(function(g){place(g,+g.dataset.x,BASE,0);});
    // Liquid stays level with gravity, then sloshes: a damped spring on the surface angle
    var runId=0;
    function slosh(g,r,dt){
      var q=g._liq||(g._liq=g.querySelector('.liq'));
      if(g._s===undefined){g._s=0;g._v=0;g._r=r;}
      if(dt>0){var dr=r-g._r; g._r=r;
        g._v+=(-170*g._s-5.5*g._v)*dt - dr*6;
        g._s+=g._v*dt; g._s=Math.max(-24,Math.min(24,g._s));}
      else g._r=r;
      q.setAttribute('transform','rotate('+(-r+g._s).toFixed(2)+' 0 -38)');
    }
    function ease(k){return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;}
    function burst(){
      for(var i=0;i<26;i++){
        var shamrock=i%3===0, el=document.createElementNS(NS,shamrock?'text':'circle');
        if(shamrock){el.textContent='☘';el.setAttribute('font-size',10+Math.random()*8);el.setAttribute('fill',['#3FA564','#D6AE55'][i%2]);el.setAttribute('text-anchor','middle');}
        else{el.setAttribute('r',2+Math.random()*3.5);el.setAttribute('fill','#F2E7CD');}
        el._vx=(Math.random()-.5)*5; el._vy=-2.5-Math.random()*4; el._x=180+(Math.random()-.5)*60; el._y=52; fx.appendChild(el);
      }
      var t0=null;
      (function f(t){if(!t0)t0=t;var k=(t-t0)/1400;[].slice.call(fx.childNodes).forEach(function(el){el._x+=el._vx;el._y+=el._vy;el._vy+=.18;
        if(el.tagName==='circle'){el.setAttribute('cx',el._x);el.setAttribute('cy',el._y);}else{el.setAttribute('x',el._x);el.setAttribute('y',el._y);}el.setAttribute('opacity',Math.max(0,1-k));});
        if(k<1)requestAnimationFrame(f);else fx.innerHTML='';})(performance.now());
    }
    var TOASTS=["May the road rise to meet you, and the wind be always at your back.",
      "May you be in heaven half an hour before the devil knows you're dead.",
      "May your glass be ever full, and the roof over your head be always strong.",
      "There are good ships and wood ships, but the best ships are friendships.",
      "Here's to a long life and a merry one.",
      "May your troubles be few and your blessings be many.",
      "May the Lord keep you in His hand, and never close His fist too tight.",
      "May the cat eat you, and may the devil eat the cat."];
    var tEl=document.getElementById('ctoast'), tI=Math.floor(Math.random()*TOASTS.length);
    function showToast(){tEl.classList.add('fade');setTimeout(function(){tEl.textContent='\u201C'+TOASTS[tI%TOASTS.length]+'\u201D';tI++;tEl.classList.remove('fade');},350);}
    btn.addEventListener('click',function(){
      if(busy)return; busy=true; btn.disabled=true;
      if(red){txt.setAttribute('opacity','1');showToast();setTimeout(function(){txt.setAttribute('opacity','0');busy=false;btn.disabled=false;},1600);return;}
      var tgt=ps.map(function(g,i){return {x0:+g.dataset.x,x1:180+(i-2.5)*44,r1:-(i-2.5)*9.6};});
      var T1=650,T2=1500,T3=2150,t0=null,clinked=false,lastT=0,myRun=++runId;
      function step(t){
        if(myRun!==runId)return; if(!t0)t0=t;var e=t-t0, dt=Math.min(.05,(t-(lastT||t))/1000)||.016; lastT=t;
        ps.forEach(function(g,i){var a=tgt[i],x,y,r;
          if(e<T1){var k=ease(e/T1);x=a.x0+(a.x1-a.x0)*k;y=BASE-20*k;r=a.r1*k;}
          else if(e<T2){var sh=Math.sin((e-T1)/40)*Math.max(0,1-(e-T1)/260)*3;x=a.x1+sh;y=BASE-20;r=a.r1;}
          else{var k2=ease(Math.min(1,(e-T2)/(T3-T2)));x=a.x1+(a.x0-a.x1)*k2;y=BASE-20+20*k2;r=a.r1*(1-k2);}
          place(g,x,y,r); slosh(g,r,dt);});
        if(e>=T1&&!clinked){clinked=true;ps.forEach(function(g,i){g._v=(g._v||0)+(i<3?1:-1)*(140+Math.random()*60);});burst();txt.setAttribute('opacity','1');showToast();try{navigator.vibrate&&navigator.vibrate(30);}catch(x){}}
        if(e>T2)txt.setAttribute('opacity',Math.max(0,1-(e-T2)/400).toFixed(2));
        if(e<T3+1400)requestAnimationFrame(step);else{ps.forEach(function(g){g._s=0;g._v=0;slosh(g,0,0);});}
        if(e>=T3&&busy){busy=false;btn.disabled=false;txt.setAttribute('opacity','0');}
      }
      requestAnimationFrame(step);
    });
  })();

  // ---------- Leprechaun cameo ----------
  (function(){
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var el=document.createElement('div'); el.className='lep'; el.setAttribute('aria-hidden','true');
    el.innerHTML='<span class="say">Oi! Me pint!</span><svg viewBox="0 0 70 88"><g class="run">'+
      '<g class="lg1"><rect x="27" y="60" width="7" height="20" rx="3" fill="#14432F"/><ellipse cx="32" cy="81" rx="7" ry="3.5" fill="#1E1812"/></g>'+
      '<g class="lg2"><rect x="37" y="60" width="7" height="20" rx="3" fill="#1E5C43"/><ellipse cx="42" cy="81" rx="7" ry="3.5" fill="#1E1812"/></g>'+
      '<path d="M22 38 Q35 32 48 38 L50 64 H20 Z" fill="#2E9A5E" stroke="#0B2A1D" stroke-width="1.2"/><rect x="20" y="56" width="30" height="5" fill="#1E1812"/><rect x="32" y="55" width="6" height="7" fill="none" stroke="#D6AE55" stroke-width="1.6"/>'+
      '<circle cx="35" cy="26" r="11" fill="#F0C39E"/><path d="M24 27 Q35 50 46 27 Q41 34 35 34 Q29 34 24 27Z" fill="#D2691E"/>'+
      '<circle cx="31" cy="24" r="1.4" fill="#1E1812"/><circle cx="39" cy="24" r="1.4" fill="#1E1812"/><path d="M31 30 Q35 33 39 30" stroke="#8B3A1A" stroke-width="1.4" fill="none"/>'+
      '<rect x="20" y="14" width="30" height="4" rx="2" fill="#14432F"/><path d="M25 14 L27 0 H43 L45 14 Z" fill="#1E5C43" stroke="#0B2A1D" stroke-width="1"/><rect x="26" y="9" width="18" height="3.5" fill="#1E1812"/><rect x="32" y="8.5" width="6" height="4.5" fill="none" stroke="#D6AE55" stroke-width="1.2"/>'+
      '<g transform="translate(54,40) rotate(10)"><path d="M-5 -8 H5 L4 9 H-4 Z" fill="#241710" stroke="#F2E7CD" stroke-width=".8"/><rect x="-5" y="-8" width="10" height="3" fill="#F2E7CD"/></g><path d="M47 42 L52 40" stroke="#2E9A5E" stroke-width="5" stroke-linecap="round"/>'+
      '</g></svg>';
    document.body.appendChild(el);
    var shown=0, last=0, scrolled=0, lastY=window.scrollY, running=false;
    function run(){
      if(running)return; running=true; shown++; last=Date.now(); el.classList.add('running');
      var w=window.innerWidth, t0=null, D=3600;
      (function f(t){if(!t0)t0=t;var k=(t-t0)/D;el.style.transform='translateX('+(-90+(w+180)*k).toFixed(0)+'px)';if(k<1)requestAnimationFrame(f);else{running=false;el.classList.remove('running','talk');el.style.transform='translateX(-90px)';}})(performance.now());
    }
    el.addEventListener('click',function(){el.classList.add('talk');setTimeout(function(){el.classList.remove('talk');},1400);});
    window.addEventListener('scroll',function(){
      var y=window.scrollY; scrolled+=Math.abs(y-lastY); lastY=y;
      var arc=document.getElementById('arcade'), ar=arc&&arc.getBoundingClientRect(), inArcade=ar&&ar.bottom>0&&ar.top<window.innerHeight;
      if(!inArcade && shown<2 && scrolled>2500 && performance.now()>20000 && Date.now()-last>90000 && Math.random()<.02){scrolled=0;run();}
    },{passive:true});
    if(/[?&#]lep/.test(location.search+location.hash))setTimeout(run,1500);
  })();

  // ---------- Fitzsimons bobbleheads ----------
  (function(){
    var dlg=document.getElementById('love'); if(!dlg)return;
    var NS='http://www.w3.org/2000/svg', box=document.getElementById('lovehearts'), iv=0;
    var HP='M0 6 C-10 -1.5 -8 -10 -2.8 -9 C-1.2 -8.7 0 -7.3 0 -5.6 C0 -7.3 1.2 -8.7 2.8 -9 C8 -10 10 -1.5 0 6Z';
    var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function heart(){
      var h=document.createElementNS(NS,'path'); h.setAttribute('d',HP);
      h.setAttribute('fill',['#E0414F','#F28BA0','#D6AE55','#FF6B81'][Math.floor(Math.random()*4)]);
      var x=20+Math.random()*260, sc=.6+Math.random()*1.1, dur=2600+Math.random()*1600, t0=null, sw=8+Math.random()*14, ph=Math.random()*6;
      box.appendChild(h);
      (function f(t){if(!t0)t0=t;var k=(t-t0)/dur;
        var y=250-k*250, xx=x+Math.sin(k*6+ph)*sw;
        h.setAttribute('transform','translate('+xx.toFixed(1)+','+y.toFixed(1)+') scale('+sc.toFixed(2)+')');
        h.setAttribute('opacity',(k<.15?k/.15:Math.max(0,1-(k-.6)/.4)).toFixed(2));
        if(k<1&&dlg.open)requestAnimationFrame(f);else h.remove();})(performance.now());
    }
    function open(e){
      if(window.CraicImageLoader)CraicImageLoader.crew();
      if(e){e.preventDefault();e.stopPropagation();}
      if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
      box.innerHTML='';
      if(red){for(var i=0;i<8;i++){var h=document.createElementNS(NS,'path');h.setAttribute('d',HP);h.setAttribute('fill','#E0414F');h.setAttribute('transform','translate('+(30+i*34)+','+(40+(i%3)*18)+') scale(1)');box.appendChild(h);}return;}
      for(var i=0;i<6;i++)setTimeout(heart,i*120);
      clearInterval(iv); iv=setInterval(heart,260);
      try{navigator.vibrate&&navigator.vibrate([20,60,20]);}catch(x){}
    }
    function close(){clearInterval(iv);if(dlg.open)dlg.close();}
    dlg.addEventListener('close',function(){clearInterval(iv);box.innerHTML='';});
    document.getElementById('lovex').addEventListener('click',close);
    dlg.addEventListener('click',function(e){if(e.target===dlg)close();});
    document.querySelectorAll('[data-love]').forEach(function(el){
      el.addEventListener('click',open);
      el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')open(e);});
    });
  })();

  // ---------- Sunday morning-after ----------
  (function(){
    var dlg=document.getElementById('morning'); if(!dlg)return;
    var g=document.getElementById('groan'), bg=document.getElementById('groanbg'), tail=document.getElementById('groantail'), tx=document.getElementById('groantx');
    var who=[['Seymon',40,158],['Louise',96,146],['Jeff',152,172],['Helen',208,160],['Steve',264,158],['Vicky',320,160]];
    var lines=[['Never again.',4],['Who ordered the Jägers?',0],['My head…',1],['Is it still Saturday?',2],['Just a coffee. And a fry.',3],['What happened at Fitzsimons?',5],['I\'m grand. I\'m grand.',1],['Where\'s my other shoe?',4],['Zzzz…',0],['Water. Please.',2],['Same again tonight?',3]];
    var iv=0, n=0;
    function say(){
      var l=lines[n%lines.length]; n++;
      var w=who[l[1]]; tx.textContent=l[0];
      var tw=tx.getComputedTextLength()+20, x=Math.max(8,Math.min(352-tw,w[1]-tw/2)), y=w[2]-72;
      bg.setAttribute('x',x);bg.setAttribute('y',y);bg.setAttribute('width',tw);
      tx.setAttribute('x',x+10);tx.setAttribute('y',y+16);
      tail.setAttribute('d','M'+(w[1]-5)+' '+(y+23)+' L'+w[1]+' '+(y+33)+' L'+(w[1]+5)+' '+(y+23));
      g.setAttribute('opacity','1');
      setTimeout(function(){g.setAttribute('opacity','0');},2000);
    }
    function open(e){
      if(e){e.preventDefault();e.stopPropagation();}
      if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
      n=Math.floor(Math.random()*lines.length);
      setTimeout(say,500); clearInterval(iv); iv=setInterval(say,2600);
    }
    function close(){clearInterval(iv);g.setAttribute('opacity','0');if(dlg.open)dlg.close();}
    dlg.addEventListener('close',function(){clearInterval(iv);g.setAttribute('opacity','0');});
    document.getElementById('morningx').addEventListener('click',close);
    dlg.addEventListener('click',function(e){if(e.target===dlg)close();});
    document.querySelectorAll('[data-morning]').forEach(function(el){el.addEventListener('click',open);});
  })();

  // ---------- Shortcut bar ----------
  (function(){
    var bar=document.getElementById('jump'); if(!bar)return;
    var links=[].slice.call(bar.querySelectorAll('button[data-j]'));
    links.forEach(function(a){a.addEventListener('click',function(e){
      var t=document.getElementById(a.dataset.j); if(!t)return; e.preventDefault();
      var y=t.getBoundingClientRect().top+window.scrollY-bar.offsetHeight-(parseFloat(getComputedStyle(bar).top)||0)-8;
      window.scrollTo({top:y,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });});
    function setOn(id){links.forEach(function(a){var on=a.dataset.j===id;a.classList.toggle('on',on);if(on){var r=a.getBoundingClientRect(),rr=a.parentNode.getBoundingClientRect();if(r.left<rr.left||r.right>rr.right)a.parentNode.scrollBy({left:r.left-rr.left-40,behavior:'smooth'});}});}
    function onScroll(){
      bar.classList.toggle('stuck',window.scrollY>0&&bar.getBoundingClientRect().top<=parseFloat(getComputedStyle(bar).top)+1);
      var line=bar.offsetHeight+(parseFloat(getComputedStyle(bar).top)||0)+80, cur=null;
      links.forEach(function(a){var t=document.getElementById(a.dataset.j);if(t&&t.getBoundingClientRect().top<=line)cur=cur&&document.getElementById(cur).getBoundingClientRect().top>t.getBoundingClientRect().top?cur:a.dataset.j;});
      if(cur!==onScroll.last){onScroll.last=cur;setOn(cur);}
    }
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  })();

  // ---------- Header follows the time of day in Dublin ----------
  (function(){
    var hd=document.querySelector('header.fascia'); if(!hd) return;
    function phase(){
      var q=(location.search.match(/[?&]tod=(day|dawn|dusk|night)/)||[])[1]; if(q) return q;
      var parts=new Intl.DateTimeFormat('en-GB',{hour:'numeric',minute:'numeric',hour12:false,timeZone:'Europe/Dublin'}).formatToParts(new Date());
      var h=0,m=0; parts.forEach(function(p){ if(p.type==='hour')h=+p.value; if(p.type==='minute')m=+p.value; });
      var t=h+m/60;
      if(t>=6.5&&t<8) return 'dawn'; if(t>=8&&t<17.5) return 'day'; if(t>=17.5&&t<19) return 'dusk'; return 'night';
    }
    function set(){ var p=phase(); ['day','dawn','dusk','night'].forEach(function(k){ hd.classList.toggle('tod-'+k,k===p); }); }
    set(); setInterval(set,300000);
  })();
  // ---------- Craic Arcade: Pint-Man ----------
  (function(){
    var cv=document.getElementById('pm'); if(!cv||!cv.getContext) return;
    var ctx=cv.getContext('2d');
    var MAP=[
      "###################",
      "#........#........#",
      "#o##.###.#.###.##o#",
      "#.................#",
      "#.##.#.#####.#.##.#",
      "#....#...#...#....#",
      "####.### # ###.####",
      "   #.#   G   #.#   ",
      "####.# ##-## #.####",
      "    .  #HHH#  .    ",
      "####.# ##### #.####",
      "   #.#       #.#   ",
      "####.# ##### #.####",
      "#........#........#",
      "#.##.###.#.###.##.#",
      "#o.#.....P.....#.o#",
      "##.#.#.#####.#.#.##",
      "#....#...#...#....#",
      "#.######.#.######.#",
      "#.................#",
      "###################"];
    var R=MAP.length, C=MAP[0].length, T=16;
    var W=C*T, H=R*T;
    var NAMES=['Seymon','Louise','Jeff','Helen','Steve','Vicky'];
    var faces={}; NAMES.forEach(function(n){ var el=document.getElementById('f-'+n); if(!el) return; var im=new Image(); im.src=el.getAttribute('href')||el.getAttributeNS('http://www.w3.org/1999/xlink','href'); faces[n]=im; });
    var hero='Seymon';
    try{ var sv=localStorage.getItem('craicpack-pm-hero'); if(sv&&faces[sv]) hero=sv; }catch(e){}
    var BEST_KEY='craicpack-pm-best', best=0; try{ best=parseInt(localStorage.getItem(BEST_KEY)||'0',10)||0; }catch(e){}
    var DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}, OPP={up:'down',down:'up',left:'right',right:'left'};
    var grid, dots, dotsLeft, score, lives, level, state, stateT, fright, frightT, chain, modeT, mode, bonus, bonusT, eatenCount, pm, ghosts, flashT, msg;
    var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function cell(x,y){ if(y<0||y>=R) return '#'; x=((x%C)+C)%C; return grid[y][x]; }
    function isWall(ch){ return ch==='#'; }
    function canPlayer(x,y){ var ch=cell(x,y); return ch!=='#'&&ch!=='-'&&ch!=='H'; }
    function canGhost(g,x,y){ var ch=cell(x,y); if(ch==='#') return false; if(ch==='-'||ch==='H') return g.state==='exit'||g.state==='eyes'; return true; }
    function newMaze(){
      grid=MAP.map(function(r){ return r.split(''); }); dots=0;
      for(var y=0;y<R;y++) for(var x=0;x<C;x++){ var ch=grid[y][x]; if(ch==='.'||ch==='o') dots++; }
      dotsLeft=dots; eatenCount=0; bonus=null;
    }
    function find(ch){ for(var y=0;y<R;y++){ var x=MAP[y].indexOf(ch); if(x>=0) return [x,y]; } }
    var PS=find('P'), GS=find('G');
    var GDEF=[
      {name:'The Bouncer',col:'#6A6A6A',corner:[C-2,-2],start:[GS[0],GS[1]],delay:0},
      {name:'The Garda',col:'#1F3A8A',corner:[1,-2],start:[8,9],delay:3},
      {name:'The Taxi Driver',col:'#F2C230',corner:[C-1,R],start:[9,9],delay:6},
      {name:'The Hangover',col:'#8DB85A',corner:[0,R],start:[10,9],delay:9}];
    function spd(base){ return base*(1+0.06*Math.min(level-1,6)); }
    function resetActors(){
      pm={x:PS[0],y:PS[1],dir:'left',want:'left',p:0,moving:true,mouth:0};
      ghosts=GDEF.map(function(d,i){ return {i:i,def:d,x:d.start[0],y:d.start[1],dir:i===0?'left':'up',p:0,state:i===0?'active':'house',wait:d.delay,bob:0}; });
      fright=false; frightT=0; mode='scatter'; modeT=7;
    }
    function newGame(){ score=0; lives=3; level=1; newMaze(); resetActors(); setState('ready'); hud(); }
    function setState(s){ state=s; stateT=0; }
    function pos(e){ var d=DIRS[e.dir]; return [e.x+d[0]*e.p, e.y+d[1]*e.p]; }
    function addScore(n){ score+=n; if(score>best){ best=score; try{localStorage.setItem(BEST_KEY,String(best));}catch(e){} } hud(); }
    // ----- player -----
    function stepPlayer(dt){
      var s=spd(6.4)*dt;
      if(pm.want===OPP[pm.dir]&&pm.moving){ var d=DIRS[pm.dir]; pm.x+=d[0]; pm.y+=d[1]; pm.p=1-pm.p; pm.dir=pm.want; wrap(pm); }
      if(!pm.moving){ if(pm.want&&canPlayer(pm.x+DIRS[pm.want][0],pm.y+DIRS[pm.want][1])){ pm.dir=pm.want; pm.moving=true; } else return; }
      pm.p+=s;
      while(pm.p>=1){
        var d2=DIRS[pm.dir]; pm.x+=d2[0]; pm.y+=d2[1]; pm.p-=1; wrap(pm); eat(pm.x,pm.y);
        var wd=DIRS[pm.want];
        if(pm.want&&canPlayer(pm.x+wd[0],pm.y+wd[1])) pm.dir=pm.want;
        var nd=DIRS[pm.dir];
        if(!canPlayer(pm.x+nd[0],pm.y+nd[1])){ pm.p=0; pm.moving=false; break; }
      }
      pm.mouth+=dt*(pm.moving?12:0);
    }
    function wrap(e){ if(e.x<0) e.x+=C; if(e.x>=C) e.x-=C; }
    function eat(x,y){
      var ch=grid[y][x];
      if(ch==='.'){ grid[y][x]=' '; addScore(10); dotsLeft--; eatenCount++; }
      else if(ch==='o'){ grid[y][x]=' '; addScore(50); dotsLeft--; eatenCount++; startFright(); }
      if(eatenCount===60||eatenCount===140){ if(!bonus){ bonus={x:9,y:11}; bonusT=9; } }
      if(bonus&&bonus.x===x&&bonus.y===y){ var pts=100*level; addScore(pts); popup(pts,x,y); bonus=null; }
      if(dotsLeft<=0){ setState('clear'); }
    }
    var pops=[];
    function popup(txt,x,y){ pops.push({t:txt,x:x,y:y,life:1.2}); }
    function startFright(){ fright=true; frightT=Math.max(2,7-level); chain=0; ghosts.forEach(function(g){ if(g.state==='active'){ g.scared=true; if(g.p>0){ var d=DIRS[g.dir]; g.x+=d[0]; g.y+=d[1]; wrap(g); g.p=1-g.p; } g.dir=OPP[g.dir]; } }); }
    // ----- ghosts -----
    function target(g){
      if(g.state==='exit') return [9,7];
      if(g.state==='eyes') return [9,9];
      if(mode==='scatter') return g.def.corner;
      var pd=DIRS[pm.dir];
      if(g.i===0) return [pm.x,pm.y];
      if(g.i===1) return [pm.x+pd[0]*4,pm.y+pd[1]*4];
      if(g.i===2){ var b=ghosts[0], ax=pm.x+pd[0]*2, ay=pm.y+pd[1]*2; return [ax*2-b.x, ay*2-b.y]; }
      var dx=g.x-pm.x, dy=g.y-pm.y; return (dx*dx+dy*dy>64)?[pm.x,pm.y]:g.def.corner;
    }
    function choose(g){
      var opts=['up','left','down','right'].filter(function(k){ var d=DIRS[k]; return k!==OPP[g.dir]&&canGhost(g,g.x+d[0],g.y+d[1]); });
      if(!opts.length) opts=[OPP[g.dir]];
      if(g.scared&&g.state==='active') return opts[Math.floor(Math.random()*opts.length)];
      var t=target(g), bestK=opts[0], bestD=1e9;
      opts.forEach(function(k){ var d=DIRS[k], nx=g.x+d[0], ny=g.y+d[1], dd=(nx-t[0])*(nx-t[0])+(ny-t[1])*(ny-t[1]); if(dd<bestD){bestD=dd;bestK=k;} });
      return bestK;
    }
    function stepGhost(g,dt){
      if(g.state==='house'){ g.wait-=dt; g.bob+=dt*6; if(g.wait<=0){ g.state='exit'; g.dir=choose(g); } return; }
      var base=g.state==='eyes'?12:(g.scared?3.8:spd(6.0));
      if(g.state==='active'&&!g.scared&&cell(g.x,g.y)===' '&&g.y===9&&(g.x<4||g.x>14)) base=3.5;
      g.p+=base*dt;
      while(g.p>=1){
        var d=DIRS[g.dir]; g.x+=d[0]; g.y+=d[1]; g.p-=1; wrap(g);
        if(g.state==='exit'&&g.x===9&&g.y===7){ g.state='active'; g.scared=false; }
        if(g.state==='eyes'&&g.x===9&&g.y===9){ g.state='exit'; g.scared=false; }
        g.dir=choose(g);
        var nd=DIRS[g.dir]; if(!canGhost(g,g.x+nd[0],g.y+nd[1])){ g.p=0; break; }
      }
    }
    function collide(){
      var a=pos(pm);
      for(var i=0;i<ghosts.length;i++){ var g=ghosts[i]; if(g.state!=='active') continue; var b=pos(g);
        var dx=Math.abs(a[0]-b[0]); if(dx>C/2) dx=C-dx; if(dx+Math.abs(a[1]-b[1])<0.65){
          if(g.scared){ chain++; var pts=200*Math.pow(2,chain-1); addScore(pts); popup(pts,Math.round(b[0]),Math.round(b[1])); g.state='eyes'; g.scared=false; }
          else { lives--; hud(); setState('dying'); return; }
        } }
    }
    // ----- loop -----
    var last=0, raf=0, running=false, visible=true;
    function frame(t){
      raf=0; if(!running) return;
      var dt=Math.min(0.05,(t-(last||t))/1000); last=t; stateT+=dt;
      if(state==='play'){
        modeT-=dt; if(modeT<=0){ mode=mode==='scatter'?'chase':'scatter'; modeT=mode==='scatter'?7:20; }
        if(fright){ frightT-=dt; if(frightT<=0){ fright=false; ghosts.forEach(function(g){ g.scared=false; }); } }
        if(bonus){ bonusT-=dt; if(bonusT<=0) bonus=null; }
        var n=3; for(var k=0;k<n;k++){ stepPlayer(dt/n); if(state!=='play') break; ghosts.forEach(function(g){ stepGhost(g,dt/n); }); collide(); if(state!=='play') break; }
      } else if(state==='ready'&&stateT>1.8){ setState('play'); }
      else if(state==='dying'&&stateT>1.6){ if(lives<=0) setState('over'); else { resetActors(); setState('ready'); } }
      else if(state==='clear'&&stateT>2.6){ level++; newMaze(); resetActors(); hud(); setState('ready'); }
      pops.forEach(function(p){ p.life-=dt; }); pops=pops.filter(function(p){ return p.life>0; });
      draw(t/1000);
      if(state!=='title'&&state!=='over'&&state!=='paused') raf=requestAnimationFrame(frame); else running=false;
    }
    function go(){ if(!running){ running=true; last=0; raf=requestAnimationFrame(frame); } }
    // ----- drawing -----
    function fit(){
      var cssW=cv.clientWidth||W, dpr=window.devicePixelRatio||1;
      cv.width=Math.round(cssW*dpr); cv.height=Math.round(cssW*H/W*dpr);
      draw(performance.now()/1000);
    }
    function drawMaze(flash){
      ctx.fillStyle='#140D08'; ctx.fillRect(0,0,W,H);
      var wall=flash?'#F2E7CD':'#174A35', edge=flash?'#fff':'#D6AE55';
      for(var y=0;y<R;y++) for(var x=0;x<C;x++){
        var ch=grid[y][x];
        if(ch==='#'){
          ctx.fillStyle=wall; ctx.fillRect(x*T,y*T,T,T);
          ctx.strokeStyle=edge; ctx.lineWidth=1.5; ctx.beginPath();
          if(y>0&&!isWall(grid[y-1][x])){ ctx.moveTo(x*T,y*T+.75); ctx.lineTo(x*T+T,y*T+.75); }
          if(y<R-1&&!isWall(grid[y+1][x])){ ctx.moveTo(x*T,y*T+T-.75); ctx.lineTo(x*T+T,y*T+T-.75); }
          if(x>0&&!isWall(grid[y][x-1])){ ctx.moveTo(x*T+.75,y*T); ctx.lineTo(x*T+.75,y*T+T); }
          if(x<C-1&&!isWall(grid[y][x+1])){ ctx.moveTo(x*T+T-.75,y*T); ctx.lineTo(x*T+T-.75,y*T+T); }
          ctx.stroke();
        } else if(ch==='-'){ ctx.fillStyle='#E07A2E'; ctx.fillRect(x*T,y*T+T/2-1.5,T,3); }
        else if(ch==='.'){ var cx=x*T+T/2, cy=y*T+T/2; ctx.fillStyle='#A0622E'; ctx.fillRect(cx-2,cy-2.5,4,5.5); ctx.fillStyle='#F2E7CD'; ctx.fillRect(cx-2,cy-3.5,4,1.8); }
        else if(ch==='o'){ if(Math.floor(performance.now()/250)%2===0||state!=='play'){ var px=x*T+T/2, py=y*T+T/2; ctx.fillStyle='#F2E7CD'; ctx.fillRect(px-4.5,py-7,9,4); ctx.fillStyle='#8A4F22'; ctx.beginPath(); ctx.moveTo(px-4.5,py-3); ctx.lineTo(px+4.5,py-3); ctx.lineTo(px+3.5,py+7); ctx.lineTo(px-3.5,py+7); ctx.closePath(); ctx.fill(); ctx.fillStyle='#D6AE55'; ctx.fillRect(px-.6,py,1.2,3.5); } }
      }
      ctx.fillStyle='#D6AE55'; ctx.font='bold 6px "Press Start 2P",monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('TEMPLE BAR',9.5*T,10.5*T);
    }
    function drawShamrock(x,y,r){
      ctx.fillStyle='#3FA564';
      [[0,-1],[-0.95,0.4],[0.95,0.4]].forEach(function(o){ ctx.beginPath(); ctx.arc(x+o[0]*r*.55,y+o[1]*r*.55,r*.5,0,Math.PI*2); ctx.fill(); });
      ctx.strokeStyle='#3FA564'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(x,y+r*.3); ctx.quadraticCurveTo(x+r*.3,y+r*.8,x+r*.6,y+r*1.1); ctx.stroke();
    }
    function drawPM(t){
      var p=pos(pm), cx=p[0]*T+T/2, cy=p[1]*T+T/2, r=7.2;
      var ang={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[pm.dir];
      var open=state==='dying'?Math.min(Math.PI*0.98,0.25+stateT*2.2):(0.08+0.32*Math.abs(Math.sin(pm.mouth)));
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,ang+open,ang+Math.PI*2-open); ctx.closePath(); ctx.clip();
      var im=faces[hero];
      if(im&&im.complete&&im.naturalWidth){ var s=Math.min(im.naturalWidth,im.naturalHeight); ctx.drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,cx-r,cy-r,2*r,2*r); }
      else { ctx.fillStyle='#F2C230'; ctx.fillRect(cx-r,cy-r,2*r,2*r); }
      ctx.restore();
      ctx.strokeStyle='#D6AE55'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.arc(cx,cy,r,ang+open,ang+Math.PI*2-open); if(open<Math.PI*.9){ ctx.lineTo(cx,cy); ctx.closePath(); } ctx.stroke();
    }
    function drawGhost(g,t){
      var p; if(g.state==='house'){ p=[g.x,g.y+Math.sin(g.bob)*0.2]; } else p=pos(g);
      var cx=p[0]*T+T/2, cy=p[1]*T+T/2, r=7;
      var d=DIRS[g.dir], eyesOnly=g.state==='eyes';
      if(!eyesOnly){
        var col=g.def.col;
        if(g.scared){ col=(frightT<2&&Math.floor(t*6)%2)?'#F2E7CD':'#2C4FA3'; }
        ctx.fillStyle=col; ctx.beginPath(); ctx.arc(cx,cy-1,r,Math.PI,0); ctx.lineTo(cx+r,cy+r);
        var wv=Math.floor(t*8)%2;
        for(var k=0;k<4;k++){ var x1=cx+r-(k+0.5)*(2*r/4), x2=cx+r-(k+1)*(2*r/4); ctx.lineTo(x1,cy+r-(wv?3:2)); ctx.lineTo(x2,cy+r); }
        ctx.closePath(); ctx.fill();
        if(!g.scared){
          if(g.i===1){ ctx.fillStyle='#E8F03A'; ctx.fillRect(cx-r,cy+2,2*r,2.4); ctx.fillStyle='#14224F'; ctx.fillRect(cx-r+1,cy-r-2,2*r-2,3); ctx.fillStyle='#D6AE55'; ctx.fillRect(cx-1,cy-r-1.5,2,2); }
          if(g.i===2){ ctx.fillStyle='#111'; for(var q=0;q<7;q++){ if(q%2===0) ctx.fillRect(cx-r+q*2,cy+2,2,2); else ctx.fillRect(cx-r+q*2,cy+4,2,2); } ctx.fillStyle='#fff'; ctx.fillRect(cx-3.5,cy-r-3.5,7,3); ctx.fillStyle='#111'; ctx.font='bold 2.6px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('TAXI',cx,cy-r-2); }
          if(g.i===3){ ctx.fillStyle='#BFE3F5'; ctx.beginPath(); ctx.arc(cx+r-0.5,cy-r+2,1.4,0,Math.PI*2); ctx.fill(); }
        } else {
          ctx.strokeStyle=frightT<2&&Math.floor(t*6)%2?'#B3322B':'#F2E7CD'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx-4,cy+3); for(var z=0;z<4;z++) ctx.lineTo(cx-4+(z+1)*2,cy+(z%2?3:1.5)); ctx.stroke();
        }
      }
      if(!g.scared||eyesOnly){
        if(g.i===0&&!eyesOnly){ ctx.fillStyle='#050505'; ctx.fillRect(cx-5.5,cy-3.5,11,3.2); ctx.fillStyle='#555'; ctx.fillRect(cx-4.5,cy-3,2,1); }
        else {
          [-2.8,2.8].forEach(function(ox){ ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(cx+ox,cy-2,2.2,2.8,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle=g.i===3&&!eyesOnly?'#6A2E7A':'#1E1812'; ctx.beginPath(); ctx.arc(cx+ox+d[0]*1.1+(g.i===3&&!eyesOnly?Math.sin(t*5+ox)*0.8:0),cy-2+d[1]*1.3,1.2,0,Math.PI*2); ctx.fill(); });
        }
      } else { ctx.fillStyle='#F2E7CD'; ctx.fillRect(cx-3.5,cy-3,2,2); ctx.fillRect(cx+1.5,cy-3,2,2); }
    }
    function banner(txt,sub,col){
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='9px "Press Start 2P",monospace'; ctx.fillStyle=col||'#F2C230'; ctx.fillText(txt,9.5*T,11.5*T);
      if(sub){ ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#F2E7CD'; ctx.fillText(sub,9.5*T,11.5*T+13); }
    }
    function draw(t){
      var sc=cv.width/W; ctx.setTransform(sc,0,0,sc,0,0); ctx.imageSmoothingEnabled=true;
      if(state==='title'||!grid){ drawTitle(t); return; }
      var flash=state==='clear'&&Math.floor(stateT*5)%2===1;
      drawMaze(flash);
      if(bonus){ drawShamrock(bonus.x*T+T/2,bonus.y*T+T/2-1,6); }
      if(state!=='clear'){ ghosts.forEach(function(g){ if(state!=='dying'||stateT<0.5) drawGhost(g,t); }); }
      drawPM(t);
      pops.forEach(function(p){ ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#8FE3FF'; ctx.textAlign='center'; ctx.fillText(p.t,p.x*T+T/2,p.y*T+T/2-(1.2-p.life)*6); });
      if(state==='ready') banner('READY!',level>1?'LEVEL '+level:null);
      if(state==='clear') banner('LAST ORDERS!','LEVEL '+level+' CLEARED');
      if(state==='over'){ ctx.fillStyle='rgba(10,6,4,.72)'; ctx.fillRect(0,0,W,H); banner('CLOSING TIME','SCORE '+score+'  TAP TO GO AGAIN','#E07A2E'); }
      if(state==='paused'){ ctx.fillStyle='rgba(10,6,4,.6)'; ctx.fillRect(0,0,W,H); banner('PAUSED','TAP TO CARRY ON'); }
    }
    function drawTitle(t){
      ctx.fillStyle='#140D08'; ctx.fillRect(0,0,W,H);
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='18px "Press Start 2P",monospace'; ctx.fillStyle='#F2C230'; ctx.fillText('PINT-MAN',W/2,52);
      ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#D6AE55'; ctx.fillText('A TEMPLE BAR ADVENTURE',W/2,72);
      var names=['THE BOUNCER','THE GARDA','THE TAXI DRIVER','THE HANGOVER'];
      var fake={dir:'right',p:0,state:'active',bob:0};
      for(var i=0;i<4;i++){ var gy=104+i*26; var g={i:i,def:GDEF[i],x:5,y:(gy-T/2)/T,dir:'right',p:0,state:'active',bob:0}; drawGhost(g,t);
        ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle=['#F2E7CD','#8FB4FF','#F2C230','#B6E08A'][i]; ctx.textAlign='left'; ctx.fillText(names[i],7*T,gy); }
      ctx.textAlign='left'; var py=104+4*26;
      ctx.fillStyle='#2B150A'; ctx.fillRect(5*T+6,py-3,4,5.5); ctx.fillStyle='#F2E7CD'; ctx.fillRect(5*T+6,py-4,4,1.8);
      ctx.fillStyle='#F2E7CD'; ctx.fillText('PINT  10',7*T,py);
      ctx.fillStyle='#F2E7CD'; ctx.fillRect(5*T+3.5,py+20-7,9,4); ctx.fillStyle='#2B150A'; ctx.fillRect(5*T+4,py+20-3,8,9);
      ctx.fillStyle='#F2E7CD'; ctx.fillText('FULL PINT  50',7*T,py+22);
      drawShamrock(5*T+8,py+44,6); ctx.fillStyle='#F2E7CD'; ctx.fillText('SHAMROCK  100+',7*T,py+46);
      ctx.textAlign='center';
      if(Math.floor(t*2)%2===0){ ctx.font='8px "Press Start 2P",monospace'; ctx.fillStyle='#F2C230'; ctx.fillText('TAP TO START',W/2,H-34); }
      ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#D6AE55'; ctx.fillText('HI '+best,W/2,H-16);
      if(!running){ running=true; last=0; raf=requestAnimationFrame(titleLoop); }
    }
    function titleLoop(t){ raf=0; if(state!=='title'||!visible){ running=false; return; } draw(t/1000); raf=requestAnimationFrame(titleLoop); }
    // ----- HUD -----
    var hs=document.getElementById('pmscore'), hb=document.getElementById('pmbest'), hl=document.getElementById('pmlives'), hv=document.getElementById('pmlevel');
    function hud(){ hs.textContent=score||0; hb.textContent=best; hv.textContent=level||1; hl.textContent='🍺'.repeat(Math.max(0,lives||0)); }
    // ----- input -----
    function steer(d){ if(state==='play'||state==='ready'){ pm.want=d; } }
    function tapStart(){
      if(state==='title'||state==='over'){ newGame(); running=false; if(raf)cancelAnimationFrame(raf); raf=0; go(); return true; }
      if(state==='paused'){ setState(pausedFrom||'play'); go(); return true; }
      return false;
    }
    var sx=0,sy=0,swiped=false;
    cv.addEventListener('touchstart',function(e){ var t0=e.touches[0]; sx=t0.clientX; sy=t0.clientY; swiped=false; },{passive:true});
    cv.addEventListener('touchmove',function(e){ if(e.cancelable) e.preventDefault(); var t0=e.touches[0], dx=t0.clientX-sx, dy=t0.clientY-sy;
      if(Math.abs(dx)>16||Math.abs(dy)>16){ steer(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')); sx=t0.clientX; sy=t0.clientY; swiped=true; } },{passive:false});
    cv.addEventListener('touchend',function(e){ if(!swiped) tapStart(); });
    cv.addEventListener('click',function(){ if(!('ontouchstart' in window)) tapStart(); });
    document.addEventListener('keydown',function(e){
      if(cv.offsetParent===null) return; var box=cv.getBoundingClientRect(); if(box.bottom<0||box.top>window.innerHeight) return;
      var k={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key];
      if(k&&state!=='title'&&state!=='over'){ e.preventDefault(); steer(k); }
      else if((e.key===' '||e.key==='Enter')&&document.activeElement===cv){ e.preventDefault(); tapStart(); }
    });
    document.querySelectorAll('.pmpad button').forEach(function(b){
      function fire(e){ if(cv.offsetParent===null||b.dataset.d==='jump') return; if(e.cancelable) e.preventDefault(); if(state==='title'||state==='over'||state==='paused'){ tapStart(); } steer(b.dataset.d); }
      b.addEventListener('touchstart',fire,{passive:false}); b.addEventListener('mousedown',fire);
    });
    // character pick
    var picks=document.querySelectorAll('.pmpick button');
    function markPick(){ picks.forEach(function(b){ b.setAttribute('aria-pressed',b.dataset.n===hero?'true':'false'); }); }
    picks.forEach(function(b){ b.addEventListener('click',function(){ hero=b.dataset.n; try{localStorage.setItem('craicpack-pm-hero',hero);}catch(e){} markPick(); if(state==='title') draw(performance.now()/1000); }); });
    markPick();
    // pause when hidden or scrolled away
    var pausedFrom=null;
    function pause(){ if(state==='play'||state==='ready'){ pausedFrom=state; setState('paused'); draw(performance.now()/1000); } }
    window.PM={hide:pause,show:function(){ fit(); },dbg:function(){return {state:state,score:score,level:level,lives:lives,visible:visible,raf:raf};}};
    document.addEventListener('visibilitychange',function(){ if(document.hidden) pause(); });
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(en){ visible=en.isIntersecting; if(!visible) pause(); else if(state==='title'&&!raf){ running=false; draw(performance.now()/1000); } }); },{threshold:0.2}).observe(cv); }
    window.addEventListener('resize',fit);
    state='title'; score=0; lives=3; level=1; hud();
    (document.fonts&&document.fonts.load?document.fonts.load('8px "Press Start 2P"').catch(function(){}):Promise.resolve()).then(fit);
    fit();
  })();
  // ---------- Craic Arcade: Whiskey Kong ----------
  (function(){
    var cv=document.getElementById('wk'); if(!cv||!cv.getContext) return;
    var ctx=cv.getContext('2d'), W=240, H=280;
    var NAMES=['Seymon','Louise','Jeff','Helen','Steve','Vicky'], faces={};
    function syncFaces(){
      NAMES.forEach(function(n){
        var el=document.getElementById('f-'+n'), im=faces[n];
        if(!el||!im)return;
        var u=window.CRAIC_CREW_IMAGES&&window.CRAIC_CREW_IMAGES['f-'+n];
        if(!u&&el) u=el.getAttribute('href')||el.getAttributeNS('http://www.w3.org/1999/xlink','href');
        if(u&&im.src!==u) im.src=u;
      });
    }
    NAMES.forEach(function(n){ faces[n]=new Image(); });
    syncFaces();
    window.addEventListener('craic-faces-ready',syncFaces);
    function heroName(){ try{ var h=localStorage.getItem('craicpack-pm-hero'); if(h&&faces[h]) return h; }catch(e){} return 'Seymon'; }
    var BEST='craicpack-wk-best', best=0; try{ best=parseInt(localStorage.getItem(BEST)||'0',10)||0; }catch(e){}
    var G=[
      {x1:0,x2:240,yl:270,yr:270,dir:-1},
      {x1:0,x2:216,yl:230,yr:238,dir:1},
      {x1:24,x2:240,yl:196,yr:188,dir:-1},
      {x1:0,x2:216,yl:146,yr:154,dir:1},
      {x1:24,x2:240,yl:112,yr:104,dir:-1},
      {x1:0,x2:216,yl:62,yr:70,dir:1},
      {x1:96,x2:160,yl:30,yr:30,dir:0}];
    var L=[{gi:0,x:196},{gi:0,x:80,broken:1},{gi:1,x:44},{gi:1,x:120},{gi:2,x:200},{gi:2,x:140,broken:1},{gi:3,x:50},{gi:3,x:110},{gi:4,x:196},{gi:4,x:150,broken:1},{gi:5,x:130}];
    function gy(i,x){ var g=G[i]; return g.yl+(g.yr-g.yl)*x/240; }
    function onSpan(i,x){ var g=G[i]; return x>=g.x1-1&&x<=g.x2+1; }
    var keys={left:0,right:0,up:0,down:0}, jumpQ=false;
    var state='title', stateT=0, score=0, lives=3, round=1, bonus=3000, bonusT=0, p, barrels, bags, spawnT, throwT, pops=[], mate='Louise', hero='Seymon';
    function setState(s){ state=s; stateT=0; }
    function addScore(n){ score+=n; if(score>best){ best=score; try{localStorage.setItem(BEST,String(best));}catch(e){} } hud(); }
    function resetRound(){
      hero=heroName(); var others=NAMES.filter(function(n){ return n!==hero; }); mate=others[Math.floor(Math.random()*others.length)];
      p={x:34,y:gy(0,34),gi:0,st:'walk',vx:0,vy:0,face:1,from:0,walkT:0,ladder:null,hammer:0};
      barrels=[]; spawnT=1.2; throwT=0; bonus=3000; bonusT=0;
      bags=[{gi:2,x:62,got:0},{gi:4,x:176,got:0}];
    }
    function newGame(){ score=0; lives=3; round=1; resetRound(); setState('ready'); hud(); }
    function die(){ if(state!=='play') return; lives--; hud(); setState('dying'); }
    // ---- player ----
    function ladderAt(gi,x,up){ for(var i=0;i<L.length;i++){ var l=L[i]; if(l.broken) continue; if(up&&l.gi===gi&&Math.abs(l.x-x)<6) return l; if(!up&&l.gi+1===gi&&Math.abs(l.x-x)<6) return l; } return null; }
    function stepPlayer(dt){
      if(p.hammer>0) p.hammer=Math.max(0,p.hammer-dt);
      var mv=(keys.right?1:0)-(keys.left?1:0), sp=52;
      if(p.st==='walk'){
        if(jumpQ){ jumpQ=false; p.st='air'; p.vy=-128; p.vx=mv*sp; p.from=p.y; p.jumping=true; p.scored={}; return; }
        if(keys.up){ var l=ladderAt(p.gi,p.x,true); if(l){ p.st='climb'; p.ladder=l; p.x=l.x; return; } }
        if(keys.down){ var l2=ladderAt(p.gi,p.x,false); if(l2){ p.st='climb'; p.ladder=l2; p.x=l2.x; p.y+=2; return; } }
        if(mv){ p.face=mv; p.x=Math.max(4,Math.min(236,p.x+mv*sp*dt)); p.walkT+=dt; }
        if(!onSpan(p.gi,p.x)){ p.st='air'; p.vy=0; p.vx=mv*sp*0.6; p.from=p.y; p.jumping=false; return; }
        p.y=gy(p.gi,p.x);
        if(p.gi===5&&p.x<40) die();
        if(p.gi===6){ addScore(bonus); setState('clear'); }
      } else if(p.st==='climb'){
        var l3=p.ladder, top=gy(l3.gi+1,l3.x), bot=gy(l3.gi,l3.x);
        var c=(keys.down?1:0)-(keys.up?1:0); p.y+=c*34*dt; if(c) p.walkT+=dt;
        if(p.y<=top){ p.y=top; p.gi=l3.gi+1; p.st='walk'; if(p.gi===6){ addScore(bonus); setState('clear'); } }
        else if(p.y>=bot){ p.y=bot; p.gi=l3.gi; p.st='walk'; }
      } else {
        var py=p.y; p.vy+=440*dt; p.x=Math.max(4,Math.min(236,p.x+p.vx*dt)); p.y+=p.vy*dt;
        if(p.vy>0){ for(var k=G.length-1;k>=0;k--){ var s=gy(k,p.x); if(onSpan(k,p.x)&&py<=s+1&&p.y>=s){ p.y=s; p.gi=k; p.st='walk'; if(p.y-p.from>30) die(); break; } } }
        if(p.y>H+20) die();
      }
    }
    // ---- barrels ----
    function spawn(){ throwT=0.5; barrels.push({x:40,y:gy(5,40)-5,gi:5,dir:1,st:'roll',vy:0,rot:0,id:Math.random()}); }
    function stepBarrels(dt){
      var sp=58*(1+0.08*Math.min(round-1,6));
      barrels.forEach(function(b){
        if(b.st==='roll'){
          var nx=b.x+b.dir*sp*dt;
          if(b.gi>0){ for(var i=0;i<L.length;i++){ var l=L[i]; if(l.broken||l.gi+1!==b.gi) continue;
            if((b.x-l.x)*(nx-l.x)<=0){ var below=p.gi<b.gi?0.25:0; if(Math.random()<0.18+below+0.03*round){ b.st='ladder'; b.x=l.x; b.ladder=l; return; } } } }
          b.x=nx; b.rot+=b.dir*dt*9;
          if(!onSpan(b.gi,b.x)){ b.st='fall'; b.vy=10; if(b.gi===0){ b.dead=true; } return; }
          b.y=gy(b.gi,b.x)-5;
        } else if(b.st==='ladder'){
          b.y+=48*dt; var t=gy(b.ladder.gi,b.x)-5;
          if(b.y>=t){ b.y=t; b.gi=b.ladder.gi; b.dir=G[b.gi].dir||1; b.st='roll'; }
        } else {
          var py=b.y; b.vy+=420*dt; b.y+=b.vy*dt; b.x+=b.dir*22*dt; b.rot+=dt*12;
          var k=b.gi-1; if(k>=0){ var s=gy(k,b.x)-5; if(py<=s&&b.y>=s&&onSpan(k,b.x)){ b.y=s; b.gi=k; b.dir=G[k].dir||1; b.st='roll'; } }
          if(b.y>H+10) b.dead=true;
        }
        if(b.x<-10||b.x>W+10) b.dead=true;
        // collisions
        var dx=b.x-p.x, dy=b.y-(p.y-8);
        if(p.hammer>0&&Math.abs(dx)<16&&Math.abs(dy)<14){ b.dead=true; addScore(300); pops.push({t:'300',x:b.x,y:b.y,life:1}); return; }
        if(dx*dx+dy*dy<100){ die(); }
        else if(p.st==='air'&&p.jumping&&p.scored&&!p.scored[b.id]&&Math.abs(dx)<9&&b.y>p.y&&b.y-p.y<26){ p.scored[b.id]=1; addScore(100); pops.push({t:'100',x:p.x,y:p.y-26,life:1}); }
      });
      barrels=barrels.filter(function(b){ return !b.dead; });
      bags.forEach(function(g){ if(!g.got&&p.st!=='climb'){ var y=gy(g.gi,g.x)-14; if(Math.abs(p.x-g.x)<9&&Math.abs((p.y-10)-y)<12){ g.got=1; p.hammer=8; addScore(100); } } });
    }
    // ---- loop ----
    var raf=0, last=0, visible=true, pausedFrom=null;
    function frame(t){
      raf=0; var dt=Math.min(0.05,(t-(last||t))/1000); last=t; stateT+=dt;
      if(state==='play'){
        bonusT+=dt; if(bonusT>=2){ bonusT-=2; bonus=Math.max(0,bonus-100); hud(); if(bonus===0) die(); }
        spawnT-=dt; if(spawnT<=0){ spawn(); spawnT=Math.max(1.1,2.4-0.2*(round-1))*(0.75+Math.random()*0.5); }
        if(throwT>0) throwT-=dt;
        var n=3; for(var k=0;k<n;k++){ if(state!=='play') break; stepPlayer(dt/n); if(state!=='play') break; stepBarrels(dt/n); }
      } else if(state==='ready'&&stateT>1.6){ setState('play'); }
      else if(state==='dying'&&stateT>1.6){ if(lives<=0) setState('over'); else { resetRound(); setState('ready'); } }
      else if(state==='clear'&&stateT>2.8){ round++; resetRound(); hud(); setState('ready'); }
      pops.forEach(function(q){ q.life-=dt; }); pops=pops.filter(function(q){ return q.life>0; });
      draw(t/1000);
      if(state!=='over'&&state!=='paused'&&visible&&cv.offsetParent!==null) raf=requestAnimationFrame(frame);
    }
    function go(){ if(!raf){ last=0; raf=requestAnimationFrame(frame); } }
    // ---- drawing ----
    function fit(){ var w=cv.clientWidth||W, dpr=window.devicePixelRatio||1; cv.width=Math.round(w*dpr); cv.height=Math.round(w*H/W*dpr); draw(performance.now()/1000); }
    function bg(){
      ctx.fillStyle='#1A0F09'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(120,60,30,.12)';
      for(var y=0;y<H;y+=10) for(var x=(y/10)%2?0:10;x<W;x+=20) ctx.fillRect(x+1,y+1,18,8);
    }
    function drawGirder(i){
      var g=G[i], a=g.x1, b=g.x2, ya=gy(i,a), yb=gy(i,b), th=6;
      ctx.fillStyle='#8E5E36'; ctx.beginPath(); ctx.moveTo(a,ya); ctx.lineTo(b,yb); ctx.lineTo(b,yb+th); ctx.lineTo(a,ya+th); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#5A3A20'; ctx.lineWidth=1; ctx.beginPath();
      for(var x=a;x<b;x+=8){ var y1=gy(i,x), y2=gy(i,Math.min(b,x+8)); ctx.moveTo(x,y1+th); ctx.lineTo(x+4,y1+0.5); ctx.lineTo(x+8,y2+th); } ctx.stroke();
      ctx.strokeStyle='#D6AE55'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(a,ya+.6); ctx.lineTo(b,yb+.6); ctx.stroke();
    }
    function drawLadder(l){
      var top=gy(l.gi+1,l.x), bot=gy(l.gi,l.x);
      ctx.strokeStyle='#E8D6A6'; ctx.lineWidth=1.4; ctx.beginPath();
      ctx.moveTo(l.x-4,top); ctx.lineTo(l.x-4,bot); ctx.moveTo(l.x+4,top); ctx.lineTo(l.x+4,bot);
      for(var y=top+4;y<bot;y+=5){ if(l.broken&&y>top+(bot-top)*0.35&&y<top+(bot-top)*0.65) continue; ctx.moveTo(l.x-4,y); ctx.lineTo(l.x+4,y); }
      if(l.broken){ ctx.clearRect; }
      ctx.stroke();
      if(l.broken){ ctx.fillStyle='#1A0F09'; ctx.fillRect(l.x-5,top+(bot-top)*0.38,10,(bot-top)*0.24); }
    }
    function drawBarrel(b){
      ctx.save(); ctx.translate(b.x,b.y);
      if(b.st==='ladder'){ ctx.fillStyle='#9A5418'; ctx.beginPath(); ctx.ellipse(0,0,7,5,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#3B2616'; ctx.lineWidth=1.2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-6,-2); ctx.lineTo(6,-2); ctx.moveTo(-6,2); ctx.lineTo(6,2); ctx.stroke(); ctx.restore(); return; }
      ctx.rotate(b.rot); ctx.fillStyle='#9A5418'; ctx.beginPath(); ctx.arc(0,0,5.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#3B2616'; ctx.lineWidth=1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-5,0); ctx.lineTo(5,0); ctx.stroke();
      ctx.restore();
    }
    function drawFace(name,x,y,r){
      var im=faces[name]; ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.clip();
      if(im&&im.complete&&im.naturalWidth){ var s=Math.min(im.naturalWidth,im.naturalHeight); ctx.drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,x-r,y-r,2*r,2*r); } else { ctx.fillStyle='#E8B894'; ctx.fillRect(x-r,y-r,2*r,2*r); }
      ctx.restore(); ctx.strokeStyle='#D6AE55'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
    }
    function drawPerson(name,x,y,face,walk,climb,col){
      var leg=Math.sin(walk*14)*2.5;
      ctx.fillStyle='#1E1812';
      if(climb){ ctx.fillRect(x-3.5,y-5+leg*0.5,2.5,5); ctx.fillRect(x+1,y-5-leg*0.5,2.5,5); }
      else { ctx.fillRect(x-3+leg*0.4,y-5,2.5,5); ctx.fillRect(x+0.5-leg*0.4,y-5,2.5,5); }
      ctx.fillStyle=col||'#2E9A5E'; ctx.fillRect(x-4.5,y-12,9,7.5);
      ctx.fillStyle='#E8B894';
      if(climb){ ctx.fillRect(x-6.5,y-13-leg*0.6,2,5); ctx.fillRect(x+4.5,y-13+leg*0.6,2,5); } else { ctx.fillRect(x-6.5,y-12,2,5); ctx.fillRect(x+4.5,y-12,2,5); }
      drawFace(name,x,y-18,6.5);
    }
    function drawSeamus(t){
      var x=22, y=gy(5,22), arm=throwT>0?-1:0, wob=Math.sin(t*3)*0.8;
      ctx.fillStyle='#1E1812'; ctx.fillRect(x-9,y-6,6,6); ctx.fillRect(x+3,y-6,6,6);
      ctx.fillStyle='#7A2E22'; ctx.beginPath(); ctx.ellipse(x,y-17,14,13,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#F2E7CD'; ctx.beginPath(); ctx.moveTo(x-8,y-22); ctx.lineTo(x+8,y-22); ctx.lineTo(x+10,y-5); ctx.lineTo(x-10,y-5); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#E8B894'; ctx.beginPath(); ctx.arc(x,y-35+wob,9,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1E1812'; ctx.fillRect(x-4,y-37+wob,2,2); ctx.fillRect(x+2,y-37+wob,2,2);
      ctx.fillStyle='#3B2616'; ctx.beginPath(); ctx.ellipse(x,y-32+wob,6,2.2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#E07A6A'; ctx.beginPath(); ctx.arc(x-6,y-33+wob,2,0,Math.PI*2); ctx.arc(x+6,y-33+wob,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#E8B894';
      if(arm){ ctx.fillRect(x+10,y-40,4,14); ctx.fillStyle='#9A5418'; ctx.beginPath(); ctx.arc(x+12,y-44,6,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#3B2616'; ctx.lineWidth=1; ctx.stroke(); }
      else { ctx.fillRect(x+11,y-24,4,12); }
      ctx.fillRect(x-15,y-24,4,12);
      ctx.fillStyle='#D6AE55'; ctx.font='5px "Press Start 2P",monospace'; ctx.textAlign='center'; ctx.fillText('BIG SEAMUS',x+4,y-50);
      // barrel stack
      [[x-14,y-2],[x-14,y-12]].forEach(function(q){ ctx.fillStyle='#9A5418'; ctx.fillRect(q[0]-6,q[1]-9,9,10); ctx.strokeStyle='#3B2616'; ctx.strokeRect(q[0]-6,q[1]-9,9,10); });
    }
    function drawPint(x,y){ ctx.fillStyle='#F2E7CD'; ctx.fillRect(x-2.5,y-9,5,2.5); ctx.fillStyle='#2B150A'; ctx.beginPath(); ctx.moveTo(x-2.5,y-6.5); ctx.lineTo(x+2.5,y-6.5); ctx.lineTo(x+2,y); ctx.lineTo(x-2,y); ctx.closePath(); ctx.fill(); }
    function drawBag(x,y,t){ var b=Math.sin(t*4)*1.5; ctx.save(); ctx.translate(x,y+b);
      ctx.fillStyle='#E9B949'; ctx.fillRect(-4,-9,2,5); ctx.fillRect(-1,-10,2,6); ctx.fillRect(2,-9,2,5);
      ctx.fillStyle='#F2E7CD'; ctx.beginPath(); ctx.moveTo(-6,-5); ctx.lineTo(6,-5); ctx.lineTo(5,6); ctx.lineTo(-5,6); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#0B2A1D'; ctx.lineWidth=.8; ctx.stroke();
      ctx.fillStyle='#B3322B'; ctx.fillRect(-3,-1,6,2.5); ctx.restore(); }
    function banner(a,b,col){ ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='10px "Press Start 2P",monospace'; ctx.fillStyle=col||'#F2C230'; ctx.fillText(a,W/2,H/2-4); if(b){ ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#F2E7CD'; ctx.fillText(b,W/2,H/2+12); } }
    function draw(t){
      var sc=cv.width/W; ctx.setTransform(sc,0,0,sc,0,0);
      if(state==='title'){ drawTitle(t); return; }
      bg(); L.forEach(drawLadder); for(var i=0;i<G.length;i++) drawGirder(i);
      drawSeamus(t);
      ctx.fillStyle='#5A3A20'; ctx.fillRect(2,256,16,14); ctx.strokeStyle='#D6AE55'; ctx.lineWidth=1; ctx.strokeRect(2,256,16,14); ctx.beginPath(); ctx.moveTo(2,260); ctx.lineTo(18,260); ctx.moveTo(2,266); ctx.lineTo(18,266); ctx.stroke();
      ctx.font='4px "Press Start 2P",monospace'; ctx.fillStyle='#F2E7CD'; ctx.textAlign='center'; ctx.fillText('KEG',10,252);
      // mate at the top
      var mx=148, my=gy(6,148); drawPerson(mate,mx,my,-1,0,false,'#23427A'); drawPint(mx-8,my-10);
      if(state!=='clear'&&Math.floor(t*2)%2){ ctx.font='5px "Press Start 2P",monospace'; ctx.fillStyle='#F2E7CD'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText("PINT'S",mx+10,my-20); ctx.fillText("READY!",mx+10,my-12); }
      bags.forEach(function(g){ if(!g.got) drawBag(g.x,gy(g.gi,g.x)-14,t); });
      barrels.forEach(drawBarrel);
      if(state==='dying'){ ctx.save(); ctx.translate(p.x,p.y-10); ctx.rotate(stateT*10); ctx.translate(-p.x,-(p.y-10)); drawPerson(hero,p.x,p.y,p.face,0,false); ctx.restore(); }
      else drawPerson(hero,p.x,p.y,p.face,p.walkT,p.st==='climb');
      if(p.hammer>0&&state==='play'){ var sw=Math.sin(t*16)*6; if(p.hammer>2||Math.floor(t*8)%2) drawBag(p.x+p.face*(8+Math.abs(sw)*0.3),p.y-30+sw*0.3,t); }
      pops.forEach(function(q){ ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#8FE3FF'; ctx.textAlign='center'; ctx.fillText(q.t,q.x,q.y-(1-q.life)*8); });
      if(state==='ready') banner(round>1?'ROUND '+round:'READY!',round>1?'FASTER BARRELS':null);
      if(state==='clear'){ banner('SLÁINTE!','BONUS '+bonus); }
      if(state==='over'){ ctx.fillStyle='rgba(10,6,4,.72)'; ctx.fillRect(0,0,W,H); banner('CLOSING TIME','SCORE '+score+'  TAP TO GO AGAIN','#E07A2E'); }
      if(state==='paused'){ ctx.fillStyle='rgba(10,6,4,.6)'; ctx.fillRect(0,0,W,H); banner('PAUSED','TAP TO CARRY ON'); }
    }
    function drawTitle(t){
      bg(); ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='15px "Press Start 2P",monospace'; ctx.fillStyle='#F2C230'; ctx.fillText('WHISKEY',W/2,36); ctx.fillText('KONG',W/2,56);
      ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#D6AE55'; ctx.fillText('HOW HIGH CAN YOU GET?',W/2,76);
      ctx.save(); ctx.translate(W/2-22,120-gy(5,22)+40); drawSeamus(t); ctx.restore();
      var bx=W/2+30+((t*40)%60); drawBarrel({x:bx,y:150,rot:t*8,st:'roll'});
      ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#F2E7CD';
      ctx.fillText('\u25C0 \u25B6  WALK',W/2,180); ctx.fillText('\u25B2 \u25BC  CLIMB LADDERS',W/2,194); ctx.fillText('TAP SCREEN / JUMP  JUMP',W/2,208);
      drawBag(W/2-58,228,t); ctx.textAlign='left'; ctx.fillText('SPICE BAG = SMASH',W/2-46,229); ctx.textAlign='center';
      if(Math.floor(t*2)%2===0){ ctx.font='8px "Press Start 2P",monospace'; ctx.fillStyle='#F2C230'; ctx.fillText('TAP TO START',W/2,H-30); }
      ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#D6AE55'; ctx.fillText('HI '+best,W/2,H-14);
      if(!raf&&visible&&cv.offsetParent!==null) raf=requestAnimationFrame(function tl(tt){ if(state!=='title'||!visible||cv.offsetParent===null){ raf=0; return; } draw(tt/1000); raf=requestAnimationFrame(tl); });
    }
    // ---- HUD ----
    var hs=document.getElementById('wkscore'), hb=document.getElementById('wkbest'), hn=document.getElementById('wkbonus'), hl=document.getElementById('wklives');
    function hud(){ hs.textContent=score; hb.textContent=best; hn.textContent=bonus; hl.textContent='🍺'.repeat(Math.max(0,lives)); }
    // ---- input ----
    function active(){ return cv.offsetParent!==null; }
    function tap(){
      if(state==='title'||state==='over'){ visible=true; newGame(); if(raf){ cancelAnimationFrame(raf); raf=0; } go(); return; }
      if(state==='paused'){ setState(pausedFrom||'play'); go(); return; }
      if(state==='play') jumpQ=true;
    }
    cv.addEventListener('touchstart',function(e){ if(e.cancelable) e.preventDefault(); tap(); },{passive:false});
    cv.addEventListener('mousedown',function(){ tap(); });
    var KM={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};
    document.addEventListener('keydown',function(e){ if(!active()) return; var r=cv.getBoundingClientRect(); if(r.bottom<0||r.top>window.innerHeight) return;
      if(KM[e.key]){ e.preventDefault(); keys[KM[e.key]]=1; }
      else if(e.key===' '||e.key==='x'||e.key==='Enter'){ e.preventDefault(); tap(); } });
    document.addEventListener('keyup',function(e){ if(KM[e.key]) keys[KM[e.key]]=0; });
    document.querySelectorAll('.pmpad button').forEach(function(b){
      var d=b.dataset.d;
      function down(e){ if(!active()) return; if(e.cancelable) e.preventDefault(); if(d==='jump'){ tap(); return; } if(state==='title'||state==='over'||state==='paused'){ tap(); } keys[d]=1; }
      function up(){ if(d!=='jump') keys[d]=0; }
      b.addEventListener('touchstart',down,{passive:false}); b.addEventListener('mousedown',down);
      ['touchend','touchcancel','mouseup','mouseleave'].forEach(function(ev){ b.addEventListener(ev,up); });
    });
    function pause(){ keys.left=keys.right=keys.up=keys.down=0; if(state==='play'||state==='ready'){ pausedFrom=state; setState('paused'); draw(performance.now()/1000); } }
    document.addEventListener('visibilitychange',function(){ if(document.hidden) pause(); });
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(en){ visible=en.isIntersecting; if(!visible) pause(); else if(!raf){ if(state==='play'||state==='ready'||state==='dying'||state==='clear') go(); else draw(performance.now()/1000); } }); },{threshold:0.2}).observe(cv); }
    window.addEventListener('resize',function(){ if(active()) fit(); });
    window.WK={show:function(){ fit(); }, hide:pause, dbg:function(){ return {state:state,p:{x:p.x,y:p.y,gi:p.gi,st:p.st},b:barrels.map(function(b){return [Math.round(b.x),Math.round(b.y),b.gi,b.st];})}; }};
    resetRound(); hud();
    (document.fonts&&document.fonts.load?document.fonts.load('8px "Press Start 2P"').catch(function(){}):Promise.resolve()).then(function(){ if(active()) fit(); });
  })();

  // ---------- Craic Arcade: Irish Invasion ----------
  (function(){
    var cv=document.getElementById('ii'); if(!cv||!cv.getContext) return;
    var ctx=cv.getContext('2d'), W=240, H=280;
    var faces={};
    var NAMES=['Seymon','Louise','Jeff','Helen','Steve','Vicky'];
    function syncFaces(){
      NAMES.forEach(function(n){
        var el=document.getElementById('f-'+n), im=faces[n];
        if(!el||!im)return;
        var u=window.CRAIC_CREW_IMAGES&&window.CRAIC_CREW_IMAGES['f-'+n];
        if(!u&&el) u=el.getAttribute('href')||el.getAttributeNS('http://www.w3.org/1999/xlink','href');
        if(u&&im.src!==u) im.src=u;
      });
    }
    NAMES.forEach(function(n){ faces[n]=new Image(); });
    syncFaces();
    window.addEventListener('craic-faces-ready',syncFaces);
    function heroName(){ try{ var h=localStorage.getItem('craicpack-pm-hero'); if(h&&faces[h]) return h; }catch(e){} return 'Seymon'; }
    var BEST='craicpack-ii-best', best=0; try{ best=parseInt(localStorage.getItem(BEST)||'0',10)||0; }catch(e){}
    var TYPES=[{k:'lep',pts:40},{k:'tour',pts:30},{k:'sheep',pts:20},{k:'pint',pts:10},{k:'cloud',pts:10}];
    var COLS=8, ROWS=5, CW=22, RH=18, PY=258;
    var state='title', stateT=0, score=0, lives=3, wave=1, hero='Seymon';
    var inv, dir, stepT, frame2, shots, bombs, px, tx, fireT, bus, busT, bunkers, pops=[], keys={left:0,right:0};
    function setState(s){ state=s; stateT=0; }
    function addScore(n){ score+=n; if(score>best){ best=score; try{localStorage.setItem(BEST,String(best));}catch(e){} } hud(); }
    function makeBunkers(){
      bunkers=[]; var shape=["1.1.1.1.1","111111111","111111111","111111111","111...111","11.....11"];
      [40,120,200].forEach(function(cx){ var cells=[]; shape.forEach(function(row,r){ row.split('').forEach(function(c,i){ if(c==='1') cells.push({x:cx-18+i*4,y:222+r*4,a:1}); }); }); bunkers.push(cells); });
    }
    function newWave(){
      inv=[]; var top=40+Math.min(wave-1,4)*8;
      for(var r=0;r<ROWS;r++) for(var c=0;c<COLS;c++) inv.push({r:r,c:c,x:18+c*CW,y:top+r*RH,t:TYPES[r],alive:1});
      dir=1; stepT=0; frame2=0; shots=[]; bombs=[]; bus=null; busT=12+Math.random()*8;
    }
    function newGame(){ score=0; lives=3; wave=1; hero=heroName(); px=tx=W/2; fireT=0; makeBunkers(); newWave(); setState('ready'); hud(); }
    function alive(){ return inv.filter(function(a){ return a.alive; }); }
    function hitBunker(x,y,w,h){
      for(var b=0;b<bunkers.length;b++){ var cells=bunkers[b]; for(var i=0;i<cells.length;i++){ var c=cells[i]; if(c.a&&x<c.x+4&&x+w>c.x&&y<c.y+4&&y+h>c.y){ c.a=0; cells.forEach(function(o){ if(o.a&&Math.abs(o.x-c.x)<=4&&Math.abs(o.y-c.y)<=4&&Math.random()<0.35) o.a=0; }); return true; } } }
      return false;
    }
    function step(dt){
      // player
      var mv=(keys.right?1:0)-(keys.left?1:0);
      if(mv) tx=Math.max(12,Math.min(W-12,px+mv*40));
      var d=tx-px, sp=150*dt; px+=Math.abs(d)<sp?d:Math.sign(d)*sp; px=Math.max(12,Math.min(W-12,px));
      fireT-=dt; if(fireT<=0&&shots.length<2){ shots.push({x:px,y:PY-14}); fireT=0.42; }
      // invaders march
      var live=alive(); if(!live.length){ addScore(500*Math.min(wave,5)); setState('clear'); return; }
      var interval=Math.max(0.06,0.62*live.length/(ROWS*COLS))/(1+0.12*(wave-1));
      stepT+=dt;
      if(stepT>=interval){ stepT=0; frame2^=1;
        var minX=1e9,maxX=-1e9; live.forEach(function(a){ minX=Math.min(minX,a.x); maxX=Math.max(maxX,a.x); });
        if((dir>0&&maxX+8+4>W-4)||(dir<0&&minX-8-4<4)){ dir=-dir; live.forEach(function(a){ a.y+=7; }); }
        else live.forEach(function(a){ a.x+=dir*4; });
        live.forEach(function(a){ if(a.y+8>=PY-10) { lives=0; hud(); setState('dying'); } bunkers.forEach(function(cells){ cells.forEach(function(c){ if(c.a&&Math.abs(c.x+2-a.x)<10&&Math.abs(c.y+2-a.y)<8) c.a=0; }); }); });
      }
      // enemy fire from bottom of a random column
      if(Math.random()<dt*(0.55+0.2*wave)){
        var cols={}; live.forEach(function(a){ if(!cols[a.c]||a.y>cols[a.c].y) cols[a.c]=a; });
        var ks=Object.keys(cols); if(ks.length&&bombs.length<2+wave){ var s=cols[ks[Math.floor(Math.random()*ks.length)]]; if(Math.abs(s.x-px)<60||Math.random()<0.5) bombs.push({x:s.x,y:s.y+8,wob:Math.random()*6}); }
      }
      // mystery bus
      busT-=dt; if(busT<=0&&!bus){ var l2r=Math.random()<0.5; bus={x:l2r?-24:W+24,v:l2r?45:-45}; busT=18+Math.random()*10; }
      if(bus){ bus.x+=bus.v*dt; if(bus.x<-30||bus.x>W+30) bus=null; }
      // shots
      shots.forEach(function(s){ s.y-=230*dt;
        if(hitBunker(s.x-1,s.y,2,6)){ s.dead=1; return; }
        for(var i=0;i<live.length;i++){ var a=live[i]; if(a.alive&&Math.abs(s.x-a.x)<8&&Math.abs(s.y-a.y)<7){ a.alive=0; s.dead=1; addScore(a.t.pts); pops.push({t:'',x:a.x,y:a.y,life:0.3,boom:1}); return; } }
        if(bus&&Math.abs(s.x-bus.x)<14&&Math.abs(s.y-24)<7){ var v=[50,100,150,300][Math.floor(Math.random()*4)]; addScore(v); pops.push({t:String(v),x:bus.x,y:24,life:1.2}); bus=null; s.dead=1; return; }
        if(s.y<10) s.dead=1; });
      shots=shots.filter(function(s){ return !s.dead; });
      bombs.forEach(function(b){ b.y+=(70+8*wave)*dt; b.wob+=dt*10;
        if(hitBunker(b.x-2,b.y,4,6)){ b.dead=1; return; }
        if(Math.abs(b.x-px)<8&&b.y>PY-12&&b.y<PY+6){ b.dead=1; lives--; hud(); setState('dying'); }
        if(b.y>H) b.dead=1; });
      bombs=bombs.filter(function(b){ return !b.dead; });
    }
    // loop
    var raf=0, last=0, visible=true, pausedFrom=null;
    function loop(t){
      raf=0; var dt=Math.min(0.05,(t-(last||t))/1000); last=t; stateT+=dt;
      if(state==='play'){ step(dt); }
      else if(state==='ready'&&stateT>1.4) setState('play');
      else if(state==='dying'&&stateT>1.4){ if(lives<=0) setState('over'); else { bombs=[]; shots=[]; setState('ready'); } }
      else if(state==='clear'&&stateT>2.2){ wave++; newWave(); hud(); setState('ready'); }
      pops.forEach(function(q){ q.life-=dt; }); pops=pops.filter(function(q){ return q.life>0; });
      draw(t/1000);
      if(state!=='over'&&state!=='paused'&&visible&&cv.offsetParent!==null) raf=requestAnimationFrame(loop);
    }
    function go(){ if(!raf){ last=0; raf=requestAnimationFrame(loop); } }
    // drawing
    function fit(){ var w=cv.clientWidth||W, dpr=window.devicePixelRatio||1; cv.width=Math.round(w*dpr); cv.height=Math.round(w*H/W*dpr); draw(performance.now()/1000); }
    var stars=[]; for(var i=0;i<40;i++) stars.push([Math.random()*W,Math.random()*200,Math.random()]);
    function bg(t){
      var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#070B1A'); g.addColorStop(1,'#16223F'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      stars.forEach(function(s){ ctx.fillStyle='rgba(255,255,255,'+(0.3+0.5*Math.abs(Math.sin(t*1.5+s[2]*9)))+')'; ctx.fillRect(s[0],s[1],1,1); });
      ctx.fillStyle='#0E1628'; ctx.fillRect(0,PY+8,W,H-PY-8);
      ctx.fillStyle='#1E5C43'; ctx.fillRect(0,PY+8,W,2);
    }
    function sprite(k,x,y,f){
      ctx.save(); ctx.translate(x,y);
      if(k==='lep'){ ctx.fillStyle='#1E7A4A'; ctx.fillRect(-5,-8,10,5); ctx.fillRect(-7,-3.5,14,1.6); ctx.fillStyle='#D6AE55'; ctx.fillRect(-1.5,-6,3,2);
        ctx.fillStyle='#F0C39E'; ctx.fillRect(-4,-2,8,4); ctx.fillStyle='#D2691E'; ctx.fillRect(-5,1,10,4); ctx.fillStyle='#1E1812'; ctx.fillRect(-2.5,-1,1.2,1.2); ctx.fillRect(1.3,-1,1.2,1.2);
        ctx.fillStyle='#2E9A5E'; ctx.fillRect(f?-7:-6,5,2,3); ctx.fillRect(f?5:4,5,2,3); }
      else if(k==='tour'){ ctx.fillStyle='#F2D38A'; ctx.fillRect(-7,-7,14,2); ctx.fillRect(-4,-9,8,2.5); ctx.fillStyle='#F0C39E'; ctx.fillRect(-3.5,-5,7,5); ctx.fillStyle='#1E1812'; ctx.fillRect(-2,-3.5,1.2,1.2); ctx.fillRect(1,-3.5,1.2,1.2);
        ctx.fillStyle=f?'#E07A6A':'#F29A63'; ctx.fillRect(-5,0,10,6); ctx.fillStyle='#1E1812'; ctx.fillRect(-2.5,1.5,5,3.2); ctx.fillStyle='#8FB4FF'; ctx.fillRect(-0.8,2.3,1.6,1.6);
        ctx.fillStyle='#F0C39E'; ctx.fillRect(f?-7:-6.5,1,1.6,4); ctx.fillRect(f?5.4:4.9,1,1.6,4); }
      else if(k==='sheep'){ ctx.fillStyle='#F2EFE6'; [[-4,-2],[0,-3],[4,-2],[-3,1],[1,1],[4,1]].forEach(function(o){ ctx.beginPath(); ctx.arc(o[0],o[1],3.2,0,Math.PI*2); ctx.fill(); });
        ctx.fillStyle='#2A2A2A'; ctx.fillRect(f?-9:-8.5,-3,4,4); ctx.fillRect(-4,3,1.5,f?4:3); ctx.fillRect(3,3,1.5,f?3:4); ctx.fillStyle='#fff'; ctx.fillRect(f?-8:-7.5,-2,1,1); }
      else if(k==='pint'){ ctx.fillStyle='#F2E7CD'; ctx.fillRect(-4,-8,8,3); ctx.fillStyle='#2B150A'; ctx.beginPath(); ctx.moveTo(-4,-5); ctx.lineTo(4,-5); ctx.lineTo(3,7); ctx.lineTo(-3,7); ctx.closePath(); ctx.fill();
        ctx.strokeStyle='rgba(242,231,205,.5)'; ctx.lineWidth=.7; ctx.strokeRect(-4,-8,8,15); ctx.fillStyle='#D6AE55'; ctx.fillRect(-0.6,-1,1.2,3); ctx.fillStyle='#F2E7CD'; ctx.fillRect(f?-6:4.5,f?0:-2,1.5,1.5); }
      else if(k==='cloud'){ ctx.fillStyle='#8A94A6'; [[-4,0,4],[1,-2,5],[5,0,3.5]].forEach(function(o){ ctx.beginPath(); ctx.arc(o[0],o[1],o[2],0,Math.PI*2); ctx.fill(); }); ctx.fillRect(-7,0,14,3.5);
        ctx.fillStyle='#8FC8F0'; (f?[[-4,6],[1,8],[5,5]]:[[-2,7],[3,6],[6,8]]).forEach(function(o){ ctx.fillRect(o[0],o[1],1.2,2.5); }); }
      ctx.restore();
    }
    function drawBus(x,y){
      ctx.fillStyle='#1E5C43'; ctx.fillRect(x-14,y-7,28,13); ctx.fillStyle='#F2C230'; ctx.fillRect(x-14,y-1,28,1.5);
      ctx.fillStyle='#BFE3F5'; for(var i=0;i<5;i++){ ctx.fillRect(x-12+i*5.4,y-5,4,3); ctx.fillRect(x-12+i*5.4,y+1.5,4,2.5); }
      ctx.fillStyle='#1E1812'; ctx.beginPath(); ctx.arc(x-8,y+7,2.2,0,Math.PI*2); ctx.arc(x+8,y+7,2.2,0,Math.PI*2); ctx.fill();
      ctx.font='4px "Press Start 2P",monospace'; ctx.fillStyle='#F2C230'; ctx.textAlign='center'; ctx.fillText('STAG DO',x,y-9);
    }
    function drawPlayer(x){
      ctx.fillStyle='#1E5C43'; ctx.fillRect(x-11,PY-2,22,8); ctx.fillStyle='#D6AE55'; ctx.fillRect(x-11,PY-2,22,1.5);
      ctx.fillStyle='#14432F'; ctx.fillRect(x-1.5,PY-16,3,6);
      var im=faces[hero]; ctx.save(); ctx.beginPath(); ctx.arc(x,PY-6,6,0,Math.PI*2); ctx.clip();
      if(im&&im.complete&&im.naturalWidth){ var s=Math.min(im.naturalWidth,im.naturalHeight); ctx.drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,x-6,PY-12,12,12); } else { ctx.fillStyle='#E8B894'; ctx.fillRect(x-6,PY-12,12,12); }
      ctx.restore(); ctx.strokeStyle='#D6AE55'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x,PY-6,6,0,Math.PI*2); ctx.stroke();
    }
    function banner(a,b,col){ ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='10px "Press Start 2P",monospace'; ctx.fillStyle=col||'#F2C230'; ctx.fillText(a,W/2,H/2+10); if(b){ ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#F2E7CD'; ctx.fillText(b,W/2,H/2+26); } }
    function draw(t){
      var sc=cv.width/W; ctx.setTransform(sc,0,0,sc,0,0);
      if(state==='title'){ drawTitle(t); return; }
      bg(t);
      ctx.fillStyle='#3FA564'; bunkers.forEach(function(cells){ cells.forEach(function(c){ if(c.a) ctx.fillRect(c.x,c.y,4,4); }); });
      inv.forEach(function(a){ if(a.alive) sprite(a.t.k,a.x,a.y,frame2); });
      if(bus) drawBus(bus.x,24);
      ctx.fillStyle='#F2C230'; shots.forEach(function(s){ ctx.fillRect(s.x-1,s.y,2,6); ctx.fillStyle='#3FA564'; ctx.fillRect(s.x-2,s.y,4,2); ctx.fillStyle='#F2C230'; });
      bombs.forEach(function(b){ var ox=Math.sin(b.wob)*1.5; ctx.fillStyle='#8FC8F0'; ctx.beginPath(); ctx.moveTo(b.x+ox,b.y-3); ctx.lineTo(b.x+ox+2.2,b.y+2); ctx.arc(b.x+ox,b.y+2,2.2,0,Math.PI); ctx.closePath(); ctx.fill(); });
      if(state==='dying'){ if(Math.floor(stateT*10)%2) drawPlayer(px); } else drawPlayer(px);
      pops.forEach(function(q){ if(q.boom){ ctx.strokeStyle='#F2C230'; ctx.lineWidth=1; for(var k=0;k<6;k++){ var an=k*Math.PI/3, r1=3, r2=3+(0.3-q.life)*30; ctx.beginPath(); ctx.moveTo(q.x+Math.cos(an)*r1,q.y+Math.sin(an)*r1); ctx.lineTo(q.x+Math.cos(an)*r2,q.y+Math.sin(an)*r2); ctx.stroke(); } }
        else { ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#8FE3FF'; ctx.textAlign='center'; ctx.fillText(q.t,q.x,q.y-(1.2-q.life)*8); } });
      if(state==='ready') banner(wave>1?'WAVE '+wave:'READY!',wave>1?'THEY\u2019RE BACK':null);
      if(state==='clear') banner('CASTLE SAVED!','WAVE BONUS '+(500*Math.min(wave,5)));
      if(state==='over'){ ctx.fillStyle='rgba(5,8,18,.72)'; ctx.fillRect(0,0,W,H); banner('DUBLIN HAS FALLEN','SCORE '+score+'  TAP TO GO AGAIN','#E07A2E'); }
      if(state==='paused'){ ctx.fillStyle='rgba(5,8,18,.6)'; ctx.fillRect(0,0,W,H); banner('PAUSED','TAP TO CARRY ON'); }
    }
    function drawTitle(t){
      bg(t); ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='15px "Press Start 2P",monospace'; ctx.fillStyle='#3FA564'; ctx.fillText('IRISH',W/2,34); ctx.fillStyle='#F2C230'; ctx.fillText('INVASION',W/2,54);
      ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#D6AE55'; ctx.fillText('DEFEND DUBLIN CASTLE',W/2,74);
      var f=Math.floor(t*2)%2;
      drawBus(W/2-40,100); ctx.textAlign='left'; ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#F2E7CD'; ctx.fillText('= ? MYSTERY',W/2-18,100);
      [['lep',40],['tour',30],['sheep',20],['pint',10],['cloud',10]].forEach(function(r,i){ sprite(r[0],W/2-40,124+i*18,f); ctx.fillStyle='#F2E7CD'; ctx.textAlign='left'; ctx.fillText('= '+r[1]+' PTS',W/2-18,124+i*18); });
      ctx.textAlign='center'; ctx.fillStyle='#DCCFB0'; ctx.fillText('DRAG TO MOVE. IT FIRES ITSELF.',W/2,222);
      if(Math.floor(t*2)%2===0){ ctx.font='8px "Press Start 2P",monospace'; ctx.fillStyle='#F2C230'; ctx.fillText('TAP TO START',W/2,H-30); }
      ctx.font='6px "Press Start 2P",monospace'; ctx.fillStyle='#D6AE55'; ctx.fillText('HI '+best,W/2,H-14);
      if(!raf&&visible&&cv.offsetParent!==null) raf=requestAnimationFrame(function tl(tt){ if(state!=='title'||!visible||cv.offsetParent===null){ raf=0; return; } draw(tt/1000); raf=requestAnimationFrame(tl); });
    }
    // HUD
    var hs=document.getElementById('iiscore'), hb=document.getElementById('iibest'), hw=document.getElementById('iiwave'), hl=document.getElementById('iilives');
    function hud(){ hs.textContent=score; hb.textContent=best; hw.textContent=wave; hl.textContent='🍺'.repeat(Math.max(0,lives)); }
    // input
    function active(){ return cv.offsetParent!==null; }
    function start(){
      if(state==='title'||state==='over'){ visible=true; newGame(); if(raf){ cancelAnimationFrame(raf); raf=0; } go(); return true; }
      if(state==='paused'){ setState(pausedFrom||'play'); go(); return true; }
      return false;
    }
    function toX(clientX){ var r=cv.getBoundingClientRect(); return (clientX-r.left)/r.width*W; }
    cv.addEventListener('touchstart',function(e){ if(e.cancelable) e.preventDefault(); if(start()) return; tx=toX(e.touches[0].clientX); },{passive:false});
    cv.addEventListener('touchmove',function(e){ if(e.cancelable) e.preventDefault(); tx=toX(e.touches[0].clientX); },{passive:false});
    var mdown=false;
    cv.addEventListener('mousedown',function(e){ if(start()) return; mdown=true; tx=toX(e.clientX); });
    cv.addEventListener('mousemove',function(e){ if(mdown) tx=toX(e.clientX); });
    window.addEventListener('mouseup',function(){ mdown=false; });
    var KM={ArrowLeft:'left',ArrowRight:'right',a:'left',d:'right'};
    document.addEventListener('keydown',function(e){ if(!active()) return; var r=cv.getBoundingClientRect(); if(r.bottom<0||r.top>window.innerHeight) return;
      if(KM[e.key]){ e.preventDefault(); keys[KM[e.key]]=1; } else if(e.key===' '||e.key==='Enter'){ e.preventDefault(); start(); } });
    document.addEventListener('keyup',function(e){ if(KM[e.key]){ keys[KM[e.key]]=0; if(!keys.left&&!keys.right) tx=px; } });
    document.querySelectorAll('.pmpad button').forEach(function(b){
      var d=b.dataset.d; if(d!=='left'&&d!=='right') { b.addEventListener('touchstart',function(e){ if(active()&&(state==='title'||state==='over'||state==='paused')){ if(e.cancelable) e.preventDefault(); start(); } },{passive:false}); return; }
      function down(e){ if(!active()) return; if(e.cancelable) e.preventDefault(); if(start()) return; keys[d]=1; }
      function up(){ if(!active()) return; keys[d]=0; if(!keys.left&&!keys.right) tx=px; }
      b.addEventListener('touchstart',down,{passive:false}); b.addEventListener('mousedown',down);
      ['touchend','touchcancel','mouseup','mouseleave'].forEach(function(ev){ b.addEventListener(ev,up); });
    });
    function pause(){ keys.left=keys.right=0; if(state==='play'||state==='ready'){ pausedFrom=state; setState('paused'); draw(performance.now()/1000); } }
    document.addEventListener('visibilitychange',function(){ if(document.hidden) pause(); });
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(en){ visible=en.isIntersecting; if(!visible) pause(); else if(!raf){ if(state==='play'||state==='ready'||state==='dying'||state==='clear') go(); else draw(performance.now()/1000); } }); },{threshold:0.2}).observe(cv); }
    window.addEventListener('resize',function(){ if(active()) fit(); });
    window.II={show:function(){ fit(); }, hide:pause, dbg:function(){ return {state:state,alive:inv?alive().length:0,score:score,lives:lives,wave:wave,visible:visible,raf:raf,stateT:stateT}; }};
    px=tx=W/2; makeBunkers(); newWave(); hud();
  })();
  // ---------- Arcade game selector ----------
  (function(){
    var cab=document.querySelector('.cab'); if(!cab) return;
    var tabs=cab.querySelectorAll('.arctabs button');
    var INFO={
      pm:["Pint-Man. Drink every pint in the pub while dodging the Bouncer, the Garda, the Taxi Driver and the Hangover. Grab a full pint and the tables turn.","Swipe on the screen, or use the pad, to steer"],
      wk:["Whiskey Kong. Big Seamus is rolling whiskey barrels down the pub. Climb to the top, where your mate's waiting with a pint. Jump barrels for points, and grab a spice bag to smash them.","◀ ▶ walk · ▲ ▼ climb · tap the screen or JUMP to jump"],
      ii:["Irish Invasion. Leprechauns, tourists, sheep, pints and rain clouds are marching on Dublin Castle. Hold them off from behind the castle walls, and shoot the Stag Do bus for a mystery bonus.","Drag on the screen, or use ◀ ▶, to move. It fires by itself"]};
    tabs.forEach(function(b){ b.addEventListener('click',function(){
      var g=b.dataset.g, previous=cab.dataset.g;
      if(previous!==g){ if(previous==='pm'&&window.PM) window.PM.hide(); if(previous==='wk'&&window.WK) window.WK.hide(); if(previous==='ii'&&window.II) window.II.hide(); }
      cab.dataset.g=g;
      tabs.forEach(function(x){ x.setAttribute('aria-pressed',x===b?'true':'false'); });
      cab.querySelectorAll('.scrn').forEach(function(s){ s.hidden=s.dataset.g!==g; });
      document.getElementById('arclede').textContent=INFO[g][0];
      document.getElementById('arcctl').textContent=INFO[g][1];
      window.dispatchEvent(new Event('resize'));
      if(g==='wk'&&window.WK) window.WK.show();
      if(g==='ii'&&window.II) window.II.show();
    }); });
  })();

  // ---------- Header bobbleheads: tap for a boing ----------
  document.querySelectorAll('.bob').forEach(function(b){ b.addEventListener('click',function(){ b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); setTimeout(function(){ b.classList.remove('boing'); },1150); }); });
  // Photo lightbox
  var lb=document.getElementById('lb');
  document.querySelectorAll('.zoom, .pic-group').forEach(function(b){
    b.addEventListener('click',function(){
      var im=(b.classList.contains('zoom')?b.parentNode:b).querySelector('img.shown, img:not(.ba-img)');
      document.getElementById('lbimg').src=im.src;
      document.getElementById('lbimg').alt=im.alt;
      document.getElementById('lbcap').textContent=im.alt;
      if(lb.showModal) lb.showModal();
    });
  });
  document.getElementById('lbx').addEventListener('click',function(){lb.close();});
  lb.addEventListener('click',function(e){ if(e.target===lb) lb.close(); });
  document.getElementById('spicy').addEventListener('click',function(){
    CraicImageLoader.extras(function(){
      var im=document.getElementById('spicyimg');
      document.getElementById('lbimg').src=im.src;
      document.getElementById('lbimg').alt=im.alt;
      document.getElementById('lbcap').textContent="Soakage secured. Louise has found the spice bag. ☘";
      if(lb.showModal) lb.showModal();
    });
  });
  document.getElementById('lucky').addEventListener('click',function(){
    CraicImageLoader.extras(function(){
      var im=document.getElementById('luckyimg');
      document.getElementById('lbimg').src=im.src;
      document.getElementById('lbimg').alt=im.alt;
      document.getElementById('lbcap').textContent="You found it. Welcome to the Four Leaf Clover Club ☘";
      if(lb.showModal) lb.showModal();
    });
  });
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Flip cards
  document.querySelectorAll('.flip').forEach(function(f){
    f.addEventListener('click',function(){
      var on=f.getAttribute('aria-pressed')!=='true';
      f.setAttribute('aria-pressed',on?'true':'false');
      f.parentNode.classList.toggle('flipped',on);
    });
  });

  // ---- Map routes
  var map=document.getElementById('dmap');
  if(map){
    var NS='http://www.w3.org/2000/svg';
    var pts=[].slice.call(map.querySelectorAll('circle')).map(function(c){return [+c.getAttribute('cx'),+c.getAttribute('cy')];});
    var routes={fri:[0,1,9,0,2,0], sat:[0,3,13,0,4,12,0]};
    var layer=document.createElementNS(NS,'g'); map.insertBefore(layer,map.querySelector('circle'));
    var mover=document.createElementNS(NS,'g'); map.appendChild(mover);
    var raf=null;
    function play(key){
      if(raf) cancelAnimationFrame(raf);
      layer.innerHTML=''; mover.innerHTML='';
      var seq=routes[key].map(function(i){return pts[i];});
      var d='M'+seq.map(function(p){return p[0]+','+p[1];}).join(' L');
      var path=document.createElementNS(NS,'path');
      path.setAttribute('d',d); path.setAttribute('fill','none');
      path.setAttribute('stroke',key==='fri'?'#C9772E':'#2E9A5E'); path.setAttribute('stroke-width','5');
      path.setAttribute('stroke-linecap','round'); path.setAttribute('stroke-linejoin','round'); path.setAttribute('opacity','.85');
      layer.appendChild(path);
      var L=path.getTotalLength(); path.style.strokeDasharray=L; path.style.strokeDashoffset=L;
      var NAMES=['Seymon','Louise','Jeff','Helen','Steve','Vicky'];
      var PUBS={fri:{9:1,2:1},sat:{3:1,4:1,12:1,13:1}}[key];
      var heads=NAMES.map(function(n){
        var g=document.createElementNS(NS,'g');
        g.innerHTML='<g class="wobble"><g transform="scale(13)" clip-path="url(#fclip)"><use href="#f-'+n+'"/></g><circle r="13" fill="none" stroke="#D6AE55" stroke-width="2"/><g class="mpint" opacity="0" transform="translate(9,4)"><path d="M-3.5 -5 H3.5 L2.6 6 H-2.6 Z" fill="#241710" stroke="#F2E7CD" stroke-width=".8"/><rect x="-3.4" y="-5" width="6.8" height="2.2" fill="#F2E7CD"/></g></g>';
        mover.appendChild(g); return g;
      });
      mover.insertBefore(heads[0],null);
      // segment lengths along the drawn path
      var segs=[],acc=0,tmp=document.createElementNS(NS,'path');
      for(var q=1;q<seq.length;q++){tmp.setAttribute('d','M'+seq[0][0]+','+seq[0][1]+' L'+seq.slice(1,q+1).map(function(p){return p[0]+','+p[1];}).join(' L'));layer.appendChild(tmp);segs.push(tmp.getTotalLength());layer.removeChild(tmp);}
      var GAP=30, SPEED=.16, PAUSE=750;
      var plan=[],tt=0,prev=0;
      segs.forEach(function(end,k){var w=(end-prev)/SPEED;plan.push({t0:tt,t1:tt+w,s0:prev,s1:end,stop:routes[key][k+1]});tt+=w+PAUSE;prev=end;});
      var total=tt+(heads.length-1)*GAP/SPEED;
      function placeAll(sLead,t,drunk){
        heads.forEach(function(g,i){
          var sv=Math.max(0,Math.min(L,sLead-i*GAP)), at=path.getPointAtLength(sv);
          var amp=1.5+drunk*1.8, sway=Math.sin(t/260+i*1.3)*(3+drunk*6);
          g.setAttribute('transform','translate('+at.x.toFixed(1)+','+(at.y-18+Math.sin(t/110+i)*amp).toFixed(1)+') rotate('+sway.toFixed(1)+')');
          g.querySelector('.mpint').setAttribute('opacity',drunk>0?'1':'0');
        });
      }
      if(reduce){ path.style.strokeDashoffset=0; placeAll(L+99,0,0); return; }
      var t0=null;
      function step(t){
        if(!t0) t0=t; var el=t-t0, sLead=0, drunk=0;
        for(var k=0;k<plan.length;k++){var p=plan[k];
          if(el>=p.t1){sLead=p.s1; if(PUBS[p.stop])drunk++;}
          else if(el>=p.t0){sLead=p.s0+(p.s1-p.s0)*(el-p.t0)/(p.t1-p.t0);break;}
          else break;}
        if(el>=tt-PAUSE) sLead=L+(el-(tt-PAUSE))*SPEED;
        path.style.strokeDashoffset=Math.max(0,L-sLead);
        placeAll(sLead,t,drunk);
        if(el<total+400) raf=requestAnimationFrame(step);
        else raf=null;
      }
      raf=requestAnimationFrame(step);
    }
    document.querySelectorAll('.routebtns button').forEach(function(b){
      b.addEventListener('click',function(){
        document.querySelectorAll('.routebtns button').forEach(function(x){x.classList.remove('on');});
        b.classList.add('on'); play(b.dataset.r);
      });
    });
  }
  document.querySelectorAll('.stage').forEach(function(st){
    st.addEventListener('click',function(){
      st.classList.toggle('paused');
      var c=st.querySelector('.stagecap');
      c.textContent = st.classList.contains('paused') ? 'Paused. Tap to play.' : c.getAttribute('data-cap');
    });
  });
})();

(function(){
  var loaded={};
  var imageSets={};
  var imageNamespaces={
    'images/gallery-images.js':'CRAIC_GALLERY_IMAGES',
    'images/crew-images.js':'CRAIC_CREW_IMAGES',
    'images/extra-images.js':'CRAIC_EXTRA_IMAGES'
  };
  function load(src,done){
    if(loaded[src]){done&&done(imageSets[src]);return;}
    var s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.onload=function(){
      loaded[src]=1;
      var ns=imageNamespaces[src];
      imageSets[src]=ns&&window[ns]?window[ns]:{};
      done&&done(imageSets[src]);
    };
    s.onerror=function(){done&&done({});};
    document.head.appendChild(s);
  }
  function apply(keys,set){
    set=set||{};
    var imgs=document.querySelectorAll('[data-craic-image],[data-craic-face]');
    imgs.forEach(function(el){
      var k=el.getAttribute('data-craic-image');
      if(!k){k='f-'+el.getAttribute('data-craic-face');}
      if(keys.indexOf(k)<0||!set[k])return;
      var u=set[k];
      if(el.tagName.toLowerCase()==='image'){
        el.setAttribute('href',u);
        el.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',u);
      }else el.src=u;
      el.removeAttribute('data-craic-image');
      el.removeAttribute('data-craic-face');
    });
  }
  function gallery(){load('images/gallery-images.js',function(set){apply(['before','after'],set);});}
  function crew(){load('images/crew-images.js',function(set){
    window.CRAIC_CREW_IMAGES=set;
    apply(['f-Seymon','f-Louise','f-Jeff','f-Helen','f-Steve','f-Vicky','seymon-card','louise-card','jeff-card','helen-card','steve-card','vicky-card'],set);
    window.dispatchEvent(new Event('craic-faces-ready'));
  });}
  function extras(done){load('images/extra-images.js',function(set){apply(['spice','lucky'],set);if(done)done();});}
  window.CraicImageLoader={gallery:gallery,crew:crew,extras:extras,apply:apply};
  document.addEventListener('DOMContentLoaded',function(){gallery();crew();});
})(); 
