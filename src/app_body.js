
//getAllNodes();
//  <abbr title="Click me to access the configuration dialog">

function setRejFolder () {
  if (rejFld.value === '') rejFld.value=rejFolder;
  var folder=sha().BrowseForFolder(0, "Select a Folder", 0, 0);
  if (folder !== null) rejFld.value=folder.Self.Path;
}

var zoom_factor=0.2;

function zoom (factor) {
  if (img_width*(1+factor) > 140 && img_height*(1+factor) > 80) {
  try {
    if (factor === 0) {
      img_width=320;
      img_height=180;
    } else {
      img_width=parseInt(img_width*(1+factor), 10);
      img_height=parseInt(img_height*(1+factor), 10);
    }


    location.reload();
  } catch (err) { }
  }
}

var itvbtl=-1, itvgan=-1, itvccd=-1;

function onKeyUpDiv(evt) {
  evt=evt || window.event;
//  writeLog("kc "+evt.keyCode);

  switch (evt.keyCode) {
    case 13:
      okCnfDiv();
      break;
    case 27:
      if (itvccd != -1) {
        clearTimeout(itvccd);
        itvccd=-1;
      }
      itvccd=setTimeout(closeCnfDiv, 100);
      break;
  }
}

var noResizeW, noResizeH;
function cnfDivNoResize () {
  if (isHTA()) window.resizeTo(noResizeW, noResizeH);
}

function mainWinUnref () {
  if (itvbtl !== -1) clearInterval(itvbtl);
  if (itvgan !== -1) clearTimeout(itvgan);
  itvbtl=itvgan=-1;
}

function mainWinRef () {
  // Rafraichissement des images au cinquième de seconde
  if (itvbtl === -1) itvtbl=setInterval(BgThumbList, 100);
//  if (itvgan === -1) itvgan=setTimeout(getAllNodes, 100);
}

function closeCnfDiv() {
  cnfDiv.style.display='none';
  window.onresize=null;
  window.removeEventListener("resize", cnfDivNoResize);
  document.onkeyup=document.body.onkeyup=onKeyUp;
  setWindowPos();
  if (itvccd != -1) clearTimeout(itvccd);
  itvccd=-1;
  mainWinRef();
}

function okCnfDiv() {
  if (rejFld.value !== '') rejFolder=rejFld.value;

  isButsOnOver=butsOnOver.checked;
  setButsOnOver(isButsOnOver);

  if (thW.value !== '' && thH.value !== '' && (thW.value !== img_width || thH.value !== img_height || thumbBorder !== thuBord.checked || isDarkMode !== darkMode.checked)) {
    img_width=thW.value;
    img_height=thH.value;
    thumbBorder=thuBord.checked;
    isDarkMode=darkMode.checked;
    setDarkMode(isDarkMode);
    saveConfig();
    location.reload();
  }

  closeCnfDiv();
}

function showConfig () {
  cnfDivStyle = getComputedStyle(cnfDiv);
  noResizeW=Number(cnfDivStyle.width.replace('px', ''))+26;
  noResizeH=Number(cnfDivStyle.height.replace('px', ''))+48;
  if (isHTA()) window.resizeTo(noResizeW, noResizeH);
  rejFld.value=rejFolder;
  thW.value=img_width;
  thH.value=img_height;
  thuBord.checked=thumbBorder;
  darkMode.checked=isDarkMode;
  butsOnOver.checked=isButsOnOver;
  butsOnClck.checked=!isButsOnOver;
  document.onkeyup=document.body.onkeyup=onKeyUpDiv;
  window.addEventListener("resize", cnfDivNoResize);
  cnfDiv.style.display='block';
  mainWinUnref();
}

window.onload=function () {
  setDarkMode(isDarkMode);
  setButsOnOver(isButsOnOver);

  //document.onkeyup=document.body.onkeyup=onKeyUp;
  document.onkeyup=onKeyUp;
  mainWinRef();
};

function saveConfig () {
  writeIni(INI_FILE, 'POSITION', "X", winX);
  writeIni(INI_FILE, 'POSITION', "Y", winY);
  writeIni(INI_FILE, 'THUMBNAIL', "Number", nThumb);
  writeIni(INI_FILE, 'THUMBNAIL', "Width", img_width);
  writeIni(INI_FILE, 'THUMBNAIL', "Height", img_height);
  writeIni(INI_FILE, 'THUMBNAIL', "RejectFolder", rejFolder);
  writeIniBool(INI_FILE, 'THUMBNAIL', "Border", thumbBorder);
  writeIniBool(INI_FILE, 'APP', "DarkMode", isDarkMode);
  writeIniBool(INI_FILE, 'APP', "ButtonsOnOver", isButsOnOver);
}  

window.onbeforeunload = function (e) {
  winX=getWindowX(); 
  if (winX < 0) winX=50;
  winY=getWindowY();
  if (winY < 0) winY=50;
  saveConfig();
};

