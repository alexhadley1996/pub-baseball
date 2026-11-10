/* Top nav: dropdown groups are <details>, so tap and keyboard work without this file.
   This adds: one group open at a time, close on outside click / Escape, hover-open on mouse devices (desktop),
   the mobile Menu button, and switching a page tab when a nav link only changes the #hash (e.g. Team stats). */
(function(){
  var nav=document.querySelector('nav.nav'); if(!nav) return;
  var groups=[].slice.call(nav.querySelectorAll('details.ng')), tog=nav.querySelector('.navtog');
  var wide=window.matchMedia('(min-width:900px)'), hover=window.matchMedia('(hover:hover) and (pointer:fine)');
  function closeAll(except){groups.forEach(function(d){if(d!==except) d.open=false})}
  groups.forEach(function(d){
    var s=d.querySelector('summary'), t=null, byHover=false;
    d.addEventListener('toggle',function(){if(d.open&&wide.matches) closeAll(d)});
    d.addEventListener('mouseenter',function(){if(!(hover.matches&&wide.matches)) return; clearTimeout(t); if(!d.open){byHover=true;d.open=true}});
    d.addEventListener('mouseleave',function(){if(!(hover.matches&&wide.matches)) return; t=setTimeout(function(){d.open=false;byHover=false},180)});
    // a click right after hover-opening should keep the menu open rather than close it
    s.addEventListener('click',function(e){if(byHover&&d.open){e.preventDefault();byHover=false}});
  });
  document.addEventListener('click',function(e){if(!nav.contains(e.target)){if(wide.matches) closeAll(); else if(tog&&nav.classList.contains('open')){nav.classList.remove('open');tog.setAttribute('aria-expanded','false')}}});
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape') return;
    var d=groups.filter(function(g){return g.open})[0];
    if(d){d.open=false;d.querySelector('summary').focus()}
    else if(tog&&nav.classList.contains('open')){nav.classList.remove('open');tog.setAttribute('aria-expanded','false');tog.focus()}
  });
  if(tog) tog.addEventListener('click',function(){
    var o=!nav.classList.contains('open'); nav.classList.toggle('open',o); tog.setAttribute('aria-expanded',o?'true':'false');
    if(o){var cur=nav.querySelector('details.ng.on'); if(cur) cur.open=true}
  });
  wide.addEventListener&&wide.addEventListener('change',function(){closeAll();nav.classList.remove('open');if(tog) tog.setAttribute('aria-expanded','false')});
  window.addEventListener('hashchange',function(){
    var b=document.querySelector('.ptabs button[data-t="'+location.hash.slice(1).replace(/"/g,'')+'"]'); if(b) b.click(); closeAll();
  });
})();
