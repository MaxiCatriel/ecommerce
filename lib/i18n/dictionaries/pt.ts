export default {
  navbar: { login: 'Entrar', register: 'Registrar', admin: 'Admin', logout: 'Sair' },
  login: { title: 'Entrar', email: 'Email', password: 'Senha', submit: 'Entrar', error: 'Credenciais inválidas', forgotPassword: 'Esqueceu sua senha?' },
  register: { title: 'Criar conta', name: 'Nome', email: 'Email', password: 'Senha', submit: 'Cadastrar' },
  forgotPassword: {
    title: 'Recuperar senha',
    submit: 'Enviar link de recuperação',
    sending: 'Enviando...',
    success: 'Se o email existir, enviamos um link para redefinir sua senha.',
    error: 'Não foi possível processar sua solicitação. Tente novamente.'
  },
  resetPassword: {
    title: 'Redefinir senha',
    newPassword: 'Nova senha',
    confirmPassword: 'Confirmar senha',
    submit: 'Salvar nova senha',
    saving: 'Salvando...',
    success: 'Senha atualizada. Redirecionando para login...',
    invalidToken: 'O link é inválido ou está incompleto.',
    passwordMin: 'A senha deve ter pelo menos 6 caracteres.',
    passwordMismatch: 'As senhas não coincidem.',
    error: 'Não foi possível redefinir a senha. Solicite um novo link.'
  },
  product: { related: 'Produtos relacionados' },
  common: {
    create: 'Criar', save: 'Salvar', delete: 'Excluir',
    price: 'Preço', currency: 'Moeda', description: 'Descrição',
    imageFeaturedUrl: 'URL da imagem destacada', images: 'Imagens (uma URL por linha)',
    addToCart: 'Adicionar ao carrinho', outOfStock: 'Sem estoque', stock: 'Estoque', available: 'Disponível',
    loginToSeePrices: 'Entre para ver os preços',
    loginToBuy: 'Entre para comprar'
  },
  search: {
    title: 'Buscar', results: 'resultados', result: 'resultado',
    noMatch: 'Não há produtos que correspondam a ',
    previous: 'Anterior', next: 'Próximo'
  },
  cart: {
    myCart: 'Meu carrinho', empty: 'Seu carrinho está vazio.', taxes: 'Impostos', shipping: 'Frete',
    calcAtCheckout: 'Calculado no checkout', total: 'Total', checkout: 'Finalizar compra',
    openCart: 'Abrir carrinho', closeCart: 'Fechar carrinho'
  },
  admin: {
    panel: 'Painel de Administração', restricted: 'Acesso restrito. Entre como administrador.', goToLogin: 'Ir para login',
    products: 'Produtos', users: 'Usuários'
  },
  adminProducts: {
    title: 'Produtos', featured: 'Destaques', carousel: 'Carrossel', showOnHome: 'Mostrar na página inicial',
    handle: 'Handle (URL)',
    variants: 'Variações', size: 'Tamanho', color: 'Cor', addVariant: 'Adicionar variação', availableShort: 'Disp.'
  },
  adminUsers: { title: 'Usuários registrados', name: 'Nome', email: 'Email', role: 'Função', created: 'Criado', actions: 'Ações', save: 'Salvar' }
} as const;
