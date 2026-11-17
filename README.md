# TechQuiz — Projeto-Quiz-Grupo-06

Quiz interativo sobre os impactos e desafios da Inteligência Artificial, desenvolvido pelo Grupo 06. O jogador responde às perguntas uma de cada vez, recebe feedback imediato com explicação e fonte e, no final, vê sua pontuação, a revisão das respostas e um ranking.

🔗 **Site publicado:** [https://lucasgabiru.github.io/Projeto-Quiz-Grupo-06](https://lucasgabiru.github.io/Projeto-Quiz-Grupo-06)

## Integrantes

| Nome | RGM |
|------|-----|
| Julio Cesar Godoy da Silva | 47733438 |
| Luiz Guilherme Servilheira | 4793312 |
| Nycolas Robert Batista Ramos | 47231530 |
| Lucas Aguiar dos Santos | 47635282 |
| Pamela das Graças de Sales Andrade | 48011282 |

## Tema

**Problemática da Inteligência Artificial.** O quiz tem 5 perguntas de múltipla escolha sobre temas como o impacto da IA no mercado de trabalho, privacidade, preconceito nos dados, desinformação e conteúdo sintético, e a importância da supervisão humana. Cada pergunta tem uma explicação e uma fonte confiável (como UNESCO e NIST), para que o quiz também sirva para aprender.

## Regras do Quiz

1. Para começar, o jogador precisa digitar o nome.
2. As perguntas aparecem uma de cada vez, com a indicação "Pergunta X de N" e uma barra de progresso.
3. Cada pergunta tem alternativas (A, B, C, D) e **apenas uma está correta**.
4. É obrigatório selecionar uma alternativa antes de responder.
5. Depois de responder, **não é possível trocar a resposta**. O quiz mostra se o jogador acertou, qual era a correta, a explicação e a fonte.
6. Cada acerto vale **1 ponto**. Erros não tiram pontos.
7. No final, o jogador vê a pontuação, a revisão de todas as perguntas e o ranking.
8. O ranking mostra os **10 melhores resultados**, ordenados por pontos. Em caso de empate, fica na frente quem jogou primeiro.
9. O ranking é salvo no navegador (`sessionStorage`) e **dura só enquanto a aba estiver aberta**.

## Como Jogar

1. Acesse o site pelo link acima.
2. Digite seu nome e clique em **Iniciar**.
3. Escolha uma alternativa e clique em **Responder**.
4. Leia a explicação e clique em **Próxima pergunta**. Na última, o botão vira **Ver resultado**.
5. Confira sua pontuação, a revisão e o ranking. Clique em **Jogar novamente** para tentar de novo.

## Funcionalidades

* **Perguntas em JSON:** perguntas, alternativas, respostas, explicações e fontes ficam em `perguntas.json` e são carregadas com `fetch`. Para mudar o conteúdo, não é preciso alterar o código.
* **Validação:** nome obrigatório e alternativa obrigatória, com mensagens de erro claras.
* **Feedback imediato:** marca a alternativa correta e a escolhida com cor e texto, não só cor.
* **Revisão final:** mostra a resposta do jogador, a correta, a explicação e o link da fonte de cada pergunta.
* **Ranking:** salvo no `sessionStorage`, com o jogador atual destacado.
* **Acessibilidade:** gerenciamento de foco entre as telas, `aria-invalid` nos campos com erro e layout responsivo.
* **Tratamento de erros:** se o `perguntas.json` não carregar, o quiz mostra uma mensagem e não inicia.

## Tecnologias

* HTML5
* CSS3 (layout responsivo)
* JavaScript (DOM, `fetch`, `sessionStorage`)
* Python (`main.py`, para servir o projeto localmente)

## Estrutura de Arquivos

```
├── index.html        # Estrutura das telas: início, quiz e resultado
├── style.css         # Estilos e layout responsivo
├── scripts.js        # Lógica: carregamento do JSON, fluxo, pontuação e ranking
├── perguntas.json    # Perguntas, alternativas, respostas, explicações e fontes
├── main.py           # Servidor local para executar o projeto
└── README.md         # Documentação do projeto
```

## Formato do `perguntas.json`

```json
{
  "descricao": "Texto de apresentação do quiz.",
  "perguntas": [
    {
      "pergunta": "Enunciado da pergunta?",
      "alternativas": {
        "A": "Primeira opção",
        "B": "Segunda opção",
        "C": "Terceira opção",
        "D": "Quarta opção"
      },
      "resposta_correta": "B",
      "explicacao": "Por que essa é a resposta correta.",
      "fonte": {
        "nome": "Nome da fonte",
        "url": "https://exemplo.com"
      }
    }
  ]
}
```

## Como Executar Localmente

O quiz carrega o `perguntas.json` com `fetch`, então **não funciona abrindo o `index.html` direto pelo arquivo**. É preciso servir o projeto por um servidor:

1. Clone o repositório e entre na pasta:
   ```bash
   git clone https://github.com/lucasgabiru/Projeto-Quiz-Grupo-06.git
   cd Projeto-Quiz-Grupo-06
   ```
2. Inicie o servidor local (é necessário ter o Python instalado):
   ```bash
   python main.py
   ```
   Alternativa: `python -m http.server 8000`
3. Abra no navegador o endereço exibido (por exemplo, `http://localhost:8000`).

## Publicação

O site está publicado no **GitHub Pages**. Para publicar sua própria cópia, vá em *Settings → Pages*, escolha a branch `main` e a pasta raiz (`/root`), e salve.
