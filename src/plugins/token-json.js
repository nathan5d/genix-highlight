function pluginJSONTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        key: /"(\w+)":/g,
        string: /"([^"\\]*(\\.[^"\\]*)*)"/g,
        number: /\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/g,
        boolean: /\b(true|false)\b/g,
        null: /\bnull\b/g,
        punctuation: /[{}[\],:]/g
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    Genix.registerLanguage('json', grammar);
}

module.exports = pluginJSONTokenRegister;
