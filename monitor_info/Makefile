
CPPFLAGS += -D _WIN32_WINNT=0x0602
include ../header.mk

PREFIX=monitorsinfo
SRCS=$(wildcard *.cpp)

OBJS+=$(SRCS:.cpp=.o)
TARGET=${PREFIX}${EXEXT}

.PHONY: FORCE

ifeq ($(DO_MSBUILD),1)
ARCH=x64
CONF=Release
MSVC_SLN=monitorsinfo.sln

all: version_check.txt version.h ${TARGET}

${TARGET} : ${ARCH}/${CONF}/${TARGET}
	cp ${ARCH}/${CONF}/${TARGET} .

${ARCH}/${CONF}/${TARGET} : ${SRCS} ${RES_SRC}
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

deliv : upx

clean :
	rm -f *~ *.d ${PREFIX}.ico *.o $(OBJS) $(TARGET)
ifeq ($(DO_MSBUILD),1)
	rm -rf ${ARCH}
endif

include ../rules.mk

