const startScreen = document.querySelector('.start-screen');
const startScreenTitle = document.querySelector('.start-screen h1')
const startScreenImg = document.querySelector('.start-screen img')
const loadingBar = document.querySelector('.loading-bar')
const loginScreen = document.querySelector('.login-screen')
const signupScreen = document.querySelector('.signup-screen')
const accountsScreen = document.querySelector('.accounts-screen')
const loggedIn = localStorage.getItem('loggedIn');
const startUp = true;

if (startUp === true) {
    document.addEventListener('DOMContentLoaded', () => {
        startScreen.style.display = 'block';
        setTimeout(() => {
            startScreenTitle.style.display = 'block';
            startScreenTitle.style.animation = 'titleSlideIn 1s ease-in-out';
            startScreenImg.style.animation = 'logoSlideOut 1s ease-in-out';
            setTimeout(() => {
                startScreenTitle.style.opacity = 1;
                startScreenTitle.style.top = '51%'
                startScreenImg.style.marginTop = '-50px';
                loadingBar.style.display = 'block';
                loadingBar.style.animation = 'fadeIn 1s ease-in-out';
            }, 900)
            setTimeout(() => {
                startScreen.style.animation = "fadeOut 0.2s ease-in-out";
                setTimeout(() => {
                    if (loggedIn === 'true') {
                        // User is logged in, do nothing (leave blank)
                    } else {
                        window.location.href = '/signup';
                    }
                }, 100)
            }, 13000)
        }, 2000)
    })
} else if (startUp === false) {
    if (loggedIn === 'false' || loggedIn == null) {
        accountsScreen.style.display = 'block';
        signupScreen.style.display = 'block';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'r') {
        window.location.reload();
    }
})

if (loggedIn == 'false' || loggedIn == null && startUp == 'complete') {
    accountsScreen.style.display = 'block';
    signupScreen.style.display = 'block';
}