
function isJS () {
  if (typeof document === 'undefined') return true;
  return false;
}

var VBScriptVersion="";
function getVBScriptVersion() {
  var firstScriptBlock=document.getElementsByTagName('script')[0];
  var tmpScript=document.createElement('script');
  tmpScript.setAttribute("language", "VBScript");
  tmpScript.text='VBScriptVersion=ScriptEngineMajorVersion & "." & ScriptEngineMinorVersion';
  tmpScript.async=false;
  tmpScript.onload=function() { this.parentNode.removeChild(this); };
  firstScriptBlock.parentNode.insertBefore(tmpScript, firstScriptBlock);
  return VBScriptVersion;
}

// Return true if running in a HTML-Application else false
function isHTA() {
  return (getVBScriptVersion() != "" && typeof window.external === 'undefined');
}

// Return true if IE else false
function isIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  var rv = -1;

  // If Internet Explorer, return version number
  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    if (isNaN(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))))) {
      // For IE 11 >
      if (navigator.appName == 'Netscape') {
        ua = navigator.userAgent;
        var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null) {
          rv = parseFloat(RegExp.$1);
          return rv;
        }
      }
    } else {
      // For < IE11
      return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
    }
  }

  return false;
}

// Windows ActiveX
//var activeX=new Array();
var activeX=[];
function callActiveX(AXName) {
if (isJS() || isHTA() || isIE()) {
  if (typeof activeX[AXName] === 'undefined') activeX[AXName]=new ActiveXObject(AXName);
  return activeX[AXName];
} else return null;
}

function fso() { return callActiveX("Scripting.FileSystemObject"); }
function wsh() { return callActiveX("WScript.Shell"); }
function sha() { return callActiveX("Shell.Application"); }
function loc() { return callActiveX("WbemScripting.SWbemLocator"); }

var kCod= {
  'BKSP':'{BKSP}', // BACKSPACE	{BACKSPACE}, {BS}, or 
  'BREAK':'{BREAK}', // BREAK	
  'CAPSLOCK':'{CAPSLOCK}', // CAPS LOCK	
  'DEL':'{DEL}', // DEL or DELETE	{DELETE} or 
  'DOWN':'{DOWN}', // DOWN ARROW	
  'END':'{END}', // END	
  'ENTER':'{ENTER}', // ENTER	 or ~
  'ESC':'{ESC}', // ESC	
  'HELP':'{HELP}', // HELP	
  'HOME':'{HOME}', // HOME	
  'INS':'{INS}', // INS or INSERT	{INSERT} or 
  'LEFT':'{LEFT}', // LEFT ARROW	
  'NUMLOCK':'{NUMLOCK}', // NUM LOCK	
  'PGDN':'{PGDN}', // PAGE DOWN	
  'PGUP':'{PGUP}', // PAGE UP	
  'PRTSC':'{PRTSC}', // PRINT SCREEN	 (reserved for future use)
  'RIGHT':'{RIGHT}', // RIGHT ARROW	
  'SCROLLLOCK':'{SCROLLLOCK}', // SCROLL LOCK	
  'TAB':'{TAB}', // TAB	
  'UP':'{UP}', // UP ARROW	
  'F1':'{F1}', // F1	
  'F2':'{F2}', // F2	
  'F3':'{F3}', // F3	
  'F4':'{F4}', // F4	
  'F5':'{F5}', // F5	
  'F6':'{F6}', // F6	
  'F7':'{F7}', // F7	
  'F8':'{F8}', // F8	
  'F9':'{F9}', // F9	
  'F10':'{F10}', // F10	
  'F11':'{F11}', // F11	
  'F12':'{F12}', // F12	
  'F13':'{F13}', // F13	
  'F14':'{F14}', // F14	
  'F15':'{F15}', // F15	
  'F16':'{F16}', // F16	
  'ADD':'{ADD}', // Keypad add	
  'SUBTRACT':'{SUBTRACT}', // Keypad subtract	
  'MULTIPLY':'{MULTIPLY}', // Keypad multiply	
  'DIVIDE':'{DIVIDE}', // Keypad divide	
  // To specify keys combined with any combination of the SHIFT, CTRL, and ALT keys, precede the key code with one or more of the following codes.
  'SHIFT':'+',
  'CTRL':'^',
  'ALT':'%'
};

sha().ToggleDesktop();
WScript.Sleep(50);
wsh().SendKeys("+{F10}");
wsh().SendKeys("+{N}");
wsh().SendKeys("+{N}");
wsh().SendKeys("+{ENTER}");

//sha().MinimizeAll();
//wsh().SendKeys("{WIN}D");
/*wsh().SendKeys("^ ");*/
//wsh().SendKeys('+'+kCod['F10']+'nn{ENTER}');
//wsh().SendKeys("{ENTER}");
//sha().UndoMinimizeAll();
