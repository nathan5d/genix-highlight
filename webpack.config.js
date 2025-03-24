const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/js/main.js', // O ponto de entrada principal
  output: {
    filename: 'js/bundle.min.js', // Nome do arquivo JS
    path: path.resolve(__dirname, 'dist'), // Diretório de saída
    clean: true, // Limpa a pasta dist antes de gerar novos arquivos
  },
  mode: 'production', // Configura o Webpack para produção
  module: {
    rules: [
      {
        test: /\.css$/i, // Processa arquivos CSS
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/, // Processa arquivos JS
        exclude: /node_modules/, // Exclui dependências externas
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }], // Transforma ES6+ para versões compatíveis com navegadores
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/styles.min.css', // Nome do arquivo CSS de saída
    }),
  ],
};
