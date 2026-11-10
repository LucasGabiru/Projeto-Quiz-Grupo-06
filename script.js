// Array para armazenar as perguntas
let perguntas = [];

// Função responsável por carregar o JSON
async function carregarPerguntas() {
    try {
        const resposta = await fetch("./perguntas.json");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar perguntas");
        }

        const dados = await resposta.json();

        // Aceita JSON com array direto ou propriedade perguntas
        perguntas = Array.isArray(dados)
            ? dados
            : dados.perguntas;

        if (!Array.isArray(perguntas)) {
            throw new Error("Formato das perguntas inválido");
        }

        console.log("Perguntas carregadas com sucesso!");
        console.log(perguntas);

        return perguntas;

    } catch (erro) {
        console.error("Erro ao carregar perguntas:", erro);
        return [];
    }
}

carregarPerguntas();