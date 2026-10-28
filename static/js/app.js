/**
 * NutriGuide — Frontend Application Logic
 * IBM Granite · WatsonX Nutrition AI
 */

/* ───────────────────────── State ───────────────────────── */
let sessionId = null;
let currentStage = 'greeting';
let isWaiting = false;

/* ───────────────────────── DOM Refs ─────────────────────── */
const chatMessages   = document.getElementById('chatMessages');
const userInput      = document.getElementById('userInput');
const sendBtn        = document.getElementById('sendBtn');
const typingIndicator= document.getElementById('typingIndicator');
const progressBar    = document.getElementById('progressBar');
const progressLabel  = document.getElementById('progressLabel');
const stageLabel     = document.getElementById('stageLabel');
const profileList    = document.getElementById('profileList');
const quickChips     = document.getElementById('quickChips');
const qaChips        = document.getElementById('qaChips');
const resetBtn       = document.getElementById('resetBtn');

/* ────────────────── Stage Labels Map ────────────────────── */
const STAGE_LABELS = {
  greeting:         'Starting up…',
  collect_name:     'Step 1 / 5 — Name',
  collect_age:      'Step 2 / 5 — Age',
  collect_diet:     'Step 3 / 5 — Diet Preference',
  collect_medical:  'Step 4 / 5 — Medical History',
  collect_location: 'Step 5 / 5 — Location',
  generating:       'Generating Plan…',
  qa:               '✅ Plan Ready — Ask Away!',
};

/* ──────────────────── Profile Fields ────────────────────── */
const PROFILE_FIELDS = { name: 'Name', age: 'Age', diet: 'Diet', medical: 'Medical', location: 'Location' };
const profileData    = {};

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
async function initSession() {
  try {
    const res  = await fetch('/api/session/start', { method: 'POST' });
    const data = await res.json();
    sessionId  = data.session_id;

    enableInput();
    renderWelcomeCard();
  } catch (err) {
    appendMessage('ai', `⚠️ Failed to connect to the server: ${err.message}. Please refresh the page.`);
  }
}

