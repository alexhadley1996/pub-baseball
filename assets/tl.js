/* Timeline line charts (award races, power rankings, farm history, player OPS).
   Each <figure class="tlc" data-tl='{...}'> carries its data; this file draws the SVG, the hover
   tooltip and click-to-highlight. Data: d0 (ISO start date), t (day offsets), s (series: n name,
   a short label, c colour, v values, k dash, tt optional tooltip notes), r (optional reference series),
   f (format: ops|f3|f2|f1|rank|int), inv (true = lower is better, drawn top), H (height). */
(function(){
var NS='http://www.w3.org/2000/svg',MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function fmt(f,v){if(v===null||v===undefined)return'-';
  if(f==='ops'||f==='f3'){var s=v.toFixed(3);return v<1&&v>=0?s.slice(1):s}
  if(f==='rank')return'#'+v;if(f==='int')return String(Math.round(v));if(f==='f1')return v.toFixed(1);
  if(f==='sf2')return(v>0?'+':'')+v.toFixed(2);return v.toFixed(2)}
function step(span){var raw=span/6,p=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)),m=raw/p;return(m<1.5?1:m<3?2:m<7?5:10)*p}
function day(d0,t){var d=new Date(d0+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+t);return d}
function init(fig){
  var D=JSON.parse(fig.getAttribute('data-tl')),cw=fig.clientWidth||((document.documentElement.clientWidth||800)-24),W=Math.max(300,Math.min(760,cw)),H=D.H||300,lab=D.s.length>1&&D.lab!==false;
  var pl=44,pr=lab?96:16,pt=16,pb=26,t=D.t,n=t.length,t0=t[0],t1=t[n-1]===t0?t0+1:t[n-1];
  var X=function(x){return pl+(x-t0)*(W-pl-pr)/(t1-t0)};
  var all=[];D.s.concat(D.r?[D.r]:[]).forEach(function(s){s.v.forEach(function(v){if(v!==null)all.push(v)})});
  var lo,hi,st;
  if(D.f==='rank'){lo=1;hi=D.max||Math.max.apply(null,all);st=hi>12?2:1}
  else{lo=Math.min.apply(null,all);hi=Math.max.apply(null,all);if(D.zero){lo=Math.min(lo,0);hi=Math.max(hi,0)}
    if(D.cap!==undefined&&hi>D.cap)hi=D.cap;if(hi-lo<1e-9){hi+=.05;lo-=.05}st=step(hi-lo);lo=Math.floor(lo/st)*st;hi=Math.ceil(hi/st)*st}
  var inv=D.f==='rank'||D.inv;
  var Y=function(v){var r=(Math.min(Math.max(v,lo),hi)-lo)/(hi-lo);return inv?pt+r*(H-pt-pb):H-pb-r*(H-pt-pb)};
  var wrap=fig.querySelector('.svgw'),svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':fig.getAttribute('aria-label')||'Timeline chart',preserveAspectRatio:'xMidYMid meet'});
  wrap.insertBefore(svg,wrap.firstChild);
  for(var v=lo;v<=hi+1e-9;v+=st){if(D.f==='rank'&&v>1&&v<hi&&(v%st))continue;
    el('line',{'class':'grid'+(D.zero&&Math.abs(v)<1e-9?' zero':''),x1:pl,x2:W-pr,y1:Y(v),y2:Y(v)},svg);
    el('text',{'class':'yl',x:pl-5,y:Y(v)+4},svg).textContent=fmt(D.f,v)}
  if(D.y){el('text',{'class':'axt',x:pl,y:pt-4},svg).textContent=D.y}
  var pm=-1,lastx=-99;for(var i=t0;i<=t1;i++){var d=day(D.d0,i);if(d.getUTCMonth()!==pm&&(d.getUTCDate()===1||i===t0)){pm=d.getUTCMonth();
    if(X(i)-lastx>34){lastx=X(i);el('line',{'class':'grid',x1:X(i),x2:X(i),y1:pt,y2:H-pb},svg);el('text',{'class':'xl',x:X(i)+3,y:H-8},svg).textContent=MON[pm]}}}
  function pts(vs){var o=[],seg=[];vs.forEach(function(v,i){if(v===null){if(seg.length)o.push(seg);seg=[]}else seg.push(X(t[i]).toFixed(1)+','+Y(v).toFixed(1))});if(seg.length)o.push(seg);return o}
  if(D.r){pts(D.r.v).forEach(function(sg){el('polyline',{'class':'ref',points:sg.join(' ')},svg)});
    if(!lab){var lv=null;for(var j=n-1;j>=0;j--)if(D.r.v[j]!==null){lv=D.r.v[j];break}
      if(lv!==null)el('text',{'class':'refl',x:W-pr-2,y:Y(lv)-5},svg).textContent=D.r.n}}
  var ends=[];
  D.s.forEach(function(s,k){pts(s.v).forEach(function(sg){var a={'class':'ln','data-i':k,points:sg.join(' '),stroke:s.c};if(s.k)a['stroke-dasharray']=s.k;
      if(sg.length===1){el('circle',{'class':'dot','data-i':k,cx:sg[0].split(',')[0],cy:sg[0].split(',')[1],r:4,fill:s.c},svg)}else el('polyline',a,svg)});
    for(var j=n-1;j>=0;j--)if(s.v[j]!==null){ends.push([Y(s.v[j]),k]);break}});
  if(lab){ends.sort(function(a,b){return a[0]-b[0]});for(var j=1;j<ends.length;j++)if(ends[j][0]-ends[j-1][0]<13)ends[j][0]=ends[j-1][0]+13;
    var over=ends.length?ends[ends.length-1][0]-(H-pb+6):0;if(over>0)ends.forEach(function(e){e[0]-=over});
    ends.forEach(function(e){var s=D.s[e[1]],g=el('g',{'class':'lab','data-i':e[1]},svg);
      el('rect',{x:W-pr+6,y:e[0]-5,width:10,height:10,rx:2,fill:s.c},g);el('text',{x:W-pr+20,y:e[0]+4},g).textContent=s.a})}
  var hov=el('line',{'class':'hov',x1:0,x2:0,y1:pt,y2:H-pb,style:'display:none'},svg),tip=fig.querySelector('.tip'),sel={};
  if(D.s.length>1&&D.leg!==false){var lg=document.createElement('div');lg.className='legendb';
    D.s.forEach(function(s,k){var b=document.createElement('button');b.type='button';b.setAttribute('data-i',k);b.style.setProperty('--lc',s.c);
      b.innerHTML='<i'+(s.k?' class="dash"':'')+'></i>';b.appendChild(document.createTextNode(s.n||s.a));lg.appendChild(b)});fig.appendChild(lg)}
  function paint(){var any=Object.keys(sel).some(function(k){return sel[k]});fig.classList.toggle('focus',any);
    [].forEach.call(fig.querySelectorAll('[data-i]'),function(e){e.classList.toggle('on',!!sel[e.getAttribute('data-i')])})}
  [].forEach.call(fig.querySelectorAll('[data-i]'),function(e){e.addEventListener('click',function(){var i=e.getAttribute('data-i');sel[i]=!sel[i];paint()})});
  function hide(){tip.hidden=true;hov.style.display='none'}
  function at(cx){var r=svg.getBoundingClientRect(),x=(cx-r.left)*W/r.width,best=0,bd=1e9;
    for(var i=0;i<n;i++){var dd=Math.abs(X(t[i])-x);if(dd<bd){bd=dd;best=i}}
    if(x<pl-20||x>W-pr+20){hide();return}
    hov.setAttribute('x1',X(t[best]));hov.setAttribute('x2',X(t[best]));hov.style.display='';
    var d=day(D.d0,t[best]),rows=[];
    D.s.forEach(function(s,k){if(s.v[best]!==null)rows.push({k:k,s:s,v:s.v[best],x:s.tt?s.tt[best]:''})});
    rows.sort(function(a,b){return inv?a.v-b.v:b.v-a.v});
    var any=Object.keys(sel).some(function(k){return sel[k]});
    var h='<b>'+(D.dl?D.dl[best]:MON[d.getUTCMonth()]+' '+d.getUTCDate())+'</b><table>';
    rows.forEach(function(o){if(any&&!sel[o.k]&&rows.length>8)return;h+='<tr><td><i style="background:'+o.s.c+'"></i>'+(o.s.a)+'</td><td>'+fmt(D.f,o.v)+'</td>'+(o.x?'<td>'+o.x+'</td>':'')+'</tr>'});
    if(D.r&&D.r.v[best]!==null)h+='<tr class="refr"><td><i class="rf"></i>'+D.r.n+'</td><td>'+fmt(D.f,D.r.v[best])+'</td></tr>';
    tip.innerHTML=h+'</table>';tip.hidden=false;
    var px=(X(t[best])/W)*r.width,w=tip.offsetWidth;tip.style.left=Math.max(0,Math.min(px+12,r.width-w))+'px';
    if(px+12+w>r.width)tip.style.left=Math.max(0,px-w-12)+'px'}
  svg.addEventListener('mousemove',function(e){at(e.clientX)});svg.addEventListener('mouseleave',hide);
  svg.addEventListener('touchstart',function(e){at(e.touches[0].clientX)},{passive:true});
  svg.addEventListener('touchmove',function(e){at(e.touches[0].clientX)},{passive:true});
}
/* Spray chart: figure.spray[data-sp] = {b:[[loc,res,home,la,ev,throws,month],...], p:{zone:[angle,feet,dAng,dFt]}, park?}.
   Results: 4 GO, 5 FO, 6 1B, 7 2B, 8 3B, 9 HR. throws: 1=R, 2=L. Filters and coloring are client-side. */
