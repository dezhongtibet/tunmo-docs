/** 零依赖文档搜索、主题、导航、下载与代码复制。 */
(() => {
  const root = document.documentElement;
  const english = root.lang === 'en';
  const t = (zh, en) => (english ? en : zh);
  const mobile = matchMedia('(max-width: 760px)');
  const phone = matchMedia('(max-width: 600px)');
  const languageLinks = [...document.querySelectorAll('.language-switch')].map((link) => ({
    link,
    destination: link.getAttribute('href'),
  }));
  const keepSections = () => {
    languageLinks.forEach(({ link, destination }) => link.setAttribute('href', destination + location.hash));
  };
  keepSections();
  window.addEventListener('hashchange', keepSections);

  let activeDropdown;
  function bindDropdown(controlSelector, triggerSelector, panelSelector, optionSelector, hoverEnabled = true) {
    const control = document.querySelector(controlSelector);
    if (!control) return null;
    const trigger = control.querySelector(triggerSelector);
    const panel = control.querySelector(panelSelector);
    const option = control.querySelector(optionSelector);
    let hovering = false;
    let openedByHover = false;
    const setOpen = (open, restoreFocus = false) => {
      if (open && activeDropdown !== dropdown) activeDropdown?.close(true);
      const focusWasInPanel = panel.contains(document.activeElement);
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) activeDropdown = dropdown;
      else {
        if (activeDropdown === dropdown) activeDropdown = null;
        openedByHover = false;
        if (restoreFocus && focusWasInPanel) trigger.focus();
      }
    };
    const dropdown = {
      control,
      trigger,
      close: (restoreFocus = false) => setOpen(false, restoreFocus),
    };
    control.addEventListener('pointerenter', (event) => {
      if (!hoverEnabled || event.pointerType !== 'mouse') return;
      hovering = true;
      if (panel.hidden) {
        setOpen(true);
        openedByHover = true;
      }
    });
    control.addEventListener('pointerleave', (event) => {
      if (!hoverEnabled || event.pointerType !== 'mouse') return;
      hovering = false;
      if (!control.contains(document.activeElement)) setOpen(false);
    });
    control.addEventListener('focusout', (event) => {
      if (!hovering && !control.contains(event.relatedTarget)) setOpen(false);
    });
    trigger.addEventListener('click', (event) => {
      // 鼠标悬停已展开时，第一次点击保留面板；触摸和键盘点击正常切换。
      const keepHoverOpen = event.detail > 0 && openedByHover;
      openedByHover = false;
      setOpen(keepHoverOpen || panel.hidden);
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      openedByHover = false;
      setOpen(true);
      option.focus();
    });
    option.addEventListener('click', () => setOpen(false, true));
    document.addEventListener('pointerdown', (event) => {
      if (!control.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented || panel.hidden) return;
      const restoreFocus = control.contains(document.activeElement);
      setOpen(false);
      event.preventDefault();
      if (restoreFocus) trigger.focus();
    });
    return dropdown;
  }
  const downloadDropdown = bindDropdown('.download-control', '.download-trigger', '.download-menu', '.download-option');
  const languageDropdown = bindDropdown(
    '.language-dropdown',
    '.language-trigger',
    '.language-menu',
    '.language-menu-option.language-switch',
  );
  const phoneToolsToggle = document.querySelector('.phone-tools-toggle');
  const phoneToolsPanel = document.querySelector('.phone-tools-panel');
  const phoneLanguageDropdown = bindDropdown(
    '.phone-language-control',
    '.phone-language-trigger',
    '.phone-language-menu',
    '.phone-language-option.language-switch',
    false,
  );
  const inPhoneTools = (element) =>
    !!phoneToolsToggle && (phoneToolsToggle.contains(element) || phoneToolsPanel?.contains(element));
  function setPhoneToolsOpen(open, restoreFocus = false) {
    if (!phoneToolsToggle || !phoneToolsPanel) return;
    open = open && phone.matches;
    const focusWasInPanel = phoneToolsPanel.contains(document.activeElement);
    if (open) activeDropdown?.close(true);
    else phoneLanguageDropdown?.close();
    phoneToolsPanel.hidden = !open;
    phoneToolsToggle.setAttribute('aria-expanded', String(open));
    phoneToolsToggle.setAttribute(
      'aria-label',
      open ? t('关闭更多选项', 'Close options') : t('打开更多选项', 'More options'),
    );
    if (!open && restoreFocus && focusWasInPanel && phone.matches) phoneToolsToggle.focus();
  }
  if (phoneToolsToggle && phoneToolsPanel) {
    const closeAfterFocusLeaves = (event) => {
      const next = event.relatedTarget;
      if (next && next !== document.body && next !== root && !inPhoneTools(next)) setPhoneToolsOpen(false);
    };
    phoneToolsToggle.addEventListener('focusout', closeAfterFocusLeaves);
    phoneToolsPanel.addEventListener('focusout', closeAfterFocusLeaves);
    phoneToolsToggle.addEventListener('click', () => setPhoneToolsOpen(phoneToolsPanel.hidden, true));
    phoneToolsToggle.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setPhoneToolsOpen(true);
      phoneLanguageDropdown?.trigger.focus();
    });
    phoneToolsPanel.addEventListener('click', (event) => {
      if (event.target.closest('.phone-download, .phone-language-option.language-switch')) {
        setPhoneToolsOpen(false, true);
      }
    });
    document.addEventListener('pointerdown', (event) => {
      if (!inPhoneTools(event.target)) setPhoneToolsOpen(false, true);
    });
    document.addEventListener('focusin', (event) => {
      if (
        !phoneToolsPanel.hidden &&
        event.target !== document.body &&
        event.target !== root &&
        !inPhoneTools(event.target)
      )
        setPhoneToolsOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented || phoneToolsPanel.hidden) return;
      event.preventDefault();
      setPhoneToolsOpen(false, true);
    });
  }
  const desktopLanguageLink = document.querySelector('.language-selector .language-switch');
  const desktopThemeButton = document.querySelector('.theme-toggle:not(.phone-theme-toggle)');
  if (languageDropdown && desktopLanguageLink) {
    const toolsFocusSource = (element) => {
      if (inPhoneTools(element)) return 'phone';
      if (languageDropdown.control.contains(element)) return 'language-dropdown';
      if (element === desktopLanguageLink) return 'language-selector';
      if (downloadDropdown?.control.contains(element)) return 'download';
      return element === desktopThemeButton ? 'theme' : null;
    };
    const isDocumentFocus = (element) => !element || element === document.body || element === root;
    const hiddenByBreakpoint = (source) => {
      if (source === 'phone') return !phone.matches;
      if (source === 'language-dropdown') return phone.matches || !mobile.matches;
      if (source === 'language-selector') return mobile.matches;
      return (source === 'download' || source === 'theme') && phone.matches;
    };
    let lastToolsFocus = null;
    document.addEventListener('focusin', (event) => {
      const source = toolsFocusSource(event.target);
      if (source) lastToolsFocus = source;
      else if (!isDocumentFocus(event.target) || !hiddenByBreakpoint(lastToolsFocus)) lastToolsFocus = null;
    });
    document.addEventListener('focusout', (event) => {
      const source = toolsFocusSource(event.target);
      if (!source) return;
      // CSS 可能先隐藏原控件、让焦点落到 body，随后才派发媒体查询 change。
      lastToolsFocus =
        hiddenByBreakpoint(source) && isDocumentFocus(event.relatedTarget)
          ? source
          : toolsFocusSource(event.relatedTarget);
    });
    const syncResponsiveTools = () => {
      const active = document.activeElement;
      const source = toolsFocusSource(active) || (isDocumentFocus(active) ? lastToolsFocus : null);
      activeDropdown?.close();
      languageDropdown.close();
      setPhoneToolsOpen(false);
      lastToolsFocus = null;
      if (hiddenByBreakpoint(source)) {
        const target = phone.matches
          ? phoneToolsToggle
          : mobile.matches
            ? languageDropdown.trigger
            : desktopLanguageLink;
        target?.focus();
      }
    };
    mobile.addEventListener('change', syncResponsiveTools);
    phone.addEventListener('change', syncResponsiveTools);
  }
  const preferredTheme = matchMedia('(prefers-color-scheme: dark)');
  let theme;
  try {
    theme = localStorage.getItem('tunmo-docs-theme');
  } catch {}
  if (theme !== 'light' && theme !== 'dark') theme = null;
  const themeButtons = [...document.querySelectorAll('.theme-toggle')];
  function applyTheme() {
    root.dataset.theme = theme || (preferredTheme.matches ? 'dark' : 'light');
    themeButtons.forEach((button) => {
      if (button.getAttribute('role') === 'switch') {
        button.setAttribute('aria-checked', String(root.dataset.theme === 'dark'));
      } else {
        button.setAttribute(
          'aria-label',
          root.dataset.theme === 'dark'
            ? t('切换浅色模式', 'Switch to light mode')
            : t('切换深色模式', 'Switch to dark mode'),
        );
        button.title = button.getAttribute('aria-label');
      }
    });
  }
  applyTheme();
  preferredTheme.addEventListener('change', applyTheme);
  themeButtons.forEach((button) => {
    button.onclick = () => {
      theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('tunmo-docs-theme', theme);
      } catch {}
      applyTheme();
    };
  });

  const sidebar = document.querySelector('.sidebar');
  const shell = document.querySelector('.shell');
  const menu = document.querySelector('.menu-toggle');
  const menuClose = document.querySelector('.menu-close');
  const scrim = document.querySelector('.scrim');
  const dialog = document.querySelector('.search-dialog');
  const input = dialog.querySelector('input');
  const results = dialog.querySelector('.search-results');
  const originalOverflow = document.body.style.overflow;
  let menuOpener;
  let searchOpener;
  const focusable = (element) =>
    [...element.querySelectorAll('a[href], button:not([disabled]), input, [tabindex="0"]')].filter(
      (item) => item.getClientRects().length && !item.closest('[inert]'),
    );
  const canFocus = (element) => element?.isConnected && element.getClientRects().length && !element.closest('[inert]');
  const lockScroll = () => {
    document.body.style.overflow = sidebar.classList.contains('open') || dialog.open ? 'hidden' : originalOverflow;
  };
  function toggleMenu(open, restoreFocus = true) {
    const wasOpen = sidebar.classList.contains('open');
    open = open && mobile.matches;
    if (open && !wasOpen) {
      menuOpener = inPhoneTools(document.activeElement) ? phoneToolsToggle : document.activeElement;
      setPhoneToolsOpen(false);
    }
    sidebar.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? t('关闭导航', 'Close navigation') : t('打开导航', 'Open navigation'));
    scrim.hidden = !open;
    shell.inert = open;
    sidebar.inert = mobile.matches && !open;
    lockScroll();
    if (open && !wasOpen) (menuClose || focusable(sidebar)[0])?.focus();
    if (!open && wasOpen && restoreFocus && canFocus(menuOpener)) menuOpener.focus();
  }
  toggleMenu(false, false);
  menu.onclick = () => toggleMenu(!sidebar.classList.contains('open'));
  if (menuClose) menuClose.onclick = () => toggleMenu(false);
  scrim.onclick = () => toggleMenu(false);
  sidebar.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false, false));
  });
  mobile.addEventListener('change', () => {
    const focusWasInSidebar = sidebar.contains(document.activeElement);
    toggleMenu(false, false);
    if (mobile.matches && focusWasInSidebar) menu.focus();
    else if (focusWasInSidebar && !canFocus(document.activeElement)) focusable(sidebar)[0]?.focus();
  });

  // 搜索结果保留真实链接，使 Tab 导航和在新标签页中打开的行为与普通链接一致。
  results.removeAttribute('aria-live');
  function highlight(element, text, terms) {
    if (!terms.length) {
      element.textContent = text;
      return;
    }
    const pattern = terms
      .map((term) => term.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&'))
      .sort((a, b) => b.length - a.length)
      .join('|');
    let end = 0;
    for (const match of text.matchAll(new RegExp(pattern, 'gi'))) {
      element.append(document.createTextNode(text.slice(end, match.index)));
      const mark = document.createElement('mark');
      mark.textContent = match[0];
      element.append(mark);
      end = match.index + match[0].length;
    }
    element.append(document.createTextNode(text.slice(end)));
  }
  function search() {
    results.replaceChildren();
    results.scrollTop = 0;
    const entries = window.TUNMO_SEARCH || [];
    const terms = [...new Set(input.value.trim().toLowerCase().split(/\s+/).filter(Boolean))];
    const matches = terms.length
      ? entries
          .map((entry) => ({
            entry,
            score: terms.every((term) => (entry.title + ' ' + entry.text).toLowerCase().includes(term))
              ? terms.reduce((score, term) => score + (entry.title.toLowerCase().includes(term) ? 5 : 1), 0) +
                (entry.title.toLowerCase().startsWith(terms.join(' ')) ? 3 : 0) +
                (entry.url.includes('#') ? 0 : 2)
              : 0,
          }))
          .filter((match) => match.score)
          .sort((a, b) => b.score - a.score)
          .map((match) => match.entry)
      : ['quickstart.html', 'configuration.html', 'qgis.html', 'rpc.html']
          .map((url) => entries.find((entry) => entry.url === url))
          .filter(Boolean);
    const meta = document.createElement('p');
    meta.className = 'search-meta';
    meta.setAttribute('role', 'status');
    meta.textContent = terms.length
      ? t(
          `找到 ${matches.length} 条相关结果`,
          `${matches.length} ${matches.length === 1 ? 'result' : 'results'} found`,
        ) + (matches.length > 24 ? t(' · 显示前 24 条', ' · Showing the first 24') : '')
      : t('从这里开始', 'Start here');
    results.append(meta);
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-search';
      empty.textContent = entries.length
        ? t(
            '没有找到相关内容，试试「安装」「QGIS」或更短的关键词。',
            'No matching content. Try “install”, “QGIS”, or a shorter keyword.',
          )
        : t(
            '搜索索引暂时不可用，请通过左侧导航浏览文档。',
            'The search index is unavailable. Use the navigation to browse the docs.',
          );
      results.append(empty);
    }
    for (const entry of matches.slice(0, 24)) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.url;
      const title = document.createElement('strong');
      highlight(title, entry.title, terms);
      const description = document.createElement('p');
      const position = terms.map((term) => entry.text.toLowerCase().indexOf(term)).find((index) => index >= 0) ?? 0;
      const start = Math.max(0, position - 30);
      const excerpt =
        (start ? '…' : '') + entry.text.slice(start, start + 140) + (entry.text.length > start + 140 ? '…' : '');
      highlight(description, excerpt, terms);
      link.append(title, description);
      results.append(link);
    }
  }
  function openSearch() {
    if (dialog.open) return;
    searchOpener =
      sidebar.contains(document.activeElement) && mobile.matches
        ? menu
        : inPhoneTools(document.activeElement)
          ? phoneToolsToggle
          : document.activeElement;
    setPhoneToolsOpen(false);
    toggleMenu(false, false);
    dialog.showModal();
    lockScroll();
    search();
    input.focus();
  }
  document.querySelectorAll('.search-trigger').forEach((trigger) => {
    trigger.onclick = openSearch;
    const shortcut = trigger.querySelector('kbd');
    if (shortcut) shortcut.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
  });
  dialog.querySelector('.close-search').onclick = () => dialog.close();
  dialog.addEventListener('close', () => {
    lockScroll();
    if (canFocus(searchOpener)) searchOpener.focus();
    else [...document.querySelectorAll('.search-trigger')].find(canFocus)?.focus();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
  input.oninput = search;
  dialog.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
      return;
    }
    const links = [...results.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && (event.target === input || index >= 0)) {
      event.preventDefault();
      const next =
        index < 0 ? (event.key === 'ArrowDown' ? 0 : links.length - 1) : index + (event.key === 'ArrowDown' ? 1 : -1);
      const target = links[next] || input;
      target.focus({ preventScroll: true });
      if (target !== input) target.scrollIntoView({ block: 'nearest' });
    }
    if (event.key === 'Enter' && event.target === input && links.length) {
      event.preventDefault();
      links[0].click();
    }
  });
  dialog.addEventListener('focusin', () => {
    results.querySelectorAll('a').forEach((link) => link.classList.toggle('selected', link === document.activeElement));
  });
  results.addEventListener('click', (event) => {
    if (event.target.closest('a') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey)
      dialog.close();
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else openSearch();
    }
    if (!sidebar.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      toggleMenu(false);
    }
    if (event.key === 'Tab') {
      const items = focusable(sidebar);
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  const toast = document.querySelector('.toast');
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
  }
  document.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;
    const language = [...code.classList].find((name) => name.startsWith('language-'))?.slice(9) || 'text';
    pre.dataset.language =
      { bash: 'Shell', javascript: 'JavaScript', json: 'JSON', python: 'Python', text: t('文本', 'Text') }[language] ||
      language;
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = t('复制', 'Copy');
    button.setAttribute('aria-label', t('复制代码', 'Copy code'));
    let copyTimer;
    button.onclick = async () => {
      clearTimeout(copyTimer);
      button.classList.remove('copied');
      button.setAttribute('aria-label', t('复制代码', 'Copy code'));
      button.disabled = true;
      try {
        if (navigator.clipboard && isSecureContext) await navigator.clipboard.writeText(code.textContent);
        else {
          const field = document.createElement('textarea');
          field.value = code.textContent;
          field.style.position = 'fixed';
          field.style.opacity = '0';
          document.body.append(field);
          try {
            field.select();
            if (!document.execCommand('copy')) throw Error('copy');
          } finally {
            field.remove();
          }
        }
        button.textContent = t('已复制', 'Copied');
        button.setAttribute('aria-label', t('代码已复制', 'Code copied'));
        button.classList.add('copied');
        notify(t('代码已复制', 'Code copied'));
      } catch {
        button.textContent = t('复制失败', 'Copy failed');
        notify(
          t(
            '无法自动复制，请选择代码后手动复制',
            'Unable to copy automatically. Select the code and copy it manually.',
          ),
        );
      } finally {
        button.disabled = false;
        button.focus({ preventScroll: true });
        copyTimer = setTimeout(() => {
          button.textContent = t('复制', 'Copy');
          button.setAttribute('aria-label', t('复制代码', 'Copy code'));
          button.classList.remove('copied');
        }, 2200);
      }
    };
    pre.append(button);
  });

  const links = [...document.querySelectorAll('.toc a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            links.forEach((link) => {
              const current = link.hash === '#' + entry.target.id;
              link.classList.toggle('active', current);
              if (current) link.setAttribute('aria-current', 'location');
              else link.removeAttribute('aria-current');
            });
      },
      { rootMargin: '-88px 0px -60% 0px' },
    );
    document.querySelectorAll('h2[id]').forEach((heading) => observer.observe(heading));
  }
})();
