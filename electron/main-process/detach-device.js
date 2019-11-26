const { ipcMain, BrowserWindow } = require('electron');

ipcMain.on('detach-device', (event, arg) => {
  let window = new BrowserWindow({
    height: arg.device.height,
    width: arg.device.width,
    resizable: false,
    fullscreen: false
  });

  window.on('close', () => (window = null));
  window.loadURL(arg.url);
  window.show();

  event.sender.send('detach-device-reply', { windowId: window.id });
});
