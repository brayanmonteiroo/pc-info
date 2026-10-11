# PC Info

Extensão do GNOME Shell com indicadores compactos na barra superior.

Mostra uso e temperatura da CPU e da placa de vídeo, memória e outras métricas — com preferências simples em português, sem nomes técnicos de sensores.

## Compatibilidade

- GNOME Shell **45–51**
- Qualquer distro Linux com GNOME (Fedora, Arch, Ubuntu, etc.)
- Coleta via `/proc` e `/sys` (sem depender de pacotes da distro)

## Desenvolvimento (sem sair da sessão)

No Wayland **não dá** para reiniciar o GNOME Shell da sessão principal sem logout. A prática oficial do GNOME é usar uma **sessão nested**: um GNOME Shell numa janela, isolado via D-Bus.

Referência: [Debugging extensions (gjs.guide)](https://gjs.guide/extensions/development/debugging.html).

### Fluxo rápido

Sem `make` instalado:

```bash
./scripts/nested-shell.sh
```

Com `make`:

```bash
sudo dnf install make   # uma vez
make nested
```

Isso:

1. Compila os schemas
2. **Remove** qualquer cópia antiga e cria um **symlink** do repo em `~/.local/share/gnome-shell/extensions/`
3. Abre um GNOME Shell nested (`--devkit` no GNOME 49+)

Dentro da janela nested (abra um terminal lá):

```bash
gnome-extensions enable pc-info@brayanmonteiroo.github.io
gnome-extensions prefs pc-info@brayanmonteiroo.github.io
```

Depois de editar o código:

1. **Feche** a janela nested  
2. Rode `make nested` de novo  

Não precisa sair da sua sessão principal. O symlink faz o nested ler o código do repo direto (sem `make install` a cada mudança).

### Por que não hot-reload?

O motor JavaScript do Shell **não descarrega** módulos. Qualquer mudança em `extension.js` / `lib/` exige um **novo processo** `gnome-shell`. Nested = processo novo em segundos. Logout = a mesma ideia, só que pior.

### Prefs

`prefs.js` roda em **outro processo**. Em geral basta fechar e abrir as preferências de novo — sem reiniciar o Shell.

### Logs

No terminal onde rodou `make nested`:

```bash
# já exporta SHELL_DEBUG=backtrace-warnings no script
journalctl --user -f -o cat /usr/bin/gnome-shell   # sessão principal
```

### Instalação “cópia” (uso normal, não iteração)

```bash
make install
```

Copia os arquivos (não usa symlink). Use isso se for usar `gnome-extensions install` com ZIP — **não** misture com o symlink do `make nested`.

## Empacotar

```bash
make pack
```

Gera `pc-info@brayanmonteiroo.github.io.zip` para [extensions.gnome.org](https://extensions.gnome.org/).

## Publicar no GitHub

```bash
gh auth login
gh repo create brayanmonteiroo/pc-info --public --source=. --remote=origin --push
```

Ou crie o repo vazio e: `git push -u origin main`.

## Licença

GPL-3.0-or-later — veja [LICENSE](LICENSE).
