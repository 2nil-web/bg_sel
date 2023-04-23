

all :
	cd src && make
	cd chgbg && make upx && cp chgbg.exe .. && cp chgbg.exe ../src
