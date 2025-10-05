const state = {
    currentUser: null,
    chats: [],
    messages: {}
};

// LOADING
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        checkAuth();
    }, 1200);

    setupAuth();
    setupChat();
});

function checkAuth() {
    const saved = localStorage.getItem('ftr_user');
    if (saved) {
        state.currentUser = JSON.parse(saved);
        showChat();
    } else {
        showAuth();
    }
}

function showAuth() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('chatScreen').classList.add('hidden');
}
function showChat() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('chatScreen').classList.remove('hidden');
    updateUserProfile();
    renderChats();
}

// AUTH
function setupAuth() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('loginForm').classList.toggle('hidden', btn.dataset.tab !== 'login');
            document.getElementById('registerForm').classList.toggle('hidden', btn.dataset.tab !== 'register');
        });
    });

    document.getElementById('loginForm').addEventListener('submit', e => {
        e.preventDefault();
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();
        const users = JSON.parse(localStorage.getItem('ftr_users') || '{}');
        if (users[username] && users[username].password === password) {
            state.currentUser = users[username];
            localStorage.setItem('ftr_user', JSON.stringify(state.currentUser));
            showChat();
        } else alert('Неверные данные');
    });

    document.getElementById('registerForm').addEventListener('submit', e => {
        e.preventDefault();
        const username = regUsername.value.trim();
        const password = regPassword.value.trim();
        const confirm = regConfirmPassword.value.trim();
        if (password !== confirm) return alert('Пароли не совпадают');
        const users = JSON.parse(localStorage.getItem('ftr_users') || '{}');
        if (users[username]) return alert('Пользователь уже существует');
        users[username] = { username, password, avatar: "assets/shield.png" };
        localStorage.setItem('ftr_users', JSON.stringify(users));
        localStorage.setItem('ftr_user', JSON.stringify(users[username]));
        state.currentUser = users[username];
        showChat();
    });
}

// CHAT
function setupChat() {
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    document.getElementById('changeAvatarBtn').addEventListener('click', () => {
        document.getElementById('avatarInput').click();
    });
    document.getElementById('avatarInput').addEventListener('change', changeAvatar);
}

function changeAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        state.currentUser.avatar = ev.target.result;
        localStorage.setItem('ftr_user', JSON.stringify(state.currentUser));
        const users = JSON.parse(localStorage.getItem('ftr_users'));
        users[state.currentUser.username].avatar = ev.target.result;
        localStorage.setItem('ftr_users', JSON.stringify(users));
        updateUserProfile();
    };
    reader.readAsDataURL(file);
}

function updateUserProfile() {
    const u = state.currentUser;
    document.getElementById('username').textContent = u.username;
    document.getElementById('userAvatar').src = u.avatar || "assets/shield.png";
}

// CHATS
function renderChats() {
    const list = document.getElementById('chatsList');
    list.innerHTML = '';
    state.chats.forEach(chat => {
        const div = document.createElement('div');
        div.className = 'chat-item';
        div.textContent = chat.name;
        div.onclick = () => openChat(chat);
        list.appendChild(div);
    });
}

document.getElementById('newChatBtn').addEventListener('click', () => {
    const name = prompt('Имя чата:');
    if (!name) return;
    const chat = { id: Date.now(), name, messages: [] };
    state.chats.push(chat);
    renderChats();
});

function openChat(chat) {
    state.currentChat = chat;
    document.getElementById('contactName').textContent = chat.name;
    renderMessages();
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !state.currentChat) return;
    const msg = { text, time: new Date().toLocaleTimeString(), sent: true };
    state.currentChat.messages.push(msg);
    renderMessages();
    input.value = '';
}

function renderMessages() {
    const c = document.getElementById('messagesContainer');
    c.innerHTML = '';
    if (!state.currentChat) return;
    state.currentChat.messages.forEach(m => {
        const div = document.createElement('div');
        div.className = 'message ' + (m.sent ? 'sent' : 'received');
        div.innerHTML = `<div class="message-bubble">${m.text}<div class="message-time">${m.time}</div></div>`;
        c.appendChild(div);
    });
    c.scrollTop = c.scrollHeight;
}