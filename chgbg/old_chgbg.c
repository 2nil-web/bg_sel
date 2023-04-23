#include <windows.h>
#include <gdiplus.h>
#include "resource.h"

//variables
HWND hwnd01, label01;
HBITMAP hBitmap01=NULL;


using namespace Gdiplus;

// D:\Users\casal\Pictures\Background\aagtubxnrddoovcy.jpg
// BMP, GIF, JPEG, PNG, TIFF, Exif, WMF, and EMF
HBITMAP mLoadImageFile(wchar_t *filename) {
  HBITMAP hb=(HBITMAP)LoadImage(NULL, filename, IMAGE_BITMAP, 0, 0, LR_LOADFROMFILE);
  if (hb==NULL) {
    GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR           gdiplusToken;
    GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);
    hb=NULL;
    Bitmap bitmap(filename, false);
    bitmap.GetHBITMAP(0, &hb);
   	GdiplusShutdown(gdiplusToken);
  }

  return hb;
}

LRESULT CALLBACK WndProc( HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam ) {
  switch(msg) {
    case WM_CREATE: {
      CreateWindow(TEXT("button"), TEXT("Change Background"),
         WS_VISIBLE | WS_CHILD ,
         20, 50, 140, 25,
         hwnd, (HMENU) 1, NULL, NULL);

      CreateWindow(TEXT("button"), TEXT("Quit"),
         WS_VISIBLE | WS_CHILD ,
         190, 50, 80, 25,
         hwnd, (HMENU) 2, NULL, NULL);
      label01=CreateWindow(TEXT("Edit"), TEXT("Label"),
         WS_VISIBLE | WS_CHILD,
         20, 10, 400, 25,
         hwnd, (HMENU) 3, NULL, NULL);
      break;
    }

    case WM_COMMAND: {
      if (LOWORD(wParam) == 1) {
         TCHAR* string01=new TCHAR[3000];

          GetWindowText(label01, string01, 3000);
          hBitmap01=mLoadImageFile(string01);

          if (hBitmap01==NULL) MessageBox(NULL, L"Error Loading Image.", L"ERROR", MB_ICONWARNING | MB_DEFBUTTON2);
          else InvalidateRect(hwnd01, NULL, TRUE);
      }

      if (LOWORD(wParam) == 2) {
        PostQuitMessage(0);
      }

      break;
    }

    case WM_PAINT: {
      PAINTSTRUCT     ps01;
      HDC             hdc01;
      BITMAP          bitmap01;
      HDC             hdcMem01;
      HGDIOBJ         oldBitmap01;

      hdc01=BeginPaint(hwnd01, &ps01);

      hdcMem01=CreateCompatibleDC(hdc01);
      oldBitmap01=SelectObject(hdcMem01, hBitmap01);

      GetObject(hBitmap01, sizeof(bitmap01), &bitmap01);
      BitBlt(hdc01, 0, 0, bitmap01.bmWidth, bitmap01.bmHeight, hdcMem01, 0, 0, SRCCOPY);

      SelectObject(hdcMem01, oldBitmap01);
      DeleteDC(hdcMem01);

      EndPaint(hwnd01, &ps01);

      break;
    }

    case WM_DESTROY: {
      PostQuitMessage(0);
      break;
    }
  }

  return DefWindowProc(hwnd, msg, wParam, lParam);
}

int WINAPI WinMain( HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow ) {
  MSG  msg ;
  WNDCLASS wc;
  wc.style=0;
  wc.cbClsExtra=0;
  wc.cbWndExtra=0;
  wc.hIcon=LoadIcon(hInstance, MAKEINTRESOURCE(IDI_MAINICON));
  wc.lpszClassName=TEXT( "GUI01" );
  wc.hInstance    =hInstance ;
  wc.hbrBackground=GetSysColorBrush(COLOR_3DFACE);
  wc.lpfnWndProc  =WndProc ;
  wc.hCursor      =LoadCursor(0, IDC_ARROW);


  RegisterClass(&wc);
  hwnd01=CreateWindow( wc.lpszClassName, TEXT("GUI01 Headline"),
    WS_OVERLAPPEDWINDOW | WS_VISIBLE,
    150, 150, 500, 150, 0, 0, hInstance, 0);

  while( GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }
  return (int) msg.wParam;
}