var RC={4:['#9aa0a6','Ground out'],5:['#5f6b7a','Fly/line out'],6:['#2a9d55','Single'],7:['#2f6fdb','Double'],8:['#9b51e0','Triple'],9:['#d6332a','Home run']};
function fenceR(pk,ang){
  if(!pk||!pk.d)return null;
  var d=pk.d,t=(ang+45)/15;
  if(t<=0)return d[0];if(t>=6)return d[6];
  var i=Math.floor(t),f=t-i,a0=-45+15*i,a1=a0+15,r0=d[i],r1=d[i+1];
  var r0x=Math.sin(a0*Math.PI/180)*r0,r0y=Math.cos(a0*Math.PI/180)*r0;
  var r1x=Math.sin(a1*Math.PI/180)*r1,r1y=Math.cos(a1*Math.PI/180)*r1;
  var ux=Math.sin(ang*Math.PI/180),uy=Math.cos(ang*Math.PI/180),dx=r1x-r0x,dy=r1y-r0y;
  var den=ux*dy-uy*dx;if(Math.abs(den)<1e-9)return r0+(r1-r0)*f;
  var u=(r0x*dy-r0y*dx)/den;return u>0?u:r0+(r1-r0)*f;
}
function wallShade(h){var t=Math.max(0,Math.min(1,((h||8)-4)/34));
  function L(a,b){return Math.round(a+(b-a)*t)}
  return'rgb('+L(110,36)+','+L(96,40)+','+L(80,32)+')'}
