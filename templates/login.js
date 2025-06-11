const loginBox = document.querySelector('.login-box');
const loginPageIcon = document.querySelector('.login-page-icon');
const loginPageTitle = document.querySelector('.login-page-title');
const loginBoxUsername = document.querySelector('.login-box-username');
const loginBoxPassword = document.querySelector('.login-box-password');
const errorBox = document.querySelector('.login-error-box');
const errorBoxText = document.querySelector('.login-error-text');
const loginButton = document.querySelector('.login-box-button');

loginButton.addEventListener('click', async () => {
    if (loginBoxUsername.value === '' || loginBoxPassword.value === '') {
        loginBox.style.height = '56%'
        loginPageIcon.style.top = '18%'
        loginPageTitle.style.top = '24%';
        errorBox.style.display = 'block';
        errorBoxText.innerHTML = 'Please fill out all fields';
    } else {
        loginButton.disabled = true;
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
            redirectAnimation.style.animation = 'drop 1s linear'
            setTimeout(() => {
                window.location.href = '/home';
            }, 2000);
        } else if (res.status === 404) {
            loginBox.style.height = '56%'
            loginPageIcon.style.top = '18%'
            loginPageTitle.style.top = '29%';
            errorBox.style.display = 'block';
            errorBoxText.innerHTML = 'No account found.';
        }
    }
});