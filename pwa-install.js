(() => {
  if (!/Android/i.test(navigator.userAgent) || window.matchMedia('(display-mode: standalone)').matches) return;
  let pending = null;
  let panel = null;
  let dismissed = false;
  let prompting = false;
  const dismiss = () => { dismissed = true; pending = null; if (panel) panel.remove(); };
  window.addEventListener('beforeinstallprompt', event => {
    if (dismissed || prompting) return;
    event.preventDefault();
    pending = event;
    if (panel) return;
    panel = document.createElement('div');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Uygulama kurulumu');
    Object.assign(panel.style, {position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'max(12px, env(safe-area-inset-bottom))',zIndex:'10000',maxWidth:'calc(100vw - 24px)',background:'#fff',border:'1px solid #c7d2fe',borderRadius:'12px',padding:'8px',boxShadow:'0 4px 16px #0002',fontFamily:'Arial,sans-serif',fontSize:'13px'});
    const install = document.createElement('button');
    install.type = 'button';
    install.textContent = 'Uygulamayı Yükle';
    Object.assign(install.style,{background:'#1a237e',color:'#fff',border:'none',borderRadius:'8px',padding:'10px 14px',fontWeight:'bold',cursor:'pointer'});
    const close = document.createElement('button');
    close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label','Kurulum önerisini kapat');
    Object.assign(close.style,{background:'transparent',border:'none',padding:'8px',fontSize:'20px',cursor:'pointer'});
    panel.append(install, close);
    document.body.append(panel);
    const timer = window.setTimeout(dismiss, 5000);
    close.addEventListener('click', dismiss);
    install.addEventListener('click', async () => {
      if (!pending || prompting) return;
      const request = pending; pending = null; prompting = true; install.disabled = true;
      window.clearTimeout(timer);
      try {
        await request.prompt();
        await request.userChoice;
      } catch (_) {
        // Unavailable native prompts leave no inactive install control behind.
      } finally { dismiss(); prompting = false; }
    });
  });
  window.addEventListener('appinstalled', dismiss);
})();
