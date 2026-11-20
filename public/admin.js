import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SESSION_KEY = 'dukaan_supabase_session';

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('loginMsg');
const logoutBtn = document.getElementById('logoutBtn');

let supabase = null;

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function getAccessToken() {
  return getSession()?.access_token || '';
}

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function apiFetch(url, options = {}) {
  const headers = options.headers || {};
  const accessToken = getAccessToken();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    sessionStorage.removeItem(SESSION_KEY);
    supabase?.auth.signOut();
    showLogin('Session expired — log in again.');
    throw new Error('Unauthorized');
  }
  return res;
}

function showLogin(message = '') {
  loginScreen.classList.remove('hidden');
  dashboard.classList.add('hidden');
  loginMsg.textContent = message;
}

function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadStats();
  loadProjects();
  loadSettings();
  loadEnquiries();
  loadReviews();
}

async function tryLogin(email, password) {
  loginMsg.textContent = 'Checking…';
  try {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${data.session.access_token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
    passwordInput.value = '';
    showDashboard();
  } catch (err) {
    loginMsg.textContent = err.message || 'Could not reach the server.';
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  tryLogin(emailInput.value.trim(), passwordInput.value);
});

logoutBtn.addEventListener('click', async () => {
  try {
    await supabase?.auth.signOut();
  } finally {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  }
});

// ---------- tabs ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

// ---------- stats ----------
async function loadStats() {
  try {
    const res = await apiFetch('/api/admin/stats');
    const s = await res.json();
    document.getElementById('statProjects').textContent = s.projectCount;
    document.getElementById('statReviews').textContent = s.reviewCount;
    document.getElementById('statPending').textContent = s.pendingCount;
    document.getElementById('statAvg').textContent = s.avgRating ?? '—';
  } catch (err) { /* apiFetch already handles 401 */ }
}

// ---------- PROJECTS ----------
const projectList = document.getElementById('projectList');
const projectForm = document.getElementById('projectForm');
const projectFormTitle = document.getElementById('projectFormTitle');
const projectSubmitBtn = document.getElementById('projectSubmitBtn');
const projectCancelBtn = document.getElementById('projectCancelBtn');
const projectMsg = document.getElementById('projectMsg');
const projectIdField = document.getElementById('projectId');

async function loadProjects() {
  try {
    const res = await apiFetch('/api/projects');
    const projects = await res.json();

    if (!projects.length) {
      projectList.innerHTML = '<p class="empty-note">No projects yet — add your first one above.</p>';
      return;
    }

    projectList.innerHTML = projects.map((p) => `
      <div class="item-row" data-id="${p.id}">
        <div class="thumb">${p.image_path ? `<img src="${p.image_path}" alt="">` : 'No image'}</div>
        <div class="info">
          <h4>${escapeHtml(p.title)}</h4>
          ${p.category ? `<div class="meta">${escapeHtml(p.category)}</div>` : ''}
          <p>${escapeHtml(p.description || '')}</p>
        </div>
        <div class="actions">
          <button class="btn btn-ghost btn-sm" data-action="edit">Edit</button>
          <button class="btn btn-danger btn-sm" data-action="delete">Delete</button>
        </div>
      </div>
    `).join('');

    projectList.querySelectorAll('.item-row').forEach((row) => {
      const id = row.dataset.id;
      const data = projects.find((p) => String(p.id) === id);
      row.querySelector('[data-action="edit"]').addEventListener('click', () => startEditProject(data));
      row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProject(id));
    });
  } catch (err) {
    projectList.innerHTML = '<p class="empty-note">Could not load projects.</p>';
  }
}

function startEditProject(p) {
  projectIdField.value = p.id;
  document.getElementById('pTitle').value = p.title || '';
  document.getElementById('pCategory').value = p.category || '';
  document.getElementById('pDescription').value = p.description || '';
  document.getElementById('pLocation').value = p.location || '';
  document.getElementById('pPrice').value = p.price ?? '';
  document.getElementById('pStatus').value = p.status || 'active';
  document.getElementById('pUrl').value = p.project_url || '';
  projectFormTitle.textContent = `Editing "${p.title}"`;
  projectSubmitBtn.textContent = 'Save changes';
  projectCancelBtn.classList.remove('hidden');
  projectMsg.textContent = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetProjectForm() {
  projectForm.reset();
  projectIdField.value = '';
  projectFormTitle.textContent = 'Add a project';
  projectSubmitBtn.textContent = 'Add project';
  projectCancelBtn.classList.add('hidden');
}

projectCancelBtn.addEventListener('click', resetProjectForm);

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = projectIdField.value;
  const formData = new FormData(projectForm);
  projectMsg.textContent = 'Saving…';
  projectMsg.className = 'form-msg';

  try {
    const res = await apiFetch(id ? `/api/projects/${id}` : '/api/projects', {
      method: id ? 'PUT' : 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');

    projectMsg.textContent = id ? 'Updated!' : 'Added!';
    projectMsg.className = 'form-msg ok';
    resetProjectForm();
    loadProjects();
    loadStats();
  } catch (err) {
    projectMsg.textContent = err.message;
    projectMsg.className = 'form-msg err';
  }
});

async function deleteProject(id) {
  if (!confirm('Delete this project? This cannot be undone.')) return;
  try {
    const res = await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Delete failed');
    loadProjects();
    loadStats();
  } catch (err) {
    alert(err.message);
  }
}

// ---------- REVIEWS ----------
const reviewList = document.getElementById('reviewList');

async function loadReviews() {
  try {
    const res = await apiFetch('/api/reviews/all');
    const reviews = await res.json();

    if (!reviews.length) {
      reviewList.innerHTML = '<p class="empty-note">No reviews yet.</p>';
      return;
    }

    reviewList.innerHTML = reviews.map((r) => `
      <div class="item-row" data-id="${r.id}">
        <div class="info">
          <h4>${escapeHtml(r.name)}${r.business ? ` · ${escapeHtml(r.business)}` : ''}
            <span class="pill ${r.approved ? 'pill-live' : 'pill-hidden'}">${r.approved ? 'Live' : 'Hidden'}</span>
          </h4>
          <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <p>${escapeHtml(r.review_text)}</p>
        </div>
        <div class="actions">
          <button class="btn btn-ghost btn-sm" data-action="toggle">${r.approved ? 'Hide' : 'Show'}</button>
          <button class="btn btn-danger btn-sm" data-action="delete">Delete</button>
        </div>
      </div>
    `).join('');

    reviewList.querySelectorAll('.item-row').forEach((row) => {
      const id = row.dataset.id;
      row.querySelector('[data-action="toggle"]').addEventListener('click', () => toggleReview(id));
      row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteReview(id));
    });
  } catch (err) {
    reviewList.innerHTML = '<p class="empty-note">Could not load reviews.</p>';
  }
}

