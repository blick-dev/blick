import * as minimist from 'minimist';
import { ipcMain } from 'electron';

const argv = minimist(process.argv.slice(2));
ipcMain.on('start-up', event => {
  event.sender.send('start-up-reply', { url: argv.url, args: argv });
});
