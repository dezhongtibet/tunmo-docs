/** 零依赖文档搜索、主题、导航与代码复制。 */
(() => {
  const root = document.documentElement;
  let theme;
  try {
    theme = localStorage.getItem('tunmo-docs-theme');
  } catch {}
  root.dataset.theme = theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const themeButton = document.querySelector('.theme-toggle');
  const label = () =>
    themeButton.setAttribute('aria-label', root.dataset.theme === 'dark' ? '切换浅色模式' : '切换深色模式');
  label();
  themeButton.onclick = () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('tunmo-docs-theme', root.dataset.theme);
    } catch {}
    label();
  };
  const sidebar = document.querySelector('.sidebar'),
    menu = document.querySelector('.menu-toggle'),
    scrim = document.querySelector('.scrim');
  const toggleMenu = (open) => {
    sidebar.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    scrim.hidden = !open;
    if (open) sidebar.querySelector('a').focus();
  };
  menu.onclick = () => toggleMenu(!sidebar.classList.contains('open'));
  scrim.onclick = () => toggleMenu(false);
  const dialog = document.querySelector('dialog'),
    input = dialog.querySelector('input'),
    results = dialog.querySelector('.search-results');
  function search() {
    results.replaceChildren();
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = terms.length
      ? (window.TUNMO_SEARCH || [])
          .map((e) => ({
            e,
            score: terms.every((t) => (e.title + ' ' + e.text).toLowerCase().includes(t))
              ? terms.reduce((n, t) => n + (e.title.toLowerCase().includes(t) ? 5 : 1), 0)
              : 0,
          }))
          .filter((x) => x.score)
          .sort((a, b) => b.score - a.score)
          .slice(0, 24)
      : [];
    if (!matches.length) {
      const p = document.createElement('p');
      p.className = 'empty-search';
      p.textContent = terms.length
        ? '没有找到相关内容，请尝试更短的关键词或工具名称。'
        : '试试「缓冲区」「Goal」「安装」或工具名称。';
      results.append(p);
    }
    for (const { e } of matches) {
      const a = document.createElement('a');
      a.className = 'search-result';
      a.href = e.url;
      const h = document.createElement('strong');
      h.textContent = e.title;
      const p = document.createElement('p');
      const start = Math.max(0, e.text.toLowerCase().indexOf(terms[0]) - 30);
      p.textContent = (start ? '…' : '') + e.text.slice(start, start + 140) + (e.text.length > start + 140 ? '…' : '');
      a.append(h, p);
      results.append(a);
    }
  }
  function openSearch() {
    toggleMenu(false);
    dialog.showModal();
    search();
    input.focus();
  }
  document.querySelector('.search-trigger').onclick = openSearch;
  document.querySelector('.close-search').onclick = () => dialog.close();
  input.oninput = search;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') results.querySelector('a')?.click();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      results.querySelector('a')?.focus();
    }
  };
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!dialog.open) openSearch();
    }
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      toggleMenu(false);
      menu.focus();
    }
  });
  const toast = document.querySelector('.toast');
  let timer;
  function notify(t) {
    toast.textContent = t;
    toast.classList.add('visible');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('visible'), 2200);
  }
  document.querySelectorAll('pre').forEach((pre) => {
    const b = document.createElement('button');
    b.className = 'copy-button';
    b.textContent = '复制';
    b.setAttribute('aria-label', '复制代码');
    b.onclick = async () => {
      try {
        const text = pre.querySelector('code').textContent;
        if (navigator.clipboard && isSecureContext) await navigator.clipboard.writeText(text);
        else {
          const field = document.createElement('textarea');
          field.value = text;
          field.style.position = 'fixed';
          field.style.opacity = '0';
          document.body.append(field);
          field.select();
          const copied = document.execCommand('copy');
          field.remove();
          b.focus();
          if (!copied) throw Error('copy');
        }
        notify('代码已复制');
      } catch {
        notify('无法自动复制，请选择代码后手动复制');
      }
    };
    pre.append(b);
  });
  const links = [...document.querySelectorAll('.toc a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            links.forEach((a) => {
              const current = a.hash === '#' + e.target.id;
              a.classList.toggle('active', current);
              if (current) a.setAttribute('aria-current', 'location');
              else a.removeAttribute('aria-current');
            });
      },
      { rootMargin: '0px 0px -65% 0px' },
    );
    document.querySelectorAll('h2[id]').forEach((h) => observer.observe(h));
  }
})();
