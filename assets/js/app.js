import { openDB, get, getAllByOwner, put, remove, replaceOwnerData } from './db.js';

const ROUTES = {
  dashboard:{title:'Dashboard',eyebrow:'Overview',icon:'⌂',mobile:true},
  tasks:{title:'Tasks',eyebrow:'Plan & focus',icon:'✓',mobile:true},
  notes:{title:'Notes',eyebrow:'Capture ideas',icon:'✎',mobile:false},
  calendar:{title:'Calendar',eyebrow:'Schedule',icon:'▦',mobile:true},
  goals:{title:'Goals',eyebrow:'Track progress',icon:'◎',mobile:false},
  habits:{title:'Habits',eyebrow:'Build consistency',icon:'↗',mobile:true},
  analytics:{title:'Analytics',eyebrow:'Insights',icon:'◫',mobile:false},
  team:{title:'Team',eyebrow:'Local workspace demo',icon:'♙',mobile:false},
  settings:{title:'Settings',eyebrow:'Preferences',icon:'⚙',mobile:true}
};

const SESSION_KEY='flowdesk.session';
const THEME_KEY='flowdesk.theme';
const ACCENT_KEY='flowdesk.accent';
const DEMO_ID='demo-user';
const STORE_NAMES=['tasks','notes','goals','habits','events','team','activity'];
const state={user:null,route:'dashboard',theme:'light',accent:'#6d5dfc',timer:null,timerTick:null,calendarDate:new Date(),installPrompt:null,filters:{taskSearch:'',taskPriority:'all',taskStatus:'all',taskSort:'priority'}};

const $=s=>document.querySelector(s);
const els={auth:$('#authScreen'),app:$('#app'),view:$('#view'),sidebar:$('#sidebar'),sidebarOverlay:$('#sidebarOverlay'),desktopNav:$('#desktopNav'),mobileNav:$('#mobileNav'),menuBtn:$('#menuBtn'),sidebarClose:$('#sidebarClose'),pageTitle:$('#pageTitle'),pageEyebrow:$('#pageEyebrow'),searchBtn:$('#searchBtn'),themeBtn:$('#themeBtn'),notificationBtn:$('#notificationBtn'),notificationDot:$('#notificationDot'),profileBtn:$('#profileBtn'),sidebarProfile:$('#sidebarProfile'),sidebarAvatar:$('#sidebarAvatar'),sidebarName:$('#sidebarName'),sidebarRole:$('#sidebarRole'),topAvatar:$('#topAvatar'),topName:$('#topName'),topRole:$('#topRole'),demoBanner:$('#demoBanner'),exitDemoBtn:$('#exitDemoBtn'),fab:$('#fab'),modalRoot:$('#modalRoot'),drawerRoot:$('#drawerRoot'),toastRoot:$('#toastRoot'),restoreFile:$('#restoreFile'),loginForm:$('#loginForm'),registerForm:$('#registerForm'),demoBtn:$('#demoBtn')};

boot().catch(fatal);

async function boot(){
  await openDB();
  loadTheme();
  renderNav();
  bindGlobalEvents();
  const session=readLocal(SESSION_KEY,null);
  if(session?.email){
    const user=await get('users',session.email);
    if(user){ await enterWorkspace(user); return; }
  }
  showAuth();
}

function bindGlobalEvents(){
  document.querySelectorAll('[data-auth-tab]').forEach(btn=>btn.addEventListener('click',()=>switchAuthTab(btn.dataset.authTab)));
  els.loginForm.addEventListener('submit',login);
  els.registerForm.addEventListener('submit',register);
  els.demoBtn.addEventListener('click',enterDemo);
  els.menuBtn.addEventListener('click',openSidebar);
  els.sidebarClose.addEventListener('click',closeSidebar);
  els.sidebarOverlay.addEventListener('click',closeSidebar);
  els.themeBtn.addEventListener('click',toggleTheme);
  els.searchBtn.addEventListener('click',openCommandPalette);
  els.notificationBtn.addEventListener('click',openNotifications);
  els.profileBtn.addEventListener('click',openProfile);
  els.sidebarProfile.addEventListener('click',openProfile);
  els.exitDemoBtn.addEventListener('click',()=>{ logout(); switchAuthTab('register'); });
  els.fab.addEventListener('click',()=>openCreateForRoute());
  els.restoreFile.addEventListener('change',restoreBackup);
  window.addEventListener('hashchange',routeFromHash);
  window.addEventListener('resize',()=>{if(innerWidth>992)closeSidebar()});
  document.addEventListener('click',delegateClick);
  document.addEventListener('change',delegateChange);
  document.addEventListener('input',delegateInput);
  document.addEventListener('submit',delegateSubmit);
  document.addEventListener('keydown',keyboardShortcuts);
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e});
}

function switchAuthTab(tab){
  document.querySelectorAll('[data-auth-tab]').forEach(b=>b.classList.toggle('is-active',b.dataset.authTab===tab));
  els.loginForm.hidden=tab!=='login'; els.registerForm.hidden=tab!=='register';
}
function showAuth(){
  els.auth.hidden=false; els.app.hidden=true; els.mobileNav.hidden=true; els.fab.hidden=true;
}
async function enterWorkspace(user){
  state.user=user; writeLocal(SESSION_KEY,{email:user.email});
  els.auth.hidden=true; els.app.hidden=false; els.mobileNav.hidden=false;
  renderUser();
  if(user.id===DEMO_ID) await seedDemo(); else await ensureUserStarterData();
  routeFromHash(true);
}
async function register(e){
  e.preventDefault(); const data=new FormData(e.currentTarget); const email=String(data.get('email')).trim().toLowerCase();
  if(await get('users',email)){ toast('Account exists','Use the login tab for this email.','warning'); return; }
  const user={id:uid('user'),name:String(data.get('name')).trim(),email,role:'admin',passwordHash:await hash(String(data.get('password'))),createdAt:Date.now()};
  await put('users',user); await enterWorkspace(user); toast('Account created',`Welcome, ${firstName(user.name)}.`,'success');
}
async function login(e){
  e.preventDefault(); const data=new FormData(e.currentTarget); const email=String(data.get('email')).trim().toLowerCase(); const user=await get('users',email);
  if(!user || user.passwordHash!==await hash(String(data.get('password')))){ toast('Login failed','Email or password is incorrect.','error'); return; }
  await enterWorkspace(user); toast('Welcome back',user.name,'success');
}
async function enterDemo(){
  const user={id:DEMO_ID,name:'Demo User',email:'demo@flowdesk.local',role:'demo',createdAt:Date.now()};
  await enterWorkspace(user);
}
function logout(){
  stopTimer(true); localStorage.removeItem(SESSION_KEY); state.user=null; history.replaceState(null,'','#/dashboard'); closeModal(); closeDrawer(); showAuth();
}
async function hash(text){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}

