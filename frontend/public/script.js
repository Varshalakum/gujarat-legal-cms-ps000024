/**
 * Official Portal of the Legal Department, Government of Gujarat
 * Production Vanilla JavaScript: Realistic Navigation, Login/Register Authentication, Modals & GIGW Controls
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. USER AUTHENTICATION & SESSION STATE (LOGIN / REGISTER / QUICK ROLES)
     ========================================================================== */
  const authModal = document.getElementById('auth-modal');
  const btnAuthHeader = document.getElementById('btn-open-auth-header');
  const btnAuthNav = document.getElementById('btn-open-auth-nav');
  const userLoggedChip = document.getElementById('user-logged-chip');
  const chipUserName = document.getElementById('chip-user-name');
  const chipUserRole = document.getElementById('chip-user-role');
  const btnLogout = document.getElementById('btn-logout');

  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabRegister = document.getElementById('auth-tab-register');
  const authLoginPanel = document.getElementById('auth-login-panel');
  const authRegisterPanel = document.getElementById('auth-register-panel');
  const authMsgBox = document.getElementById('auth-msg-box');

  const portalLoginForm = document.getElementById('portal-login-form');
  const portalRegisterForm = document.getElementById('portal-register-form');

  // Check saved session
  const updateAuthUI = (user) => {
    if (user && user.name) {
      if (userLoggedChip) userLoggedChip.classList.add('is-active');
      if (chipUserName) chipUserName.textContent = user.name;
      if (chipUserRole) chipUserRole.textContent = user.role || 'OFFICER';
      if (btnAuthHeader) btnAuthHeader.style.display = 'none';
      if (btnAuthNav) btnAuthNav.innerHTML = `<svg class="ui-icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${user.name} (${user.role})`;

      // Also update LCMS Console headers if present
      const lcmsName = document.getElementById('lcms-active-user-name');
      const lcmsRole = document.getElementById('lcms-active-user-role');
      if (lcmsName) lcmsName.textContent = user.name;
      if (lcmsRole) lcmsRole.textContent = user.role;
    } else {
      if (userLoggedChip) userLoggedChip.classList.remove('is-active');
      if (btnAuthHeader) btnAuthHeader.style.display = 'inline-flex';
      if (btnAuthNav) btnAuthNav.innerHTML = `<svg class="ui-icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Sign In / Register`;
    }
  };

  const getSavedUser = () => {
    try {
      const u = localStorage.getItem('portal_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  };

  const saveUserSession = (user) => {
    localStorage.setItem('portal_user', JSON.stringify(user));
    updateAuthUI(user);
  };

  const clearUserSession = () => {
    localStorage.removeItem('portal_user');
    updateAuthUI(null);
  };

  // Initialize with saved session or default guest
  const initialUser = getSavedUser() || { name: 'Adv. Meera Shah', role: 'ADVOCATE', username: 'adv_meera' };
  saveUserSession(initialUser);

  window.openAuthModal = (initialTab = 'login') => {
    if (!authModal) return;
    if (authMsgBox) authMsgBox.style.display = 'none';
    if (initialTab === 'register') {
      authTabRegister.click();
    } else {
      authTabLogin.click();
    }
    authModal.classList.add('is-active');
    authModal.setAttribute('aria-hidden', 'false');
  };

  if (btnAuthHeader) btnAuthHeader.addEventListener('click', () => openAuthModal('login'));
  if (btnAuthNav) btnAuthNav.addEventListener('click', () => openAuthModal('login'));
  if (btnLogout) btnLogout.addEventListener('click', () => {
    clearUserSession();
    alert('You have successfully signed out of the Legal Department portal.');
  });

  // Switch between Sign In and Register Tabs
  if (authTabLogin && authTabRegister) {
    authTabLogin.addEventListener('click', () => {
      authTabLogin.classList.add('active');
      authTabLogin.setAttribute('aria-selected', 'true');
      authTabRegister.classList.remove('active');
      authTabRegister.setAttribute('aria-selected', 'false');
      if (authLoginPanel) authLoginPanel.style.display = 'block';
      if (authRegisterPanel) authRegisterPanel.style.display = 'none';
    });

    authTabRegister.addEventListener('click', () => {
      authTabRegister.classList.add('active');
      authTabRegister.setAttribute('aria-selected', 'true');
      authTabLogin.classList.remove('active');
      authTabLogin.setAttribute('aria-selected', 'false');
      if (authRegisterPanel) authRegisterPanel.style.display = 'block';
      if (authLoginPanel) authLoginPanel.style.display = 'none';
    });
  }

  // 1-Click Role Simulation Login Buttons
  document.querySelectorAll('.role-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = {
        username: btn.getAttribute('data-user'),
        name: btn.getAttribute('data-name'),
        role: btn.getAttribute('data-role')
      };
      saveUserSession(u);
      closeAllModals();
      alert(`[Authentication Success]\nSigned in as: ${u.name}\nRole: ${u.role}\nAccess Granted to Legal Case Management System.`);
    });
  });

  // Regular Login Form Submit
  if (portalLoginForm) {
    portalLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const role = document.getElementById('login-role').value;
      const user = {
        username: username,
        name: username.charAt(0).toUpperCase() + username.slice(1).replace('_', ' '),
        role: role
      };
      saveUserSession(user);
      closeAllModals();
      alert(`[Authentication Success]\nWelcome, ${user.name}!\nLogged in with role: ${user.role}`);
    });
  }

  // Register Form Submit
  if (portalRegisterForm) {
    portalRegisterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const barNo = document.getElementById('reg-bar-no').value.trim();
      const role = document.getElementById('reg-role-type').value;
      const regId = `GUJ/ENR/2026/${Math.floor(1000 + Math.random() * 9000)}`;

      const user = {
        username: barNo,
        name: name,
        role: role,
        regId: regId
      };
      saveUserSession(user);
      closeAllModals();
      alert(`[Advocate Enrollment Successful]\nWelcome to the Gujarat Legal Portal, ${name}!\nBar Registration Verified: ${barNo}\nPortal Enrollment Ref: ${regId}\nYou are now logged in as ${role}.`);
    });
  }


  /* ==========================================================================
     2. NAVIGATION & SMOOTH SCROLLING (ZERO BROKEN LINKS)
     ========================================================================== */
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const navMenuList = document.getElementById('nav-menu-list');

  const closeMobileNav = () => {
    if (navMenuList && navMenuList.classList.contains('is-open')) {
      navMenuList.classList.remove('is-open');
      if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
    }
    document.querySelectorAll('.dropdown-menu.mobile-open').forEach(m => m.classList.remove('mobile-open'));
  };

  if (menuToggleBtn && navMenuList) {
    menuToggleBtn.addEventListener('click', () => {
      const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
      menuToggleBtn.setAttribute('aria-expanded', (!isExpanded).toString());
      navMenuList.classList.toggle('is-open');
    });
  }

  // Smooth scroll handler for all internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').substring(1);
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        e.preventDefault();
        closeMobileNav();
        targetElem.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Mobile Click-based Dropdowns (< 860px)
  document.querySelectorAll('.has-dropdown > .dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        const parent = trigger.parentElement;
        const menu = parent.querySelector('.dropdown-menu');
        const isOpen = menu && menu.classList.contains('mobile-open');

        document.querySelectorAll('.dropdown-menu.mobile-open').forEach(m => m.classList.remove('mobile-open'));
        document.querySelectorAll('.dropdown-trigger[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));

        if (!isOpen && menu) {
          menu.classList.add('mobile-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });

  // Acts & Rules Filter dropdown buttons
  document.querySelectorAll('.nav-filter-act').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || '';
      closeMobileNav();
      const actsSec = document.getElementById('acts-heading');
      if (actsSec) actsSec.scrollIntoView({ behavior: 'smooth' });
      const searchBox = document.getElementById('act-table-search');
      if (searchBox) {
        searchBox.value = filter;
        searchBox.dispatchEvent(new Event('input'));
      }
    });
  });

  // Open Document from Nav
  document.querySelectorAll('.nav-open-doc').forEach(btn => {
    btn.addEventListener('click', () => {
      const doc = btn.getAttribute('data-doc') || 'act-1';
      closeMobileNav();
      openDocumentViewer(doc);
    });
  });

  // Switch Notifications Tabs from Nav
  document.querySelectorAll('.nav-switch-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      closeMobileNav();
      const deskSec = document.getElementById('desk-updates-heading');
      if (deskSec) deskSec.scrollIntoView({ behavior: 'smooth' });
      const targetTab = document.getElementById(tabId);
      if (targetTab) targetTab.click();
    });
  });

  // Services Nav Buttons
  const navBtnNotary = document.getElementById('nav-btn-notary');
  if (navBtnNotary) navBtnNotary.addEventListener('click', () => {
    closeMobileNav();
    openNotaryModal();
  });

  const navBtnAid = document.getElementById('nav-btn-aid');
  if (navBtnAid) navBtnAid.addEventListener('click', () => {
    closeMobileNav();
    openLegalAidModal();
  });


  /* ==========================================================================
     3. MULTILINGUAL DICTIONARY & LANGUAGE SWITCHER
     ========================================================================== */
  const langData = {
    en: {
      govLine: 'ગુજરાત સરકાર | Government of Gujarat',
      deptTitle: 'Legal Department',
      subDept: 'કાયદા વિભાગ | Sachivalaya, Gandhinagar',
      searchPlaceholder: 'Search Acts, Rules, Orders...',
      btnAuth: 'Login / Register'
    },
    gu: {
      govLine: 'ગુજરાત સરકાર',
      deptTitle: 'કાયદા વિભાગ',
      subDept: 'સચિવાલય, ગાંધીનગર',
      searchPlaceholder: 'કાયદા, પરિપત્રો, નિયમો શોધો...',
      btnAuth: 'પ્રવેશ / નોંધણી'
    },
    hi: {
      govLine: 'गुजरात सरकार | Government of Gujarat',
      deptTitle: 'विधि विभाग (Legal Department)',
      subDept: 'सचिवालय, गांधीनगर',
      searchPlaceholder: 'अधिनियम, परिपत्र, नियम खोजें...',
      btnAuth: 'लॉगिन / पंजीकरण'
    }
  };

  const setLanguage = (lang) => {
    const d = langData[lang] || langData.en;
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    const govLine = document.querySelector('.gov-line');
    if (govLine) govLine.textContent = d.govLine;

    const deptTitle = document.querySelector('.dept-title');
    if (deptTitle) deptTitle.textContent = d.deptTitle;

    const subDept = document.querySelector('.sub-dept');
    if (subDept) subDept.textContent = d.subDept;

    const searchInput = document.getElementById('header-search-input');
    if (searchInput) searchInput.placeholder = d.searchPlaceholder;

    localStorage.setItem('portal_lang', lang);
  };

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
  });

  const savedLang = localStorage.getItem('portal_lang');
  if (savedLang) setLanguage(savedLang);


  /* ==========================================================================
     4. ACCESSIBILITY CONTROLS: FONT RESIZER & CONTRAST
     ========================================================================== */
  const btnDecrease = document.getElementById('btn-decrease-font');
  const btnReset = document.getElementById('btn-reset-font');
  const btnIncrease = document.getElementById('btn-increase-font');
  let currentFontPercent = 100;

  const setFontSize = (percent) => {
    currentFontPercent = Math.min(Math.max(percent, 85), 125);
    document.documentElement.style.fontSize = `${(16 * currentFontPercent) / 100}px`;
    localStorage.setItem('portal_font_size', currentFontPercent.toString());
  };

  const savedFont = localStorage.getItem('portal_font_size');
  if (savedFont) setFontSize(parseInt(savedFont, 10));

  if (btnDecrease) btnDecrease.addEventListener('click', () => setFontSize(currentFontPercent - 5));
  if (btnReset) btnReset.addEventListener('click', () => setFontSize(100));
  if (btnIncrease) btnIncrease.addEventListener('click', () => setFontSize(currentFontPercent + 5));

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeLabel = document.getElementById('theme-label');

  const toggleContrast = () => {
    const isDark = document.body.classList.toggle('dark-contrast');
    localStorage.setItem('portal_dark_mode', isDark ? 'true' : 'false');
    if (themeLabel) themeLabel.textContent = isDark ? 'Standard Contrast' : 'High Contrast';
  };

  if (localStorage.getItem('portal_dark_mode') === 'true') {
    document.body.classList.add('dark-contrast');
    if (themeLabel) themeLabel.textContent = 'Standard Contrast';
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleContrast);


  /* ==========================================================================
     5. HERO SLIDER
     ========================================================================== */
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.slider-indicators .indicator');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const pauseBtn = document.getElementById('slider-pause');

  let currentSlide = 0;
  let isPaused = false;
  let slideInterval = null;

  const showSlide = (index) => {
    if (!slides.length) return;
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    indicators.forEach((ind, i) => {
      const active = i === index;
      ind.classList.toggle('active', active);
      ind.setAttribute('aria-selected', active.toString());
    });
    currentSlide = index;
  };

  const nextSlide = () => showSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => showSlide((currentSlide - 1 + slides.length) % slides.length);

  const startAutoSlide = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isPaused) return;
    stopAutoSlide();
    slideInterval = setInterval(nextSlide, 6000);
  };

  const stopAutoSlide = () => {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = null;
  };

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoSlide(); });

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.innerHTML = isPaused 
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>' 
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      pauseBtn.setAttribute('aria-label', isPaused ? 'Resume slider' : 'Pause slider');
      if (isPaused) stopAutoSlide(); else startAutoSlide();
    });
  }

  indicators.forEach(ind => {
    ind.addEventListener('click', () => {
      showSlide(parseInt(ind.getAttribute('data-slide'), 10));
      startAutoSlide();
    });
  });

  const heroSlider = document.getElementById('hero-slider');
  if (heroSlider) {
    heroSlider.addEventListener('mouseenter', stopAutoSlide);
    heroSlider.addEventListener('mouseleave', () => { if (!isPaused) startAutoSlide(); });
  }

  startAutoSlide();


  /* ==========================================================================
     6. NOTICE TICKER
     ========================================================================== */
  const tickerToggleBtn = document.getElementById('ticker-toggle-btn');
  const tickerItem = document.getElementById('ticker-item');

  const tickerItems = [
    { text: "Circular No. LGD/2026/44/B: Guidelines for submission of advocate fee bills on LCMS portal.", id: "doc-1" },
    { text: "Schedule for State-wide Mega Lok Adalat announced for 14th November 2026 across 33 Districts.", id: "doc-2" },
    { text: "Notification: Revision of pecuniary limits for Senior Civil Courts in Gujarat State.", id: "doc-3" },
    { text: "District Legal Services Authorities to organize Legal Literacy camps on Samvidhan Divas.", id: "doc-4" }
  ];

  let tickerIdx = 0;
  let tickerInterval = null;
  let isTickerPaused = false;

  const rotateTicker = () => {
    if (isTickerPaused || !tickerItem) return;
    tickerIdx = (tickerIdx + 1) % tickerItems.length;
    tickerItem.textContent = `[Sample] ${tickerItems[tickerIdx].text}`;
    tickerItem.setAttribute('data-doc-id', tickerItems[tickerIdx].id);
  };

  tickerInterval = setInterval(rotateTicker, 5000);

  if (tickerToggleBtn) {
    tickerToggleBtn.addEventListener('click', () => {
      isTickerPaused = !isTickerPaused;
      tickerToggleBtn.innerHTML = isTickerPaused 
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>' 
        : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      tickerToggleBtn.setAttribute('aria-label', isTickerPaused ? 'Resume ticker' : 'Pause ticker');
      if (isTickerPaused) clearInterval(tickerInterval); else tickerInterval = setInterval(rotateTicker, 5000);
    });
  }

  if (tickerItem) {
    tickerItem.addEventListener('click', () => {
      const docId = tickerItem.getAttribute('data-doc-id') || 'doc-1';
      openDocumentViewer(docId);
    });
  }


  /* ==========================================================================
     7. TABBED BULLETIN PANEL
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.tabs-header .tab-btn');
  const tabPanels = document.querySelectorAll('.tabbed-panel-wrapper .tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      tabButtons.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active.toString());
      });
      tabPanels.forEach(p => {
        if (p.id === targetId) {
          p.classList.add('active');
          p.removeAttribute('hidden');
        } else {
          p.classList.remove('active');
          p.setAttribute('hidden', 'true');
        }
      });
    });

    btn.addEventListener('keydown', (e) => {
      const arr = Array.from(tabButtons);
      const idx = arr.indexOf(btn);
      let n = null;
      if (e.key === 'ArrowRight') n = (idx + 1) % arr.length;
      else if (e.key === 'ArrowLeft') n = (idx - 1 + arr.length) % arr.length;
      if (n !== null) { arr[n].focus(); arr[n].click(); }
    });
  });


  /* ==========================================================================
     8. LIVE SEARCH ACROSS PORTAL CONTENT
     ========================================================================== */
  const searchInput = document.getElementById('header-search-input');
  const searchResultsOverlay = document.getElementById('search-results-overlay');
  const searchForm = document.getElementById('site-search-form');

  const searchableIndex = [
    { title: "Gujarat Civil Courts Act, 2005", type: "State Act", id: "act-1", linkText: "View Full Statutory Act" },
    { title: "Gujarat State Legal Services Authority Regulations", type: "Regulation", id: "act-2", linkText: "View Legal Aid Rules" },
    { title: "The Gujarat Court Fees Act, 2004", type: "State Act", id: "act-3", linkText: "View Court Fee Schedule" },
    { title: "Gujarat Advocate Welfare Fund Rules", type: "Rules", id: "act-4", linkText: "View Welfare Stamp Rules" },
    { title: "Gujarat Law Officers (Conditions of Service) Rules", type: "Rules", id: "act-5", linkText: "View Fee Scale & Appearance Terms" },
    { title: "Legal Case Management System (LCMS) Console", type: "Portal Service", id: "srv-lcms", action: "openLcms" },
    { title: "Apply for Free Legal Aid (GSLSA)", type: "Citizen Service", id: "srv-aid", action: "openAid" },
    { title: "Notary Public Search Directory", type: "Registry", id: "srv-notary", action: "openNotary" },
    { title: "Circular: Digital Advocate Attendance Registry", type: "Circular", id: "doc-1", linkText: "Read Gazette Circular" },
    { title: "Schedule for National Lok Adalat 2026", type: "Notice", id: "doc-2", linkText: "Read Schedule" },
    { title: "Tender: Procurement of Desktop Computers for Courts", type: "e-Tender", id: "tend-1", linkText: "View RFP Document" },
    { title: "Key Officials Directory & Contact Numbers", type: "Roster", id: "officials", action: "scrollOfficials" },
    { title: "Citizen's Charter & Guaranteed Service SLAs", type: "Charter", id: "charter", action: "scrollCharter" }
  ];

  if (searchInput && searchResultsOverlay) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length < 2) {
        searchResultsOverlay.classList.remove('is-visible');
        searchResultsOverlay.innerHTML = '';
        return;
      }

      const matches = searchableIndex.filter(item => 
        item.title.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        searchResultsOverlay.innerHTML = '<div style="padding: 0.75rem; color: #64748b; font-size: 0.85rem;">No matching acts, rules or circulars found.</div>';
        searchResultsOverlay.classList.add('is-visible');
        return;
      }

      searchResultsOverlay.innerHTML = matches.map(m => `
        <div class="search-result-item" data-id="${m.id}" data-action="${m.action || 'viewDoc'}">
          <span class="search-result-type">${m.type}</span>
          <span class="search-result-title">${m.title}</span>
        </div>
      `).join('');
      searchResultsOverlay.classList.add('is-visible');
    });

    searchResultsOverlay.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (!item) return;
      const act = item.getAttribute('data-action');
      const id = item.getAttribute('data-id');
      searchResultsOverlay.classList.remove('is-visible');
      searchInput.value = '';

      if (act === 'openLcms') openLcmsModal();
      else if (act === 'openAid') openLegalAidModal();
      else if (act === 'openNotary') openNotaryModal();
      else if (act === 'scrollOfficials') document.getElementById('key-officials')?.scrollIntoView({ behavior: 'smooth' });
      else if (act === 'scrollCharter') document.getElementById('citizen-charter')?.scrollIntoView({ behavior: 'smooth' });
      else openDocumentViewer(id);
    });

    document.addEventListener('click', (e) => {
      if (searchForm && !searchForm.contains(e.target)) {
        searchResultsOverlay.classList.remove('is-visible');
      }
    });
  }


  /* ==========================================================================
     9. OFFICIAL GAZETTE & DOCUMENT VIEWER MODAL
     ========================================================================== */
  const docModal = document.getElementById('document-modal');
  const docModalTitle = document.getElementById('doc-modal-title');
  const docModalContent = document.getElementById('doc-modal-content');
  const docPrintBtn = document.getElementById('btn-print-doc');

  const documentDatabase = {
    "act-1": {
      title: "Gujarat Civil Courts Act, 2005 (Act No. 21 of 2005)",
      gazetteNo: "Vol. XLVI | Extraordinary Gazette Part IV | Gandhinagar, March 24, 2005",
      preamble: "An Act to consolidate and amend the law relating to Civil Courts in the State of Gujarat and to provide for judicial administration in districts and subordinate talukas.",
      sections: [
        { num: "Section 3", title: "Classes of Civil Courts", text: "There shall be established three classes of Subordinate Civil Courts in the State of Gujarat: (a) The Court of the Principal District Judge; (b) The Court of the Senior Civil Judge; and (c) The Court of the Civil Judge." },
        { num: "Section 12", title: "Pecuniary Jurisdiction", text: "The jurisdiction of the Court of a Senior Civil Judge extends to all original suits and proceedings of a civil nature without pecuniary restriction." },
        { num: "Section 15", title: "Appeals from District Courts", text: "Appeals from decrees and orders of a Principal District Judge shall lie directly to the High Court of Gujarat in accordance with the Code of Civil Procedure." }
      ],
      authority: "By order of the Governor of Gujarat,\nSecretary to Government of Gujarat,\nLegal Department."
    },
    "act-2": {
      title: "Gujarat State Legal Services Authority Regulations, 1998",
      gazetteNo: "Notification No. GSLSA/1998/4 | Gandhinagar, November 14, 1998",
      preamble: "In exercise of the powers conferred by Section 29A of the Legal Services Authorities Act, 1987 (39 of 1987), the Gujarat State Legal Services Authority hereby frames the following regulations for regulating the functioning of legal aid panels and Lok Adalat benches.",
      sections: [
        { num: "Regulation 5", title: "Eligibility for Free Legal Aid", text: "Free legal services shall be provided to any citizen resident in Gujarat whose annual income from all sources does not exceed ₹3,00,000 (Rupees Three Lakhs only), as amended." },
        { num: "Regulation 11", title: "Honorarium to Panel Advocates", text: "Advocates engaged on behalf of assisted persons shall be reimbursed according to the schedule of fees approved by the Executive Chairman of GSLSA." }
      ],
      authority: "Member Secretary,\nGujarat State Legal Services Authority."
    },
    "act-3": {
      title: "The Gujarat Court Fees Act, 2004 (Act No. 4 of 2004)",
      gazetteNo: "Extraordinary Gazette Part IV | Gandhinagar, February 17, 2004",
      preamble: "An Act to consolidate and amend the law relating to court fees and valuation of suits in courts and public offices in Gujarat.",
      sections: [
        { num: "Section 4", title: "Fees on Documents Filed in Courts", text: "No document specified in the First or Second Schedule to this Act shall be filed, exhibited or recorded in any court of justice unless the statutory court fee stamp is affixed." },
        { num: "Section 18", title: "Refund of Fee Paid on Memorandum of Appeal", text: "Where a suit or appeal is disposed of by mutual compromise before recording of evidence, the court shall issue a certificate granting 75% refund of court fee stamps." }
      ],
      authority: "Legal Department, Government of Gujarat."
    },
    "act-4": {
      title: "Gujarat Advocate Welfare Fund Rules, 1991",
      gazetteNo: "Rule No. LAW-1991-A-41 | Gandhinagar, August 09, 1991",
      preamble: "Rules framed under Section 35 of the Advocates Welfare Fund Act, 1991 for the administration and grant of financial assistance to legal practitioners.",
      sections: [
        { num: "Rule 8", title: "Affixation of Welfare Stamp on Vakalatnama", text: "Every advocate filing a Vakalatnama in the High Court, District Court, or Tribunals shall affix an Advocate Welfare Fund Stamp of value ₹25/-." },
        { num: "Rule 14", title: "Retirement & Death Benefits", text: "A member who has completed 25 years of standing at the Bar shall be entitled to an ex-gratia superannuation grant from the statutory trustee committee." }
      ],
      authority: "Trustee Committee, Bar Council of Gujarat."
    },
    "act-5": {
      title: "Gujarat Law Officers (Conditions of Service) Rules (Amended 2026)",
      gazetteNo: "Government Resolution No. LGD/GLO/2026/02 | Sachivalaya, January 15, 2026",
      preamble: "Government rules regulating duties, appearance fees, clerkage, and digital bill verification for Government Pleaders, Public Prosecutors, and Panel Advocates in Gujarat.",
      sections: [
        { num: "Rule 4", title: "Mandatory Attendance Tracking", text: "Fee claims for appearance in judicial hearings shall be submitted exclusively via the Legal Case Management System (LCMS) with linked court cause list verification." },
        { num: "Rule 9", title: "Clerkage Allowance", text: "In addition to appearance fees, clerkage shall be payable at the rate of 10% of approved professional fees, subject to a maximum ceiling of ₹1,500 per voucher." }
      ],
      authority: "Principal Secretary & R.L.A., Legal Department, GoG."
    },
    "doc-1": {
      title: "Circular No. LGD/2026/44/B: Digital Attendance Registry on LCMS",
      gazetteNo: "Circular Dispatch | Sachivalaya, Gandhinagar | 12-Oct-2026",
      preamble: "Directives to all District Government Pleaders and Legal Officers regarding daily attendance tracking of State Advocates.",
      sections: [
        { num: "Para 1", title: "Digitization Mandate", text: "All 33 District Registries must ensure that appearance/non-appearance of State Advocates is recorded on the LCMS portal within 24 hours of court rising." }
      ],
      authority: "Deputy Secretary (Litigation), Legal Department."
    },
    "doc-2": {
      title: "Order No. GSLSA/LOK/2026/09: Mega Lok Adalat Schedule",
      gazetteNo: "Executive Order | GSLSA High Court Complex | 08-Oct-2026",
      preamble: "Organization of National Lok Adalat on 14th November 2026 for pre-litigation and pending case amicable settlements.",
      sections: [
        { num: "Para 1", title: "Targeted Categories", text: "Special emphasis shall be placed on Section 138 NI Act cheques, motor accident claims (MACP), civic tax disputes, and compoundable criminal proceedings." }
      ],
      authority: "Executive Chairman, GSLSA."
    },
    "tend-1": {
      title: "Tender Notice: Procurement of 450 Computer Systems for Fast Track Courts",
      gazetteNo: "e-Tender ID: 2026_LGD_FTC_8401 | Last Date: 28-Oct-2026",
      preamble: "Notice inviting online bids through n-Procure portal for supply and installation of high-performance desktop workstations.",
      sections: [
        { num: "Section 1", title: "Eligibility", text: "Bidders must be authorized OEM partners with minimum 3 years of experience in supplying IT hardware to Gujarat Government departments." }
      ],
      authority: "Director of Accounts & Procurement, Legal Dept."
    }
  };

  window.openDocumentViewer = (id) => {
    const data = documentDatabase[id] || documentDatabase["act-1"];
    if (!docModal || !docModalTitle || !docModalContent) return;

    docModalTitle.textContent = data.title;
    docModalContent.innerHTML = `
      <div class="gazette-header">
        <h3 class="gazette-title">Government of Gujarat Gazette</h3>
        <p class="gazette-sub">Published by Authority | Legal Department</p>
        <p style="font-size: 0.8rem; color: #475569; margin-top: 4px;">${data.gazetteNo}</p>
      </div>
      <div class="gazette-body">
        <p style="font-style: italic; margin-bottom: 1rem; border-left: 3px solid var(--color-accent-saffron); padding-left: 10px;">
          ${data.preamble}
        </p>
        ${data.sections.map(s => `
          <div style="margin-bottom: 1.25rem;">
            <h4 class="gazette-section-title">${s.num}: ${s.title}</h4>
            <p style="margin-bottom: 0;">${s.text}</p>
          </div>
        `).join('')}
        <div style="margin-top: 2rem; border-top: 1px dashed #94a3b8; padding-top: 1rem; text-align: right; white-space: pre-line; font-weight: 600; color: #334155;">
          ${data.authority}
        </div>
      </div>
    `;

    docModal.classList.add('is-active');
    docModal.setAttribute('aria-hidden', 'false');
  };

  if (docPrintBtn) {
    docPrintBtn.addEventListener('click', () => window.print());
  }

  document.querySelectorAll('.btn-pdf-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const actId = btn.getAttribute('data-act-id') || 'act-1';
      openDocumentViewer(actId);
    });
  });

  document.querySelectorAll('.bulletin-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const docId = btn.getAttribute('data-doc-id') || 'doc-1';
      openDocumentViewer(docId);
    });
  });


  /* ==========================================================================
     10. MODAL CONTROLS & CLOSE HANDLERS
     ========================================================================== */
  const closeAllModals = () => {
    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.classList.remove('is-active');
      m.setAttribute('aria-hidden', 'true');
    });
  };

  document.querySelectorAll('.modal-close-btn, .btn-modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeAllModals();
    });
  });


  /* ==========================================================================
     11. DATA TABLE FILTERING (Acts & Rules)
     ========================================================================== */
  const actFilterSelect = document.getElementById('act-branch-filter');
  const actSearchInput = document.getElementById('act-table-search');
  const actTableRows = document.querySelectorAll('.acts-rules-sec .data-table tbody tr');

  const filterActsTable = () => {
    const branch = (actFilterSelect ? actFilterSelect.value : '').toLowerCase();
    const query = (actSearchInput ? actSearchInput.value : '').toLowerCase().trim();

    actTableRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const rowBranch = (row.getAttribute('data-branch') || '').toLowerCase();
      const rowType = (row.getAttribute('data-type') || '').toLowerCase();

      const branchMatch = !branch || rowBranch.includes(branch);
      const queryMatch = !query || text.includes(query) || rowType.includes(query);

      row.style.display = (branchMatch && queryMatch) ? '' : 'none';
    });
  };

  if (actFilterSelect) actFilterSelect.addEventListener('change', filterActsTable);
  if (actSearchInput) actSearchInput.addEventListener('input', filterActsTable);


  /* ==========================================================================
     12. LEGAL AID APPLICATION MODAL
     ========================================================================== */
  const legalAidModal = document.getElementById('legal-aid-modal');
  const legalAidForm = document.getElementById('legal-aid-form');
  const legalAidSuccess = document.getElementById('legal-aid-success');

  window.openLegalAidModal = () => {
    if (!legalAidModal) return;
    if (legalAidSuccess) legalAidSuccess.style.display = 'none';
    if (legalAidForm) {
      legalAidForm.style.display = 'block';
      legalAidForm.reset();
    }
    legalAidModal.classList.add('is-active');
    legalAidModal.setAttribute('aria-hidden', 'false');
  };

  if (legalAidForm) {
    legalAidForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('aid-name').value;
      const district = document.getElementById('aid-district').value;
      const refToken = `GSLSA/GUJ/2026/${Math.floor(1000 + Math.random() * 9000)}`;

      if (legalAidSuccess) {
        legalAidSuccess.innerHTML = `
          <div class="alert-success">
            <h4 style="margin-bottom: 0.25rem;">Application Submitted Successfully!</h4>
            <p style="margin-bottom: 0.5rem;">Thank you, <strong>${name}</strong>. Your legal aid petition has been routed to the <strong>District Legal Services Authority, ${district}</strong>.</p>
            <p style="font-size: 0.9rem; margin-bottom: 0;">Application Tracking Reference: <strong>${refToken}</strong></p>
          </div>
        `;
        legalAidSuccess.style.display = 'block';
        legalAidForm.style.display = 'none';
      }
    });
  }

  const btnOpenAid = document.getElementById('btn-open-legal-aid');
  if (btnOpenAid) btnOpenAid.addEventListener('click', openLegalAidModal);


  /* ==========================================================================
     13. NOTARY DIRECTORY SEARCH MODAL
     ========================================================================== */
  const notaryModal = document.getElementById('notary-modal');
  const notarySearchInput = document.getElementById('notary-search');
  const notaryDistrictSelect = document.getElementById('notary-district');
  const notaryTableBody = document.getElementById('notary-table-body');

  const notaryData = [
    { name: "Shri Harshad K. Patel", certNo: "NOT/GUJ/AHM/2012/104", district: "Ahmedabad", phone: "+91 98250 14820", expiry: "14-Dec-2027" },
    { name: "Smt. Bhavna N. Trivedi", certNo: "NOT/GUJ/GND/2015/089", district: "Gandhinagar", phone: "+91 98791 22340", expiry: "28-Feb-2028" },
    { name: "Shri Rajesh M. Vaghani", certNo: "NOT/GUJ/SRT/2010/241", district: "Surat", phone: "+91 94260 55180", expiry: "19-May-2026" },
    { name: "Shri Dhaval R. Bhatt", certNo: "NOT/GUJ/VAD/2017/118", district: "Vadodara", phone: "+91 98980 34120", expiry: "11-Nov-2028" },
    { name: "Smt. Meena S. Jadeja", certNo: "NOT/GUJ/RJK/2014/195", district: "Rajkot", phone: "+91 98242 88410", expiry: "05-Aug-2027" },
    { name: "Shri Arvind K. Solanki", certNo: "NOT/GUJ/BK/2019/042", district: "Banaskantha", phone: "+91 94281 66720", expiry: "30-Sep-2029" }
  ];

  const renderNotaryTable = () => {
    if (!notaryTableBody) return;
    const q = (notarySearchInput ? notarySearchInput.value : '').toLowerCase().trim();
    const dist = (notaryDistrictSelect ? notaryDistrictSelect.value : '').toLowerCase();

    const filtered = notaryData.filter(n => {
      const matchesQ = !q || n.name.toLowerCase().includes(q) || n.certNo.toLowerCase().includes(q);
      const matchesDist = !dist || n.district.toLowerCase() === dist;
      return matchesQ && matchesDist;
    });

    if (filtered.length === 0) {
      notaryTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">No registered Notary found matching query.</td></tr>';
      return;
    }

    notaryTableBody.innerHTML = filtered.map(n => `
      <tr>
        <td><strong>${n.name}</strong></td>
        <td><code>${n.certNo}</code></td>
        <td>${n.district}</td>
        <td>${n.phone}</td>
        <td><time>${n.expiry}</time></td>
      </tr>
    `).join('');
  };

  window.openNotaryModal = () => {
    if (!notaryModal) return;
    renderNotaryTable();
    notaryModal.classList.add('is-active');
    notaryModal.setAttribute('aria-hidden', 'false');
  };

  if (notarySearchInput) notarySearchInput.addEventListener('input', renderNotaryTable);
  if (notaryDistrictSelect) notaryDistrictSelect.addEventListener('change', renderNotaryTable);

  const btnOpenNotary = document.getElementById('btn-open-notary');
  if (btnOpenNotary) btnOpenNotary.addEventListener('click', openNotaryModal);


  /* ==========================================================================
     14. LEGAL CASE MANAGEMENT (LCMS) QUICK CONSOLE MODAL
     ========================================================================== */
  const lcmsModal = document.getElementById('lcms-modal');

  window.openLcmsModal = (targetTab = 'lcms-panel-cases') => {
    if (!lcmsModal) return;
    lcmsModal.classList.add('is-active');
    lcmsModal.setAttribute('aria-hidden', 'false');

    // Switch to specified tab
    const tabBtn = document.querySelector(`.lcms-tab-btn[data-target="${targetTab}"]`);
    if (tabBtn) tabBtn.click();
  };

  document.querySelectorAll('.btn-trigger-lcms').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileNav();
      const tab = btn.getAttribute('data-tab') || 'lcms-panel-cases';
      openLcmsModal(tab);
    });
  });

  const lcmsTabs = document.querySelectorAll('.lcms-tab-btn');
  const lcmsPanels = document.querySelectorAll('.lcms-panel');

  lcmsTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      lcmsTabs.forEach(b => b.classList.toggle('active', b === btn));
      lcmsPanels.forEach(p => {
        const isMatch = p.id === target;
        p.classList.toggle('active', isMatch);
        p.style.display = isMatch ? 'block' : 'none';
      });
    });
  });

  // LCMS Fee Voucher Form dynamic calculation & duplicate check
  const feeForm = document.getElementById('lcms-fee-form');
  const baseFeeInput = document.getElementById('claim-base-fee');
  const clerkageOutput = document.getElementById('claim-clerkage');
  const totalAmountOutput = document.getElementById('claim-total-amount');
  const dupAlert = document.getElementById('lcms-duplicate-alert');

  if (baseFeeInput && clerkageOutput && totalAmountOutput) {
    baseFeeInput.addEventListener('input', () => {
      const base = parseFloat(baseFeeInput.value) || 0;
      const clerkage = Math.min(base * 0.10, 1500); // 10% capped at 1500
      const total = base + clerkage;

      clerkageOutput.textContent = `₹${clerkage.toFixed(2)}`;
      totalAmountOutput.textContent = `₹${total.toFixed(2)}`;

      const invRef = (document.getElementById('claim-inv-ref')?.value || '').trim();
      if (dupAlert) {
        dupAlert.style.display = (invRef.toUpperCase() === 'ADV-INV-1042') ? 'block' : 'none';
      }
    });
  }

  if (feeForm) {
    feeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const caseNo = document.getElementById('claim-case-no').value;
      const total = totalAmountOutput.textContent;
      alert(`[LCMS Verification Engine]\nFee Voucher for ${caseNo} amounting to ${total} successfully submitted!\nInternal Voucher ID: BILL-DEMO-${Math.floor(1000 + Math.random() * 9000)}\nStatus: PENDING_VERIFICATION (Forwarded to Scrutiny Desk).`);
      feeForm.reset();
    });
  }


  /* ==========================================================================
     15. CITIZEN GRIEVANCE / CONTACT FORM
     ========================================================================== */
  const contactForm = document.getElementById('portal-contact-form');
  const contactAlert = document.getElementById('contact-form-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const citizenName = document.getElementById('contact-name').value;
      const trackingId = `GUJ/LEGAL/GRV/2026/${Math.floor(1000 + Math.random() * 9000)}`;

      if (contactAlert) {
        contactAlert.innerHTML = `
          <div class="alert-success">
            <h4 style="margin-bottom: 0.25rem;">Grievance Registered Successfully</h4>
            <p style="margin-bottom: 0.5rem;">Thank you, <strong>${citizenName}</strong>. Your petition has been logged with the Sachivalaya Legal Branch.</p>
            <p style="font-size: 0.9rem; margin-bottom: 0;">Grievance Tracking Number: <strong>${trackingId}</strong></p>
          </div>
        `;
        contactAlert.style.display = 'block';
        contactForm.reset();
      }
    });
  }


  /* ==========================================================================
     16. GALLERY LIGHTBOX MODAL
     ========================================================================== */
  const galleryModal = document.getElementById('gallery-modal');
  const galleryModalImg = document.getElementById('gallery-modal-img');
  const galleryModalCaption = document.getElementById('gallery-modal-caption');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const svg = item.querySelector('svg');
      const captionText = item.querySelector('.gallery-caption strong').textContent;
      const credit = item.querySelector('.gallery-caption span').textContent;

      if (galleryModal && galleryModalImg && galleryModalCaption) {
        galleryModalImg.innerHTML = svg.outerHTML;
        galleryModalCaption.innerHTML = `<h3>${captionText}</h3><p style="color: #64748b; font-size: 0.85rem;">${credit}</p>`;
        galleryModal.classList.add('is-active');
        galleryModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

});
