(function(){var q=document.getElementById('q'),res=document.getElementById('res'),D=window.SEARCH||[];
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
var N=D.map(function(d){return norm(d[0])});
function run(){var v=norm(q.value.trim());res.innerHTML='';if(v.length<2)return;var out=[];
for(var i=0;i<D.length;i++){var n=N[i],k=n.indexOf(v);if(k>-1){out.push([k===0||n.indexOf(' '+v)>-1?0:1,D[i][3]==='t'?0:1,i])}}
out.sort(function(a,b){return a[0]-b[0]||a[1]-b[1]});out=out.slice(0,60);
out.forEach(function(o){var d=D[o[2]],li=document.createElement('li'),a=document.createElement('a');a.href=d[1];a.textContent=d[0];var s=document.createElement('small');s.textContent=d[2];li.appendChild(a);li.appendChild(s);res.appendChild(li)});
if(!out.length)res.innerHTML='<li class="muted">No matches.</li>'}
q.addEventListener('input',run);var p=new URLSearchParams(location.search).get('q');if(p){q.value=p;run()}})();
