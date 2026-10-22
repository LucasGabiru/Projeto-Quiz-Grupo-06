from flask import Flask, render_template, request
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, template_folder=str(BASE_DIR), static_folder=None)


def carregar_perguntas():
    """Carrega e valida as perguntas armazenadas em perguntas.json."""
    caminho = BASE_DIR / "perguntas.json"
    with caminho.open("r", encoding="utf-8") as arquivo:
        dados = json.load(arquivo)

    for item in dados:
        campos = ("pergunta", "alternativas", "correta", "explicacao", "fonte")
        if not all(campo in item for campo in campos):
            raise ValueError("Uma pergunta está sem um campo obrigatório.")
        if not isinstance(item["alternativas"], list) or not item["alternativas"]:
            raise ValueError("Cada pergunta precisa ter alternativas.")
        if not isinstance(item["correta"], int) or not 0 <= item["correta"] < len(item["alternativas"]):
            raise ValueError("O índice da resposta correta é inválido.")
        if not isinstance(item["fonte"], dict) or not item["fonte"].get("titulo") or not item["fonte"].get("url"):
            raise ValueError("Cada pergunta precisa ter título e URL de fonte.")
    return dados


PERGUNTAS = carregar_perguntas()


@app.route("/")
def inicio():
    return render_template("index.html", estado="inicio")


@app.route("/style.css")
def estilo():
    conteudo = (BASE_DIR / "style.css").read_text(encoding="utf-8")
    return app.response_class(conteudo, mimetype="text/css")


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
            "resposta_texto": resposta_texto
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
        revisao=revisao
    )


if __name__ == "__main__":
    app.run(debug=True)
