/** 按站点发布目录切换文档版本，保留可用的语言、页面与章节。 */
(() => {
  const control = document.querySelector('.version-picker');
  if (!control) return;
  const trigger = control.querySelector('.version-trigger');
  const label = control.querySelector('.version-label');
  const menu = control.querySelector('.version-menu');
  const list = control.querySelector('.version-list');
  const status = control.querySelector('.version-status');
  const retry = control.querySelector('.version-retry');
  if (!trigger || !label || !menu || !list || !status || !retry) return;

  const english = document.documentElement.lang === 'en';
  const locale = english ? 'en' : 'zh-CN';
  const t = (zh, en) => (english ? en : zh);
  // 使用绝对字符串末尾，避免 $ 接受版本号或路径后的换行。
  const versionPattern = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?![\s\S])/;
  const pagePattern = /^[a-z0-9-]+(?![\s\S])/;
  const editionRoot = new URL(control.dataset.editionRoot || '.', location.href);
  const directory = editionRoot.pathname.split('/').filter(Boolean).at(-1);
  const directoryVersion = versionPattern.test(directory || '') ? directory : null;
  const declaredVersion = control.dataset.version;
  const current = directoryVersion || (versionPattern.test(declaredVersion || '') ? declaredVersion : 'latest');
  const siteRoot = directoryVersion ? new URL('../', editionRoot) : editionRoot;
  const currentPage = pagePattern.test(control.dataset.page || '') ? control.dataset.page : 'index';
  const previewOnly = !directoryVersion && current !== 'latest';
  let versions = [];
  let loadState = 'idle';
  let pendingFocus = null;

  label.textContent = current;
  trigger.setAttribute('aria-label', t(`文档版本：${current}`, `Documentation version: ${current}`));
  trigger.title = trigger.getAttribute('aria-label');

  function setStatus(message, allowRetry = false) {
    status.textContent = message;
    status.hidden = !message;
    retry.hidden = !allowRetry;
  }

  function compareVersions(a, b) {
    if (a.id === b.id) return 0;
    if (a.id === 'latest') return -1;
    if (b.id === 'latest') return 1;
    const left = a.id.slice(1).split('.').map(BigInt);
    const right = b.id.slice(1).split('.').map(BigInt);
    for (let part = 0; part < 3; part++) {
      if (left[part] !== right[part]) return left[part] > right[part] ? -1 : 1;
    }
    return 0;
  }

  function readManifest(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.versions)) throw new Error('Invalid version catalog');
    const entries = new Map();
    for (const entry of data.versions) {
      if (
        !entry ||
        typeof entry !== 'object' ||
        typeof entry.id !== 'string' ||
        (entry.id !== 'latest' && !versionPattern.test(entry.id)) ||
        !entry.pages ||
        typeof entry.pages !== 'object'
      )
        continue;
      const pages = {};
      let valid = true;
      for (const language of ['zh-CN', 'en']) {
        const values = entry.pages[language];
        if (!Array.isArray(values) || values.some((page) => typeof page !== 'string' || !pagePattern.test(page))) {
          valid = false;
          break;
        }
        pages[language] = new Set(values);
      }
      if (!valid || (!pages['zh-CN'].has('index') && !pages.en.has('index'))) continue;
      if (!entries.has(entry.id)) entries.set(entry.id, { id: entry.id, pages });
    }
    if (!entries.size) throw new Error('Empty version catalog');
    return [...entries.values()].sort(compareVersions);
  }

  function destinationFor(version) {
    const candidates = [
      [locale, currentPage],
      ...(english ? [['zh-CN', currentPage]] : []),
      [locale, 'index'],
      ['zh-CN', 'index'],
      ['en', 'index'],
    ];
    const [language, page] = candidates.find(([candidateLocale, candidatePage]) =>
      version.pages[candidateLocale].has(candidatePage),
    );
    const root = version.id === 'latest' ? siteRoot : new URL(`${version.id}/`, siteRoot);
    const languageRoot = language === 'en' ? new URL('en/', root) : root;
    const url = page === 'index' ? new URL(languageRoot) : new URL(`${page}.html`, languageRoot);
    if (page === currentPage) url.hash = location.hash;
    let note = '';
    if (language !== locale) {
      if (page === currentPage) note = language === 'en' ? t('英文', 'English') : t('中文', 'Chinese');
      else note = language === 'en' ? t('英文首页', 'English home') : t('中文首页', 'Chinese home');
    } else if (page !== currentPage) note = t('首页', 'Home');
    return { url, note };
  }

  function renderVersions() {
    const entries = versions.some((entry) => entry.id === current) ? versions : [...versions, { id: current }];
    const fragment = document.createDocumentFragment();
    for (const version of [...entries].sort(compareVersions)) {
      const selected = version.id === current;
      const option = document.createElement(selected ? 'span' : 'a');
      option.className = 'version-option';
      const name = document.createElement('span');
      name.className = 'version-name';
      name.textContent = version.id;
      option.append(name);
      if (selected) option.setAttribute('aria-current', 'page');
      else {
        const destination = destinationFor(version);
        option.href = destination.url.href;
        option.dataset.version = version.id;
        if (destination.note) {
          const note = document.createElement('span');
          note.className = 'version-note';
          note.textContent = destination.note;
          option.append(note);
        }
      }
      fragment.append(option);
    }
    list.replaceChildren(fragment);
  }

  function focusOptions(edge) {
    const options = [...menu.querySelectorAll('a.version-option, .version-retry:not([hidden])')];
    const target = edge === 'last' ? options.at(-1) : options[0];
    target?.focus();
    return !!target;
  }

  function setOpen(open) {
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (!open) pendingFocus = null;
  }

  async function loadVersions() {
    if (loadState === 'loading') return;
    if (!['http:', 'https:'].includes(location.protocol) || siteRoot.origin !== location.origin) {
      loadState = 'unavailable';
      setStatus(
        t('请通过 HTTP 预览或在线站点切换版本。', 'Use an HTTP preview or the published site to switch versions.'),
      );
      return;
    }
    if (previewOnly) {
      loadState = 'unavailable';
      setStatus(t('当前为固定版本的本地预览。', 'This is a local preview of a fixed version.'));
      return;
    }
    loadState = 'loading';
    setStatus(t('正在加载版本…', 'Loading versions…'));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(new URL('versions.json', siteRoot), {
        cache: 'no-cache',
        mode: 'same-origin',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Version catalog unavailable');
      versions = readManifest(await response.json());
      loadState = 'loaded';
      renderVersions();
      setStatus(
        versions.every((version) => version.id === current)
          ? t('暂无其他已发布版本。', 'No other versions have been published.')
          : '',
      );
    } catch {
      loadState = 'error';
      versions = [];
      renderVersions();
      setStatus(t('暂时无法加载版本，请重试。', 'Unable to load versions. Please retry.'), true);
    } finally {
      clearTimeout(timeout);
      if (pendingFocus && !menu.hidden && control.contains(document.activeElement)) focusOptions(pendingFocus);
      pendingFocus = null;
    }
  }

  function openVersions(edge = null) {
    setOpen(true);
    pendingFocus = edge;
    if (loadState === 'idle') void loadVersions();
    if (edge && focusOptions(edge)) pendingFocus = null;
  }

  renderVersions();
  trigger.addEventListener('click', () => {
    if (menu.hidden) openVersions();
    else setOpen(false);
  });
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    openVersions(event.key === 'ArrowUp' ? 'last' : 'first');
  });
  retry.addEventListener('click', () => {
    pendingFocus = 'first';
    trigger.focus();
    void loadVersions();
  });
  menu.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const options = [...menu.querySelectorAll('a.version-option, .version-retry:not([hidden])')];
    if (!options.length) return;
    event.preventDefault();
    const index = options.indexOf(document.activeElement);
    if (event.key === 'Home' || event.key === 'End') focusOptions(event.key === 'End' ? 'last' : 'first');
    else options[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus();
  });
  control.addEventListener('focusout', (event) => {
    const next = event.relatedTarget;
    if (next && next !== document.body && next !== document.documentElement && !control.contains(next)) setOpen(false);
  });
  document.addEventListener('focusin', (event) => {
    if (
      event.target !== document.body &&
      event.target !== document.documentElement &&
      !control.contains(event.target)
    ) {
      setOpen(false);
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!control.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented || menu.hidden) return;
    event.preventDefault();
    setOpen(false);
    trigger.focus();
  });
  window.addEventListener('hashchange', () => {
    for (const option of list.querySelectorAll('a.version-option')) {
      const version = versions.find((entry) => entry.id === option.dataset.version);
      if (version) option.href = destinationFor(version).url.href;
    }
  });
})();
