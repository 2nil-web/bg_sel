
#include <windows.h>
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

IDesktopWallpaper* pdw=NULL;

void MonitInfo() {
  unsigned int n;
  if (SUCCEEDED(pdw->GetMonitorDevicePathCount(&n))) {
    unsigned int i;
    LPTSTR id[MAX_STR], wp[MAX_STR];
    RECT rc;
    wprintf(L"monitors info:\n");

    for (i=0; i < n; i++) {
      if (SUCCEEDED(pdw->GetMonitorDevicePathAt(i, id))) {
        wprintf(L"  number %d\n    id: %ls\n", i, (LPTSTR)*id);

        if (SUCCEEDED(pdw->GetWallpaper((LPCTSTR)*id, wp))) {
          wprintf(L"    name: %ls\n", (LPTSTR)*wp);
        }

        if (SUCCEEDED(pdw->GetMonitorRECT ((LPCTSTR)*id, &rc))) {
          wprintf(L"    rect: left %d, top %d, right %d bottom %d\n", rc.left, rc.top, rc.right, rc.bottom);
        }
      }
    }
  }
}

size_t StringLength(const TCHAR *s) {
  size_t l;
  StringCchLength(s, STRSAFE_MAX_CCH, &l);
  return l;
}

#define die(msg) { win_error(msg); return 0; }

int WINAPI WinMain(HINSTANCE, HINSTANCE, LPSTR, int) {
  if (FAILED(CoInitialize(NULL))) die("CoInitialize");
  if (FAILED(CoCreateInstance(__uuidof(DesktopWallpaper), NULL, CLSCTX_LOCAL_SERVER, __uuidof(IDesktopWallpaper), (void**)&pdw))) die("CoCreateInstance");

  int ac, i, j;
  bool ci=false, mi=false;
  LPTSTR *av=CommandLineToArgvW(GetCommandLine(), &ac);

  for (i=0; i < ac; i++) {
    if (av[i][0]=='-') {
      size_t l=StringLength(av[i]);
      for(j=1; j < l; j++) {
        if (av[i][j]=='n') ci=true;
        else if (av[i][j]=='m') mi=true;
      }
    }
  }

  if (ci && FAILED(pdw->AdvanceSlideshow(NULL, DESKTOP_SLIDESHOW_DIRECTION::DSD_FORWARD))) die("AdvanceSlideshow");
  if (mi) MonitInfo();

  pdw->Release();
  CoUninitialize();

  return 0;
}

