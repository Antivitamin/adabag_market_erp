/* Yalnız App ID herkese açıktır. Gönderim anahtarı web uygulamasında bulunmaz. */
(() => {
  let sdk;
  let hata = '';
  const hazir = new Promise(resolve => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async OneSignal => {
      try {
        await OneSignal.init({
          appId: '7826413d-f93a-4229-a781-34a1df544e48',
          serviceWorkerOverrideForTypical: true,
          serviceWorkerPath: new URL('OneSignalSDKWorker.js', document.baseURI).pathname,
          serviceWorkerParam: { scope: new URL('push/', document.baseURI).pathname },
          notifyButton: { enable: false },
          welcomeNotification: { disable: true },
        });
        sdk = OneSignal;
        if (window.Notification?.permission === 'granted' && localStorage.getItem('adabagBildirimKapali') !== '1') {
          await sdk.User.PushSubscription.optIn();
        }
      } catch (_) { hata = 'Bildirim bağlantısı başlatılamadı. Site adresi ve OneSignal web ayarlarını kontrol edin.'; }
      resolve();
    });
    setTimeout(resolve, 15000);
  });
  async function durum() {
    await hazir;
    return { hazir: !!sdk, destek: !!window.Notification && 'serviceWorker' in navigator && 'PushManager' in window,
      izin: window.Notification?.permission === 'granted',
      engelli: window.Notification?.permission === 'denied',
      abone: sdk?.User.PushSubscription.id || '',
      aktif: !!sdk?.User.PushSubscription.optedIn, hata };
  }
  window.adabagBildirimDurumu = async () => JSON.stringify(await durum());
  window.adabagBildirimAc = async () => {
    await hazir;
    if (sdk) {
      localStorage.removeItem('adabagBildirimKapali');
      await sdk.Notifications.requestPermission();
      if (sdk.Notifications.permission) await sdk.User.PushSubscription.optIn();
      for (let i=0; i<20 && sdk.Notifications.permission && !sdk.User.PushSubscription.id; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return JSON.stringify(await durum());
  };
  window.adabagBildirimKapat = async () => {
    await hazir;
    localStorage.setItem('adabagBildirimKapali', '1');
    if (sdk) await sdk.User.PushSubscription.optOut();
    return JSON.stringify(await durum());
  };
  window.adabagBildirimOnar = async () => {
    await hazir;
    if (sdk && window.Notification?.permission === 'granted') {
      localStorage.removeItem('adabagBildirimKapali');
      await sdk.User.PushSubscription.optIn();
      await sdk.Notifications.requestPermission();
    }
    return JSON.stringify(await durum());
  };
  window.adabagBildirimYerelTest = async () => {
    const scope = new URL('push/', document.baseURI).href;
    const reg = await navigator.serviceWorker.getRegistration(scope);
    if (window.Notification?.permission !== 'granted' || !reg || reg.scope !== scope) {
      return JSON.stringify({yerel: false, hata: 'Önce bildirim bağlantısını yenileyin.'});
    }
    await reg.showNotification('Adabağ Market · Cihaz testi', {
      body: 'Bu bildirimi görüyorsanız cihaz bildirimleri açık. Bu test internet üzerinden gönderilmez.',
      icon: new URL('icons/pwa-192-v12.png', document.baseURI).href,
      tag: 'adabag-cihaz-testi'
    });
    return JSON.stringify({yerel: true});
  };
})();
