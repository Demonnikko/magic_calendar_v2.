document.addEventListener('DOMContentLoaded', ()=>{
  /* ========= data ========= */
  const defaultCats=[
    {name:'Концертная программа',emoji:'🎤',color:'#8e5cff'},
    {name:'Частное мероприятие',emoji:'🎉',color:'#ff5c7a'},
    {name:'Корпоратив',emoji:'🏢',color:'#5c8eff'},
    {name:'Детский праздник',emoji:'🎈',color:'#ffa600'},
    {name:'Микромагия',emoji:'🃏',color:'#0ecb81'}
  ];
  let categories = JSON.parse(localStorage.getItem('magic_cats')||'null') || defaultCats;
  let events     = JSON.parse(localStorage.getItem('magic_events')||'[]');

  /* ========= helpers ========= */
  const catSelect = document.getElementById('categorySelect');
  function renderCategories(){
    catSelect.innerHTML='';
    categories.forEach((c,idx)=>{
      const opt=document.createElement('option');
      opt.value=idx; opt.textContent=`${c.emoji} ${c.name}`;
      catSelect.appendChild(opt);
    });
  }
  renderCategories();

  function store(){ localStorage.setItem('magic_events',JSON.stringify(events)); }
  function storeCats(){ localStorage.setItem('magic_cats',JSON.stringify(categories)); }

  /* ========= FullCalendar ========= */
  const calEl=document.getElementById('calendar');
  const fcEvents = ()=>events.map(ev=>{
      const cat=categories[ev.cat]||defaultCats[0];
      return {
        id:ev.id,
        title:`${cat.emoji} ${ev.title}`,
        start:ev.date+(ev.allday?'':'T'+ev.time),
        allDay:ev.allday,
        backgroundColor:cat.color,
        borderColor:cat.color
      };
  });
  const calendar=new FullCalendar.Calendar(calEl,{
    initialView:'dayGridMonth',
    locale:'ru',
    firstDay:1,
    headerToolbar:{start:'prev,next today',center:'title',end:''},
    events:fcEvents(),
    dateClick:info=>openDay(info.dateStr),
    eventClick:info=>openDay(info.event.startStr.split('T')[0])
  });
  calendar.render();

  /* ========= income ========= */
  function updateIncome(){
    const now=new Date(), m=now.getMonth(), y=now.getFullYear();
    const income=events.reduce((sum,e)=>{
      const d=new Date(e.date);
      if(d.getMonth()===m&&d.getFullYear()===y){ sum+=e.fee; }
      return sum;
    },0);
    document.getElementById('month-income').textContent=`Доход за месяц: ₽${income.toLocaleString('ru-RU')}`;
  }
  updateIncome();

  /* ========= day modal ========= */
  const dayModal=document.getElementById('dayModal');
  const eventsOfDayUl=document.getElementById('eventsOfDay');
  const modalDateLabel=document.getElementById('modal-date');
  let currentDate='';

  document.getElementById('closeModal').onclick=()=>dayModal.classList.add('hidden');
  document.getElementById('addEventBtn').onclick=()=>{
    dayModal.classList.add('hidden');
    openSheet();
  };

  function openDay(dateStr){
    currentDate=dateStr;
    modalDateLabel.textContent=new Date(dateStr).toLocaleDateString('ru-RU',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    eventsOfDayUl.innerHTML='';
    events.filter(e=>e.date===dateStr).forEach(e=>{
      const cat=categories[e.cat]||defaultCats[0];
      const li=document.createElement('li');
      li.innerHTML=`<b style="color:${cat.color}">${cat.emoji} ${e.title}</b><br>
        ${e.allday?'Весь день':e.time} • ₽${e.fee.toLocaleString('ru-RU')}<br>
        ${e.address||''}`;
      eventsOfDayUl.appendChild(li);
    });
    dayModal.classList.remove('hidden');
  }

  /* ========= event sheet ========= */
  const sheet=document.getElementById('sheet');
  const eventForm=document.getElementById('eventForm');
  document.getElementById('sheetTitle').textContent='Новое событие';
  document.getElementById('eventForm').reset();
  document.getElementById('allday').onchange=e=>{
    document.getElementById('time').disabled=e.target.checked;
  };

  function openSheet(){
    eventForm.reset();
    document.getElementById('allday').checked=false;
    document.getElementById('time').disabled=false;
    sheet.classList.remove('hidden');
  }

  eventForm.onsubmit=e=>{
    e.preventDefault();
    const ev={
      id:Date.now(),
      title:document.getElementById('title').value.trim(),
      date:currentDate,
      time:document.getElementById('time').value,
      allday:document.getElementById('allday').checked,
      address:document.getElementById('address').value.trim(),
      prepay:+document.getElementById('prepay').value||0,
      fee:+document.getElementById('fee').value||0,
      cat:+document.getElementById('categorySelect').value,
      notes:document.getElementById('notes').value,
      checklist:document.getElementById('checklist').value.split('\n').filter(l=>l).map(t=>({text:t,done:false}))
    };
    events.push(ev); store();
    calendar.addEvent({
      id:ev.id,
      title:`${categories[ev.cat].emoji} ${ev.title}`,
      start:ev.date+(ev.allday?'':'T'+ev.time),
      allDay:ev.allday,
      backgroundColor:categories[ev.cat].color,
      borderColor:categories[ev.cat].color
    });
    updateIncome();
    sheet.classList.add('hidden');
  };

  /* ========= category modal ========= */
  const catModal=document.getElementById('catModal');
  document.getElementById('addCatLink').onclick=e=>{
    e.preventDefault(); catModal.classList.remove('hidden');
  };
  document.getElementById('closeCat').onclick=()=>catModal.classList.add('hidden');
  document.getElementById('saveCat').onclick=()=>{
    const name=document.getElementById('catName').value.trim();
    const emoji=document.getElementById('catEmoji').value.trim()||'⭐';
    const color=document.getElementById('catColor').value;
    if(!name){alert('Введите название');return;}
    categories.push({name,emoji,color});
    storeCats();
    renderCategories();
    catModal.classList.add('hidden');
  };

  /* ========= service worker ========= */
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js');
  }
});