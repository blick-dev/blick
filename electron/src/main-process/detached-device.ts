import {
  ipcMain,
  BrowserWindow,
  BrowserView,
  TouchBar,
  IpcMainEvent
} from 'electron';
import * as path from 'path';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

const windowExtraHeight = 22;
const toolbarHeight = 56;
let deviceOrientation: 'portrait' | 'landscape';
let deviceHeight: number;
let deviceWidth: number;

const isPortraitMode = (): boolean => {
  return deviceOrientation === 'portrait';
};

const getWindowHeight = (): number => {
  const height = isPortraitMode() ? deviceHeight : deviceWidth;
  return height + toolbarHeight + windowExtraHeight;
};

const getWindowWidth = (): number => {
  return isPortraitMode() ? deviceWidth : deviceHeight;
};

const getViewHeight = (): number => {
  return isPortraitMode() ? deviceHeight : deviceWidth;
};

const getViewWidth = (): number => {
  return isPortraitMode() ? deviceWidth : deviceHeight;
};

const rotateWindow = (window: BrowserWindow) => {
  deviceOrientation = isPortraitMode() ? 'landscape' : 'portrait';

  window.setBounds({
    height: getWindowHeight(),
    width: getWindowWidth()
  });

  window.getBrowserView().setBounds({
    x: 0,
    y: toolbarHeight,
    height: getViewHeight(),
    width: getViewWidth()
  });
};

const openDevTools = () => {
  const window = BrowserWindow.getFocusedWindow();
  if (!window) {
    return;
  }

  const view = window.getBrowserView();
  view.webContents.openDevTools({ mode: 'detach' });
};

const closeDevTools = (view: BrowserView) => {
  view.webContents.closeDevTools();
};

const createTouchBar = (window: BrowserWindow) => {
  const rotate = new TouchBarButton({
    icon: path.join(__dirname, '../../assets/img/screen-rotation.png'),
    click: () => {
      rotateWindow(window);
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
};

const createDetachedBrowserWindow = () => {
  let window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    height: getWindowHeight(),
    width: getWindowWidth(),
    resizable: false,
    fullscreen: false,
    // icon: set icon for android, ios or desktop device
    show: false
  });

  window.setTouchBar(createTouchBar(window));

  window.once('ready-to-show', () => window.show());
  window.on('close', () => {
    closeDevTools(window.getBrowserView());
    window = null;
  });
  window.loadURL(`file://${__dirname}/../../src/pages/detached-device.html`);

  return window;
};

const createDeviceView = async (window: BrowserWindow, url: string) => {
  const view = new BrowserView({
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
    height: getViewHeight(),
    width: getViewWidth()
  });

  // TODO add user agent to load url
  await view.webContents.loadURL(url);
};

// IPC
ipcMain.on('detach-device', async (event, arg) => {
  deviceOrientation = arg.device.orientation;
  deviceHeight = arg.device.height;
  deviceWidth = arg.device.width;

  const newWindow = createDetachedBrowserWindow();
  await createDeviceView(newWindow, arg.url);

  event.sender.send('detach-device-reply', { windowId: newWindow.id });
});

ipcMain.on('open-dev-tools', (event: IpcMainEvent, arg) => {
  openDevTools();
});

ipcMain.on('rotate-device', (event: IpcMainEvent, arg) => {
  rotateWindow(BrowserWindow.getFocusedWindow());
});
