class GenixHighlight {

  constructor() {
    this.languages = {};
    this.plugins = [];
    this.theme = {}; // Tema padrão pode ser configurado depois
    this.showLineNumbers = true;
  }

  // Método para registrar plugins personalizados


  use(plugin, options = {}) {
    if (typeof plugin !== 'function') {
      console.warn("Plugin is not a valid function.");
      return;
    }

    // Evita registrar o mesmo plugin duas vezes
    if (this.plugins.includes(plugin)) {
      console.warn("Plugin already registered.");
      return;
    }

    // Executa o plugin passando a instância da biblioteca e opções
    plugin(this, options);

    // Verifica se o plugin realmente adicionou linguagens
    const registeredLanguages = Object.keys(this.languages);
    if (registeredLanguages.length === 0) {
      console.warn("Plugin não registrou nenhuma linguagem.");
    } else {
      console.log(`Linguagens registradas: ${registeredLanguages.join(', ')}`);
    }

    // Adiciona o plugin à lista para evitar duplicação
    this.plugins.push(plugin);
  }



  setShowLineNumbers(value = true) {
    this.showLineNumbers = value;
    return this;
  }

  // Registra uma nova linguagem com suas respectivas definições de tokens
  registerLanguage(name, definition) {
    this.languages[name] = definition;
  }

  // Método highlightAll com opções personalizáveis
  highlightAll(options = { showLineNumbers: true, selector: "pre" }) {
    const selector = `${options.selector || 'pre'} code`;

    document.querySelectorAll(selector).forEach(block => {
      const languageClass = Array.from(block.classList)
        .find(cls => cls.startsWith("language-"))?.split("-")[1];

      if (languageClass && block.textContent.trim()) {
        let rawCode = block.textContent.trim(); // Pega o código escapado

        if (options.showLineNumbers !== undefined) {
          this.setShowLineNumbers(options.showLineNumbers); // Atualiza conforme o valor explícito
        }

        block.innerHTML = this.highlight(rawCode, languageClass); // Realça o código
      }
    });
  }



  // Realça o código fonte de acordo com a linguagem especificada
  highlight(code, language) {
    if (!this.languages[language]) {
      console.warn(`Language '${language}' not registered.`);
      return code;
    }
  
    const lines = code.split('\n'); // Divide o código em linhas
    const highlightedLines = lines.map((line, index) => {
      const lineNumber = index + 1;
      const isErrorLine = /(\/\/ ERROR_LINE|# ERROR_LINE|<!-- ERROR_LINE -->|```ERROR_LINE)/.test(line.trim());
  
      // Remove o identificador da linha antes de tokenizar
      const sanitizedLine = line.replace(/\/\/ ERROR_LINE|# ERROR_LINE|<!-- ERROR_LINE -->|```ERROR_LINE/, '');
  
      // Tokeniza a linha usando a gramática da linguagem
      const tokens = this.tokenize(sanitizedLine, this.languages[language]);
  
      const lineClass = isErrorLine ? 'code-line error-line line-error-indicator' : 'code-line';
      const dataError = isErrorLine ? 'data-error="true"' : '';
      const contentClass = isErrorLine ? 'content-error-indicator' : '';
  
      let renderLine = `<div class="${lineClass}" data-line="${lineNumber}" ${dataError}>
        <span class="line-content ${contentClass}">${tokens}</span>
      </div>`;
  
      if (this.showLineNumbers) {
        renderLine = `<div class="${lineClass}" data-line="${lineNumber}" ${dataError}>
          <span class="line-number">${lineNumber}:</span>
          <span class="line-content ${contentClass}">${tokens}</span>
        </div>`;
      }
  
      return renderLine;
    });
  
    return `<div class="code-block">${highlightedLines.join('')}</div>`;
  }
  

  // Gera uma expressão regular combinada a partir de uma gramática
  generateCombinedRegex(grammar) {
    const allPatterns = Object.entries(grammar).flatMap(([type, patterns]) =>
      (Array.isArray(patterns) ? patterns : [patterns]).map(p => `(?<${type}>${p.source})`)
    );
    return new RegExp(allPatterns.join('|'), 'g');
  }

  // Tokeniza o código fonte com base na gramática fornecida
  tokenize(line, grammar) {
    const combinedRegex = this.generateCombinedRegex(grammar);
    let tokens = [];
    let match;
    let lastIndex = 0;

    while ((match = combinedRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: 'plain',
          content: line.slice(lastIndex, match.index)
        });
      }

      for (const type in match.groups) {
        if (match.groups[type]) {
          tokens.push({
            type,
            content: match.groups[type]
          });
          break;
        }
      }

      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push({
        type: 'plain',
        content: line.slice(lastIndex)
      });
    }

    return tokens.map(t => this.renderToken(t)).join('');
  }

  renderToken(token) {
    const className = `token-${token.type}`;
    const escapedContent = this.escapeHTML(token.content);

    let lastClass = className;
    let lastContent = escapedContent;
    if (token.type === 'line_error') {
      lastContent = lastContent + ' ⚠️';
      lastClass = lastClass + ' line-error-indicator';
    }

    return `<span class="${lastClass}">${lastContent}</span>`;
  }

  // Escapa caracteres HTML
  escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Desescapa HTML
  unescapeHTML(text) {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }




  // Adiciona ou atualiza tokens personalizados para uma linguagem registrada
  addCustomTokens(language, customTokens, replace = false) {
    const existingLanguage = this.languages[language];
    if (!existingLanguage) {
      console.warn(`Language '${language}' not registered.`);
      return;
    }
    console.log('repl ', replace);
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


}

// Instantiate the library
const Genix = new GenixHighlight();
/*
Genix.addCustomTokens('html', {
  keyword: ['doctype', 'html', 'head', 'body', 'meta'],
  operator: ['='],
  attribute:'\bmeta\g'
}, true);
*/
window.Genix = Genix;
module.exports = Genix; // Exportando a instância diretamente

