
const form=document.getElementById('event-form');
const listEl=document.querySelector('#events-list ul');
const monthSum=document.getElementById('month-summary');
const allday=document.getElementById('allday');
const dtInput=document.getElementById('datetime');

allday.addEventListener('change',()=>{dtInput.disabled=allday.checked});

let events=JSON.parse(localStorage.getItem('magic_events')||'[]');
render();

form.addEventListener('submit',e=>{
 e.preventDefault();
 const ev={
   id:Date.now(),
   title:document.getElementById('title').value.trim(),
   datetime:allday.checked?null:dtInput.value,
   allday:allday.checked,
   address:document.getElementById('address').value.trim(),
   prepay:+document.getElementById('prepay').value||0,
   total:+document.getElementById('totalfee').value||0,
   category:document.getElementById('category').value,
   notes:document.getElementById('notes').value.trim()
 };
 events.push(ev);
 save();
 form.reset(); allday.checked=false; dtInput.disabled=false;
 alert('Событие сохранено'); render();
});

function save(){localStorage.setItem('magic_events',JSON.stringify(events));}

function del(id){events=events.filter(e=>e.id!==id);save();render();}

function yandex(addr){if(!addr)return;window.open('https://yandex.ru/maps/?rtext=current~'+encodeURIComponent(addr)+'&rtt=auto','_blank');}

function render(){
 listEl.innerHTML='';
 const now=new Date(); const m=now.getMonth(),y=now.getFullYear();
 let monthTotal=0;
 events.sort((a,b)=>(a.datetime||'').localeCompare(b.datetime||''));
 events.forEach(ev=>{
  const li=document.createElement('li');li.className='event-card';
  const dtText=ev.allday?'Весь день':new Date(ev.datetime).toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'});
  li.innerHTML=`
    <h3>${ev.category} — ${ev.title}</h3>
    <div class="event-meta">${dtText}</div>
    <div class="event-meta">₽${ev.total.toLocaleString('ru-RU')} / пред. ₽${ev.prepay.toLocaleString('ru-RU')}</div>
    <div class="event-meta">${ev.address}</div>
    <p>${ev.notes}</p>
    <div class="event-actions">
      <button onclick="yandex('${ev.address}')">Маршрут</button>
      <button onclick="del(${ev.id})">Удалить</button>
    </div>`;
  listEl.appendChild(li);
  const d=ev.datetime?new Date(ev.datetime):now;
  if(d.getMonth()===m&&d.getFullYear()===y)monthTotal+=ev.total;
 });
 monthSum.textContent='Доход за месяц: ₽'+monthTotal.toLocaleString('ru-RU');
}

// service worker
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js');}