function mixCh(a,b,t){return Math.round(a+(b-a)*t)}
function mixRgb(a,b,t){return'rgb('+mixCh(a[0],b[0],t)+','+mixCh(a[1],b[1],t)+','+mixCh(a[2],b[2],t)+')'}
function evCol(mph){
  if(mph==null)return'#9aa0a6';
  var t=Math.max(0,Math.min(1,(mph-70)/40));
  return t<.5?mixRgb([29,100,196],[197,192,204],t/.5):mixRgb([197,192,204],[216,33,41],(t-.5)/.5);
}
function laCol(la){
  if(la==null)return'#9aa0a6';
  var t=Math.max(0,Math.min(1,(la+10)/60));
  if(t<.33)return mixRgb([139,90,43],[42,157,85],t/.33);
  if(t<.66)return mixRgb([42,157,85],[47,111,219],(t-.33)/.33);
  return mixRgb([47,111,219],[155,81,224],(t-.66)/.34);
}
function typOf(la){return la==null?'u':la<10?'g':la<25?'l':la<50?'f':'p'}
function spray(fig){
  var D=JSON.parse(fig.getAttribute('data-sp')),W=360,H=350,cx=W/2,cy=H-18,MAXFT=530,sc=(cy-14)/MAXFT;
  var P=function(a,ft){var r=a*Math.PI/180;return[cx+Math.sin(r)*ft*sc,cy-Math.cos(r)*ft*sc]};
  var wrap=fig.querySelector('.svgw'),svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':fig.getAttribute('aria-label')||'Spray chart'});
  wrap.insertBefore(svg,wrap.firstChild);
  var field=el('g',{'class':'spf'},svg),dots=el('g',{'class':'spd'},svg);
  var usePk=null;
  function drawField(on){
    usePk=on&&D.park&&D.park.d?D.park:null;
    while(field.firstChild)field.removeChild(field.firstChild);
    var posts,a,b;
    if(usePk){
      posts=usePk.d.map(function(ft,k){return P(-45+15*k,ft)});
      a=posts[0];b=posts[6];
      el('path',{'class':'fld',d:'M'+cx+','+cy+' L'+posts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' L')+' Z'},field);
    }else{
      a=P(-45,330);b=P(45,330);
      el('path',{'class':'fld',d:'M'+cx+','+cy+' L'+a+' Q'+P(-22,385)+' '+P(0,405)+' Q'+P(22,385)+' '+b+' Z'},field);
    }
    var i1=P(-45,95),i2=P(0,150),i3=P(45,95);el('path',{'class':'dirt',d:'M'+cx+','+cy+' L'+i1+' Q'+P(-25,165)+' '+i2+' Q'+P(25,165)+' '+i3+' Z'},field);
    var bs=[P(45,90),P(0,127),P(-45,90)];el('path',{'class':'bases',d:'M'+cx+','+cy+' L'+bs.join(' L')+' Z'},field);
    el('line',{'class':'foul',x1:cx,y1:cy,x2:a[0],y2:a[1]},field);el('line',{'class':'foul',x1:cx,y1:cy,x2:b[0],y2:b[1]},field);
    if(usePk){
      for(var k=0;k<6;k++){
        var hw=((usePk.w&&usePk.w[k]||8)+(usePk.w&&usePk.w[k+1]||8))/2;
        el('line',{'class':'pwall',x1:posts[k][0].toFixed(1),y1:posts[k][1].toFixed(1),x2:posts[k+1][0].toFixed(1),y2:posts[k+1][1].toFixed(1),
                   stroke:wallShade(hw),'stroke-width':(1.8+hw/6).toFixed(1)},field);
      }
      [[0,'LF'],[3,'CF'],[6,'RF']].forEach(function(q){
        var ft=usePk.d[q[0]],pt=P(-45+15*q[0],ft+18);
        el('text',{'class':'pd',x:pt[0].toFixed(1),y:pt[1].toFixed(1),'text-anchor':'middle'},field).textContent=q[1]+' '+ft;
      });
    }
  }
  var seed=1;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
  var items=[],byz={},months={},tip=fig.querySelector('.tip');
  (D.b||[]).forEach(function(b){
    var loc=b[0],res=b[1],p=D.p[String(loc)]||D.p[loc];if(!p)return;
    var ang=p[0]+(rnd()-.5)*p[2],ft=p[1]+(rnd()-.5)*p[3];
    var la=b[3],ev=b[4],it={el:el('circle',{'class':'bb','data-z':String(loc)},dots),loc:loc,res:res,h:b[2],la:la,ev:ev,th:b[5]||0,mo:b[6]||0,typ:typOf(la),ang:ang,ft:ft};
    items.push(it);(byz[loc]=byz[loc]||[]).push(it);if(it.mo)months[it.mo]=1;
  });
  function seg(name,key,opts){
    var d=document.createElement('div');d.className='sprfg';
    d.innerHTML='<span>'+name+'</span><div class="sprseg" data-f="'+key+'"></div>';
    var box=d.querySelector('.sprseg');
    opts.forEach(function(o,i){
      var b=document.createElement('button');b.type='button';b.setAttribute('data-v',o[0]);b.textContent=o[1];if(i===0)b.className='on';
      box.appendChild(b);
    });
    return d;
  }
  function boxes(name,key,opts){
    var d=document.createElement('div');d.className='sprfg';
    var h='<span>'+name+'</span>';
    opts.forEach(function(o){h+='<label><input type="checkbox" data-f="'+key+'" value="'+o[0]+'" checked> '+o[1]+'</label>'});
    d.innerHTML=h;return d;
  }
  function sel(name,key,opts){
    var d=document.createElement('div');d.className='sprfg';
    var h='<span>'+name+'</span><select data-f="'+key+'">';
    opts.forEach(function(o){h+='<option value="'+o[0]+'">'+o[1]+'</option>'});
    d.innerHTML=h+'</select>';return d;
  }
  var bar=document.createElement('div');bar.className='sprf';bar.setAttribute('role','group');bar.setAttribute('aria-label','Spray chart filters');
  bar.appendChild(seg('Location','loc',[['all','All'],['h','Home'],['r','Road']]));
  bar.appendChild(boxes('Result','res',[['6','Singles'],['7','Doubles'],['8','Triples'],['9','HR'],['o','Outs']]));
  bar.appendChild(boxes('Type','typ',[['g','Ground'],['l','Line'],['f','Fly'],['p','Pop']]));
  if(D.role!=='p')bar.appendChild(seg('Pitcher','hand',[['all','All'],['l','vs LHP'],['r','vs RHP']]));
  var monOpts=[['0','All']];
  Object.keys(months).sort(function(a,b){return a-b}).forEach(function(m){monOpts.push([m,MON[m-1]||m])});
  bar.appendChild(sel('Month','mon',monOpts));
  bar.appendChild(sel('Color by','col',[['res','Result'],['ev','Exit velocity heat'],['la','Launch angle']]));
  if(D.park&&D.park.d)bar.appendChild(seg('Park outline','pk',[['h','Home park'],['g','Generic']]));
  var parkLab=fig.querySelector('.sprpark');
  if(parkLab&&parkLab.nextSibling)fig.insertBefore(bar,parkLab.nextSibling);else fig.insertBefore(bar,wrap);
  var lg=document.createElement('div');lg.className='sprl';fig.insertBefore(lg,fig.querySelector('figcaption'));
  function val(key){
    var s=bar.querySelector('.sprseg[data-f="'+key+'"] button.on');if(s)return s.getAttribute('data-v');
    var e=bar.querySelector('select[data-f="'+key+'"]');return e?e.value:'all';
  }
  function checks(key){
    var on={},n=0,any=0;
    [].forEach.call(bar.querySelectorAll('input[data-f="'+key+'"]'),function(c){any++;if(c.checked){on[c.value]=1;n++}});
    return n===any?null:on;
  }
  function colorOf(it,mode){
    if(mode==='ev')return evCol(it.ev);
    if(mode==='la')return laCol(it.la);
    return(RC[it.res]||RC[4])[0];
  }
  function shown(it){
    var loc=val('loc');if(loc==='h'&&!it.h)return false;if(loc==='r'&&it.h)return false;
    var rs=checks('res');
    if(rs){var ok=(it.res===4||it.res===5)?rs.o:rs[String(it.res)];if(!ok)return false}
    var ts=checks('typ');if(ts&&!ts[it.typ])return false;
    var hand=val('hand');if(hand==='l'&&it.th!==2)return false;if(hand==='r'&&it.th!==1)return false;
    var mon=val('mon');if(mon&&mon!=='all'&&mon!=='0'&&String(it.mo)!==String(mon))return false;
    return true;
  }
  function apply(){
    drawField(val('pk')!=='g');
    var mode=val('col'),tot={},nh=0,nr=0,n=0,evs=[],las=[];
    items.forEach(function(it){
      var ok=shown(it);
      it.el.style.display=ok?'':'none';
      if(!ok)return;
      n++;tot[it.res]=(tot[it.res]||0)+1;if(it.h)nh++;else nr++;
      if(it.ev!=null)evs.push(it.ev);if(it.la!=null)las.push(it.la);
      var ft=it.ft,fr=usePk?fenceR(usePk,it.ang):null;
      if(fr&&it.h&&Math.abs(it.ang)<=45.5){
        if(it.res===9&&ft<fr)ft=fr+10;
        else if(it.res!==9&&ft>fr-4)ft=Math.max(90,fr-8);
      }
      var q=P(it.ang,ft),col=colorOf(it,mode);
      it.el.setAttribute('cx',q[0].toFixed(1));it.el.setAttribute('cy',q[1].toFixed(1));
      it.el.setAttribute('r',it.res===9?3.4:2.7);
      if(it.h){it.el.setAttribute('fill',col);it.el.setAttribute('stroke','#fff');it.el.setAttribute('stroke-width','.5');it.el.setAttribute('class','bb hm')}
      else{it.el.setAttribute('fill','#fff');it.el.setAttribute('stroke',col);it.el.setAttribute('stroke-width','1.4');it.el.setAttribute('class','bb rd')}
    });
    var html='';
    if(mode==='res')[4,5,6,7,8,9].forEach(function(r){if(tot[r])html+='<span><i style="background:'+RC[r][0]+'"></i>'+RC[r][1]+' '+tot[r]+'</span>'});
    else if(mode==='ev'){
      html+='<span class="sprgrad"><i style="background:linear-gradient(90deg,'+evCol(70)+','+evCol(90)+','+evCol(110)+')"></i>70–110 mph</span>';
      if(evs.length){evs.sort(function(a,b){return a-b});html+='<span>'+evs[0]+'–'+evs[evs.length-1]+' mph on field</span>'}
    }else{
      html+='<span class="sprgrad"><i style="background:linear-gradient(90deg,'+laCol(-10)+','+laCol(15)+','+laCol(30)+','+laCol(50)+')"></i>−10° to 50°</span>';
      if(las.length){las.sort(function(a,b){return a-b});html+='<span>'+las[0]+'° to '+las[las.length-1]+'°</span>'}
    }
    html+='<span>Home '+nh+'</span><span>Road '+nr+'</span><span>n='+n+'</span>';
    lg.innerHTML=html;
  }
  bar.addEventListener('click',function(e){
    var b=e.target.closest('button[data-v]');if(!b||!b.parentNode.classList.contains('sprseg'))return;
    [].forEach.call(b.parentNode.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});
    apply();
  });
  bar.addEventListener('change',apply);
  apply();
  function tipFor(it){
    var bits=[(RC[it.res]||['','Ball'])[1],it.h?'home':'road'];
    if(it.ev!=null)bits.push(it.ev+' mph');if(it.la!=null)bits.push(it.la+'\u00b0');
    if(it.th===1)bits.push('vs RHP');else if(it.th===2)bits.push('vs LHP');
    if(it.mo)bits.push(MON[it.mo-1]||'');
    return'<b>'+(D.n[it.loc]||D.n[String(it.loc)]||'Zone')+'</b><br>'+bits.filter(Boolean).join(' · ');
  }
  svg.addEventListener('mousemove',function(e){
    var t=e.target,z=t.getAttribute&&t.getAttribute('data-z');if(!z){tip.hidden=true;return}
    var it=null;for(var i=0;i<items.length;i++)if(items[i].el===t){it=items[i];break}
    if(!it||it.el.style.display==='none'){tip.hidden=true;return}
    tip.innerHTML=tipFor(it);tip.hidden=false;
    var r=svg.getBoundingClientRect();
    tip.style.left=Math.max(0,Math.min(e.clientX-r.left+10,r.width-tip.offsetWidth))+'px';
    tip.style.top=(e.clientY-r.top+12)+'px';
  });
  svg.addEventListener('mouseleave',function(){tip.hidden=true});
}
function day0(d0,t){var d=new Date(d0+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+t);return MON[d.getUTCMonth()]+' '+d.getUTCDate()}
function evla(fig){
  var D=JSON.parse(fig.getAttribute('data-ev')),W=Math.max(300,Math.min(560,fig.clientWidth||((document.documentElement.clientWidth||600)-24))),H=Math.round(W*.68),pl=40,pr=10,pt=12,pb=30;
  var x0=-30,x1=90,y0=20,y1=120,X=function(v){return pl+(v-x0)*(W-pl-pr)/(x1-x0)},Y=function(v){return H-pb-(Math.min(Math.max(v,y0),y1)-y0)*(H-pt-pb)/(y1-y0)};
  var wrap=fig.querySelector('.svgw'),svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Exit velocity vs launch angle'});wrap.insertBefore(svg,wrap.firstChild);
  for(var v=y0;v<=y1;v+=20){el('line',{'class':'grid',x1:pl,x2:W-pr,y1:Y(v),y2:Y(v)},svg);el('text',{'class':'yl',x:pl-5,y:Y(v)+4},svg).textContent=v}
  for(v=-30;v<=90;v+=30){el('line',{'class':'grid',x1:X(v),x2:X(v),y1:pt,y2:H-pb},svg);el('text',{'class':'xl',x:X(v),y:H-pb+15,'text-anchor':'middle'},svg).textContent=v+'\u00b0'}
  var bz=[[26,98],[25,99],[24,100],[8,116],[8,120],[50,120],[50,116],[33,100],[31,99],[30,98]];
  el('polygon',{'class':'brlz',points:bz.map(function(p){return X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)}).join(' ')},svg);
  el('text',{'class':'brlt',x:X(29),y:Y(113)},svg).textContent='barrel zone';
  el('text',{'class':'axt',x:pl,y:pt-2},svg).textContent='exit velocity (mph)';el('text',{'class':'axt',x:W-pr,y:H-3,'text-anchor':'end'},svg).textContent='launch angle';
  var tot={},order=[4,5,6,7,8,9];D.p.sort(function(a,b){return order.indexOf(a[2])-order.indexOf(b[2])});
  D.p.forEach(function(p,i){tot[p[2]]=(tot[p[2]]||0)+1;el('circle',{'class':'bb','data-i':i,cx:X(p[0]).toFixed(1),cy:Y(p[1]/10).toFixed(1),r:p[2]===9?3.6:2.9,fill:RC[p[2]][0]},svg)});
  var lg=document.createElement('div');lg.className='sprl';order.forEach(function(r){if(tot[r])lg.innerHTML+='<span><i style="background:'+RC[r][0]+'"></i>'+RC[r][1]+' '+tot[r]+'</span>'});fig.insertBefore(lg,fig.querySelector('figcaption'));
  var tip=fig.querySelector('.tip');function show(e){var t=e.target,i=t.getAttribute&&t.getAttribute('data-i');if(i===null||i===undefined||i===false){tip.hidden=true;return}
    var p=D.p[+i];tip.innerHTML='<b>'+day0(D.d0,p[3])+(p[4]>=0?(D.pitch?' vs ':' vs ')+D.o[p[4]]:'')+'</b><br>'+RC[p[2]][1]+': '+(p[1]/10).toFixed(1)+' mph, '+p[0]+'\u00b0';
    tip.hidden=false;var r=svg.getBoundingClientRect();tip.style.left=Math.max(0,Math.min(e.clientX-r.left+10,r.width-tip.offsetWidth))+'px';tip.style.top=(e.clientY-r.top+12)+'px'}
  svg.addEventListener('mousemove',show);svg.addEventListener('click',show);svg.addEventListener('mouseleave',function(){tip.hidden=true})}
