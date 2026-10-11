UUID := pc-info@brayanmonteiroo.github.io
EXTENSIONS_DIR := $(HOME)/.local/share/gnome-shell/extensions
INSTALL_DIR := $(EXTENSIONS_DIR)/$(UUID)
ZIP := $(UUID).zip

.PHONY: schemas link install uninstall pack clean nested reload-help

schemas:
	glib-compile-schemas schemas/

# Development: symlink the repo (edit → close nested window → reopen nested).
# Do NOT run `gnome-extensions install` while using the symlink.
link: schemas
	mkdir -p "$(EXTENSIONS_DIR)"
	ln -sfn "$(CURDIR)" "$(INSTALL_DIR)"
	@echo "Linked $(INSTALL_DIR) -> $(CURDIR)"
	@echo "Next: make nested"

# Nested GNOME Shell — official Wayland workflow (no logout).
nested: link
	@./scripts/nested-shell.sh

# Copy install for “production-like” local use (not for rapid iteration).
install: schemas
	rm -rf "$(INSTALL_DIR)"
	mkdir -p "$(INSTALL_DIR)/lib" "$(INSTALL_DIR)/schemas"
	cp metadata.json extension.js prefs.js stylesheet.css LICENSE "$(INSTALL_DIR)/"
	cp lib/*.js "$(INSTALL_DIR)/lib/"
	cp schemas/org.gnome.shell.extensions.pc-info.gschema.xml schemas/gschemas.compiled "$(INSTALL_DIR)/schemas/"
	@echo "Installed copy to $(INSTALL_DIR)"

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

reload-help:
	@echo "Wayland (recomendado):"
	@echo "  1) make nested"
	@echo "  2) na sessão nested: gnome-extensions enable $(UUID)"
	@echo "  3) edite o código no repo (symlink)"
	@echo "  4) feche a janela nested e rode make nested de novo"
	@echo ""
	@echo "Prefs (prefs.js): basta fechar e abrir de novo — processo separado."
	@echo "X11 only: Alt+F2 → restart (não funciona no Wayland da sessão principal)."
