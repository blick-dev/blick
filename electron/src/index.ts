import { app, BrowserWindow } from 'electron';
import * as glob from 'glob';
import * as path from 'path';

app.commandLine.appendSwitch('touch-events', 'enabled');

let mainWindow: BrowserWindow = null;

function createWindow() {
  loadMainProcess();

  // Define our main window size
  mainWindow = new BrowserWindow({
    height: 1024,
    width: 1378,
    // frame: false,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      // TODO set to false?
      nodeIntegration: true,
      // webSecurity: false,
      preload: path.join(
        __dirname,
        'node_modules',
        '@capacitor',
        'electron',
        'dist',
        'electron-bridge.js'
      )
    }
  });

  try {
    mainWindow.webContents.debugger.attach('1.3');
  } catch (err) {
    console.log('error attaching debugger', err);
  }
  mainWindow.webContents.debugger.sendCommand(
    'Emulation.setTouchEmulationEnabled',
    {
      enabled: true,
      maxTouchPoints: 1,
      configuration: 'mobile'
    }
  );

  mainWindow.webContents.debugger.sendCommand(
    'Emulation.setEmitTouchEventsForMouse',
    {
      enabled: true,
      configuration: 'mobile'
    }
  );

  mainWindow.webContents.debugger.sendCommand('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'pointer', value: 'coarse' }]
  });

  mainWindow.loadURL(`file://${__dirname}/../app/index.html`);
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', () => createWindow());

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Define any IPC or other custom functionality below here
function loadMainProcess() {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
  files.forEach(file => {
    require(file);
  });
}
