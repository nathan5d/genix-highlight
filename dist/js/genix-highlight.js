class GenixHighlight {
  constructor() {
    this.languages = {};
  }

  registerLanguage(name, definition) {
    this.languages[name] = definition;
  }

  highlight(code, language) {
    if (!this.languages[language]) {
      console.warn(`Linguagem '${language}' não registrada.`);
      return code;
    }
    return this.tokenize(code, this.languages[language]);
  }

  tokenize(code, grammar) {
    let tokens = [{ type: 'plain', content: code }];
  
    // Itera sobre as regras do grammar para aplicar tokenização
    Object.keys(grammar).forEach(type => {
      const patterns = grammar[type];  // Agora 'patterns' pode ser um array de expressões regulares
  
      // Verifica se o padrão é um array
      const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
  
      patternsArray.forEach(pattern => {
        // Se o padrão não for uma regex, não faz sentido usá-lo
        if (!(pattern instanceof RegExp)) {
          console.warn(`O padrão para o tipo '${type}' não é uma expressão regular.`);
          return;
        }
  
        const newTokens = [];
  
        tokens.forEach(token => {
          if (token.type === 'plain') {
            let match;
            let lastIndex = 0;
            const content = token.content;
  
            // Usa regex para encontrar correspondências
            while ((match = pattern.exec(content)) !== null) {
              // Adiciona conteúdo antes da correspondência como 'plain'
              if (match.index > lastIndex) {
                newTokens.push({
                  type: 'plain',
                  content: content.slice(lastIndex, match.index)
                });
              }
  
              // Adiciona o match como o tipo especificado
              newTokens.push({
                type: type,
                content: match[0]
              });
  
              lastIndex = pattern.lastIndex;
            }
  
            // Adiciona o restante do conteúdo como 'plain'
            if (lastIndex < content.length) {
              newTokens.push({
                type: 'plain',
                content: content.slice(lastIndex)
              });
            }
          } else {
            newTokens.push(token); // Mantém tokens não processados
          }
        });
  
        tokens = newTokens;
      });
    });
  
    // Aplica o estilo global, mas sem envolver o código HTML em <span>
    return this.stringify(tokens);
  }
  
  

  addCustomTokens(language, customTokens, replace = false) {
    const existingLanguage = this.languages[language];
    if (existingLanguage) {
      Object.keys(customTokens).forEach(type => {
        const customPattern = this.createPattern(customTokens[type]);
  
        // Verifica se o tipo é 'variable' e se é um padrão válido
        if (type === 'variable' && !(customPattern instanceof RegExp)) {
          console.warn(`O padrão para 'variable' deve ser uma expressão regular válida.`);
          return;
        }
  
        // Verifica se o tipo de token já existe
        if (!existingLanguage[type]) {
          // Se o tipo não existir, cria um novo padrão
          existingLanguage[type] = Array.isArray(customPattern) ? customPattern : [customPattern];
        } else {
          // Caso já exista, verifica se é um array antes de tentar iterar
          if (replace) {
            // Se substituir, apenas substitui o valor
            existingLanguage[type] = Array.isArray(customPattern) ? customPattern : [customPattern];
          } else {
            // Se não substituir, adiciona ao array existente (garantindo que seja um array)
            if (Array.isArray(existingLanguage[type])) {
              existingLanguage[type] = [
                ...existingLanguage[type],
                ...(Array.isArray(customPattern) ? customPattern : [customPattern]) // Garante que seja um array
              ];
            } else {
              existingLanguage[type] = [existingLanguage[type], ...(Array.isArray(customPattern) ? customPattern : [customPattern])];
            }
          }
        }
      });
    } else {
      console.warn(`Linguagem '${language}' não registrada.`);
    }
  }
  
  
  
  createPattern(token) {
    if (Array.isArray(token)) {
      return token.map(item => this.createPattern(item)).filter(Boolean); // Filtra valores nulos
    }
  
    if (typeof token === 'string') {
      if (token.includes('++') || token.includes('**') || token.includes('..')) {
        console.warn(`Padrão inválido encontrado: ${token}`);
        return null; // Retorna null se o padrão for inválido
      }
      return new RegExp(`\\b${token}\\b`, 'g');
    }
  
    if (token instanceof RegExp) {
      return token;
    }
  
    return null; // Caso o token não seja válido
  }
  
  
  

  stringify(tokens) {
    return tokens
      .map(token => `<span class="token-${token.type}">${this.escapeHTML(token.content)}</span>`)
      .join('');
  }

  escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  highlightAll(selector = "pre code") {
    document.querySelectorAll(selector).forEach(block => {
      const languageClass = Array.from(block.classList)
        .find(cls => cls.startsWith("language-"))?.split("-")[1];

      if (languageClass) {
        block.innerHTML = this.highlight(block.textContent.trim(), languageClass);
      }
    });
  }
}

// Instancia a biblioteca
const Genix = new GenixHighlight();

// Registro de linguagens básicas
Genix.registerLanguage('php', {
  //keyword: /\b(if|else|elseif|var|function|return|if|else)\b/g,
  number: /\b\d+\b/g,
  string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g,
  comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
  operator: /[+\-*/=<>!%&|^~?]/g,
  punctuation: /[{}[\]()\.;,]/g
});



console.log(Genix.languages.php); // Verifique os tokens registrados


// Registro de outras linguagens
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

// Exporta a biblioteca
window.GenixHighlight = Genix;
window.onload = () => {
  Genix.highlightAll();
};
