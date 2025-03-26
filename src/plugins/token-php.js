function pluginPHPTokenRegister(Genix, options = {}) {
    const defaultGrammar = {
        valueSq: /'([^']*)'/g, // Valores entre aspas simples
        valueDq: /"([^"]*)"/g, // Valores entre aspas duplas
        keyword: /\b(abstract|and|array|as|break|case|catch|class|clone|const|continue|declare|default|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|interface|isset|list|match|namespace|new|or|print|private|protected|public|readonly|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/g,
        function: /\b(file_exists|__construct|require|require_once|include|isset|empty|echo|date|time)\b/g,
        function: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*(?=\()/g,//callback
        number: /\b\d+\b/g,
        string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
        comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
        operator: /[+\-*/=<>!%&|^~?]/g,
        punctuation: /[{}[\]()\(())\.;,]/g,
        text:/#.*|\/\*[\s\S]*?\*\//g,
        variable: /\$\w+/g
    };

    // Permite que o usuário sobrescreva partes da gramática
    const grammar = { ...defaultGrammar, ...options };

    Genix.registerLanguage('php', grammar);
}

module.exports = pluginPHPTokenRegister;
