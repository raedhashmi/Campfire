const loggedIn = localStorage.getItem('loggedIn');
const generalMenuUsername = document.querySelector('.general-menu-username');
const userAvatar = document.querySelector('.user-avatar');

if (loggedIn === 'false' || loggedIn == null) {
    document.addEventListener('DOMContentLoaded', () => {
        window.location.href = '/login';
    });
}

const username = localStorage.getItem('username'); // Replace with actual username from backend/session
const avatarSpan = document.querySelector('.user-avatar');
const generalMenuUserAvatar = document.querySelector('.general-menu-user-avatar');
if (avatarSpan && generalMenuUserAvatar && username) {
    avatarSpan.textContent = username[0].toUpperCase();
    generalMenuUserAvatar.textContent = username[0].toUpperCase();
}

generalMenuUsername.textContent = username || 'User';

function openMenu(menu) {
    if (menu === 'general') {
        document.querySelector('.general-menu').style.display = 'block';
        document.querySelector('.general-menu').style.display = 'none';
    } else if (menu === 'general') {
        document.querySelector('.general-menu').style.display = 'none';
        document.querySelector('.general-menu').style.display = 'block';
    }
}

function changeProfilePicture() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    // Trigger file selection
    fileInput.click();

    // Handle file selection
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                userAvatar.innerHTML = `<img src="${e.target.result}" alt="User Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            };
            reader.readAsDataURL(file);
        }
    };
}