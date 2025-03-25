function pluginBashTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        // Comandos Bash (exemplo: ls, cd, echo)
        command: /\b([a-zA-Z0-9_-]+)(?=\s)/g,

        // Variáveis (exemplo: $HOME, $USER)
        variable: /\$\w+/g,

        // Strings (usadas em comandos como echo "Hello World")
        string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,

        // Comentários (comentários de linha única com #)
        comment: /#.*$/g,

        // Operadores (exemplo: &&, ||, ==, !=)
        operator: /\b(and|or|&&|\|\||==|!=)\b/g,

        // Funções definidas (exemplo: my_function())
        function: /\b(\w+)\s*\(/g,

        // Parênteses e outras pontuações
        punctuation: /[{}[\]()\.;,]/g
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    Genix.registerLanguage('bash', grammar);
    Genix.registerLanguage('sh', grammar);  // Também registra 'sh' como sinônimo de bash
}

module.exports = pluginBashTokenRegister;
