const addChatDialogErrorBoxText = document.querySelector('.add-chat-dialog-error-box-text')
const addChatDialogErrorBox = document.querySelector('.add-chat-dialog-error-box')
const addChatButton = document.querySelector('.sidebar-add-chat-btn');
const redirectAnimation = document.querySelector('.redirect-animation');
const noChatsMessage = document.querySelector('.chats-no-chats-found');
const addChatOverlay = document.querySelector('.add-chat-overlay')
const addChatDialog = document.querySelector('.add-chat-dialog')
const searchBar = document.querySelector('.sidebar-search');
const chatList = document.querySelector('.sidebar-chats');
const chatItems = document.querySelectorAll('.chat-item');
const loggedIn = localStorage.getItem('loggedIn');
const uuid = localStorage.getItem('userUUID');

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
  addChatOverlay.style.display = 'block'

  addChatDialog.querySelector('.add-chat-input').focus();

  function closeDialog() {
    addChatOverlay.style.display = 'none'
  }

  addChatDialog.querySelector('#add-chat-cancel').onclick = closeDialog;

  addChatDialog.querySelector('#add-chat-confirm').onclick = async () => {
    const otherUserUUID = addChatDialog.querySelector('#other-user-uuid').value.trim();
    if (!otherUserUUID) {
      addChatDialogErrorBox.style.display = 'block'
      addChatDialogErrorBoxText.innerHTML = 'Please enter a UUID.'
    } else {
      const response = await fetch('/add_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          current_user_uuid: uuid,
          other_user_uuid: otherUserUUID
        })
      })
      .then(res => res.json())
      .then(res => {
        if (res.status == 'success') {
          const userPfpPath = res.other_users_pfp.replace(/^templates\//, 'resources/');
          addNewChat(res.other_username, userPfpPath, res.other_users_role);
        } else if (res.status == 'error') {
          addChatDialogErrorBox.style.display = 'block'
          addChatDialogErrorBoxText.innerHTML = 'Incorrect UUID provided.'
        }
      })
    }
  };

  addChatOverlay.onclick = (e) => {
    if (e.target === addChatOverlay) closeDialog();
  };
}

chatItems.forEach(item => {
  item.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent default browser context menu
    e.stopPropagation();
    // Remove any existing dropdowns
    document.querySelectorAll('.chat-dropdown').forEach(d => d.remove());
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'chat-dropdown';
    dropdown.innerHTML = `
      <button>Open Chat</button>
      <br>
      <button>Delete Chat</button>
    `;
    // Position dropdown
    dropdown.style.top = `${e.clientY}px`;
    dropdown.style.left = `${e.clientX}px`;
    document.body.appendChild(dropdown);
    // Close dropdown on click outside
    setTimeout(() => {
      document.addEventListener('click', function handler(ev) {
        if (!dropdown.contains(ev.target)) {
          dropdown.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 10);
  });
});

function addNewChat(other_username, other_users_pfp, other_users_role) {
  const chatItem = document.createElement('div');
  chatItem.className = 'chat-item';
  chatItem.innerHTML = `
    <img class='chat-avatar' src="${other_users_pfp}">
    <p class='chat-name'>${other_username}</p>
    <p class='chat-role'>${other_users_role}</p>
  `;
  chatList.appendChild(chatItem);

  // Hide "no chats" message if present
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
  const friendList = friendListData.data;

  if (friendList === null) {
    noChatsMessage.style.display = 'block';
    return;
  } else {
    noChatsMessage.style.display = 'none';
  }

  for (const friendUUID of friendList) {
    const usernameRes = await fetch('/view_by_uuid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: friendUUID, view: 'username' })
    });
    const usernameData = await usernameRes.json();
    const friendUsername = usernameData.data;

    // Fetch friend's pfpPath
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

    addNewChat(friendUsername, userPfpPath, friendRole);
  }
}