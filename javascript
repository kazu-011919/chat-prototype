// ユーザーデータ
let users = [
    { name: "課長", role: "admin", password: "1234" },
    { name: "係長A", role: "kakaricho", password: "1234" },
    { name: "機長B", role: "kicho", password: "1234" },
    { name: "班長C", role: "hancho", password: "1234" },
    { name: "一般D", role: "ippan", password: "1234" }
];

// ログイン中ユーザー
let currentUser = null;

// メッセージ履歴
let messages = [];

// ロールの優先度
const rolePriority = {
    "admin": 4,     // 課長
    "kakaricho": 3, // 係長
    "kicho": 2,     // 機長
    "hancho": 2,    // 班長
    "ippan": 1      // 一般
};

// ログイン処理
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const user = users.find(u => u.name === username && u.password === password);

    if (user) {
        currentUser = user;
        document.getElementById("login-container").style.display = "none";
        document.getElementById("chat-container").style.display = "block";

        document.getElementById("user-role").innerText = 
            user.role === "admin" ? "課長" : user.name;
        
        updateUserList();
        updateMessageList();
    } else {
        alert("名前またはパスワードが違います。");
    }
}

// メッセージ送信
function sendMessage() {
    const text = document.getElementById("message").value.trim();
    const limitRole = document.getElementById("role-limit").value;

    if (!text) return;

    const newMessage = {
        sender: currentUser.name,
        role: currentUser.role,
        text: text,
        limitRole: limitRole || null,
        time: new Date().toLocaleString()
    };

    messages.push(newMessage);
    document.getElementById("message").value = "";

    updateMessageList();
}

// メッセージ表示更新
function updateMessageList() {
    const messageList = document.getElementById("message-list");
    messageList.innerHTML = "";

    messages.forEach(msg => {
        if (!msg.limitRole || rolePriority[currentUser.role] >= rolePriority[msg.limitRole]) {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${msg.sender}</strong> (${msg.time}): ${msg.text}`;
            messageList.appendChild(div);
        }
    });
}

// ユーザー一覧更新
function updateUserList() {
    const list = document.getElementById("user-list");
    list.innerHTML = "";

    users.forEach(u => {
        const li = document.createElement("li");
        li.textContent = `${u.name} (${u.role === "admin" ? "課長" : u.role})`;
        list.appendChild(li);
    });
}

// パスワード変更（課長のみ）
function changePassword(targetName, newPass) {
    if (currentUser.role !== "admin") {
        alert("パスワード変更は課長のみ可能です。");
        return;
    }
    const user = users.find(u => u.name === targetName);
    if (user) {
        user.password = newPass;
        alert(`${user.name} のパスワードを変更しました`);
    }
}

// 名前変更（課長のみ）
function changeName(oldName, newName) {
    if (currentUser.role !== "admin") {
        alert("名前変更は課長のみ可能です。");
        return;
    }
    const user = users.find(u => u.name === oldName);
    if (user) {
        user.name = newName;
        alert(`名前を ${newName} に変更しました`);
        updateUserList();
    }
}

// ログアウト
function logout() {
    currentUser = null;
    document.getElementById("chat-container").style.display = "none";
    document.getElementById("login-container").style.display = "block";
}