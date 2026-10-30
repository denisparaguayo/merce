/**
 * THE MERCEDES EDITION - Interactive Experience
 * Particle Canvas, Web Audio Ambient Synthesizer, Quote Deck, Vouchers & Countdown
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Ambient Canvas Particle & Petal System
  initAmbientCanvas();

  // 2. Ambient Audio Experience (Web Audio API Synthesizer)
  initAmbientAudio();

  // 3. Flip Cards Touch & Click Support
  initFlipCards();

  // 4. TikTok Style Quotes Deck
  initQuotesDeck();

  // 5. Lightbox Modal for Gallery Images
  initLightbox();

  // 6. Rescue Button (Mimos & Vouchers)
  initRescueButton();

  // 7. Spain Trip Countdown (December 6, 2026)
  initCountdown();

  // 8. Status Phrases for WhatsApp
  initStatusGrid();

  // 9. Interactive Mini-Test: ¿Qué tan aburrida sos?
  initMiniTest();
});

/* ==========================================================================
   1. AMBIENT CANVAS (Golden Stardust & Rose Petals)
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const numParticles = Math.min(width < 768 ? 35 : 70, 70);

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.2 + 0.8;
      this.speedY = -(Math.random() * 0.4 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.isPetal = Math.random() > 0.85; // 15% are floating gold/rose petals
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.02;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.angle) * 0.2;
      this.angle += this.spin;

      if (this.y < -15 || this.x < -15 || this.x > width + 15) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      if (this.isPetal) {
        // Subtle golden/rose petal
        ctx.fillStyle = `rgba(223, 177, 91, ${this.opacity * 0.7})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 2.5, this.size * 1.4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Glowing stardust
        ctx.fillStyle = `rgba(245, 230, 190, ${this.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(223, 177, 91, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Expose burst function for interactive clicks
  window.burstPetals = function (originX, originY) {
    const burstCount = 30;
    for (let i = 0; i < burstCount; i++) {
      const p = new Particle();
      p.x = originX;
      p.y = originY;
      p.speedX = (Math.random() - 0.5) * 6;
      p.speedY = (Math.random() - 0.5) * 6 - 2;
      p.opacity = 1;
      p.isPetal = true;
      particles.push(p);
    }
    // Remove extra particles after 4 seconds
    setTimeout(() => {
      while (particles.length > numParticles) {
        particles.pop();
      }
    }, 4000);
  };
}

/* ==========================================================================
   2. AMBIENT AUDIO SYNTHESIZER (Calming Warm Rhodes / Lo-Fi Chords)
   ========================================================================== */
function initAmbientAudio() {
  const toggleBtn = document.getElementById('toggleAudioBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const btnText = document.getElementById('audioBtnText');
  const pulseIndicator = document.getElementById('pulseIndicator');

  let audioCtx = null;
  let isPlaying = false;
  let synthInterval = null;

  // Romantic, soothing chord progression in D Flat Major / B Flat minor
  const chordProgression = [
    [277.18, 349.23, 415.30, 523.25], // Db Maj7
    [233.08, 277.18, 349.23, 415.30], // Bb min7
    [311.13, 369.99, 466.16, 554.37], // Eb min7
    [207.65, 261.63, 311.13, 369.99]  // Ab 7
  ];
  let currentChordIndex = 0;

  function createSoftPad(freq, duration) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);

    // Soft Attack & Long Release
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.045, audioCtx.currentTime + 1.2);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playNextChord() {
    if (!isPlaying || !audioCtx) return;
    const chord = chordProgression[currentChordIndex];
    chord.forEach((note) => createSoftPad(note, 4.5));
    currentChordIndex = (currentChordIndex + 1) % chordProgression.length;
  }

  toggleBtn.addEventListener('click', async () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    isPlaying = !isPlaying;

    if (isPlaying) {
      toggleBtn.classList.add('playing');
      if (btnText) btnText.textContent = 'Pausar';
      playNextChord();
      synthInterval = setInterval(playNextChord, 4200);
      showToast('Música ambiental iniciada 🎵');
    } else {
      toggleBtn.classList.remove('playing');
      if (btnText) btnText.textContent = 'Música';
      clearInterval(synthInterval);
    }
  });
}

/* ==========================================================================
   3. FLIP CARDS INTERACTION
   ========================================================================== */
