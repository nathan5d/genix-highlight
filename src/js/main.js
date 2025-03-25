// Importa CSS e a biblioteca principal
require('../css/genix-highlight.css');
const Genix = require('./genix-highlight.js');

// Importa plugins para linguagens
const pluginPHPTokenRegister = require('../plugins/token-php.js');
const pluginHTMLTokenRegister = require('../plugins/token-html.js');
const pluginJSTokenRegister = require('../plugins/token-javascript.js');
const pluginJSONTokenRegister = require('../plugins/token-json.js');
const pluginPythonTokenRegister = require('../plugins/token-python.js');
const pluginCSSTokenRegister = require('../plugins/token-css.js');
const pluginBashTokenRegister = require('../plugins/token-bash.js');

// Usa os plugins
Genix.use(pluginPHPTokenRegister);
Genix.use(pluginHTMLTokenRegister);
Genix.use(pluginJSTokenRegister);
Genix.use(pluginJSONTokenRegister);
Genix.use(pluginPythonTokenRegister);
Genix.use(pluginCSSTokenRegister);
Genix.use(pluginBashTokenRegister);

// Expor `Genix` no escopo global
window.Genix = Genix;
