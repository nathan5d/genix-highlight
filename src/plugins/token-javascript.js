function pluginJSTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        // Register other languages
        keyword: /\b(const|let|var|function|return|if|else)\b/g,
        number: /\b\d+\b/g,
        string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
        comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
        operator: /[+\-*/=<>!%&|^~?]/g,
        punctuation: /[{}[\]()\.;,]/g
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    Genix.registerLanguage('javascript', grammar);
}

module.exports = pluginJSTokenRegister;
