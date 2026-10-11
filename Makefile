UUID := pc-info@brayanmonteiroo.github.io
EXTENSIONS_DIR := $(HOME)/.local/share/gnome-shell/extensions
INSTALL_DIR := $(EXTENSIONS_DIR)/$(UUID)
ZIP := $(UUID).zip

.PHONY: schemas install uninstall pack clean

schemas:
	glib-compile-schemas schemas/

# Copy (do not symlink): avoids wiping the repo if gnome-extensions install
# replaces the extension directory.
install: schemas
	mkdir -p "$(INSTALL_DIR)"
	rm -rf "$(INSTALL_DIR)"
	mkdir -p "$(INSTALL_DIR)/lib" "$(INSTALL_DIR)/schemas"
	cp metadata.json extension.js prefs.js stylesheet.css LICENSE "$(INSTALL_DIR)/"
	cp lib/*.js "$(INSTALL_DIR)/lib/"
	cp schemas/org.gnome.shell.extensions.pc-info.gschema.xml schemas/gschemas.compiled "$(INSTALL_DIR)/schemas/"
	@echo "Installed to $(INSTALL_DIR)"
	@echo "Enable with: gnome-extensions enable $(UUID)"

uninstall:
	rm -rf "$(INSTALL_DIR)"
	@echo "Removed $(INSTALL_DIR)"

pack: schemas
	rm -f "$(ZIP)"
	zip -r "$(ZIP)" \
		metadata.json \
		extension.js \
		prefs.js \
		stylesheet.css \
		LICENSE \
		schemas/org.gnome.shell.extensions.pc-info.gschema.xml \
		schemas/gschemas.compiled \
		lib/*.js
	@echo "Created $(ZIP)"

clean:
	rm -f "$(ZIP)"
