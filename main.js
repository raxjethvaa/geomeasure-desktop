
const {
  app,
  BrowserWindow,net,Menu, protocol, ipcMain
} = require('electron')
// const alert = require('alert-node');


 // const { autoUpdater } = require("electron-updater")
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



app.on('ready', function() {
try{
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  //alert("Hlbefore"+Math.random())
  createWindow();
  
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


