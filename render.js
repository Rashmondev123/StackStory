// ================================
//  STACKSTORY — RENDER
//  render.js
// ================================

// ---- RENDER USER HEADER ----
function renderUserHeader(user) {
    document.getElementById('userAvatar').src = user.avatar_url;
    document.getElementById('userAvatar').alt = user.name || user.login;
    document.getElementById('userName').textContent = user.name || user.login;
    document.getElementById('userLogin').textContent = '@' + user.login;
    document.getElementById('userBio').textContent = user.bio || 'No bio yet.';

    const meta = document.getElementById('userMeta');
    let metaHTML = '';
    if (user.location) metaHTML += `<span>📍 ${user.location}</span>`;
    if (user.company) metaHTML += `<span>🏢 ${user.company}</span>`;
    if (user.blog) metaHTML += `<span>🔗 <a href="${user.blog}" target="_blank" style="color:var(--text);">${user.blog}</a></span>`;
    meta.innerHTML = metaHTML;

    document.title = `${user.name || user.login} — StackStory`;
}

// ---- RENDER STAT CARDS ----
function renderStats(user, repos, totalStars) {
    const grid = document.getElementById('statsGrid');
    const stats = [
        { label: 'Repositories', value: shortNumber(user.public_repos), sub: 'public repos' },
        { label: 'Followers', value: shortNumber(user.followers), sub: 'people following' },
        { label: 'Following', value: shortNumber(user.following), sub: 'people followed' },
        { label: 'Total Stars', value: shortNumber(totalStars), sub: 'across all repos' },
        { label: 'Member Since', value: formatDate(user.created_at), sub: 'joined GitHub' },
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
function renderPersonality(personality, user, totalStars, languages, aiSummary) {

    // signals for each personality type
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
        'Open Source Hero': {
            bestFor: 'Developer tools, open source teams, community projects',
            worksLike: 'Builds in the open, documents well, thinks about other devs',
            watchFor: 'May prioritize quality over speed of delivery'
        },
        'Just Getting Started': {
            bestFor: 'Junior roles, internships, apprenticeships',
            worksLike: 'Eager to learn, fresh perspective, high coachability',
            watchFor: 'Still building their public portfolio — check private work too'
        },
        'Sprinter': {
            bestFor: 'Contract work, hackathons, short intense projects',
            worksLike: 'Intense bursts of energy followed by reflection',
            watchFor: 'Works best with clear deadlines and defined scope'
        }
    };

    // ← THIS was the missing line
    const signal = signals[personality.type] || signals['Sprinter'];

    // use AI summary if passed, fallback to hardcoded
    const summary = aiSummary ||
        `${user.name || user.login} has ${user.public_repos} public repos on GitHub 
        and has been active since ${new Date(user.created_at).getFullYear()}. 
        As a ${personality.type}, they ${personality.desc.toLowerCase()}`;

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

        <div class="recruiter-summary">
            <p class="recruiter-summary-label">Recruiter Summary</p>
            <p class="recruiter-summary-text">${summary}</p>
        </div>

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
        grid.innerHTML = `<p style="color:var(--muted);font-size:.9rem;">No public repositories yet.</p>`;
        return;
    }

    grid.innerHTML = repos.map(repo => `
        <a href="${repo.html_url}" target="_blank" class="repo-card">
            <p class="repo-name">${repo.name}</p>
            <p class="repo-desc">${repo.description || 'No description provided.'}</p>
            <div class="repo-meta">
                ${repo.language ? `
                <span>
                    <span class="repo-lang-dot" style="background:${getLangColor(repo.language)};"></span>
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
    const total = Object.values(languages).reduce((sum, count) => sum + count, 0);

    if (total === 0) {
        container.innerHTML = `<p style="color:var(--muted);font-size:.9rem;">No language data available.</p>`;
        return;
    }

    const sorted = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    container.innerHTML = sorted.map(([lang, count]) => {
        const percent = Math.round((count / total) * 100);
        return `
            <div class="lang-row">
                <span class="lang-name">${lang}</span>
                <div class="lang-bar-wrap">
                    <div class="lang-bar" style="width:${percent}%;background:${getLangColor(lang)};"></div>
                </div>
                <span class="lang-percent">${percent}%</span>
            </div>
        `;
    }).join('');
}

// ---- RENDER ACTIVITY FEED ----
function renderActivity(events) {
    const feed = document.getElementById('activityFeed');
    const pushEvents = events.filter(e => e.type === 'PushEvent').slice(0, 8);

    if (pushEvents.length === 0) {
        feed.innerHTML = `<p style="color:var(--muted);font-size:.9rem;">No recent activity found.</p>`;
        return;
    }

    feed.innerHTML = pushEvents.map(event => {
        const repo = event.repo.name.split('/')[1];
        const commits = event.payload.commits?.length || 0;
        const message = event.payload.commits?.[0]?.message || 'pushed code';
        return `
            <div class="activity-item">
                <span class="activity-dot"></span>
                <div class="activity-text">
                    Pushed <strong>${commits} commit${commits !== 1 ? 's' : ''}</strong> 
                    to <strong>${repo}</strong>
                    <br/><span>${message}</span>
                </div>
                <span class="activity-time">${timeAgo(event.created_at)}</span>
            </div>
        `;
    }).join('');
}

// ---- RENDER STACKSTORY SCORE ----
function renderScore(score) {
    const container = document.getElementById('scoreCard');
    if (!container) return;

    const { total, grade, gradeLabel, breakdown } = score;

    // color based on grade
    const gradeColor = total >= 80 ? '#16A34A'
        : total >= 60 ? '#CA8A04'
        : '#DC2626';

    container.innerHTML = `
        <div class="score-header">
            <div class="score-left">
                <p class="score-label">StackStory Score</p>
                <div class="score-total-wrap">
                    <span class="score-total">${total}</span>
                    <span class="score-max">/100</span>
                </div>
                <p class="score-grade" style="color:${gradeColor};">
                    ${grade} — ${gradeLabel}
                </p>
            </div>
            <div class="score-ring">
                <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38"
                        fill="none" stroke="var(--border)"
                        stroke-width="7"/>
                    <circle cx="45" cy="45" r="38"
                        fill="none" stroke="${gradeColor}"
                        stroke-width="7"
                        stroke-linecap="round"
                        stroke-dasharray="${2 * Math.PI * 38}"
                        stroke-dashoffset="${2 * Math.PI * 38 * (1 - total / 100)}"
                        transform="rotate(-90 45 45)"
                        style="transition: stroke-dashoffset 1s ease;"/>
                    <text x="45" y="50" text-anchor="middle"
                        font-size="18" font-weight="700"
                        fill="var(--text)" font-family="'Bebas Neue',sans-serif"
                        letter-spacing="1">${total}</text>
                </svg>
            </div>
        </div>

        <div class="score-breakdown">
            ${[
                { label: 'Output', key: 'output', val: breakdown.output },
                { label: 'Impact', key: 'impact', val: breakdown.impact },
                { label: 'Consistency', key: 'consistency', val: breakdown.consistency },
                { label: 'Range', key: 'range', val: breakdown.range },
            ].map(item => `
                <div class="score-row">
                    <span class="score-row-label">${item.label}</span>
                    <div class="score-bar-wrap">
                        <div class="score-bar"
                            style="width:${(item.val / 25) * 100}%;
                            background:${gradeColor};">
                        </div>
                    </div>
                    <span class="score-row-val">${item.val}/25</span>
                </div>
            `).join('')}
        </div>
    `;
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


// ---- RECRUITER CARD ----
let currentProfileData = null;

function openRecruiterCard() {
    if (!currentProfileData) return;

    const { user, personality, languages, totalStars, topRepos } = currentProfileData;
    const name = user.name || user.login;
    const topLang = Object.keys(languages)[0] || 'multiple languages';
    const topRepo = topRepos[0]?.name || 'various projects';
    const profileURL = window.location.href;
    const joinYear = new Date(user.created_at).getFullYear();

    // Subject line
    const subject = `Developer Profile — ${name} (${personality.type})`;
    document.getElementById('emailSubject').textContent = subject;

    // Email body
    const body =
`Hi [Recruiter Name],

I wanted to share my developer profile with you — I think there might be a good fit worth exploring.

Here's a quick snapshot:

- GitHub since ${joinYear} — ${user.public_repos} public repositories
- Primary language: ${topLang}
- Total stars earned: ${totalStars > 0 ? totalStars.toLocaleString() : 'Growing'}
- Notable work: ${topRepo}
- Developer type: ${personality.type} — ${personality.desc}
- Followers: ${user.followers.toLocaleString()} developers following my work

You can see my full developer story here:
${profileURL}

The link above shows my repositories, language breakdown, recent activity, and a recruiter summary — everything you'd want to know without having to dig through 40 repos.

Happy to jump on a quick call if there's a role that might be a fit.

Best,
${name}`;

    document.getElementById('emailBody').textContent = body;
    document.getElementById('recruiterModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeRecruiterCard() {
    document.getElementById('recruiterModal').classList.remove('open');
    document.body.style.overflow = '';
}

function copySubject() {
    const subject = document.getElementById('emailSubject').textContent;
    navigator.clipboard.writeText(subject).then(() => {
        const btn = event.target;
        btn.textContent = 'Copied ✓';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
}

function copyFullEmail() {
    const subject = document.getElementById('emailSubject').textContent;
    const body = document.getElementById('emailBody').textContent;
    const full = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(full).then(() => {
        const btn = document.getElementById('copyEmailBtn');
        btn.textContent = 'Copied ✓';
        btn.style.background = 'var(--green)';
        setTimeout(() => {
            btn.textContent = 'Copy Full Email';
            btn.style.background = '';
        }, 2000);
    });
}

// close on escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeRecruiterCard();
});

// ---- RENDER PORTFOLIO CHECKER ----
function renderPortfolioChecker(user, repos) {
    const container = document.getElementById('portfolioChecker');
    if (!container) return;

    const result = checkPortfolioReady(user, repos);
    const { score, grade, gradeLabel, gradeColor, checks, failedTips } = result;

    // group checks by category
    const categories = [...new Set(checks.map(c => c.category))];

    container.innerHTML = `
        <div class="checker-header">
            <div class="checker-left">
                <p class="checker-label">Portfolio Ready Checker</p>
                <div class="checker-score-wrap">
                    <span class="checker-score" style="color:${gradeColor};">
                        ${score}
                    </span>
                    <span class="checker-max">/100</span>
                </div>
                <p class="checker-grade" style="color:${gradeColor};">
                    ${grade} — ${gradeLabel}
                </p>
            </div>
            <div class="checker-ring">
                <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38"
                        fill="none" stroke="var(--border)"
                        stroke-width="7"/>
                    <circle cx="45" cy="45" r="38"
                        fill="none" stroke="${gradeColor}"
                        stroke-width="7"
                        stroke-linecap="round"
                        stroke-dasharray="${2 * Math.PI * 38}"
                        stroke-dashoffset="${2 * Math.PI * 38 * (1 - score / 100)}"
                        transform="rotate(-90 45 45)"
                        style="transition:stroke-dashoffset 1s ease;"/>
                    <text x="45" y="50" text-anchor="middle"
                        font-size="18" font-weight="700"
                        fill="var(--text)"
                        font-family="'Bebas Neue',sans-serif"
                        letter-spacing="1">${score}</text>
                </svg>
            </div>
        </div>

        <!-- CHECKS BY CATEGORY -->
        <div class="checker-checks">
            ${categories.map(cat => `
                <div class="checker-category">
                    <p class="checker-cat-label">${cat}</p>
                    ${checks.filter(c => c.category === cat).map(check => `
                        <div class="checker-item">
                            <span class="checker-icon">
                                ${check.passed ? '✓' : '✗'}
                            </span>
                            <span class="checker-item-label 
                                ${check.passed ? 'passed' : 'failed'}">
                                ${check.label}
                            </span>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>

        <!-- TIPS FOR IMPROVEMENT -->
        ${failedTips.length > 0 ? `
        <div class="checker-tips">
            <p class="checker-tips-label">
                How to improve your score
            </p>
            ${failedTips.map(tip => `
                <div class="checker-tip">
                    <span class="tip-arrow">→</span>
                    <span>${tip}</span>
                </div>
            `).join('')}
        </div>` : `
        <div class="checker-tips">
            <p style="font-size:.88rem;color:var(--green);font-weight:600;">
                ✓ Your portfolio is looking strong. Keep shipping.
            </p>
        </div>`}
    `;
                        }
