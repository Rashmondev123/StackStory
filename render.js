/*all DOM rendering functions*/

// ================================
//  STACKSTORY — RENDER
//  render.js
// ================================

// ---- RENDER USER HEADER ----
function renderUserHeader(user) {
    // Avatar
    document.getElementById('userAvatar').src = user.avatar_url;
    document.getElementById('userAvatar').alt = user.name || user.login;

    // Name + login
    document.getElementById('userName').textContent = 
        user.name || user.login;
    document.getElementById('userLogin').textContent = 
        '@' + user.login;

    // Bio
    const bio = document.getElementById('userBio');
    bio.textContent = user.bio || 'No bio yet.';

    // Meta — location, company, blog
    const meta = document.getElementById('userMeta');
    let metaHTML = '';

    if (user.location) {
        metaHTML += `<span>📍 ${user.location}</span>`;
    }
    if (user.company) {
        metaHTML += `<span>🏢 ${user.company}</span>`;
    }
    if (user.blog) {
        metaHTML += `<span>🔗 <a href="${user.blog}" 
        target="_blank" style="color:var(--text);">
        ${user.blog}</a></span>`;
    }

    meta.innerHTML = metaHTML;

    // Update page title
    document.title = `${user.name || user.login} — StackStory`;
}

// ---- RENDER STAT CARDS ----
function renderStats(user, repos, totalStars) {
    const grid = document.getElementById('statsGrid');

    const stats = [
        {
            label: 'Repositories',
            value: shortNumber(user.public_repos),
            sub: 'public repos'
        },
        {
            label: 'Followers',
            value: shortNumber(user.followers),
            sub: 'people following'
        },
        {
            label: 'Following',
            value: shortNumber(user.following),
            sub: 'people followed'
        },
        {
            label: 'Total Stars',
            value: shortNumber(totalStars),
            sub: 'across all repos'
        },
        {
            label: 'Member Since',
            value: formatDate(user.created_at),
            sub: 'joined GitHub'
        },
    ];

    grid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <p class="stat-label">${stat.label}</p>
            <p class="stat-value">${stat.value}</p>
            <p class="stat-sub">${stat.sub}</p>
        </div>
    `).join('');
}

// ---- RENDER PERSONALITY CARD ----
function renderPersonality(personality, user, totalStars) {

    // recruiter signals per personality type
    const signals = {
        'Serial Builder': {
            bestFor: 'Fast-moving startups, product teams, hackathons',
            worksLike: 'Explores broadly, ships fast, iterates quickly',
            watchFor: 'May need structure to go deep on one codebase'
        },
        'Deep Diver': {
            bestFor: 'Complex systems, infrastructure, long-term projects',
            worksLike: 'Goes all in on one thing until it is done right',
            watchFor: 'May take longer to switch contexts between projects'
        },
        'Consistent Grinder': {
            bestFor: 'Product teams, agile sprints, reliability-focused roles',
            worksLike: 'Shows up every day, steady output, low drama',
            watchFor: 'May prefer depth over rapid experimentation'
        },
        'Sprinter': {
            bestFor: 'Contract work, hackathons, short intense projects',
            worksLike: 'Intense bursts of energy followed by reflection',
            watchFor: 'Works best with clear deadlines and defined scope'
        }
    };

    const signal = signals[personality.type] || signals['Sprinter'];

    // auto-generated recruiter summary from real data
    const joinYear = new Date(user.created_at).getFullYear();
    const location = user.location ? `based in ${user.location}` : 'location not listed';
    const topLang = personality.topLang || 'code';

    const summary = `${user.name || user.login} is a developer ${location} with 
    ${user.public_repos} public repositories and ${shortNumber(user.followers)} 
    followers on GitHub. They write primarily in ${topLang}, have accumulated 
    ${shortNumber(totalStars)} stars across their work, and have been active on 
    GitHub since ${joinYear}. Their commit patterns suggest a 
    ${personality.type} — ${personality.desc.toLowerCase()}`;

    const container = document.getElementById('personalityCard');

    container.innerHTML = `
        <div class="personality-card">
            <div class="personality-badge">${personality.emoji}</div>
            <div class="personality-info">
                <p class="personality-label">Developer Personality</p>
                <p class="personality-type">${personality.type}</p>
                <p class="personality-desc">${personality.desc}</p>
            </div>
        </div>

        <!-- RECRUITER SUMMARY -->
        <div class="recruiter-summary">
            <p class="recruiter-summary-label">Recruiter Summary</p>
            <p class="recruiter-summary-text">${summary}</p>
        </div>

        <!-- RECRUITER SIGNALS -->
        <div class="signals-grid">
            <div class="signal-card">
                <p class="signal-label">✦ Best For</p>
                <p class="signal-value">${signal.bestFor}</p>
            </div>
            <div class="signal-card">
                <p class="signal-label">✦ Works Like</p>
                <p class="signal-value">${signal.worksLike}</p>
            </div>
            <div class="signal-card">
                <p class="signal-label">✦ Watch For</p>
                <p class="signal-value">${signal.watchFor}</p>
            </div>
        </div>
    `;
}

// ---- RENDER TOP REPOS ----
function renderRepos(repos) {
    const grid = document.getElementById('reposGrid');

    if (repos.length === 0) {
        grid.innerHTML = `
            <p style="color:var(--muted);font-size:.9rem;">
                No public repositories yet.
            </p>`;
        return;
    }

    grid.innerHTML = repos.map(repo => `
        <a href="${repo.html_url}" target="_blank" class="repo-card">
            <p class="repo-name">${repo.name}</p>
            <p class="repo-desc">
                ${repo.description || 'No description provided.'}
            </p>
            <div class="repo-meta">
                ${repo.language ? `
                <span>
                    <span class="repo-lang-dot" style="background:
                    ${getLangColor(repo.language)};"></span>
                    ${repo.language}
                </span>` : ''}
                <span>⭐ ${shortNumber(repo.stargazers_count)}</span>
                <span>🍴 ${shortNumber(repo.forks_count)}</span>
            </div>
        </a>
    `).join('');
}

// ---- RENDER LANGUAGE BREAKDOWN ----
function renderLanguages(languages) {
    const container = document.getElementById('languagesList');

    const total = Object.values(languages)
        .reduce((sum, count) => sum + count, 0);

    if (total === 0) {
        container.innerHTML = `
            <p style="color:var(--muted);font-size:.9rem;">
                No language data available.
            </p>`;
        return;
    }

    // Sort by most used
    const sorted = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    container.innerHTML = sorted.map(([lang, count]) => {
        const percent = Math.round((count / total) * 100);
        return `
            <div class="lang-row">
                <span class="lang-name">${lang}</span>
                <div class="lang-bar-wrap">
                    <div class="lang-bar" 
                        style="width:${percent}%;
                        background:${getLangColor(lang)};">
                    </div>
                </div>
                <span class="lang-percent">${percent}%</span>
            </div>
        `;
    }).join('');
}

// ---- RENDER ACTIVITY FEED ----
function renderActivity(events) {
    const feed = document.getElementById('activityFeed');

    // Only show push events — actual commits
    const pushEvents = events
        .filter(e => e.type === 'PushEvent')
        .slice(0, 8);

    if (pushEvents.length === 0) {
        feed.innerHTML = `
            <p style="color:var(--muted);font-size:.9rem;">
                No recent activity found.
            </p>`;
        return;
    }

    feed.innerHTML = pushEvents.map(event => {
        const repo = event.repo.name.split('/')[1];
        const commits = event.payload.commits?.length || 0;
        const message = event.payload.commits?.[0]?.message 
            || 'pushed code';

        return `
            <div class="activity-item">
                <span class="activity-dot"></span>
                <div class="activity-text">
                    Pushed <strong>${commits} commit${commits !== 1 
                    ? 's' : ''}</strong> to 
                    <strong>${repo}</strong>
                    <br/>
                    <span>${message}</span>
                </div>
                <span class="activity-time">
                    ${timeAgo(event.created_at)}
                </span>
            </div>
        `;
    }).join('');
}

// ---- SHARE PROFILE ----
function shareProfile() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.querySelector('.share-btn');
        btn.textContent = 'Link Copied ✓';
        btn.style.background = 'var(--green)';
        setTimeout(() => {
            btn.textContent = 'Share Story →';
            btn.style.background = '';
        }, 2000);
    });
}

// ---- SHOW / HIDE STATES ----
function showLoading() {
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('errorScreen').style.display = 'none';
    document.getElementById('profileMain').style.display = 'none';
}

function showError() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'flex';
    document.getElementById('profileMain').style.display = 'none';
}

function showProfile() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'none';
    document.getElementById('profileMain').style.display = 'block';
}