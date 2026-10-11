// Pour ajouter une LED : ajoutez simplement un nom dans cette liste.
var LEDS=['LED1','LED2'];

// Envoi de la commande à votre appareil (à adapter : fetch, MQTT, WebSocket…)
function sendCommand(name,on){
  // exemple : fetch('http://ADRESSE_ESP/'+name.toLowerCase()+'/'+(on?'on':'off'));
}

var card=document.getElementById('card');
LEDS.forEach(function(name){
  var el=document.createElement('div');
  el.className='led';
  el.innerHTML='<div class="bulb"></div><div class="name"></div>'+
    '<div class="btns"><button class="b-on">ON</button><button class="b-off">OFF</button></div>';
  var label=el.querySelector('.name');
  function set(on,send){
    el.classList.toggle('on',on);
    label.textContent=name+(on?' ON':' OFF');
    if(send)sendCommand(name,on);
  }
  el.querySelector('.b-on').onclick=function(){set(true,true)};
  el.querySelector('.b-off').onclick=function(){set(false,true)};
  set(name==='LED1',false);
  card.appendChild(el);
});

/* ===== Température & humidité ===== */
// Remplacez readSensors() par votre vraie lecture (fetch, MQTT…) : {t:°C, h:%}
function readSensors(prev){
  return {t:Math.min(Math.max(prev.t+(Math.random()-.5)*.3,15),32),
          h:Math.min(Math.max(prev.h+(Math.random()-.5)*1.2,30),70)};
}
var M=72, TT=[], HH=[], tx=23, hx=50;
for(var i=0;i<M;i++){tx+=(Math.random()-.5)*.25;hx+=(Math.random()-.5)*.8-(i>60?.35:0);TT.push(tx);HH.push(hx)}
function fmt(v){return v.toFixed(1).replace('.',',')}
function plot(id,a,min,max,ticks,color){
  var el=document.getElementById(id),W=300,H=130;
  var pts=a.map(function(v,i){return(i?'L':'M')+(i/(a.length-1)*W).toFixed(1)+' '+(H-(v-min)/(max-min)*H).toFixed(1)}).join('');
  var grid=ticks.map(function(t){var y=H-(t-min)/(max-min)*H;return'<line class="gl" x1="0" x2="'+W+'" y1="'+y+'" y2="'+y+'"/>'}).join('');
  var yl=ticks.slice().reverse().map(function(t){return'<span>'+t+'</span>'}).join('');
  var now=new Date(),xs='';
  for(var k=5;k>=0;k--){var d=new Date(now-k*3600000);xs+='<span>'+('0'+d.getHours()).slice(-2)+':00</span>'}
  el.innerHTML='<div class="yl">'+yl+'</div>'+
    '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+grid+
    '<path d="'+pts+'L'+W+' '+H+'L0 '+H+'Z" fill="'+color+'" opacity=".12"/>'+
    '<path d="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.6" stroke-linejoin="round"/></svg>'+
    '<div class="xl">'+xs+'</div>';
}
function renderSensors(){
  var t=TT[M-1],h=HH[M-1];
  document.getElementById('gh').setAttribute('stroke-dasharray',(Math.min(Math.max(h/100,0),1)*75)+' 100');
  document.getElementById('gt').setAttribute('stroke-dasharray',(Math.min(Math.max(t/40,0),1)*75)+' 100');
  document.getElementById('th').textContent=fmt(h)+' %H';
  document.getElementById('tt').textContent=fmt(t)+' °C';
  plot('ph',HH,0,100,[0,20,40,60,80,100],'#38bdf8');
  plot('pt',TT,0,40,[0,10,20,30,40],'#f59e0b');
}
document.querySelectorAll('.seg button').forEach(function(b){
  b.onclick=function(){
    var box=document.getElementById('sens');
    box.classList.remove('m-t','m-h');
    if(b.dataset.m!=='b')box.classList.add('m-'+b.dataset.m);
    document.querySelectorAll('.seg button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
  };
});
renderSensors();
setInterval(function(){
  var r=readSensors({t:TT[M-1],h:HH[M-1]});
  TT.push(r.t);HH.push(r.h);TT.shift();HH.shift();renderSensors();
},8000);