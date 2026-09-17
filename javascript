// 1. Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// 2. Color Theme Switcher Function & Persistence
function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('creva-theme', themeName);
}

// Persist saved user theme selection (Defaults to cyan)
const savedTheme = localStorage.getItem('creva-theme') || 'cyan';
setTheme(savedTheme);

// 3. Single Page Application (SPA) Router Logic
const navItems = document.querySelectorAll('.nav-item[data-target]');
const pageViews = document.querySelectorAll('.page-view');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetId = item.getAttribute('data-target');

    // Update Active Nav Link
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    // Hide all pages and reveal target page
    pageViews.forEach(page => {
      if (page.id === targetId) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });
  });
});

// 4. Interactive Flashcard Flip Logic
const flashcard = document.getElementById('flashcard');
if (flashcard) {
  flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });
}

// 5. Basic Focus Timer Logic
let timeInSeconds = 25 * 60;
let timerId = null;
const timerDisplay = document.getElementById('timer-display');
const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');

function updateTimer() {
  if (!timerDisplay) return;
  const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const s = (timeInSeconds % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${m}:${s}`;
}

if (btnStart && timerDisplay) {
  btnStart.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
      btnStart.textContent = 'Resume Flow';
    } else {
      timerId = setInterval(() => {
        if (timeInSeconds > 0) {
          timeInSeconds--;
          updateTimer();
        } else {
          clearInterval(timerId);
          timerId = null;
          btnStart.textContent = 'Start Flow';
        }
      }, 1000);
      btnStart.textContent = 'Pause';
    }
  });
}

if (btnReset) {
  btnReset.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    timeInSeconds = 25 * 60;
    updateTimer();
    if (btnStart) btnStart.textContent = 'Start Flow';
  });
}