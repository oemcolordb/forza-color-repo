const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadColorData: () => ipcRenderer.invoke('load-color-data')
})