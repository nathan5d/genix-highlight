function pluginCSSTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        // Valores CSS (como px, em, rem, %, #hex, rgba)
        value: /(\b\d+(\.\d+)?(px|em|rem|vh|vw|%|deg|rad|turn|s|ms|ch|in|cm|mm|pt|pc)\b|#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*(?:0|1|0?\.\d+))?\s*\)|\b[a-zA-Z]+\([^)]*\))/g,


        // Seletores CSS (como .classe, #id, element)
        selector: /([.#]?[a-zA-Z0-9_-]+)(?=\s*{)/g,

        // Propriedades CSS (como color, background, font-size)
        property: /\b([a-zA-Z\-]+)\s*(?=:)/g,



        // Comentários CSS
        comment: /\/\*[\s\S]*?\*\//g,

        // Strings (usadas em propriedades como background-image: url('image.png'))
        string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,

        // Operadores e pontuação
        operator: /[+\-*/=<>!%&|^~?]/g,
        punctuation: /[{}[\]()\.;,]/g
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    Genix.registerLanguage('css', grammar);
    Genix.registerLanguage('scss', grammar);  // SCSS também usa a mesma gramática
}

module.exports = pluginCSSTokenRegister;
