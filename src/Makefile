
# Manipulations à faire avant chaque livraison
# Vérifier les tags du repo :
#git ls-remote --tags origin
# Vérifier le tag local :
#git describe --abbrev=0 --tags
# Si on veux incrémenter la version, il faut poser un nouveau tag de version :
#git tag X.Y.Z
# Mais des fois le lightweight n'imprime pas dans le commit courant (pourquoi ?) alors il faut poser un annotated tag
#git tag -a X.Y.Z -m 'commentaire'
# Le pousser dans le repo :
#git push --tags
# Préparer ou faire la livraison :
# Pour s'assurer que le tag de version correct soit embarqué par IYCSetup
#make clean
# Pour construire le setup et le livrer
#make setup
# OU
#make deliv
# ==> Le .iss sera automatiquement mis à jour avec le tag de version et le setup construit.


VERS_CMD=git describe --abbrev=0 --tags
COMMIT_CMD=git rev-parse HEAD

ifeq ($(MAKECMDGOALS),setup)
VERS=$(shell ${VERS_CMD})
COMMIT=$(shell ${COMMIT_CMD})
endif

ifeq ($(MAKECMDGOALS),deliv)
VERS=$(shell ${VERS_CMD})
COMMIT=$(shell ${COMMIT_CMD})
app_pfx=IYCSetup
#VERS=$(shell sed -n '/^#define/s/.*MyAppVersion "\(.*\)"/\1/p' ../${app_pfx}.iss)

define artif_send
	@tput smso
	@echo "Delivering this build as ${app_pfx} $1 in the $(if $2,$2,official) channel."
	@tput rmso
	echo curl -k -H "X-JFrog-Art-Api:AKCp8hz3VgqUrHgeYcu3WJMCNnexyprejX9iiEiTzuTaLWaUXQLUgQyQzUGb2B6NXWout3FXa" -T ../${app_pfx}-$1.exe "https://artifactory.fr.eu.airbus.corp/1Y40/R-N265_IYCIS-Tools_generic_L/$(if $2,$2)/${app_pfx}/Windows/${app_pfx}-$1.exe"
	@curl -k -H "X-JFrog-Art-Api:AKCp8hz3VgqUrHgeYcu3WJMCNnexyprejX9iiEiTzuTaLWaUXQLUgQyQzUGb2B6NXWout3FXa" -T ../${app_pfx}-$1.exe "https://artifactory.fr.eu.airbus.corp/1Y40/R-N265_IYCIS-Tools_generic_L/$(if $2,$2)/${app_pfx}/Windows/${app_pfx}-$1.exe"
	@test -f Release_notes/${app_pfx}-$1.relnote.html && curl -k -H "X-JFrog-Art-Api:AKCp8hz3VgqUrHgeYcu3WJMCNnexyprejX9iiEiTzuTaLWaUXQLUgQyQzUGb2B6NXWout3FXa" -T Release_notes/${app_pfx}-$1.relnote.html "https://artifactory.fr.eu.airbus.corp/1Y40/R-N265_IYCIS-Tools_generic_L/$(if $2,$2)/${app_pfx}/${app_pfx}-$1.relnote.html" || true
	@echo
endef

define deliv
	$(call artif_send,$1,$2)
	$(call artif_send,latest,$2)
	@echo
endef
endif

HTMINIFY=html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true --continue-on-parse-error

COMPONENTS=app.css app_body.js app_head.js common.js app.min.hta app.nomin.hta
TARGET=../bg_imgsel.hta
TARGET_SETUP=../${app_pfx}.exe

all : ${TARGET}

#@"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" ../${app_pfx}-${VERS}.iss
${TARGET_SETUP} : ${TARGET}
	@echo "Generating YCSetup-${VERS}.iss"
	@sed 's/^#define MyAppVersion .*$\/#define MyAppVersion "${VERS}"/;s/^#define MyGitCommit .*$\/#define MyGitCommit "${COMMIT}"/' ../${app_pfx}.iss >../${app_pfx}-${VERS}.iss
	@ISCC.exe ../${app_pfx}-${VERS}.iss
	@rm -f ../${app_pfx}-${VERS}.iss
	@cp -f ../${app_pfx}-${VERS}.exe ../${app_pfx}-latest.exe

setup : ${TARGET_SETUP}

# Pour livrer dans le canal officiel il faut supprimer le dernier argument du call.
# Pour livrer dans le canal prerelease il faut ajouter comme dernier argument le mot "PRERELEASE" au call
deliv : setup
	@$(call deliv,${VERS},PRERELEASE)

${TARGET} : ${COMPONENTS}
	@mv app.min.hta ${TARGET}
	@mv app.nomin.hta ${TARGET:hta=debug.hta}
	@cp app.ico ..

app.min.hta : app.hta app.css app_body.js app_head.js

clean :
	rm -f app.min.hta app.nomin.hta ${TARGET} ${TARGET:hta=debug.hta}


%.min.hta : %.hta
	@echo "PREPROCESSING HTML $<"
	@rm -f ${<:.hta=.nomin.hta}
	@./htpp.sh $< ${<:.hta=.nomin.hta}
	@echo "Checking ${<:.hta=.nomin.hta}"
	@tidy ${<:.hta=.nomin.hta} || true
ifeq (${USERDOMAIN},NO_ANTIVIRUS)
	@echo "Embedding app icon"
	@sed -e 's/ icon=".*\.ico" / icon="\#" /i' ${<:.hta=.nomin.hta} | ${HTMINIFY} >${<:.hta=.nomin.hta}.tmp || true
	@ cat app.ico ${<:.hta=.nomin.hta}.tmp >${<:.hta=.nomin.hta}  && rm ${<:.hta=.nomin.hta}.tmp
endif
	@echo "MINIFYING HTML $<"
	@${HTMINIFY} ${<:.hta=.nomin.hta} > $@ || true
#	@rm -f ${<:.hta=.nomin.hta}

%.min.hta : %.nomin.hta
	@echo "MINIFYING HTML $<"
	@${HTMINIFY} $< > $@ || true

# Utile pour le debug
%.nomin.hta : %.hta
	@echo "PREPROCESSING HTML $<"
	@rm -f $@
	@./htpp.sh $< $@
	@echo "Checking $@"
	@tidy $@ || true

%.min.js : %.js
	@echo "MINIFYING JS $<"
	@rm -f $@
	@${JSMINIFY} $< > $@

