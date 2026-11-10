/* =========================================================
   TechQuiz — CP2
   Lógica: carregamento do JSON, fluxo, pontuação, ranking
   ========================================================= */

const CHAVE_RANKING = "techquiz_ranking";

const estado = {
    dados: null,
    jogador: "",
    indice: 0,
    pontos: 0,
    respondida: false,
    respostas: [], // { pergunta, escolha, acertou }
};

const el = {
    erro: document.getElementById("erro"),
    telaInicio: document.getElementById("tela-inicio"),
    telaQuiz: document.getElementById("tela-quiz"),
    telaResultado: document.getElementById("tela-resultado"),
    tituloInicio: document.getElementById("titulo-inicio"),
    descricao: document.getElementById("descricao-quiz"),
    formInicio: document.getElementById("form-inicio"),
    nome: document.getElementById("nome-jogador"),
    erroNome: document.getElementById("erro-nome"),
    btnIniciar: document.getElementById("btn-iniciar"),
    progressoTexto: document.getElementById("progresso-texto"),
    progressoBarra: document.getElementById("progresso-barra"),
    jogadorTexto: document.getElementById("jogador-texto"),
    formPergunta: document.getElementById("form-pergunta"),
    textoPergunta: document.getElementById("texto-pergunta"),
    opcoes: document.getElementById("opcoes"),
    erroResposta: document.getElementById("erro-resposta"),
    feedback: document.getElementById("feedback"),
    feedbackStatus: document.getElementById("feedback-status"),
    feedbackExplicacao: document.getElementById("feedback-explicacao"),
    feedbackFonte: document.getElementById("feedback-fonte"),
    btnAcao: document.getElementById("btn-acao"),
    tituloResultado: document.getElementById("titulo-resultado"),
    mensagemResultado: document.getElementById("mensagem-resultado"),
    barraResultado: document.getElementById("barra-resultado"),
    barraResultadoWrap: document.getElementById("barra-resultado-wrap"),
    listaRanking: document.getElementById("lista-ranking"),
    revisao: document.getElementById("revisao"),
    btnReiniciar: document.getElementById("btn-reiniciar"),
};

/* ---------- Utilidades ---------- */

function mostrarTela(tela, focoEl) {
    [el.telaInicio, el.telaQuiz, el.telaResultado].forEach((t) => (t.hidden = true));
    tela.hidden = false;
    window.scrollTo(0, 0);
    if (focoEl) focoEl.focus();
}

function mostrarErroGeral(msg) {
    el.erro.textContent = msg;
    el.erro.hidden = false;
}

function criar(tag, classe, texto) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto !== undefined) n.textContent = texto;
    return n;
}

/* ---------- Carregamento do JSON ---------- */

async function carregarPerguntas() {
    try {
        const resp = await fetch("perguntas.json");
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        const dados = await resp.json();
        if (!Array.isArray(dados.perguntas) || dados.perguntas.length === 0) {
            throw new Error("JSON sem perguntas.");
        }
        estado.dados = dados;
        el.descricao.textContent =
            dados.descricao + " São " + dados.perguntas.length + " perguntas.";
        el.btnIniciar.disabled = false;
    } catch (e) {
        el.descricao.textContent = "Não foi possível carregar as perguntas.";
        mostrarErroGeral(
            "Erro ao carregar perguntas.json. Abra o site por um servidor " +
            "(python main.py ou GitHub Pages), não direto pelo arquivo."
        );
        console.error(e);
    }
}

/* ---------- Início ---------- */

el.formInicio.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const nome = el.nome.value.trim();
    if (!nome) {
        el.erroNome.textContent = "Por favor, digite seu nome para começar.";
        el.erroNome.hidden = false;
        el.nome.setAttribute("aria-invalid", "true");
        el.nome.focus();
        return;
    }
    el.erroNome.hidden = true;
    el.nome.removeAttribute("aria-invalid");
    iniciarPartida(nome);
});

function iniciarPartida(nome) {
    estado.jogador = nome;
    estado.indice = 0;
    estado.pontos = 0;
    estado.respostas = [];
    el.jogadorTexto.textContent = "Jogador: " + nome;
    mostrarTela(el.telaQuiz);
    mostrarPergunta();
}

/* ---------- Pergunta ---------- */

function mostrarPergunta() {
    const total = estado.dados.perguntas.length;
    const p = estado.dados.perguntas[estado.indice];
    estado.respondida = false;

    el.progressoTexto.textContent = "Pergunta " + (estado.indice + 1) + " de " + total;
    el.progressoBarra.style.width = (estado.indice / total) * 100 + "%";
    el.textoPergunta.textContent = p.pergunta;
    el.opcoes.replaceChildren();
    el.erroResposta.hidden = true;
    el.feedback.hidden = true;
    el.feedback.className = "feedback-box";
    el.btnAcao.textContent = "Responder";

    Object.entries(p.alternativas).forEach(([letra, texto], i) => {
        const label = criar("label", "option");
        label.dataset.letra = letra;

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "alternativa";
        input.value = letra;
        input.id = "alt-" + letra;
        if (i === 0) input.required = true;

        const span = criar("span", "option-texto", letra + ") " + texto);
        label.append(input, span);
        el.opcoes.append(label);
    });

    el.textoPergunta.focus();
}

el.formPergunta.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (!estado.respondida) {
        verificarResposta();
    } else {
        proximaEtapa();
    }
});

