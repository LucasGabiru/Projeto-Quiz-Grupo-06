import json
from pathlib import Path

from flask import Flask, abort, render_template, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, template_folder=str(BASE_DIR), static_folder=None)

# Arquivos do projeto que podem ser acessados pelo navegador.
ARQUIVOS_PERMITIDOS = {
    "index.html": "text/html",
    "style.css": "text/css",
    "script.js": "application/javascript",
    "perguntas.json": "application/json",
}


def carregar_perguntas():
    """Lê e valida perguntas.json, aceitando alternativas em lista ou dicionário."""
    caminho = BASE_DIR / "perguntas.json"
    with caminho.open("r", encoding="utf-8") as arquivo:
        dados = json.load(arquivo)

    # No projeto do grupo, as perguntas ficam dentro da chave "perguntas".
    lista = dados.get("perguntas") if isinstance(dados, dict) else dados
    if not isinstance(lista, list) or not lista:
        raise ValueError("O JSON precisa conter uma lista de perguntas.")

    perguntas = []
    for item in lista:
        campos = ("pergunta", "alternativas", "explicacao", "fonte")
        if not isinstance(item, dict) or not all(campo in item for campo in campos):
            raise ValueError("Uma pergunta está sem um campo obrigatório.")

        alternativas = item["alternativas"]
        resposta_correta = item.get("correta", item.get("resposta_correta"))

        if isinstance(alternativas, dict) and alternativas:
            # Exemplo do grupo: {"A": "...", "B": "..."}, resposta: "A".
            letras = list(alternativas)
            opcoes = list(alternativas.values())
            if resposta_correta not in letras:
                raise ValueError("A resposta correta não corresponde às alternativas.")
            indice_correto = letras.index(resposta_correta)
        elif isinstance(alternativas, list) and alternativas:
            # Aceita também: ["...", "..."], resposta: 0, 1, 2...
            opcoes = alternativas
            indice_correto = resposta_correta
        else:
            raise ValueError("Cada pergunta precisa ter alternativas válidas.")

        if (not isinstance(indice_correto, int) or isinstance(indice_correto, bool)
                or not 0 <= indice_correto < len(opcoes)):
            raise ValueError("O índice da resposta correta é inválido.")

        fonte = item["fonte"]
        if (not isinstance(fonte, dict)
                or not (fonte.get("titulo") or fonte.get("nome"))
                or not fonte.get("url")):
            raise ValueError("Cada pergunta precisa de título/nome e URL da fonte.")

        perguntas.append({
            "pergunta": item["pergunta"],
            "alternativas": opcoes,
            "correta": indice_correto,
            "explicacao": item["explicacao"],
            "fonte": {
                "titulo": fonte.get("titulo") or fonte.get("nome"),
                "url": fonte["url"],
            },
        })

    return perguntas


PERGUNTAS = carregar_perguntas()


@app.route("/")
def inicio():
    return render_template("index.html", estado="inicio")


@app.route("/<path:nome>")
def arquivo(nome):
    """Disponibiliza HTML, CSS, JavaScript e JSON, sem expor outros arquivos."""
    if nome not in ARQUIVOS_PERMITIDOS:
        abort(404)
    return send_from_directory(BASE_DIR, nome, mimetype=ARQUIVOS_PERMITIDOS[nome])


@app.route("/iniciar", methods=["POST"])
def iniciar():
    return render_template("index.html", estado="jogo", perguntas=PERGUNTAS)


@app.route("/resultado", methods=["POST"])
def resultado():
    pontos = 0
    revisao = []

    for indice, pergunta in enumerate(PERGUNTAS):
        enviada = request.form.get(f"pergunta_{indice}", "")
        valida = enviada.isdigit() and 0 <= int(enviada) < len(pergunta["alternativas"])

        if valida:
            escolha = int(enviada)
            acertou = escolha == pergunta["correta"]
            resposta_texto = pergunta["alternativas"][escolha]
        else:
            acertou = False
            resposta_texto = "Nenhuma resposta válida enviada"

        if acertou:
            pontos += 1

        revisao.append({
            "pergunta": pergunta,
            "acertou": acertou,
            "resposta_texto": resposta_texto,
        })

    if pontos == len(PERGUNTAS):
        mensagem = "Excelente! Você acertou todas as perguntas."
    elif pontos == 0:
        mensagem = "Continue estudando: confira as explicações e tente novamente."
    else:
        mensagem = "Bom trabalho! Confira as explicações para aprender ainda mais."

    return render_template(
        "index.html",
        estado="resultado",
        perguntas=PERGUNTAS,
        pontos=pontos,
        mensagem=mensagem,
        revisao=revisao,
    )


if __name__ == "__main__":
    app.run(debug=True)
