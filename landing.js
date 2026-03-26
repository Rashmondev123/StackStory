/*landing page logic*/

// landing.js

function handleSearch() {
    const input = document.getElementById('usernameInput');
    const username = input.value.trim();
    if (!username) return;
    window.location.href = `profile.html?user=${username}`;
}

function fillExample(username) {
    document.getElementById('usernameInput').value = username;
    document.getElementById('usernameInput').focus();
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
}

// Burger toggle
document.getElementById('burger').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
});

// Search on Enter key
document.getElementById('usernameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
});