
if (typeof isJSOnly === 'undefined') {
var isJSOnly=function () {
  return typeof document === 'undefined';
};
}

// Polyfills
String.prototype.basename=function (sep) {
  if (typeof sep === 'undefined') sep="\\";
   return this.substr(this.lastIndexOf(sep) + 1);
};
 
String.prototype.dirname=function () {
  return this.replace(/[\\\/][^\\\/]*$/, '');
};
 
if (!String.prototype.padStart) {
  String.prototype.padStart = function(size, c) {
    if (typeof c === 'undefined') c='0';
    var s = String(this);
    while (s.length < (size || 2)) {s = c + s;}
    return s;
  };
}

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';

    if (search instanceof RegExp) {
      throw TypeError('first argument must not be a RegExp');
    } 
    if (start === undefined) { start = 0; }
    return this.indexOf(search, start) !== -1;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
    var subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
      position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.lastIndexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
}

if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

      var result = [];

      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }

      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    };
  })();
}

if ( !Date.prototype.toISOString ) {
  ( function() {
    
    function pad(number) {
      if ( number < 10 ) {
        return '0' + number;
      }
      return number;
    }
 
    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + pad( this.getUTCMonth() + 1 ) +
        '-' + pad( this.getUTCDate() ) +
        'T' + pad( this.getUTCHours() ) +
        ':' + pad( this.getUTCMinutes() ) +
        ':' + pad( this.getUTCSeconds() ) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
  
  }() );
}

if (!isJSOnly()) {
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        if (this.parentNode !== null)
          this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
}

function getWindowX() {
  if (typeof window === 'undefined') return false;
  return (typeof window.screenX == "number") ? window.screenX : window.screenLeft;
}

function getWindowY () {
  if (typeof window === 'undefined') return false;
  return (typeof window !=='undefined' && typeof window.screenY == "number") ? window.screenY : window.screenTop;
}


// Restricts input for the given input to the given inputFilter function and min, max values.
function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  });

}
/* Exemple utilisation setInputFilter :
// Allow input of digits only using a RegExp
setInputFilter(elt, function(value) { return /^\d*$/.test(value); });
*/

// Allow input of positive integer between min and max value
function setIntegerFilter(textbox, min, max) {
  setInputFilter(textbox, function(value) {
    return /^\d*$/.test(value);
  });

  textbox.addEventListener("focusout", function() {
    if (typeof min === 'number' && this.value < min) this.value=min;
    if (typeof max === 'number' && this.value > max) this.value=max;
  });
}

var VBScriptVersion="";
function getVBScriptVersion() {
  if (isJSOnly()) return "";
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
  return (getVBScriptVersion() != "" && typeof window !== 'undefined' && typeof window.external === 'undefined');
}

