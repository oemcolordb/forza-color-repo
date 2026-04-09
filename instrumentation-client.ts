import { initBotId } from 'botid/client/core'

initBotId({
  protect: [
    { path: '/api/scans', method: 'POST' },
    { path: '/api/favorites', method: 'POST' },
    { path: '/api/map-progress', method: 'POST' },
    { path: '/api/ml/enhance-colors', method: 'POST' },
  ],
})
