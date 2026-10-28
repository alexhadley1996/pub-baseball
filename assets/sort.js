/* Click-to-sort for every table.st. Numbers sort high-to-low on first click, text A-Z.
   Blank / "-" cells always go last. A cell's data-v attribute overrides its text. */
(function(){
var MON={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
function raw(td){if(!td)return '';return td.hasAttribute('data-v')?td.getAttribute('data-v'):td.textContent.trim()}
function num(s){
  if(s===''||s==='-'||s==='\u2014')return null;
  var m;
  if(/^[+\-]?\d*\.?\d+$/.test(s.replace(/,/g,'')))return parseFloat(s.replace(/,/g,''));
  if((m=s.match(/^(\d*)\u00bd$/)))return (m[1]?parseInt(m[1],10):0)+0.5;
  if((m=s.match(/^(\d+)-(\d+)$/))){var a=+m[1],b=+m[2];return a+b?a/(a+b)+a*1e-6:0}
  if((m=s.match(/^([WL])(\d+)$/)))return m[1]==='W'?+m[2]:-m[2];
  if((m=s.match(/^#(\d+)$/)))return -m[1];
  if((m=s.match(/^([A-Z][a-z]{2}) (\d{1,2})$/))&&MON[m[1]])return MON[m[1]]*100+(+m[2]);
  return NaN}
function sortTable(t,ci,th){
  var tb=t.tBodies[0];if(!tb)return;var rows=[].slice.call(tb.rows);
  var vals=rows.map(function(r){return raw(r.cells[ci])});
  var nums=vals.map(num),filled=nums.filter(function(v){return v!==null}),isNum=filled.length&&filled.filter(function(v){return !isNaN(v)}).length>=filled.length*0.6;
  var prev=th.getAttribute('aria-sort'),dir;
  if(prev)dir=prev==='descending'?1:-1; else dir=isNum?-1:1;   /* -1 = high to low */
  [].forEach.call(t.tHead.rows[0].cells,function(h){h.removeAttribute('aria-sort')});
  th.setAttribute('aria-sort',dir<0?'descending':'ascending');
  var idx=rows.map(function(r,i){return i});
  idx.sort(function(a,b){
    var x=isNum?nums[a]:vals[a],y=isNum?nums[b]:vals[b];
    var xe=x===null||x===''||(isNum&&isNaN(x)),ye=y===null||y===''||(isNum&&isNaN(y));
    if(xe&&ye)return a-b; if(xe)return 1; if(ye)return -1;
    if(isNum)return (x-y)*dir||a-b;
    return x.localeCompare(y,undefined,{numeric:true,sensitivity:'base'})*dir||a-b});
  var f=document.createDocumentFragment();idx.forEach(function(i){f.appendChild(rows[i])});tb.appendChild(f);
  t.classList.add('sorted')}
function init(){
  [].forEach.call(document.querySelectorAll('table.st'),function(t){
    if(!t.tHead)return;
    [].forEach.call(t.tHead.rows[0].cells,function(th,ci){
      if(!th.textContent.trim())return;
      th.tabIndex=0;th.classList.add('sh');th.title='Sort by '+th.textContent.trim();
      th.addEventListener('click',function(){sortTable(t,ci,th)});
      th.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sortTable(t,ci,th)}});
    })});
  [].forEach.call(document.querySelectorAll('[data-qtoggle]'),function(cb){
    var t=document.getElementById(cb.getAttribute('data-qtoggle'));
    cb.addEventListener('change',function(){t.classList.toggle('hideq',!cb.checked)})});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.sortTable=sortTable;
})();
