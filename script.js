class JogadorHumano {
    constructor(simbolo) {
        this.simbolo = simbolo;
    }
}

class Jogada {
    constructor(linha, coluna) {
        this.linha = linha;
        this.coluna = coluna;
    }

    get valida() {
        return this.linha > 0 && this.coluna > 0;
    }

    get invalida() {
        return !this.valida;
    }
}

class JogoDaVelha {
    constructor(
        jogador1 = new JogadorHumano("X"),
        jogador2 = new JogadorHumano("O"),
        tamanho
    ) {
        this.jogador1 = jogador1;
        this.jogador2 = jogador2;
        this.jogadorAtual = jogador1;
        this.tamanho = tamanho;
        this.tabuleiro = this.#iniciarTabuleiro();
        this.vencedor = null;
    }

    #iniciarTabuleiro() {
        return Array(this.tamanho)
            .fill(0)
            .map((_) => Array(this.tamanho).fill(null));
    }

    jogar(jogada) {
        this.#processarJogada(jogada);
    }

    #processarJogada(jogada) {
        if (this.#jogadaInvalida(jogada)) {
            return;
        }

        this.#adicionar(jogada);
        if (this.#conquistouVitoria(jogada)) {
            this.vencedor = this.jogadorAtual.simbolo;
        } else if (this.#finalizouComEmpate()) {
            this.vencedor = "-";
        } else {
            this.#trocarJogador();
        }
    }

    #jogadaValida(jogada) {
        let { linha, coluna } = jogada;

        if (jogada.invalida) {
            return false;
        }
        if (linha > this.tamanho || coluna > this.tamanho) {
            return false;
        }
        if (this.#ocupado(jogada)) {
            return false;
        }
        if (this.vencedor) {
            return false;
        }

        return true;
    }

    #jogadaInvalida(jogada) {
        return !this.#jogadaValida(jogada);
    }

    #ocupado(jogada) {
        let { linha, coluna } = jogada;
        const EstaOcupado = this.#campo(linha, coluna) !== null;
        return EstaOcupado;
    }

    #campo(linha, coluna) {
        return this.tabuleiro[linha - 1][coluna - 1];
    }

    #trocarJogador() {
        this.jogadorAtual =
            this.jogadorAtual.simbolo === this.jogador1.simbolo
                ? this.jogador2
                : this.jogador1;
    }

    #adicionar(jogada) {
        let { linha, coluna } = jogada;
        this.tabuleiro[linha - 1][coluna - 1] = this.jogadorAtual.simbolo;
    }

    #finalizouComEmpate() {
        let espacosVazios = this.tabuleiro
            .flat()
            .filter((campo) => campo === null);

        const tabuleiroCompleto = espacosVazios.length === 0;
        if (tabuleiroCompleto) {
            return true;
        }
    }

    #conquistouVitoria(jogada) {
        let { linha, coluna } = jogada;
        let { tabuleiro, jogadorAtual } = this;
        let tamanho = tabuleiro.length;
        let indexes = Array(tamanho)
            .fill(0)
            .map((_, i) => i + 1);

        const ganhouEmLinha = indexes.every(
            (i) => this.#campo(linha, i) === jogadorAtual.simbolo
        );

        const ganhouEmColuna = indexes.every(
            (i) => this.#campo(i, coluna) === jogadorAtual.simbolo
        );

        const ganhouDiagonalPrincipal = indexes.every(
            (i) => this.#campo(i, i) === jogadorAtual.simbolo
        );

        const ganhouDiagonalSecundaria = indexes.every(
            (i) => this.#campo(tamanho - i + 1, i) === jogadorAtual.simbolo
        );

        const ganhou =
            ganhouEmLinha ||
            ganhouEmColuna ||
            ganhouDiagonalPrincipal ||
            ganhouDiagonalSecundaria;

        return ganhou;
    }

    toString() {
        let matriz = this.tabuleiro
            .map((linha) => linha.map((posicao) => posicao ?? "-").join(" "))
            .join("\n");

        let simboloVencedor = this.vencedor === null ? "-" : this.vencedor;

        return `${matriz} \n Vencedor: ${simboloVencedor}`;
    }

    status() {
        if (this.vencedor === "-") {
            return "EMPATE!";
        } else if (this.vencedor) {
            return `${this.vencedor} VENCEU!`;
        } else {
            return `É A VEZ DE ${this.jogadorAtual.simbolo}!`;
        }
    }

    zerar() {
        this.jogadorAtual = this.jogador1;
        this.tabuleiro = this.#iniciarTabuleiro();
        this.vencedor = null;
    }
}

