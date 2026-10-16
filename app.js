(() => {
  const STORE = 'piano-grid-site-v1';
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const lessons = [
    { number: '01', title: 'Meet the staff', pages: '1–4', desc: 'Get familiar with the five-line staff and the printed notation.' },
    { number: '02', title: 'Read the notation', pages: '5–24', desc: 'Follow the note positions across the workbook examples.' },
    { number: '03', title: 'Spot the patterns', pages: '25–48', desc: 'Work through the next set of notation exercises at your pace.' },
    { number: '04', title: 'Review and repeat', pages: '49–72', desc: 'Revisit later pages and strengthen your note-reading habit.' },
  ];
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const empty = () => ({ xp: 0, streak: 0, best: 0, sessions: 0, lastDay: '', rewards: [], attempts: [], labels: true, round: 0, target: notes[Math.floor(Math.random() * notes.length)] });
  let state;
  try { state = { ...empty(), ...JSON.parse(localStorage.getItem(STORE) || '{}') }; } catch { state = empty(); }
  let audioContext;
  const $ = id => document.getElementById(id);
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { showToast('Progress could not be saved in this browser.'); } renderProgress(); };
  const showToast = text => { const toast = $('toast'); toast.textContent = text; toast.classList.add('visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('visible'), 3100); };
  const renderLessons = () => {
    $('lesson-grid').innerHTML = lessons.map((lesson, index) => `<article class="lesson-card panel"><div class="lesson-head"><span class="lesson-number">${lesson.number}</span><span class="lesson-kind">WORKBOOK PRACTICE</span><span class="lesson-duration">${index === 0 ? 'START HERE' : 'SELF-PACED'}</span></div><h3>${lesson.title}</h3><p>${lesson.desc}</p><div class="lesson-foot"><span>PDF PAGES ${lesson.pages}</span><button data-page="${lesson.pages}">SOURCE PAGE ↗</button></div></article>`).join('');
    document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => showToast(`Open Notation Workbook.pdf separately and go to page ${button.dataset.page}. The source PDF is not hosted with this website.`)));
  };
  const renderKeyboard = () => {
    const white = notes.map((note, index) => `<button class="white-key" data-note="${note}" aria-label="${note} key"><span>${state.labels ? note : ''}</span></button>`).join('');
    const blackNotes = ['C♯', 'D♯', null, 'F♯', 'G♯', 'A♯'];
    const black = blackNotes.map((note, index) => note ? `<button class="black-key" style="--key-index:${index}" data-note="${note}" aria-label="${note} key"><span>${state.labels ? note : ''}</span></button>` : '').join('');
    $('keyboard').innerHTML = `<div class="white-keys">${white}</div><div class="black-keys">${black}</div>`;
    document.querySelectorAll('[data-note]').forEach(key => key.addEventListener('click', () => selectNote(key.dataset.note)));
    $('label-toggle').classList.toggle('on', state.labels);
    $('label-toggle').setAttribute('aria-checked', String(state.labels));
  };
  const renderProgress = () => {
    const doneToday = state.lastDay === today();
    $('xp-total').textContent = state.xp;
    $('streak-total').textContent = state.streak;
    $('stat-streak').textContent = state.streak;
    $('stat-sessions').textContent = state.sessions;
    const right = state.attempts.filter(x => x.correct).length;
    $('stat-accuracy').textContent = state.attempts.length ? `${Math.round(right / state.attempts.length * 100)}%` : '—';
    $('session-percent').textContent = doneToday ? '100%' : `${Math.min(state.round * 20, 80)}%`;
    $('progress-fill').style.width = doneToday ? '100%' : `${Math.min(state.round * 20, 80)}%`;
    $('mission-status').textContent = doneToday ? 'DONE ✓' : state.round ? 'IN SESSION' : 'READY';
  };
  const midi = note => {
    const semitones = { C: 0, 'C♯': 1, D: 2, 'D♯': 3, E: 4, F: 5, 'F♯': 6, G: 7, 'G♯': 8, A: 9, 'A♯': 10, B: 11 };
    return 60 + semitones[note];
  };
  const play = note => {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const overtone = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const volume = audioContext.createGain();
      const freq = 440 * Math.pow(2, (midi(note) - 69) / 12);
      oscillator.type = 'triangle'; oscillator.frequency.value = freq;
      overtone.type = 'sine'; overtone.frequency.value = freq * 2;
      gain.gain.value = 0.2; volume.gain.setValueAtTime(0.0001, audioContext.currentTime); volume.gain.exponentialRampToValueAtTime(0.24, audioContext.currentTime + 0.015); volume.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.75);
      oscillator.connect(gain); overtone.connect(gain); gain.connect(volume); volume.connect(audioContext.destination);
      oscillator.start(); overtone.start(); oscillator.stop(audioContext.currentTime + 0.8); overtone.stop(audioContext.currentTime + 0.8);
    } catch { showToast('Audio is unavailable. Check your browser sound settings.'); }
  };
  const selectNote = note => {
    play(note);
    const correct = note === state.target;
    document.querySelectorAll('[data-note]').forEach(key => { key.classList.toggle('pressed', key.dataset.note === note); key.classList.toggle('answer', correct && key.dataset.note === note); });
    state.attempts.unshift({ note: state.target, correct, at: Date.now() }); state.attempts = state.attempts.slice(0, 100);
    $('feedback').textContent = correct ? `Correct — ${note} is the note you were asked to find.` : `That was ${note}. The target is ${state.target}. Try the target key next.`;
    $('feedback').classList.toggle('correct', correct);
    if (correct) {
      const reward = `${today()}:${state.target}`;
      if (!state.rewards.includes(reward)) { state.xp += 10; state.rewards.push(reward); state.rewards = state.rewards.slice(-500); }
      state.round++;
      if (state.round >= 5) finishSession();
      else state.target = notes[Math.floor(Math.random() * notes.length)];
    }
    save();
    if (correct && state.round < 5) setTimeout(renderChallenge, 620);
  };
  const renderChallenge = () => {
    $('target-note').innerHTML = `${state.target}<span>4</span>`;
    $('round-count').textContent = `ROUND ${String(Math.min(state.round + 1, 5)).padStart(2, '0')}`;
    renderKeyboard();
  };
  const finishSession = () => {
    const day = today();
    if (state.lastDay !== day) {
      const date = new Date(); date.setDate(date.getDate() - 1);
      const yesterday = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      state.streak = state.lastDay === yesterday ? state.streak + 1 : 1;
      state.best = Math.max(state.best, state.streak);
      state.lastDay = day; state.sessions++; state.xp += 20;
    }
    $('feedback').textContent = 'Session complete. Five notes practiced — nicely done.';
    $('feedback').classList.add('correct');
    $('mission-status').textContent = 'DONE ✓';
    $('session-percent').textContent = '100%'; $('progress-fill').style.width = '100%';
    showToast(state.round >= 5 ? 'Session complete · +20 daily XP' : 'Daily session saved.');
  };
  const start = () => {
    document.querySelector('#practice').scrollIntoView({ behavior: 'smooth' });
    if (state.lastDay === today()) { showToast('Today’s session is complete. Explore the workbook or practice freely.'); return; }
    if (state.round >= 5) state.round = 0;
    $('feedback').textContent = 'Tap the matching white key below.'; $('feedback').classList.remove('correct');
    renderChallenge();
  };
  document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', start));
  $('label-toggle').addEventListener('click', () => { state.labels = !state.labels; save(); renderKeyboard(); });
  const menu = document.querySelector('.menu-toggle');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!open)); document.querySelector('.main-nav').classList.toggle('mobile-open', !open); });
  document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); document.querySelector('.main-nav').classList.remove('mobile-open'); }));
  $('today-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
  renderLessons(); renderChallenge(); renderProgress();
})();
