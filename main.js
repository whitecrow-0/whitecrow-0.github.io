/* ── MOBILE MENU ── */
const menuBtn   = document.getElementById('menuBtn');
const navDrawer = document.getElementById('navDrawer');

menuBtn.addEventListener('click', () => {
  const isOpen = navDrawer.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', isOpen);
});
document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', () => {
    navDrawer.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

/* ── CUSTOM CURSOR (event delegation — no duplicate listeners) ── */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

document.addEventListener('mouseover', e => {
  if (e.target.closest('a, button, .lang-card, .repo-card, .modal-btn')) {
    cursor.classList.add('hovering');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('a, button, .lang-card, .repo-card, .modal-btn')) {
    cursor.classList.remove('hovering');
  }
});

/* ── NAV SCROLL ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── ACTIVE NAV LINK on SCROLL ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === entry.target.id);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(sec => sectionObserver.observe(sec));

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

/* ── COUNT-UP ANIMATION for stats ── */
function animateCount(el, target, duration = 1200) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const count = parseInt(el.dataset.count, 10);
      if (!isNaN(count)) animateCount(el, count);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-count]').forEach(el => statObserver.observe(el));

/* ── REPO MODAL ── */
const repoModal  = document.getElementById('repoModal');
const modalTitle = document.getElementById('modalTitle');
const modalVisit = document.getElementById('modalVisit');
const modalCode  = document.getElementById('modalCode');
const modalClose = document.getElementById('modalClose');

function openModal(name, homepage, repoUrl) {
  modalTitle.textContent = name;
  if (homepage && homepage.startsWith('http')) {
    modalVisit.href = homepage;
    modalVisit.style.display = 'flex';
  } else {
    modalVisit.style.display = 'none';
  }
  modalCode.href = repoUrl;
  repoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  repoModal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
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

/* Static fallback repos shown if GitHub API fails */
const FALLBACK_REPOS = [
  {
    name: 'whitecrow-0',
    description: 'Profile repository.',
    language: 'HTML',
    stargazers_count: 0,
    fork: false,
    html_url: 'https://github.com/whitecrow-0',
    homepage: ''
  }
];

async function loadRepos() {
  const container = document.getElementById('repos-container');
  try {
    const res = await fetch(
      'https://api.github.com/users/whitecrow-0/repos?sort=updated&per_page=12&type=public'
    );
    if (!res.ok) throw new Error('GitHub API error: ' + res.status);

    const allRepos = await res.json();
    const repos = allRepos.filter(r => 
      !r.name.toLowerCase().includes('github.io') &&
      r.name.toLowerCase() !== 'portfolio'
    );

    if (!repos.length) throw new Error('No repos');
    renderRepos(container, repos);

  } catch (err) {
    console.warn('GitHub API failed, using fallback.', err);
    renderRepos(container, FALLBACK_REPOS, true);
  }
}

function renderRepos(container, repos, isFallback = false) {
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
        data-url="${repo.html_url}"
        tabindex="0"
        role="button"
        aria-label="Open ${repo.name}">
        <div class="repo-name">${repo.name}</div>
        <div class="repo-desc">${desc}</div>
        <div class="repo-meta">
          ${lang ? `<span class="repo-lang"><span class="lang-dot" style="background:${color}"></span>${lang}</span>` : ''}
          <span class="repo-stars"><i class="fa-solid fa-star"></i> ${repo.stargazers_count}</span>
          ${repo.fork ? '<span class="repo-fork"><i class="fa-solid fa-code-fork"></i> fork</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  if (isFallback) {
    container.innerHTML += `
      <div class="repos-fallback">
        Live fetch unavailable —
        <a href="https://github.com/whitecrow-0" target="_blank" rel="noopener noreferrer">
          view all on GitHub <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>`;
  }

  /* Repo card click & keyboard */
  container.querySelectorAll('.repo-card').forEach(card => {
    const open = () => openModal(card.dataset.name, card.dataset.homepage, card.dataset.url);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });
}

loadRepos();
