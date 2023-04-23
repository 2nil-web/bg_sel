
OS=$(shell uname -s)

#CPPFLAGS += -U VERBOSE_MODE
CPPFLAGS += -D _WIN32_WINNT=0x0602
CXXFLAGS += -Wall -Wextra -std=c++20 -pedantic
#LDFLAGS += -static-libgcc -static-libstdc++
LDFLAGS  += -static
LDFLAGS  += -s -Os

PREFIX=monitorsinfo
SRCS=${PREFIX}.cpp
OBJS=$(SRCS:.cpp=.o)

# If not linux then assume that it is windows
ifneq (${OS},Linux)
#MSYSTEM=UCRT64
#MSYSTEM=CLANG64
MSYSTEM=MINGW64

ifeq (${MSYSTEM},MINGW64)
PATH:=/mingw64/bin:${PATH}
endif

ifeq (${MSYSTEM},UCRT64)
PATH:=/ucrt64/bin:${PATH}
LDFLAGS += -static
endif

# CLANG n'accepte pas les fichiers en ISO-8859
# Pour utiliser clang il faut passer par le shell clang64.exe de msys2
ifeq (${MSYSTEM},CLANG64)
PATH:=/clang64/bin:${PATH}
CC=clang++
CXX=clang++
LDFLAGS += -pthread -static
else
CC=gcc
CXX=g++
endif

EXEXT=.exe
#LDFLAGS += -mwindows
LDLIBS   +=  -lwsock32 -lws2_32 -luxtheme

PGF=$(subst \,/,$(subst C:\,/c/,$(PROGRAMFILES)))
PGF86=${PGF} (x86)
PATH:=${PATH}:${PGF86}/Inno Setup 6
PATH:=${PATH}:${PATH}:${PGF}/ImageMagick-7.1.0-Q16
PATH:=${PATH}:${PGF}/Inkscape/bin
PATH:=${PATH}:${HOME}/Progs/Inno Setup 6
PATH:=${PATH}:${HOME}/Progs/ImageMagick-7.1.0-portable-Q16-x64
PATH:=${PATH}:/c/UnixTools/bin

#LDLIBS   += -lurlmon
#LDLIBS   += -lwsock32 -lole32 -luuid -lcomctl32 -loleaut32
#OBJS += ${PREFIX}Res.o
else
CC=g++
LDFLAGS += -pthread
endif

MAGICK=magick
STRIP=strip
UPX=upx
GDB=gdb
RC=windres
LD=ld


TARGETS=${PREFIX}${EXEXT}

all : ${TARGETS}

${TARGETS} : ${OBJS}

${PREFIX}_res.o : ${PREFIX}.ico

strip : $(TARGETS)
	$(STRIP) $(TARGETS)

upx : strip
	$(UPX) $(TARGETS)

gdb :  $(TARGETS)
	$(GDB) $(TARGETS)

test : upx
	ls -l ${TARGETS} && ./${TARGETS} &
	
cfg :
	@type ${CC} ${CXX} ${LD} ${RC} ${STRIP} ${GDB} ${UPX} ${MAGICK}
	@echo -e "CPPFLAGS=${CPPFLAGS}\nCXXFLAGS=${CXXFLAGS}\nLDFLAGS=${LDFLAGS}\nLDLIBS=${LDLIBS}"
	@echo -e "SRCS ${SRCS}\nOBJS ${OBJS}\nTARGETS ${TARGETS}"

clean :
	rm -f $(OBJS) *~ $(TARGETS)

rclean :
	rm -f $(OBJS) *.d *~ $(TARGETS)


# Les régles qui suivent ne sont pas utiles quand on fait 'make clean'
ifneq ($(MAKECMDGOALS),rclean)
# Implicit rules

%.exe: %.o
	$(LINK.cpp) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.exe: %.c
	$(LINK.c) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.exe: %.cpp
	$(LINK.cc) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.ico : %.png
	${MAGICK} convert -background none $< $@

%.ico : %.svg
	${MAGICK} convert -background none $< $@

# Régles pour construire les fichier objet d'après les .rc
%.o : %.rc
	$(RC) $(CPPFLAGS) $< --include-dir . $(OUTPUT_OPTION)

%.d: %.c
	@echo Checking header dependencies from $<
	@$(COMPILE.c) -isystem /usr/include -MM $< >> $@

#	@echo "Building "$@" from "$<
%.d: %.cpp
	@echo Checking header dependencies from $<
	@$(COMPILE.cpp) -isystem /usr/include -MM $< >> $@

# Inclusion des fichiers de dépendance .d
ifdef OBJS
-include $(OBJS:.o=.d)
endif
endif

