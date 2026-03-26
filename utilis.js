/*helper functions*/

// ================================
//  STACKSTORY — UTILS
//  utils.js
// ================================

// Format date → "Mar 2024"
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
}

// Time ago → "3 days ago"
function timeAgo(dateStr) {
    const now = new Date();
    const past = new Date(dateStr);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
}

// Capitalize first letter
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Shorten large numbers → 1.2k
function shortNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
}

// Get language color
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
};

function getLangColor(lang) {
    return langColors[lang] || '#888888';
}

// Calculate developer personality type
function getPersonalityType(repos, totalCommits) {
    const avgCommitsPerRepo = totalCommits / (repos.length || 1);
    const repoCount = repos.length;

    if (repoCount > 20 && avgCommitsPerRepo < 20) {
        return {
            type: 'Serial Builder',
            emoji: '🚀',
            desc: 'Always building something new. Gets bored if they stay in one place too long.'

        };
    }
    if (repoCount <= 10 && avgCommitsPerRepo > 50) {
        return {
            type: 'Deep Diver',
            emoji: '🔬',
            desc: 'Picks one thing and goes all the way in. The kind of dev who actually finishes.'

        };
    }
    if (repoCount > 10 && avgCommitsPerRepo > 40) {
        return {
            type: 'Consistent Grinder',
            emoji: '⚙️',
            desc: 'Shows up every single day. Not flashy — just reliable and always shipping.'
        };
    }
    return {
        type: 'Sprinter',
        emoji: '⚡',
        desc: 'Quiet for a while then suddenly drops something nobody saw coming.'
    };
}
