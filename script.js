/* ═══════════════════════════════════════════
   Utility helpers
═══════════════════════════════════════════ */

/** Type text character by character into an element.
 *  Returns a promise that resolves when done. */
function typeText(el, text, speed = 48) {
  return new Promise(resolve => {
    el.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    el.appendChild(cursor);

    let i = 0;
    const interval = setInterval(() => {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        // keep cursor blinking a beat, then remove
        setTimeout(() => {
          cursor.remove();
          resolve();
        }, 600);
      }
    }, speed);
  });
}

/** Fade in an element (removes .faded class). */
function fadeIn(el, delayMs = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      el.classList.remove('faded');
      resolve();
    }, delayMs);
  });
}

/** Show a button with a smooth appear. */
function showBtn(btn, delayMs = 0) {
  setTimeout(() => {
    btn.classList.remove('hidden');
    btn.classList.add('visible');
  }, delayMs);
}

/** Transition between two screens. */
function goTo(fromId, toId, callback) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);

  from.classList.add('exit');
  from.classList.remove('active');

  setTimeout(() => {
    from.classList.remove('exit');
    to.classList.add('active');
    if (callback) callback();
  }, 580);
}

/* ═══════════════════════════════════════════
   Heart particles
═══════════════════════════════════════════ */
const HEART_EMOJIS = ['💛', '🩷', '💜', '🤍', '💗', '✨'];

function spawnHeart() {
  const bg   = document.getElementById('heartsBg');
  const el   = document.createElement('span');
  el.className = 'heart-particle';
  el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

  const size     = 0.9 + Math.random() * 1.1;
  const left     = Math.random() * 100;
  const duration = 7 + Math.random() * 10;
  const delay    = Math.random() * 3;

  el.style.cssText = `
    left: ${left}%;
    font-size: ${size}rem;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
  `;

  bg.appendChild(el);
  setTimeout(() => el.remove(), (duration + delay + 1) * 1000);
}

// Continuously spawn hearts (subtle initially)
setInterval(spawnHeart, 1800);

/* ═══════════════════════════════════════════
   Screen 1 — Intro
═══════════════════════════════════════════ */
(async function initIntro() {
  const line1   = document.getElementById('intro-line1');
  const line2   = document.getElementById('intro-line2');
  const btnCont = document.getElementById('btn-continue');

  // Small delay before starting
  await delay(700);

  await typeText(line1, "Hey… there's something I've been wanting to say.", 44);
  await delay(550);

  await fadeIn(line2);
  await typeText(line2, "It's been on my mind for a while now...", 44);
  await delay(400);

  showBtn(btnCont, 300);

  btnCont.addEventListener('click', () => goTo('screen-intro', 'screen-buildup', initBuildup));
})();

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ═══════════════════════════════════════════
   Screen 2 — Build-Up
═══════════════════════════════════════════ */
async function initBuildup() {
  const line1    = document.getElementById('buildup-line1');
  const line2    = document.getElementById('buildup-line2');
  const btnGo    = document.getElementById('btn-goahead');

  await delay(300);
  await typeText(line1, "I really hope this makes you smile…", 46);
  await delay(450);

  await fadeIn(line2);
  await typeText(line2, "Because I have a question for you 🥺", 46);
  await delay(400);

  showBtn(btnGo, 300);

  btnGo.addEventListener('click', () => goTo('screen-buildup', 'screen-question', initQuestion));
}

/* ═══════════════════════════════════════════
   Screen 3 — Main Question
═══════════════════════════════════════════ */
let noAttempts = 0;
let twistTriggered = false;

function initQuestion() {
  const btnYes = document.getElementById('btn-yes');
  const btnNo  = document.getElementById('btn-no');

  // Reset state
  noAttempts = 0;
  twistTriggered = false;
  btnNo.textContent = 'No 🙈';
  btnNo.style.transform = '';
  btnNo.style.position = 'absolute';

  // Position the No button relative to its parent
  positionNoBtn(btnNo, 0);

  // ── Yes button ──
  btnYes.addEventListener('click', () => {
    goTo('screen-question', 'screen-yes', initYes);
  });

  // ── No button: run away on mouseenter (desktop) ──
  btnNo.addEventListener('mouseenter', handleNoHover);

  // ── No button: run away on touchstart (mobile) ──
  btnNo.addEventListener('touchstart', handleNoHover, { passive: true });

  // Safety: if somehow clicked despite escape attempts
  btnNo.addEventListener('click', handleNoHover);
}

