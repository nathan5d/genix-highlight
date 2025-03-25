function pluginPythonTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        // Palavras-chave em Python
        keyword: /\b(def|class|if|else|elif|while|for|return|import|from|try|except|finally|with|lambda|True|False|None|is|in)\b/g,
        
        // Números inteiros e floats
        number: /\b\d+(\.\d+)?\b/g,

        // Strings (simples, duplas ou com aspas triplas)
        string: /(['"`])(?:\\.|(?!\1)[^\\\n])*\1/g,

        // Comentários (de linha ou múltiplas linhas)
        comment: /#.*|\/\*[\s\S]*?\*\//g,

        // Operadores (como +, -, *, etc.)
        operator: /[+\-*/=<>!%&|^~?]/g,

        // Pontuação (parênteses, colchetes, etc.)
        punctuation: /[{}[\]()\.;,]/g
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    Genix.registerLanguage('python', grammar);
}

module.exports = pluginPythonTokenRegister;
