/* Row filters for tables: a .filt[data-for=tableId] holds controls named pos / tier / act / q / min.
   Rows carry data-pos, data-tier, data-act ("1" active), data-m (PA/IP/innings) and class nq (not qualified). */
(function(){
function apply(box){
  var t=document.getElementById(box.getAttribute('data-for'));if(!t)return;
  var v=function(n){var e=box.querySelector('[name='+n+']');if(!e)return null;
    if(e.type==='checkbox')return e.checked;return e.value};
  var on=box.querySelector('button.on[data-pos]'),pos=on?on.getAttribute('data-pos'):'';
  var tier=v('tier')||'',act=v('act'),q=v('q'),mn=parseFloat(v('min'))||0,shown=0;
  [].forEach.call(t.tBodies[0].rows,function(r){
    var ok=(!pos||r.getAttribute('data-pos')===pos)&&(!tier||(' '+(r.getAttribute('data-tier')||'')+' ').indexOf(' '+tier+' ')>=0)
      &&(act!==true||r.getAttribute('data-act')==='1')&&(q!==true||!r.classList.contains('nq'))
      &&(!mn||parseFloat(r.getAttribute('data-m')||'0')>=mn);
    r.hidden=!ok;if(ok)shown++});
  var c=box.querySelector('.cnt');if(c)c.textContent=shown+' shown'}
function init(){
  [].forEach.call(document.querySelectorAll('.filt[data-for]'),function(box){
    [].forEach.call(box.querySelectorAll('button[data-pos]'),function(b){b.addEventListener('click',function(){
      [].forEach.call(box.querySelectorAll('button[data-pos]'),function(x){x.classList.toggle('on',x===b)});apply(box)})});
    [].forEach.call(box.querySelectorAll('input,select'),function(e){e.addEventListener('input',function(){apply(box)});e.addEventListener('change',function(){apply(box)})});
    apply(box)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
(function(){function init(){[].forEach.call(document.querySelectorAll('.tpf'),function(g){var sec=g.closest('.tperf');
  [].forEach.call(g.querySelectorAll('button'),function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-tier');
    [].forEach.call(g.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});
    [].forEach.call(sec.querySelectorAll('.tpc'),function(c){c.hidden=!!t&&c.getAttribute('data-tier')!==t})})})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();})();
