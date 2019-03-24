$(eval NAME = $(shell grep '"name"' manifest.json|sed -e 's/.*"name"[^"]*"//'|sed -e 's/"[^"]*//'))
$(eval VERSION = $(shell grep '"version"' manifest.json|sed -e 's/.*"version"[^"]*"//'|sed -e 's/"[^"]*//'))
DIST = "dist/$(NAME)-$(VERSION).zip"
FILES = ./LICENSE ./background.js ./false.png ./img ./manifest.json ./options ./popup ./true.png

dist: $(FILES)
	mkdir -p dist
	zip -r $(DIST) $(FILES)
