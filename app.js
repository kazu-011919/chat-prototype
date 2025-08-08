// Simple local prototype chat app - stores data in localStorage
const LS_USERS = 'proto_users_v1';
const LS_MESSAGES = 'proto_messages_v1';
const LS_CALENDAR = 'proto_calendar_v1';

const defaultUsers = [
  {id: 'u1', name: '山田利至', role: 'admin', password: 'admin123'},
  {id: 'u2', name: '倉田健太', role: 'kicho', password: 'kenta2025'},
  {id: 'u3', name: '安藤正樹', role: 'kacho', password: 'ando1234'},
  {id: 'u4', name: '小林茂光', role: 'bancho', password: 'kobayashi1'},
];

function loadData() {
  const users = JSON.parse(localStorage.getItem(LS_USERS) || 'null');
  if(!users) {
    localStorage.setItem(LS_USERS, JSON.stringify(defaultUsers));
  }
  if(!localStorage.getItem(LS_MESSAGES)) localStorage.setItem(LS_MESSAGES, JSON.stringify([]));
  if(!localStorage.getItem(LS_CALENDAR)) localStorage.setItem(LS_CALENDAR, JSON.stringify([{id:'e1', title:'対策書作成', until:'2025-08-30'}]));
}
loadData();

let currentUser = null;
let currentGroup = 'general';

function $(id){return document.getElementById(id)}

// populate user select
function refreshUserSelect(){
  const sel = $('user-select');
  sel.innerHTML = '<option value="">--選択--</option>';
  const users = JSON.parse(localStorage.getItem(LS_USERS));
  users.forEach(u=>{
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.name + ' (' + roleLabel(u.role) + ')';
    sel.appendChild(opt);
  });
}
refreshUserSelect();

// login
$('login-btn').addEventListener('click', ()=>{
  const selVal = $('user-select').value;
  const nameInput = $('name-input').value.trim();
  const pass = $('password-input').value;
  const users = JSON.parse(localStorage.getItem(LS_USERS));
  let user = null;
  if(selVal){
    user = users.find(u=>u.id===selVal);
    if(!user){alert('ユーザーが見つかりません');return;}
    if(user.password !== pass){alert('パスワード違い');return;}
  } else {
    // login by name
    if(!nameInput){alert('氏名を選択するか入力してください');return;}
    user = users.find(u=>u.name===nameInput);
    if(!user){alert('登録されていない氏名です。管理者に追加依頼してください');return;}
    if(user.password !== pass){alert('パスワード違い');return;}
  }
  currentUser = user;
  $('login-section').classList.add('hidden');
  $('app-section').classList.remove('hidden');
  $('user-info').textContent = currentUser.name + ' (' + roleLabel(currentUser.role) + ')';
  if(currentUser.role==='admin') $('admin-panel').style.display='block';
  renderUsers();
  renderCalendar();
  showGroup('general');
});

// logout
$('logout-btn').addEventListener('click', ()=>{
  location.reload();
});

// group buttons
document.querySelectorAll('.group-btn').forEach(b=>{
  b.addEventListener('click', ()=> showGroup(b.dataset.group));
});

function roleLabel(r){
  if(r==='admin') return '管理者';
  if(r==='kicho') return '機長';
  if(r==='kacho') return '係長';
  if(r==='bancho') return '班長';
  return '一般';
}

// show group
function showGroup(g){
  currentGroup = g;
  $('chat-title').textContent = g==='general' ? '一般' : (g==='kacho' ? '係長' : '機長・班長');
  $('chat-role-badge').innerHTML = '<span class="badge ' + (g==='general'?'general':(g==='kacho'?'kacho':'kicho')) + '">' + $('chat-title').textContent + '</span>';
  renderMessages();
}

// messages
function renderMessages(){
  const msgs = JSON.parse(localStorage.getItem(LS_MESSAGES));
  const box = $('messages');
  box.innerHTML = '';
  const filtered = msgs.filter(m=>m.target === currentGroup || (m.target==='general' && currentGroup==='general'));
  filtered.forEach(m=>{
    // visibility: check if currentUser can view
    if(!canViewMessage(m)) return;
    const div = document.createElement('div');
    div.className='message';
    const meta = document.createElement('div');
    meta.className='msg-meta';
    meta.innerHTML = '<strong>' + m.senderName + '</strong> <span>(' + m.senderRoleLabel + ')</span>　' + new Date(m.time).toLocaleString();
    const text = document.createElement('div');
    text.className='msg-text';
    text.textContent = m.text || '';
    div.appendChild(meta);
    div.appendChild(text);
    if(m.file){
      const a = document.createElement('a');
      a.href = m.file.data;
      a.download = m.file.name;
      a.textContent = '📎 ' + m.file.name;
      a.style.display='block';
      div.appendChild(a);
    }
    const readInfo = document.createElement('div');
    readInfo.className='msg-meta';
    readInfo.textContent = '既読：' + (m.readBy?m.readBy.length:0) + ' 人';
    div.appendChild(readInfo);
    box.appendChild(div);
    // mark read
    markRead(m.id);
  });
  box.scrollTop = box.scrollHeight;
}

