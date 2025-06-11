const signupBox = document.querySelector('.signup-box');
const signupPageIcon = document.querySelector('.signup-page-icon');
const signupPageTitle = document.querySelector('.signup-page-title');
const signupBoxUsername = document.querySelector('.signup-box-username');
const signupBoxPassword = document.querySelector('.signup-box-password');
const errorBox = document.querySelector('.signup-error-box');
const errorBoxText = document.querySelector('.signup-error-text');
const signupButton = document.querySelector('.signup-box-button');
const redirectAnimation = document.querySelector('.redirect-animation');

signupButton.addEventListener('click', async () => {
    if (signupBoxUsername.value === '' || signupBoxPassword.value === '') {
        signupBox.style.height = '56%'
        signupPageIcon.style.top = '18%'
        signupPageTitle.style.top = '24%';
        errorBox.style.display = 'block';
        errorBoxText.innerHTML = 'Please fill out all fields';
    } else {
        signupButton.disabled = true;
        try {
            const res = await fetch('/create_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: signupBoxUsername.value,
                password: signupBoxPassword.value
            })
            });
            const text = await res.text();
            if (res.ok) {
                redirectAnimation.style.animation = 'drop 1s linear'
                    window.location.href = '/login';
            } else {
                signupBox.style.height = '56%'
                signupPageIcon.style.top = '18%'
                signupPageTitle.style.top = '29%';
                errorBox.style.display = 'block';
                errorBoxText.innerHTML = text || 'An error occurred. Please try again.';
            }
        } catch (err) {
            signupBox.style.height = '56%'
            signupPageIcon.style.top = '18%'
            signupPageTitle.style.top = '29%';
            errorBox.style.display = 'block';
            errorBoxText.innerHTML = 'An error occurred. Please try again later.';
            console.error('Error:', err);
        }
    }
});