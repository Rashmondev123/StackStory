# ✦ StackStory

> Turn any GitHub profile into a story recruiters actually understand.

**Live:** [stackstory.vercel.app](https://stackstory.vercel.app)  
**Built by:** [@he_is_rashmon](https://x.com/he_is_rashmon)  
**Build log:** [30 days in public on X](https://x.com/he_is_rashmon)

---

## The Problem

GitHub is the world's largest developer portfolio — but it's unreadable to anyone who isn't a developer. Recruiters see repos and green squares. They don't see growth, consistency, or story.

## The Solution

Enter any GitHub username → StackStory fetches their profile, repos, commits, and activity → renders it as a clean human-readable story in seconds.

---

## Features

- **Developer Profile** — avatar, bio, stats, location
- **Stat Cards** — repos, followers, stars, join date
- **Developer Personality Type** — algorithm reads commit patterns and assigns a type
- **Recruiter Summary** — auto-generated paragraph from real GitHub data
- **Recruiter Signals** — Best For / Works Like / Watch For
- **Top Repositories** — sorted by stars with language and fork count
- **Language Breakdown** — visual bar chart of every language used
- **Recent Activity** — last commits in plain English
- **Shareable URL** — one link per developer

## Coming Soon

- 👥 Compare Two Developers side by side
- 📧 Send to Recruiter Card — one click cold email generator
- 📅 Activity Heatmap — 12 month commit calendar

---

## Tech Stack

- HTML5
- CSS3 — custom design system, CSS variables
- Vanilla JavaScript — no frameworks
- GitHub REST API — public, no auth required
- Vercel — free static hosting

---

## Run Locally

No build step. No dependencies. Just open the file.
```bash
git clone https://github.com/he-is-rashmon/stackstory.git
cd stackstory
open index.html
```

---

## Project Structure
```
stackstory/
├── index.html          # landing page
├── profile.html        # developer story page
├── 404.html            # not found
├── css/
│   ├── main.css        # design system + variables
│   ├── landing.css     # landing page styles
│   └── profile.css     # profile page styles
├── js/
│   ├── api.js          # GitHub API calls
│   ├── render.js       # DOM rendering functions
│   ├── utils.js        # helper functions
│   ├── landing.js      # landing page logic
│   └── profile.js      # profile page logic
└── assets/
```

---

## 30 Day Build Log

| Day | What shipped |
|-----|-------------|
| 1 | Project setup, design system, navbar, hero |
| 2 | GitHub API integration, tested on Linus Torvalds |
| 3 | Profile page, render layer, recruiter signals |
| 4 | Shareable URL, landing page sections, GitHub push |

---

## Author

Built by **Anjola (Rashmon)** — self-taught frontend developer, SDR, content strategist.

- X: [@he_is_rashmon](https://x.com/he_is_rashmon)
- LinkedIn: [Anjola Rasheed](https://linkedin.com/in/anjola-rasheed-5020843b7)
- Portfolio: [rashmon-port.vercel.app](https://rashmon-port.vercel.app)

---

*Building in public for 30 days. Follow the journey on X.*
