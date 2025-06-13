const signupBox = document.querySelector('.signup-box');
const signupPageIcon = document.querySelector('.signup-page-icon');
const signupPageTitle = document.querySelector('.signup-page-title');
const signupBoxUsername = document.querySelector('.signup-box-username');
const signupBoxPassword = document.querySelector('.signup-box-password');
const errorBox = document.querySelector('.signup-error-box');
const errorBoxText = document.querySelector('.signup-error-text');
const signupButton = document.querySelector('.signup-box-button');
const redirectAnimation = document.querySelector('.redirect-animation');

signupButton.addEventListener('click', () => {
    if (signupBoxUsername.value === '' || signupBoxPassword.value === '') {
        signupBox.style.height = '56%'
        signupPageIcon.style.top = '18%'
        signupPageTitle.style.top = '24%';
        errorBox.style.display = 'block';
        errorBoxText.innerHTML = 'Please fill out all fields';
    } else {
        signupButton.disabled = true;
        signupButton.innerHTML = '<img src="resources/loading.png" style="background-color: transparent; height: 20px; width: auto;">';
        signupButton.style.cursor = 'not-allowed';
        signupBoxUsername.disabled = true;
        signupBoxPassword.disabled = true;
        signupBoxUsername.style.cursor = 'not-allowed';
        signupBoxPassword.style.cursor = 'not-allowed';
        signupBoxUsername.style.backgroundColor = '#666';
        signupBoxPassword.style.backgroundColor = '#666';
        signupBox.style.height = '52%'
        signupPageIcon.style.top = '20%'
        signupPageTitle.style.top = '26%';
        errorBox.style.display = 'none';
        setTimeout(async () => {
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
                    const redirectAnim = document.querySelector('.redirect-animation');
                    redirectAnim.style.animation = 'drop 2s ease-in-out forwards';
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                } else {
                    signupButton.disabled = false;
                    signupButton.style.cursor = 'pointer';
                    signupBoxUsername.disabled = false;
                    signupBoxPassword.disabled = false;
                    signupBoxUsername.style.cursor = 'text';
                    signupBoxPassword.style.cursor = 'text';
                    signupBoxUsername.style.backgroundColor = '#333';
                    signupBoxPassword.style.backgroundColor = '#333';
                    signupButton.innerHTML = 'Sign Up';
                    signupBox.style.height = '56%'
                    signupPageIcon.style.top = '18%'
                    signupPageTitle.style.top = '29%';
                    errorBox.style.display = 'block';
                    errorBoxText.innerHTML = text || 'An error occurred. Please try again.';
                }
            } catch (err) {
                signupButton.disabled = false;
                signupButton.style.cursor = 'pointer';
                signupBoxUsername.disabled = false;
                signupBoxPassword.disabled = false;
                signupBoxUsername.style.cursor = 'text';
                signupBoxPassword.style.cursor = 'text';
                signupBoxUsername.style.backgroundColor = '#333';
                signupBoxPassword.style.backgroundColor = '#333';
                signupButton.innerHTML = 'Sign Up';
                signupBox.style.height = '56%'
                signupPageIcon.style.top = '18%'
                signupPageTitle.style.top = '29%';
                errorBox.style.display = 'block';
                errorBoxText.innerHTML = 'An error occurred. Please try again later.';
                console.error('Error:', err);
            }
        }, 500)
    }
});