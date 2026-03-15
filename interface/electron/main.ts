import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // Mac Style
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For MVP only. Em prod real usar preload.js
    },
  });

  if (isDev) {
    // In dev mode, wait for Vite dev server then load it
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production mode, load the Vite static build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicia o app do Electron
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Em um app de produção completo, aqui nós usaríamos child_process para subir 
  // um binário Python embutido (ex: pyinstaller) como Daemon ouvindo na porta local. 
  // Para MVP Open Source React, vamos focar no visual empacotado puro.
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
