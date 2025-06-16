const loginBox = document.querySelector('.login-box');
const loginPageIcon = document.querySelector('.login-page-icon');
const loginPageTitle = document.querySelector('.login-page-title');
const loginBoxUsername = document.querySelector('.login-box-username');
const loginBoxPassword = document.querySelector('.login-box-password');
const errorBox = document.querySelector('.login-error-box');
const errorBoxText = document.querySelector('.login-error-text');
const loginButton = document.querySelector('.login-box-button');
const redirectAnimation = document.querySelector('.redirect-animation');

redirectAnimation.style.animation = 'afterDrop 1s ease-in-out forwards';
setTimeout(() => {
    redirectAnimation.style.animation = 'none';
}, 1000);

loginButton.addEventListener('click', () => {
    if (loginBoxUsername.value === '' || loginBoxPassword.value === '') {
        loginBox.style.height = '56%'
        loginPageIcon.style.top = '18%'
        loginPageTitle.style.top = '24%';
        errorBox.style.display = 'block';
        errorBoxText.innerHTML = 'Please fill out all fields';
        localStorage.setItem('loggedIn', 'false');
    } else {
        loginButton.disabled = true;
        loginButton.innerHTML = '<img src="resources/loading.png" style="background-color: transparent; height: 20px; width: auto;">';
        loginButton.style.cursor = 'not-allowed';
        loginBoxUsername.disabled = true;
        loginBoxPassword.disabled = true;
        loginBoxUsername.style.cursor = 'not-allowed';
        loginBoxPassword.style.cursor = 'not-allowed';
        loginBoxUsername.style.backgroundColor = '#666';
        loginBoxPassword.style.backgroundColor = '#666';
        loginBox.style.height = '52%'
        loginPageIcon.style.top = '20%'
        loginPageTitle.style.top = '26%';
        errorBox.style.display = 'none';
        setTimeout(async () => {
            const res = await fetch('/verify_login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: loginBoxUsername.value,
                password: loginBoxPassword.value
            })
            });
            const text = await res.text();
            if (res.ok) {
                const redirectAnim = document.querySelector('.redirect-animation');
                redirectAnim.style.animation = 'drop 1s ease-in-out forwards';
                setTimeout(() => {
                    window.location.href = '/home';
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('username', loginBoxUsername.value);
                    localStorage.setItem('userUUID', JSON.parse(text).userUUID);
                    localStorage.setItem('pfpPath', 'resources/userpfps/userPfp.png')
                }, 1000);
            } else if (res.status === 404) {
                loginButton.disabled = false;
                loginButton.style.cursor = 'pointer';
                loginBoxUsername.disabled = false;
                loginBoxPassword.disabled = false;
                loginBoxUsername.style.cursor = 'text';
                loginBoxPassword.style.cursor = 'text';
                loginBoxUsername.style.backgroundColor = '#333';
                loginBoxPassword.style.backgroundColor = '#333';
                loginButton.innerHTML = 'Login';
                loginBox.style.height = '56%'
                loginPageIcon.style.top = '18%'
                loginPageTitle.style.top = '29%';
                errorBox.style.display = 'block';
                errorBoxText.innerHTML = 'No account found.';
                localStorage.setItem('loggedIn', 'false');
            }
        }, 500)
    }
});