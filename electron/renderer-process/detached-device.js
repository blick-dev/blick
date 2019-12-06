const { ipcRenderer } = require('electron');

const openDevTools = document.getElementById('open-dev-tools');

openDevTools.addEventListener('click', event => {
  ipcRenderer.send('open-dev-tools');
});