// Return true if IE else false
function isIE() {
  if (isJSOnly()) return false;

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


function logElem (elt) {
  var logS="id "+elt.id;
  if (elt.className !== '') logS+=", class "+elt.className;
  if (typeof elt.type !== 'undefined' && elt.type !== '') logS+=", type "+elt.type;
  var sty=getComputedStyle(elt);
  logS+='\n'+sty;
  Array.prototype.forEach.call(sty, function(prop, idx) {
    logS+=idx+':'+prop+':'+sty.getPropertyValue(prop)+'; ';
  });

  if (typeof elt.style !== 'undefined' && elt.style !== '') {
    logS+="\n"+elt.style;
    Array.prototype.forEach.call(elt.style, function(prop, idx) {
      logS+=idx+':'+prop+':'+sty.getPropertyValue(prop)+'; ';
    });
  }

  writeLog(logS);
}

function disableSelection(element) {
  if (typeof element.onselectstart != 'undefined') {
    element.onselectstart = function() { return false; };
  } else if (typeof element.style.MozUserSelect != 'undefined') {
    element.style.MozUserSelect = 'none';
  } else {
    element.onmousedown = function() { return false; };
  }
}

var darkBGCol='#121212';
var darkButBGCol='#222266';
var darkTxtBGCol='#662222';
var darkFGCol='#eeee77';

function setButsOnOver (set) {
  if (set) {
    document.body.addEventListener("mouseover", showButs);
    document.body.addEventListener("mouseout", hideButs);
    document.body.removeEventListener("click", toggleButs);
  } else {
    document.body.removeEventListener("mouseover", showButs);
    document.body.removeEventListener("mouseout", hideButs);
    document.body.addEventListener("click", toggleButs);

  }
}

function setDarkMode (set) {
  if (set) {
    document.body.style.backgroundColor=darkBGCol;
    document.body.style.color=darkFGCol;
  } else {
    document.body.style.backgroundColor='';
    document.body.style.color='';
  }

  Array.prototype.forEach.call(document.body.querySelectorAll('*'), function(elt) {
      if (set) {
        if (elt.style.backgroundColor.toLowerCase() !== 'transparent') {
          if (elt.tagName.toLowerCase() === 'button') elt.style.backgroundColor=darkButBGCol;
          else if (elt.tagName.toLowerCase() === 'input') elt.style.backgroundColor=darkTxtBGCol;
          else elt.style.backgroundColor=darkBGCol;
          elt.style.color=darkFGCol;
        }
      } else {
        if (elt.style.backgroundColor.toLowerCase() !== 'transparent') {
          elt.style.backgroundColor='';
          elt.style.color='';
        }
      }
 });
}

function getAllNodes () {
  Array.prototype.forEach.call(document.body.querySelectorAll('*'), function(elt) {
    if (typeof elt.tagName !== 'undefined' && elt.tagName.toLowerCase() === 'label') {
      disableSelection(elt);
    }

    if (typeof elt.id !== "undefined" && elt.id !=="") {
      //logElem(elt);

      if (typeof elt.type !== 'undefined' && elt.type === 'text') {
        var min=elt.getAttribute("min");
        var max=elt.getAttribute("max");
        //writeLog("id "+elt.id+", type "+elt.type+", typeof min "+typeof min+", typeof max "+typeof max);

        if (typeof min === 'string' || typeof max === 'string') {
          if (isNaN(min)) min=Number.MIN_SAFE_INTEGER;
          else min=Number(min);
          if (isNaN(max)) max=Number.MAX_SAFE_INTEGER;
          else max=Number(max);
          //writeLog("id "+elt.id+", type "+elt.type+", min "+min+', type '+typeof min+", max "+max+", type "+typeof max);
          // Allow input of positive integer between min and max
          setIntegerFilter(elt, min, max);
        }
      }

      if (isHTA()) // Running as mshta ?
        bg_imgsel[elt.id]=document.getElementById('+elt.id+');
      else if (isIE()) // Running as html page under IE ?
        eval('var '+elt.id+'=document.getElementById('+elt.id+');');
      else window[elt.id]=document.getElementById('+elt.id+');

      // La prise en compte des variable globales à travers l'objet window ne fonctionne pas sous IE
    }
  });
}

// Windows ActiveX
//var activeX=new Array();
var activeX=[];
function callActiveX(AXName) {
if (isIE() || isHTA() || isJSOnly()) {
  if (typeof activeX[AXName] === 'undefined') activeX[AXName]=new ActiveXObject(AXName);
  return activeX[AXName];
} else return null;
}

function fso() { return callActiveX("Scripting.FileSystemObject"); }
function wsh() { return callActiveX("WScript.Shell"); }
function sha() { return callActiveX("Shell.Application"); }
function loc() { return callActiveX("WbemScripting.SWbemLocator"); }


// === Windows Popup ===
var jsOKOnly=0, jsOKCancel=1, jsAbortRetryIgnore=2, jsYesNoCancel=3, jsYesNo=4, jsRetryCancel=5, jsCancelTryAgainContinue=6,
    jsStop=16, jsQuestion=32, jsExclamation=48, jsInformation=64,
    jsDefault2ndButton=256, jsDefault3rdButton=512, jsModal=4096, jsRightAlignText=524288, jsRightToLeftText=1048576,
    jsTimeOut=-1, jsOK=1, jsCancel=2, jsAbort=3, jsRetry=4, jsIgnore=5, jsYes=6, jsNo=7, jsTryAgain=10, jsContinue=11;

var DontWaitUntilFinished=false, ShowWindow=1, DontShowWindow=0, WaitUntilFinished=true;

// Windows Filesystem
var ForReading=1, ForWriting=2, ForAppending=8,
TristateUseDefault=-2, // Ouvre le fichier avec la valeur par défaut du système.
TristateTrue=-1, // Ouvre le fichier comme de l'Unicode.
TristateFalse=0;

// Ini file management
function writeIni(file, section, key, value) {
  if (typeof localStorage === 'undefined') {
    var ini;
    if (fso().FileExists(file.trim())) {
      ini=fso().OpenTextFile(file);
      var fileNew=file+fso().GetTempName().replace('.tmp','')+'.ini';
      var iniNew=fso().CreateTextFile(fileNew);
      var sectExist=false;
      var inSect=false;
      var keyExist;
      if (readIni(file, section, key) !== "") keyExist=true;
      else keyExist=false;
      var written=false;

      while (!ini.AtEndOfStream) {
        var line=ini.readline().trim();

        if (!written) {
          if (line.toLowerCase() === '['+section.toLowerCase()+']') {
            sectExist=true;
            inSect=true;
          } else {
            if (line.indexOf('[') === 0) inSect=false;
          }
        }

        if (inSect) {
          if (keyExist) {
            var pos=line.substring(1).indexOf('=');

            if (pos !== -1) {
              var leftVal=line.substring(0, pos+1).trim();
              if (leftVal.toLowerCase() === key.toLowerCase()) {
                if (value !== "<DELETE_THIS_VALUE>") iniNew.writeline(key+'='+value);
                written=true;
                inSect=false;
              }
            }
            if (!written) iniNew.writeline(line);
          } else {
            iniNew.writeline(line);
            if (value !== "<DELETE_THIS_VALUE>") iniNew.writeline(key+'='+value);
            written=true;
            inSect=false;
          }
        } else iniNew.writeline(line);
      }

      if (!sectExist) {
        if (fso().GetFile(file).Size > 0) iniNew.writeline();
        iniNew.writeline('['+section+']');
        if (value !==  "<DELETE_THIS_VALUE>") iniNew.writeline(key+'='+value);
      }

      ini.close();
      iniNew.close();
      fso().DeleteFile(file, true);
      fso().MoveFile(fileNew, file);
    } else {
      ini=fso().CreateTextFile(file.trim());
      ini.writeline('['+section+']');
      ini.writeline(key+'='+value);
      ini.close();
    }
  } else {
    var k=file+'.'+section+'.'+key;
    localStorage.setItem(k, value);
  }
}


function writeIniBool(file, section, key, value) {
  var val='false';

  switch(typeof value) {
    case 'boolean':
      if (value) val='true';
      else val='false';
      break;
    case 'string':
      if (value === 'true' || value === 'yes' || value === 'on') val='true';
      else val='false';
      break;
    case 'number':
      if (value === 0) val='false';
      else val='true';
      break;
    default:
      val='false';
  }

  writeIni(file, section, key, val);
}

function delIniKey(file, section, key) {
  if (typeof localStorage === "undefined") {
    writeIni(file, section, key,  "<DELETE_THIS_VALUE>");
  } else {
    var k=file+'.'+section+'.'+key;
    localStorage.removeItem(k);
  }
}

// Retourne la valeur de la clef dans la section du fichier ini ou ""
function readIni(file, section, key, defVal) {
  var val="";

  if (typeof localStorage === 'undefined') {
    if (fso().FileExists(file.trim())) {
      var ini=fso().OpenTextFile(file, ForReading, false);

      while (!ini.AtEndOfStream) {
        var line=ini.readline().trim();

        if (line.toLowerCase() === '['+section.toLowerCase()+']') {
          if (ini.AtEndOfStream) break;
          line=ini.readline().trim();

          while (line.substring(0, 1) !== '[') {
            var pos=line.indexOf('=');

            if (pos > 0) {
              var leftStr=line.substring(0, pos).trim();
              if (leftStr.toLowerCase() === key.toLowerCase()) {
                val=line.substring(pos+1).trim();
                break;
              }
            }
            
            if (ini.AtEndOfStream) break;
            line=ini.readline().trim();
          }
          break;
        }
      }
      ini.close();
    //} else {
    }
  } else {
    var k=file+'.'+section+'.'+key;
    var newVal=localStorage.getItem(k);
    if (newVal !== null) val=newVal;
    else localStorage.setItem(k, val);
  }

  // Si val n'est pas défini et qu'une valeur par défaut est définie alors on prend la valeur par défaut
  if (val === "" && typeof defVal !== 'undefined') {
    val=defVal;
    // On sauvegarde préventivement la valeur par défaut
    writeIni(file, section, key, defVal);
  }

  return wsh().ExpandEnvironmentStrings(val);
}

function readIniBool(file, section, key, defValue) {
  var ret, defVal='false';

  switch (typeof defValue) {
    case 'boolean':
        defVal=defValue?'true':'false';
        break;
    case 'number':
      defVal=(defValue === 0)?'false':'true';
      break;
    case 'string':
      defVal=(defValue === 'true' || defValue === 'yes' || defValue === 'on')?'true':'false';
      break;
    default:
      defVal='false';
  }

  ret=readIni(file, section, key, defVal);

  switch (typeof ret) {
    case 'boolean':
      return ret;
    case 'number':
      return (ret !== 0);
    case 'string':
      ret=ret.toLowerCase();
      if (ret === 'true' || ret === 'yes' || ret === 'on') return true;
      return false;
    default:
      return false;
  }
}


function writeLog(txt) {
  if (isJSOnly() || isHTA()) {
    var log;
    var logName="app.log";
    if (fso().FileExists(logName)) log=fso().OpenTextFile(logName, ForAppending);
    else log=fso().CreateTextFile(logName, ForWriting);
    log.writeline(txt);
    log.close();
  } else console.log(txt);
}

