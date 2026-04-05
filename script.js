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
const HEART_COLORS = ['#f9a8d4', '#c4b5fd', '#fbcfe8', '#ddd6fe', '#e9d5ff'];

function spawnHeart() {
  const bg   = document.getElementById('heartsBg');
  const el   = document.createElement('span');
  el.className = 'heart-particle';
  el.textContent = '♥';
  el.style.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];

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

  await typeText(line1, "Hey... there is something I have been wanting to say.", 44);
  await delay(550);

  await fadeIn(line2);
  await typeText(line2, "It has been on my mind for a while now.", 44);
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
  await typeText(line1, "I really hope this makes you smile.", 46);
  await delay(450);

  await fadeIn(line2);
  await typeText(line2, "Because I have a question for you.", 46);
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
  btnNo.textContent = 'No';
  btnNo.style.transform = '';
  btnNo.style.position = 'absolute';
  // Reset container height
  btnNo.parentElement.style.minHeight = '160px';

  // Place No clearly on the right side to start (after paint)
  requestAnimationFrame(() => placeNoInitial(btnNo));

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

/** Set the No button at its starting position (right side, vertically centered). */
function placeNoInitial(btn) {
  const parent = btn.parentElement;
  const pw  = parent.offsetWidth  || 400;
  const ph  = parseInt(parent.style.minHeight) || 160;
  const bw  = btn.offsetWidth  || 100;
  const bh  = btn.offsetHeight || 48;

  btn.style.left = `${pw - bw - Math.round(pw * 0.12)}px`;
  btn.style.top  = `${Math.round((ph - bh) / 2)}px`;
}

function handleNoHover() {
  if (twistTriggered) return;

  noAttempts++;
  const btnNo  = document.getElementById('btn-no');
  const parent = btnNo.parentElement;
  const pw = parent.offsetWidth || 400;

  // Grow container height gradually so button has more room to escape
  const currentH = parseInt(parent.style.minHeight) || 160;
  const newH = Math.min(currentH + 18, 320);
  parent.style.minHeight = `${newH}px`;

  // Text stays fixed
  btnNo.textContent = 'No';

  const margin = 14;
  const bw = btnNo.offsetWidth  || 100;
  const bh = btnNo.offsetHeight || 48;

  const maxX = Math.max(pw - bw - margin, margin);
  const maxY = Math.max(newH - bh - margin, margin);

  // Keep away from current position for a more dramatic escape
  let x, y, tries = 0;
  const curX = parseFloat(btnNo.style.left) || pw * 0.7;
  const curY = parseFloat(btnNo.style.top)  || newH * 0.5;
  do {
    x = margin + Math.random() * maxX;
    y = margin + Math.random() * maxY;
    tries++;
  } while (tries < 8 && Math.hypot(x - curX, y - curY) < 80);

  btnNo.style.left = `${x}px`;
  btnNo.style.top  = `${y}px`;

  // Wobble increases with each attempt
  const rotations = [-10, 14, -18, 20, -8, 16, -22, 12, 0, -15];
  const scaleDown = Math.max(0.88, 0.98 - noAttempts * 0.01);
  btnNo.style.transform = `rotate(${rotations[noAttempts % rotations.length]}deg) scale(${scaleDown})`;

  // After 10 attempts → trigger twist
  if (noAttempts >= 10 && !twistTriggered) {
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
  await typeText(line1, "Haha okay, you win.", 52);
  await delay(350);

  await fadeIn(line2);
  await typeText(line2, "That button really did not want to cooperate.", 44);
  await delay(350);

  await fadeIn(line3);
  await typeText(line3, "No pressure at all, I promise.", 44);
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