function initFlipCards() {
  const cards = document.querySelectorAll('.flip-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
}

/* ==========================================================================
   4. TIKTOK STYLE QUOTES DECK
   ========================================================================== */
const quotesData = [
  {
    category: '✨ Para el Alma',
    text: '"No te sientas culpable por estar cansada. Has estado siendo fuerte por mucho tiempo. Date permiso de parar, respirar y recordar quién eres."'
  },
  {
    category: '💫 Cautivadora',
    text: '"Hay personas que no necesitan hacer ruido para hacerse notar. Tienen una forma de ser, una mirada y una sonrisa que simplemente se quedan grabadas."'
  },
  {
    category: '🙏 En Manos de Dios',
    text: '"Dejar todo en manos de Dios y seguir caminando con el corazón en paz. Él nunca falla y sabe cuándo abrir cada puerta."'
  },
  {
    category: '👑 Poder Propio',
    text: '"Una mujer trabajadora, disciplinada y con metas claras intimida a cualquiera, pero inspira a quien realmente sabe admirar la grandeza."'
  },
  {
    category: '🌸 Belleza Genuina',
    text: '"Tu encanto no está en un salón de belleza ni en unas uñas recién hechas. Está en tu forma de ser, en cómo cuidás a tu hijo y en esa luz que tenés aun en los días pesados."'
  },
  {
    category: '⚡ Nuevos Horizontes',
    text: '"La vida premia a las personas valientes que se animan a dar grandes saltos y construir su propio destino."'
  },
  {
    category: '🖤 Paz Mental',
    text: '"Elegir la calma, el descanso y tu propia paz en un mundo lleno de ruido no es ser aburrida: es saber lo que realmente vale la pena."'
  },
  {
    category: '🌟 Gratitud',
    text: '"Agradecé por todo lo que superaste, por lo que tenés hoy y por todas las bendiciones que aún están por llegar a tu vida."'
  },
  {
    category: '🍰 Mimos & Vida',
    text: '"La vida es demasiado corta para privarse de una rica merienda o de un momento para desconectar. Hoy te toca consentirte."'
  },
  {
    category: '💪 Fuerza Diaria',
    text: '"No cualquiera sostiene tantas responsabilidades con una sonrisa. Tu esfuerzo diario es admirable, incluso en los días donde nadie lo nota."'
  }
];

function initQuotesDeck() {
  let currentIndex = 0;
  const quoteCard = document.getElementById('quoteCard');
  const quoteCategory = document.getElementById('quoteCategory');
  const quoteText = document.getElementById('quoteText');
  const quoteCounter = document.getElementById('quoteCounter');
  const likeBtn = document.getElementById('likeQuoteBtn');
  const prevBtn = document.getElementById('prevQuoteBtn');
  const nextBtn = document.getElementById('nextQuoteBtn');
  const randomBtn = document.getElementById('randomQuoteBtn');

  if (!quoteCard || !quoteCategory || !quoteText) return;

  function updateQuote(index) {
    quoteCard.style.opacity = '0';
    quoteCard.style.transform = 'translateY(8px)';

    setTimeout(() => {
      const q = quotesData[index];
      quoteCategory.textContent = q.category;
      quoteText.textContent = q.text;
      if (quoteCounter) {
        quoteCounter.textContent = `${index + 1} / ${quotesData.length}`;
      }
      if (likeBtn) likeBtn.classList.remove('liked');

      quoteCard.style.opacity = '1';
      quoteCard.style.transform = 'translateY(0)';
    }, 180);
  }

  // Set initial counter
  if (quoteCounter) {
    quoteCounter.textContent = `1 / ${quotesData.length}`;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % quotesData.length;
      updateQuote(currentIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + quotesData.length) % quotesData.length;
      updateQuote(currentIndex);
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * quotesData.length);
      } while (newIndex === currentIndex && quotesData.length > 1);
      currentIndex = newIndex;
      updateQuote(currentIndex);
    });
  }

  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('liked');
      const rect = likeBtn.getBoundingClientRect();
      if (window.burstPetals) {
        window.burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
      showToast('¡Guardada en tus favoritas! 💖');
    });
  }
}

