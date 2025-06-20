const addChatDialogErrorBoxText = document.querySelector('.add-chat-dialog-error-box-text')
const addChatDialogErrorBox = document.querySelector('.add-chat-dialog-error-box')
const addChatButton = document.querySelector('.sidebar-add-chat-btn');
const redirectAnimation = document.querySelector('.redirect-animation');
const noChatsMessage = document.querySelector('.chats-no-chats-found');
const addChatOverlay = document.querySelector('.add-chat-overlay')
const addChatDialog = document.querySelector('.add-chat-dialog')
const searchBar = document.querySelector('.sidebar-search');
const mainContent = document.querySelector('.main-content');
const chatList = document.querySelector('.sidebar-chats');
const chatItems = document.querySelectorAll('.chat-item');
const loggedIn = localStorage.getItem('loggedIn');
const uuid = localStorage.getItem('userUUID');
let currentChatFriendUUID = null;

redirectAnimation.style.animation = 'afterDrop 1s ease-in-out forwards';
setTimeout(() => {
  redirectAnimation.style.animation = 'none';
}, 1000);

if (loggedIn === 'false' || loggedIn == null) {
  document.addEventListener('DOMContentLoaded', () => {
    window.location.href = '/login';
  });
}

const username = localStorage.getItem('username');
const avatarSpan = document.querySelector('.user-avatar');
const pfpPath = localStorage.getItem('pfpPath')

avatarSpan.innerHTML = `<img src="${pfpPath}" style="width: 110%; height: 110%; border-radius:50%;">`;

searchBar.addEventListener('input', () => {
  const query = searchBar.value.trim().toLowerCase();
  chatItems.forEach(item => {
  const text = item.textContent.toLowerCase();
  if (!query || text.includes(query)) {
    item.style.display = '';
  } else {
    item.style.display = 'none';
  }
  });
});

if (chatItems.length === 0) {
  noChatsMessage.style.display = 'block';
} else {
  noChatsMessage.style.display = 'none';
  chatItems.style.display = 'block'
}

addChatButton.addEventListener('click', addChat);

function addChat() { 
  addChatOverlay.style.display = 'block';
  addChatDialog.querySelector('.add-chat-input').focus();

  function closeDialog() {
    addChatOverlay.style.display = 'none';
    addChatDialogErrorBox.style.display = 'none';
    addChatDialog.querySelector('#other-user-uuid').value = '';
  }

  addChatDialog.querySelector('#add-chat-cancel').onclick = closeDialog;

  addChatDialog.querySelector('#add-chat-confirm').onclick = async () => {
    const otherUserUUID = addChatDialog.querySelector('#other-user-uuid').value.trim();
    if (!otherUserUUID) {
      addChatDialogErrorBox.style.display = 'block';
      addChatDialogErrorBoxText.innerHTML = 'Please enter a UUID.';
      return;
    }
    try {
      const response = await fetch('/add_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          current_user_uuid: uuid,
          other_user_uuid: otherUserUUID
        })
      });
      const res = await response.json();
      if (res.status === 'success') {
        const userPfpPath = res.other_users_pfp.replace(/^templates\//, 'resources/');
        addNewChat(res.other_username, userPfpPath, res.other_users_role);
        closeDialog();
      } else {
        addChatDialogErrorBox.style.display = 'block';
        addChatDialogErrorBoxText.innerHTML = 'Incorrect UUID provided.';
      }
    } catch (err) {
      addChatDialogErrorBox.style.display = 'block';
      addChatDialogErrorBoxText.innerHTML = 'An error occurred. Please try again.';
    }
  };

  addChatOverlay.onclick = (e) => {
    if (e.target === addChatOverlay) closeDialog();
  };
}

