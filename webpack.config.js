const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyFilePlugin = require("webpack-copy-file-plugin");

// 最小化生产
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const tsConfig = require("./tsconfig.json");
const packageConfig = require("./package.json");

function parseTsConfigPaths(tsConfig) {
  const { paths, baseUrl } = tsConfig.compilerOptions;
  const alias = {};
  if (paths) {
    for (const aliasPath in paths) {
      const key = aliasPath.replace(/\/\*$/, "");
      const value = paths[aliasPath][0].replace(/\/\*$/, "");
      alias[key] = path.resolve(__dirname, baseUrl, value);
    }
  }
  return alias;
}

const webpackExternals = {
  // lodash: {
  //   cdn: version =>
  //     `https://cdnjs.cloudflare.com/ajax/libs/lodash.js/${version}/lodash.min.js`,
  //   root: "_",
  //   commonjs2: "_",
  //   commonjs: "_",
  //   amd: "_"
  // }
};

const htmlWebpackPluginExternals = (() => {
  const dependencies = packageConfig.dependencies;
  const result = [];
  for (const libKey in webpackExternals) {
    const version = dependencies[libKey].replace(/^\D/, "");
    result.push(webpackExternals[libKey].cdn(version));
  }
  return result;
})();

module.exports = {
  mode: "development", // production or development
  entry: {
    main: path.resolve(__dirname, "src/index.ts")
  },
  externals: webpackExternals,
  // devtool: "inline-source-map", // 生成map文件
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              sourceMap: true,
              exec: true,
              plugins: loader => [
                require("postcss-import")({ root: loader.resourcePath }),
                require("postcss-preset-env")(),
                require("cssnano")()
              ]
            }
          }
        ]
      },
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1 } },
          "stylus-loader"
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(csv|tsv)$/,
        use: ["csv-loader"]
      },
      {
        test: /\.xml$/,
        use: ["xml-loader"]
      },
      {
        test: /\.html$/,
        exclude: [/node_modules/, path.resolve(__dirname, "index.html")],
        use: { loader: "html-loader" }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],

    // 如果要配置路径别名，就在/tsconfig.json里面配置
    alias: {
      ...parseTsConfigPaths(tsConfig)
    }
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name]-[hash].css",
      chunkFilename: "[id].css"
    }),
    new HtmlWebpackPlugin({
      inject: false,
      title: "webpack-scaffold",
      template: "index.html",
      cnd: htmlWebpackPluginExternals
    })
    // new CopyFilePlugin(["./README.md"].map(f => path.resolve(__dirname, f)))
  ],
  output: {
    filename: "[name]-[hash].js",
    path: path.resolve(__dirname, tsConfig.compilerOptions.outDir),

    // 如果发布第三方包，可以启动下面这三个配置
    // library: "packageName",
    libraryTarget: "umd",
    globalObject: "this"

    // <img src="./x.png" />
    // publicPath: './',

    // <img src="./static/x.png" />
    // publicPath: './static',
  }
};