/* ==========================================================================
   5. LIGHTBOX MODAL
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  const zoomBtns = document.querySelectorAll('.zoom-btn');
  zoomBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const imgPath = btn.getAttribute('data-img');
      const videoPath = btn.getAttribute('data-video');
      const caption = btn.getAttribute('data-caption');

      if (videoPath) {
        if (lightboxImg) lightboxImg.classList.add('hidden');
        if (lightboxVideo) {
          lightboxVideo.classList.remove('hidden');
          lightboxVideo.src = videoPath;
          lightboxVideo.play().catch(() => {});
        }
      } else {
        if (lightboxVideo) {
          lightboxVideo.pause();
          lightboxVideo.classList.add('hidden');
        }
        if (lightboxImg) {
          lightboxImg.classList.remove('hidden');
          lightboxImg.src = imgPath;
        }
      }

      lightboxCaption.textContent = caption;
      lightbox.classList.remove('hidden');
    });
  });

  function closeLightbox() {
    lightbox.classList.add('hidden');
    if (lightboxImg) lightboxImg.src = '';
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   6. RESCUE BUTTON (MIMOS VIRTUALES & VALES)
   ========================================================================== */
const vouchersPool = [
  {
    icon: '✨',
    title: 'Vale por una Salida antes de España',
    desc: 'Un café, un postre fit o simplemente un paseo para charlar sin apuros. (Invita Denis 😉)'
  },
  {
    icon: '🍰',
    title: 'Vale por tu Postre Favorito',
    desc: 'Sin azúcar, dulce a gusto y sin una sola pizca de culpa. Válido para recargar batería tras una semana intensa.'
  },
  {
    icon: '☕',
    title: 'Vale por una Charla Desconectada',
    desc: 'Prohibido hablar de trabajo, obligaciones o estrés. Solo buena vibra, risas y tiempo de calidad.'
  },
  {
    icon: '🌸',
    title: 'Vale por un Ramo de Flores Amarillas',
    desc: 'Porque las flores nunca sobran y te iluminan la casa de alegría.'
  },
  {
    icon: '👑',
    title: 'Decreto de Reina: Prohibido Trabajar',
    desc: 'Certificado oficial que te autoriza a acostarte temprano, mirar tus series favoritas o simplemente no hacer nada.'
  },
  {
    icon: '🏎️',
    title: 'Vale por un Paseo en Auto Veloz',
    desc: 'Ventanillas bajas, buena música y sentir el motor para vaciar la cabeza y disfrutar del camino.'
  }
];

function initRescueButton() {
  const actionBtn = document.getElementById('rescueActionBtn');
  const voucherDisplay = document.getElementById('voucherDisplay');
  const voucherIcon = document.getElementById('voucherIcon');
  const voucherTitle = document.getElementById('voucherTitle');
  const voucherDesc = document.getElementById('voucherDesc');

  let currentVoucherIdx = 0;

  actionBtn.addEventListener('click', (e) => {
    const rect = actionBtn.getBoundingClientRect();
    if (window.burstPetals) {
      window.burstPetals(rect.left + rect.width / 2, rect.top);
    }

    // Select next voucher
    const v = vouchersPool[currentVoucherIdx];
    currentVoucherIdx = (currentVoucherIdx + 1) % vouchersPool.length;

    voucherIcon.textContent = v.icon;
    voucherTitle.textContent = v.title;
    voucherDesc.textContent = v.desc;

    const claimBtn = document.getElementById('claimVoucherBtn');
    if (claimBtn) {
      const waMsg = encodeURIComponent(`Hola Denis! Acabo de desbloquear el "${v.title}" en la página 😉🎁`);
      claimBtn.href = `https://wa.me/595986550235?text=${waMsg}`;
    }

    voucherDisplay.classList.remove('hidden');
    showToast('¡Mimo virtual desbloqueado! 🎁');
  });
}

/* ==========================================================================
   7. COUNTDOWN TO SPAIN (December 6, 2026)
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('daysNum');
  const hoursEl = document.getElementById('hoursNum');
  const minsEl = document.getElementById('minsNum');
  const secsEl = document.getElementById('secsNum');

  if (!daysEl) return;

  // Spain trip target: Dec 6, 2026 08:00 AM
  const targetDate = new Date('2026-12-06T08:00:00').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days < 10 ? '0' + days : days;
    hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    minsEl.textContent = mins < 10 ? '0' + mins : mins;
    secsEl.textContent = secs < 10 ? '0' + secs : secs;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   TOAST HELPER
   ========================================================================== */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}

/* ==========================================================================
   8. STATUS PHRASES FOR WHATSAPP (SCREENSHOT READY)
   ========================================================================== */
