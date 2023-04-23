
// Expose methods supported by IE 9 JScript engine (trim, indexOf, forEach ...)
if (typeof document === 'undefined') {
var ht = WSH.CreateObject('htmlfile');
  ht.write('<meta http-equiv="x-ua-compatible" content="IE=9" />');
  var window=ht.parentWindow;
  var JSON=window.JSON;
  Array=window.Array;
  Object=window.Object;
  ht.close(); // no longer needed
}

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

// demonstrate JSON.parse() and String.trim()
var strJSON = '{ "item1": "          val1 needs trimmed.          " }';
var objFromJSON = JSON.parse(strJSON);
Object.keys(objFromJSON).forEach(function (key, idx) { WSH.Echo(idx+':'+key+':'+objFromJSON[key]); });

function GetScriptEngineInfo() {
  return ScriptEngine()+" Engine Version: "+ScriptEngineMajorVersion()+"."+ScriptEngineMinorVersion()+"."+ScriptEngineBuildVersion();
}

function GetJScriptConditionalInfo() {
  // Set conditional compilation so @_jscript_version variable will be defined.
  @cc_on
  // Display the JScript verision number using the @_jscript_version variable
  return ScriptEngine()+" Conditional Version: "+@_jscript_version;
}

WSH.Echo(GetScriptEngineInfo());
WSH.Echo(GetJScriptConditionalInfo());

function disp(val, idx, arr) {
  WSH.Echo(idx+':'+val+':'+arr[val]);
}

// test object
var obj = {
    "line1" : "The quick brown fox",
    "line2" : "jumps over the lazy dog."
};

Object.keys(obj).forEach(function (key, idx) { WSH.Echo(idx+':'+key+':'+obj[key]); });

var obj2 = [];
obj2=[ "The quick brown fox", "jumps over the lazy dog." ];
Object.keys(obj2).forEach(function (key) { WSH.Echo(key+':'+obj2[key]); });

WSH.Echo(WSH.Arguments.Count());

var toto="    tutu  ";
WSH.Echo('['+toto+']');
WSH.Echo('['+toto.trim()+']');

