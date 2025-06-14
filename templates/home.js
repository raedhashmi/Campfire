const chatItems = document.querySelectorAll('.chat-item');
const searchBar = document.querySelector('.sidebar-search');
const noChatsMessage = document.querySelector('.chats-no-chats-found');
const addChatButton = document.querySelector('.sidebar-add-chat-button');
const loggedIn = localStorage.getItem('loggedIn');

if (loggedIn === 'false' || loggedIn == null) {
    document.addEventListener('DOMContentLoaded', () => {
        window.location.href = '/login';
    });
}

const username = localStorage.getItem('username'); // Replace with actual username from backend/session
const avatarSpan = document.querySelector('.user-avatar');
if (avatarSpan && username) {
    avatarSpan.textContent = username[0].toUpperCase();
}
searchBar.addEventListener('input', () => {
  const query = searchBar.value.trim().toLowerCase();
  chatItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    // If username is 'raedh' and this chat item is for 'raedh', always hide it
    if (username === 'raedh' && text.includes('raedh')) {
      item.style.display = 'none';
      return;
    }
    if (!query || text.includes(query)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
});

if (username === 'raedh' && chatItems.length > 0) {
  chatItems[0].style.display = 'none';
  noChatsMessage.style.display = 'block';
}

// Create overlay dialog elements
function addChat() {
  // Overlay background
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 1000;

  // Dialog box
  const dialog = document.createElement('div');
  dialog.style.backgroundColor = '#121212';
  dialog.style.padding = '2rem';
  dialog.style.borderRadius = '8px';
  dialog.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
  dialog.style.minWidth = '320px';
  dialog.innerHTML = `
    <h2>Add New Chat</h2>
    <label for="other-user-uuid">Other User's UUID:</label>
    <input id="other-user-uuid" type="text" style="width:100%;margin:8px 0;padding:8px;" autofocus />
    <div style="margin-top:1rem;text-align:right;">
      <button id="add-chat-cancel" style="margin-right:8px;">Cancel</button>
      <button id="add-chat-confirm">Add Chat</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Focus input
  dialog.querySelector('#other-user-uuid').focus();

  // Remove overlay helper
  function closeDialog() {
    overlay.remove();
  }

  // Cancel button
  dialog.querySelector('#add-chat-cancel').onclick = closeDialog;

  // Confirm button
  dialog.querySelector('#add-chat-confirm').onclick = async () => {
    const otherUserUUID = dialog.querySelector('#other-user-uuid').value.trim();
    if (!otherUserUUID) {
      alert('Please enter a UUID.');
      return;
    }
    try {
      const response = await fetch('/add_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ other_user_uuid: otherUserUUID })
      });
      if (response.ok) {
        alert('Chat added successfully!');
        window.location.reload();
      } else {
        const error = await response.text();
        alert('Failed to add chat: ' + error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    closeDialog();
  };

  // Close on overlay click (not dialog)
  overlay.onclick = (e) => {
    if (e.target === overlay) closeDialog();
  };
}

addChatButton.addEventListener('click', createAddChatDialog);

avatarSpan?.addEventListener('click', (e) => {
  if (e.button === 2) {
    // Right mouse button clicked
    alert(`Hello, ${username}!`);
  }
});

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
