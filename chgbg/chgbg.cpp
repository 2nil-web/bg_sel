
//#include <iostream>
//#include <string>

#include <windows.h>
#include <shlwapi.h>
#include <shobjidl.h>
#include <strsafe.h>
#include <stringapiset.h>

void win_error() {
  static TCHAR *lpMsgBuf=NULL;
  DWORD len;

  if (lpMsgBuf != NULL) LocalFree(lpMsgBuf);
  len=FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM, NULL, GetLastError(),
      MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR)&lpMsgBuf, 0, NULL);

//  lpMsgBuf[len-2]='\0';
  wprintf(L"%ls\n", (LPTSTR)lpMsgBuf);
  //MessageBox(NULL, (LPTSTR)lpMsgBuf, L"chgbg", MB_OK);
}

size_t StringLength(const TCHAR *s) {
  size_t l;
  StringCchLength(s, STRSAFE_MAX_CCH, &l);
  return l;
}

int StringEmpty(const TCHAR *s) {
  return (StringLength(s) == 0);
}

int WINAPI WinMain( HINSTANCE , HINSTANCE , LPSTR lpCmdLine, int  ) {
  HRESULT hr=CoInitialize(NULL);
  IDesktopWallpaper* pdw=NULL;

  hr=CoCreateInstance(__uuidof(DesktopWallpaper), NULL, CLSCTX_ALL, IID_PPV_ARGS(&pdw));

//  LPTSTR *av=CommandLineToArgvW(GetCommandLine(), &ac);
  LPTSTR id[MAX_PATH];

  if (SUCCEEDED(hr)) {
    
    if (strlen(lpCmdLine) > 0) {
      DESKTOP_SLIDESHOW_DIRECTION dir;

      if (_strcmpi(lpCmdLine, "next")==0) {
        dir=DESKTOP_SLIDESHOW_DIRECTION::DSD_FORWARD;
        printf("Next");
      } else {
        dir=DESKTOP_SLIDESHOW_DIRECTION::DSD_BACKWARD;
        printf("Previous");
      }

      hr=pdw->AdvanceSlideshow(NULL, dir);
      puts(".");

      if (hr != S_OK) win_error();
      Sleep(1000);
    }

    unsigned int n;
    if (SUCCEEDED(pdw->GetMonitorDevicePathCount(&n))) {
      unsigned int i;
      LPTSTR wp[MAX_PATH];

      wprintf(L"monitors info:\n");
      RECT rc;

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

    pdw->Release();
  }

  return 0;
}

