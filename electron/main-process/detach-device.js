const { ipcMain, BrowserWindow } = require('electron');

ipcMain.on('detach-device', (event, arg) => {
  const isPortraitMode = arg.device.orientation === 'portrait';
  let window = new BrowserWindow({
    height: isPortraitMode ? arg.device.height : arg.device.width,
    width: isPortraitMode ? arg.device.width : arg.device.height,
    resizable: false,
    fullscreen: false
  });

  window.on('close', () => (window = null));
  window.loadURL(arg.url);
  window.show();

  event.sender.send('detach-device-reply', { windowId: window.id });
});
