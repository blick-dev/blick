const { ipcMain, BrowserWindow, BrowserView } = require('electron');

const toolbarHeight = 56;
let window;
let view;

ipcMain.on('detach-device', (event, arg) => {
  const isPortraitMode = arg.device.orientation === 'portrait';

  const height = isPortraitMode
    ? arg.device.height + toolbarHeight
    : arg.device.width + toolbarHeight;
  const width = isPortraitMode ? arg.device.width : arg.device.height;

  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    height: height,
    width: width,
    resizable: false,
    fullscreen: false
  });

  window.on('close', () => (window = null));
  window.loadURL(`file://${__dirname}/../src/detach-device.html`);
  window.show();

  view = new BrowserView({ webPreferences: { devTools: true } });
  window.setBrowserView(view);
  view.setBounds({
    x: 0,
    y: toolbarHeight,
    height: height,
    width: width
  });
  // TODO add user agent to load url
  view.webContents.loadURL(arg.url);

  event.sender.send('detach-device-reply', { windowId: window.id });
});

ipcMain.on('open-dev-tools', (event, arg) => {
  view.webContents.openDevTools({ mode: 'detach' });
});