function dv(v,mid,lo,hi){var t=v>=mid?Math.min(1,(v-mid)/(hi-mid)):-Math.min(1,(mid-v)/(mid-lo));
  var c=t>=0?[255+(200-255)*t,255+(40-255)*t,255+(45-255)*t]:[255+(45-255)*-t,255+(95-255)*-t,255+(170-255)*-t];
  return'rgb('+c.map(function(x){return Math.round(x)}).join(',')+')'}
function strk(fig){
  var D=JSON.parse(fig.getAttribute('data-sk')),n=D.c.length,cw=fig.clientWidth||((document.documentElement.clientWidth||600)-24),W=Math.max(300,Math.min(900,cw)),pl=34,pr=8,lh=70,ch=26,H=lh+ch+30;
  var w=(W-pl-pr)/n,svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Game-by-game performance strip'}),wrap=fig.querySelector('.svgw');wrap.insertBefore(svg,wrap.firstChild);
  var roll=[];D.c.forEach(function(c,i){var a=D.c.slice(Math.max(0,i-6),i+1);
    if(D.k==='ops'){var s=[0,0,0,0,0,0];a.forEach(function(x){for(var j=0;j<6;j++)s[j]+=x[3][j]});var ob=s[0]+s[2]+s[3]+s[4];roll.push((ob?(s[1]+s[2]+s[3])/ob:0)+(s[0]?s[5]/s[0]:0))}
    else roll.push(a.reduce(function(t,x){return t+x[1]},0)/a.length)});
  var lo=D.k==='ops'?0:D.lo,hi=D.k==='ops'?1.6:D.hi,Y=function(v){return 6+(lh-12)*(1-(Math.min(Math.max(v,lo),hi)-lo)/(hi-lo))};
  el('line',{'class':'ref',x1:pl,x2:W-pr,y1:Y(D.mid),y2:Y(D.mid)},svg);
  [[hi,D.k==='ops'?'1.600':String(hi)],[D.mid,D.k==='ops'?D.mid.toFixed(3).replace(/^0/,''):String(D.mid)],[lo,String(lo)]].forEach(function(q){el('text',{'class':'yl',x:pl-4,y:Y(q[0])+4},svg).textContent=q[1]});
  el('polyline',{'class':'ln',points:roll.map(function(v,i){return(pl+w*(i+.5)).toFixed(1)+','+Y(v).toFixed(1)}).join(' '),stroke:'#16181d'},svg);
  D.c.forEach(function(c,i){el('rect',{x:(pl+w*i).toFixed(2),y:lh,width:Math.max(1,w-(w>4?1:0)).toFixed(2),height:ch,fill:dv(c[1],D.mid,D.lo,D.hi),'data-i':i,'class':'sc'},svg)});
  el('text',{'class':'xl',x:pl,y:lh+ch+14},svg).textContent=day0(D.d0,D.c[0][0]);el('text',{'class':'xl',x:W-pr,y:lh+ch+14,'text-anchor':'end'},svg).textContent=day0(D.d0,D.c[n-1][0]);
  var lg=document.createElement('div');lg.className='skl';lg.innerHTML='<span>'+(D.k==='ops'?'.000':D.lo)+'</span><i style="background:linear-gradient(90deg,'+dv(D.lo,D.mid,D.lo,D.hi)+','+dv(D.mid,D.mid,D.lo,D.hi)+','+dv(D.hi,D.mid,D.lo,D.hi)+')"></i><span>'+(D.k==='ops'?'2.000+':D.k==='wpa'?'+'+D.hi:D.hi+'+')+'</span> <em>'+D.lab+' &middot; line = last 7</em>';
  fig.insertBefore(lg,fig.querySelector('figcaption'));
  var tip=fig.querySelector('.tip');function show(e){var t=e.target,i=t.getAttribute&&t.getAttribute('data-i');if(i===null||i===undefined){tip.hidden=true;return}
    var c=D.c[+i],v=D.k==='ops'?c[1].toFixed(3).replace(/^0\./,'.'):D.k==='wpa'?(c[1]>0?'+':'')+c[1].toFixed(3):String(c[1]);
    var rv=D.k==='ops'?roll[+i].toFixed(3).replace(/^0\./,'.'):roll[+i].toFixed(D.k==='wpa'?3:1);
    tip.innerHTML='<b>'+day0(D.d0,c[0])+'</b><br>'+c[2]+'<br>'+D.lab+' '+v+'; last 7: '+rv;tip.hidden=false;var r=svg.getBoundingClientRect();
    tip.style.left=Math.max(0,Math.min(e.clientX-r.left+10,r.width-tip.offsetWidth))+'px';tip.style.top=(e.clientY-r.top+12)+'px'}
  svg.addEventListener('mousemove',show);svg.addEventListener('click',show);svg.addEventListener('mouseleave',function(){tip.hidden=true})}
