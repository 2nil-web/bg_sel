
// Raméne la fenêtre au 1er plan, si besoin
if (isHTA()) wsh().SendKeys("% {ENTER}");

// Ecrit ou modifie la valeur de la clef dans la section fichier ini
var APP_NAME="BGImgSel";
var APP_DIR=wsh().ExpandEnvironmentStrings("%LOCALAPPDATA%");
var INI_FILE=APP_DIR+'\\'+APP_NAME+'.ini';

var winX, winY;
var img_width, img_height;
var rejFolder;
var lastNThumb=-1;
var nThumb=1;
var thumbBorder;
var isDarkMode=false;
var isButsOnOver=true;

winX=readIni(INI_FILE, 'POSITION', "X", 50);
winY=readIni(INI_FILE, 'POSITION', "Y", 50);
nThumb=readIni(INI_FILE, 'THUMBNAIL', "Number", 1);
img_width=readIni(INI_FILE, 'THUMBNAIL', "Width", 232);
img_height=readIni(INI_FILE, 'THUMBNAIL', "Height", 128);
rejFolder=readIni(INI_FILE, 'THUMBNAIL', "RejectFolder", wsh().ExpandEnvironmentStrings("%USERPROFILE%")+'\\Pictures\\RES');
thumbBorder=readIniBool(INI_FILE, 'THUMBNAIL', "Border", true);
isDarkMode=readIniBool(INI_FILE, 'APP', "DarkMode", false);
isButsOnOver=readIniBool(INI_FILE, 'APP', "ButtonsOnOver", true);

function setWindowPos (start) {
  var padw=5*nThumb+50;
  var ww=nThumb*img_width+padw;
  if (typeof screen !== "undefined" && ww > screen.width) ww=screen.width;
  var wh=60+Number(img_height);

  if (typeof start === 'undefined') start=false;

  var me;
  if (typeof self !== 'undefined') me=self;
  else if (typeof window !== 'undefined') me=window;
  else return;

  if (start) me.moveTo(winX, winY);

  me.resizeTo(ww, wh);  
}

setWindowPos(true);

// Sortie par la touche escape (ou le bouton de fermeture de la fenêtre)
function onKeyUp(evt) {
  evt=evt || window.event;
  if (evt.keyCode === 27) window.close();
}

function mkTemp () {
  var tn;
  do {
    tn=fso().BuildPath(fso().GetSpecialFolder(2), fso().GetTempName());
  } while (fso().FileExists(tn));

  return tn;
}

var objReg=null;
var objEnumKey=null;
function regEnumKey (key, subKey) {
  if (objReg === null) {
    //var svc=GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\default");
    objReg=loc().ConnectServer(".", "root\\default").Get("StdRegProv");
    // Prepare the EnumKey method...
    objEnumKey=objReg.Methods_.Item("EnumKey"); 
  }

  var objParamsIn=objEnumKey.InParameters.SpawnInstance_(); 
  objParamsIn.hDefKey=key; 
  objParamsIn.sSubKeyName=subKey;
  // Execute the method and collect the output...
  var objParamsOut=objReg.ExecMethod_(objEnumKey.Name, objParamsIn); 

  if (objParamsOut.ReturnValue === 0 && objParamsOut.sNames != null)
    return objParamsOut.sNames.toArray();

  return [];
}

// Retourne les infos de tous les moniteurs connecté dans un json
function get_mon_info() {
  var HKLM=0x080000002;
  var monitorCount=0;

  // Ordinateur\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\UnitedVideo\CONTROL\VIDEO\{.*}
  var path='SYSTEM\\CurrentControlSet\\Control\\UnitedVideo\\CONTROL\\VIDEO';

  var videos=regEnumKey(HKLM, path);
  var mons=[];

  for (var i=0; i < videos.length; ++i) {
    var subKeyVideo=path+'\\'+videos[i];
    var arrSubVideo=regEnumKey(HKLM, subKeyVideo);
    var msg='';

    var vdesk, vxres, vyres, vrelx, vrely, newKey;
    for (var j=0; j < arrSubVideo.length; ++j) {
      newKey='HKLM\\'+subKeyVideo+'\\'+arrSubVideo[j];
      vdesk=wsh().RegRead(newKey+'\\Attach.ToDesktop');

      if (vdesk === 1) {
        vxres=wsh().RegRead(newKey+'\\DefaultSettings.XResolution');
        vyres=wsh().RegRead(newKey+'\\DefaultSettings.YResolution');
        vrelx=wsh().RegRead(newKey+'\\Attach.RelativeX');
        vrely=wsh().RegRead(newKey+'\\Attach.RelativeY');
      } else {
        vxres=vyres=vrelx=vrely=-1;
      }

      mons.push({desk: vdesk, xres: vxres, yres: vyres, relx: vrelx, rely: vrely});
    }
  }

  return mons;
}

