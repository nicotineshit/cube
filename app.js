(()=>{
const $=id=>document.getElementById(id),storeKey='cubelab-progress-v1';
let progress={};try{progress=JSON.parse(localStorage.getItem(storeKey)||'{}')}catch(e){}
let current=null;
function save(){localStorage.setItem(storeKey,JSON.stringify(progress));renderProgress()}
function tab(t){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===t));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===t));if(t==='progress')renderProgress()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
function scramble(){let size=+$('size').value,n={2:11,3:20,4:40,5:60,6:80,7:100}[size],faces=['R','L','U','D','F','B'],last=-1,a=[];while(a.length<n){let f=faces[Math.floor(Math.random()*6)],axis='RL'.includes(f)?0:'UD'.includes(f)?1:2;if(axis===last)continue;last=axis;let prefix=size>3&&Math.random()<.32?(2+Math.floor(Math.random()*(Math.floor(size/2)-1))):'';if(size>3&&Math.random()<.16)prefix='';let wide=size>3&&Math.random()<.15?'w':'';a.push(prefix+f+wide+['',"'","2"][Math.floor(Math.random()*3)])} $('scrambleText').textContent=a.join(' ');$('scrambleMeta').textContent=size+'×'+size+' · '+n+' ходов'}
$('newScramble').onclick=scramble;$('size').onchange=scramble;scramble();
$('copyScramble').onclick=()=>copy($('scrambleText').textContent);
function copy(t){if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>{});else{let x=document.createElement('textarea');x.value=t;document.body.append(x);x.select();document.execCommand('copy');x.remove()}}
function state(id){return progress[id]||'new'}
function makeGrid(set,query=''){let host=$(set+'Grid'),items=CASES[set].filter(c=>(c.name+' '+c.alg+' '+(c.group||'')).toLowerCase().includes(query.toLowerCase()));host.innerHTML='';items.forEach(c=>{let b=document.createElement('button');b.className='case '+state(set+'-'+c.id);b.innerHTML='<strong>'+c.name+'</strong><small>'+ (state(set+'-'+c.id)==='known'?'Выучено ✓':state(set+'-'+c.id)==='learning'?'Учу':'Открыть алгоритм')+'</small>';b.onclick=()=>openCase(set,c);host.append(b)})}
function diagram(id){let seed=Number(id)||Array.from(String(id)).reduce((a,c)=>a+c.charCodeAt(0),0);let html='';for(let i=0;i<9;i++){seed=(seed*9301+49297)%233280;html+='<span class="tile '+(seed/233280>.5?'':'off')+'"></span>'}return html}
function openCase(set,c){current={set,c,id:set+'-'+c.id};$('detailTitle').textContent=c.name;$('detailAlg').textContent=c.alg;$('diagram').innerHTML=diagram(c.id);$('stateLabel').textContent='Статус: '+({new:'Не знаю',learning:'Учу',known:'Выучил'}[state(current.id)]);$('detail').showModal()}
$('close').onclick=()=>$('detail').close();$('copyAlg').onclick=()=>copy($('detailAlg').textContent);
document.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>{if(!current)return;progress[current.id]=b.dataset.state;save();$('stateLabel').textContent='Статус: '+b.textContent;makeGrid(current.set,$('search'+(current.set==='oll'?'Oll':'Pll')).value)});
$('searchOll').oninput=e=>makeGrid('oll',e.target.value);$('searchPll').oninput=e=>makeGrid('pll',e.target.value);
function renderProgress(){let all=[...CASES.oll.map(c=>({id:'oll-'+c.id,name:c.name})),...CASES.pll.map(c=>({id:'pll-'+c.id,name:c.name}))],known=all.filter(c=>progress[c.id]==='known').length,learning=all.filter(c=>progress[c.id]==='learning').length;$('progressSummary').innerHTML='<h3>'+known+' / 78 выучено</h3><p>'+learning+' в процессе · '+(78-known-learning)+' новых</p><div style="height:9px;background:#26354b;border-radius:9px;overflow:hidden"><div style="height:100%;width:'+(known/78*100)+'%;background:#35b783"></div></div>';$('progressList').innerHTML='<p>OLL: '+CASES.oll.filter(c=>progress['oll-'+c.id]==='known').length+'/57</p><p>PLL: '+CASES.pll.filter(c=>progress['pll-'+c.id]==='known').length+'/21</p>'}
$('export').onclick=()=>{let a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(progress,null,2)],{type:'application/json'}));a.href=u;a.download='cubelab-progress.json';a.click();URL.revokeObjectURL(u)};
$('import').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{progress=JSON.parse(r.result);save();makeGrid('oll');makeGrid('pll')}catch(err){alert('Файл прогресса не распознан')}};r.readAsText(f)};
makeGrid('oll');makeGrid('pll');renderProgress();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();