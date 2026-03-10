"use strict"
const e = require('electron')
console.log("type:", typeof e, "has app:", typeof e === 'object' && !!e.app)
if (typeof e === 'object' && e.app) {
  e.app.whenReady().then(() => { console.log("READY!"); e.app.quit() })
}