function disp_mon_info (eol) {
  if (typeof eol === 'undefined') eol='<br>';

  var mons=get_mon_info();
  var s="";

  if (mons.length > 1) s+="There are "+mons.length+" monitors";
  else s+="There is one monitor";
  s+=eol;

  mons.forEach(function(m, i) {
    s+="Monitor "+(i+1)+ " has a resolution of "+m.xres+"x"+m.yres+" pixels with relative X and Y attachment ("+m.relx+", "+m.rely+") and is ";
    if (m.desk === 0) s+="NOT ";
    s+="active."+eol;
  });

  return s;
}

function BgRegExtract(regKey) {
  // RegRead retourne la clef REG_BINARY "TranscodedImageCache" comme une VBArray convertie en array avec toArray
  try {
    bKey=wsh().RegRead(regKey).toArray();
  } catch (err) {
    return "";
  }

  s="";
  for (i=0; i < bKey.length; i++) {
    if (bKey[i] > 31 && bKey[i] < 127) s+=String.fromCharCode(bKey[i]);
  }

  return s.replace(/(.+)([A-Z]:[0-9a-zA-Z\\])+/, '$2').replace(/(^.*)\\\\\?.*/, '$1');
}

function displayElement(butid, on) {
  var but=document.getElementById(butid);
  if (but && typeof but.style.display !== 'undefined') {
    but.style.display=on?'block':'none';
  }
}

function displayButs(val) {
  displayElement('cnfBut', val);
  displayElement('zinBut', val);
  displayElement('znoBut', val);
  displayElement('zoutBut', val);
  displayElement('nextbg', val);

  for (var i=0; i <= nThumb+10; i++) {
    displayElement('inf_bg'+i, val);
    displayElement('rem_bg'+i, val);
  }
}

var butsOn=false;
function toggleButs () {
  butsOn=!butsOn;
  displayButs(butsOn);
}

function showButs () {
  butsOn=true;
  displayButs(butsOn);
}

function hideButs () {
  butsOn=false;
  displayButs(butsOn);
}

function BgFileDelete (regKey, imgn, remn) {
  hideButs();
  imgn.src="";
  /*imgn.remove();
  remn.remove();*/
  //setWindowPos();
  lastNThumb=-1;

  srcFile=BgRegExtract(regKey);
  dstDir=rejFolder+'\\';
  dstFile=dstDir+srcFile.basename();

  if (!fso().FolderExists(dstDir)) fso().CreateFolder(dstDir);
  if (fso().FileExists(srcFile)) fso().MoveFile(srcFile, dstFile);
}


var cnf_svg='<g transform="matrix(.29 0 0 .297 -73.877 1.32)"><path d="m293.4-3.51c-2.74.0-5.41.28-8 .81v6.18c-3.47.83-6.72 2.18-9.68 4l-4.38-4.375c-2.24 1.48-4.29 3.22-6.19 5.125-1.89 1.89-3.64 3.94-5.12 6.18l4.37 4.375c-1.81 2.967-3.16 6.212-4 9.687h-6.18c-.53 2.585-.82 5.261-.82 8s.29 5.415.82 8h6.18c.84 3.475 2.19 6.72 4 9.688l-4.37 4.375c1.48 2.242 3.23 4.292 5.12 6.187 1.9 1.895 3.95 3.639 6.19 5.125l4.38-4.375c2.96 1.816 6.21 3.161 9.68 4v6.188c2.59.525 5.26.812 8 .812s5.42-.287 8-.812v-6.188c3.48-.839 6.72-2.184 9.69-4l4.38 4.375c2.24-1.486 4.29-3.23 6.18-5.125 1.9-1.895 3.64-3.945 5.13-6.187l-4.38-4.375c1.82-2.968 3.16-6.213 4-9.688h6.19c.53-2.585.81-5.261.81-8s-.28-5.415-.81-8h-6.19c-.84-3.475-2.18-6.72-4-9.687l4.38-4.375c-1.49-2.243-3.23-4.293-5.13-6.18-1.89-1.89-3.94-3.63-6.18-5.125l-4.38 4.375c-2.97-1.81-6.21-3.16-9.69-4v-6.18c-2.58-.52-5.26-.81-8-.81zm0 20c11.04.0 20 8.96 20 20s-8.96 20-20 20-20-8.96-20-20 8.96-20 20-20z" fill="#949096" stroke="#2c2c2c" stroke-dashoffset="162" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><\/g>';

