import { ipcRenderer } from 'electron';

const openDevTools = document.getElementById('open-dev-tools');
const rotateDevice = document.getElementById('rotate-device');

openDevTools.addEventListener('click', event => {
  ipcRenderer.send('open-dev-tools');
});

rotateDevice.addEventListener('click', event => {
  ipcRenderer.send('rotate-device');
});
