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
gnome-extensions enable pc-info@brayanmonteiroo.github.io
```

Em Wayland, teste numa sessão aninhada:

```bash
dbus-run-session gnome-shell --devkit --wayland
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

## Licença

GPL-3.0-or-later — veja [LICENSE](LICENSE).
