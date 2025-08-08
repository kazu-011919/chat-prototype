// ==== ユーザーデータ（サンプル）====
let users = [
  { name: '山田利至', role: 'admin', password: '1234' },
  { name: '倉田健太', role: 'kicho', password: '1234' },
  { name: '安藤正樹', role: 'kacho', password: '1234' },
  { name: '小林茂光', role: 'bancho', password: '1234' },
  { name: '佐藤花子', role: 'general', password: '1234' },
  { name: '高橋次郎', role: 'general', password: '1234' }
];

// ==== メッセージデータ ====
let messages = [];

// ==== 現在のログインユーザー ====
let currentUser = null;

// ==== 職制ラベル ====
function roleLabel(role) {
  if (role === 'admin') return '管理者';
  if (role === 'kacho') return '係長';
  if (role === 'kicho') return '機長';
  if (role === 'bancho') return '班長';
  return '一般';
}

// ==== 職制ランク（高いほど権限大） ====
function roleRank(r) {
  if (r === 'admin') return 4;
  if (r === 'kacho') return 3;
  if (r === 'kicho' || r === 'bancho') return 2;
  return 1;
}

// ==== ターゲットランク ====
function targetRank(t) {
  if (t === 'general') return 1;
  if (t === 'kicho' || t === 'bancho') return 2;
  if (t === 'kacho') return 3;
  if (t === 'admin') return 4;
  return 1;
}

// ==== 表示可否 ====
function canViewMessage(m) {
  if (!currentUser) return false;
  const userRank = roleRank(currentUser.role);
  const trgRank = targetRank(m.target);
  return userRank >= trgRank;
}

// ==== 送信可否 ====
function canSendTo(targetRole) {
  if (!currentUser) return false;
  const userRank = roleRank(currentUser.role);
  const trgRank = targetRank(targetRole);
  return userRank >= trgRank;
}

// ==== ログイン処理 ====
function login(name, password) {
  const user = users.find(u => u.name === name && u.password === password);
  if (user) {
    currentUser = user;
    renderChat();
    return true;
  }
  return false;
}

// ==== メッセージ送信 ====
function sendMessage(text, target) {
  if (!canSendTo(target)) {
    alert('この職制には送信できません');
    return;
  }
  messages.push({
    sender: currentUser.name,
    senderRole: currentUser.role,
    text: text,
    target: target,
    time: new Date()
  });
  renderChat();
}

// ==== チャット表示 ====
function renderChat() {
  const chatBox = document.getElementById('chat');
  chatBox.innerHTML = '';
  messages
    .filter(m => canViewMessage(m))
    .forEach(m => {
      const div = document.createElement('div');
      div.textContent = `[${roleLabel(m.senderRole)}] ${m.sender}: ${m.text} (${m.time.toLocaleString()})`;
      chatBox.appendChild(div);
    });
}

// ==== 管理者メニュー ====
function renderAdminMenu() {
  if (currentUser && currentUser.role === 'admin') {
    const adminBox = document.getElementById('admin');
    adminBox.innerHTML = '<h3>管理者メニュー</h3>';
    users.forEach(u => {
      const p = document.createElement('p');
      p.textContent = `${u.name} (${roleLabel(u.role)}) / パスワード: ${u.password}`;
      adminBox.appendChild(p);
    });
  }
}

// ==== 初期化 ====
document.getElementById('loginBtn').onclick = () => {
  const name = document.getElementById('name').value;
  const pass = document.getElementById('pass').value;
  if (login(name, pass)) {
    renderAdminMenu();
  } else {
    alert('ログイン失敗');
  }
};

document.getElementById('sendBtn').onclick = () => {
  const text = document.getElementById('message').value;
  const target = document.getElementById('target').value;
  sendMessage(text, target);
  document.getElementById('message').value = '';
};