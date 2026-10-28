/* Race charts: metric toggle, hover tooltip, legend highlight. Data comes from figure[data-json]. */
(function(){
function init(fig){
  var D=JSON.parse(fig.getAttribute('data-json')),svg=fig.querySelector('svg'),tip=fig.querySelector('.tip'),hov=svg.querySelector('.hov');
  var metric='over',sel={};
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
  function hide(){tip.hidden=true;hov.style.display='none'}
  function at(clientX){
    var r=svg.getBoundingClientRect(),x=(clientX-r.left)*D.W/r.width,best=0,bd=1e9;
    D.x.forEach(function(v,i){var d=Math.abs(v-x);if(d<bd){bd=d;best=i}});
    if(x<D.x[0]-20||x>D.x[D.x.length-1]+20){hide();return}
    hov.setAttribute('x1',D.x[best]);hov.setAttribute('x2',D.x[best]);hov.style.display='';
    var rows=D.t.map(function(t,k){return {k:k,a:t.a,c:t.c,w:t.w[best],l:t.l[best],g:t.g?t.g[best]:null}});
    rows.sort(function(a,b){return (b.w-b.l)-(a.w-a.l)||b.w-a.w});
    var h='<b>'+D.d[best]+'</b><table>';
    rows.forEach(function(o){var ov=o.w-o.l;h+='<tr><td><i style="background:'+o.c+'"></i>'+o.a+'</td><td>'+o.w+'-'+o.l+'</td><td>'+(ov>0?'+':'')+ov+'</td>'+
      (o.g===null?'':'<td>'+(o.g===0?'-':(o.g%1?(Math.floor(o.g)||'')+'\u00bd':o.g)+' GB')+'</td>')+'</tr>'});
    tip.innerHTML=h+'</table>';tip.hidden=false;
    var px=(D.x[best]/D.W)*r.width,w=tip.offsetWidth;
    tip.style.left=Math.max(0,Math.min(px+12,r.width-w))+'px';
    if(px+12+w>r.width)tip.style.left=Math.max(0,px-w-12)+'px'}
  svg.addEventListener('mousemove',function(e){at(e.clientX)});
  svg.addEventListener('mouseleave',hide);
  svg.addEventListener('touchstart',function(e){at(e.touches[0].clientX)},{passive:true});
  svg.addEventListener('touchmove',function(e){at(e.touches[0].clientX)},{passive:true});
}
function go(){[].forEach.call(document.querySelectorAll('figure.race'),init)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
