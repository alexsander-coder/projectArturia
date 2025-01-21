class Produto {
    constructor(nome, preco, imagem, codigo) {
        this.nome = nome;
        this.preco = preco;
        this.imagem = imagem;
        this.codigo = codigo || this.gerarCodigo();
    }

    gerarCodigo() {
        return `P${Math.floor(Math.random() * 1000000)}`;
    }
}

class Carrinho {
    constructor() {
        this.itens = [];
    }

    adicionarProduto(produto) {
        this.itens.push(produto);
    }

    removerProduto(index) {
        this.itens.splice(index, 1);
    }

    limpar() {
        this.itens = [];
    }

    obterTotal() {
        return this.itens.reduce((total, produto) => total + produto.preco, 0);
    }
}

class Pedido {
    constructor(produtos) {
        this.produtos = produtos;
        this.expandido = false;
        this.data = new Date();
    }

    expandir() {
        this.expandido = !this.expandido;
    }
}

class Loja {
    constructor() {
        this.produtos = [];
        this.carrinho = new Carrinho();
        this.pedidos = [];
        this.db = null;
    }

    iniciarIndexedDB() {
        const request = indexedDB.open('LojaDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('produtos')) {
                const objectStore = db.createObjectStore('produtos', { autoIncrement: true });
                objectStore.createIndex('nome', 'nome', { unique: false });
                objectStore.createIndex('preco', 'preco', { unique: false });
                objectStore.createIndex('imagem', 'imagem', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            this.carregarProdutos();
            this.adicionarProdutos();
        };

        request.onerror = (event) => {
            console.error('erro indexedDB', event);
        };
    }

    carregarProdutos() {
        const transaction = this.db.transaction(['produtos'], 'readonly');
        const objectStore = transaction.objectStore('produtos');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const produtosData = event.target.result;
            this.produtos = produtosData.map(item => new Produto(item.nome, item.preco, item.imagem));
        };

        request.onerror = (event) => {
            console.error('erro ao carregar produtos', event);
        };
    }

    adicionarProdutos() {
        const produtosIniciais = [
            new Produto('Camiseta Polo', 79.90, 'https://static.zattini.com.br/produtos/camisa-polo-lacoste-piquet-slim-fit-gola-contraste-masculina/16/D66-1192-016/D66-1192-016_zoom1.jpg?', `P000001`),
            new Produto('Tênis Nike Air Max', 499.99, 'https://th.bing.com/th/id/OIP.rZrvWLmdoYRScIVG4J7BqwHaHa?rs=1&pid=ImgDetMain', `P000002`),
            new Produto('Livro "O Senhor dos Anéis"', 59.90, 'https://http2.mlstatic.com/livro-o-senhor-dos-aneis-j-r-r-tolkien-volume-unico-D_NQ_NP_854025-MLB27251586889_042018-F.jpg', `P000003`),
            new Produto('Fone de Ouvido JBL', 199.90, 'https://th.bing.com/th/id/OIP.hCM1wqLE8EaFKE8hF0_-rgAAAA?rs=1&pid=ImgDetMain', `P000004`),
            new Produto('Relógio Casio', 120.00, 'https://th.bing.com/th/id/R.8a55d9995e4c09cc7b752968a9992d87?rik=Lql54fItFVhXXg&pid=ImgRaw&r=0', `P000005`),
            new Produto('Cadeira Gamer', 399.90, 'https://th.bing.com/th/id/OIP.QLpMK-K0eOuJ2XMGGQwKTwHaE7?rs=1&pid=ImgDetMain', `P000006`)
        ];

        const transaction = this.db.transaction(['produtos'], 'readwrite');
        const objectStore = transaction.objectStore('produtos');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            if (event.target.result.length === 0) {
                produtosIniciais.forEach(produto => {
                    const addRequest = objectStore.add({
                        nome: produto.nome,
                        preco: produto.preco,
                        imagem: produto.imagem,
                        codigo: produto.codigo
                    });

                    addRequest.onsuccess = () => {
                        console.log('Produto adicionado com sucesso:', produto);
                    };

                    addRequest.onerror = (event) => {
                        console.error('Erro ao adicionar produto:', event);
                    };
                });
            }
        };

        request.onerror = (event) => {
            console.error('erro ao verificar produtos existentess', event);
        };
    }

    adicionarAoCarrinho(produto) {
        this.carrinho.adicionarProduto(produto);
    }

    removerDoCarrinho(index) {
        this.carrinho.removerProduto(index);
    }

    finalizarPedido() {
        if (this.carrinho.itens.length > 0) {
            const pedido = new Pedido([...this.carrinho.itens]);
            this.pedidos.push(pedido);
            this.carrinho.limpar();
            alert('pedido finalizado com sucesso!');
        } else {
            alert('o carrinho está vazio!');
        }
    }

    consultarPedidos() {
        this.mostrarPedidos = !this.mostrarPedidos;
    }
}

new Vue({
    el: '.container',
    data() {
        return {
            loja: new Loja(),
            mostrarPedidos: false,
            slidePosition: 0,
            itemsPerSlide: 1
        };
    },
    created() {
        this.loja.iniciarIndexedDB();
    },
    computed: {
        produtos() {
            return this.loja.produtos;
        },
        carrinho() {
            return this.loja.carrinho.itens;
        },
        pedidos() {
            return this.loja.pedidos;
        }
    },
    methods: {
        adicionarAoCarrinho(produto) {
            this.loja.adicionarAoCarrinho(produto);
        },
        removerDoCarrinho(index) {
            this.loja.removerDoCarrinho(index);
        },
        finalizarPedido() {
            this.loja.finalizarPedido();
        },
        consultarPedidos() {
            this.mostrarPedidos = !this.mostrarPedidos;
        },

        moverSlider(direction) {
            const totalItems = this.produtos.length;
            const maxPosition = -(totalItems - this.itemsPerSlide) * 300;
            const slideIncrement = 300;

            this.slidePosition += direction * slideIncrement;

            if (this.slidePosition > 0) {
                this.slidePosition = 0;
            } else if (this.slidePosition < maxPosition) {
                this.slidePosition = maxPosition;
            }
        },
        calcularTotalPedido(pedido) {
            const total = pedido.produtos.reduce((total, produto) => {
                if (produto.preco && !isNaN(produto.preco)) {
                    return total + produto.preco;
                }
                return total;
            }, 0);
            return total;
        }
    }
});