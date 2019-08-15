
const {
  app,
  BrowserWindow,net,Menu, protocol, ipcMain
} = require('electron')
const alert = require('alert-node');

const log = require('electron-log');
  const { autoUpdater } = require("electron-updater")
const path = require('path')
const url = require('url')



let template = []
//if (process.platform === 'darwin') {
  // OS X
  const name = 'GeoMeasure ' + app.getVersion(); 
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
//}

let win;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
function sendStatusToWindow(text) {
 // alert(text);
  log.info(text);
  win.webContents.send('message', text);

}

function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 800,
    minHeight:400,
    minWidth:800,
    icon: __dirname +  '/Icon/icon.png'
  })
//console.log(ipcMain);

  win.on('closed', () => {   
    win = null
  })  
  // load the dist folder from Angular
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools optionally:
 // win.webContents.openDevTools();
  return win;
}

ipcMain.on('asynchronous-message', (event, arg) => {
  app.relaunch();
  app.exit(0);
  })
  
  try{
   // autoupdater.fire('check');
    autoUpdater.on('checking-for-update', () => {
      sendStatusToWindow('Checking for update...');
    })
    autoUpdater.on('update-available', (info) => {
      sendStatusToWindow('update-available');
    })
    autoUpdater.on('update-not-available', (info) => {
      sendStatusToWindow('update-not-available');
    })
    autoUpdater.on('error', (err) => {
      sendStatusToWindow('Error' +err);
    })
    autoUpdater.on('download-progress', (progressObj) => {
      //let log_message = "Download speed: " + progressObj.bytesPerSecond;
      //log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      //log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      sendStatusToWindow('downloading----->'+progressObj.percent);
    })
    autoUpdater.on('update-downloaded', (info) => {
      sendStatusToWindow('update-downloaded');
    });
  
  }catch(e){
    sendStatusToWindow('Error' + e);
  }

app.on('ready', function() {
try{
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  //alert("Hlbefore"+Math.random())
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.checkForUpdates();
  
}catch(e){
//   alert(e);
// console.log(e);
}
  
});
//app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {    
    app.quit();
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
});


