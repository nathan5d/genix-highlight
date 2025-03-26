function pluginHTMLTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        tag: /<\/?[a-zA-Z][a-zA-Z0-9-]*\b/g, // Detecta o nome da tag
        url: /\bhttps?:\/\/[^\s"'<>]+/g, // Detecta URLs
        attribute: /\b[a-zA-Z-:]+\b(?=\s*=)/g, // Nomes de atributos antes do "="
        value: /(["'])(?:(?=(\\?))\2.)*?\1/g, // Valores entre aspas
        operator: /[=]/g, // Operador "="
        punctuation: /[<>/"]/g, // Caracteres de pontuação
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    // Registrar a linguagem HTML
    Genix.registerLanguage('html', grammar);
}

module.exports = pluginHTMLTokenRegister;
