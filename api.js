/*all GitHub API calls */

// ================================
//  STACKSTORY — API
//  api.js
// ================================

const BASE_URL = 'https://api.github.com';

// ---- FETCH WRAPPER ----
// One function that handles all API calls
// If something goes wrong it tells us clearly
async function fetchGitHub(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`);

    if (res.status === 404) {
        throw new Error('GitHub user not found');
    }
    if (res.status === 403) {
        throw new Error('API rate limit reached. Try again in a minute.');
    }
    if (!res.ok) {
        throw new Error('Something went wrong. Try again.');
    }

    return res.json();
}

// ---- GET USER PROFILE ----
async function getUser(username) {
    return fetchGitHub(`/users/${username}`);
}

// ---- GET USER REPOS ----
// sorted by most recently updated
// limit 30 so we don't hammer the API
async function getRepos(username) {
    return fetchGitHub(
        `/users/${username}/repos?sort=updated&per_page=30`
    );
}

// ---- GET RECENT EVENTS ----
// last 30 events — commits, PRs, stars
async function getEvents(username) {
    return fetchGitHub(
        `/users/${username}/events?per_page=30`
    );
}

// ---- GET COMMITS FOR ONE REPO ----
async function getCommits(username, repo) {
    return fetchGitHub(
        `/repos/${username}/${repo}/commits?per_page=10`
    );
}

// ---- GET EVERYTHING AT ONCE ----
// This is the main function we call from profile.js
// Fetches user + repos + events all together
async function fetchAllData(username) {
    try {

        // Step 1 — get the user profile
        const user = await getUser(username);

        // Step 2 — get their repos
        const repos = await getRepos(username);

        // Step 3 — get recent activity
        const events = await getEvents(username);

        // Step 4 — calculate language breakdown
        // count how many repos use each language
        const languages = {};
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = 
                (languages[repo.language] || 0) + 1;
            }
        });

        // Step 5 — calculate total stars
        const totalStars = repos.reduce(
            (sum, repo) => sum + repo.stargazers_count, 0
        );

        // Step 6 — get top 3 repos by stars
        const topRepos = [...repos]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3);

        // Step 7 — estimate total commits
        // GitHub API doesn't give total commits directly
        // so we use repo commit count as a signal
        const totalCommits = repos.reduce(
            (sum, repo) => sum + (repo.size > 0 ? 1 : 0), 0
        ) * 10;

        // Step 8 — get personality type
        const personality = getPersonalityType(repos, totalCommits);

        // Return everything packaged up cleanly
        return {
            user,
            repos,
            events,
            languages,
            totalStars,
            topRepos,
            totalCommits,
            personality
        };

    } catch (error) {
        // Pass the error up so profile.js can show it
        throw error;
    }
}