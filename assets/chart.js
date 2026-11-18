/* Race charts: metric toggle, hover tooltip, legend highlight. Data comes from figure[data-json]. */
(function(){
function placeTip(tip,svg,cx,cy){
  var r=svg.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
  var x=cx-r.left+12,y=cy-r.top+12;
  if(x+w>r.width-6)x=Math.max(0,cx-r.left-w-12);
  if(y+h>r.height-6)y=Math.max(0,cy-r.top-h-12);
  tip.style.left=Math.max(0,Math.min(x,r.width-w))+'px';
  tip.style.top=Math.max(0,y)+'px';
}
function init(fig){
  var D=JSON.parse(fig.getAttribute('data-json')),svg=fig.querySelector('svg'),tip=fig.querySelector('.tip'),hov=svg.querySelector('.hov');
  var metric='over',sel={},pinned=false;
  [].forEach.call(fig.querySelectorAll('.mtog button'),function(b){b.addEventListener('click',function(){
    metric=b.getAttribute('data-m');
    [].forEach.call(fig.querySelectorAll('.mtog button'),function(x){x.classList.toggle('on',x===b)});
    [].forEach.call(svg.querySelectorAll('.m'),function(g){g.style.display=g.classList.contains('m-'+metric)?'':'none'});
    hide()})});
  function paint(){var any=Object.keys(sel).some(function(k){return sel[k]});fig.classList.toggle('focus',any);
    [].forEach.call(fig.querySelectorAll('[data-i]'),function(el){el.classList.toggle('on',!!sel[el.getAttribute('data-i')])})}
  [].forEach.call(fig.querySelectorAll('.legendb button'),function(b){b.addEventListener('click',function(){
    var i=b.getAttribute('data-i');sel[i]=!sel[i];paint()})});
  [].forEach.call(svg.querySelectorAll('.ln,.lab'),function(l){l.addEventListener('click',function(){var i=l.getAttribute('data-i');sel[i]=!sel[i];paint()})});
  function hide(){if(pinned)return;tip.hidden=true;hov.style.display='none'}
  function unpin(){pinned=false;tip.hidden=true;hov.style.display='none'}
  function at(p){
    var r=svg.getBoundingClientRect(),x=(p.clientX-r.left)*D.W/r.width,best=0,bd=1e9;
    D.x.forEach(function(v,i){var d=Math.abs(v-x);if(d<bd){bd=d;best=i}});
    if(x<D.x[0]-20||x>D.x[D.x.length-1]+20){if(!pinned){tip.hidden=true;hov.style.display='none'}return false}
    hov.setAttribute('x1',D.x[best]);hov.setAttribute('x2',D.x[best]);hov.style.display='';
    var rows=D.t.map(function(t,k){return {k:k,a:t.a,c:t.c,w:t.w[best],l:t.l[best],g:t.g?t.g[best]:null}});
    rows.sort(function(a,b){return (b.w-b.l)-(a.w-a.l)||b.w-a.w});
    var h='<b>'+D.d[best]+'</b><table>';
    rows.forEach(function(o){var ov=o.w-o.l;h+='<tr><td><i style="background:'+o.c+'"></i>'+o.a+'</td><td>'+o.w+'-'+o.l+'</td><td>'+(ov>0?'+':'')+ov+'</td>'+
      (o.g===null?'':'<td>'+(o.g===0?'-':(o.g%1?(Math.floor(o.g)||'')+'\u00bd':o.g)+' GB')+'</td>')+'</tr>'});
    tip.innerHTML=h+'</table>';tip.hidden=false;placeTip(tip,svg,p.clientX,p.clientY);return true}
  function ev(e){return(e.touches&&e.touches[0])||e}
  svg.addEventListener('mousemove',function(e){if(!pinned)at(ev(e))});
  svg.addEventListener('mouseleave',hide);
  svg.addEventListener('click',function(e){pinned=true;at(ev(e));e.stopPropagation()});
  svg.addEventListener('touchstart',function(e){pinned=true;at(ev(e))},{passive:true});
  svg.addEventListener('touchmove',function(e){at(ev(e))},{passive:true});
  document.addEventListener('click',function(e){if(!fig.contains(e.target))unpin()});
}
function go(){[].forEach.call(document.querySelectorAll('figure.race'),init)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
