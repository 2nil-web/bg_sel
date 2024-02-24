
#WITH_CURL=1
include ../header.mk

PREFIX=chgbg
SRCS=$(wildcard *.cpp)

ifeq (${WITH_CURL},)
SRCS:=$(filter-out wv-reg.cpp wv-curl.cpp wv-curleasy.cpp,${SRCS})
endif

ifeq (${OS},Linux)
SRCS:=$(filter-out wv-winapi.cpp,${SRCS})
else
OBJS=${PREFIX}_res.o
RES_SRC=${PREFIX}_res.rc
endif

OBJS+=$(SRCS:.cpp=.o)
TARGET=${PREFIX}${EXEXT}

.PHONY: FORCE

ifeq ($(DO_MSBUILD),1)
ARCH=x64
CONF=Release
MSVC_SLN=chgbg.sln

all: version_check.txt version.h ${PREFIX}.ico ${TARGET}

${TARGET} : ${ARCH}/${CONF}/${TARGET}
	cp ${ARCH}/${CONF}/${TARGET} .

${ARCH}/${CONF}/${TARGET} : ${PREFIX}.ico ${SRCS} ${RES_SRC}
	${MSBUILD} ${MSVC_SLN} -p:Configuration=${CONF}
else
all: version_check.txt version.h ${TARGET}

${TARGET} : ${OBJS}
	$(LINK.cc) ${OBJS} $(LOADLIBES) $(LDLIBS) -o $@
endif

#all : ${DEFAULT_TARGET}
#	@echo "All done ${DEFAULT_TARGET}"

gcc : all

${PREFIX}_res.o : ${PREFIX}.ico


strip : ${TARGET}
	$(STRIP) ${TARGET} | true

upx : strip
	$(UPX) ${TARGET} | true

ifeq ($(MAKECMDGOALS),deliv)
DLLDEPS=$(shell ldd ${TARGET} | sed "/\/windows\//Id;s/.*=> //;s/ .0x.*//" | sort -u | tr '\n' ' ')
endif

deliv : upx
ifneq ($(DLLDEPS),)
	@echo "Bringing DLL dependencies."
	@cp ${DLLDEPS} .
endif

clean :
	rm -f *~ *.d ${PREFIX}.ico *.o $(OBJS) $(TARGET)
ifeq ($(DO_MSBUILD),1)
	rm -rf ${ARCH}
endif

include ../rules.mk

