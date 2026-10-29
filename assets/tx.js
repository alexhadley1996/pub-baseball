/* Transactions feed filters, synced to the URL hash (#lg=MLB&team=slug&type=Trade&q=name). */
(function(){
function $(id){return document.getElementById(id)}
function go(){
  var lg=$('f-lg'),team=$('f-team'),type=$('f-type'),q=$('f-q'),cnt=$('f-count');if(!lg)return;
  var rows=[].slice.call(document.querySelectorAll('.txi')),days=[].slice.call(document.querySelectorAll('.txday'));
  function readHash(){var h={};location.hash.replace(/^#/,'').split('&').forEach(function(p){var kv=p.split('=');if(kv[0])h[kv[0]]=decodeURIComponent((kv[1]||'').replace(/\+/g,' '))});
    lg.value=h.lg||'';team.value=h.team||'';type.value=h.type||'';q.value=h.q||'';
    if(team.value&&!lg.value){var o=team.selectedOptions[0];if(o)lg.value=o.getAttribute('data-lg')}}
  function writeHash(){var p=[];[['lg',lg],['team',team],['type',type],['q',q]].forEach(function(x){if(x[1].value)p.push(x[0]+'='+encodeURIComponent(x[1].value))});
    history.replaceState(null,'',p.length?'#'+p.join('&'):location.pathname+location.search)}
  function teamOpts(){[].forEach.call(team.querySelectorAll('optgroup'),function(x){x.hidden=!!lg.value&&x.label!==lg.value});
    var cur=team.selectedOptions[0];if(cur&&cur.parentNode.hidden)team.value=''}
  function apply(){teamOpts();var n=0,qq=q.value.trim().toLowerCase();
    rows.forEach(function(r){var ok=(!lg.value||r.dataset.lg===lg.value)&&(!team.value||r.dataset.team===team.value)&&(!type.value||r.dataset.type===type.value)&&(!qq||r.dataset.q.indexOf(qq)>-1);
      r.hidden=!ok;if(ok)n++});
    days.forEach(function(d){d.hidden=!d.querySelector('.txi:not([hidden])')});
    [].forEach.call(document.querySelectorAll('.txc'),function(b){b.classList.toggle('on',b.dataset.type===type.value)});
    cnt.textContent=n+' of '+rows.length+' moves'}
  [lg,team,type].forEach(function(e){e.addEventListener('change',function(){if(e===team&&team.value){var o=team.selectedOptions[0];lg.value=o.getAttribute('data-lg')}apply();writeHash()})});
  q.addEventListener('input',function(){apply();writeHash()});
  [].forEach.call(document.querySelectorAll('.txc'),function(b){b.addEventListener('click',function(){type.value=type.value===b.dataset.type?'':b.dataset.type;apply();writeHash()})});
  $('f-clear').addEventListener('click',function(){lg.value=team.value=type.value=q.value='';apply();writeHash()});
  window.addEventListener('hashchange',function(){readHash();apply()});
  readHash();apply()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
