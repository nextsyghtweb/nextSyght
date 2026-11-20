// ---------- mobile nav ----------
const toggle = document.getElementById('menuToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));

// ---------- hero typewriter ----------
const phrases = ['Auditing your Google ranking…', 'Analyzing your competitors…', 'Checking what ChatGPT says about you…', 'Finding the fixes that win customers…'];
const typeEl = document.getElementById('typewrap');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  typeEl.textContent = phrases.join(' · ');
} else {
  let pi = 0, ci = 0, deleting = false;
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  function tick() {
    const word = phrases[pi];
    typeEl.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    typeEl.appendChild(cursor);
    if (!deleting && ci === word.length + 1) { deleting = true; setTimeout(tick, 1400); return; }
    if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    setTimeout(tick, deleting ? 35 : 65);
  }
  tick();
}

// ---------- scroll reveal ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---------- helpers ----------
function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- PROJECTS ----------
const projectGrid = document.getElementById('projectGrid');

async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();

    if (!projects.length) {
      projectGrid.innerHTML = '<p class="empty-note">No projects added yet — check back soon.</p>';
      return;
    }

    projectGrid.innerHTML = projects.map((p) => `
      <div class="project-card" data-project-title="${escapeHtml(p.title)}">
        <div class="thumb">
          ${p.image_path ? `<img src="${p.image_path}" alt="${escapeHtml(p.title)} screenshot">` : 'No image'}
        </div>
        <div class="body">
          ${p.category ? `<span class="cat">${escapeHtml(p.category)}</span>` : ''}
          <h3>${escapeHtml(p.title)}</h3>
          ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ''}
          ${p.project_url ? `<a class="visit" href="${p.project_url}" target="_blank" rel="noopener">Visit site →</a>` : ''}
        </div>
      </div>
    `).join('');

    const projectSelect = document.getElementById('enquiryProject');
    projectSelect.innerHTML = '<option value="">General enquiry</option>' + projects.map((p) =>
      `<option value="${escapeHtml(p.id)}">${escapeHtml(p.title)}</option>`
    ).join('');

    projectGrid.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('mouseenter', () => setWhatsAppProject(card.dataset.projectTitle));
      card.addEventListener('focusin', () => setWhatsAppProject(card.dataset.projectTitle));
      card.addEventListener('mouseleave', () => setWhatsAppProject(''));
      card.addEventListener('click', () => setWhatsAppProject(card.dataset.projectTitle));
    });
  } catch (err) {
    projectGrid.innerHTML = '<p class="empty-note">Could not load projects right now.</p>';
  }
}


// ---------- REVIEWS ----------
const reviewGrid = document.getElementById('reviewGrid');

async function loadReviews() {
  try {
    const res = await fetch('/api/reviews');
    const reviews = await res.json();

    if (!reviews.length) {
      reviewGrid.innerHTML = '<p class="empty-note">No reviews yet — be the first to leave one.</p>';
      return;
    }

    reviewGrid.innerHTML = reviews.map((r) => `
      <div class="review-card">
        <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        <p>"${escapeHtml(r.review_text)}"</p>
        <div class="who">${escapeHtml(r.name)}${r.business ? ` · ${escapeHtml(r.business)}` : ''}</div>
      </div>
    `).join('');
  } catch (err) {
    reviewGrid.innerHTML = '<p class="empty-note">Could not load reviews right now.</p>';
  }
}

const reviewForm = document.getElementById('reviewForm');
reviewForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('reviewMsg');
  const formData = new FormData(reviewForm);
  const payload = Object.fromEntries(formData.entries());

  msgEl.textContent = 'Submitting…';
  msgEl.className = 'form-msg';

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Could not submit review');

    msgEl.textContent = 'Thanks for the review!';
    msgEl.className = 'form-msg ok';
    reviewForm.reset();
    loadReviews();
  } catch (err) {
    msgEl.textContent = err.message;
    msgEl.className = 'form-msg err';
  }
});

// ---------- SETTINGS + WHATSAPP ----------
let whatsappNumber = '';
let whatsappProject = '';

function phoneHref(value) {
  return `tel:${value.replace(/[^\d+]/g, '')}`;
}

function setWhatsAppProject(projectTitle = '') {
  whatsappProject = projectTitle;
  const button = document.getElementById('whatsappButton');
  if (!whatsappNumber) return;
  const message = projectTitle
    ? `Hello, I am interested in your project "${projectTitle}".`
    : 'Hello, I am interested in your projects.';
  button.href = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
}

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();
    if (!res.ok) throw new Error(settings.error || 'Could not load contact details');

    const phone1 = document.getElementById('footerPhone1');
    const phone2 = document.getElementById('footerPhone2');
    const email = document.getElementById('footerEmail');
    const address = document.getElementById('footerAddress');

    phone1.innerHTML = settings.phone_1
      ? `<a href="${phoneHref(settings.phone_1)}">${escapeHtml(settings.phone_1)}</a>`
      : '';
    phone2.innerHTML = settings.phone_2
      ? `<a href="${phoneHref(settings.phone_2)}">${escapeHtml(settings.phone_2)}</a>`
      : '';
    email.innerHTML = settings.email
      ? `<a href="mailto:${escapeHtml(settings.email)}">${escapeHtml(settings.email)}</a>`
      : '';
    address.textContent = settings.address || '';

    whatsappNumber = settings.whatsapp_number || '';
    setWhatsAppProject('');
  } catch (err) {
    console.error(err);
  }
}

// ---------- ENQUIRIES ----------
const enquiryForm = document.getElementById('enquiryForm');
enquiryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('enquiryMsg');
  const submitButton = document.getElementById('enquirySubmit');
  msgEl.textContent = 'Sending…';
  msgEl.className = 'form-msg';
  submitButton.disabled = true;

  try {
    const payload = Object.fromEntries(new FormData(enquiryForm).entries());
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not send enquiry');
    msgEl.textContent = data.message;
    msgEl.className = 'form-msg ok';
    enquiryForm.reset();
  } catch (err) {
    msgEl.textContent = err.message;
    msgEl.className = 'form-msg err';
  } finally {
    submitButton.disabled = false;
  }
});

// ---------- CHAT (RAG) ----------
const chatFab = document.getElementById('chatFab');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

chatFab.addEventListener('click', () => chatPanel.classList.toggle('hidden'));
chatClose.addEventListener('click', () => chatPanel.classList.add('hidden'));

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;

  addMessage(question, 'user');
  chatInput.value = '';
  const loadingEl = addMessage('Thinking…', 'loading');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question })
    });
    const data = await res.json();
    loadingEl.remove();

    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    addMessage(data.reply, 'bot');
  } catch (err) {
    loadingEl.remove();
    addMessage(err.message, 'bot');
  }
});

// ---------- init ----------
loadProjects();
loadReviews();
loadSettings();
