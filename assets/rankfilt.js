/* Scope and team filters for power-rankings and farm-systems pages.
   Client-side only; tables stay sortable. Selection can be shared in the URL hash. */
(function(){
function boot(box){
  var data=JSON.parse(box.querySelector('.rkf-data').textContent);
  var byId={};data.teams.forEach(function(t){byId[String(t.id)]=t});
  var scope=box.querySelector('.rkfscope'),divs=box.querySelector('.rkfdivs');
  var q=box.querySelector('.rkfq'),list=box.querySelector('.rkflist'),chips=box.querySelector('.rkfchips');
  var clr=box.querySelector('.rkfclr');
  var tabsw=document.querySelector('.tabsw');
  var lg='',div='',picks=[];

  function parseHash(){
    var h=(location.hash||'').replace(/^#/,'');
    if(!h)return;
    var parts=h.split('&'),o={lg:parts[0],d:'',t:[]};
    if(o.lg==='all')o.lg='';
    var known=data.leagues.some(function(l){return l.id===o.lg})||!o.lg;
    if(!known)return;
    parts.slice(1).forEach(function(p){
      var i=p.indexOf('=');if(i<0)return;
      var k=p.slice(0,i),v=decodeURIComponent(p.slice(i+1));
      if(k==='d')o.d=v;if(k==='t')o.t=v.split(',').filter(Boolean)});
    lg=o.lg;div=o.d;picks=o.t.filter(function(id){return byId[id]});
  }
  function writeHash(){
    if(!history.replaceState)return;
    var h='#'+(lg||'all');
    if(lg&&div)h+='&d='+encodeURIComponent(div);
    if(picks.length)h+='&t='+picks.join(',');
    if(location.hash!==h)history.replaceState(null,'',h);
  }

  function showTabs(){
    if(!tabsw)return;
    tabsw.classList.toggle('rkall',!lg);
    if(!lg){
      [].forEach.call(tabsw.querySelectorAll('.ptabs button'),function(b){b.classList.remove('on');b.setAttribute('aria-selected','false')});
      [].forEach.call(tabsw.querySelectorAll(':scope > .tp'),function(p){p.classList.add('on')});
    }else{
      [].forEach.call(tabsw.querySelectorAll('.ptabs button'),function(b){
        var on=b.getAttribute('data-t')===lg;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
      [].forEach.call(tabsw.querySelectorAll(':scope > .tp'),function(p){p.classList.toggle('on',p.getAttribute('data-t')===lg)});
    }
  }

  function inScope(t){
    if(lg&&t.lg!==lg)return false;
    if(lg&&div&&t.div!==div)return false;
    return true;
  }
  function visibleIds(){
    if(picks.length){
      var set=picks.filter(function(id){var t=byId[id];return t&&inScope(t)});
      return set.length?set:picks.slice();
    }
    return data.teams.filter(inScope).map(function(t){return String(t.id)});
  }

  function paintScope(){
    [].forEach.call(scope.querySelectorAll('button'),function(b){
      b.classList.toggle('on',(b.getAttribute('data-lg')||'')===lg)});
    [].forEach.call(divs.querySelectorAll('button'),function(b){
      var show=!!lg&&b.getAttribute('data-lg')===lg;
      b.hidden=!show;
      b.classList.toggle('on',show&&b.getAttribute('data-div')===div)});
  }

  function paintList(){
    var ql=(q.value||'').trim().toLowerCase();
    var html='';
    data.teams.forEach(function(t){
      if(!inScope(t))return;
      var hay=(t.name+' '+t.abbr).toLowerCase();
      if(ql&&hay.indexOf(ql)<0)return;
      var on=picks.indexOf(String(t.id))>=0;
      html+='<button type="button" class="rkft'+(on?' on':'')+'" data-tid="'+t.id+'" style="--lc:'+t.c+'"><i></i>'+t.name+'</button>';
    });
    list.innerHTML=html||'<span class="muted">No matching teams</span>';
    list.hidden=!ql&&!list.classList.contains('open')&&!box.classList.contains('picking');
  }

  function paintChips(){
    if(!picks.length){chips.hidden=true;chips.innerHTML='';return}
    chips.hidden=false;
    chips.innerHTML=picks.map(function(id){
      var t=byId[id];if(!t)return '';
      return '<button type="button" class="rkfchip" data-tid="'+id+'" style="--lc:'+t.c+'"><i></i>'+t.abbr+' <span aria-hidden="true">×</span></button>';
    }).join('');
  }

  function apply(){
    var vis=visibleIds(),vset={};
    vis.forEach(function(id){vset[id]=true});
    var picking=picks.length>0;
    [].forEach.call(document.querySelectorAll('tr[data-tid]'),function(r){
      var id=r.getAttribute('data-tid');
      var t=byId[id];
      var ok=t? (picking?!!vset[id]:inScope(t)) : true;
      r.hidden=!ok;
    });
    [].forEach.call(document.querySelectorAll('figure.tlc.rkc'),function(fig){
      var panel=fig.closest('.tp');
      var ids=vis;
      if(panel&&lg){
        /* already scoped by tab; still pass ids so the chart matches the table */
      }
      if(window.tlFilter){
        var keep=picking||div||lg?ids:null;
        /* When All + no picks + no div, keep null = every series already on that (league) chart. */
        if(!picking&&!div)keep=null;
        else keep=ids;
        window.tlFilter(fig,keep);
        fig._onTeamClick=legendToggle;
      }
    });
    paintScope();paintChips();paintList();writeHash();
  }

  function toggle(id){
    id=String(id);
    if(!byId[id])return;
    var i=picks.indexOf(id);
    if(i>=0)picks.splice(i,1);
    else{
      if(!picks.length){
        /* first pick from a full scope: start with everyone visible, then drop this id (legend toggle-off) */
        /* But a click on a chip in the picker should add. Distinguish via flag? */
      }
      picks.push(id);
    }
    apply();
  }

  /* Legend: toggle that team out of / into the current visible set. */
  function legendToggle(id){
    id=String(id);
    if(!byId[id])return;
    if(!picks.length){
      picks=visibleIds().filter(function(x){return x!==id});
    }else{
      var i=picks.indexOf(id);
      if(i>=0)picks.splice(i,1);else picks.push(id);
    }
    apply();
  }

  function setScope(nlg,ndiv,clearPicks){
    lg=nlg||'';div=lg? (ndiv||'') : '';
    if(clearPicks)picks=picks.filter(function(id){var t=byId[id];return t&&inScope(t)});
    showTabs();apply();
  }

  scope.addEventListener('click',function(e){
    var b=e.target.closest('button[data-lg]');if(!b||!scope.contains(b))return;
    setScope(b.getAttribute('data-lg')||'', '', true);
  });
  divs.addEventListener('click',function(e){
    var b=e.target.closest('button[data-div]');if(!b)return;
    var d=b.getAttribute('data-div');
    setScope(b.getAttribute('data-lg')||lg, d===div?'':d, true);
  });
  clr.addEventListener('click',function(){picks=[];q.value='';list.hidden=true;box.classList.remove('picking');apply()});
  q.addEventListener('focus',function(){box.classList.add('picking');list.hidden=false;paintList()});
  q.addEventListener('input',function(){box.classList.add('picking');list.hidden=false;paintList()});
  list.addEventListener('click',function(e){
    var b=e.target.closest('button[data-tid]');if(!b)return;
    var id=b.getAttribute('data-tid'),i=picks.indexOf(id);
    if(i>=0)picks.splice(i,1);else picks.push(id);
    apply();
  });
  chips.addEventListener('click',function(e){
    var b=e.target.closest('button[data-tid]');if(!b)return;
    var id=b.getAttribute('data-tid'),i=picks.indexOf(id);
    if(i>=0)picks.splice(i,1);
    apply();
  });
  document.addEventListener('click',function(e){
    if(!box.contains(e.target)){box.classList.remove('picking');if(!(q.value||'').trim())list.hidden=true}
  });
  document.addEventListener('ptab',function(e){
    var k=e.detail&&e.detail.tab;if(k)setScope(k,'',true);
  });

  /* Expose legend hook used by tl.js */
  box._legendToggle=legendToggle;
  window.rkfToggle=legendToggle;

  parseHash();
  showTabs();
  apply();
  window.addEventListener('hashchange',function(){parseHash();showTabs();apply()});
}

function go(){
  var box=document.querySelector('[data-rkf]');
  if(box)boot(box);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
