FROM node:lts

# install NeoVim
RUN curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim.appimage && \
    chmod +x nvim.appimage && \
    ./nvim.appimage --appimage-extract && \
    ln -s /squashfs-root/AppRun /usr/bin/nvim

# set default shell to bash for NeoVim
ENV SHELL=bash

# install ripgrep for Telescope.nvim (Live Grep Support)
RUN apt update && apt install -y ripgrep

# install Lazy (NeoVim Distro)
RUN git clone https://github.com/LazyVim/starter ~/.config/nvim
