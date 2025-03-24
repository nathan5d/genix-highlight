class GenixHighlight {
  constructor() {
    this.languages = {};
    this.plugins = [];
    this.theme = {}; // Tema padrão pode ser configurado depois
  }

  // Método para registrar plugins personalizados
  use(plugin) {
    if (typeof plugin === 'function') {
      plugin(this); // Executa o plugin passando o objeto GenixHighlight
    } else {
      console.warn("Plugin is not a valid function.");
    }
  }


  // Registra uma nova linguagem com suas respectivas definições de tokens
  registerLanguage(name, definition) {
    this.languages[name] = definition;
  }

  // Realça o código fonte de acordo com a linguagem especificada
  highlight(code, language) {
    if (!this.languages[language]) {
      console.warn(`Language '${language}' not registered.`);
      return code;
    }

    // Realça o código utilizando o tokenizer
    const highlighted = this.tokenize(code, this.languages[language]);
    return highlighted;
  }



  // Gera uma expressão regular combinada a partir de uma gramática
  generateCombinedRegex(grammar) {
    const allPatterns = Object.entries(grammar).flatMap(([type, patterns]) =>
      (Array.isArray(patterns) ? patterns : [patterns]).map(p => `(?<${type}>${p.source})`)
    );
    return new RegExp(allPatterns.join('|'), 'g');
  }

  // Tokeniza o código fonte com base na gramática fornecida
  tokenize(code, grammar) {
    const combinedRegex = this.generateCombinedRegex(grammar);
    let tokens = [];
    let match;
    let lastIndex = 0;
    let iterationLimit = 1000;
    let currentLine = 1;
    let lineTokens = [];

    while ((match = combinedRegex.exec(code)) !== null && iterationLimit-- > 0) {
      if (match.index > lastIndex) {
        // Se o código anterior não foi matchado, adicionar como "plain"
        tokens.push({ type: 'plain', content: code.slice(lastIndex, match.index), line: currentLine });
        lineTokens.push(code.slice(lastIndex, match.index));
      }

      for (const type in match.groups) {
        if (match.groups[type]) {
          // Identificar erro (por exemplo, se um token inválido ou inesperado for encontrado)
          let tokenType = type;
          if (this.isErrorToken(match.groups[type])) {
            tokenType = 'error'; // Altera o tipo para 'error' caso haja erro
          }
          tokens.push({ type: tokenType, content: match.groups[type], line: currentLine });
          lineTokens.push(match.groups[type]);
          break;
        }
      }

      lastIndex = combinedRegex.lastIndex;
      // Se encontramos um salto de linha, incrementa o contador de linhas
      if (code[match.index] === '\n') {
        currentLine++;
      }
    }

    if (lastIndex < code.length) {
      tokens.push({ type: 'plain', content: code.slice(lastIndex), line: currentLine });
    }

    return this.stringify(tokens);
  }

  isErrorToken(token) {
    // Aqui você pode verificar condições que indicam erro, como sintaxe incorreta, caracteres inválidos, etc.
    return token.includes('INVALID_SYNTAX');  // Exemplo fictício de erro
  }


  // Adiciona ou atualiza tokens personalizados para uma linguagem registrada
  addCustomTokens(language, customTokens, replace = false) {
    const existingLanguage = this.languages[language];
    if (!existingLanguage) {
      console.warn(`Language '${language}' not registered.`);
      return;
    }

    Object.keys(customTokens).forEach(type => {
      const tokenPatterns = this.createPattern(customTokens[type]);

      if (!existingLanguage[type] || replace) {
        existingLanguage[type] = Array.isArray(tokenPatterns) ? tokenPatterns : [tokenPatterns];
      } else {
        const combinedPatterns = new Set([
          ...(Array.isArray(existingLanguage[type]) ? existingLanguage[type] : [existingLanguage[type]]),
          ...(Array.isArray(tokenPatterns) ? tokenPatterns : [tokenPatterns])
        ]);

        existingLanguage[type] = [...combinedPatterns];
      }
    });
  }

  // Cria uma expressão regular a partir de um padrão de token
  createPattern(token) {
    if (Array.isArray(token)) {
      return token.map(item => this.createPattern(item)).filter(Boolean);
    }

    if (typeof token === 'string') {
      if (this.isInvalidPattern(token)) {
        console.warn(`Invalid pattern found: ${token}`);
        return null;
      }
      return new RegExp(`\\b${token}\\b`, 'g');
    }

    if (token instanceof RegExp) {
      return token;
    }

    // Verifica se a RegExp é válida
    try {
      new RegExp(token);
    } catch (e) {
      console.warn(`Invalid regular expression: ${token}`);
      return null;
    }

    return null;
  }


  // Verifica se um padrão é inválido (por exemplo, se contém operadores de incremento)
  isInvalidPattern(pattern) {
    return pattern.includes('++') || pattern.includes('**') || pattern.includes('..');
  }

  // Define um tema para o realce de código
  setTheme(theme) {
    this.theme = theme;
  }

  // Converte tokens em HTML, aplicando as classes de estilo
  // Converte tokens em HTML, aplicando as classes de estilo
  // Converte tokens em HTML, aplicando as classes de estilo
// Converte tokens em HTML, aplicando as classes de estilo
stringify(tokens) {
  return tokens
      .map(token => {
          // Verifica se o token já possui uma classe definida
          let className = this.theme?.[token.type] || `token-${token.type}`;

          // Caso o token seja de erro, adiciona a classe 'error' ao className
          const errorClass = token.type === 'error' ? ' error' : '';

          const finalClass = `${className}${errorClass}`;

          // Preservando a indentação do código
          const escapedContent = this.escapeHTML(token.content).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');

          return `<span class="${finalClass}">${escapedContent}</span>`;
      })
      .join('');
}





  highlightLineWithError(code, lineNumber) {
    const lines = code.split('\n');
    // Destaca a linha com erro, adicionando uma classe ou conteúdo visual
    lines[lineNumber - 1] = `<span class="error-line-indicator">→ </span><span class="error-highlight">${lines[lineNumber - 1]}</span>`;
    return lines.join('\n');
  }




  // Verifica se o conteúdo é HTML
  isHTML(content) {
    const regex = /<\/?[a-z][\s\S]*>/i; // Detecta tags HTML simples
    return regex.test(content);
  }

  // Escapa caracteres HTML, mas trata o PHP corretamente
  escapeHTML(text, isPHP = false) {
    let result = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // Caso seja PHP, escapa também os comentários
    if (isPHP) {
      result = result
        .replace(/<!--/g, '&lt;!--')
        .replace(/-->/g, '--&gt;');
    }

    return result;
  }



  highlightAll(selector = "pre code") {
    document.querySelectorAll(selector).forEach(block => {
      const languageClass = Array.from(block.classList)
        .find(cls => cls.startsWith("language-"))?.split("-")[1];

      if (languageClass && block.textContent.trim()) {
        let rawCode = block.textContent.trim(); // Pega o código escapado
        block.innerHTML = this.highlight(rawCode, languageClass); // Realça o código
      }
    });
  }

}