// permission to view message
function canViewMessage(m){
  // general visible to all
  if(m.target === 'general') return true;
  // kacho visible to kacho, kicho, bancho, admin
  if(m.target === 'kacho'){
    return ['kacho','kicho','bancho','admin'].includes(currentUser.role);
  }
  if(m.target === 'kicho'){
    return ['kicho','bancho','kacho','admin'].includes(currentUser.role);
  }
  return true;
}

// send
$('send-btn').addEventListener('click', async ()=>{
  const text = $('message-input').value.trim();
  const target = $('target-select').value;
  if(!currentUser){alert('ログインしてください');return;}
  // check send permission: enforce rules
  if(!canSendTo(target, currentUser.role)){ alert('この職制からは選択した配信先には送信できません'); return; }
  const fileInput = $('file-input');
  let fileData = null;
  if(fileInput.files && fileInput.files[0]){
    const f = fileInput.files[0];
    const fr = new FileReader();
    fileData = await new Promise((res)=>{ fr.onload = ()=> res({name:f.name,data:fr.result}); fr.readAsDataURL(f); });
  }
  const msgs = JSON.parse(localStorage.getItem(LS_MESSAGES));
  const id = 'm'+(Date.now());
  const m = {id, senderId: currentUser.id, senderName: currentUser.name, senderRole: currentUser.role, senderRoleLabel: roleLabel(currentUser.role), target, text, time: new Date().toISOString(), file: fileData, readBy: []};
  msgs.push(m);
  localStorage.setItem(LS_MESSAGES, JSON.stringify(msgs));
  $('message-input').value='';
  $('file-input').value='';
  renderMessages();
});

// send permission logic
function canSendTo(target, role){
  // general: any role can send to general
  if(target==='general') return true;
  if(role==='admin') return true;
  if(role==='kacho' && target==='kacho') return true;
  if((role==='kicho' || role==='bancho') && target==='kicho') return true;
  // 係長 should only send to kacho? spec earlier: 係長 -> 係長のみ
  if(role==='kacho' && target==='general') return true;
  return false;
}

// mark read
function markRead(msgId){
  const msgs = JSON.parse(localStorage.getItem(LS_MESSAGES));
  const m = msgs.find(x=>x.id===msgId);
  if(!m) return;
  if(!m.readBy) m.readBy=[];
  if(!m.readBy.includes(currentUser.id)){
    m.readBy.push(currentUser.id);
    localStorage.setItem(LS_MESSAGES, JSON.stringify(msgs));
  }
  renderUsers();
}

// users list
function renderUsers(){
  const ul = $('user-list');
  ul.innerHTML = '';
  const users = JSON.parse(localStorage.getItem(LS_USERS));
  users.forEach(u=>{
    const p = document.createElement('p');
    p.textContent = u.name + ' (' + roleLabel(u.role) + ')';
    ul.appendChild(p);
  });
}

// admin user management
$('open-user-mgmt').addEventListener('click', ()=>{
  $('user-mgmt-modal').classList.remove('hidden');
  refreshMgmtList();
});

$('mgmt-close').addEventListener('click', ()=> $('user-mgmt-modal').classList.add('hidden'));

$('mgmt-add').addEventListener('click', ()=>{
  const name = $('mgmt-name').value.trim();
  const role = $('mgmt-role').value;
  const pass = $('mgmt-pass').value;
  if(!name || !pass){alert('名前とパスワードを入力してください');return;}
  const users = JSON.parse(localStorage.getItem(LS_USERS));
  const id = 'u'+(Date.now());
  users.push({id,name,role,password:pass});
  localStorage.setItem(LS_USERS, JSON.stringify(users));
  $('mgmt-name').value='';$('mgmt-pass').value='';
  refreshUserSelect();
  refreshMgmtList();
  renderUsers();
});

function refreshMgmtList(){
  const div = $('mgmt-list');
  const users = JSON.parse(localStorage.getItem(LS_USERS));
  div.innerHTML = '';
  users.forEach((u,idx)=>{
    const row = document.createElement('div');
    row.style.borderTop='1px solid #eee';row.style.padding='6px 0';
    row.innerHTML = '<strong>'+u.name+'</strong> ('+roleLabel(u.role)+') <button data-idx="'+idx+'" class="del-user">削除</button>';
    div.appendChild(row);
  });
  document.querySelectorAll('.del-user').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const idx = Number(e.target.dataset.idx);
      const users = JSON.parse(localStorage.getItem(LS_USERS));
      users.splice(idx,1);
      localStorage.setItem(LS_USERS, JSON.stringify(users));
      refreshUserSelect();
      refreshMgmtList();
      renderUsers();
    });
  });
}

// calendar
function renderCalendar(){
  const cal = JSON.parse(localStorage.getItem(LS_CALENDAR));
  const list = $('calendar-list');
  list.innerHTML = '';
  cal.forEach(ev=>{
    const li = document.createElement('li');
    li.textContent = ev.title + ' 〜' + ev.until;
    list.appendChild(li);
  });
}

// show mgmt only for admin
refreshUserSelect();
refreshMgmtList();
renderUsers();
renderCalendar();