function renderNav(){
  els.desktopNav.innerHTML=`<ul class="nav-list">${Object.entries(ROUTES).map(([k,r])=>`<li><a class="nav-item" href="#/${k}" data-route="${k}"><span class="nav-icon">${r.icon}</span><span>${r.title}</span></a></li>`).join('')}</ul>`;
  els.mobileNav.innerHTML=Object.entries(ROUTES).filter(([,r])=>r.mobile).map(([k,r])=>`<a href="#/${k}" data-route="${k}"><span>${r.icon}</span><span>${r.title}</span></a>`).join('');
}
function renderUser(){
  const initials=getInitials(state.user.name); const role=state.user.role==='demo'?'Demo mode':capitalize(state.user.role);
  [els.sidebarAvatar,els.topAvatar].forEach(x=>x.textContent=initials); els.sidebarName.textContent=state.user.name; els.topName.textContent=state.user.name; els.sidebarRole.textContent=role; els.topRole.textContent=state.user.role==='demo'?'Demo':capitalize(state.user.role); els.demoBanner.hidden=state.user.id!==DEMO_ID;
}
function routeFromHash(replace=false){
  if(!state.user)return; const raw=location.hash.replace(/^#\/?/,'').split('?')[0]; state.route=ROUTES[raw]?raw:'dashboard'; if(replace||!ROUTES[raw]) history.replaceState(null,'',`#/${state.route}`); renderRoute();
}
async function renderRoute(){
  const route=ROUTES[state.route]; els.pageTitle.textContent=route.title; els.pageEyebrow.textContent=route.eyebrow; document.title=`${route.title} — FlowDesk`;
  document.querySelectorAll('[data-route]').forEach(a=>{const on=a.dataset.route===state.route;a.classList.toggle('is-active',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')}); closeSidebar();
  const renderers={dashboard, tasks:tasksView, notes:notesView, calendar:calendarView, goals:goalsView, habits:habitsView, analytics:analyticsView, team:teamView, settings:settingsView};
  els.view.innerHTML='<div class="empty-state">Loading…</div>'; els.view.innerHTML=await (renderers[state.route]||dashboard)(); if(state.route==='tasks')setupTaskDrag(); els.fab.hidden=['analytics','settings'].includes(state.route); els.view.focus({preventScroll:true});
}
function openSidebar(){els.sidebar.classList.add('is-open');els.sidebarOverlay.hidden=false;els.menuBtn.setAttribute('aria-expanded','true')}
function closeSidebar(){els.sidebar.classList.remove('is-open');els.sidebarOverlay.hidden=true;els.menuBtn.setAttribute('aria-expanded','false')}

async function dashboard(){
  const [tasks,notes,goals,habits,events]=await Promise.all(['tasks','notes','goals','habits','events'].map(s=>getAllByOwner(s,state.user.id)));
  const today=isoDate(new Date()); const done=tasks.filter(t=>t.completed).length; const habitDone=habits.filter(h=>h.history?.includes(today)).length; const score=productivityScore(tasks,goals,habits);
  const upcoming=tasks.filter(t=>!t.completed).sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999')).slice(0,5);
  return `<section><div class="dashboard-hero"><article class="hero-card"><p class="page-eyebrow">Today</p><h2>Good ${dayPart()}, ${esc(firstName(state.user.name))}.</h2><p>Your private workspace is ready. Focus on the next useful action and keep momentum visible.</p><div class="page-actions"><button class="btn btn-primary" data-action="new-task">Add task</button><a class="btn btn-secondary" href="#/calendar">View calendar</a></div></article><article class="card score-card"><div><div class="score-value">${score}</div><div class="stat-label">Productivity score</div><div class="stat-detail">Local heuristic</div></div></article></div>
  <div class="grid grid-4 section">${stat('✓',tasks.length,'Tasks',`${done} completed`)}${stat('✎',notes.length,'Notes','Private & searchable')}${stat('◎',goals.filter(g=>g.status!=='completed').length,'Active goals',`${goals.length} total`)}${stat('↗',habitDone,'Habits today',`${habits.length} tracked`)}</div>
  <div class="dashboard-main"><div class="stack"><article class="card"><div class="card-head"><div><h3 class="card-title">Next tasks</h3><p class="card-subtitle">Priority work and upcoming deadlines</p></div><a class="btn btn-secondary btn-sm" href="#/tasks">View all</a></div><div class="card-body"><div class="list">${upcoming.length?upcoming.map(t=>taskMini(t)).join(''):'<div class="empty-state">No open tasks. Nice work.</div>'}</div></div></article>
  <article class="card"><div class="card-head"><div><h3 class="card-title">7-day activity</h3><p class="card-subtitle">Completed tasks and habit check-ins</p></div></div><div class="card-body">${activityBars(tasks,habits)}</div></article></div>
  <aside class="stack"><article class="card"><div class="card-head"><div><h3 class="card-title">Goal progress</h3><p class="card-subtitle">Current outcomes</p></div></div><div class="card-body stack">${goals.length?goals.slice(0,4).map(g=>`<div><div class="toolbar"><strong class="list-title">${esc(g.title)}</strong><span class="list-meta">${num(g.progress)}%</span></div><div class="progress"><span style="width:${num(g.progress)}%"></span></div></div>`).join(''):'<div class="empty-state">Add your first goal.</div>'}</div></article>
  <article class="card"><div class="card-head"><div><h3 class="card-title">Upcoming</h3><p class="card-subtitle">Calendar events</p></div></div><div class="card-body list">${events.filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4).map(e=>`<div class="list-row"><div class="stat-icon">▦</div><div class="list-copy"><div class="list-title">${esc(e.title)}</div><div class="list-meta">${fmtDate(e.date)}${e.time?' · '+esc(e.time):''}</div></div></div>`).join('')||'<div class="empty-state">No upcoming events.</div>'}</div></article></aside></div></section>`;
}

async function tasksView(){
  let tasks=await getAllByOwner('tasks',state.user.id); const search=state.filters.taskSearch.toLowerCase();
  tasks=tasks.filter(t=>(!search||`${t.title} ${t.description||''} ${(t.tags||[]).join(' ')}`.toLowerCase().includes(search))&&(state.filters.taskPriority==='all'||t.priority===state.filters.taskPriority)&&(state.filters.taskStatus==='all'||(state.filters.taskStatus==='done'?t.completed:t.status===state.filters.taskStatus)));
  tasks.sort((a,b)=>{if(state.filters.taskSort==='due')return (a.dueDate||'9999').localeCompare(b.dueDate||'9999');if(state.filters.taskSort==='created')return (b.createdAt||0)-(a.createdAt||0);return priorityValue(b.priority)-priorityValue(a.priority)||(a.order||0)-(b.order||0)});
  const all=await getAllByOwner('tasks',state.user.id);
  return pageHeader('Tasks','Create, prioritize, time, search, filter and complete work.','Create task','new-task')+`<div class="grid grid-4">${stat('○',all.filter(t=>!t.completed).length,'Open','Needs attention')}${stat('◐',all.filter(t=>t.status==='doing').length,'In progress','Currently active')}${stat('✓',all.filter(t=>t.completed).length,'Completed','Finished work')}${stat('◷',minutesLabel(all.reduce((s,t)=>s+(t.timeSpent||0),0)),'Tracked time','Across tasks')}</div>
  <div class="toolbar"><div class="search"><span>⌕</span><input id="taskSearch" value="${escAttr(state.filters.taskSearch)}" placeholder="Search tasks, tags, descriptions"></div><div class="toolbar-group"><select id="taskPriorityFilter" class="select"><option value="all">All priorities</option>${['high','medium','low'].map(v=>`<option value="${v}" ${state.filters.taskPriority===v?'selected':''}>${capitalize(v)}</option>`).join('')}</select><select id="taskStatusFilter" class="select"><option value="all">All statuses</option><option value="todo" ${state.filters.taskStatus==='todo'?'selected':''}>To do</option><option value="doing" ${state.filters.taskStatus==='doing'?'selected':''}>In progress</option><option value="done" ${state.filters.taskStatus==='done'?'selected':''}>Done</option></select><select id="taskSort" class="select"><option value="priority" ${state.filters.taskSort==='priority'?'selected':''}>Sort: Priority</option><option value="due" ${state.filters.taskSort==='due'?'selected':''}>Sort: Due date</option><option value="created" ${state.filters.taskSort==='created'?'selected':''}>Sort: Newest</option></select><button class="btn btn-secondary" data-action="export-tasks-csv">CSV</button></div></div>
  <div class="task-list">${tasks.length?tasks.sort((a,b)=>(a.completed-b.completed)).map(taskRow).join(''):'<div class="card empty-state">No tasks match your filters.</div>'}</div>`;
}
function taskRow(t){const running=state.timer?.taskId===t.id;return `<article draggable="true" class="task-row ${t.completed?'is-complete':''}" data-task-id="${t.id}"><input type="checkbox" data-task-toggle="${t.id}" ${t.completed?'checked':''} aria-label="Mark ${escAttr(t.title)} complete"><div><h3 class="task-title">${esc(t.title)}</h3><div class="task-meta"><span class="badge badge-${t.priority}">${capitalize(t.priority)}</span><span>${t.status==='doing'?'In progress':t.completed?'Done':'To do'}</span>${t.dueDate?`<span>Due ${fmtDate(t.dueDate)}</span>`:''}${(t.tags||[]).map(tag=>`<span>#${esc(tag)}</span>`).join('')}<span>◷ ${minutesLabel(t.timeSpent||0)}</span></div></div><div class="task-actions"><button class="icon-btn" data-task-timer="${t.id}" aria-label="${running?'Stop':'Start'} timer">${running?'■':'▶'}</button><button class="icon-btn" data-task-edit="${t.id}" aria-label="Edit task">✎</button><button class="icon-btn" data-task-delete="${t.id}" aria-label="Delete task">×</button></div></article>`}

async function notesView(){
  const notes=(await getAllByOwner('notes',state.user.id)).sort((a,b)=>(b.pinned-a.pinned)||(b.updatedAt-a.updatedAt));
  return pageHeader('Notes','Write, tag, pin and search private notes.','Create note','new-note')+`<div class="toolbar"><div class="search"><span>⌕</span><input id="noteSearch" placeholder="Search notes"></div><button class="btn btn-secondary" data-action="export-notes-csv">CSV</button></div><div id="noteGrid" class="note-grid">${notes.length?notes.map(noteCard).join(''):'<div class="card empty-state">No notes yet.</div>'}</div>`;
}
function noteCard(n){return `<article class="item-card note-card" data-note-search="${escAttr((n.title+' '+n.content+' '+(n.tags||[]).join(' ')).toLowerCase())}"><div class="toolbar"><span class="badge ${n.pinned?'badge-medium':'badge-low'}">${n.pinned?'Pinned':'Note'}</span><div><button class="icon-btn" data-note-pin="${n.id}" aria-label="Pin note">⌖</button><button class="icon-btn" data-note-edit="${n.id}" aria-label="Edit note">✎</button><button class="icon-btn" data-note-delete="${n.id}" aria-label="Delete note">×</button></div></div><h3>${esc(n.title)}</h3><div class="markdown-preview">${markdown(n.content,180)}</div><div class="task-meta">${(n.tags||[]).map(t=>`<span>#${esc(t)}</span>`).join('')}<span>Updated ${relativeTime(n.updatedAt)}</span></div></article>`}

async function goalsView(){
  const goals=(await getAllByOwner('goals',state.user.id)).sort((a,b)=>(a.status==='completed')-(b.status==='completed')||(a.endDate||'9999').localeCompare(b.endDate||'9999'));
  return pageHeader('Goals','Turn outcomes into visible progress and deadlines.','Create goal','new-goal')+`<div class="goal-grid">${goals.length?goals.map(goalCard).join(''):'<div class="card empty-state">No goals yet.</div>'}</div>`;
}
function goalCard(g){return `<article class="item-card goal-card"><div class="toolbar"><span class="badge ${g.status==='completed'?'badge-low':'badge-medium'}">${capitalize(g.status||'active')}</span><div><button class="icon-btn" data-goal-edit="${g.id}">✎</button><button class="icon-btn" data-goal-delete="${g.id}">×</button></div></div><h3>${esc(g.title)}</h3><p>${esc(g.description||'No description')}</p><div class="progress"><span style="width:${num(g.progress)}%"></span></div><div class="toolbar"><span class="list-meta">${num(g.progress)}% complete</span><span class="list-meta">${g.endDate?'Due '+fmtDate(g.endDate):'No deadline'}</span></div></article>`}

async function habitsView(){
  const habits=await getAllByOwner('habits',state.user.id); const today=isoDate(new Date());
  return pageHeader('Habits','Build consistency with daily and weekly check-ins.','Create habit','new-habit')+`<div class="grid grid-4">${stat('↗',habits.length,'Tracked','Daily & weekly')}${stat('🔥',Math.max(0,...habits.map(h=>streak(h.history||[]))),'Best streak','Consecutive days')}${stat('✓',habits.filter(h=>(h.history||[]).includes(today)).length,'Done today','Current check-ins')}${stat('◫',habitConsistency(habits)+'%','Consistency','Last 30 days')}</div><div class="habit-list section">${habits.length?habits.map(habitRow).join(''):'<div class="card empty-state">No habits yet.</div>'}</div>`;
}
function habitRow(h){const days=lastNDays(7);return `<article class="habit-row"><div><div class="toolbar" style="margin:0"><div><h3 class="task-title">${esc(h.title)}</h3><div class="list-meta">${capitalize(h.frequency||'daily')}</div></div><div class="task-actions"><button class="icon-btn" data-habit-edit="${h.id}" aria-label="Edit habit">✎</button><button class="icon-btn" data-habit-delete="${h.id}" aria-label="Delete habit">×</button></div></div></div>${days.map(d=>`<button class="habit-check ${(h.history||[]).includes(d)?'is-complete':''}" data-habit-toggle="${h.id}" data-date="${d}" aria-label="Toggle ${fmtDate(d)}">${(h.history||[]).includes(d)?'✓':''}</button>`).join('')}<strong>🔥 ${streak(h.history||[])}</strong></article>`}

async function calendarView(){
  const events=await getAllByOwner('events',state.user.id); const tasks=await getAllByOwner('tasks',state.user.id); const d=state.calendarDate; const year=d.getFullYear(),month=d.getMonth(); const first=new Date(year,month,1), last=new Date(year,month+1,0); const leading=first.getDay(); const cells=[];
  for(let i=0;i<leading;i++)cells.push('<div class="calendar-day" aria-hidden="true"></div>');
  for(let day=1;day<=last.getDate();day++){const date=isoDate(new Date(year,month,day)); const dayEvents=events.filter(e=>e.date===date); const due=tasks.filter(t=>t.dueDate===date&&!t.completed); cells.push(`<button class="calendar-day ${date===isoDate(new Date())?'is-today':''}" data-calendar-date="${date}"><span class="calendar-number">${day}</span>${dayEvents.slice(0,2).map(e=>`<span class="calendar-event">${esc(e.title)}</span>`).join('')}${due.slice(0,2).map(t=>`<span class="calendar-event">✓ ${esc(t.title)}</span>`).join('')}</button>`)}
  return pageHeader('Calendar','Plan events and see task deadlines in one monthly view.','Create event','new-event')+`<article class="card calendar-shell"><div class="card-body"><div class="toolbar"><div class="toolbar-group"><button class="icon-btn" data-calendar-nav="prev">‹</button><button class="btn btn-secondary btn-sm" data-calendar-nav="today">Today</button><button class="icon-btn" data-calendar-nav="next">›</button></div><h3 class="card-title">${d.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h3><div class="toolbar-group"><button class="btn btn-secondary btn-sm" data-action="print-report">Print / PDF</button></div></div><div class="calendar-grid-wrap"><div class="calendar-grid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-weekday">${x}</div>`).join('')}${cells.join('')}</div></div></div></article><article class="card section"><div class="card-head"><div><h3 class="card-title">Events this month</h3><p class="card-subtitle">Edit or remove local calendar events</p></div></div><div class="card-body list">${events.filter(e=>{const x=new Date(e.date+'T00:00:00');return x.getFullYear()===year&&x.getMonth()===month}).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||'')).map(e=>`<div class="list-row"><div class="stat-icon">▦</div><div class="list-copy"><div class="list-title">${esc(e.title)}</div><div class="list-meta">${fmtDate(e.date)}${e.time?' · '+esc(e.time):''}</div></div><div class="task-actions"><button class="icon-btn" data-event-edit="${e.id}">✎</button><button class="icon-btn" data-event-delete="${e.id}">×</button></div></div>`).join('')||'<div class="empty-state">No events this month.</div>'}</div></article>`;
}

async function analyticsView(){
  const [tasks,goals,habits,notes]=await Promise.all(['tasks','goals','habits','notes'].map(s=>getAllByOwner(s,state.user.id))); const total=tasks.length||1; const completion=Math.round(tasks.filter(t=>t.completed).length/total*100); const goalAvg=goals.length?Math.round(goals.reduce((s,g)=>s+num(g.progress),0)/goals.length):0; const consistency=habitConsistency(habits); const time=tasks.reduce((s,t)=>s+(t.timeSpent||0),0);
  return pageHeader('Analytics','Local insights generated from your own productivity data.','','')+`<div class="grid grid-4">${stat('✓',completion+'%','Task completion',`${tasks.length} tasks`)}${stat('◷',minutesLabel(time),'Focused time','Tracked locally')}${stat('◎',goalAvg+'%','Goal progress',`${goals.length} goals`)}${stat('↗',consistency+'%','Habit consistency',`${habits.length} habits`)}</div><div class="grid grid-2 section"><article class="card"><div class="card-head"><div><h3 class="card-title">Work distribution</h3><p class="card-subtitle">Local totals</p></div></div><div class="card-body analytics-bars">${bar('Tasks',Math.min(100,tasks.length*8),tasks.length)}${bar('Notes',Math.min(100,notes.length*12),notes.length)}${bar('Goals',Math.min(100,goals.length*20),goals.length)}${bar('Habits',Math.min(100,habits.length*16),habits.length)}</div></article><article class="card"><div class="card-head"><div><h3 class="card-title">Smart suggestions</h3><p class="card-subtitle">Offline heuristic — no AI API required</p></div></div><div class="card-body list">${smartSuggestions(tasks,goals,habits).map(s=>`<div class="list-row"><div class="stat-icon">✦</div><div class="list-copy"><div class="list-title">${esc(s.title)}</div><div class="list-meta">${esc(s.text)}</div></div></div>`).join('')}</div></article></div>`;
}

async function teamView(){
  const team=await getAllByOwner('team',state.user.id); const isAdmin=state.user.role==='admin'||state.user.role==='demo';
  return pageHeader('Team','A local-only collaboration demo for portfolio purposes.',isAdmin?'Add member':'','new-member')+`<div class="card"><div class="card-body"><p class="page-description" style="margin:0"><strong>Portfolio note:</strong> GitHub Pages has no backend, so this Team view demonstrates roles, permissions and assignment UX locally. It does not claim real multi-device synchronization.</p></div></div><div class="team-grid section">${team.length?team.map(m=>`<article class="item-card member-card"><div class="avatar" style="margin-bottom:10px">${getInitials(m.name)}</div><h3>${esc(m.name)}</h3><p>${esc(m.email)}</p><div class="toolbar"><span class="badge badge-medium">${capitalize(m.role)}</span>${isAdmin?`<div><button class="icon-btn" data-member-edit="${m.id}">✎</button><button class="icon-btn" data-member-delete="${m.id}">×</button></div>`:''}</div></article>`).join(''):'<div class="card empty-state">No local team members.</div>'}</div>`;
}

async function settingsView(){
  const permission=('Notification'in window)?Notification.permission:'unsupported';
  return pageHeader('Settings','Customize appearance, notifications, data and backups.','','')+`<div class="settings-layout"><aside class="card settings-nav"><button class="is-active">Appearance</button><button>Notifications</button><button>Data & export</button><button>Shortcuts</button></aside><div class="settings-panel"><article class="card"><div class="card-head"><div><h3 class="card-title">Appearance</h3><p class="card-subtitle">Theme and accent color</p></div></div><div class="card-body"><div class="setting-row"><div><strong>Light / dark</strong><p>Persisted on this device.</p></div><button class="btn btn-secondary" data-action="toggle-theme">Toggle theme</button></div><div class="setting-row"><div><strong>Accent color</strong><p>Choose a FlowDesk accent.</p></div><div class="theme-swatches">${['#6d5dfc','#2563eb','#0f9f75','#db2777','#f97316'].map(c=>`<button class="theme-dot" data-accent="${c}" style="background:${c}" aria-label="Use ${c}"></button>`).join('')}</div></div></div></article>
  <article class="card"><div class="card-head"><div><h3 class="card-title">Notifications</h3><p class="card-subtitle">Browser permission: ${esc(permission)}</p></div></div><div class="card-body"><div class="setting-row"><div><strong>Browser notifications</strong><p>Optional reminders while FlowDesk is open or installed.</p></div><button class="btn btn-secondary" data-action="request-notifications">Enable</button></div></div></article>
  <article class="card"><div class="card-head"><div><h3 class="card-title">Data & export</h3><p class="card-subtitle">Everything stays browser-local.</p></div></div><div class="card-body"><div class="setting-row"><div><strong>JSON backup</strong><p>Export every module.</p></div><button class="btn btn-secondary" data-action="export-backup">Export</button></div><div class="setting-row"><div><strong>Restore backup</strong><p>Import a FlowDesk JSON backup.</p></div><button class="btn btn-secondary" data-action="restore-backup">Restore</button></div><div class="setting-row"><div><strong>Tasks CSV</strong><p>Spreadsheet-friendly export.</p></div><button class="btn btn-secondary" data-action="export-tasks-csv">Export</button></div><div class="setting-row"><div><strong>PDF report</strong><p>Uses the browser print dialog; choose Save as PDF.</p></div><button class="btn btn-secondary" data-action="print-report">Print / PDF</button></div>${state.user.id===DEMO_ID?`<div class="setting-row"><div><strong>Reset demo data</strong><p>Restore the portfolio sample workspace.</p></div><button class="btn btn-danger" data-action="reset-demo">Reset</button></div>`:''}</div></article>
  <article class="card"><div class="card-head"><div><h3 class="card-title">Install FlowDesk</h3><p class="card-subtitle">Install the PWA on supported browsers</p></div></div><div class="card-body"><div class="setting-row"><div><strong>Install app</strong><p>Available when your browser exposes the install prompt.</p></div><button class="btn btn-primary" data-action="install-app">Install</button></div></div></article><article class="card"><div class="card-head"><div><h3 class="card-title">Keyboard shortcuts</h3><p class="card-subtitle">Fast navigation</p></div></div><div class="card-body list"><div class="list-row"><strong>Ctrl/Cmd + K</strong><span class="list-meta">Search / command palette</span></div><div class="list-row"><strong>N</strong><span class="list-meta">Create item for current view</span></div><div class="list-row"><strong>G then T</strong><span class="list-meta">Go to Tasks</span></div><div class="list-row"><strong>G then C</strong><span class="list-meta">Go to Calendar</span></div><div class="list-row"><strong>Esc</strong><span class="list-meta">Close modal or drawer</span></div></div></article></div></div>`;
}

function pageHeader(title,desc,actionText,action){return `<header class="page-header"><div><p class="page-eyebrow">${ROUTES[state.route].eyebrow}</p><h2 class="page-title">${title}</h2><p class="page-description">${desc}</p></div>${actionText?`<div class="page-actions"><button class="btn btn-primary" data-action="${action}">${actionText}</button></div>`:''}</header>`}
function stat(icon,value,label,detail){return `<article class="stat-card"><div class="stat-icon">${icon}</div><div class="stat-value">${esc(String(value))}</div><div class="stat-label">${esc(label)}</div><span class="stat-detail">${esc(detail)}</span></article>`}
function taskMini(t){return `<div class="list-row"><input type="checkbox" data-task-toggle="${t.id}" ${t.completed?'checked':''}><div class="list-copy"><div class="list-title">${esc(t.title)}</div><div class="list-meta">${capitalize(t.priority)}${t.dueDate?' · '+fmtDate(t.dueDate):''}</div></div><span class="badge badge-${t.priority}">${capitalize(t.priority)}</span></div>`}
function bar(label,width,value){return `<div class="bar-row"><strong class="list-title">${label}</strong><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><span class="list-meta">${value}</span></div>`}
function activityBars(tasks,habits){const days=lastNDays(7);return `<div class="analytics-bars">${days.map(d=>{const count=tasks.filter(t=>t.completedAt?.slice(0,10)===d).length+habits.filter(h=>(h.history||[]).includes(d)).length;return bar(new Date(d+'T00:00:00').toLocaleDateString(undefined,{weekday:'short'}),Math.min(100,count*18),count)}).join('')}</div>`}
function smartSuggestions(tasks,goals,habits){const open=tasks.filter(t=>!t.completed), overdue=open.filter(t=>t.dueDate&&t.dueDate<isoDate(new Date())), high=open.filter(t=>t.priority==='high'); const lowGoal=goals.filter(g=>num(g.progress)<35); const missed=habits.filter(h=>!(h.history||[]).includes(isoDate(new Date()))); const out=[]; if(overdue.length)out.push({title:'Clear overdue work',text:`${overdue.length} task${overdue.length===1?' is':'s are'} overdue. Reschedule or finish them first.`}); if(high.length)out.push({title:'Protect focus time',text:`You have ${high.length} high-priority open task${high.length===1?'':'s'}. Consider one focused session.`}); if(lowGoal.length)out.push({title:'Advance a goal',text:`${lowGoal[0].title} is at ${num(lowGoal[0].progress)}%. Add one concrete next step.`}); if(missed.length)out.push({title:'Habit check-in',text:`${missed.length} habit${missed.length===1?'':'s'} still need today's check-in.`}); if(!out.length)out.push({title:'Momentum looks good',text:'No urgent local signals. Keep the current plan and avoid overloading today.'}); return out.slice(0,4)}

function delegateClick(e){
  if(e.target.closest('[data-close-modal]')||e.target.classList.contains('modal-backdrop')){closeModal();return} if(e.target.closest('[data-close-drawer]')){closeDrawer();return}
  const action=e.target.closest('[data-action]')?.dataset.action;if(action){handleAction(action);return}
  const route=e.target.closest('[data-command-route]')?.dataset.commandRoute;if(route){closeModal();location.hash=`#/${route}`;return}
  const id=(name)=>e.target.closest(`[data-${name}]`)?.dataset[toCamel(name)];
  if(id('task-edit')) return editTask(id('task-edit')); if(id('task-delete')) return deleteEntity('tasks',id('task-delete'),'Task'); if(id('task-timer')) return toggleTimer(id('task-timer'));
  if(id('note-edit')) return editNote(id('note-edit')); if(id('note-delete')) return deleteEntity('notes',id('note-delete'),'Note'); if(id('note-pin')) return pinNote(id('note-pin'));
  if(id('goal-edit')) return editGoal(id('goal-edit')); if(id('goal-delete')) return deleteEntity('goals',id('goal-delete'),'Goal');
  if(id('habit-edit')) return openHabitModal(id('habit-edit')); if(id('habit-delete')) return deleteEntity('habits',id('habit-delete'),'Habit');
  if(id('event-edit')) return openEventModal(id('event-edit')); if(id('event-delete')) return deleteEntity('events',id('event-delete'),'Event');
  if(id('member-edit')) return editMember(id('member-edit')); if(id('member-delete')) return deleteEntity('team',id('member-delete'),'Member');
  const habitBtn=e.target.closest('[data-habit-toggle]'); if(habitBtn) return toggleHabit(habitBtn.dataset.habitToggle,habitBtn.dataset.date);
  const cal=e.target.closest('[data-calendar-nav]'); if(cal){calendarNavigate(cal.dataset.calendarNav);return}
  const date=e.target.closest('[data-calendar-date]')?.dataset.calendarDate;if(date){openEventModal(null,date);return}
  const accent=e.target.closest('[data-accent]')?.dataset.accent;if(accent){state.accent=accent;localStorage.setItem(ACCENT_KEY,accent);applyAccent();toast('Accent updated',accent,'success')}
}
function delegateChange(e){
  if(e.target.matches('[data-task-toggle]')) toggleTask(e.target.dataset.taskToggle,e.target.checked);
  if(e.target.id==='taskPriorityFilter'){state.filters.taskPriority=e.target.value;renderRoute()}
  if(e.target.id==='taskStatusFilter'){state.filters.taskStatus=e.target.value;renderRoute()}
  if(e.target.id==='taskSort'){state.filters.taskSort=e.target.value;renderRoute()}
}
function delegateInput(e){
  if(e.target.id==='taskSearch'){state.filters.taskSearch=e.target.value;renderRoute();requestAnimationFrame(()=>{const i=$('#taskSearch');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}})}
  if(e.target.id==='noteSearch'){const q=e.target.value.toLowerCase();document.querySelectorAll('[data-note-search]').forEach(card=>card.hidden=!card.dataset.noteSearch.includes(q))}
  if(e.target.matches('[data-markdown-input]')){const preview=document.querySelector('[data-markdown-preview]');if(preview)preview.innerHTML=markdown(e.target.value)}
}
function delegateSubmit(e){
  const type=e.target.dataset.formType;if(!type)return; e.preventDefault(); const f=new FormData(e.target); submitEntity(type,f,e.target.dataset.editId||null);
}
function keyboardShortcuts(e){
  const typing=e.target.matches?.('input,textarea,select')||e.target.isContentEditable;
  if(e.key==='Escape'){closeModal();closeDrawer();closeSidebar();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommandPalette();return}
  if(!typing&&e.key.toLowerCase()==='n'){e.preventDefault();openCreateForRoute();return}
  if(!typing&&e.key.toLowerCase()==='g'){state._g=Date.now();return}
  if(!typing&&state._g&&Date.now()-state._g<900){if(e.key.toLowerCase()==='t')location.hash='#/tasks';if(e.key.toLowerCase()==='c')location.hash='#/calendar';state._g=0}
}
function handleAction(a){
  const map={'new-task':()=>openTaskModal(),'new-note':()=>openNoteModal(),'new-goal':()=>openGoalModal(),'new-habit':()=>openHabitModal(),'new-event':()=>openEventModal(),'new-member':()=>openMemberModal(),'toggle-theme':toggleTheme,'export-backup':exportBackup,'restore-backup':()=>els.restoreFile.click(),'export-tasks-csv':exportTasksCSV,'export-notes-csv':exportNotesCSV,'print-report':printReport,'request-notifications':requestNotifications,'install-app':installApp,'reset-demo':resetDemo}; map[a]?.();
}
function openCreateForRoute(){({dashboard:()=>openTaskModal(),tasks:()=>openTaskModal(),notes:()=>openNoteModal(),goals:()=>openGoalModal(),habits:()=>openHabitModal(),calendar:()=>openEventModal(),team:()=>openMemberModal()})[state.route]?.()}

async function openTaskModal(id=null){const t=id?await findById('tasks',id):null;openModal(formModal('task',id,'Task',`<div class="field"><label>Title</label><input name="title" required maxlength="140" value="${escAttr(t?.title||'')}"></div><div class="field"><label>Description</label><textarea name="description">${esc(t?.description||'')}</textarea></div><div class="grid grid-2"><div class="field"><label>Priority</label><select name="priority">${['high','medium','low'].map(v=>`<option value="${v}" ${t?.priority===v?'selected':''}>${capitalize(v)}</option>`).join('')}</select></div><div class="field"><label>Status</label><select name="status"><option value="todo" ${t?.status==='todo'?'selected':''}>To do</option><option value="doing" ${t?.status==='doing'?'selected':''}>In progress</option><option value="done" ${t?.status==='done'?'selected':''}>Done</option></select></div></div><div class="grid grid-2"><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${t?.dueDate||''}"></div><div class="field"><label>Tags (comma separated)</label><input name="tags" value="${escAttr((t?.tags||[]).join(', '))}"></div></div>`))}
async function openNoteModal(id=null){const n=id?await findById('notes',id):null;openModal(formModal('note',id,'Note',`<div class="field"><label>Title</label><input name="title" required maxlength="140" value="${escAttr(n?.title||'')}"></div><div class="grid grid-2 note-editor-grid"><div class="field"><label>Markdown content</label><textarea name="content" data-markdown-input style="min-height:260px">${esc(n?.content||'')}</textarea></div><div class="field"><label>Preview</label><div class="markdown-preview markdown-preview-panel" data-markdown-preview>${markdown(n?.content||'')}</div></div></div><div class="field"><label>Tags</label><input name="tags" value="${escAttr((n?.tags||[]).join(', '))}"></div><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="pinned" ${n?.pinned?'checked':''}> Pin note</label>`))}
async function openGoalModal(id=null){const g=id?await findById('goals',id):null;openModal(formModal('goal',id,'Goal',`<div class="field"><label>Title</label><input name="title" required value="${escAttr(g?.title||'')}"></div><div class="field"><label>Description</label><textarea name="description">${esc(g?.description||'')}</textarea></div><div class="grid grid-2"><div class="field"><label>Progress</label><input type="number" min="0" max="100" name="progress" value="${num(g?.progress||0)}"></div><div class="field"><label>Status</label><select name="status">${['active','completed','archived'].map(v=>`<option ${g?.status===v?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="grid grid-2"><div class="field"><label>Start date</label><input type="date" name="startDate" value="${g?.startDate||''}"></div><div class="field"><label>End date</label><input type="date" name="endDate" value="${g?.endDate||''}"></div></div>`))}
async function openHabitModal(id=null){const h=id?await findById('habits',id):null;openModal(formModal('habit',id,'Habit',`<div class="field"><label>Name</label><input name="title" required value="${escAttr(h?.title||'')}"></div><div class="field"><label>Frequency</label><select name="frequency"><option value="daily" ${h?.frequency==='daily'?'selected':''}>Daily</option><option value="weekly" ${h?.frequency==='weekly'?'selected':''}>Weekly</option></select></div>`))}
async function openEventModal(id=null,date=''){const ev=id?await findById('events',id):null;openModal(formModal('event',id,'Event',`<div class="field"><label>Title</label><input name="title" required value="${escAttr(ev?.title||'')}"></div><div class="grid grid-2"><div class="field"><label>Date</label><input type="date" name="date" required value="${ev?.date||date||isoDate(new Date())}"></div><div class="field"><label>Time</label><input type="time" name="time" value="${ev?.time||''}"></div></div><div class="field"><label>Notes</label><textarea name="notes">${esc(ev?.notes||'')}</textarea></div>`))}
async function openMemberModal(id=null){const m=id?await findById('team',id):null;openModal(formModal('member',id,'Team member',`<div class="field"><label>Name</label><input name="name" required value="${escAttr(m?.name||'')}"></div><div class="field"><label>Email</label><input type="email" name="email" required value="${escAttr(m?.email||'')}"></div><div class="field"><label>Role</label><select name="role">${['admin','member','viewer'].map(v=>`<option ${m?.role===v?'selected':''}>${v}</option>`).join('')}</select></div>`))}
function formModal(type,id,label,body){return `<div class="modal"><div class="modal-head"><div><h3 class="card-title">${id?'Edit':'Create'} ${label}</h3><p class="card-subtitle">Saved locally in IndexedDB</p></div><button class="icon-btn" data-close-modal>×</button></div><form class="modal-body stack" data-form-type="${type}" ${id?`data-edit-id="${id}"`:''}>${body}<div class="modal-foot" style="margin:17px -17px -17px"><button class="btn btn-secondary" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Save</button></div></form></div>`}
function openModal(html){els.modalRoot.innerHTML=`<div class="modal-backdrop">${html}</div>`;requestAnimationFrame(()=>els.modalRoot.querySelector('input,textarea,select')?.focus())}
function closeModal(){els.modalRoot.innerHTML=''}
function closeDrawer(){els.drawerRoot.innerHTML=''}
async function editTask(id){openTaskModal(id)} async function editNote(id){openNoteModal(id)} async function editGoal(id){openGoalModal(id)} async function editMember(id){openMemberModal(id)}

async function submitEntity(type,f,id){
  const map={task:'tasks',note:'notes',goal:'goals',habit:'habits',event:'events',member:'team'}; const store=map[type]; const old=id?await findById(store,id):{}; const now=Date.now(); let row={...old,id:id||uid(type),ownerId:state.user.id,createdAt:old.createdAt||now,updatedAt:now};
  if(type==='task'){row={...row,title:s(f,'title'),description:s(f,'description'),priority:s(f,'priority'),status:s(f,'status'),dueDate:s(f,'dueDate'),tags:tags(f.get('tags')),completed:s(f,'status')==='done',completedAt:s(f,'status')==='done'?(old.completedAt||new Date().toISOString()):null,timeSpent:old.timeSpent||0,order:old.order||now}}
  if(type==='note'){row={...row,title:s(f,'title'),content:s(f,'content'),tags:tags(f.get('tags')),pinned:f.get('pinned')==='on'}}
  if(type==='goal'){row={...row,title:s(f,'title'),description:s(f,'description'),progress:clamp(Number(f.get('progress')),0,100),status:s(f,'status'),startDate:s(f,'startDate'),endDate:s(f,'endDate')}}
  if(type==='habit'){row={...row,title:s(f,'title'),frequency:s(f,'frequency'),history:old.history||[]}}
  if(type==='event'){row={...row,title:s(f,'title'),date:s(f,'date'),time:s(f,'time'),notes:s(f,'notes')}}
  if(type==='member'){row={...row,name:s(f,'name'),email:s(f,'email'),role:s(f,'role')}}
  await put(store,row); await logActivity(`${id?'Updated':'Created'} ${type}`,row.title||row.name); closeModal(); toast(`${capitalize(type)} saved`,row.title||row.name,'success'); renderRoute();
}
async function deleteEntity(store,id,label){const row=await findById(store,id);if(!row||!confirm(`Delete "${row.title||row.name}"?`))return;await remove(store,id);await logActivity(`Deleted ${label.toLowerCase()}`,row.title||row.name);toast(`${label} deleted`,row.title||row.name,'warning');renderRoute()}
async function toggleTask(id,complete){const t=await findById('tasks',id);if(!t)return;t.completed=complete;t.status=complete?'done':'todo';t.completedAt=complete?new Date().toISOString():null;t.updatedAt=Date.now();await put('tasks',t);renderRoute()}
async function pinNote(id){const n=await findById('notes',id);if(!n)return;n.pinned=!n.pinned;n.updatedAt=Date.now();await put('notes',n);renderRoute()}
async function toggleHabit(id,date){const h=await findById('habits',id);if(!h)return;const set=new Set(h.history||[]);set.has(date)?set.delete(date):set.add(date);h.history=[...set].sort();h.updatedAt=Date.now();await put('habits',h);renderRoute()}
function calendarNavigate(dir){if(dir==='prev')state.calendarDate=new Date(state.calendarDate.getFullYear(),state.calendarDate.getMonth()-1,1);if(dir==='next')state.calendarDate=new Date(state.calendarDate.getFullYear(),state.calendarDate.getMonth()+1,1);if(dir==='today')state.calendarDate=new Date();renderRoute()}
async function findById(store,id){const rows=await getAllByOwner(store,state.user.id);return rows.find(r=>r.id===id)}

async function toggleTimer(taskId){
  if(state.timer?.taskId===taskId){stopTimer();return}
  stopTimer(); const task=await findById('tasks',taskId);if(!task)return; state.timer={taskId,startedAt:Date.now()}; state.timerTick=setInterval(()=>{document.title=`${Math.floor((Date.now()-state.timer.startedAt)/60000)}m — ${task.title}`},30000); toast('Timer started',task.title,'success');renderRoute();
}
async function stopTimer(silent=false){if(!state.timer)return;const elapsed=Math.max(1,Math.round((Date.now()-state.timer.startedAt)/60000));const task=await findById('tasks',state.timer.taskId);if(task){task.timeSpent=(task.timeSpent||0)+elapsed;task.updatedAt=Date.now();await put('tasks',task);if(!silent)toast('Timer stopped',`${elapsed} minute${elapsed===1?'':'s'} added to ${task.title}.`,'success')}clearInterval(state.timerTick);state.timer=null;state.timerTick=null;if(state.user&&!silent)renderRoute()}


function setupTaskDrag(){
  let dragged=null;
  document.querySelectorAll('[data-task-id]').forEach(row=>{
    row.addEventListener('dragstart',()=>{dragged=row.dataset.taskId;row.style.opacity='.55'});
    row.addEventListener('dragend',()=>{row.style.opacity='';dragged=null});
    row.addEventListener('dragover',e=>e.preventDefault());
    row.addEventListener('drop',async e=>{e.preventDefault();const target=row.dataset.taskId;if(!dragged||dragged===target)return;const rows=await getAllByOwner('tasks',state.user.id);const a=rows.find(x=>x.id===dragged),b=rows.find(x=>x.id===target);if(!a||!b)return;const temp=a.order||a.createdAt;a.order=b.order||b.createdAt;b.order=temp;await put('tasks',a);await put('tasks',b);renderRoute()});
  });
}

function openCommandPalette(){openModal(`<div class="modal"><div class="modal-head"><div><h3 class="card-title">Search FlowDesk</h3><p class="card-subtitle">Jump to any workspace area</p></div><button class="icon-btn" data-close-modal>×</button></div><div class="modal-body stack"><div class="search"><span>⌕</span><input id="commandSearch" placeholder="Search pages"></div><div id="commandResults" class="list">${Object.entries(ROUTES).map(([k,r])=>`<button class="list-row" data-command-route="${k}" data-command-text="${r.title.toLowerCase()}" style="text-align:left;cursor:pointer"><div class="stat-icon">${r.icon}</div><div class="list-copy"><div class="list-title">${r.title}</div><div class="list-meta">${r.eyebrow}</div></div></button>`).join('')}</div></div></div>`);requestAnimationFrame(()=>{$('#commandSearch')?.focus();$('#commandSearch')?.addEventListener('input',e=>document.querySelectorAll('[data-command-text]').forEach(x=>x.hidden=!x.dataset.commandText.includes(e.target.value.toLowerCase())))})}
async function openNotifications(){const items=(await getAllByOwner('activity',state.user.id)).sort((a,b)=>b.createdAt-a.createdAt).slice(0,20);els.drawerRoot.innerHTML=`<div class="drawer-backdrop" data-close-drawer></div><aside class="drawer"><div class="drawer-head"><div><h3 class="card-title">Notifications</h3><p class="card-subtitle">Recent local activity</p></div><button class="icon-btn" data-close-drawer>×</button></div><div class="drawer-body list">${items.length?items.map(x=>`<div class="list-row"><div class="stat-icon">•</div><div class="list-copy"><div class="list-title">${esc(x.action)}</div><div class="list-meta">${esc(x.detail||'')} · ${relativeTime(x.createdAt)}</div></div></div>`).join(''):'<div class="empty-state">No activity yet.</div>'}</div></aside>`;els.notificationDot.hidden=true}
function openProfile(){openModal(`<div class="modal"><div class="modal-head"><div><h3 class="card-title">Profile</h3><p class="card-subtitle">Local account</p></div><button class="icon-btn" data-close-modal>×</button></div><div class="modal-body stack"><div class="list-row"><span class="avatar">${getInitials(state.user.name)}</span><div class="list-copy"><div class="list-title">${esc(state.user.name)}</div><div class="list-meta">${esc(state.user.email)} · ${capitalize(state.user.role)}</div></div></div><button class="btn btn-secondary btn-block" data-action="export-backup">Export my data</button><button id="logoutBtn" class="btn btn-danger btn-block">Logout</button></div></div>`);requestAnimationFrame(()=>$('#logoutBtn')?.addEventListener('click',logout))}

function loadTheme(){state.theme=localStorage.getItem(THEME_KEY)||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');state.accent=localStorage.getItem(ACCENT_KEY)||'#6d5dfc';applyTheme();applyAccent()}
function toggleTheme(){state.theme=state.theme==='dark'?'light':'dark';localStorage.setItem(THEME_KEY,state.theme);applyTheme();toast('Theme updated',capitalize(state.theme)+' mode','success')}
function applyTheme(){document.documentElement.dataset.theme=state.theme;els.themeBtn.textContent=state.theme==='dark'?'☀':'☾';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',state.theme==='dark'?'#0f172a':state.accent)}
function applyAccent(){document.documentElement.style.setProperty('--primary',state.accent);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',state.theme==='dark'?'#0f172a':state.accent)}

async function exportBackup(){const data={version:1,exportedAt:new Date().toISOString(),owner:{id:state.user.id,name:state.user.name,email:state.user.email},data:{}};for(const s of STORE_NAMES)data.data[s]=await getAllByOwner(s,state.user.id);download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`flowdesk-backup-${isoDate(new Date())}.json`);toast('Backup exported','JSON download created.','success')}
async function restoreBackup(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;try{const parsed=JSON.parse(await file.text());if(!parsed?.data)throw new Error('Invalid FlowDesk backup');if(!confirm('Replace your current local FlowDesk data with this backup?'))return;for(const s of STORE_NAMES)await replaceOwnerData(s,state.user.id,parsed.data[s]||[]);toast('Backup restored','Your local data was replaced.','success');renderRoute()}catch(err){toast('Restore failed',err.message,'error')}}
async function exportTasksCSV(){const rows=await getAllByOwner('tasks',state.user.id);exportCSV(rows,'flowdesk-tasks.csv')}
async function exportNotesCSV(){const rows=await getAllByOwner('notes',state.user.id);exportCSV(rows,'flowdesk-notes.csv')}
function exportCSV(rows,name){if(!rows.length){toast('Nothing to export','This section is empty.','warning');return}const keys=[...new Set(rows.flatMap(Object.keys))].filter(k=>k!=='ownerId');const escCsv=v=>`"${String(Array.isArray(v)?v.join('|'):v??'').replaceAll('"','""')}"`;const csv=[keys.map(escCsv).join(','),...rows.map(r=>keys.map(k=>escCsv(r[k])).join(','))].join('\n');download(new Blob([csv],{type:'text/csv'}),name)}
async function printReport(){const [tasks,goals,habits]=await Promise.all(['tasks','goals','habits'].map(s=>getAllByOwner(s,state.user.id)));const w=open('','_blank');w.document.write(`<!doctype html><title>FlowDesk Report</title><style>body{font-family:Arial;padding:36px;color:#111}h1{margin-bottom:4px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.card{border:1px solid #ddd;border-radius:12px;padding:16px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{text-align:left;border-bottom:1px solid #ddd;padding:8px;font-size:12px}@media print{button{display:none}}</style><h1>FlowDesk Productivity Report</h1><p>${new Date().toLocaleString()}</p><div class="grid"><div class="card"><strong>${tasks.length}</strong><br>Tasks</div><div class="card"><strong>${goals.length}</strong><br>Goals</div><div class="card"><strong>${habitConsistency(habits)}%</strong><br>Habit consistency</div></div><table><thead><tr><th>Task</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead><tbody>${tasks.map(t=>`<tr><td>${esc(t.title)}</td><td>${esc(t.priority)}</td><td>${t.completed?'Done':esc(t.status)}</td><td>${esc(t.dueDate||'')}</td></tr>`).join('')}</tbody></table><script>onload=()=>print()<\/script>`);w.document.close()}
async function installApp(){if(!state.installPrompt){toast('Install prompt unavailable','Use your browser menu to install FlowDesk if supported.','warning');return}state.installPrompt.prompt();await state.installPrompt.userChoice;state.installPrompt=null}
async function requestNotifications(){if(!('Notification'in window)){toast('Unavailable','This browser does not support notifications.','warning');return}const p=await Notification.requestPermission();toast('Notification permission',p,p==='granted'?'success':'warning');if(p==='granted')new Notification('FlowDesk',{body:'Notifications are enabled.'})}
async function resetDemo(){if(state.user.id!==DEMO_ID||!confirm('Reset the demo workspace?'))return;for(const s of STORE_NAMES){const rows=await getAllByOwner(s,DEMO_ID);for(const r of rows)await remove(s,r.id)}await seedDemo();toast('Demo reset','Sample data restored.','success');renderRoute()}

async function seedDemo(){
  const existing=await getAllByOwner('tasks',DEMO_ID);if(existing.length)return;const ownerId=DEMO_ID, now=Date.now(), today=new Date();
  const sample={tasks:[
    {id:'d-task1',ownerId,title:'Finalize FlowDesk responsive polish',description:'Review mobile spacing, navigation and empty states.',priority:'high',status:'doing',completed:false,dueDate:isoDate(today),tags:['portfolio','frontend'],timeSpent:42,order:1,createdAt:now-800000,updatedAt:now-300000},
    {id:'d-task2',ownerId,title:'Write GitHub README project walkthrough',description:'Explain architecture, features and deployment.',priority:'medium',status:'todo',completed:false,dueDate:isoDate(addDays(today,2)),tags:['docs'],timeSpent:15,order:2,createdAt:now-700000,updatedAt:now-250000},
    {id:'d-task3',ownerId,title:'Review weekly priorities',description:'Pick the three highest impact tasks.',priority:'high',status:'done',completed:true,completedAt:addDays(today,-1).toISOString(),dueDate:isoDate(addDays(today,-1)),tags:['planning'],timeSpent:20,order:3,createdAt:now-900000,updatedAt:now-400000},
    {id:'d-task4',ownerId,title:'Practice modular JavaScript',description:'Refactor one workflow into reusable functions.',priority:'low',status:'todo',completed:false,dueDate:isoDate(addDays(today,4)),tags:['learning'],timeSpent:30,order:4,createdAt:now-500000,updatedAt:now-200000}],
    notes:[{id:'d-note1',ownerId,title:'FlowDesk product vision',content:'A private, offline-first workspace combining tasks, notes, goals, habits, calendar planning and analytics without requiring a backend.',tags:['product','portfolio'],pinned:true,createdAt:now-700000,updatedAt:now-100000},{id:'d-note2',ownerId,title:'Interview talking points',content:'Explain IndexedDB, PWA caching, responsive navigation, local authentication, state management and tradeoffs of a frontend-only architecture.',tags:['career'],pinned:false,createdAt:now-600000,updatedAt:now-90000}],
    goals:[{id:'d-goal1',ownerId,title:'Launch FlowDesk portfolio project',description:'Finish, test, document and deploy FlowDesk on GitHub Pages.',progress:72,status:'active',startDate:isoDate(addDays(today,-20)),endDate:isoDate(addDays(today,14)),createdAt:now-800000,updatedAt:now-100000},{id:'d-goal2',ownerId,title:'Strengthen JavaScript architecture skills',description:'Practice modules, browser APIs and offline data modeling.',progress:55,status:'active',startDate:isoDate(addDays(today,-30)),endDate:isoDate(addDays(today,30)),createdAt:now-700000,updatedAt:now-120000}],
    habits:[{id:'d-habit1',ownerId,title:'Plan the day',frequency:'daily',history:lastNDays(9).filter((_,i)=>i!==2),createdAt:now-700000,updatedAt:now-50000},{id:'d-habit2',ownerId,title:'Practice coding',frequency:'daily',history:lastNDays(12),createdAt:now-650000,updatedAt:now-40000},{id:'d-habit3',ownerId,title:'Review goals',frequency:'weekly',history:[isoDate(addDays(today,-7)),isoDate(today)],createdAt:now-600000,updatedAt:now-30000}],
    events:[{id:'d-event1',ownerId,title:'Portfolio review',date:isoDate(addDays(today,1)),time:'10:00',notes:'Review FlowDesk presentation.',createdAt:now-500000,updatedAt:now-30000},{id:'d-event2',ownerId,title:'Weekly planning',date:isoDate(addDays(today,3)),time:'09:00',notes:'Plan next week.',createdAt:now-400000,updatedAt:now-20000}],
    team:[{id:'d-member1',ownerId,name:'Sayed Sadat',email:'demo-owner@flowdesk.local',role:'admin',createdAt:now},{id:'d-member2',ownerId,name:'Maya Chen',email:'maya@example.local',role:'member',createdAt:now},{id:'d-member3',ownerId,name:'Noah Williams',email:'noah@example.local',role:'viewer',createdAt:now}],
    activity:[{id:'d-act1',ownerId,action:'Demo workspace created',detail:'Starter productivity data loaded',createdAt:now-50000},{id:'d-act2',ownerId,action:'Completed task',detail:'Review weekly priorities',createdAt:now-100000}]
  };
  for(const [store,rows] of Object.entries(sample))for(const row of rows)await put(store,row);
}
async function ensureUserStarterData(){const tasks=await getAllByOwner('tasks',state.user.id);if(tasks.length)return;await put('activity',{id:uid('activity'),ownerId:state.user.id,action:'Workspace created',detail:'Welcome to FlowDesk',createdAt:Date.now()})}
async function logActivity(action,detail){await put('activity',{id:uid('activity'),ownerId:state.user.id,action,detail,createdAt:Date.now()});els.notificationDot.hidden=false}

function toast(title,message,type='info'){const el=document.createElement('article');el.className='toast';el.innerHTML=`<div class="stat-icon">${type==='success'?'✓':type==='error'?'×':'!'}</div><div><strong>${esc(title)}</strong><p>${esc(message)}</p></div><button class="icon-btn" aria-label="Dismiss">×</button>`;el.querySelector('button').onclick=()=>el.remove();els.toastRoot.append(el);setTimeout(()=>el.remove(),4300)}
function fatal(err){console.error(err);document.body.innerHTML=`<main class="empty-state"><div><h1>FlowDesk could not start</h1><p>${esc(err?.message||String(err))}</p><button class="btn btn-primary" onclick="location.reload()">Reload</button></div></main>`}
function writeLocal(k,v){localStorage.setItem(k,JSON.stringify(v))} function readLocal(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
function uid(p='id'){return crypto.randomUUID?.()||`${p}-${Date.now()}-${Math.random().toString(16).slice(2)}`}
function s(f,k){return String(f.get(k)||'').trim()} function tags(v){return String(v||'').split(',').map(x=>x.trim()).filter(Boolean)}
function esc(v){const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML} function escAttr(v){return esc(v).replaceAll('"','&quot;')}
function capitalize(v=''){return v?String(v)[0].toUpperCase()+String(v).slice(1):''} function firstName(v=''){return v.trim().split(/\s+/)[0]||'there'} function getInitials(v=''){return v.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'FD'}
function isoDate(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`} function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x} function lastNDays(n){return Array.from({length:n},(_,i)=>isoDate(addDays(new Date(),-(n-1-i))))}
function fmtDate(v){if(!v)return'';return new Date(v+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:new Date(v+'T00:00:00').getFullYear()!==new Date().getFullYear()?'numeric':undefined})}
function relativeTime(ts){const m=Math.round((Date.now()-Number(ts))/60000);if(m<1)return'just now';if(m<60)return`${m}m ago`;const h=Math.round(m/60);if(h<24)return`${h}h ago`;return`${Math.round(h/24)}d ago`}
function truncate(v,n){v=String(v||'');return v.length>n?v.slice(0,n).trim()+'…':v} function clamp(n,a,b){return Math.min(Math.max(Number(n)||0,a),b)} function num(v){return clamp(v,0,100)} function priorityValue(v){return v==='high'?3:v==='medium'?2:1}
function minutesLabel(m){m=Number(m)||0;return m>=60?`${Math.floor(m/60)}h ${m%60}m`:`${m}m`} function dayPart(){const h=new Date().getHours();return h<12?'morning':h<17?'afternoon':'evening'}
function streak(history){const set=new Set(history||[]);let n=0;for(let i=0;i<365;i++){const d=isoDate(addDays(new Date(),-i));if(set.has(d))n++;else if(i===0)continue;else break}return n}
function habitConsistency(habits){if(!habits.length)return 0;const days=lastNDays(30);let hits=0;for(const h of habits)for(const d of days)if((h.history||[]).includes(d))hits++;return Math.round(hits/(habits.length*30)*100)}
function productivityScore(tasks,goals,habits){const task=tasks.length?tasks.filter(t=>t.completed).length/tasks.length:0;const goal=goals.length?goals.reduce((s,g)=>s+num(g.progress),0)/(goals.length*100):0;const hist=habitConsistency(habits)/100;return Math.round((task*.4+goal*.3+hist*.3)*100)}
function markdown(value,limit=0){let text=String(value||'');if(limit)text=truncate(text,limit);text=esc(text);text=text.replace(/^### (.+)$/gm,'<h4>$1</h4>').replace(/^## (.+)$/gm,'<h3>$1</h3>').replace(/^# (.+)$/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/^- (.+)$/gm,'• $1').replace(/\n/g,'<br>');return text}
function toCamel(v){return v.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())}
function download(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}

if('serviceWorker'in navigator) addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.info));
