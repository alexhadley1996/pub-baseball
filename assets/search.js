(function(){var q=document.getElementById('q'),res=document.getElementById('res'),D=window.SEARCH||[];
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
/* entry: [name, url, meta, type t|p|h, weight (career PA + outs), aliases (stored nickname, former name)] */
var N=D.map(function(d){return norm(d[0])}),A=D.map(function(d){return norm(d[5]||'')});
function run(){var v=norm(q.value.trim());res.innerHTML='';if(v.length<2)return;var out=[];
for(var i=0;i<D.length;i++){var n=N[i],k=n.indexOf(v),al=0;if(k<0&&A[i]&&A[i].indexOf(v)>-1){k=A[i].indexOf(v);al=1}
  if(k>-1){var word=(k===0||(al?A[i]:n).indexOf(' '+v)>-1)?0:1;out.push([word,D[i][3]==='t'?0:1,-(D[i][4]||0),i,al])}}
out.sort(function(a,b){return a[0]-b[0]||a[1]-b[1]||a[2]-b[2]});var total=out.length;out=out.slice(0,80);
out.forEach(function(o){var d=D[o[3]],li=document.createElement('li'),a=document.createElement('a');a.href=d[1];a.textContent=d[0];
  var s=document.createElement('small');s.textContent=(d[3]==='h'?'Historical · ':'')+d[2]+(o[4]&&d[5]?' (also: '+d[5]+')':'');li.appendChild(a);li.appendChild(s);res.appendChild(li)});
if(!total)res.innerHTML='<li class="muted">No matches.</li>';else if(total>80){var m=document.createElement('li');m.className='muted';m.textContent=total+' matches; showing the 80 with the longest careers.';res.appendChild(m)}}
q.addEventListener('input',run);var p=new URLSearchParams(location.search).get('q');if(p){q.value=p;run()}})();
