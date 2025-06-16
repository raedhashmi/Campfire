const loggedIn = localStorage.getItem('loggedIn');
const generalMenuUsername = document.querySelector('.general-menu-username');
const userAvatar = document.querySelector('.user-avatar');
const uuid = localStorage.getItem('userUUID');
const redirectAnimation = document.querySelector('.redirect-animation')
const role = document.querySelector('.general-menu-role')

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
const generalMenuUserAvatar = document.querySelector('.general-menu-user-avatar');
const pfpPath = localStorage.getItem('pfpPath')

avatarSpan.innerHTML = `<img src="${pfpPath}" style="width: 110%; height: 110%; border-radius:50%;">`;
generalMenuUserAvatar.innerHTML = `<img src="${pfpPath}" style="width: 110%; height: 110%; border-radius:50%;">`;

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

fetch('/view_by_uuid', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        id: uuid,
        view: 'role'
    })
})
.then(res => res.json())
.then(res => {
    if (res.status == 'success') {
        role.innerHTML = res.data;
    } else
        console.error('An error occoured.')
})

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
            // Save the file to /resources/ with a unique name
            const formData = new FormData();
            const filename = `${uuid}_userPfp.png`;
            formData.append('file', file, filename);
            formData.append('uuid', uuid);
            fetch('/upload_pfp', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    localStorage.setItem('pfpPath', data.pfppath.replace('templates', 'resources'))
                    userAvatar.innerHTML = `<img src="${localStorage.getItem('pfpPath')}" alt="User Avatar" style="width: 110%; height: 110%; border-radius:50%;">`;
                    generalMenuUserAvatar.innerHTML = `<img src="${localStorage.getItem('pfpPath')}" alt="User Avatar" style="width: 110%; height: 110%; border-radius:50%;">`;
                } else {
                    console.error('Failed to update profile picture');
                }
            });
        }
    };
}