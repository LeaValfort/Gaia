// Service worker personnalisé, fusionné par next-pwa dans sw.js au build.
// Réception des notifications push des proches et ouverture de l'appli au clic.

self.addEventListener('push', (event) => {
  let data = { title: 'Gaia', body: '', url: '/proches' }
  try {
    data = { ...data, ...event.data.json() }
  } catch {
    if (event.data) data.body = event.data.text()
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/proches'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      for (const f of fenetres) {
        if ('focus' in f) {
          f.navigate(url)
          return f.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