/* ═══════════════════════════════════════════════════════════
   WELCOME CARD
═══════════════════════════════════════════════════════════ */
function renderWelcomeCard() {
  const card = document.createElement('div');
  card.className = 'welcome-card';
  card.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px">🥦</div>
    <h2>Welcome to NutriGuide</h2>
    <p>Your personalized AI nutrition assistant powered by <strong>IBM Granite</strong> on WatsonX.<br>
    I'll ask you a few questions and create a tailored 7-day meal plan just for you.</p>
    <button class="start-btn" id="startChatBtn">✨ Start My Nutrition Journey</button>
  `;
  chatMessages.appendChild(card);
  scrollToBottom();

  document.getElementById('startChatBtn').addEventListener('click', async () => {
    card.remove();
    await sendGreeting();
  });
}

/* ═══════════════════════════════════════════════════════════
   SEND GREETING (triggers stage machine)
═══════════════════════════════════════════════════════════ */
async function sendGreeting() {
  await sendToAgent('__init__');
}

/* ═══════════════════════════════════════════════════════════
   SEND MESSAGE
═══════════════════════════════════════════════════════════ */
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isWaiting || !sessionId) return;

  appendMessage('user', text);
  userInput.value = '';
  autoResizeTextarea();

  // Hide chips after user replies
  quickChips.classList.add('hidden');
  qaChips.classList.add('hidden');

  await sendToAgent(text);
}

async function sendToAgent(message) {
  setWaiting(true);
  showTyping();

  try {
    const res  = await fetch('/api/chat', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ session_id: sessionId, message }),
    });
    const data = await res.json();
    hideTyping();
    setWaiting(false);

    if (data.error) {
      appendMessage('ai', `⚠️ ${data.error}`);
      return;
    }

    handleResponse(data);
  } catch (err) {
    hideTyping();
    setWaiting(false);
    appendMessage('ai', `⚠️ Network error: ${err.message}. Please check your connection.`);
  }
}

/* ═══════════════════════════════════════════════════════════
   HANDLE RESPONSE
═══════════════════════════════════════════════════════════ */
function handleResponse(data) {
  const { message, stage, progress, generating, plan_complete } = data;

  // Update progress UI
  updateProgress(progress || 0, stage);
  currentStage = stage;

  // If the plan is being generated, send the actual generation request immediately
  if (generating) {
    appendMessage('ai', message);
    sendToAgent('__generate__');
    return;
  }

  appendMessage('ai', message);

  // Show plan banner
  if (plan_complete) {
    const banner = document.createElement('div');
    banner.className = 'plan-banner';
    banner.innerHTML = '🎉 Your personalized nutrition plan is ready! Feel free to ask any follow-up questions below.';
    chatMessages.appendChild(banner);
    scrollToBottom();
  }

  // Show chip suggestions
  if (stage === 'collect_diet') {
    quickChips.classList.remove('hidden');
  }
  if (stage === 'qa') {
    qaChips.classList.remove('hidden');
  }

  // Update sidebar profile
  updateSidebarProfile(stage, message);
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR PROFILE UPDATE
═══════════════════════════════════════════════════════════ */
function updateSidebarProfile(stage, message) {
  // Extract profile values based on stage progression
  const stageToField = {
    collect_age:      'name',
    collect_diet:     'age',
    collect_medical:  'diet',
    collect_location: 'medical',
    generating:       'location',
    qa:               'location',
  };

  // We track from the agent's side via the messages — but let's keep it simple:
  // Re-render based on what we know
  const knownFields = Object.keys(profileData);
  if (knownFields.length === 0 && Object.keys(PROFILE_FIELDS).every(f => !profileData[f])) {
    return;
  }

  renderProfileList();
}

function setProfileField(field, value) {
  profileData[field] = value;
  renderProfileList();
}

function renderProfileList() {
  const keys = Object.keys(profileData);
  if (keys.length === 0) return;

  profileList.innerHTML = '';
  keys.forEach(key => {
    const li = document.createElement('li');
    li.className = 'profile-item';
    li.innerHTML = `<span class="label">${PROFILE_FIELDS[key] || key}</span><span class="value">${profileData[key]}</span>`;
    profileList.appendChild(li);
  });
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS
═══════════════════════════════════════════════════════════ */
function updateProgress(pct, stage) {
  progressBar.style.width  = `${pct}%`;
  progressLabel.textContent = `${pct}%`;
  stageLabel.textContent    = STAGE_LABELS[stage] || stage || '—';
}

/* ═══════════════════════════════════════════════════════════
   MESSAGE RENDERING
═══════════════════════════════════════════════════════════ */
function appendMessage(role, text) {
  const row = document.createElement('div');
  row.className = `msg-row ${role}`;

  const avatar = document.createElement('div');
  avatar.className = `avatar ${role === 'ai' ? 'ai-avatar' : 'user-avatar'}`;
  avatar.textContent = role === 'ai' ? '🥦' : '👤';

  const bubbleWrap = document.createElement('div');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = renderMarkdown(text);

  const time = document.createElement('div');
  time.className = 'bubble-time';
  time.textContent = formatTime(new Date());

  bubbleWrap.appendChild(bubble);
  bubbleWrap.appendChild(time);
  row.appendChild(avatar);
  row.appendChild(bubbleWrap);

  chatMessages.appendChild(row);
  scrollToBottom();

  // Extract profile data from AI messages for sidebar
  extractProfileData(text);
}

/* ═══════════════════════════════════════════════════════════
   PROFILE DATA EXTRACTION (heuristic from AI messages)
═══════════════════════════════════════════════════════════ */
function extractProfileData(text) {
  const nameMatch     = text.match(/Nice to meet you, \*\*(.+?)\*\*/);
  const ageMatch      = text.match(/\*\*(\d+) years old\*\*/);
  const dietMatch     = text.match(/\*\*(.+?) diet noted/);
  const medMatch      = text.match(/health needs\. 🏥/);
  const locMatch      = text.match(/Location:\*\* (.+?)[\n\r]/);

  if (nameMatch)  setProfileField('name',    nameMatch[1]);
  if (ageMatch)   setProfileField('age',     ageMatch[1] + ' yrs');
  if (dietMatch)  setProfileField('diet',    dietMatch[1]);
  if (medMatch && profileData.diet) setProfileField('medical', '(recorded)');
  if (locMatch)   setProfileField('location', locMatch[1]);
}

/* ═══════════════════════════════════════════════════════════
   MARKDOWN RENDERER (lightweight)
═══════════════════════════════════════════════════════════ */
function renderMarkdown(text) {
  if (!text) return '';

  // Escape HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^#### (.+)$/gm,  '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm,   '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,    '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,     '<h1>$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g,         '<em>$1</em>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // HR
  html = html.replace(/^---$/gm, '<hr>');

  // Disclaimer block (special case)
  html = html.replace(
    /(⚕️ \*\*Medical Disclaimer\*\*[\s\S]+?(?=\n---|\n\n\*Generated|$))/g,
    '<div class="disclaimer-block">$1</div>'
  );

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]+?<\/li>)/g, (match) => {
    if (!match.includes('<ul>')) return `<ul>${match}</ul>`;
    return match;
  });
  // Fix nested consecutive <ul>
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs — wrap lines not already wrapped
  const lines = html.split('\n');
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '<br>';
    if (/^<[h1-6|ul|ol|li|hr|div]/.test(trimmed)) return trimmed;
    return `<p>${trimmed}</p>`;
  });
  html = processed.join('\n');

  // Clean up consecutive <br>
  html = html.replace(/(<br>\s*){3,}/g, '<br><br>');

  return html;
}

/* ═══════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════ */
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  typingIndicator.classList.remove('hidden');
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.classList.add('hidden');
}

function setWaiting(state) {
  isWaiting = state;
  sendBtn.disabled   = state;
  userInput.disabled = state;
}

function enableInput() {
  sendBtn.disabled   = false;
  userInput.disabled = false;
  userInput.focus();
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function autoResizeTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

/* ═══════════════════════════════════════════════════════════
   EVENT LISTENERS
═══════════════════════════════════════════════════════════ */
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener('input', autoResizeTextarea);

// Quick chips
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const msg = chip.getAttribute('data-msg');
    userInput.value = msg;
    sendMessage();
  });
});

// Reset button
resetBtn.addEventListener('click', async () => {
  if (!confirm('Start a new nutrition plan? Your current plan will be reset.')) return;

  await fetch('/api/session/reset', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ session_id: sessionId }),
  });

  // Clear UI
  chatMessages.innerHTML = '';
  quickChips.classList.add('hidden');
  qaChips.classList.add('hidden');
  profileList.innerHTML = '<li class="profile-item muted">Complete the chat to see your profile here.</li>';
  Object.keys(profileData).forEach(k => delete profileData[k]);
  updateProgress(0, 'greeting');
  currentStage = 'greeting';

  renderWelcomeCard();
});

/* ═══════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', initSession);
