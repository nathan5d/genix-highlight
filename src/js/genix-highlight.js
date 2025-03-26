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
      //console.log(`Linguagens registradas: ${registeredLanguages.join(', ')}`);
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
    const selector = `${options.selector || 'pre'}`;
    document.querySelectorAll(selector).forEach(block => {
     //console.log(`Processing element: ${block.tagName} with class: ${block.className}`);
      this.highlight(block, options); // Reutiliza highlight diretamente
    });
  }

  highlight(className = null, options = { showLineNumbers: true }) {
    if (!className) {
      this.highlightAll(options); // Usa highlightAll como fallback
      return;
    }

    const elements = typeof className === "string"
      ? document.querySelectorAll(className)
      : (className instanceof Element ? [className] : []);

    if (!elements.length) {
      console.warn(`No elements found for selector: ${className}`);
      return;
    }

    elements.forEach(element => {
      // Busca todos os <code> filhos, caso o elemento não tenha `language-xyz`
      const codeBlocks = element.querySelectorAll('code');
      if (codeBlocks.length > 0) {
        codeBlocks.forEach(codeBlock => {
          const languageClass = Array.from(codeBlock.classList)
            .find(cls => cls.startsWith("language-"))?.split("-")[1];

          if (!languageClass || !this.languages[languageClass]) {
            console.warn(`Language '${languageClass}' not registered for element: ${codeBlock.tagName} with class: ${codeBlock.className}`);
            return;
          }


          if (codeBlock.textContent.trim()) {
            const rawCode = codeBlock.textContent.trim();
            if (options.showLineNumbers !== undefined) {
              this.setShowLineNumbers(options.showLineNumbers);
            }

            codeBlock.innerHTML = this.highlightCode(rawCode, languageClass, options);
          }
        });
      } else {
        console.warn(`No <code> blocks found in element: ${element.tagName} with class: ${element.className}`);
      }
    });
  }


  highlightCode(code, language, options = {}) {
    if (!this.languages[language]) {
      throw new Error(`Language '${language}' not registered. Please register the language before highlighting.`);
    }

    const errorPattern = this.createPatternError(options.errorIdentifiers || [
      'ERROR_LINE',
      '// TODO',
      '// FIXME'
    ]);

   //console.log("Compiled Error Pattern:", errorPattern);

    if (!errorPattern || !(errorPattern instanceof RegExp)) {
      console.warn("Failed to create a valid error pattern from identifiers.");
      return code; // Retorna o código original caso a expressão falhe
    }

    const lines = code.split('\n'); // Divide o código em linhas
   //console.log("Original Lines:", lines);

    const highlightedLines = lines.map((line, index) => {
      const lineNumber = index + 1;

      const isErrorLine = errorPattern.test(line);
      const sanitizedLine = line.replace(errorPattern, ''); // Remove e sanitiza espaços extras
     //console.log(`Sanitized Line [${lineNumber}]:`, sanitizedLine);

      /* if (sanitizedLine.length === 0) {
           console.warn(`Empty Line Detected [${lineNumber}]. Skipping.`);
           return ''; // Ignora linhas vazias ou sem conteúdo relevante
       }
*/
      const tokens = this.tokenize(sanitizedLine, this.languages[language]);
     //console.log(`Tokens for Line [${lineNumber}]:`, tokens);

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

    return `<div class="code-block">${highlightedLines.filter(Boolean).join('')}</div>`;
  }



  createPatternError(token) {
    if (Array.isArray(token)) {
      // Cria um padrão consolidado com OR (|) para cada item do array
      const escapedTokens = token.map(t => {
        if (typeof t === 'string') {
          // Escapa caracteres especiais em strings
          return t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        return t;
      });

      return new RegExp(`(${escapedTokens.join('|')})`, 'g'); // Removi \b para evitar problemas com bordas

    }

    if (typeof token === 'string') {
      if (this.isInvalidPattern(token)) {
        console.warn(`Invalid pattern found: ${token}`);
        return null;
      }
      return new RegExp(`\\${token}\\`, 'g');
    }

    if (token instanceof RegExp) {
      return token; // Retorna diretamente se já for uma regex
    }

    console.warn("Invalid token format provided.");
    return null;
  }
  // Cria uma expressão regular a partir de um padrão de token
  createPattern(token) {
    if (Array.isArray(token)) {
      // Cria um padrão consolidado com OR (|) para cada item do array
      const escapedTokens = token.map(t => {
        if (typeof t === 'string') {
          // Escapa caracteres especiais em strings
          return t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        return t;
      });
     //console.log('array ', token)
      //return new RegExp(`(${escapedTokens.join('|')})`, 'g'); // Removi \b para evitar problemas com bordas
      return new RegExp(`(${escapedTokens.join('|')})`, 'g'); // Removi \b para evitar problemas com bordas

    }

    if (typeof token === 'string') {
      if (this.isInvalidPattern(token)) {
        console.warn(`Invalid pattern found: ${token}`);
        return null;
      }
     //console.log('string ', token)
      return new RegExp(`\\b${token}\\b`, 'g');
    }

    if (token instanceof RegExp) {
      return token; // Retorna diretamente se já for uma regex
    }

    console.warn("Invalid token format provided.");
    return null;



  }


  // Verifica se um padrão é inválido (por exemplo, se contém operadores de incremento)
  isInvalidPattern(pattern) {
    return pattern.includes('++') || pattern.includes('**') || pattern.includes('..');
  }




  // Gera uma expressão regular combinada a partir de uma gramática
  generateCombinedRegex(grammar) {
    const allPatterns = Object.entries(grammar).flatMap(([type, patterns]) =>
      (Array.isArray(patterns) ? patterns : [patterns]).map(p => `(?<${type}>${p.source})`)

    );
    return new RegExp(allPatterns.join('|'), 'g');
  }

  transformTypeToClassName(type) {
   //console.log('replace type ', type);
    // Converte letras maiúsculas para kebab-case
    return type.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }


  // Tokeniza o código fonte com base na gramática fornecida
  tokenize(line, grammar) {
    const combinedRegex = this.generateCombinedRegex(grammar);
    let tokens = [];
    const matches = [...line.matchAll(combinedRegex)];
    let lastIndex = 0;

    matches.forEach(match => {
      if (match.index > lastIndex) {
        const plainContent = line.slice(lastIndex, match.index);
        if (plainContent) {
          tokens.push({
            type: 'string',
            content: plainContent
          });
        }
      }

      let matchedType = null;

      for (const type in match.groups) {
        if (match.groups[type]) {
          matchedType = type;
         //console.log('Matched Type:', type);
          tokens.push({
            type: this.transformTypeToClassName(type), // Transforma diretamente o `type` para kebab-case
            content: match.groups[type]
          });
          break;
        }
      }

      lastIndex = match.index + match[0].length;

      if (!matchedType) {
        console.warn("No valid group matched.");
      }
    });

    if (lastIndex < line.length) {
      const remainingText = line.slice(lastIndex);
      if (remainingText.trim()) {
        tokens.push({
          type: 'string',
          content: remainingText
        });
      }
    }

    return tokens.map(t => this.renderToken(t)).join('');
  }


  //bkp
  tokenizeBKP(line, grammar) {
    const combinedRegex = this.generateCombinedRegex(grammar);
    let tokens = [];
    let match;
    let lastIndex = 0;
    let lastType = 'plain'; // Inicializa com 'plain' como tipo padrão

    // Captura todas as correspondências de uma vez
    while ((match = combinedRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        const plainContent = line.slice(lastIndex, match.index);
        tokens.push({
          type: 'string', //lastType, // Usa o último tipo válido
          content: plainContent
        });
      }

      let matchedType = null;

      for (const type in match.groups) {
        if (match.groups[type]) {
          matchedType = type; // Registra o tipo detectado
          tokens.push({
            type,
            content: match.groups[type]
          });
          lastType = type; // Atualiza o tipo válido
          break;
        }
      }

      // Caso nenhum grupo seja válido, mantém o tipo anterior
      if (!matchedType) {
        console.warn("No valid group matched. Continuing with last type:", lastType);
      }

      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      const remainingText = line.slice(lastIndex);
      tokens.push({
        type: lastType, // Usa o último tipo válido para o restante
        content: remainingText
      });
    }

    return tokens.map(t => this.renderToken(t)).join('');
  }


  renderToken(token) {
    const className = `hl-token-${token.type}`;
    const escapedContent = this.escapeHTML(token.content);

    let finalClass = className;
    let finalContent = escapedContent;

    // Caso seja um parêntese associado a uma função
    if (token.type === 'punctuation' && (token.content === '(' || token.content === ')')) {
      finalClass = `${className} hl-token-function-paren`;
    }

    return `<span class="${finalClass}">${finalContent}</span>`;
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

