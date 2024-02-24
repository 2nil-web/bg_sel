
window.resizeTo(800, 200);

// === ActiveX ===
var activeX=[];
function callActiveX(AXName) {
  if (typeof activeX[AXName] === 'undefined') activeX[AXName]=new ActiveXObject(AXName);
  return activeX[AXName];
}

function fso() { return callActiveX('Scripting.FileSystemObject'); }
function wsh() { return callActiveX('WScript.Shell'); }
function sha() { return callActiveX('Shell.Application'); }
function loc() { return callActiveX("WbemScripting.SWbemLocator"); }

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

function trace(msg) {
  trc.innerHTML+=msg+"<br>";
}

function get_mon_info() {
  var HKLM=0x080000002;
  var monitorCount=0;
  //var path='SYSTEM\\CurrentControlSet\\Hardware Profiles\\UnitedVideo\\CONTROL\\VIDEO';
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
    s+="Monitor "+(i+1);
    if (m.desk !== 0) {
      s+=" has a resolution of "+m.xres+"x"+m.yres+" pixels with relative X and Y attachment ("+m.relx+", "+m.rely+") and is active.";
    } else {
      s+=" is NOT active.";
    }
    s+=eol;
  });

  return s;
}

function get_n_active_mon () {
  var n=0;
  var mons=get_mon_info();
  mons.forEach(function(m, i) {
    if (m.desk) n++;
  });

  return n;
}

mdiv.innerHTML=disp_mon_info();

nm=get_n_active_mon();

mdiv.innerHTML+="<br>Il y a donc "+nm+" moniteur";
if (nm > 1) mdiv.innerHTML+="s actifs.";
else mdiv.innerHTML+=" actif.";