function pyr(fig){var sel=fig.querySelector('.pyrsel'),gs=[].slice.call(fig.querySelectorAll('g.tm'));
  function pick(g){gs.forEach(function(x){x.classList.toggle('on',x===g)});fig.classList.toggle('focus',!!g);sel.textContent=g?g.getAttribute('data-i'):''}
  gs.forEach(function(g){g.addEventListener('click',function(e){e.stopPropagation();pick(g.classList.contains('on')&&fig.classList.contains('focus')&&sel.textContent?null:g)});
    g.addEventListener('mouseenter',function(){if(!fig.classList.contains('focus'))sel.textContent=g.getAttribute('data-i')})});
  var on=fig.querySelector('g.tm.on');if(on){sel.textContent=on.getAttribute('data-i');var w=fig.querySelector('.pyrw'),c=on.querySelector('image,circle:last-of-type');
    if(w&&c&&w.scrollWidth>w.clientWidth){w.scrollLeft=w.scrollWidth}}}
function go(){[].forEach.call(document.querySelectorAll('figure.evla[data-ev]'),function(f){try{evla(f)}catch(e){}});[].forEach.call(document.querySelectorAll('figure.strk[data-sk]'),function(f){try{strk(f)}catch(e){}});[].forEach.call(document.querySelectorAll('figure.pyr'),function(f){try{pyr(f)}catch(e){}});[].forEach.call(document.querySelectorAll('figure.tlc[data-tl]'),function(f){try{init(f)}catch(e){}});
  [].forEach.call(document.querySelectorAll('figure.spray[data-sp]'),function(f){try{spray(f)}catch(e){}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
