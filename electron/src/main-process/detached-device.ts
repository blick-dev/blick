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
// TODO window and view are overrwritten for new detachted devices
let window: BrowserWindow;
let view: BrowserView;
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

const rotateWindow = () => {
  deviceOrientation = isPortraitMode() ? 'landscape' : 'portrait';

  window.setBounds({
    height: getWindowHeight(),
    width: getWindowWidth()
  });

  view.setBounds({
    x: 0,
    y: toolbarHeight,
    height: getViewHeight(),
    width: getViewWidth()
  });
};

const openDevTools = () => {
  view.webContents.openDevTools({ mode: 'detach' });
};

const closeDevTools = () => {
  view.webContents.closeDevTools();
};

const createTouchBar = () => {
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
};

const createDetachedBrowserWindow = () => {
  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    height: getWindowHeight(),
    width: getWindowWidth(),
    resizable: false,
    fullscreen: false,
    show: false
  });

  window.setTouchBar(createTouchBar());

  window.once('ready-to-show', () => window.show());
  window.on('close', () => {
    closeDevTools();
    view = null;
    window = null;
  });
  window.loadURL(`file://${__dirname}/../../src/pages/detached-device.html`);
};

const createDeviceView = async (url: string) => {
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

  createDetachedBrowserWindow();
  await createDeviceView(arg.url);

  event.sender.send('detach-device-reply', { windowId: window.id });
});

ipcMain.on('open-dev-tools', (event: IpcMainEvent, arg) => {
  openDevTools();
});

ipcMain.on('rotate-device', (event: IpcMainEvent, arg) => {
  rotateWindow();
});
