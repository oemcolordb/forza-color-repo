const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.svg'),
    title: 'Forza Color Universe'
  })

  mainWindow.loadFile(path.join(__dirname, '../out/index.html'))
  Menu.setApplicationMenu(null)
}

// Handle color data loading
ipcMain.handle('load-color-data', async () => {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../services/colorData.js'),
      path.join(process.resourcesPath, 'app/services/colorData.js'),
      path.join(__dirname, 'services/colorData.js')
    ]
    
    for (const dataPath of possiblePaths) {
      if (fs.existsSync(dataPath)) {
        delete require.cache[require.resolve(dataPath)]
        const colorData = require(dataPath)
        return colorData.default || colorData
      }
    }
    
    // Fallback: return sample data
    return [{
      make: 'Sample',
      model: 'Car',
      year: 2024,
      colorName: 'Sample Red',
      colorType: 'Normal',
      color1: { h: 0, s: 1, b: 1 },
      color2: { h: 0, s: 1, b: 1 }
    }]
  } catch (error) {
    console.error('Error loading color data:', error)
    return []
  }
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})