// ================================
//  STACKSTORY — COMPARE
//  compare.js
// ================================

function fillExample(u1, u2) {
    document.getElementById('dev1Input').value = u1;
    document.getElementById('dev2Input').value = u2;
}

function resetCompare() {
    document.getElementById('compareResults').style.display = 'none';
    document.getElementById('compareError').style.display = 'none';
    document.getElementById('compareLoading').style.display = 'none';
}

async function runCompare() {
    const u1 = document.getElementById('dev1Input').value.trim();
    const u2 = document.getElementById('dev2Input').value.trim();

    if (!u1 || !u2) {
        alert('Please enter both GitHub usernames');
        return;
    }

    if (u1 === u2) {
        alert('Enter two different usernames');
        return;
    }

    // update URL so share link works
    const newURL = `${window.location.pathname}?dev1=${u1}&dev2=${u2}`;
    window.history.pushState({}, '', newURL);

    // show loading
    document.getElementById('compareLoading').style.display = 'flex';
    document.getElementById('compareResults').style.display = 'none';
    document.getElementById('compareError').style.display = 'none';

    try {
        const [d1, d2] = await Promise.all([
            fetchAllData(u1),
            fetchAllData(u2)
        ]);

        renderCompare(d1, d2);

        document.getElementById('compareLoading').style.display = 'none';
        document.getElementById('compareResults').style.display = 'block';

    } catch (err) {
        console.error(err);
        document.getElementById('compareLoading').style.display = 'none';
        document.getElementById('compareError').style.display = 'block';
    }
}

// ---- COMPATIBILITY ALGORITHM ----
function calculateCompatibility(d1, d2) {
    let score = 0;

    // 1. Shared languages (0-30)
    const langs1 = new Set(Object.keys(d1.languages));
    const langs2 = new Set(Object.keys(d2.languages));
    const shared = [...langs1].filter(l => langs2.has(l));
    const sharedRatio = shared.length /
        Math.max(langs1.size, langs2.size, 1);
    score += Math.round(sharedRatio * 30);

    // 2. Personality pairing (0-30)
    const pairingScore = getPersonalityPairing(
        d1.personality.type,
        d2.personality.type
    );
    score += pairingScore;

    // 3. Score similarity (0-20)
    // closer scores = more balanced team
    const scoreDiff = Math.abs(d1.score.total - d2.score.total);
    if (scoreDiff <= 5) score += 20;
    else if (scoreDiff <= 15) score += 15;
    else if (scoreDiff <= 25) score += 10;
    else if (scoreDiff <= 40) score += 5;

    // 4. Activity overlap (0-20)
    // both have recent events = both active
    const bothActive = d1.events.length > 5 && d2.events.length > 5;
    const oneActive = d1.events.length > 0 || d2.events.length > 0;
    if (bothActive) score += 20;
    else if (oneActive) score += 10;

    return Math.min(score, 100);
}

// ---- PERSONALITY PAIRING MATRIX ----
function getPersonalityPairing(type1, type2) {
    const matrix = {
        'Serial Builder': {
            'Deep Diver': 28,
            'Consistent Grinder': 25,
            'Open Source Hero': 22,
            'Serial Builder': 15,
            'Sprinter': 18,
            'Just Getting Started': 20
        },
        'Deep Diver': {
            'Serial Builder': 28,
            'Consistent Grinder': 26,
            'Open Source Hero': 24,
            'Deep Diver': 18,
            'Sprinter': 20,
            'Just Getting Started': 22
        },
        'Consistent Grinder': {
            'Serial Builder': 25,
            'Deep Diver': 26,
            'Open Source Hero': 28,
            'Consistent Grinder': 20,
            'Sprinter': 22,
            'Just Getting Started': 18
        },
        'Open Source Hero': {
            'Serial Builder': 22,
            'Deep Diver': 24,
            'Consistent Grinder': 28,
            'Open Source Hero': 20,
            'Sprinter': 18,
            'Just Getting Started': 25
        },
        'Sprinter': {
            'Serial Builder': 18,
            'Deep Diver': 20,
            'Consistent Grinder': 22,
            'Open Source Hero': 18,
            'Sprinter': 15,
            'Just Getting Started': 20
        },
        'Just Getting Started': {
            'Serial Builder': 20,
            'Deep Diver': 22,
            'Consistent Grinder': 18,
            'Open Source Hero': 25,
            'Sprinter': 20,
            'Just Getting Started': 15
        }
    };

    return matrix[type1]?.[type2] || 15;
}

