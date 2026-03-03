/* ── MOBILE MENU ── */
const menuBtn   = document.getElementById('menuBtn');
const navDrawer = document.getElementById('navDrawer');

menuBtn.addEventListener('click', () => {
  navDrawer.classList.toggle('open');
});
document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', () => navDrawer.classList.remove('open'));
});

/* ── CUSTOM CURSOR ── */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

function attachCursorListeners() {
  document.querySelectorAll('a, button, .lang-card, .repo-card, .modal-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
}
attachCursorListeners();

/* ── NAV SCROLL ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── REVEAL ON SCROLL ── */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => revealObserver.observe(el));

/* ── REPO MODAL ── */
const repoModal    = document.getElementById('repoModal');
const modalTitle   = document.getElementById('modalTitle');
const modalVisit   = document.getElementById('modalVisit');
const modalCode    = document.getElementById('modalCode');
const modalClose   = document.getElementById('modalClose');

function openModal(name, homepage, repoUrl) {
  modalTitle.textContent = name;
  if (homepage && homepage.startsWith('http')) {
    modalVisit.href = homepage;
    modalVisit.style.display = 'block';
  } else {
    modalVisit.style.display = 'none';
  }
  modalCode.href = repoUrl;
  repoModal.classList.add('open');
}

function closeModal() { repoModal.classList.remove('open'); }

modalClose.addEventListener('click', closeModal);
modalVisit.addEventListener('click', closeModal);
modalCode.addEventListener('click', closeModal);
repoModal.addEventListener('click', e => { if (e.target === repoModal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── GITHUB REPOS ── */
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Ruby:       '#701516',
  Shell:      '#89e051',
  Vue:        '#41b883',
  default:    '#888'
};

async function loadRepos() {
  const container = document.getElementById('repos-container');
  try {
    const res = await fetch(
      'https://api.github.com/users/whitecrow-0/repos?sort=updated&per_page=12&type=public'
    );
    if (!res.ok) throw new Error('GitHub API error: ' + res.status);

    const allRepos = await res.json();
    const repos = allRepos.filter(r => !r.name.toLowerCase().includes('github.io'));

    if (!repos.length) {
      container.innerHTML = '<div class="repos-loading">No public repositories found.</div>';
      return;
    }

    container.innerHTML = repos.map(repo => {
      const lang  = repo.language || '';
      const color = LANG_COLORS[lang] || LANG_COLORS.default;
      const desc  = repo.description
        ? repo.description.slice(0, 90) + (repo.description.length > 90 ? '…' : '')
        : 'No description provided.';

      return `
        <div class="repo-card"
          data-name="${repo.name}"
          data-homepage="${repo.homepage || ''}"
          data-url="${repo.html_url}">
          <div class="repo-name">${repo.name}</div>
          <div class="repo-desc">${desc}</div>
          <div class="repo-meta">
            ${lang ? `<span class="repo-lang"><span class="lang-dot" style="background:${color}"></span>${lang}</span>` : ''}
            <span class="repo-stars">★ ${repo.stargazers_count}</span>
            ${repo.fork ? '<span style="opacity:0.5">fork</span>' : ''}
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.repo-card').forEach(card => {
      card.addEventListener('click', () => {
        openModal(card.dataset.name, card.dataset.homepage, card.dataset.url);
      });
    });

    attachCursorListeners();

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="repos-loading">
        Couldn't load repos live —
        <a href="https://github.com/whitecrow-0" target="_blank" style="color:var(--accent)">
          view on GitHub ↗
        </a>
      </div>`;
  }
}

loadRepos();