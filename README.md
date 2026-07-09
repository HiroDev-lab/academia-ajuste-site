# Academia Ajuste — Site Institucional

Site institucional da **Rede Academia Ajuste**, uma rede de academias do Paraná (Curitiba/Xaxim, Campo Mourão, Toledo, Guarapuava e Ponta Grossa).

Desenvolvido do zero em **HTML, CSS e JavaScript puro** (zero frameworks, zero build step) — foco em performance, animações fluidas e uma experiência que carrega rápido em qualquer dispositivo.

🔗 **No ar:** [academiaajuste.com.br](https://academiaajuste.com.br)

---

## ✨ Destaques técnicos

- **100% vanilla** — sem React, sem bundler, sem dependências. Só os navegadores e três arquivos (`.html` / `.css` / `.js`).
- **Multipágina** — Home, A Ajuste, Modalidades, Unidades, Blog e 4 artigos de blog, com navbar e rodapé compartilhados.
- **Animações sob medida** feitas à mão:
  - Fundo com *blobs* de gradiente em movimento contínuo + varredura de brilho (*sheen*).
  - Entradas com *reveal* no scroll (IntersectionObserver), máscaras de rolagem em títulos e efeito de "digitação" no storytelling.
  - Carrossel de fotos com *crossfade* + *ken burns*, contadores animados, seções interativas (interruptores, troca de conteúdo no hover).
- **Responsivo de verdade** — testado em desktop e mobile; navbar vira menu hambúrguer, grids se reorganizam, tudo sem overflow horizontal.
- **Acessível e resiliente** — se o JS falhar, o conteúdo continua visível (`<noscript>` + `html.js`); `prefers-reduced-motion` respeitado; navegação por teclado nas seções interativas.
- **SEO** — títulos e *meta descriptions* por página, nomes de imagem descritivos, HTML semântico.
- **Cache-busting versionado** nos assets (`?v=N`) para publicar atualizações sem o usuário precisar limpar o cache.

## 🗂️ Estrutura

```
.
├── index.html            # Home (hero, números, diferenciais, modalidades, unidades, depoimentos, blog)
├── a-ajuste.html         # Sobre / história / valores / marca
├── modalidades.html      # Modalidades oferecidas
├── unidades.html         # Unidades + galeria + contatos por cidade
├── blog.html             # Índice do blog
├── blog-*.html           # Artigos (massa, ansiedade, preguiça, pilates)
├── styles.css            # Toda a folha de estilo do site
├── script.js             # Menu, reveals, carrosséis, contadores, interações
└── assets/               # Imagens, logo (SVG) e ícones
```

## 🚀 Rodando localmente

Não precisa de build. Basta servir a pasta:

```bash
# opção 1 — Python
python -m http.server 8080

# opção 2 — Node
npx serve .
```

E abrir `http://localhost:8080`.

## 🎨 Identidade

- **Cores:** vermelho da marca `#CC1F27`, preto-vinho `#0a0506`.
- **Tipografia:** [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) (títulos) + [Poppins](https://fonts.google.com/specimen/Poppins) (texto).

## 👤 Autoria

Desenvolvido por **Hiro** — [github.com/HiroDev-lab](https://github.com/HiroDev-lab)
Design UX/UI de referência: Túlio Henrique.

---

<sub>Projeto real em produção. Este repositório é mantido como portfólio.</sub>
