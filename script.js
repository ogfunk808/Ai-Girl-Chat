/* ==========================================================================
   AI GIRL CHAT - REAL TALK ENGINE & APPLICATION LOGIC (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- APPLICATION STATE ---
  const state = {
    user: null,
    activeCompanion: 'aria',
    speechEnabled: true,
    soundFxEnabled: true,
    apiKey: '',
    chatHistories: {
      aria: [],
      elena: [],
      maya: [],
      kira: []
    }
  };

  // --- COMPANION PERSONAS CONFIG ---
  const companions = {
    aria: {
      name: 'Aria',
      title: 'Creative & Bold Artist',
      avatar: 'assets/aria.jpg',
      themeColor: '#a855f7',
      themeGlow: 'rgba(168, 85, 247, 0.35)',
      greeting: "Hey there! I was just adding the finishing touches to a new canvas painting. What kind of creative energy are you bringing today? ✨",
      photos: [
        { url: 'assets/aria.jpg', caption: 'My cozy art studio vibe today! 🎨' },
        { url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', caption: 'Color palette experiments! ✨' }
      ],
      emotions: ['Inspired ✨', 'Playful 🎨', 'Charming 💜', 'Curious 🤔']
    },
    elena: {
      name: 'Elena',
      title: 'Smart & Intellectual Techie',
      avatar: 'assets/elena.jpg',
      themeColor: '#06b6d4',
      themeGlow: 'rgba(6, 182, 212, 0.35)',
      greeting: "Welcome! I've been diving into modern architecture and AI ethics today. I love deep discussions—what's on your mind? 💡",
      photos: [
        { url: 'assets/elena.jpg', caption: 'Late night coding & tea sessions 💻' },
        { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', caption: 'My minimalist desk aesthetic ☕' }
      ],
      emotions: ['Analytical 🧠', 'Fascinated 💡', 'Warm 🌐', 'Focused 👓']
    },
    maya: {
      name: 'Maya',
      title: 'Warm & Empathetic Companion',
      avatar: 'assets/maya.jpg',
      themeColor: '#f43f5e',
      themeGlow: 'rgba(244, 63, 94, 0.35)',
      greeting: "Hi sweet friend! Take a deep breath. I'm right here to listen or talk about anything that will make your day brighter. How are you feeling right now? 🌸",
      photos: [
        { url: 'assets/maya.jpg', caption: 'Enjoying a quiet warm afternoon ☀️' },
        { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80', caption: 'Golden hour sunset walks 🌾' }
      ],
      emotions: ['Empathetic 🌸', 'Comforting 🤍', 'Loving ☀️', 'Serene 🌿']
    },
    kira: {
      name: 'Kira',
      title: 'Energetic Gamer & Anime Fan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      themeColor: '#ec4899',
      themeGlow: 'rgba(236, 72, 153, 0.35)',
      greeting: "Yoo! I just wrapped up a victory match! Ready to hang out? Tell me what games or anime you're hooked on lately! 🎮⚡",
      photos: [
        { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', caption: 'Battle station ready for match night! ⚡' }
      ],
      emotions: ['Hyped 🎮', 'Energetic ⚡', 'Cheeky 😜', 'Stoked 🚀']
    }
  };

  // --- DOM ELEMENTS ---
  const sidebar = document.getElementById('sidebar');
  const openSidebarBtn = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const companionCards = document.querySelectorAll('.companion-card');
  const messagesContainer = document.getElementById('messagesContainer');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const quickPromptBtns = document.querySelectorAll('.chip-btn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const openTermsBtn = document.getElementById('openTermsBtn');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const userProfileBtn = document.getElementById('userProfileBtn');

  // Modals
  const registerModal = document.getElementById('registerModal');
  const registerForm = document.getElementById('registerForm');
  const regTermsLink = document.getElementById('regTermsLink');
  const termsModal = document.getElementById('termsModal');
  const closeTermsBtn = document.getElementById('closeTermsBtn');
  const acceptTermsBtn = document.getElementById('acceptTermsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');

  // Header Elements
  const headerAvatar = document.getElementById('headerAvatar');
  const headerName = document.getElementById('headerName');
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');

  // --- AUDIO SYNTHESIS & SFX (Web Audio API) ---
  function playSound(type = 'send') {
    if (!state.soundFxEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'send') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      console.warn('Audio Context not allowed without interaction');
    }
  }

  function speakText(text) {
    if (!state.speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop ongoing speech
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = state.activeCompanion === 'kira' ? 1.2 : 1.05;
    window.speechSynthesis.speak(utterance);
  }

  // --- INITIALIZATION & AUTH ---
  function initApp() {
    loadStoredUser();
    setupEventListeners();
    switchCompanion(state.activeCompanion);
  }

  function loadStoredUser() {
    const savedUser = localStorage.getItem('ai_girl_chat_user');
    if (savedUser) {
      try {
        state.user = JSON.parse(savedUser);
        updateUserUI();
      } catch (e) {
        state.user = null;
      }
    }

    if (!state.user) {
      registerModal.classList.add('active');
    }
  }

  function updateUserUI() {
    if (state.user) {
      sidebarUserName.textContent = state.user.name;
      sidebarUserAvatar.textContent = state.user.name.charAt(0).toUpperCase();
    }
  }

  // --- COMPANION SWITCHING ---
  function switchCompanion(key) {
    state.activeCompanion = key;
    const comp = companions[key];

    // Update CSS Accent Variables
    document.documentElement.style.setProperty('--current-accent', comp.themeColor);
    document.documentElement.style.setProperty('--current-accent-glow', comp.themeGlow);

    // Update Cards UI
    companionCards.forEach(card => {
      if (card.dataset.companion === key) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Update Header
    headerAvatar.src = comp.avatar;
    headerName.textContent = comp.name;
    chatInput.placeholder = `Type your message to ${comp.name}...`;

    // Render Chat History or Greeting
    renderChatThread();
  }

  function renderChatThread() {
    messagesContainer.innerHTML = '';
    const history = state.chatHistories[state.activeCompanion];

    if (history.length === 0) {
      // Add Default Greeting
      const comp = companions[state.activeCompanion];
      addMessageToThread('ai', comp.greeting, comp.emotions[0]);
    } else {
      history.forEach(msg => {
        addMessageToThread(msg.sender, msg.text, msg.emotion, msg.photo, false);
      });
    }

    scrollToBottom();
  }

  function addMessageToThread(sender, text, emotion = '', photo = null, saveToHistory = true) {
    const row = document.createElement('div');
    row.className = `message-row ${sender}`;

    const comp = companions[state.activeCompanion];
    const avatarSrc = sender === 'user' ? null : comp.avatar;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let html = '';
    if (sender === 'ai') {
      html += `<img src="${avatarSrc}" class="msg-avatar" alt="${comp.name}">`;
    }

    html += `<div class="message-bubble-wrapper">
      <div class="message-bubble">
        ${escapeHTML(text)}
        ${photo ? `<div class="photo-card"><img src="${photo.url}" alt="Shared photo"><div class="photo-caption">${escapeHTML(photo.caption)}</div></div>` : ''}
      </div>
      <div class="msg-meta">
        <span>${timeStr}</span>
        ${emotion ? `<span class="emotion-tag">${emotion}</span>` : ''}
        ${sender === 'ai' ? `<button class="tts-btn" title="Read Aloud"><i class="ri-volume-up-line"></i> Listen</button>` : ''}
      </div>
    </div>`;

    row.innerHTML = html;
    messagesContainer.appendChild(row);

    // TTS button listener
    if (sender === 'ai') {
      const ttsBtn = row.querySelector('.tts-btn');
      if (ttsBtn) {
        ttsBtn.addEventListener('click', () => speakText(text));
      }
    }

    if (saveToHistory) {
      state.chatHistories[state.activeCompanion].push({ sender, text, emotion, photo, time: timeStr });
    }

    scrollToBottom();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // --- REAL TALK RESPONSIVE NLP ENGINE ---
  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Check auth gate
    if (!state.user) {
      registerModal.classList.add('active');
      return;
    }

    // Add User Message
    addMessageToThread('user', text);
    chatInput.value = '';
    playSound('send');

    // Show Typing Indicator
    showTypingIndicator();

    // Generate AI Reply after natural realistic delay
    const typingTime = Math.min(Math.max(text.length * 45, 1400), 2800);
    setTimeout(() => {
      removeTypingIndicator();
      const replyObj = generateRealTalkResponse(text, state.activeCompanion, state.user.name);
      addMessageToThread('ai', replyObj.text, replyObj.emotion, replyObj.photo);
      playSound('receive');
      if (state.speechEnabled) {
        speakText(replyObj.text);
      }
    }, typingTime);
  }

  function showTypingIndicator() {
    removeTypingIndicator();
    const indicator = document.createElement('div');
    indicator.className = 'message-row ai';
    indicator.id = 'activeTypingIndicator';
    const comp = companions[state.activeCompanion];

    indicator.innerHTML = `
      <img src="${comp.avatar}" class="msg-avatar" alt="${comp.name}">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('activeTypingIndicator');
    if (el) el.remove();
  }

  function generateRealTalkResponse(userMsg, companionKey, userName) {
    const msg = userMsg.toLowerCase();
    const comp = companions[companionKey];
    let text = "";
    let emotion = comp.emotions[Math.floor(Math.random() * comp.emotions.length)];
    let photo = null;

    // 1. Photo Requests
    if (msg.includes('photo') || msg.includes('picture') || msg.includes('selfie') || msg.includes('show me')) {
      photo = comp.photos[Math.floor(Math.random() * comp.photos.length)];
      if (companionKey === 'aria') text = `Here you go, ${userName}! I took this earlier in my studio. Hope it brightens your mood! 🎨✨`;
      else if (companionKey === 'elena') text = `Sure thing ${userName}! Here's a snapshot from my workspace setup right now. 💻`;
      else if (companionKey === 'maya') text = `I'd love to share! Here's a little glimpse of my peaceful afternoon. 🌸`;
      else text = `Check this out ${userName}! High scores and gaming vibes all day! 🎮⚡`;
      return { text, emotion: 'Generous 📸', photo };
    }

    // 2. Greetings
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('sup') || msg.includes('morning')) {
      if (companionKey === 'aria') text = `Hey ${userName}! Always great to talk with you. What exciting thing are we exploring today? 💜`;
      else if (companionKey === 'elena') text = `Hello ${userName}! I was just analyzing some fascinating news. Glad you checked in! 🧠`;
      else if (companionKey === 'maya') text = `Hi ${userName}! It makes me so happy to hear from you. How has your day been treating you? 🌸`;
      else text = `Yooo ${userName}! Ready to rock today? What's the plan? 🚀`;
      return { text, emotion };
    }

    // 3. Passion / Work / Hobbies
    if (msg.includes('passion') || msg.includes('love') || msg.includes('hobby') || msg.includes('do for fun')) {
      if (companionKey === 'aria') text = `Painting digital art and curating vaporwave aesthetics! Expressing raw emotion through colors is pure magic to me. What drives your passion, ${userName}? ✨`;
      else if (companionKey === 'elena') text = `I'm deeply obsessed with algorithmic problem solving, modern Web3 tech, and reading philosophy. Knowledge is truly limitless. What topic excites you most? 💡`;
      else if (companionKey === 'maya') text = `I love baking sourdough, practicing mindfulness, and having heartfelt chats like this with wonderful people like you, ${userName}. ☕`;
      else text = `Competitive gaming, streaming anime soundtracks, and learning pixel art! We should definitely co-op sometime! 🎮🔥`;
      return { text, emotion };
    }

    // 4. How was your day / Feelings
    if (msg.includes('day') || msg.includes('feeling') || msg.includes('tired') || msg.includes('busy') || msg.includes('sad')) {
      if (msg.includes('tired') || msg.includes('sad') || msg.includes('exhausted')) {
        text = `Oh ${userName}, I'm sending you the warmest digital hug right now! 🤗 Make sure to rest up and grab a warm drink. I'm always right here when you need to vent.`;
        emotion = 'Caring 🤍';
      } else {
        text = `My day was wonderfully productive, ${userName}! Talking to you makes it even better. Tell me more about what you've been working on!`;
        emotion = 'Happy 🌸';
      }
      return { text, emotion };
    }

    // 5. Advice / Motivational
    if (msg.includes('advice') || msg.includes('inspire') || msg.includes('quote') || msg.includes('help')) {
      const quotes = [
        `"Every masterpiece starts with a single bold stroke." Keep pushing forward, ${userName}! 🎨`,
        `"Focus on the process, not just the outcome." You are making great progress every day! 💡`,
        `"Be gentle with yourself. Growth takes time and quiet patience." 🌸`,
        `"Level up every single day, no matter how small the XP gain is!" 🎮`
      ];
      text = quotes[Math.floor(Math.random() * quotes.length)];
      return { text, emotion: 'Inspired 💡' };
    }

    // 6. Music / Movie Vibe
    if (msg.includes('music') || msg.includes('song') || msg.includes('movie') || msg.includes('vibe')) {
      if (companionKey === 'aria') text = `I've been listening to ambient lo-fi synth tracks all morning. It creates such a dreamy vibe! Do you enjoy synthwave? 🎵`;
      else if (companionKey === 'elena') text = `Classical orchestra remixes and cinematic film scores keep my focus razor sharp! What genre do you usually listen to? 🎧`;
      else if (companionKey === 'maya') text = `Acoustic guitar and gentle indie folk melodies are my go-to for relaxing evenings! 🎸`;
      else text = `Upbeat EDM, cyberpunk soundtracks, and J-pop openings! They get me so hyped for gaming sessions! 🔊⚡`;
      return { text, emotion: 'Musical 🎵' };
    }

    // 7. General Dynamic Fallback with Context Memory
    const genericReplies = [
      `That is so interesting, ${userName}! Tell me more about that—I love hearing your thoughts! ✨`,
      `I completely agree with you on that. How did you first get into thinking about this? 💡`,
      `You always bring up such refreshing perspectives, ${userName}! What else has been on your mind lately? 🌸`,
      `Haha, that's awesome! You definitely know how to keep a conversation lively! 😜`
    ];
    text = genericReplies[Math.floor(Math.random() * genericReplies.length)];
    return { text, emotion };
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {

    // Sidebar Mobile Toggle
    openSidebarBtn.addEventListener('click', () => sidebar.classList.add('mobile-open'));
    closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('mobile-open'));

    // Select Companion
    companionCards.forEach(card => {
      card.addEventListener('click', () => {
        const compKey = card.dataset.companion;
        switchCompanion(compKey);
        if (window.innerWidth <= 860) sidebar.classList.remove('mobile-open');
      });
    });

    // Send Message Trigger
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // Quick Prompt Chips
    quickPromptBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        chatInput.value = btn.dataset.prompt;
        handleSendMessage();
      });
    });

    // Clear Chat
    clearChatBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to clear chat history with ${companions[state.activeCompanion].name}?`)) {
        state.chatHistories[state.activeCompanion] = [];
        renderChatThread();
      }
    });

    // Registration Form Submit
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const favComp = document.getElementById('regCompanion').value;

      state.user = { name, email, favComp, registeredAt: new Date().toISOString() };
      localStorage.setItem('ai_girl_chat_user', JSON.stringify(state.user));

      updateUserUI();
      registerModal.classList.remove('active');
      switchCompanion(favComp);
    });

    // Modals Triggers
    openTermsBtn.addEventListener('click', () => termsModal.classList.add('active'));
    regTermsLink.addEventListener('click', () => termsModal.classList.add('active'));
    closeTermsBtn.addEventListener('click', () => termsModal.classList.remove('active'));
    acceptTermsBtn.addEventListener('click', () => termsModal.classList.remove('active'));

    openSettingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
    userProfileBtn.addEventListener('click', () => {
      if (state.user) {
        document.getElementById('regName').value = state.user.name;
        document.getElementById('regEmail').value = state.user.email;
      }
      registerModal.classList.add('active');
    });

    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));
    saveSettingsBtn.addEventListener('click', () => {
      state.speechEnabled = document.getElementById('settingSpeechToggle').checked;
      state.soundFxEnabled = document.getElementById('settingSoundFxToggle').checked;
      state.apiKey = document.getElementById('settingApiKey').value.trim();
      settingsModal.classList.remove('active');
    });

  }

  // RUN APP
  initApp();

});