function openChat(friendUUID, other_users_pfp, other_user_username, other_users_role) {
  currentChatFriendUUID = friendUUID;
  const existingChat = mainContent.querySelector('.chat');
  if (existingChat) {
    mainContent.removeChild(existingChat);
  }
  const chat = document.createElement('div');
  mainContent.querySelector('.select-chat-message').style.display = 'none';
  chat.className = 'chat';
  chat.innerHTML = `
    <div class="chat-header">
      <img src="${other_users_pfp}" class="chat-header-avatar">
      <p class="chat-header-username">${other_user_username}</p>
      <p class="chat-header-role">${other_users_role}</p>
    </div>

    <div class='chat-content'>
      <input type='text' class='chat-send-message-input' placeholder='Send a message...'>
      <button class='send-message-btn' onclick='sendMessage()'>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white"/>
        </svg>
      </button>
    </div>
  `;
  mainContent.appendChild(chat);
  renderChatMessages(uuid, friendUUID);
}

async function sendMessage() {
  const messageInput = document.querySelector('.chat-send-message-input');
  if (!messageInput) return;

  const fromUser = uuid;
  const toUser = currentChatFriendUUID;
  const content = messageInput.value.trim();

  if (!content || !toUser) return;

  try {
    await fetch('/send_message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromUser,
        to: toUser,
        content: content
      })
    });
    messageInput.value = '';
  } catch (err) {
    alert('Failed to send message.');
  }
}

function addNewChat(friendUUID, other_username, other_users_pfp, other_users_role) {
  const chatItem = document.createElement('div');
  chatItem.className = 'chat-item';
  chatItem.onclick = () => openChat(friendUUID, other_users_pfp, other_username, other_users_role);;
  chatItem.innerHTML = `
    <img class='chat-avatar' src="${other_users_pfp}">
    <p class='chat-name'>${other_username}</p>
    <p class='chat-role'>${other_users_role}</p>
  `;
  chatList.appendChild(chatItem);

  const noChatsMessage = document.querySelector('.chats-no-chats-found');
  if (noChatsMessage) noChatsMessage.style.display = 'none';
}

async function renderChats() {
  const friendListRes = await fetch('/view_by_uuid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      id: uuid,
      view: 'friendList'
    })
  });
  const friendListData = await friendListRes.json();
  let friendList = friendListData.data;

  if (!friendList || friendList.trim() === "") {
    noChatsMessage.style.display = 'block';
    return;
  } else {
    noChatsMessage.style.display = 'none';
  }

  friendList = friendList.split(',').map(f => f.trim()).filter(f => f);

  for (const friendUUID of friendList) {
    const usernameRes = await fetch('/view_by_uuid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: friendUUID, view: 'username' })
    });
    const usernameData = await usernameRes.json();
    const friendUsername = usernameData.data;

    const pfpRes = await fetch('/view_by_uuid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: friendUUID, view: 'pfppath' })
    });
    const pfpData = await pfpRes.json();
    const userPfpPath = pfpData.data.replace('templates', 'resources');
    
    const roleRes = await fetch('/view_by_uuid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: friendUUID, view: 'role' })
    });
    const roleData = await roleRes.json();
    const friendRole = roleData.data;

    addNewChat(friendUUID, friendUsername, userPfpPath, friendRole);
  }
}

async function renderChatMessages(current_user_uuid, other_user_uuid) {
  const response = await fetch('/view_messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currentUser: current_user_uuid,
      otherUser: other_user_uuid
    })
  })
  .then(res => res.json())
  .then(res => {
    const messages = res.data || [];
    let chatContent = mainContent.querySelector('.chat-content');
    if (!chatContent) {
      chatContent = document.createElement('div');
      chatContent.className = 'chat-content';
      mainContent.appendChild(chatContent);
    }

    const messageDivs = chatContent.querySelectorAll('.chat-message-current-user, .chat-message-other-user');
    messageDivs.forEach(div => div.remove());

    messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      if (msg.msgFrom === uuid) {
        msgDiv.className = 'chat-message-current-user';
      } else {
        msgDiv.className = 'chat-message-other-user';
      }
      msgDiv.textContent = msg.content;
      chatContent.appendChild(msgDiv);
    });
  })
}

setInterval(() => {
  if (uuid && currentChatFriendUUID) {
    renderChatMessages(uuid, currentChatFriendUUID);
  } 
}, 1000);