var zin_svg='<path d="m9.82 1.66c-4.51.0-8.16 3.65-8.16 8.16-82e-6 4.50 3.65 8.16 8.16 8.16 1.85.0 3.55-.642 4.92-1.686 3.77 5.49 6.42 6.65 7.333 5.78.926-.906-.504-3.479-5.69-7.43 1.00-1.35 1.61-3.01 1.61-4.82.0-4.50-3.66-8.16-8.17-8.16z" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.32"/><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="m12.668 13.028c4.89 8.35 8.35 10.086 9.41 9.06 1.09-1.07-.756-4.38-8.77-9.71z" fill="#a49fcc" stroke-width="1.27"/><path d="m18.007 9.82c0 4.50-3.66 8.15-8.17 8.15-4.51.0-8.17-3.65-8.17-8.15 1587e-7-4.50 3.66-8.15 8.17-8.15 4.51-395e-7 8.17 3.65 8.17 8.15z" fill="#a49fcc" stroke-width="1.27"/><path d="m16.268 9.81c0 3.54-2.88 6.42-6.43 6.42-3.55.0-6.43-2.87-6.43-6.42-1229e-7-3.54 2.88-6.42 6.43-6.42 3.55-1226e-7 6.43 2.877 6.43 6.42z" fill="#00ff00" stroke-width="1.02"/><\/g><path d="m8.72 8.71V6.22c0-.343.0901-.638.288-.847.198-.229.465-.335.819-.335.355.0.622.116.81.335.192.218.296.504.296.847v2.49h2.463c.357.0.648.0963.854.298.219.192.314.468.314.802.0.355-.104.623-.314.825-.206.193-.498.299-.854.299h-2.463v2.48c0 .355-.094.636-.296.855-.191.218-.468.327-.81.327-.341.0-.629-.109-.819-.327-.198-.218-.288-.50-.288-.855v-2.48H6.26c-.342.0-.634-.104-.855-.311-.218-.218-.313-.489-.313-.803.0-.343.108-.61.314-.802.219-.192.496-.298.854-.298z" stroke-width=".409"/>';

var zno_svg='<path d="m9.82 1.66c-4.51.0-8.16 3.65-8.16 8.16 817e-7 4.50 3.65 8.16 8.16 8.16 1.85.0 3.55-.641 4.92-1.68 3.78 5.49 6.42 6.65 7.33 5.78.921-.908-.497-3.47-5.69-7.433 1.00-1.35 1.61-3.01 1.61-4.82.0-4.50-3.66-8.16-8.17-8.16z" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.32"/><g transform="matrix(.401 0 0 .409 -.277 -.255)" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path transform="matrix(.968 0 0 .96 .663 .895)" d="m31.914 32.619C44.252 53.718 52.966 58.09 55.644 55.5c2.772-2.705-1.893-11.073-22.11-24.534z" fill="#a49fcc" stroke-width="3.22"/><path transform="matrix(.968 0 0 .96 .663 .895)" d="m45.373 24.518c0 11.373-9.23 20.604-20.604 20.604-11.373.0-20.604-9.231-20.604-20.604 4e-4-11.374 9.231-20.604 20.604-20.604 11.374-1e-4 20.604 9.23 20.604 20.604z" fill="#a49fcc" stroke-width="3.22"/><path d="m40.387 24.648c0 8.675-7.041 15.715-15.717 15.715-8.675.0-15.716-7.04-15.716-15.715S15.995 8.933 24.67 8.933c8.676-3e-4 15.717 7.04 15.717 15.715z" fill="#aaaaff" stroke-width="2.5"/><\/g>';

var zout_svg='<path d="m9.82 1.66c-4.51.0-8.16 3.65-8.16 8.16-82e-6 4.50 3.65 8.16 8.16 8.16 1.85.0 3.55-.642 4.92-1.686 3.77 5.49 6.42 6.65 7.333 5.78.926-.906-.503-3.479-5.69-7.43 1.00-1.35 1.61-3.01 1.61-4.82.0-4.50-3.66-8.16-8.17-8.16z" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.32"/><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="m12.668 13.028c4.89 8.35 8.35 10.086 9.41 9.06 1.09-1.07-.756-4.38-8.77-9.71z" fill="#a49fcc" stroke-width="1.27"/><path d="m18.008 9.82c0 4.50-3.66 8.15-8.175 8.15-4.51.0-8.17-3.65-8.17-8.15 41e-6-4.50 3.66-8.15 8.17-8.15 4.51 2044e-7 8.175 3.65 8.175 8.15z" fill="#a49fcc" stroke-width="1.27"/><path d="m16.268 9.82c0 3.545-2.883 6.42-6.43 6.42-3.552.0-6.435-2.87-6.435-6.42-819e-7-3.54 2.883-6.42 6.435-6.42 3.55 1227e-7 6.43 2.87 6.43 6.42z" fill="#ff7777" stroke-width="1.02"/><\/g><path d="m7.96 8.76h3.73c.339.0.586.0955.761.297.186.192.27.447.27.747.0.312-.094.574-.27.776-.187.192-.444.298-.761.298H7.96c-.327.0-.589-.09-.778-.282-.187-.192-.27-.459-.27-.782.0-.311.0936-.562.27-.753.187-.191.449-.281.778-.281z" stroke-width=".409"/>';

