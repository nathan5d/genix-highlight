function pluginJSTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        valueSq: /'([^']*)'/g, // Valores entre aspas simples
        valueDq: /"([^"]*)"/g, // Valores entre aspas duplas

        keyword: /\b(const|let|var|function|while|return|class|console|break|case|catch|class|clone|const|continue|declare|default|do|echo|if|else|elseif|empty)\b/g,
       
        //function: /\b(function|log|className|getAttribute)\b/g,
        function: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*(?=\()/g,
        functionName: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*(?=\()/g,

        properties: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
        punctuation: /[(){}[\].,;]/g,
        object: /\bnew\s+[A-Za-z_$][A-Za-z0-9_$]*\b|{[^}]*}/g,
        comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
        boolean: /\b(true|false)\b/g,
        number: /\b\d+(\.\d+)?\b/g,
        string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
        operator: /[+\-*/=<>!%&|^~?:]/g,
        // Nova regex para identificar "keys" (chaves dentro de objetos ou JSON)
        key: /"([^"]+)"(?=\s*:)/g
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    // Registra a linguagem com a gramática ajustada
    Genix.registerLanguage('javascript', grammar);
}

module.exports = pluginJSTokenRegister;
