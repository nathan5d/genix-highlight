function pluginJSTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        keyword: /\b(const|let|var|function|return|if|else|for|while|break)\b/g,
        function: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/g,
        function: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*(?=\()/g,
        punctuation: /[(){}[\].,;]/g,
        object: /\bnew\s+[A-Za-z_$][A-Za-z0-9_$]*\b|{[^}]*}/g,
        boolean: /\b(true|false)\b/g,
        number: /\b\d+(\.\d+)?\b/g,
        string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
        operator: /[+\-*/=<>!%&|^~?:]/g,
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    // Registra a linguagem com a gramática ajustada
    Genix.registerLanguage('javascript', grammar);
}

module.exports = pluginJSTokenRegister;
