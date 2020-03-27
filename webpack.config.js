const HtmlWebpackPlugin = require("html-webpack-plugin");

const path = require("path")

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      title: "Webpack demo",
    }),
  ],
  // entry: "./src/index.js",
  // output: {
  //   path: path.resolve(__dirname, "dist"),
  //   filename: "bundle.js",
  // },

  module:{
    rules:[{
      test:/\.css$/,
      use:['style-loader','css-loader']
    }]
  },

  devServer: {
    stats: "errors-only",
    overlay: true
    // open: false,
    // publicPath: "",
    // contentBase: path.resolve(__dirname, "dist"),
    // watchContentBase: true,
    // compress: true,
  },
}