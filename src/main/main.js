const { app, BrowserWindow, globalShortcut, ipcMain, screen, desktopCapturer, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const NotesDatabase = require('./database');

let mainWindow;
let quickCaptureWindow;
let database;
let tray = null;

const createMainWindow = () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  mainWindow.loadFile('src/renderer/index.html');
  
  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createQuickCaptureWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  quickCaptureWindow = new BrowserWindow({
    width: 900,
    height: 260,
    x: Math.floor((width - 900) / 2),
    y: Math.floor(height * 0.3),
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  quickCaptureWindow.loadFile('src/renderer/quick-capture.html');
  quickCaptureWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.control && input.key === 'r')) {
      quickCaptureWindow.reload();
    }
  });
  
  // Prevent window from being destroyed when closed
  quickCaptureWindow.on('close', (event) => {
    event.preventDefault();
    quickCaptureWindow.hide();
  });
  
  quickCaptureWindow.on('blur', () => {
    if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
      quickCaptureWindow.hide();
    }
  });
};

// Create system tray
const createTray = () => {
  // Create a simple icon
  const iconPath = path.join(__dirname, '../../assets/icon.png');
  let trayIcon;
  
  // If icon doesn't exist, create a simple blue icon
  if (!fs.existsSync(iconPath)) {
    // Create a 16x16 blue icon with white "N"
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);
    
    // Fill with blue
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        // Add white "N" in center or just blue background
        if ((x >= 5 && x <= 10) && (y >= 3 && y <= 12)) {
          // Simple N shape
          if (x === 5 || x === 10 || (x === 6 && y === 4) || (x === 7 && y === 6) || 
              (x === 8 && y === 8) || (x === 9 && y === 10)) {
            buffer[idx] = 255;     // R
            buffer[idx + 1] = 255; // G
            buffer[idx + 2] = 255; // B
            buffer[idx + 3] = 255; // A
          } else {
            buffer[idx] = 0;       // R
            buffer[idx + 1] = 120; // G
            buffer[idx + 2] = 212; // B
            buffer[idx + 3] = 255; // A
          }
        } else {
          buffer[idx] = 0;       // R
          buffer[idx + 1] = 120; // G
          buffer[idx + 2] = 212; // B
          buffer[idx + 3] = 255; // A
        }
      }
    }
    
    trayIcon = nativeImage.createFromBuffer(buffer, {
      width: size,
      height: size
    });
    
    // Save for next time
    fs.writeFileSync(iconPath, trayIcon.toPNG());
  } else {
    trayIcon = nativeImage.createFromPath(iconPath);
  }
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open QuickNote',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      }
    },
    {
      label: 'Quick Capture',
      accelerator: 'Ctrl+Alt+Space',
      click: () => {
        if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
          quickCaptureWindow.show();
          quickCaptureWindow.focus();
          quickCaptureWindow.webContents.send('window-shown');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('QuickNote - Your quick note taking app');
  tray.setContextMenu(contextMenu);
  
  // Double click to open main window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createMainWindow();
    }
  });
};

app.whenReady().then(() => {
  try {
    database = new NotesDatabase();
    
    createMainWindow();
    createQuickCaptureWindow();
    quickCaptureWindow.hide();
    createTray();
  } catch (error) {
    console.error('App initialization error:', error);
    app.quit();
  }

  // Register global hotkey for quick capture (Ctrl+Alt+Space)
  const captureShortcut = globalShortcut.register('CommandOrControl+Alt+Space', () => {
    try {
      if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
        if (quickCaptureWindow.isVisible()) {
          quickCaptureWindow.hide();
        } else {
          quickCaptureWindow.show();
          quickCaptureWindow.focus();
          // Send event to clear the form
          quickCaptureWindow.webContents.send('window-shown');
        }
      }
    } catch (error) {
      console.error('Hotkey error:', error);
    }
  });

  // Register global hotkey for main app (Ctrl+Alt+N)
  const mainShortcut = globalShortcut.register('CommandOrControl+Alt+N', () => {
    try {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      } else {
        createMainWindow();
      }
    } catch (error) {
      console.error('Error toggling main window:', error);
    }
  });

  if (!captureShortcut) {
    console.log('Failed to register quick capture shortcut');
  }
  
  if (!mainShortcut) {
    console.log('Failed to register main window shortcut');
  }
});

app.on('window-all-closed', () => {
  // Don't quit the app, keep it running in the tray
  // Only quit if explicitly requested
  if (app.isQuitting) {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (database) {
    database.close();
  }
});

// IPC handler for hiding quick capture window
ipcMain.on('hide-quick-capture', () => {
  if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
    quickCaptureWindow.hide();
  }
});

// Window control handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

// IPC handlers for note operations
// IPC handler for minimizing to tray
ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('save-note', async (event, note) => {
  try {
    const savedNote = database.saveNote(note);
    
    // Notify main window to refresh notes instantly
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('notes-updated');
    }
    
    return savedNote;
  } catch (error) {
    console.error('Save note error:', error);
    throw error;
  }
});

ipcMain.handle('get-notes', async () => {
  try {
    const notes = database.getNotes();
    return notes;
  } catch (error) {
    console.error('Get notes error:', error);
    return [];
  }
});

ipcMain.handle('delete-note', async (event, noteId) => {
  try {
    const deleted = database.deleteNote(noteId);
    
    // Notify main window to refresh notes instantly
    if (deleted && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('notes-updated');
    }
    
    return deleted;
  } catch (error) {
    console.error('Delete note error:', error);
    return false;
  }
});

ipcMain.handle('take-screenshot', async () => {
  try {
    const sources = await desktopCapturer.getSources({ 
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    
    if (sources.length > 0) {
      const screenshot = sources[0].thumbnail.toDataURL();
      return screenshot;
    }
    return null;
  } catch (error) {
    console.error('Screenshot failed:', error);
    return null;
  }
});