# CINZA — Atelier de Moda

**Uma experiência digital conceitual para uma marca de moda autoral.**

CINZA é um projeto de front-end desenvolvido para explorar a combinação entre design editorial, estética minimalista, animações e experiências interativas na web.

A proposta é demonstrar como código, direção visual e movimento podem trabalhar juntos para criar uma experiência digital sofisticada, com identidade própria e atenção aos detalhes.

> **Projeto ilustrativo:** CINZA é um conceito fictício criado para demonstrar minhas habilidades de desenvolvimento web e minha capacidade de transformar uma ideia em uma interface visualmente atraente. Não representa uma loja real nem uma operação comercial ativa.

## Visão geral

O projeto apresenta uma landing page conceitual para um atelier de moda, com uma identidade visual construída em torno de tons escuros, texturas sutis, tipografia editorial e detalhes em tons de cobre.

A experiência foi pensada para transmitir uma sensação de exclusividade e cuidado artesanal, utilizando animações controladas pela rolagem, transições suaves e diferentes composições visuais ao longo da página.

O objetivo é demonstrar não apenas a capacidade de escrever código, mas também de construir uma apresentação visual coerente e uma experiência de navegação completa.

## Funcionalidades

- **Abertura cinematográfica:** seção inicial com vídeo controlado pela rolagem no desktop e sequência de imagens como alternativa para dispositivos menores.
- **Design responsivo:** adaptações de layout, tipografia e comportamento para diferentes tamanhos de tela.
- **Identidade visual própria:** paleta de cores personalizada, fontes editoriais, texturas e efeitos de iluminação.
- **Animações e transições:** elementos que aparecem progressivamente durante a navegação.
- **Apresentação de produtos:** cards com imagens, informações e efeitos de interação.
- **Seção interativa de materiais:** cartões posicionados dinamicamente conforme a rolagem.
- **Apresentação do processo criativo:** etapas organizadas em uma composição animada.
- **Depoimentos conceituais:** seção visual para apresentação de avaliações ilustrativas.
- **Perguntas frequentes:** componente interativo com abertura e fechamento de respostas.
- **Formulário demonstrativo:** interface para inscrição em uma lista de interesse, sem integração com um serviço real.
- **Aviso de cookies:** interface com opções de aceite e recusa, armazenadas localmente no navegador.
- **Acessibilidade e desempenho:** suporte a preferências de movimento reduzido, carregamento otimizado de imagens e uso de elementos semânticos.

## Tecnologias utilizadas

**HTML5** — estrutura e organização semântica do conteúdo.

**CSS3** — identidade visual, layouts responsivos, animações, transições, efeitos de iluminação e tipografia.

**JavaScript** — interações, controle da experiência de rolagem, animações de conteúdo, navegação, formulário demonstrativo e gerenciamento de preferências locais.

**Intersection Observer API** — identificação de elementos que entram na área visível para controlar animações e efeitos de entrada.

**Media Queries** — adaptação da interface para diferentes resoluções e preferências de movimento.

O projeto utiliza tecnologias nativas da web, sem exigir um framework JavaScript ou um processo de compilação para executar a página.

## Estrutura do projeto

```text
Cinza/
├── _arquivo/
├── estilos/
│   └── principal.css
├── imagens/
│   ├── pecas/
│   │   ├── bolsa.png
│   │   ├── jaqueta.png
│   │   └── vestido.png
│   └── perfis/
├── scripts/
│   └── principal.js
├── video/
│   ├── quadros/
│   │   ├── quadro-01.jpg
│   │   ├── quadro-02.jpg
│   │   └── quadro-03.jpg
│   └── cena.mp4
├── .gitignore
└── index.html
```

## Como executar

Não é necessário instalar dependências para executar a versão estática.

1. Clone o repositório:

   ```bash
   git clone URL_DO_REPOSITORIO
   ```

2. Entre na pasta do projeto:

   ```bash
   cd Cinza
   ```

3. Inicie um servidor HTTP local:

   ```bash
   python3 -m http.server 8000
   ```

4. Abra no navegador:

   ```text
   http://localhost:8000
   ```

O servidor local permite carregar os arquivos de vídeo, as imagens e os demais recursos utilizando os caminhos relativos definidos no projeto.

## Organização técnica

O código foi separado em três partes principais para facilitar a manutenção:

- `index.html`: estrutura do conteúdo e organização das seções.
- `estilos/principal.css`: sistema visual, componentes, animações e regras responsivas.
- `scripts/principal.js`: comportamento interativo, eventos, controle da rolagem e inicialização da experiência.

Os recursos de mídia ficam organizados em diretórios próprios, permitindo substituir imagens ou atualizar o vídeo sem precisar reestruturar toda a página.

## Observações importantes

Este projeto foi criado com finalidade demonstrativa e educacional.

O nome CINZA, a identidade da marca, os produtos, os preços, as estatísticas, os depoimentos e demais informações comerciais apresentados na interface são elementos ilustrativos do conceito. Não devem ser interpretados como informações verificadas de uma empresa real.

O formulário de inscrição é demonstrativo e não envia dados para uma lista de contatos. Os links de redes sociais e outras páginas que ainda não possuem destinos configurados também podem funcionar apenas como elementos de apresentação.

A interface de cookies salva a escolha localmente, mas não implementa, por si só, uma plataforma completa de gestão de consentimento.

## Objetivo do projeto

Este trabalho faz parte do meu portfólio de desenvolvimento web.

A intenção é mostrar minha capacidade de criar interfaces que vão além de uma página funcional: projetos com composição visual, personalidade, movimento, organização de código e atenção à experiência do usuário.

**A proposta é transformar uma ideia em uma experiência visual bem construída, utilizando código como ferramenta de design.**

---

**Desenvolvido por Arthur José**  
Projeto conceitual de front-end · HTML · CSS · JavaScript