// ---- TEAM NARRATIVE GENERATOR ----
function generateTeamNarrative(d1, d2, compatScore) {
    const n1 = d1.user.name || d1.user.login;
    const n2 = d2.user.name || d2.user.login;
    const t1 = d1.personality.type;
    const t2 = d2.personality.type;

    // high compatibility
    if (compatScore >= 80) {
        const narratives = [
            `${n1} and ${n2} are a rare pairing. A ${t1} and a ${t2} — between them, ideas get built fast and built right. The kind of team that ships before most people finish planning.`,
            `Put ${n1} and ${n2} in the same room and things get done. Their styles complement more than they clash — one pushes forward, the other makes sure it holds together.`,
        ];
        return narratives[Math.floor(Math.random() * narratives.length)];
    }

    // medium compatibility
    if (compatScore >= 60) {
        const narratives = [
            `${n1} and ${n2} would work well together with the right structure. A ${t1} and a ${t2} need clear lanes — but when they find their rhythm, the output is solid.`,
            `There's real potential here. ${n1}'s ${t1} energy and ${n2}'s ${t2} approach balance each other out — different enough to cover ground, similar enough to stay aligned.`,
        ];
        return narratives[Math.floor(Math.random() * narratives.length)];
    }

    // low compatibility
    const narratives = [
        `${n1} and ${n2} are built differently — and that's not a bad thing. A ${t1} and a ${t2} will push each other, but they'll need a strong process to stay in sync.`,
        `This pairing comes with friction — but friction creates heat. ${n1} and ${n2} would challenge each other in ways that could either slow things down or push both to their best work.`,
    ];
    return narratives[Math.floor(Math.random() * narratives.length)];
}

