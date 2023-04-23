
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

var strComputer='.',
    strNameSpace='root\\cimv2',
    strClass='Win32_Service', col=null, prc=null;
  
var loc=new ActiveXObject("WbemScripting.SWbemLocator");
var svc=loc.ConnectServer(".", "root\\cimv2");

//coll=svc.ExecQuery("select * from Win32_Service");;
coll=svc.ExecQuery("SELECT * FROM Win32_Service WHERE State='Running'");
var items = new Enumerator(coll);

while (!items.atEnd()) {
  WScript.Echo(items.item().Name);
  items.moveNext();
}