// Instantiate the library
const Genix = new GenixHighlight();

Genix.registerLanguage('php', {
  keyword: /\b(abstract|and|array|as|break|case|catch|class|clone|const|continue|declare|default|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|interface|isset|list|match|namespace|new|or|print|private|protected|public|readonly|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/g,
  function: /\b(file_exists|__construct|__destruct|__call|__callStatic|__get|__set|__isset|__unset|__sleep|__wakeup|__serialize|__unserialize|__toString|__invoke|__debugInfo|require|require_once|include|include_once|die|exit|eval|isset|empty|print|echo|define|defined|trigger_error|user_error|set_error_handler|restore_error_handler|set_exception_handler|restore_exception_handler|get_declared_classes|get_class_methods|get_class_vars|get_object_vars|get_defined_functions|get_defined_vars|get_included_files|get_required_files|error_reporting|ini_get|ini_set|memory_get_usage|memory_get_peak_usage|phpinfo|phpversion|php_uname|realpath_cache_size|realpath_cache_get|uniqid|time|date|strtotime|mktime|microtime|gmdate|getdate|localtime|checkdate|strftime|idate|gmstrftime|strtotime|date_default_timezone_set|date_default_timezone_get|timezone_identifiers_list|timezone_name_get|timezone_name_from_abbr|timezone_offset_get|timezone_transitions_get|timezone_location_get|timezone_open|date_sunrise|date_sunset)\b/g,
  number: /\b\d+\b/g,
  string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
  comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
  operator: /[+\-*/=<>!%&|^~?]/g,
  punctuation: /[{}[\]()\.;,]/g,
  variable: /\$\w+/g
});

console.log(Genix.languages.php); // Check registered tokens

// Register other languages
Genix.registerLanguage('javascript', {
  keyword: /\b(const|let|var|function|return|if|else)\b/g,
  number: /\b\d+\b/g,
  string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
  comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
  operator: /[+\-*/=<>!%&|^~?]/g,
  punctuation: /[{}[\]()\.;,]/g
});

Genix.registerLanguage('json', {
  key: /"(\w+)":/g,
  string: /"([^"\\]*(\\.[^"\\]*)*)"/g,
  number: /\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/g,
  boolean: /\b(true|false)\b/g,
  null: /\bnull\b/g,
  punctuation: /[{}[\],:]/g
});

Genix.registerLanguage('html', {
  tag: /&lt;\/?[a-zA-Z][a-zA-Z0-9-]*\b[^&gt;]*&gt;/g, // Captura tags (incluindo auto-fechamento e traços em nomes de tags)
  attribute: /\b[a-zA-Z-]+(?==)/g, // Captura atributos como charset, data-* ou aria-label
  string: /(["'])(?:(?=(\\?))\2.)*?\1/g, // Captura strings entre aspas simples ou duplas
  punctuation: /(&lt;|&gt;|=|\/)/g, // Captura <, >, = e /
});




// Export the library
window.Genix = Genix;
// Exporta `Genix` como uma variável global no navegador
window.onload = () => {
  Genix.highlightAll();
};
