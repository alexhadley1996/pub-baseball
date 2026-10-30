/* Player comparison: pick 2-4 players from the search index; each player's season lines are fetched
   lazily from assets/cmp/<id/100>.json (one shard per 100 ids). URL keeps #p=id,id&m=b|p for sharing (?p= also read). */
(function(){
var D=(window.SEARCH||[]).filter(function(d){return d[3]==='p'||d[3]==='h'});
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
var N=D.map(function(d){return norm(d[0])}),A=D.map(function(d){return norm(d[5]||'')});
function pidOf(u){var m=/players\/(\d+)\.html/.exec(u);return m?+m[1]:0}
var q=document.getElementById('cq'),res=document.getElementById('cres'),chips=document.getElementById('cchips'),out=document.getElementById('cout'),all=document.getElementById('call');
var SH={},P={},sel=[],mode=null,season={};
function shard(pid){var k=Math.floor(pid/100);if(!SH[k])SH[k]=fetch('assets/cmp/'+k+'.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json()});return SH[k]}
function load(pid){return shard(pid).then(function(s){P[pid]=s[String(pid)]||null;return P[pid]})}
function search(){var v=norm(q.value.trim());res.innerHTML='';if(v.length<2)return;var o=[];
  for(var i=0;i<D.length;i++){var k=N[i].indexOf(v);if(k<0&&A[i])k=A[i].indexOf(v);if(k>-1)o.push([k===0||N[i].indexOf(' '+v)>-1?0:1,-(D[i][4]||0),i])}
  o.sort(function(a,b){return a[0]-b[0]||a[1]-b[1]});o.slice(0,12).forEach(function(x){var d=D[x[2]],li=document.createElement('li'),b=document.createElement('button');
    b.type='button';b.className='pick';b.textContent=d[0];var s=document.createElement('small');s.textContent=(d[3]==='h'?'Historical · ':'')+d[2];
    b.addEventListener('click',function(){add(pidOf(d[1]))});li.appendChild(b);li.appendChild(s);res.appendChild(li)});
  if(!o.length)res.innerHTML='<li class="muted">No matches.</li>'}
function add(pid){if(!pid||sel.indexOf(pid)>-1)return;if(sel.length>=4){alert('Up to four players at a time.');return}
  sel.push(pid);q.value='';res.innerHTML='';sync()}
function drop(pid){sel=sel.filter(function(x){return x!==pid});delete season[pid];sync()}
function url(){if(!history.replaceState)return;var s='#p='+sel.join(',')+(mode?'&m='+mode:'');history.replaceState(null,'',sel.length?location.pathname+s:location.pathname)}
function sync(){Promise.all(sel.map(load)).then(function(){if(!mode){var pit=0;sel.forEach(function(p){var d=P[p];if(d&&car(d,'p').outs2>3*car(d,'b').pa)pit++});mode=pit*2>sel.length?'p':'b';setMode(mode)}
  url();render()}).catch(function(e){out.innerHTML='<p class="muted">Could not load player data ('+e.message+').</p>'})}
var BC=['g','pa','ab','r','h','d','t','hr','rbi','bb','k','sb','cs','hp','sf','war'],PC=['g','gs','w','l','s','outs2','ha','r','er','bb','k','hra','cg','sho','war'];
function rows(d,m){return (d&&d[m])||[]}
function obj(r,m){var c=m==='b'?BC:PC,o={y:r[0],lg:r[1],lev:r[2],tm:r[3]};c.forEach(function(k,i){o[k]=r[4+i]});return o}
function car(d,m){var c=m==='b'?BC:PC,o={};c.forEach(function(k){o[k]=0});var rs=rows(d,m),top=rs.filter(function(r){return r[2]===1});
  var use=(all&&all.checked)||!top.length?rs:top,yrs={};o.minors=!top.length&&rs.length>0;
  use.forEach(function(r){c.forEach(function(k,i){o[k]+=r[4+i]});yrs[r[0]]=1});o.seasons=Object.keys(yrs).length;var ys=Object.keys(yrs).map(Number);o.y0=Math.min.apply(null,ys);o.y1=Math.max.apply(null,ys);return o}
function r3(x){if(x==null||!isFinite(x))return '-';var s=x.toFixed(3);return s.charAt(0)==='0'?s.slice(1):s}
function f2(x){return x==null||!isFinite(x)?'-':x.toFixed(2)}function f1(x){return x==null||!isFinite(x)?'-':x.toFixed(1)}
function ip(o){o=Math.round(o);return Math.floor(o/3)+'.'+(o%3)}
function int(x){return Math.round(x).toLocaleString('en-US')}
var BS=[['G','g'],['PA','pa'],['AB','ab'],['R','r'],['H','h'],['2B','d'],['3B','t'],['HR','hr'],['RBI','rbi'],['BB','bb'],['K','k',1],['SB','sb'],['CS','cs',1],
  ['AVG',function(o){return o.ab?o.h/o.ab:null},0,r3],['OBP',function(o){var d=o.ab+o.bb+o.hp+o.sf;return d?(o.h+o.bb+o.hp)/d:null},0,r3],
  ['SLG',function(o){return o.ab?(o.h+o.d+2*o.t+3*o.hr)/o.ab:null},0,r3],['OPS',function(o){var d=o.ab+o.bb+o.hp+o.sf;return o.ab&&d?(o.h+o.bb+o.hp)/d+(o.h+o.d+2*o.t+3*o.hr)/o.ab:null},0,r3],
  ['WAR','war',0,f1]];
var PS=[['G','g'],['GS','gs'],['W','w'],['L','l',1],['SV','s'],['IP','outs2',0,ip],['H','ha',1],['R','r',1],['ER','er',1],['BB','bb',1],['K','k'],['HR','hra',1],['CG','cg'],['SHO','sho'],
  ['ERA',function(o){return o.outs2?o.er*27/o.outs2:null},1,f2],['WHIP',function(o){return o.outs2?(o.bb+o.ha)*3/o.outs2:null},1,f2],
  ['K/9',function(o){return o.outs2?o.k*27/o.outs2:null},0,f1],['BB/9',function(o){return o.outs2?o.bb*27/o.outs2:null},1,f1],['WAR','war',0,f1]];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function tbl(objs,stats,extra){
  var h='<div class="tw"><table class="cmptab num"><thead><tr><th>Stat</th>'+sel.map(function(p){var d=P[p];return '<th>'+esc(d?last(d.n):'?')+'</th>'}).join('')+'</tr></thead><tbody>';
  (extra||[]).forEach(function(e){h+='<tr class="ctx"><td>'+e[0]+'</td>'+objs.map(function(o,i){return '<td>'+(o?e[1](o,i):'-')+'</td>'}).join('')+'</tr>'});
  stats.forEach(function(s){var f=typeof s[1]==='function'?s[1]:function(o){return o[s[1]]},fmt=s[3]||int;
    var v=objs.map(function(o){return o?f(o):null}),ok=v.filter(function(x){return x!=null&&isFinite(x)});
    var best=ok.length>1?(s[2]?Math.min.apply(null,ok):Math.max.apply(null,ok)):null,allsame=ok.length>1&&ok.every(function(x){return x===ok[0]});
    h+='<tr><td>'+s[0]+'</td>'+v.map(function(x){var b=best!=null&&!allsame&&x===best;return '<td'+(b?' class="best"':'')+'>'+(x==null||!isFinite(x)?'-':fmt(x))+'</td>'}).join('')+'</tr>'});
  return h+'</tbody></table></div>'}
function last(n){var p=n.split(' ');return p.length>1?p.slice(1).join(' '):n}
function render(){
  chips.innerHTML=sel.map(function(p){var d=P[p];if(!d)return '';var img=d.f?'assets/faces/'+p+'-s.webp':'assets/faces/none-s.svg';
    return '<span class="cchip"><img src="'+img+'" alt="" width="24" height="24"><a href="players/'+p+'.html">'+esc(d.n)+'</a><small>'+esc(d.pos+(d.tm?' · '+d.tm:''))+'</small><button type="button" aria-label="Remove '+esc(d.n)+'" data-x="'+p+'">&times;</button></span>'}).join('');
  [].forEach.call(chips.querySelectorAll('[data-x]'),function(b){b.addEventListener('click',function(){drop(+b.getAttribute('data-x'))})});
  if(sel.length<2){out.innerHTML='<p class="muted">Add '+(sel.length?'one more player':'two or more players')+' to compare.</p>';return}
  var m=mode,stats=m==='b'?BS:PS,cs=sel.map(function(p){var d=P[p];return d&&rows(d,m).length?car(d,m):null});
  var h='<h2 class="sec">Career '+(m==='b'?'batting':'pitching')+'</h2>'+tbl(cs,stats,[['Seasons',function(o){return o.seasons+' ('+o.y0+'&ndash;'+String(o.y1).slice(2)+')'+(o.minors?' <small>minors</small>':'')}]]);
  h+='<h2 class="sec">Single season</h2><div class="csel">'+sel.map(function(p){var d=P[p],rs=rows(d,m);if(!rs.length)return '<label>'+esc(d?d.n:'?')+': <em>no '+(m==='b'?'batting':'pitching')+' lines</em></label>';
    var k=season[p];if(k==null||k>=rs.length){k=rs.length-1;var top=rs.map(function(r,i){return [r,i]}).filter(function(x){return x[0][2]===1});if(top.length)k=top[top.length-1][1];season[p]=k}
    return '<label>'+esc(last(d.n))+' <select data-p="'+p+'">'+rs.map(function(r,i){return '<option value="'+i+'"'+(i===k?' selected':'')+'>'+r[0]+' · '+esc(r[1])+(r[3]?' · '+esc(r[3]):'')+'</option>'}).join('')+'</select></label>'}).join('')+'</div>';
  var ss=sel.map(function(p){var rs=rows(P[p],m);return rs.length?obj(rs[season[p]],m):null});
  h+=tbl(ss,stats,[['Season',function(o){return o.y+' '+esc(o.lg)}],['Team',function(o){return esc(o.tm||'-')}]]);
  out.innerHTML=h;
  [].forEach.call(out.querySelectorAll('select[data-p]'),function(s){s.addEventListener('change',function(){season[+s.getAttribute('data-p')]=+s.value;render()})})}
var mb=[].slice.call(document.querySelectorAll('.cmpopt button'));
function setMode(m){mode=m;mb.forEach(function(b){var on=b.getAttribute('data-m')===m;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}
mb.forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-m'));season={};url();render()})});
if(all)all.addEventListener('change',render);
q.addEventListener('input',search);
q.addEventListener('keydown',function(e){if(e.key==='Enter'){var b=res.querySelector('button.pick');if(b){e.preventDefault();b.click()}}});
var sp=new URLSearchParams(location.hash.length>1?location.hash.slice(1):location.search),ps=(sp.get('p')||'').split(',').map(Number).filter(function(x){return x>0}).slice(0,4),m0=sp.get('m');
if(m0==='b'||m0==='p')setMode(m0);
if(ps.length){sel=ps;sync()}
window.addEventListener('hashchange',function(){var h=new URLSearchParams(location.hash.slice(1)),n=(h.get('p')||'').split(',').map(Number).filter(function(x){return x>0}).slice(0,4);
  if(n.join()!==sel.join()){sel=n;season={};if(h.get('m'))setMode(h.get('m'));sync()}});
})();
