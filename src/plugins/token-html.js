function pluginHTMLTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        // Captura as tags de abertura e fechamento
        tag: /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g, // Captura tags
        tagName: /<\/?([a-zA-Z][a-zA-Z0-9-]*)/g, // Captura apenas o nome da tag
        punctuation: [/^&lt;\/?/, /&gt;$/], // Captura <, > e /
        
        // Captura atributos, incluindo atributos booleanos como checked, disabled, etc.
        attribute: /\b[a-zA-Z-:]+(?=\s*=|\s|\/?>)/g,
        
        // Captura o valor dos atributos
        attributeValue: /=(["'])(.*?)\1/g, // Captura o valor dos atributos, com as aspas
        
        // Captura o operador de atribuição "="
        operator: /=/g,

        // Captura strings dentro dos atributos
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    // Registrar a linguagem HTML
    Genix.registerLanguage('html', grammar);
}

module.exports = pluginHTMLTokenRegister;