var del_svg='<g transform="matrix(.054916 0 0 .054916 -4.4616 -12.112)"><path d="m326.04 513.57h-69.55v-9.44c0-10.53 2.12-19.87 6.35-28.03 4.23-8.15 13.16-18.52 26.78-31.11l12.33-11.17c7.32-6.67 12.68-12.97 16.09-18.88 3.4-5.9 5.1-11.81 5.1-17.72.0-8.99-3.08-16.02-9.24-21.09s-14.77-7.61-25.81-7.61c-10.4.0-21.64 2.15-33.71 6.45s-24.66 10.69-37.76 19.17v-60.5c15.54-5.39 29.73-9.37 42.58-11.94 12.84-2.56 25.24-3.85 37.18-3.85 31.34.0 55.23 6.39 71.67 19.17 16.43 12.78 24.66 31.43 24.66 55.97.0 12.59-2.5 23.86-7.51 33.81-5 9.95-13.55 20.64-25.62 32.08l-12.33 10.98c-8.73 7.96-14.45 14.35-17.14 19.17s-4.04 10.11-4.04 15.89zm-69.55 28.51h69.55v68.59h-69.55z" fill="#fff"/><\/g><circle cx="12" cy="12" r="12" fill="#f44336" stroke-width=".054916"/><g transform="matrix(.054916 0 0 .054916 -4.4616 -12.112)" fill="#fff"><rect transform="matrix(.7071 -.7071 .7071 .7071 -222.62 340.69)" x="267.16" y="307.98" width="65.545" height="262.18"/><rect transform="matrix(.7071 .7071 -.7071 .7071 398.39 -83.312)" x="266.99" y="308.15" width="65.544" height="262.18"/><\/g>';

var next_svg='<g transform="scale(.05)"><circle cx="236.83" cy="236.83" r="236.83" fill="#4abc96"/><path d="m358.08 216.09c-27.011-27.011-54.018-54.022-81.029-81.033-25.56-25.564-65.08 14.259-39.456 39.883 11.009 11.009 22.019 22.019 33.028 33.032h-130.06c-36.225 0-36.543 56.109-0.404 56.109h130.47l-33.252 33.252c-25.564 25.56 14.259 65.08 39.883 39.456 27.011-27.007 54.018-54.014 81.029-81.025 10.844-10.849 10.549-28.915-0.214-39.674z" fill="#fff"/><\/g>';

function NextBG() {
  var chgbg=fso().GetParentFolderName(window.location.pathname)+"\\chgbg.exe -n";
  wsh().Run(chgbg, 0, false);
  //wsh().Exec(chgbg);
}

function svg_button (id, style, click, title, svg) {
    var retval='<button id="'+id+'"  class="image_button" style="'+style+'" onclick="'+click+';" title="'+title+'">'+
      '<svg width="24" height="24">'+svg+'<\/svg>'+
    '<\/button>';
  return retval;
}

var im_buts=svg_button("cnfBut",  "left:  20px", "showConfig()",       "Configuration",   cnf_svg)+
            svg_button("zinBut",  "left:  50px", "zoom(+zoom_factor)", "Zoom in",         zin_svg)+
            svg_button("znoBut",  "left:  80px", "zoom(0)",            "Default size",    zno_svg)+
            svg_button("zoutBut", "left: 110px", "zoom(-zoom_factor)", "Zoom out",        zout_svg)+
            svg_button("nextbg",  "left: 140px", "NextBG()",           "Next background", next_svg);


var monits=get_mon_info();
var curr_nmon=0;