function positionNoBtn(btn, attempt) {
  const parent = btn.parentElement;
  const pw = parent.offsetWidth;
  const ph = parent.offsetHeight || 80;

  // Keep it within the answer-buttons area but offset each attempt
  const baseX = pw / 2 + 10; // to the right of yes button
  const scatter = Math.min(attempt * 18, 120);
  const angle = attempt * 137.5; // golden angle for nice scatter

  const x = baseX + Math.cos(angle) * scatter;
  const y = (ph / 2 - 22) + Math.sin(angle) * scatter * 0.6;

  btn.style.left = `${Math.max(0, Math.min(pw - 130, x))}px`;
  btn.style.top  = `${Math.max(0, Math.min(ph - 50,  y))}px`;
}

function handleNoHover() {
  if (twistTriggered) return;

  noAttempts++;
  const btnNo  = document.getElementById('btn-no');
  const parent = btnNo.parentElement;
  const pw = parent.offsetWidth;
  const ph = Math.max(parent.offsetHeight, 90);

  // Text stays fixed
  btnNo.textContent = 'No 🙈';

  // Increase container height as button escapes more aggressively
  parent.style.minHeight = `${Math.min(ph + 10, 200)}px`;

  // Scramble to a random corner
  const margin = 10;
  const bw = btnNo.offsetWidth  || 120;
  const bh = btnNo.offsetHeight || 48;

  const maxX = Math.max(pw - bw - margin, margin);
  const maxY = Math.max(Number(parent.style.minHeight || 80) - bh - margin, margin);

  const x = margin + Math.random() * maxX;
  const y = margin + Math.random() * maxY;

  btnNo.style.left = `${x}px`;
  btnNo.style.top  = `${y}px`;

  // Wobble
  const rotations = [-12, 12, -18, 18, 0];
  btnNo.style.transform = `rotate(${rotations[noAttempts % rotations.length]}deg) scale(${0.95 - noAttempts * 0.01})`;

  // After 5 attempts → trigger twist
  if (noAttempts >= 5 && !twistTriggered) {
    twistTriggered = true;
    setTimeout(() => {
      goTo('screen-question', 'screen-twist', initTwist);
    }, 600);
  }
}

/* ═══════════════════════════════════════════
   Screen 4 — Yes!
═══════════════════════════════════════════ */
function initYes() {
  // Burst hearts
  for (let i = 0; i < 6; i++) {
    setTimeout(spawnHeart, i * 180);
  }
  setInterval(spawnHeart, 600);
}

/* ═══════════════════════════════════════════
   Screen 5 — Twist
═══════════════════════════════════════════ */
async function initTwist() {
  const line1    = document.getElementById('twist-line1');
  const line2    = document.getElementById('twist-line2');
  const line3    = document.getElementById('twist-line3');
  const btnFeel  = document.getElementById('btn-feelgood');

  await delay(300);
  await typeText(line1, "Haha okay, you win! 😄", 52);
  await delay(350);

  await fadeIn(line2);
  await typeText(line2, "That button really didn't want to cooperate 😅", 44);
  await delay(350);

  await fadeIn(line3);
  await typeText(line3, "No pressure at all, promise 🤍", 44);
  await delay(400);

  showBtn(btnFeel, 300);

  btnFeel.addEventListener('click', () => goTo('screen-twist', 'screen-feelgood', initFeelGood));
}

/* ═══════════════════════════════════════════
   Screen 6 — Feel-Good
═══════════════════════════════════════════ */
function initFeelGood() {
  // Increase heart frequency
  setInterval(spawnHeart, 900);

  const btnStill = document.getElementById('btn-stillask');
  btnStill.addEventListener('click', () => {
    // Reset no-button & go back to question
    goTo('screen-feelgood', 'screen-question', () => {
      noAttempts = 0;
      twistTriggered = false;
      initQuestion();
    });
  });
}