const statusPhrases = [
  // Fe & Gratitud (Dios)
  {
    category: 'fe',
    badge: 'Fe & Dios',
    symbol: '🙏',
    text: 'Dejar todo en manos de Dios y seguir caminando con el corazón en paz. Él nunca falla. 🤍'
  },
  {
    category: 'fe',
    badge: 'Gratitud',
    symbol: '🙌',
    text: 'Donde Dios pone su gracia, ninguna dificultad puede apagar tu brillo. Agradecida por las pruebas y por lo que viene. ✨'
  },
  {
    category: 'fe',
    badge: 'Confianza',
    symbol: '🕊️',
    text: 'Los tiempos de Dios son perfectos. Lo que está destinado para ti, llegará en el momento exacto.'
  },
  {
    category: 'fe',
    badge: 'Fuerza',
    symbol: '🌟',
    text: 'Dios no te pone sueños grandes sin darte las fuerzas para alcanzarlos. Con fe todo se puede.'
  },
  {
    category: 'fe',
    badge: 'Paz Interior',
    symbol: '🤍',
    text: 'La gratitud en el corazón convierte lo que tenemos en suficiente y abre puertas a nuevas bendiciones.'
  },

  // Actitud & Fuerza
  {
    category: 'actitud',
    badge: 'Actitud & Poder',
    symbol: '🖤',
    text: 'Una mujer que sabe lo que cuesta salir adelante, no se conforma con poco.'
  },
  {
    category: 'actitud',
    badge: 'Fuerza Propia',
    symbol: '🕊️',
    text: 'Mi paz mental y mi tranquilidad no se negocian con nadie.'
  },
  {
    category: 'actitud',
    badge: 'Enfoque',
    symbol: '✨',
    text: 'Silenciosa con mis procesos, firme con mis metas.'
  },
  {
    category: 'actitud',
    badge: 'Autenticidad',
    symbol: '👑',
    text: 'No compito con nadie, bastante trabajo me da superarme a mí misma cada día.'
  },

  // Paz & Desconexión
  {
    category: 'relax',
    badge: 'Paz & Calma',
    symbol: '☕',
    text: 'Modo avión: desconectando del mundo para conectar conmigo.'
  },
  {
    category: 'relax',
    badge: 'Descanso Merecido',
    symbol: '🌙',
    text: 'Descansar no es perder el tiempo, es recargar a una reina que lo da todo.'
  },
  {
    category: 'relax',
    badge: 'Sin Filtro',
    symbol: '💤',
    text: 'Poco tiempo para el drama, mucho sueño acumulado.'
  },
  {
    category: 'relax',
    badge: 'Elegancia',
    symbol: '🖤',
    text: 'La verdadera elegancia es elegir estar en paz y sin apuros.'
  },

  // Humor & Realidad
  {
    category: 'humor',
    badge: 'Humor Sutil',
    symbol: '😉',
    text: 'Dicen que soy aburrida, pero en realidad mi nivel de paz no lo cambio por nada.'
  },
  {
    category: 'humor',
    badge: 'Viernes Ideal',
    symbol: '😌',
    text: 'Mi plan perfecto: algo rico para comer, cero ruido y dormir temprano.'
  },
  {
    category: 'humor',
    badge: 'Fit & Sweet',
    symbol: '🍰',
    text: 'Entreno duro para poder comer algo rico y sin culpas.'
  },
  {
    category: 'humor',
    badge: 'Realidad Diaria',
    symbol: '😴',
    text: 'No me faltan ganas, me sobran horas de sueño y trabajo.'
  },

  // Nuevos Caminos
  {
    category: 'metas',
    badge: 'Nuevos Caminos',
    symbol: '✈️',
    text: 'El miedo existe, pero las ganas de cumplir mis sueños son mucho más grandes.'
  },
  {
    category: 'metas',
    badge: 'Horizontes',
    symbol: '🌟',
    text: 'A veces hay que animarse a dar pasos gigantes para encontrarse con la mejor versión de uno mismo.'
  },
  {
    category: 'metas',
    badge: 'Determinación',
    symbol: '🌍',
    text: 'Cerrando etapas con gratitud y abriendo caminos con valentía. Lo mejor está por venir.'
  }
];

