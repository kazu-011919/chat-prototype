// ユーザー情報
const users = [
    { name: "山田利至", role: "管理者", password: "1234" },
    { name: "倉田健太", role: "機長班長", password: "1234" },
    { name: "安藤正樹", role: "係長", password: "1234" },
    { name: "小林茂光", role: "機長班長", password: "1234" }
];

// 職制の順序（権限順）
const roleOrder = ["管理者", "係長", "機長班長", "一般"];

let currentUser = null;

// DOM取得
const roleSelect = document.getElementById("role-select");
const nameSelect = document.getElementById("name-select");
const loginBtn = document.getElementById("login-btn");
const passwordInput = document.getElementById("password");
const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const userInfo = document.getElementById("user-info");
const logoutBtn = document.getElementById("logout-btn");
const editPassBtn = document.getElementById("edit-pass-btn");
const chatArea = document.getElementById("chat-area");
const targetGroup = document.getElementById("target-group");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send-btn");

// 職制をセット
[...new Set(users.map(u => u.role))].forEach(role => {
    const opt = document.createElement("option");
    opt.value = role;
    opt.textContent = role;
    roleSelect.appendChild(opt);
});

// 職制選択で名前プルダウン更新
roleSelect.addEventListener("change", () => {
    nameSelect.innerHTML = "";
    if (roleSelect.value === "") {
        nameSelect.disabled = true;
        const opt = document.createElement("option");
        opt.textContent = "職制を先に選んでください";
        nameSelect.appendChild(opt);
        return;
    }
    nameSelect.disabled = false;
    users.filter(u => u.role === roleSelect.value)
        .forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.name;
            opt.textContent = u.name;
            nameSelect.appendChild(opt);
        });
});

// ログイン処理
loginBtn.addEventListener("click", () => {
    const name = nameSelect.value;
    const pass = passwordInput.value;
    const user = users.find(u => u.name === name && u.password === pass);

    if (!user) {
        alert("名前またはパスワードが違います");
        return;
    }
    currentUser = user;
    userInfo.textContent = `${user.role}：${user.name}`;
    loginScreen.style.display = "none";
    chatScreen.style.display = "block";

    // 管理者だけパスワード編集ボタン表示
    if (user.role === "管理者") {
        editPassBtn.style.display = "inline-block";
    }
});

// ログアウト
logoutBtn.addEventListener("click", () => {
    currentUser = null;
    passwordInput.value = "";
    roleSelect.value = "";
    nameSelect.innerHTML = "";
    nameSelect.disabled = true;
    chatScreen.style.display = "none";
    loginScreen.style.display = "block";
});

// パスワード編集（管理者専用）
editPassBtn.addEventListener("click", () => {
    if (currentUser.role !== "管理者") return;
    const name = prompt("パスワードを変更するユーザー名を入力してください:");
    const target = users.find(u => u.name === name);
    if (!target) {
        alert("ユーザーが見つかりません");
        return;
    }
    const newPass = prompt(`${target.name} の新しいパスワードを入力:`);
    if (newPass) {
        target.password = newPass;
        alert("パスワードを変更しました");
    }
});

// メッセージ送信
sendBtn.addEventListener("click", () => {
    if (!messageInput.value) return;

    const msgRoleIndex = roleOrder.indexOf(targetGroup.value);
    const userRoleIndex = roleOrder.indexOf(currentUser.role);

    // 自分より上の職制には送信できない
    if (msgRoleIndex < userRoleIndex) {
        alert("この職制には送信できません");
        return;
    }

    const msg = document.createElement("div");
    msg.textContent = `[${targetGroup.value}] ${currentUser.name}: ${messageInput.value}`;
    chatArea.appendChild(msg);
    messageInput.value = "";
});