// ---- RENDER COMPARE ---- 
function renderCompare(d1, d2) {
    const compatScore = calculateCompatibility(d1, d2);

    // color
    const color = compatScore >= 80 ? '#16A34A'
        : compatScore >= 60 ? '#CA8A04'
        : '#DC2626';

    const verdict = compatScore >= 80 ? 'Strong Team'
        : compatScore >= 60 ? 'Good Pairing'
        : compatScore >= 40 ? 'Worth Trying'
        : 'Challenging Pair';

    // ---- SCORE CARD ----
    document.getElementById('compatScoreCard').innerHTML = `
        <p class="compat-label">Team Compatibility Score</p>
        <div class="compat-number" style="color:${color};">${compatScore}</div>
        <p class="compat-verdict" style="color:${color};">${verdict}</p>
        <div class="compat-bar-wrap">
            <div class="compat-bar"
                style="width:${compatScore}%;background:${color};">
            </div>
        </div>
        <p style="font-size:.78rem;color:var(--muted);margin-top:.75rem;">
            Based on shared languages, personality pairing,
            credibility scores, and activity overlap
        </p>
    `;

    // ---- NARRATIVE ----
    document.getElementById('teamNarrative').innerHTML = `
        <p class="narrative-label">Team Story</p>
        <p class="narrative-text">"${generateTeamNarrative(d1, d2, compatScore)}"</p>
    `;

    // ---- DEV CARDS ----
    [d1, d2].forEach((dev, i) => {
        const wins = compareWins(d1, d2);
        document.getElementById(`dev${i + 1}Card`).innerHTML = `
            <div class="dev-card-header">
                <img class="dev-avatar"
                    src="${dev.user.avatar_url}"
                    alt="${dev.user.login}">
                <div>
                    <p class="dev-card-name">
                        ${dev.user.name || dev.user.login}
                    </p>
                    <p class="dev-card-login">@${dev.user.login}</p>
                </div>
            </div>

            <div class="dev-stat-row">
                <span class="dev-stat-key">StackStory Score</span>
                <span class="dev-stat-val ${wins.score === i + 1 ? 'dev-stat-win' : ''}">
                    ${dev.score.total}/100 ${wins.score === i + 1 ? '↑' : ''}
                </span>
            </div>
            <div class="dev-stat-row">
                <span class="dev-stat-key">Repositories</span>
                <span class="dev-stat-val ${wins.repos === i + 1 ? 'dev-stat-win' : ''}">
                    ${dev.user.public_repos} ${wins.repos === i + 1 ? '↑' : ''}
                </span>
            </div>
            <div class="dev-stat-row">
                <span class="dev-stat-key">Total Stars</span>
                <span class="dev-stat-val ${wins.stars === i + 1 ? 'dev-stat-win' : ''}">
                    ${shortNumber(dev.totalStars)} ${wins.stars === i + 1 ? '↑' : ''}
                </span>
            </div>
            <div class="dev-stat-row">
                <span class="dev-stat-key">Followers</span>
                <span class="dev-stat-val ${wins.followers === i + 1 ? 'dev-stat-win' : ''}">
                    ${shortNumber(dev.user.followers)} ${wins.followers === i + 1 ? '↑' : ''}
                </span>
            </div>
            <div class="dev-stat-row">
                <span class="dev-stat-key">Languages</span>
                <span class="dev-stat-val ${wins.langs === i + 1 ? 'dev-stat-win' : ''}">
                    ${Object.keys(dev.languages).length} ${wins.langs === i + 1 ? '↑' : ''}
                </span>
            </div>

            <div class="dev-personality-badge">
                ${dev.personality.emoji} ${dev.personality.type}
            </div>

            <a href="profile.html?user=${dev.user.login}"
                target="_blank"
                style="display:inline-block;margin-top:1rem;font-size:.78rem;color:var(--text-secondary);border-bottom:1px solid var(--border);transition:color .2s;"
                onmouseover="this.style.color='var(--text)'"
                onmouseout="this.style.color='var(--text-secondary)'">
                View full story →
            </a>
        `;
    });

    // ---- SHARED LANGUAGES ----
    const langs1 = new Set(Object.keys(d1.languages));
    const langs2 = new Set(Object.keys(d2.languages));
    const shared = [...langs1].filter(l => langs2.has(l));
    const onlyD1 = [...langs1].filter(l => !langs2.has(l));
    const onlyD2 = [...langs2].filter(l => !langs1.has(l));

    document.getElementById('sharedSection').innerHTML = `
        <p class="shared-title">Language Overlap</p>

        ${shared.length > 0 ? `
        <p style="font-size:.78rem;color:var(--muted);margin-bottom:.6rem;">
            Both write
        </p>
        <div class="shared-langs" style="margin-bottom:1rem;">
            ${shared.map(l => `
                <span class="shared-lang-tag">
                    <span class="lang-dot"
                        style="background:${getLangColor(l)};"></span>
                    ${l}
                </span>
            `).join('')}
        </div>` : `
        <p style="font-size:.85rem;color:var(--muted);margin-bottom:1rem;">
            No shared languages — complementary stacks.
        </p>`}

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:.5rem;">
            <div>
                <p style="font-size:.72rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem;">
                    Only ${d1.user.login}
                </p>
                <div class="shared-langs">
                    ${onlyD1.length > 0 ? onlyD1.map(l => `
                        <span class="shared-lang-tag">
                            <span class="lang-dot"
                                style="background:${getLangColor(l)};"></span>
                            ${l}
                        </span>
                    `).join('') : `<span style="font-size:.8rem;color:var(--muted);">—</span>`}
                </div>
            </div>
            <div>
                <p style="font-size:.72rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem;">
                    Only ${d2.user.login}
                </p>
                <div class="shared-langs">
                    ${onlyD2.length > 0 ? onlyD2.map(l => `
                        <span class="shared-lang-tag">
                            <span class="lang-dot"
                                style="background:${getLangColor(l)};"></span>
                            ${l}
                        </span>
                    `).join('') : `<span style="font-size:.8rem;color:var(--muted);">—</span>`}
                </div>
            </div>
        </div>
    `;
}

// ---- WHO WINS EACH STAT ----
function compareWins(d1, d2) {
    return {
        score: d1.score.total >= d2.score.total ? 1 : 2,
        repos: d1.user.public_repos >= d2.user.public_repos ? 1 : 2,
        stars: d1.totalStars >= d2.totalStars ? 1 : 2,
        followers: d1.user.followers >= d2.user.followers ? 1 : 2,
        langs: Object.keys(d1.languages).length >=
            Object.keys(d2.languages).length ? 1 : 2
    };
}

// ---- SHARE ----
function shareCompare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = event.target;
        btn.textContent = 'Link Copied ✓';
        setTimeout(() => {
            btn.textContent = 'Share This Comparison →';
        }, 2000);
    });
}

// ---- BURGER ----
document.getElementById('burger').addEventListener('click', () => {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('open');
});

// ---- AUTO LOAD FROM URL ----
(function checkURL() {
    const params = new URLSearchParams(window.location.search);
    const dev1 = params.get('dev1');
    const dev2 = params.get('dev2');
    if (dev1 && dev2) {
        document.getElementById('dev1Input').value = dev1;
        document.getElementById('dev2Input').value = dev2;
        runCompare();
    }
})();