class JogoDaVelhaDOM {
    constructor(tabuleiro, informacoes) {
        this.tabuleiro = tabuleiro;
        this.informacoes = informacoes;
    }

    inicializar(jogo) {
        this.jogo = jogo;
        this.#criarTabuleiro();
        this.#deixarTabuleiroJogavel();
    }

    #deixarTabuleiroJogavel() {
        const posicoes = this.tabuleiro.getElementsByClassName("posicao");
        for (const posicao of posicoes) {
            if (this.jogo.vencedor) return;

            posicao.addEventListener("click", (e) => {
                let posicaoSelecionada = e.target.attributes;
                let linha = +posicaoSelecionada.linha.value;
                let coluna = +posicaoSelecionada.coluna.value;

                this.jogo.jogar(new Jogada(linha, coluna));
                this.informacoes.innerText = this.jogo.status();
                this.#imprimirSimbolos();
            });
        }
    }

    #imprimirSimbolos() {
        let { tabuleiro } = this.jogo;
        let qtdLinhas = tabuleiro.length;
        let qtdColunas = tabuleiro[0].length;

        let posicoes = this.tabuleiro.getElementsByClassName("posicao");

        for (let linha = 0; linha < qtdLinhas; linha++) {
            for (let coluna = 0; coluna < qtdColunas; coluna++) {
                let indiceInterface = linha * qtdLinhas + coluna;
                posicoes[indiceInterface].innerText = tabuleiro[linha][coluna];
            }
        }
    }

    zerar() {
        this.jogo.zerar();
        let posicoes = document.getElementsByClassName("posicao");
        [...posicoes].forEach((posicao) => (posicao.innerText = ""));
        this.informacoes.innerText = this.jogo.status();
    }

    #criarTabuleiro() {
        const tamanho = this.jogo.tamanho;
        let posicoes = [];
        for (let linha = 1; linha <= tamanho; linha++) {
            const colunas = this.#criarLinhaTabuleiro(linha, tamanho);
            posicoes.push(...colunas);
        }

        this.tabuleiro.innerHTML = [...posicoes].join("");
        this.tabuleiro.style.gridTemplateColumns = `repeat(${tamanho}, 1fr)`;
    }

    #criarLinhaTabuleiro(linha, tamanho) {
        let colunas = [];
        for (let coluna = 1; coluna <= tamanho; coluna++) {
            let classes = "posicao ";
            if (linha === 1) {
                classes += "posicao-cima ";
            } else if (linha === tamanho) {
                classes += "posicao-baixo ";
            }

            if (coluna === 1) {
                classes += "posicao-esquerda ";
            } else if (coluna === tamanho) {
                classes += "posicao-direita ";
            }

            const elemento = `<div class="${classes}" linha="${linha}" coluna="${coluna}"></div>`;
            colunas.push(elemento);
        }

        return colunas;
    }
}

(function () {
    const botaoIniciar = document.getElementById("iniciar");
    const informacoes = document.getElementById("info");
    const tabuleiro = document.getElementById("tabuleiro");
    const inputTamanho = document.getElementById("tamanho");

    const novoJogo = (tamanho) => {
        const jogo = new JogoDaVelha(
            new JogadorHumano("X"),
            new JogadorHumano("O"),
            tamanho
        );

        return jogo;
    };

    const jogoDOM = new JogoDaVelhaDOM(tabuleiro, informacoes);
    jogoDOM.inicializar(novoJogo(3));

    inputTamanho.addEventListener("input", () => {
        let tamanho = +inputTamanho.value;
        jogoDOM.inicializar(novoJogo(tamanho));
    });

    botaoIniciar.addEventListener("click", () => {
        jogoDOM.zerar();
    });
})();
