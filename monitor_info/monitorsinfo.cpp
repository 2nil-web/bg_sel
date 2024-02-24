
# include <iostream>
# include <vector>

#include <windows.h>

int i;
BOOL CALLBACK MonitorEnumProc(HMONITOR monitor, HDC /*hdc*/, LPRECT /*rect*/, LPARAM /*data*/) {
  MONITORINFOEX mi;
  
  mi.cbSize=sizeof(MONITORINFOEX);
  GetMonitorInfo(monitor, &mi);
  std::cout << "Monitor " << i++ << ", device name ";
  std::wcout << mi.szDevice;
  std::cout << " area ("<< mi.rcMonitor.left   << ", " << mi.rcMonitor.top    << ", " << mi.rcMonitor.right  << ", " << mi.rcMonitor.bottom << ")";
  std::cout << ", working area ("<< mi.rcWork.left   << ", " << mi.rcWork.top    << ", " << mi.rcWork.right  << ", " << mi.rcWork.bottom << ")";
  std::cout << ", flag " << mi.dwFlags;
  if (mi.dwFlags == MONITORINFOF_PRIMARY) std::cout << ", is primary monitor.";
  std::cout << std::endl;
  return TRUE;
}

void DisplayMonitors() {
  i=0;
  EnumDisplayMonitors(nullptr, nullptr, MonitorEnumProc, (LPARAM)nullptr);
}

void add_dd(DWORD st, DWORD idd, std::string& s, const std::string sdd) {
  if (st & idd) {
    if (s != "") s +=" and ";
    s += sdd;
  }
}

std::string state_tostring(DWORD st) {
  std::string s="";

  if (st != 0) {
    add_dd(st, DISPLAY_DEVICE_ACTIVE, s, "is active");
    add_dd(st, DISPLAY_DEVICE_MIRRORING_DRIVER, s, "has mirroring driver");
    add_dd(st, DISPLAY_DEVICE_MODESPRUNED, s, "has more display modes than its output devices support");
    add_dd(st, DISPLAY_DEVICE_PRIMARY_DEVICE, s, "is primary device for desktop");
    add_dd(st, DISPLAY_DEVICE_REMOVABLE, s, "is removable so cannot be primary display");
    add_dd(st, DISPLAY_DEVICE_VGA_COMPATIBLE, s, "is vga compatible");
    add_dd(st, DISPLAY_DEVICE_ATTACHED_TO_DESKTOP, s, "is attached to desktop");
    add_dd(st, DISPLAY_DEVICE_MULTI_DRIVER, s, "is multi driver");
    add_dd(st, DISPLAY_DEVICE_ACC_DRIVER, s, "is acc driver");
    add_dd(st, DISPLAY_DEVICE_TS_COMPATIBLE, s, "is ts compatible");
    add_dd(st, DISPLAY_DEVICE_UNSAFE_MODES_ON, s, "is unsafe modes_on");
    add_dd(st, DISPLAY_DEVICE_RDPUDD, s, "is rdpudd");
    add_dd(st, DISPLAY_DEVICE_REMOTE, s, "is remote");
    add_dd(st, DISPLAY_DEVICE_DISCONNECT, s, "is disconnected");
    if (!st&DISPLAY_DEVICE_ATTACHED_TO_DESKTOP) add_dd(st, DISPLAY_DEVICE_ATTACHED, s, "is attached");
    if (s != "") s="it "+s;
  } else s="does not seem to be active";

  return s;
}

// DevType Adapter or Monitor
void DumpDevice(const DWORD num, const std::string DevType, const DISPLAY_DEVICE dd) {
//  if (dd.StateFlags != 0) {
    std::cout
      << DevType << " number: " <<  num << ", name: ";
    std::wcout
      << dd.DeviceName
      << L"\n  model: "  <<  dd.DeviceString;
    std::cout
      << "\n  state: "  <<  state_tostring(dd.StateFlags);
    std::wcout
      << "\n  ID: "     <<  dd.DeviceID
      << "\n  Key: ..." <<  dd.DeviceKey+42 << std::endl;
//  }
}

void DisplayDevices() {
  DISPLAY_DEVICE ad;
  ad.cb=sizeof(DISPLAY_DEVICE);

  DISPLAY_DEVICE mn;
  mn.cb=sizeof(DISPLAY_DEVICE);
  DWORD monitorNum;

  DWORD deviceNum=0;
  while (EnumDisplayDevices(NULL, deviceNum, &ad, 0)) {
    DumpDevice(deviceNum, "Adapter", ad);
    monitorNum=0; while (EnumDisplayDevices(ad.DeviceName, monitorNum, &mn, 0)) DumpDevice(monitorNum++, "Monitor", mn);
    std::cout << std::endl;
    deviceNum++;
  }
}

//int WINAPI WinMain (HINSTANCE /*hInstance*/, HINSTANCE /*hPrevInstance*/, LPSTR /*lpCmdLine*/, int /*nShowCmd*/) {
int main() {
  DisplayMonitors();
  std::cout << std::endl;
  DisplayDevices();
  return 0;
}

