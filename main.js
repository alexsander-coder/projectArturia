new Vue({
    el: '.container',
    data() {
        return {
            produtos: [],
            carrinho: [],
            pedidos: [],
            mostrarPedidos: false,
        };
    },
    created() {
        this.iniciarIndexedDB();
    },
    methods: {
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
                const db = event.target.result;
                this.carregarProdutos(db);
                this.adicionarProdutos(db);
            };

            request.onerror = (event) => {
                console.error('Erro ao abrir o banco IndexedDB', event);
            };
        },

        carregarProdutos(db) {
            const transaction = db.transaction(['produtos'], 'readonly');
            const objectStore = transaction.objectStore('produtos');
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                this.produtos = event.target.result;
            };

            request.onerror = (event) => {
                console.error('Erro ao carregar produtos', event);
            };
        },
        adicionarProdutos(db) {
            const transaction = db.transaction(['produtos'], 'readwrite');
            const objectStore = transaction.objectStore('produtos');

            const produtosIniciais = [
                { nome: 'Camiseta Polo', preco: 79.90, imagem: 'https://static.zattini.com.br/produtos/camisa-polo-lacoste-piquet-slim-fit-gola-contraste-masculina/16/D66-1192-016/D66-1192-016_zoom1.jpg?' },
                { nome: 'Tênis Nike Air Max', preco: 499.99, imagem: 'https://th.bing.com/th/id/OIP.rZrvWLmdoYRScIVG4J7BqwHaHa?rs=1&pid=ImgDetMain' },
                { nome: 'Livro "O Senhor dos Anéis"', preco: 59.90, imagem: 'https://http2.mlstatic.com/livro-o-senhor-dos-aneis-j-r-r-tolkien-volume-unico-D_NQ_NP_854025-MLB27251586889_042018-F.jpg' },
                { nome: 'Fone de Ouvido JBL', preco: 199.90, imagem: 'https://th.bing.com/th/id/OIP.hCM1wqLE8EaFKE8hF0_-rgAAAA?rs=1&pid=ImgDetMain' },
                { nome: 'Relógio Casio', preco: 120.00, imagem: 'https://th.bing.com/th/id/R.8a55d9995e4c09cc7b752968a9992d87?rik=Lql54fItFVhXXg&pid=ImgRaw&r=0' },
                { nome: 'Cadeira Gamer', preco: 399.90, imagem: 'https://th.bing.com/th/id/OIP.QLpMK-K0eOuJ2XMGGQwKTwHaE7?rs=1&pid=ImgDetMain' }
            ];

            const request = objectStore.getAll();
            request.onsuccess = (event) => {
                if (event.target.result.length === 0) {
                    produtosIniciais.forEach(produto => {
                        const produtoCorreto = {
                            nome: produto.nome,
                            preco: produto.preco,
                            imagem: produto.imagem
                        };
                        const addRequest = objectStore.add(produtoCorreto);
                        addRequest.onsuccess = () => {
                            console.log('Produto adicionado com sucesso:', produtoCorreto);
                        };
                        addRequest.onerror = (event) => {
                            console.error('Erro ao adicionar produto:', event);
                        };
                    });
                }
            };

            request.onerror = (event) => {
                console.error('Erro ao verificar produtos existentes', event);
            };
        },

        adicionarAoCarrinho(produto) {
            this.carrinho.push(produto);
        },

        removerDoCarrinho(index) {
            this.carrinho.splice(index, 1);
        },

        finalizarPedido() {
            if (this.carrinho.length > 0) {
                this.pedidos.push([...this.carrinho]);
                this.carrinho = [];
                alert('Pedido finalizado com sucesso!');
            } else {
                alert('O carrinho está vazio!');
            }
        },

        consultarPedidos() {
            this.mostrarPedidos = !this.mostrarPedidos;
        },

        expandirPedido(index) {
            this.pedidos[index].expandido = !this.pedidos[index].expandido;
        }
    }
});
