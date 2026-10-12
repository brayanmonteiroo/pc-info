# PC Info

Extensão do **GNOME Shell** com indicadores compactos na barra superior: uso e temperatura da CPU e da placa de vídeo, memória, rede, disco e outras métricas.

Nas preferências, o usuário só escolhe o que aparece na barra — nomes em português, sem jargão de sensores (`k10temp`, `amdgpu`, etc.). A coleta usa `/proc` e `/sys` (independente da distro).

## Compatibilidade

- GNOME Shell **45–51**
- Qualquer Linux com GNOME (Fedora, Arch, Ubuntu, etc.)
- Stack: JavaScript (GJS) + APIs do Shell

## Desenvolvimento

O fluxo oficial e **obrigatório** neste projeto é o **Mutter Development Kit**: um GNOME Shell nested numa janela. É assim que se desenvolve e testa a extensão — sem logout da sessão principal.

Referência: [Debugging extensions (gjs.guide)](https://gjs.guide/extensions/development/debugging.html).

### Dependência

```bash
# Fedora / RHEL
sudo dnf install mutter-devkit

# Arch
sudo pacman -S mutter-devkit
```

Sem o `mutter-devkit`, o nested no GNOME 49+ não funciona direito.

### Rodar localmente

```bash
./scripts/nested-shell.sh
```

O script compila os schemas, cria o symlink do repo em `~/.local/share/gnome-shell/extensions/` e abre o Shell nested.

Dentro da janela nested:

```bash
gnome-extensions enable pc-info@brayanmonteiroo.github.io
gnome-extensions prefs pc-info@brayanmonteiroo.github.io
```

### Ciclo de edição

1. Edite o código no repo (o nested lê via symlink)
2. Feche a janela nested
3. Rode `./scripts/nested-shell.sh` de novo
4. Habilite a extensão outra vez

O JS do Shell não faz hot-reload: cada mudança exige um processo novo — o nested é esse processo.

`prefs.js` roda em processo separado: em geral basta fechar e reabrir as preferências.

### Empacotar (EGO)

```bash
./scripts/pack-extension.sh
# ou: make pack
```

Gera `pc-info@brayanmonteiroo.github.io.zip` para [extensions.gnome.org](https://extensions.gnome.org/). Inclui schemas e traduções compiladas (`locale/`), sem fontes `.po`.

### Traduções

- Strings no código em **inglês** (msgid)
- `po/pt_BR.po` e `po/pt.po` para português
- Outros idiomas usam o inglês automaticamente

```bash
./scripts/compile-locales.sh   # gera locale/ para o symlink local
```

### CI

No GitHub Actions (e localmente):

```bash
./scripts/ci-check.sh
# ou: make ci
```

Valida `metadata.json`, compila schemas, gera o ZIP e confere o conteúdo + sintaxe JS. Releases a partir da tag `v*` publicam o ZIP automaticamente.

## Licença

**GPL-3.0-or-later** — veja [LICENSE](LICENSE).

Extensões do GNOME Shell são obras derivadas do Shell (GPL); a distribuição precisa de licença compatível.
