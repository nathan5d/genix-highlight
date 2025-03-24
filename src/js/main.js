require('../css/genix-highlight.css'); // Importa o CSS
const GenixHighlight = require('./genix-highlight.js'); // Importa a biblioteca

// Exponha `GenixHighlight` no escopo global
window.Genix = new GenixHighlight();

window.onload = () => {
  Genix.highlightAll(); // Inicializa o destaque de código ao carregar a página
};
