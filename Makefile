UUID := pc-info@brayanmonteiroo.github.io
EXTENSIONS_DIR := $(HOME)/.local/share/gnome-shell/extensions
INSTALL_DIR := $(EXTENSIONS_DIR)/$(UUID)
ZIP := $(UUID).zip

.PHONY: schemas locales link install uninstall pack clean nested reload-help ci

schemas:
	glib-compile-schemas schemas/

locales:
	@./scripts/compile-locales.sh

# Development: symlink the repo (edit → close nested window → reopen nested).
# Do NOT run `gnome-extensions install` while using the symlink.
link: schemas locales
	@./scripts/link-extension.sh
	@echo "Next: ./scripts/nested-shell.sh   (or: make nested)"

# Nested GNOME Shell — official Wayland workflow (no logout).
nested: link
	@./scripts/nested-shell.sh

# Copy install for “production-like” local use (not for rapid iteration).
install: schemas locales
	rm -rf "$(INSTALL_DIR)"
	mkdir -p "$(INSTALL_DIR)/lib" "$(INSTALL_DIR)/schemas" "$(INSTALL_DIR)/locale"
	cp metadata.json extension.js prefs.js stylesheet.css LICENSE "$(INSTALL_DIR)/"
	cp lib/*.js "$(INSTALL_DIR)/lib/"
	cp schemas/org.gnome.shell.extensions.pc-info.gschema.xml schemas/gschemas.compiled "$(INSTALL_DIR)/schemas/"
	cp -a locale/. "$(INSTALL_DIR)/locale/"
	@echo "Installed copy to $(INSTALL_DIR)"

uninstall:
	rm -rf "$(INSTALL_DIR)"
	@echo "Removed $(INSTALL_DIR)"

pack: schemas
	@./scripts/pack-extension.sh

# Lightweight package checks (same as GitHub Actions CI).
ci:
	@./scripts/ci-check.sh

clean:
	rm -f "$(ZIP)"
	rm -rf locale/

reload-help:
	@echo "Wayland (recomendado):"
	@echo "  1) make nested"
	@echo "  2) na sessão nested: gnome-extensions enable $(UUID)"
	@echo "  3) edite o código no repo (symlink)"
	@echo "  4) feche a janela nested e rode make nested de novo"
	@echo ""
	@echo "Prefs (prefs.js): basta fechar e abrir de novo — processo separado."
	@echo "X11 only: Alt+F2 → restart (não funciona no Wayland da sessão principal)."
