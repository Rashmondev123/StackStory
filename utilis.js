// ================================
//  STACKSTORY — UTILS
//  utilis.js
// ================================

// ---- DATE HELPERS ----
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
}

function timeAgo(dateStr) {
    const now = new Date();
    const past = new Date(dateStr);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- NUMBER HELPERS ----
function shortNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
}

// ---- LANGUAGE COLORS ----
const langColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    'C++': '#f34b7d',
    'C#': '#178600',
    Shell: '#89e051',
    Vue: '#41b883',
    Dart: '#00B4AB',
};

function getLangColor(lang) {
    return langColors[lang] || '#888888';
}

// ---- PERSONALITY TYPE ----
function getPersonalityType(repos, languages) {
    const repoCount = repos.length;

    if (repoCount === 0) {
        return {
            type: 'Just Getting Started',
            emoji: '👀',
            desc: 'No public repos yet. But everyone starts somewhere.'
        };
    }

    const activeRepos = repos.filter(r => r.size > 0).length;
    const avgStars = repos.reduce(
        (s, r) => s + r.stargazers_count, 0
    ) / repoCount;
    const langCount = Object.keys(languages).length;
    const hasDescription = repos.filter(r => r.description).length;
    const descRatio = hasDescription / repoCount;

    if (repoCount >= 15 && langCount >= 4) {
        return {
            type: 'Serial Builder',
            emoji: '🔥',
            desc: 'Always building something new. Gets bored if they stay in one place too long.'
        };
    }
    if (repoCount <= 8 && activeRepos >= 3 && avgStars > 10) {
        return {
            type: 'Deep Diver',
            emoji: '🧠',
            desc: 'Picks one thing and goes all the way in. The kind of dev who actually finishes.'
        };
    }
    if (repoCount >= 8 && descRatio > 0.5 && langCount >= 2) {
        return {
            type: 'Consistent Grinder',
            emoji: '💪🏾',
            desc: 'Shows up every single day. Not flashy — just reliable and always shipping.'
        };
    }
    if (avgStars > 100 && langCount >= 2) {
        return {
            type: 'Open Source Hero',
            emoji: '⭐',
            desc: 'Builds in the open and earns trust through code. The community knows their name.'
        };
    }
    return {
        type: 'Sprinter',
        emoji: '👀',
        desc: 'Quiet for a while then suddenly drops something nobody saw coming.'
    };
}

// ---- HUMAN SUMMARY GENERATOR ----
// builds a unique paragraph from real data
// no AI needed — just smart sentence construction
function generateSummary(user, repos, languages, totalStars, personality) {
    const name = user.name || user.login;
    const joinYear = new Date(user.created_at).getFullYear();
    const yearsActive = new Date().getFullYear() - joinYear;
    const location = user.location ? `based in ${user.location}` : null;
    const langList = Object.keys(languages);
    const topLang = langList[0] || null;
    const langCount = langList.length;

    // top repo by stars
    const topRepo = [...repos].sort(
        (a, b) => b.stargazers_count - a.stargazers_count
    )[0];

    // ---- SENTENCE 1 — who they are ----
    const sentence1Options = [
        `${name} has been building on GitHub since ${joinYear}${location ? `, ${location}` : ''}.`,
        `${name} joined GitHub in ${joinYear} and has been shipping ever since${location ? ` from ${location}` : ''}.`,
        `${yearsActive > 1 ? `${yearsActive} years` : 'A year'} on GitHub, ${name} has built a reputation${location ? ` from ${location}` : ''} worth paying attention to.`,
    ];

    // ---- SENTENCE 2 — what they build ----
    let sentence2;
    if (topLang && langCount > 1) {
        sentence2 = `They primarily work in ${topLang} across ${langCount} languages, with ${repos.length} public repositories covering a range of projects.`;
    } else if (topLang) {
        sentence2 = `Their work is focused in ${topLang}, with ${repos.length} public repositories showing consistent output.`;
    } else {
        sentence2 = `With ${repos.length} public repositories, they have a solid body of work across multiple domains.`;
    }

    // ---- SENTENCE 3 — signal / impact ----
    let sentence3;
    if (totalStars > 1000) {
        sentence3 = `Their work has earned ${shortNumber(totalStars)} stars — a clear signal that other developers find value in what they ship.`;
    } else if (topRepo && topRepo.stargazers_count > 10) {
        sentence3 = `Their standout project — ${topRepo.name} — has ${topRepo.stargazers_count} stars and shows what they're capable of at their best.`;
    } else if (user.followers > 100) {
        sentence3 = `With ${shortNumber(user.followers)} developers following their work, they're building both code and credibility.`;
    } else {
        sentence3 = `As a ${personality.type}, they bring ${personality.desc.toLowerCase().replace('.', '')} — the kind of developer who shows up.`;
    }

    // pick sentence 1 variation based on join year
    // older accounts get different openers
    const s1Index = joinYear < 2018 ? 2 : joinYear < 2021 ? 1 : 0;

    return `${sentence1Options[s1Index]} ${sentence2} ${sentence3}`;
}