var update_done=false;
// Retourne 1 bgPath existe, 0 sinon
function BgThumbAdd (regKey, pidx) {
  var bgPath=BgRegExtract(regKey);
  if (bgPath === '') return 0;
//  if (!fso().FileExists(bgPath)) return 0;

  if (typeof document === 'undefined') return 0;

  if (typeof pidx === 'undefined') idx=0;
  else idx=pidx;

  var imgn=document.getElementById("img_bg"+idx);

  if (imgn === null) {
    if (lastNThumb === -1) {
      var divW=Number(img_width)+2;
      optDiv='';//background: #DDF; border:0px solid blue;';
      optMouse='';//onmouseenter="showButs();"';

      if (!thumbBorder) border='';
      else border=' border: 1px solid;';

      document.body.innerHTML+=
im_buts+
'<div id="mon'+curr_nmon+'" style="margin-left: 2px;'+border+' float: left; padding: 1px; width: '+divW+'px; height: '+img_height+'px; '+optDiv+'">'+
  '<center>'+
    '<img '+optMouse+' id="img_bg'+idx+'" style="max-width:'+ img_width +'px;max-height:'+img_height+'px; width:auto;height:auto;" src="" ondragstart="return false;">'+
    '<div id="inf_bg'+idx+'" class="info_bg"><\/div>'+
      '<center>'+
        svg_button('rem_bg'+idx, "position:relative; top: -55px;", "", 'Reject image '+bgPath.basename()+'.', del_svg)+
      '<\/center>'+
    '<\/img><\/center><br>'+
'<\/div>';
      im_buts='';
    }

    imgn=document.getElementById("img_bg"+idx);
    imgn.setAttribute('data-monindex', curr_nmon);
    curr_nmon++;
  }

  if (typeof imgn !== 'undefined' && imgn !== null && 
    typeof imgn.src !== 'undefined' && imgn.src !== null && imgn.src !== bgPath) {
    document.getElementById("inf_bg"+idx).innerHTML='Image for screen '+(idx+1)+' ['+bgPath.basename()+']';

    var remn=document.getElementById("rem_bg"+idx);
    imgn.src=imgn.alt=bgPath;
    remn.disabled=false;
    //remn.innerHTML="Remove "+bgPath.basename().split('.').slice(0, -1).join('.');
    remn.style.backgroundColor='';
    remn.onclick=function () {
      BgFileDelete (regKey, imgn, remn);
      srcFile=BgRegExtract(regKey);
      NextBG();
      //NextBG();
    };

    imgn.style.display = 'block';
//    remn.style.display = 'none';

    var cm=imgn.getAttribute('data-monindex');
    var par=document.getElementById("mon"+cm);

    if (idx === 0) {
      par.style.display='';
      return 1;
    }

    if (typeof monits !== 'undefined' && typeof monits[cm] !== 'undefined') {
      if (monits[cm].desk === 1) {
        par.style.display='';
        return 1;
      }
    }

    par.style.display='none';
  }

  return 0;
}

// Récupère la version de Windows
function getWinVers () {
  var svc=loc().ConnectServer(".", "root\\cimv2");
  var coll=svc.ExecQuery("Select * from Win32_OperatingSystem");
  var items=new Enumerator(coll);
 
  while (!items.atEnd()) {
    var vv=items.item().Name.toLowerCase();
 
    if (vv.includes("windows")) {
      if (vv.includes( "7")) return  7;
      if (vv.includes("10")) return 10;
      return 6;
    }
    items.moveNext();
  }
 
 return -1;
}
 
var winVers=getWinVers();

// Taille et position initiale de la fenêtre, proportionnée au nombre d'image à afficher
// Dimension en pixel, des vignettes de présentation, ratio 16/9
var currentWw=0, currentWh=0;
function BgThumbList () {
  nThumb=0;
  monits=get_mon_info();

  switch (winVers) {
    case 7: // For Win7
      nThumb=BgThumbAdd("HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Desktop\\General\\WallpaperSource");
      break;

    default: // For Win10
      // Correspond au nombre d'images d'arrière plan actuellement affichées et à priori aux nombre d'écrans aussi
      // Mais ce nombre n'est pas fiable ...
      try { nKey=wsh().RegRead("HKEY_CURRENT_USER\\Control Panel\\Desktop\\TranscodedImageCount"); } catch (err) { nKey=1; }

      nThumb=0;
      for (var i=0; i < nKey+10; i++) {
        nThumb+=BgThumbAdd("HKEY_CURRENT_USER\\Control Panel\\Desktop\\TranscodedImageCache_"+i.toString().padStart(3), i);
      }

      if (nThumb === 0) nThumb=BgThumbAdd("HKEY_CURRENT_USER\\Control Panel\\Desktop\\TranscodedImageCache");
      break;
  }

  if (lastNThumb !== nThumb) {
    setWindowPos();
    lastNThumb=nThumb;
  }
}

