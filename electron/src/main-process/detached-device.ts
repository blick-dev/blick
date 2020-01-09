import {
  ipcMain,
  BrowserWindow,
  BrowserView,
  TouchBar,
  IpcMainEvent
} from 'electron';
import * as path from 'path';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

interface Device {
  height: number;
  width: number;
  orientation: 'portrait' | 'landscape';
}

interface DeviceMap {
  [windowId: number]: Device;
}

const windowExtraHeight = 22;
const toolbarHeight = 56;
const devices: DeviceMap = {};

const isPortraitMode = (device: Device): boolean => {
  return device.orientation === 'portrait';
};

const getWindowHeight = (device: Device): number => {
  const height = isPortraitMode(device) ? device.height : device.width;
  return height + toolbarHeight + windowExtraHeight;
};

const getWindowWidth = (device: Device): number => {
  return isPortraitMode(device) ? device.width : device.height;
};

const getViewHeight = (device: Device): number => {
  return isPortraitMode(device) ? device.height : device.width;
};

const getViewWidth = (device: Device): number => {
  return isPortraitMode(device) ? device.width : device.height;
};

const updateDeviceOrientation = (window: BrowserWindow, device: Device) => {
  devices[window.id].orientation = isPortraitMode(device)
    ? 'landscape'
    : 'portrait';
};

const rotateWindow = (window: BrowserWindow, device: Device) => {
  updateDeviceOrientation(window, device);

  window.setBounds({
    height: getWindowHeight(device),
    width: getWindowWidth(device)
  });

  window.getBrowserView().setBounds({
    x: 0,
    y: toolbarHeight,
    height: getViewHeight(device),
    width: getViewWidth(device)
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

const createTouchBar = (window: BrowserWindow, device: Device) => {
  const rotate = new TouchBarButton({
    icon: path.join(__dirname, '../../assets/img/screen-rotation.png'),
    click: () => {
      rotateWindow(window, device);
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

const createDetachedBrowserWindow = (device: Device) => {
  let window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    height: getWindowHeight(device),
    width: getWindowWidth(device),
    resizable: false,
    fullscreen: false,
    // icon: set icon for android, ios or desktop device
    show: false
  });

  window.setTouchBar(createTouchBar(window, device));

  window.once('ready-to-show', () => window.show());
  window.on('close', () => {
    closeDevTools(window.getBrowserView());
    window = null;
  });
  window.loadURL(`file://${__dirname}/../../src/pages/detached-device.html`);

  return window;
};

const createDeviceView = async (
  window: BrowserWindow,
  device: Device,
  url: string
) => {
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
    height: getViewHeight(device),
    width: getViewWidth(device)
  });

  // TODO add user agent to load url
  await view.webContents.loadURL(url);
};

// IPC
ipcMain.on('detach-device', async (event, arg) => {
  const newWindow = createDetachedBrowserWindow(arg.device);
  await createDeviceView(newWindow, arg.device, arg.url);

  devices[newWindow.id] = arg.device;

  event.sender.send('detach-device-reply', { windowId: newWindow.id });
});

ipcMain.on('open-dev-tools', (event: IpcMainEvent, arg) => {
  openDevTools();
});

ipcMain.on('rotate-device', (event: IpcMainEvent, arg) => {
  const window = BrowserWindow.getFocusedWindow();
  rotateWindow(window, devices[window.id]);
});
