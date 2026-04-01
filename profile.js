// ================================
//  STACKSTORY — PROFILE PAGE LOGIC
//  profile.js
// ================================

// get username from URL
function getUsernameFromURL() {
    const path = window.location.pathname.split('/').pop();
    if (path && path !== 'profile.html') return path;
    const params = new URLSearchParams(window.location.search);
    return params.get('user');
}

// update browser URL cleanly
function updateURL(username) {
    const newURL = `${window.location.pathname}?user=${username}`;
    window.history.pushState({ username }, '', newURL);
    document.title = `${username} — StackStory`;
}

// main function
async function loadProfile() {
    const username = getUsernameFromURL();

    if (!username) {
        showError();
        return;
    }

    updateURL(username);
    showLoading();

    try {
        const data = await fetchAllData(username);
        renderUserHeader(data.user);
        renderStats(data.user, data.repos, data.totalStars);
        renderPersonality(data.personality, data.user, data.totalStars);
        renderScore(data.score);
        renderPortfolioChecker(data.user, data.repos);
        renderRepos(data.topRepos);
        renderLanguages(data.languages);
        renderActivity(data.events);
        showProfile();
        // store data for recruiter card
currentProfileData = data;

    } catch (error) {
        console.error(error);
        showError();
    }
}

// run on page load
loadProfile();
