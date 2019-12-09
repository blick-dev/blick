import { ipcMain, BrowserWindow, BrowserView, TouchBar } from 'electron';
import * as path from 'path';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

const windowExtraToolbarHeight = 76;
const toolbarHeight = 56;
let window: BrowserWindow;
let view: BrowserView;
let deviceHeight: number;
let deviceWidth: number;

function rotateWindow() {
  const bounds = window.getBounds();
  // TODO rotate window correctly
  window.setBounds({
    height: bounds.width,
    width: bounds.height
  });
}

function openDevTools() {
  view.webContents.openDevTools({ mode: 'detach' });
}

function createTouchBar() {
  const rotate = new TouchBarButton({
    icon: path.join(__dirname, '../../assets/img/screen-rotation.png'),
    click: () => {
      rotateWindow();
    }
  });
  const devTools = new TouchBarButton({
    icon: path.join(__dirname, '../../assets/img/code.png'),
    click: () => {
      openDevTools();
    }
  });

  const touchBar = new TouchBar({
    items: [rotate, new TouchBarSpacer({ size: 'small' }), devTools]
  });

  return touchBar;
}

ipcMain.on('detach-device', (event, arg) => {
  const isPortraitMode = arg.device.orientation === 'portrait';

  deviceHeight = arg.device.height;
  deviceWidth = arg.device.width;

  const windowHeight = isPortraitMode
    ? deviceHeight + windowExtraToolbarHeight
    : deviceWidth + windowExtraToolbarHeight;
  const windowWidth = isPortraitMode ? deviceWidth : deviceHeight;

  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    height: windowHeight,
    width: windowWidth,
    resizable: false,
    fullscreen: false
  });

  window.setTouchBar(createTouchBar());

  window.on('close', () => (window = null));
  window.loadURL(`file://${__dirname}/../../src/pages/detached-device.html`);
  window.show();

  view = new BrowserView({
    webPreferences: {
      devTools: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  window.setBrowserView(view);
  view.setBounds({
    x: 0,
    y: toolbarHeight,
    height: isPortraitMode ? deviceHeight : deviceWidth,
    width: isPortraitMode ? deviceWidth : deviceHeight
  });
  view.setAutoResize({ horizontal: isPortraitMode, vertical: !isPortraitMode });

  // TODO add user agent to load url
  view.webContents.loadURL(arg.url);

  event.sender.send('detach-device-reply', { windowId: window.id });
});

ipcMain.on('open-dev-tools', (event, arg) => {
  openDevTools();
});

ipcMain.on('rotate-device', (event, arg) => {
  rotateWindow();
});
