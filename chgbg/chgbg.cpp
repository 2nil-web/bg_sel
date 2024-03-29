
// Compile en clang64 ou ucrt64 mais pas mingw64

#include <windows.h>
#include <shellapi.h>
#include <shlwapi.h>
#include <shobjidl.h>
#include <strsafe.h>
#include <stringapiset.h>

#define MAX_STR 10000

void win_error(const char *t) {
  static wchar_t *lpMsgBuf=NULL;
  DWORD len;

  if (lpMsgBuf != NULL) LocalFree(lpMsgBuf);
  len=FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM, NULL, GetLastError(),
      MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR)&lpMsgBuf, 0, NULL);

  lpMsgBuf[len-2]='\0';
  printf("%s", t);
  wprintf(L": %ls\n", (LPTSTR)lpMsgBuf);
  //MessageBox(NULL, (LPTSTR)lpMsgBuf, TEXT(t), MB_OK);
}


IDesktopWallpaper* pdw=nullptr;
void MonitInfo() {
  unsigned int n;

  if (pdw->GetMonitorDevicePathCount(&n) == S_OK) {
    unsigned int i;
    LPWSTR  id[MAX_STR], wp[MAX_STR];
    RECT rc;
    wprintf(L"monitors info:\n");

    for (i=0; i < n; i++) {
      if (pdw->GetMonitorDevicePathAt(i, id) == S_OK) {
        wprintf(L"  number %d\n    id: %ls\n", i, (LPTSTR)*id);

        if (pdw->GetWallpaper(*id, wp) == S_OK) {
          wprintf(L"    name: %ls\n", (LPTSTR)*wp);
        }

        if (pdw->GetMonitorRECT (*id, &rc) == S_OK) {
          wprintf(L"    rect: left %d, top %d, right %d bottom %d\n", rc.left, rc.top, rc.right, rc.bottom);
        }
      }
    }
  }
}

size_t StringLength(TCHAR *s) {
  size_t l;
  StringCchLength(s, STRSAFE_MAX_CCH, &l);
  return l;
}

#define die(msg) { win_error(msg); return 0; }

#ifdef _MSC_VER
#    pragma comment(linker, "/subsystem:windows /ENTRY:mainCRTStartup")
#endif
//int WINAPI WinMain(HINSTANCE, HINSTANCE, LPSTR, int) {
int main(int argc, char **argv) {
  if (FAILED(CoInitialize(NULL))) die("CoInitialize");
  if (FAILED(CoCreateInstance(__uuidof(DesktopWallpaper), NULL, CLSCTX_LOCAL_SERVER, __uuidof(IDesktopWallpaper), (void**)&pdw))) die("CoCreateInstance");
  bool ci=false, mi=false;

  for (int i=0; i < argc; i++) {
    if (argv[i][0]=='-') {
      size_t l=strlen(argv[i]);
      for(size_t j=1; j < l; j++) {
        if (argv[i][j]=='n') ci=true;
        else if (argv[i][j]=='m') mi=true;
      }
    }
  }

  if (ci && FAILED(pdw->AdvanceSlideshow(NULL, DESKTOP_SLIDESHOW_DIRECTION::DSD_FORWARD))) die("AdvanceSlideshow");
  if (mi) MonitInfo();

  pdw->Release();
  CoUninitialize();

  return 0;
}

