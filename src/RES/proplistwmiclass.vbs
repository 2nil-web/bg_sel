strComputer = "."
strNameSpace = "root\cimv2"
strClass = "Win32_Process"

WMIObj="winmgmts:{impersonationLevel=impersonate}!\\" & strComputer & "\" & strNameSpace & ":" & strClass
Set objClass = GetObject(WMIObj)

WScript.Echo strClass & " Class Properties"
WScript.Echo "------------------------------"
WScript.Echo objClass.Properties_.count

For Each objClassProperty In objClass.Properties_
    WScript.Echo objClassProperty.Name
Next