async function toggleReview(id) {
  try {
    await apiFetch(`/api/reviews/${id}/approve`, { method: 'PATCH' });
    loadReviews();
    loadStats();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteReview(id) {
  if (!confirm('Delete this review? This cannot be undone.')) return;
  try {
    const res = await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Delete failed');
    loadReviews();
    loadStats();
  } catch (err) {
    alert(err.message);
  }
}

// ---------- settings ----------
const settingsForm = document.getElementById('settingsForm');
const settingsMsg = document.getElementById('settingsMsg');

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();
    if (!res.ok) throw new Error(settings.error || 'Could not load contact details');
    document.getElementById('sPhone1').value = settings.phone_1 || '';
    document.getElementById('sPhone2').value = settings.phone_2 || '';
    document.getElementById('sWhatsapp').value = settings.whatsapp_number || '';
    document.getElementById('sEmail').value = settings.email || '';
    document.getElementById('sAddress').value = settings.address || '';
  } catch (err) {
    settingsMsg.textContent = err.message;
    settingsMsg.className = 'form-msg err';
  }
}

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  settingsMsg.textContent = 'Saving…';
  settingsMsg.className = 'form-msg';
  try {
    const payload = Object.fromEntries(new FormData(settingsForm).entries());
    const res = await apiFetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save contact details');
    settingsMsg.textContent = 'Contact details updated!';
    settingsMsg.className = 'form-msg ok';
  } catch (err) {
    settingsMsg.textContent = err.message;
    settingsMsg.className = 'form-msg err';
  }
});

// ---------- enquiries ----------
const enquiryList = document.getElementById('enquiryList');
const enquirySearch = document.getElementById('enquirySearch');
let allEnquiries = [];

async function loadEnquiries() {
  try {
    const res = await apiFetch('/api/enquiries');
    allEnquiries = await res.json();
    if (!res.ok) throw new Error(allEnquiries.error || 'Could not load enquiries');
    renderEnquiries();
  } catch (err) {
    enquiryList.innerHTML = `<p class="empty-note">${escapeHtml(err.message)}</p>`;
  }
}

function renderEnquiries() {
  const query = enquirySearch.value.trim().toLowerCase();
  const filtered = allEnquiries.filter((item) =>
    [item.name, item.phone, item.email, item.message]
      .join(' ')
      .toLowerCase()
      .includes(query)
  );
  if (!filtered.length) {
    enquiryList.innerHTML = '<p class="empty-note">No enquiries found.</p>';
    return;
  }
  enquiryList.innerHTML = filtered.map((item) => `
    <div class="item-row" data-id="${item.id}">
      <div class="info">
        <h4>${escapeHtml(item.name)} <span class="pill ${item.is_read ? 'pill-live' : 'pill-hidden'}">${item.is_read ? 'Read' : 'Unread'}</span></h4>
        <div class="meta">${escapeHtml(item.phone)} · ${escapeHtml(item.email)}</div>
        <p>${escapeHtml(item.message)}</p>
      </div>
      <div class="actions">
        ${item.is_read ? '' : '<button class="btn btn-ghost btn-sm" data-action="read">Mark read</button>'}
        <button class="btn btn-danger btn-sm" data-action="delete">Delete</button>
      </div>
    </div>
  `).join('');

  enquiryList.querySelectorAll('.item-row').forEach((row) => {
    row.querySelector('[data-action="read"]')?.addEventListener('click', () => markEnquiryRead(row.dataset.id));
    row.querySelector('[data-action="delete"]')?.addEventListener('click', () => deleteEnquiry(row.dataset.id));
  });
}

async function markEnquiryRead(id) {
  try {
    const res = await apiFetch(`/api/enquiries/${id}/read`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not mark enquiry as read');
    await loadEnquiries();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteEnquiry(id) {
  if (!confirm('Delete this enquiry? This cannot be undone.')) return;
  try {
    const res = await apiFetch(`/api/enquiries/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Delete failed');
    await loadEnquiries();
  } catch (err) {
    alert(err.message);
  }
}

enquirySearch.addEventListener('input', renderEnquiries);

// ---------- init ----------
async function initializeAdmin() {
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    if (!response.ok) throw new Error(config.error || 'Supabase configuration failed');

    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    if (getAccessToken()) {
      showDashboard();
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin(err.message);
  }
}

initializeAdmin();
