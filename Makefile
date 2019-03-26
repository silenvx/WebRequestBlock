SRC = src
$(eval NAME = $(shell grep '"name"' $(SRC)/manifest.json|sed -e 's/.*"name"[^"]*"//'|sed -e 's/"[^"]*//'))
$(eval VERSION = $(shell grep '"version"' $(SRC)/manifest.json|sed -e 's/.*"version"[^"]*"//'|sed -e 's/"[^"]*//'))
DIST = "./dist/$(NAME)-$(VERSION).zip"
FILES = ./LICENSE ./background.js ./false.png ./img ./manifest.json ./options ./popup ./true.png

dist:
	mkdir -p dist
	cd $(SRC);zip -r ../$(DIST) $(FILES)
