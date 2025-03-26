function pluginHTMLTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        url: /\bhttps?:\/\/[^\s"'<>]+/g, // Captura URLs
        
        valueSq: /'([^']*)'/g, // Valores entre aspas simples
        valueDq: /"([^"]*)"/g, // Valores entre aspas duplas
        keyword: /\b(const|let|var|function|while|return|class|console|break|case|catch|class|clone|const|continue|declare|default|do|echo|if|else|elseif|empty)\b/g,
        
        function: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*(?=\()/g, // Identifica funções
        tag: /<\/?[a-zA-Z][a-zA-Z0-9-]*\b/g, // Captura tags
        tagClose: />/g, // Fechamento de tags
        attribute: /\b[a-zA-Z-:]+\b(?=\s*=)/g, // Atributos
        operator: /[+\-*/=<>!%&|^~?:]/g, // Operadores
        punctuation: /[(){}[\].,;]/g, // Pontuação
        key: /"([^"]+)"(?=\s*:)/g, // Captura chaves JSON
        number: /\b\d+(\.\d+)?\b/g, // Captura números
        string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g, // Captura strings
        comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g, // Captura comentários
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    // Registrar a linguagem HTML
    Genix.registerLanguage('html', grammar);
}

module.exports = pluginHTMLTokenRegister;
