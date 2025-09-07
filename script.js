// script.js v13 - robust handlers so menu buttons always work
document.addEventListener('DOMContentLoaded', function() {
  const DISCORD_INVITE = 'https://discord.gg/bt5BA67ncj';

  const introAudio = document.getElementById('intro-audio');
  const clickAudio = document.getElementById('click-audio');
  const overlay = document.getElementById('overlay');
  const backBtn = document.getElementById('back-to-menu');
  const devBannerWrap = document.getElementById('dev-banner-wrap');

  function safePlay(audio) {
    if (!audio) return Promise.reject(new Error('no-audio'));
    try {
      audio.muted = false;
      audio.volume = 1.0;
      const p = audio.play();
      if (p && typeof p.then === 'function') return p;
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  function showOverlay() {
    if (!overlay) return;
    overlay.classList.remove('menu-hidden');
    if (devBannerWrap) devBannerWrap.classList.remove('hidden');
    document.querySelectorAll('.section').forEach(s => {
      s.classList.remove('visible','enter');
    });
    if (backBtn) backBtn.style.display = 'none';
  }

  function openSection(id) {
    if (!overlay) return;
    overlay.classList.add('menu-hidden');
    if (devBannerWrap) devBannerWrap.classList.add('hidden');
    const sections = document.querySelectorAll('.section');
    let found = false;
    sections.forEach(s => {
      if (s.id === id) {
        s.classList.add('visible');
        s.classList.add('enter');
        setTimeout(()=> s.classList.remove('enter'), 800);
        found = true;
      } else {
        s.classList.remove('visible','enter');
      }
    });
    if (backBtn) backBtn.style.display = 'block';
    // If found, scroll the section to top of viewport
    if (found) {
      const target = document.getElementById(id);
      if (target) {
        try { target.scrollIntoView({behavior:'auto', block:'start'}); } catch(e) { window.scrollTo({top:0, behavior:'auto'}); }
      }
    } else {
      // fallback: show overlay
      showOverlay();
    }
  }

  // Bind click sound to interactive elements (defensive)
  function bindClickSoundToAll() {
    document.querySelectorAll('button, a').forEach(el => {
      // avoid binding multiple times
      if (el._hasClickSound) return;
      el.addEventListener('click', function(e){
        try { if (clickAudio) clickAudio.play().catch(()=>{}); } catch(err) {}
      });
      el._hasClickSound = true;
    });
  }
  bindClickSoundToAll();

  // Menu buttons behavior: delegation to handle dynamic changes
  document.addEventListener('click', function(e){
    const mb = e.target.closest && e.target.closest('.menu-btn');
    if (mb) {
      e.preventDefault();
      const target = mb.getAttribute('data-target');
      if (!target) return;
      if (target === 'shop') {
        // play intro audio (user gesture) then redirect
        try { if (clickAudio) clickAudio.play().catch(()=>{}); } catch(e) {}
        safePlay(introAudio).then(()=>{
          let done = false;
          function redirectNow(){ if (done) return; done = true; window.location.href = DISCORD_INVITE; }
          introAudio.addEventListener('ended', redirectNow, {once:true});
          setTimeout(()=>{ redirectNow(); }, 1200);
        }).catch(()=>{
          // fallback redirect
          setTimeout(()=> { window.location.href = DISCORD_INVITE; }, 220);
        });
        return;
      } else {
        openSection(target);
        return;
      }
    }

    // Web-offer card click: open overlay/menu (if clicked anywhere inside)
    const webOffer = e.target.closest && e.target.closest('#web-offer');
    if (webOffer) {
      e.preventDefault();
      showOverlay();
      return;
    }

    // Order buttons: confirm then go to discord
    const orderBtn = e.target.closest && e.target.closest('.order-btn');
    if (orderBtn) {
      e.preventDefault();
      const type = orderBtn.getAttribute('data-type') || 'Zamówienie';
      const link = orderBtn.getAttribute('data-link') || DISCORD_INVITE;
      try { if (clickAudio) clickAudio.play().catch(()=>{}); } catch(e) {}
      const ok = confirm(`Czy na pewno chcesz zamówić: ${type} ?`);
      if (ok) {
        try { if (clickAudio) clickAudio.play().catch(()=>{}); } catch(e) {}
        setTimeout(()=> { window.location.href = link; }, 220);
      }
      return;
    }
  });

  // Back button behavior
  if (backBtn) {
    backBtn.addEventListener('click', function(e){
      e.preventDefault();
      showOverlay();
      try { window.scrollTo({top:0, behavior:'smooth'}); } catch(e) { window.scrollTo(0,0); }
    });
  }

  // Initial binding for menu buttons in case .menu-btn elements exist
  document.querySelectorAll('.menu-btn').forEach(btn => {
    // ensure only one listener
    if (btn._bound) return;
    btn._bound = true;
    btn.addEventListener('click', function(e){
      // Let the delegated handler take care; do nothing here to avoid duplication
    });
  });

  // Ensure initial state
  showOverlay();

  // Expose functions for debugging (optional)
  window._site = { openSection, showOverlay };
});