function initStatusGrid() {
  const grid = document.getElementById('statusGrid');
  const filters = document.querySelectorAll('.status-filter');
  if (!grid || !filters.length) return;

  function renderStatusCards(filterCategory = 'all') {
    grid.innerHTML = '';
    const filtered = filterCategory === 'all' 
      ? statusPhrases 
      : statusPhrases.filter(p => p.category === filterCategory);

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'status-card';
      card.innerHTML = `
        <div class="status-card-header">
          <span class="status-badge">${item.badge}</span>
          <span class="status-symbol">${item.symbol || '✨'}</span>
        </div>
        <p class="status-card-text">"${item.text}"</p>
        <div class="status-card-footer">
          <span class="status-star">✦</span>
        </div>
      `;

      // Touch / click micro-interaction (burst of golden particles)
      card.addEventListener('click', (e) => {
        const rect = card.getBoundingClientRect();
        if (window.burstPetals) {
          window.burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      });

      grid.appendChild(card);
    });
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderStatusCards(btn.getAttribute('data-category'));
    });
  });

  renderStatusCards('all');
}

/* ==========================================================================
   9. MINI-TEST INTERACTIVO: ¿Qué tan aburrida sos?
   ========================================================================== */
function initMiniTest() {
  const testCard = document.getElementById('testCard');
  const testQuestion = document.getElementById('testQuestion');
  const testOptions = document.getElementById('testOptions');
  const testStepLabel = document.getElementById('testStepLabel');
  const testProgressFill = document.getElementById('testProgressFill');
  const testResultCard = document.getElementById('testResultCard');
  const retryBtn = document.getElementById('retryTestBtn');

  if (!testCard || !testQuestion || !testOptions) return;

  const testQuestions = [
    {
      question: "¿Tu plan ideal de viernes a la noche después de una semana pesada?",
      options: [
        "Ducha caliente, algo rico para merendar/cenar y a la cama temprano 🌙",
        "Salir a quemar la noche aunque el lunes no me pueda levantar 💃",
        "Dormir 12 horas seguidas sin que nadie me hable 😴"
      ]
    },
    {
      question: "¿Tu relación con el gimnasio y los gustitos dulces?",
      options: [
        "Entreno duro, pero si hay postre rico me lo como con ganas y cero culpas 🍰",
        "Dieta estricta de lechuga y agua 24/7 sin excepciones 🥗",
        "El único ejercicio que hago es esquivar responsabilidades 🏃‍♀️"
      ]
    },
    {
      question: "¿Tu verdadera definición de tener paz mental?",
      options: [
        "Estar tranquila en mi casa, sin dramas y disfrutando de mi espacio 🖤",
        "Estar rodeada de mil personas todo el tiempo 🗣️",
        "Que mi celular no suene nunca más los fines de semana 📴"
      ]
    }
  ];

  let currentStep = 0;

  function renderQuestion(index) {
    testCard.style.opacity = '0';
    testCard.style.transform = 'translateY(6px)';

    setTimeout(() => {
      const q = testQuestions[index];
      if (testStepLabel) testStepLabel.textContent = `Pregunta ${index + 1} de ${testQuestions.length}`;
      if (testProgressFill) testProgressFill.style.width = `${((index + 1) / testQuestions.length) * 100}%`;
      testQuestion.textContent = q.question;
      testOptions.innerHTML = '';

      q.options.forEach((optText) => {
        const btn = document.createElement('button');
        btn.className = 'test-option-btn';
        btn.type = 'button';
        btn.innerHTML = `
          <span class="test-option-dot"></span>
          <span>${optText}</span>
        `;

        btn.addEventListener('click', () => {
          const rect = btn.getBoundingClientRect();
          if (window.burstPetals) {
            window.burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2);
          }

          if (currentStep < testQuestions.length - 1) {
            currentStep++;
            renderQuestion(currentStep);
          } else {
            showResult();
          }
        });

        testOptions.appendChild(btn);
      });

      testCard.style.opacity = '1';
      testCard.style.transform = 'translateY(0)';
    }, 150);
  }

  function showResult() {
    testCard.classList.add('hidden');
    if (testStepLabel) testStepLabel.textContent = 'Diagnóstico Final Completado';
    if (testProgressFill) testProgressFill.style.width = '100%';
    if (testResultCard) testResultCard.classList.remove('hidden');

    if (testResultCard && window.burstPetals) {
      const rect = testResultCard.getBoundingClientRect();
      window.burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      currentStep = 0;
      if (testResultCard) testResultCard.classList.add('hidden');
      testCard.classList.remove('hidden');
      renderQuestion(0);
    });
  }

  renderQuestion(0);
}