// ---- STACKSTORY SCORE ----
function calculateScore(user, repos, languages, totalStars) {

    // ---- OUTPUT SCORE (0-25) ----
    // based on repo count and recent activity
    let outputScore = 0;
    const repoCount = user.public_repos;
    if (repoCount >= 30) outputScore = 25;
    else if (repoCount >= 20) outputScore = 22;
    else if (repoCount >= 10) outputScore = 18;
    else if (repoCount >= 5) outputScore = 13;
    else if (repoCount >= 1) outputScore = 8;

    // ---- IMPACT SCORE (0-25) ----
    // based on stars and followers
    let impactScore = 0;

    // stars contribution (max 15)
    if (totalStars >= 10000) impactScore += 15;
    else if (totalStars >= 1000) impactScore += 12;
    else if (totalStars >= 100) impactScore += 9;
    else if (totalStars >= 10) impactScore += 6;
    else if (totalStars >= 1) impactScore += 3;

    // followers contribution (max 10)
    if (user.followers >= 10000) impactScore += 10;
    else if (user.followers >= 1000) impactScore += 8;
    else if (user.followers >= 100) impactScore += 6;
    else if (user.followers >= 10) impactScore += 4;
    else if (user.followers >= 1) impactScore += 2;

    // ---- CONSISTENCY SCORE (0-25) ----
    // based on repo descriptions, README presence
    let consistencyScore = 0;
    const withDesc = repos.filter(r => r.description).length;
    const descRatio = repos.length > 0 ? withDesc / repos.length : 0;

    if (descRatio >= 0.8) consistencyScore += 15;
    else if (descRatio >= 0.6) consistencyScore += 12;
    else if (descRatio >= 0.4) consistencyScore += 9;
    else if (descRatio >= 0.2) consistencyScore += 6;
    else consistencyScore += 2;

    // account age contribution (max 10)
    const yearsActive = new Date().getFullYear() -
        new Date(user.created_at).getFullYear();
    if (yearsActive >= 8) consistencyScore += 10;
    else if (yearsActive >= 5) consistencyScore += 8;
    else if (yearsActive >= 3) consistencyScore += 6;
    else if (yearsActive >= 1) consistencyScore += 4;
    else consistencyScore += 2;

    // ---- RANGE SCORE (0-25) ----
    // based on language variety and repo diversity
    let rangeScore = 0;
    const langCount = Object.keys(languages).length;

    if (langCount >= 8) rangeScore += 15;
    else if (langCount >= 5) rangeScore += 12;
    else if (langCount >= 3) rangeScore += 9;
    else if (langCount >= 2) rangeScore += 6;
    else if (langCount >= 1) rangeScore += 3;

    // repo variety (max 10)
    const activeRepos = repos.filter(r => r.size > 0).length;
    const activeRatio = repos.length > 0 ? activeRepos / repos.length : 0;
    if (activeRatio >= 0.8) rangeScore += 10;
    else if (activeRatio >= 0.6) rangeScore += 8;
    else if (activeRatio >= 0.4) rangeScore += 6;
    else if (activeRatio >= 0.2) rangeScore += 4;
    else rangeScore += 2;

    // ---- TOTAL ----
    const total = outputScore + impactScore + consistencyScore + rangeScore;

    // ---- GRADE ----
    let grade, gradeLabel;
    if (total >= 90) { grade = 'A+'; gradeLabel = 'Exceptional'; }
    else if (total >= 80) { grade = 'A'; gradeLabel = 'Strong Candidate'; }
    else if (total >= 70) { grade = 'B+'; gradeLabel = 'Solid Profile'; }
    else if (total >= 60) { grade = 'B'; gradeLabel = 'Good Foundation'; }
    else if (total >= 50) { grade = 'C+'; gradeLabel = 'Developing'; }
    else if (total >= 40) { grade = 'C'; gradeLabel = 'Early Stage'; }
    else { grade = 'D'; gradeLabel = 'Just Getting Started'; }

    return {
        total,
        grade,
        gradeLabel,
        breakdown: {
            output: outputScore,
            impact: impactScore,
            consistency: consistencyScore,
            range: rangeScore
        }
    };
}
