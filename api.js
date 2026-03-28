// ================================
//  STACKSTORY — API
//  api.js
// ================================

const BASE_URL = 'https://api.github.com';

// ---- FETCH WRAPPER ----
async function fetchGitHub(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (res.status === 404) throw new Error('GitHub user not found');
    if (res.status === 403) throw new Error('API rate limit reached. Try again in a minute.');
    if (!res.ok) throw new Error('Something went wrong. Try again.');
    return res.json();
}

// ---- GET USER PROFILE ----
async function getUser(username) {
    return fetchGitHub(`/users/${username}`);
}

// ---- GET USER REPOS ----
async function getRepos(username) {
    return fetchGitHub(
        `/users/${username}/repos?sort=updated&per_page=30`
    );
}

// ---- GET RECENT EVENTS ----
async function getEvents(username) {
    return fetchGitHub(
        `/users/${username}/events?per_page=30`
    );
}

// ---- GET EVERYTHING AT ONCE ----
async function fetchAllData(username) {
    try {
        // Step 1 — user profile
        const user = await getUser(username);

        // Step 2 — repos
        const repos = await getRepos(username);

        // Step 3 — recent activity
        const events = await getEvents(username);

        // Step 4 — language breakdown
        const languages = {};
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] =
                    (languages[repo.language] || 0) + 1;
            }
        });

        // Step 5 — total stars
        const totalStars = repos.reduce(
            (sum, repo) => sum + repo.stargazers_count, 0
        );

        // Step 6 — top 3 repos by stars
        const topRepos = [...repos]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3);

        // Step 7 — personality type
        // passing languages object so algorithm uses real data
        const personality = getPersonalityType(repos, languages);

        // Step 8 — top language for personality card
        const topLanguage = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'multiple languages';
        personality.topLang = topLanguage;

        // Step 9 — human summary
        // built from real data, no API needed
        const aiSummary = generateSummary(
            user,
            repos,
            languages,
            totalStars,
            personality
        );

        return {
            user,
            repos,
            events,
            languages,
            totalStars,
            topRepos,
            personality,
            aiSummary
        };

    } catch (error) {
        throw error;
    }
}
