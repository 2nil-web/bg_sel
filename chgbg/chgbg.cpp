
//#include <iostream>
//#include <string>

#include <windows.h>
#include <shlwapi.h>
#include <shobjidl.h>
#include <strsafe.h>
#include <stringapiset.h>

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

  if (SUCCEEDED(hr)) {
    if (strlen(lpCmdLine)>0) {
      DESKTOP_SLIDESHOW_DIRECTION dir;

      if (strcmp(lpCmdLine, "1")==0 || _strcmpi(lpCmdLine, "FORWARD")==0) {
        dir=DESKTOP_SLIDESHOW_DIRECTION::DSD_FORWARD;
        printf("Next");
      } else {
        dir=DESKTOP_SLIDESHOW_DIRECTION::DSD_BACKWARD;
        printf("Previous");
      }

      puts(" background.");
      pdw->AdvanceSlideshow(NULL, dir);
      Sleep(1000);
    }

    unsigned int n;
    if (SUCCEEDED(pdw->GetMonitorDevicePathCount(&n))) {
      unsigned int i;
      LPTSTR id[MAX_PATH], wp[MAX_PATH];

      for (i=0; i < n; i++) {
        if (SUCCEEDED(pdw->GetMonitorDevicePathAt(i, id))) {
          wprintf(L"monitor number %d, id: %ls", i, (LPTSTR)*id);

          if (SUCCEEDED(pdw->GetWallpaper((LPCTSTR)*id, wp))) {
            wprintf(L", name: %ls", (LPTSTR)*wp);
          }

          puts(".");
        }
      }
    }

    pdw->Release();
  }

  return 0;
}

