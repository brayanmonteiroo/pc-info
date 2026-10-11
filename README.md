# PC Info

Extensão do GNOME Shell com indicadores compactos na barra superior.

Mostra uso e temperatura da CPU e da placa de vídeo, memória e outras métricas — com preferências simples em português, sem nomes técnicos de sensores.

## Compatibilidade

- GNOME Shell **45–51**
- Qualquer distro Linux com GNOME (Fedora, Arch, Ubuntu, etc.)
- Coleta via `/proc` e `/sys` (sem depender de pacotes da distro)

## Instalação (desenvolvimento)

```bash
make install
# Em Wayland a sessão precisa recarregar para descobrir a extensão nova:
# saia e entre de novo, ou use a sessão nested abaixo.
gnome-extensions enable pc-info@brayanmonteiroo.github.io
```

`make install` **copia** os arquivos (não usa symlink), para não apagar o repositório se o `gnome-extensions install` substituir o diretório.

Em Wayland, teste numa sessão aninhada (recomendado):

```bash
dbus-run-session gnome-shell --devkit --wayland
# dentro da sessão nested:
gnome-extensions enable pc-info@brayanmonteiroo.github.io
```

Abra as preferências:

```bash
gnome-extensions prefs pc-info@brayanmonteiroo.github.io
```

Após alterar o código, rode `make install` de novo e recarregue a extensão (ou a sessão nested).

## Empacotar

```bash
make pack
```

Gera `pc-info@brayanmonteiroo.github.io.zip` para upload em [extensions.gnome.org](https://extensions.gnome.org/).

## Publicar o repositório no GitHub

Com o remote `origin` apontando para `git@github.com:brayanmonteiroo/pc-info.git`:

```bash
gh auth login   # se ainda não autenticou a API
gh repo create brayanmonteiroo/pc-info --public --source=. --remote=origin --push
```

Ou crie o repositório vazio em https://github.com/new e depois:

```bash
git push -u origin main
```

## Licença

GPL-3.0-or-later — veja [LICENSE](LICENSE).
