    (() => {
      'use strict';

      const mobileQuery = window.matchMedia('(max-width: 900px)');
      const tabletQuery = window.matchMedia('(max-width: 900px)');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const isMobile = mobileQuery.matches;
      const scene = document.getElementById('scene');
      const sceneSticky = document.querySelector('.scene__sticky');
      const video = document.getElementById('sceneVideo');
      const frames = [...document.querySelectorAll('.scene__frame')];
      const phases = [...document.querySelectorAll('.phase')];
      const loader = document.getElementById('loader');
      const loaderCount = document.getElementById('loaderCount');
      const loaderBar = document.getElementById('loaderBar');
      const loaderLabel = document.getElementById('loaderLabel');
      const header = document.getElementById('header');
      const scrollHint = document.getElementById('scrollHint');
      const orbitSection = document.querySelector('.orbit-section');
      const orbitRight = document.querySelector('.orbit-right');
      const orbitCards = [...document.querySelectorAll('.orbit-card')];
      const processSection = document.querySelector('.process-section');
      const processRight = document.querySelector('.process-right');
      const processTrack = document.querySelector('.process-track');
      const processSteps = [...document.querySelectorAll('.step')];
      const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

      let progressMax = 1;
      let videoDuration = 0;
      let videoReady = false;
      let scrubEnabled = false;
      let lastSeek = -1;
      let lastSeekAt = 0;
      let scheduled = false;
      let headerSceneState = null;
      let headerScrollState = null;
      let lastSceneProgress = -1;
      let orbitNear = false;
      let processNear = false;
      let lastOrbitMode = null;
      let lastMobileOrbitIndex = -1;
      let orbitMetrics = { travel: 1, width: 0, height: 0, radiusX: 0, radiusY: 0, stepY: 200 };
      let processOverflow = 0;

      let cookieNoticeShown = false;
      const COOKIE_KEY = 'cinza-cookie-choice';

      const SCROLL_KEY = 'cinza-scroll-position';
      const SCROLL_TTL_MS = 5 * 60 * 1000;
      let hardReloadPending = false;

      function setLoader(value, label) {
        const percent = Math.round(clamp(value, 0, 100));
        loaderCount.textContent = `${percent}%`;
        loaderBar.style.width = `${percent}%`;
        if (label) loaderLabel.textContent = label;
      }
      function finishLoader() {
        setLoader(100);
        loader.classList.add('is-done');
      }

      function setFrameAndPhase(progress) {
        const index = progress < 0.31 ? 0 : (progress < 0.64 ? 1 : 2);
        frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));
        phases.forEach((phase, i) => phase.classList.toggle('is-active', i === index));
      }

      function applyVideoTime(progress) {
        if (!videoReady || !videoDuration || !scrubEnabled) return;
        if (video.readyState < 2) return;
        if (video.seeking) return;

        const now = performance.now();
        if (now - lastSeekAt < 24) return;

        const target = progress * videoDuration;
        if (Math.abs(target - video.currentTime) < 0.05) return;

        if (video.seekable.length === 0) return;
        const seekableEnd = video.seekable.end(video.seekable.length - 1);
        if (target > seekableEnd) return;

        lastSeekAt = now;
        lastSeek = target;

        try {
          if (typeof video.fastSeek === 'function') video.fastSeek(target);
          else video.currentTime = target;
        } catch (_) {}
      }

      function measureLayout() {
        const sceneHeight = scene.offsetHeight;
        const stickyHeight = sceneSticky.offsetHeight || window.innerHeight;
        progressMax = Math.max(1, sceneHeight - stickyHeight);

        if (orbitSection && orbitRight) {
          orbitMetrics.travel = Math.max(1, orbitSection.offsetHeight - window.innerHeight);
          orbitMetrics.width = orbitRight.clientWidth || window.innerWidth;
          orbitMetrics.height = orbitRight.clientHeight || window.innerHeight * .65;
          orbitMetrics.radiusX = Math.min(180, orbitMetrics.width * .36);
          orbitMetrics.radiusY = Math.min(140, orbitMetrics.height * .22);
          orbitMetrics.stepY = clamp(orbitMetrics.height * .52, 180, 235);
        }
        if (processTrack && processRight) processOverflow = Math.max(0, processTrack.scrollHeight - processRight.clientHeight);
      }

      function updateOrbit(progress) {
        if (!orbitCards.length) return;

        if (tabletQuery.matches) {
          if (lastOrbitMode !== 'mobile') {
            orbitCards.forEach(card => {
              card.style.transform = '';
              card.style.opacity = '';
              card.style.zIndex = '';
              card.classList.remove('is-mobile-active');
            });
            lastMobileOrbitIndex = -1;
            lastOrbitMode = 'mobile';
          }

          const position = clamp(progress, 0, 1) * (orbitCards.length - 1);
          const activeIndex = Math.round(position);
          if (activeIndex === lastMobileOrbitIndex) return;

          lastMobileOrbitIndex = activeIndex;
          orbitCards.forEach((card, index) => {
            card.classList.toggle('is-mobile-active', index === activeIndex);
          });
          return;
        }

        if (lastOrbitMode !== 'desktop') {
          orbitCards.forEach(card => card.classList.remove('is-mobile-active'));
          lastOrbitMode = 'desktop';
          lastMobileOrbitIndex = -1;
        }

        const rotation = progress * Math.PI * 2;
        orbitCards.forEach((card, index) => {
          const angle = -(index / orbitCards.length) * Math.PI * 2 + rotation;
          const x = Math.cos(angle) * orbitMetrics.radiusX;
          const y = Math.sin(angle) * orbitMetrics.radiusY;
          const depth = (Math.sin(angle) + 1) / 2;
          card.style.transform = `translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),0) scale(${.85 + depth * .15})`;
          card.style.opacity = .4 + depth * .6;
          card.style.zIndex = String(Math.round(depth * 100));
        });
      }

      function updateProcess(progress) {
        const lastIndex = Math.max(1, processSteps.length - 1);
        processSteps.forEach((step, index) => {
          const threshold = processSteps.length <= 1 ? 0 : index / lastIndex * .9;
          step.classList.toggle('in', progress >= threshold - .001);
        });
        if (processTrack && processOverflow > 0) processTrack.style.transform = `translate3d(0,${-processOverflow * progress}px,0)`;
        else if (processTrack) processTrack.style.transform = '';
      }

      function updateScene(force = false) {
        const rect = scene.getBoundingClientRect();
        const progress = clamp(-rect.top / progressMax, 0, 1);
        if (force || Math.abs(progress - lastSceneProgress) > .0001) {
          lastSceneProgress = progress;
          if (isMobile) setFrameAndPhase(progress);
          else {
            phases.forEach(phase => {
              const start = Number.parseFloat(phase.dataset.from);
              const end = Number.parseFloat(phase.dataset.to);
              phase.classList.toggle('is-active', progress >= start && progress < end);
            });
            applyVideoTime(progress);
          }
          scrollHint.classList.toggle('is-hidden', progress > .03);
          const inScene = progress < 1 && rect.bottom > 0;
          if (inScene !== headerSceneState) {
            headerSceneState = inScene;
            header.classList.toggle('is-scene', inScene);
          }

          if (!cookieNoticeShown && progress >= 0.98) {
            cookieNoticeShown = true;
            showCookieNotice();
          }
        }

        if (orbitNear && orbitSection) {
          const r = orbitSection.getBoundingClientRect();
          updateOrbit(clamp(-r.top / orbitMetrics.travel, 0, 1));
        }
        if (processNear && processSection) {
          const r = processSection.getBoundingClientRect();
          updateProcess(clamp(-r.top / Math.max(1, processSection.offsetHeight - window.innerHeight), 0, 1));
        }
      }

      function onScroll() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          updateScene();
          const scrolled = window.scrollY > 40;
          if (scrolled !== headerScrollState) {
            headerScrollState = scrolled;
            header.classList.toggle('is-scrolled', scrolled);
          }
          scheduled = false;
        });
      }

      let resizeTimer;
      function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { measureLayout(); updateScene(true); }, 120);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize, { passive: true });

      function getCookieChoice() {
        try { return localStorage.getItem(COOKIE_KEY); } catch (_) { return null; }
      }
      function setCookieChoice(value) {
        try { localStorage.setItem(COOKIE_KEY, value); } catch (_) {}
      }

      function showCookieNotice() {
        const notice = document.getElementById('cookieNotice');
        if (!notice) return;
        if (getCookieChoice()) return;
        notice.classList.add('is-visible');
      }

      function hideCookieNotice(choice) {
        setCookieChoice(choice);
        const notice = document.getElementById('cookieNotice');
        if (!notice) return;
        notice.classList.add('is-leaving');
        notice.classList.remove('is-visible');
        setTimeout(() => notice.classList.remove('is-leaving'), 700);
      }

      function initCookieNotice() {
        if (getCookieChoice()) return;
        const accept = document.getElementById('cookieAccept');
        const reject = document.getElementById('cookieReject');
        accept?.addEventListener('click', () => hideCookieNotice('accepted'));
        reject?.addEventListener('click', () => hideCookieNotice('rejected'));
      }

      function getNavigationType() {
        const entries = performance.getEntriesByType?.('navigation');
        if (entries && entries[0]) return entries[0].type;
        const nav = performance.navigation;
        if (!nav) return 'navigate';
        switch (nav.type) {
          case 1: return 'reload';
          case 2: return 'back_forward';
          default: return 'navigate';
        }
      }

      function saveScrollPosition() {
        if (hardReloadPending) return;
        try {
          localStorage.setItem(SCROLL_KEY, JSON.stringify({
            y: window.scrollY,
            timestamp: Date.now()
          }));
        } catch (_) {}
      }

      function clearScrollPosition() {
        try { localStorage.removeItem(SCROLL_KEY); } catch (_) {}
      }

      function jumpTo(y) {
        const html = document.documentElement;
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        html.style.scrollBehavior = prev;
      }

      function restoreScrollPosition() {
        try {
          if (new URLSearchParams(location.search).has('fresh')) {
            clearScrollPosition();
            jumpTo(0);
            return;
          }
        } catch (_) {}

        const navType = getNavigationType();

        if (navType === 'navigate') {
          jumpTo(0);
          return;
        }

        if (navType === 'back_forward') return;

        if (navType !== 'reload') return;

        let saved = null;
        try {
          saved = JSON.parse(localStorage.getItem(SCROLL_KEY) || 'null');
        } catch (_) {}

        if (!saved || typeof saved.y !== 'number' || !isFinite(saved.y) || saved.y < 0) {
          jumpTo(0);
          return;
        }

        if (Date.now() - saved.timestamp > SCROLL_TTL_MS) {
          clearScrollPosition();
          jumpTo(0);
          return;
        }

        jumpTo(saved.y);

        requestAnimationFrame(() => {
          measureLayout();
          updateScene(true);
        });

        setTimeout(() => {
          if (Math.abs(window.scrollY - saved.y) < 5) jumpTo(saved.y);
        }, 300);
      }

      window.addEventListener('pagehide', saveScrollPosition, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveScrollPosition();
      });

      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
          hardReloadPending = true;
          clearScrollPosition();
          setTimeout(() => { hardReloadPending = false; }, 2000);
        }
      });

      video.addEventListener('seeked', () => {
        if (!videoReady || !videoDuration || !scrubEnabled) return;
        const rect = scene.getBoundingClientRect();
        const progress = clamp(-rect.top / progressMax, 0, 1);
        const target = progress * videoDuration;
        if (Math.abs(target - video.currentTime) > 0.1) {
          lastSeek = -1;
          applyVideoTime(progress);
        }
      });

      video.addEventListener('progress', () => {
        if (!videoReady || !videoDuration || !scrubEnabled) return;
        if (video.seeking) return;
        const rect = scene.getBoundingClientRect();
        const progress = clamp(-rect.top / progressMax, 0, 1);
        applyVideoTime(progress);
      });

      video.addEventListener('canplay', () => {
        if (!videoReady || !videoDuration || !scrubEnabled) return;
        const rect = scene.getBoundingClientRect();
        const progress = clamp(-rect.top / progressMax, 0, 1);
        lastSeek = -1;
        applyVideoTime(progress);
      });

      function loadDesktopVideo() {
        return new Promise(resolve => {
          let settled = false;
          const finish = ok => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            video.removeEventListener('loadeddata', onReady);
            video.removeEventListener('error', onError);
            resolve(ok);
          };
          const onReady = () => {
            video.pause();
            try { video.currentTime = 0; } catch (_) {}
            finish(true);
          };
          const onError = () => finish(false);
          const timeout = setTimeout(() => finish(video.readyState >= 2), 20000);

          video.src = 'video/cena.mp4';
          video.addEventListener('loadeddata', onReady, { once: true });
          video.addEventListener('error', onError, { once: true });
          video.preload = 'auto';
          video.load();
          if (video.readyState >= 2) onReady();
        });
      }

      async function boot() {
        scene.style.height = isMobile ? '240svh' : '280svh';
        measureLayout();
        updateScene(true);

        restoreScrollPosition();

        if (isMobile) {
          video.removeAttribute('src');
          video.querySelectorAll('source').forEach(source => source.remove());
          video.preload = 'none';
          video.style.display = 'none';
          setLoader(100, 'Preparando as imagens');
          const firstImage = frames[0]?.querySelector('img');
          if (firstImage && !firstImage.complete) {
            await Promise.race([
              new Promise(resolve => { firstImage.addEventListener('load', resolve, { once: true }); firstImage.addEventListener('error', resolve, { once: true }); }),
              new Promise(resolve => setTimeout(resolve, 800))
            ]);
          }
          finishLoader();
          measureLayout();
          updateScene(true);
          return;
        }

        setLoader(6, 'Preparando o vídeo');
        const progressTimer = setInterval(() => {
          const current = Number.parseInt(loaderCount.textContent, 10) || 0;
          if (current < 88) setLoader(Math.min(88, current + Math.max(1, (88 - current) * .08)));
        }, 180);
        const ok = await loadDesktopVideo();
        clearInterval(progressTimer);
        if (!ok) {
          setLoader(100, 'Cena em modo estático');
          finishLoader();
          return;
        }
        videoReady = true;
        videoDuration = Number.isFinite(video.duration) ? video.duration : 0;
        scrubEnabled = !reduceMotion.matches;
        video.classList.add('is-ready');
        video.addEventListener('play', () => { try { video.pause(); } catch (_) {} });
        finishLoader();
        measureLayout();
        updateScene(true);
      }

      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.classList.contains('reveal')) el.classList.add('in');
          if (el.matches('[data-count]') && !el.dataset.countStarted) {
            el.dataset.countStarted = '1';
            const target = Number.parseInt(el.dataset.count, 10);
            const sup = el.querySelector('sup')?.outerHTML || '';
            if (reduceMotion.matches) { el.innerHTML = `${target}${sup}`; }
            else {
              const start = performance.now();
              const tick = now => {
                const t = Math.min(1, (now - start) / 1400);
                const eased = 1 - Math.pow(1 - t, 3);
                el.innerHTML = `${Math.round(target * eased)}${sup}`;
                if (t < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            }
          }
          if ((!el.classList.contains('reveal') || el.classList.contains('in')) && (!el.matches('[data-count]') || el.dataset.countStarted)) revealObserver.unobserve(el);
        });
      }, { threshold: [.15, .6], rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.reveal, [data-count]').forEach(el => revealObserver.observe(el));

      if ('IntersectionObserver' in window && orbitSection) {
        new IntersectionObserver(([entry]) => { orbitNear = entry.isIntersecting; if (orbitNear) { measureLayout(); updateScene(true); } }, { rootMargin: '200px 0px' }).observe(orbitSection);
      }
      if ('IntersectionObserver' in window && processSection) {
        new IntersectionObserver(([entry]) => { processNear = entry.isIntersecting; if (processNear) { measureLayout(); updateScene(true); } }, { rootMargin: '200px 0px' }).observe(processSection);
      }

      document.querySelectorAll('.scene__frame img').forEach(img => {
        img.addEventListener('error', () => img.remove(), { once: true });
      });

      document.querySelectorAll('.piece-img').forEach(img => {
        const setLoaded = () => img.closest('.piece-wrap')?.classList.add('has-img');
        img.addEventListener('load', setLoaded, { once: true });
        img.addEventListener('error', () => img.remove(), { once: true });
        if (img.complete && img.naturalWidth > 0) setLoaded();
      });

      document.querySelectorAll('.faq__q').forEach(button => {
        button.addEventListener('click', () => {
          const item = button.closest('.faq__item');
          const wasOpen = item.classList.contains('is-open');
          document.querySelectorAll('.faq__item.is-open').forEach(other => {
            other.classList.remove('is-open');
            other.querySelector('.faq__q')?.setAttribute('aria-expanded', 'false');
          });
          if (!wasOpen) {
            item.classList.add('is-open');
            button.setAttribute('aria-expanded', 'true');
          }
        });
      });

      document.getElementById('ctaForm')?.addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const input = form.querySelector('input[type="email"]');
        const message = document.getElementById('ctaMsg');
        const value = input.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          message.textContent = 'Digite um e-mail válido para continuar.';
          input.focus();
          return;
        }
        message.textContent = 'Demonstração: o formulário ainda não está conectado a uma lista real.';
      });

      const finalCta = document.querySelector('.final-cta');
      if (finalCta && !reduceMotion.matches) {
        let glowTimer;
        let glowObserverVisible = true;
        const moveGlow = () => {
          if (document.hidden || !glowObserverVisible) return;
          finalCta.style.setProperty('--glow-x', `${24 + Math.random() * 52}%`);
          finalCta.style.setProperty('--glow-y', `${24 + Math.random() * 52}%`);
          glowTimer = setTimeout(moveGlow, 5000 + Math.random() * 3000);
        };
        const glowObserver = new IntersectionObserver(([entry]) => {
          glowObserverVisible = entry.isIntersecting;
          clearTimeout(glowTimer);
          if (glowObserverVisible && !document.hidden) glowTimer = setTimeout(moveGlow, 500);
        }, { rootMargin: '100px' });
        glowObserver.observe(finalCta);
        document.addEventListener('visibilitychange', () => {
          clearTimeout(glowTimer);
          if (!document.hidden && glowObserverVisible) glowTimer = setTimeout(moveGlow, 500);
        });
      }

      reduceMotion.addEventListener?.('change', () => {
        scrubEnabled = videoReady && !reduceMotion.matches;
        if (!scrubEnabled) { try { video.pause(); } catch (_) {} }
        measureLayout();
        updateScene(true);
      });

      document.getElementById('year').textContent = String(new Date().getFullYear());

      initCookieNotice();

      boot().catch(error => {
        console.error('CINZA boot:', error);
        finishLoader();
      });
    })();