function verificarResposta() {
    const marcada = el.opcoes.querySelector("input:checked");
    if (!marcada) {
        el.erroResposta.textContent = "Selecione uma alternativa antes de responder.";
        el.erroResposta.hidden = false;
        el.opcoes.querySelector("input").focus();
        return;
    }
    el.erroResposta.hidden = true;

    const p = estado.dados.perguntas[estado.indice];
    const escolha = marcada.value;
    const acertou = escolha === p.resposta_correta;
    estado.respondida = true;
    if (acertou) estado.pontos++;
    estado.respostas.push({ pergunta: p, escolha, acertou });

    // Marca as alternativas (cor + texto + estilo de borda)
    el.opcoes.querySelectorAll(".option").forEach((label) => {
        const letra = label.dataset.letra;
        label.classList.add("bloqueada");
        label.querySelector("input").disabled = true;

        if (letra === p.resposta_correta) {
            label.classList.add("correta");
            label.querySelector(".option-texto").append(criar("span", "badge ok", "✓ Correta"));
        } else if (letra === escolha) {
            label.classList.add("errada");
            label.querySelector(".option-texto").append(criar("span", "badge erro", "✗ Sua resposta"));
        }
    });

    el.feedback.classList.add(acertou ? "ok" : "erro");
    el.feedbackStatus.textContent = acertou
        ? "✓ Você acertou!"
        : "✗ Resposta incorreta. A correta é a alternativa " + p.resposta_correta + ".";
    el.feedbackExplicacao.textContent = p.explicacao;
    el.feedbackFonte.textContent = "Fonte: " + p.fonte.nome + " ↗";
    el.feedbackFonte.href = p.fonte.url;
    el.feedback.hidden = false;

    const ultima = estado.indice === estado.dados.perguntas.length - 1;
    el.btnAcao.textContent = ultima ? "Ver resultado" : "Próxima pergunta";
    el.btnAcao.focus();
}

function proximaEtapa() {
    if (estado.indice < estado.dados.perguntas.length - 1) {
        estado.indice++;
        mostrarPergunta();
    } else {
        mostrarResultado();
    }
}

/* ---------- Ranking (sessionStorage) ---------- */

function lerRanking() {
    try {
        const bruto = sessionStorage.getItem(CHAVE_RANKING);
        const lista = bruto ? JSON.parse(bruto) : [];
        return Array.isArray(lista) ? lista : [];
    } catch (e) {
        return [];
    }
}

function salvarRanking(lista) {
    try {
        sessionStorage.setItem(CHAVE_RANKING, JSON.stringify(lista));
    } catch (e) {
        console.error("Não foi possível salvar o ranking.", e);
    }
}

function registrarNoRanking() {
    const ranking = lerRanking();
    const registro = {
        id: Date.now(),
        nome: estado.jogador,
        pontos: estado.pontos,
        total: estado.dados.perguntas.length,
    };
    ranking.push(registro);
    ranking.sort((a, b) => b.pontos - a.pontos || a.id - b.id);
    salvarRanking(ranking);
    return { ranking, idAtual: registro.id };
}

function desenharRanking(ranking, idAtual) {
    el.listaRanking.replaceChildren();
    ranking.slice(0, 10).forEach((r) => {
        const li = criar(
            "li",
            r.id === idAtual ? "atual" : "",
            r.nome + " — " + r.pontos + " de " + r.total + " pontos" +
            (r.id === idAtual ? " (você agora)" : "")
        );
        el.listaRanking.append(li);
    });
}

/* ---------- Resultado ---------- */

function mostrarResultado() {
    const total = estado.dados.perguntas.length;
    const { pontos } = estado;

    el.progressoBarra.style.width = "100%";
    el.tituloResultado.textContent =
        estado.jogador + ", você acertou " + pontos + " de " + total + " perguntas!";

    if (pontos === total) {
        el.mensagemResultado.textContent = "Excelente! Você acertou todas as perguntas.";
    } else if (pontos === 0) {
        el.mensagemResultado.textContent =
            "Continue estudando: confira as explicações e tente novamente.";
    } else {
        el.mensagemResultado.textContent =
            "Bom trabalho! Confira as explicações para aprender ainda mais.";
    }

    el.barraResultado.style.width = Math.round((pontos / total) * 100) + "%";
    el.barraResultadoWrap.setAttribute("aria-label", "Pontuação: " + pontos + " de " + total);

    const { ranking, idAtual } = registrarNoRanking();
    desenharRanking(ranking, idAtual);
    desenharRevisao();

    mostrarTela(el.telaResultado, el.tituloResultado);
}

function desenharRevisao() {
    el.revisao.replaceChildren();
    estado.respostas.forEach((r, i) => {
        const p = r.pergunta;
        const card = criar("article", "feedback-card card");

        const h3 = criar("h3");
        h3.append(
            criar("span", "feedback-icon " + (r.acertou ? "correct" : "incorrect"),
                  r.acertou ? "✓ Certa" : "✗ Errada"),
            document.createTextNode(i + 1 + ". " + p.pergunta)
        );

        const pResp = criar("p");
        pResp.append(criar("strong", "", "Sua resposta: "),
            document.createTextNode(r.escolha + ") " + p.alternativas[r.escolha]));

        const pCerta = criar("p");
        pCerta.append(criar("strong", "", "Resposta correta: "),
            document.createTextNode(p.resposta_correta + ") " + p.alternativas[p.resposta_correta]));

        const expl = criar("p", "explanation", p.explicacao);

        const link = criar("a", "source-link", "Fonte: " + p.fonte.nome + " ↗");
        link.href = p.fonte.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        card.append(h3, pResp, pCerta, expl, link);
        el.revisao.append(card);
    });
}

/* ---------- Jogar novamente ---------- */

el.btnReiniciar.addEventListener("click", () => {
    el.nome.value = estado.jogador; // mantém o nome para facilitar
    mostrarTela(el.telaInicio, el.tituloInicio);
});

/* ---------- Início da aplicação ---------- */

carregarPerguntas();
