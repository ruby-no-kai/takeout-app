const path = require("path");
const glob = require("glob");
const WebpackAssetsManifest = require("webpack-assets-manifest");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const { NODE_ENV } = process.env;
const isProd = NODE_ENV === "production";
const devTool = isProd ? {} : { devtool: "source-map" };

const entries = {};
glob.sync("app/javascript/packs/*.{ts,tsx}").forEach((filePath) => {
  const name = path.basename(filePath, path.extname(filePath));
  entries[name] = path.resolve(__dirname, filePath);
});

module.exports = [
  {
    ...devTool,
    mode: isProd ? "production" : "development",
    entry: entries,
    output: {
      path: path.resolve(__dirname, "public/packs"),
      publicPath: "/packs/",
      filename: isProd ? "[name]-[contenthash].js" : "[name].js",
    },
    optimization: {
      splitChunks: {
        name: "vendor",
        chunks: "initial",
      },
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: false,
            compress: {
              ecma: "2017",
            },
          },
        }),
      ],
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx"],
    },
    module: {
      rules: [
        {
          // https://github.com/aws-samples/amazon-ivs-player-web-sample/blob/master/webpack.config.js
          test: /[\/\\]amazon-ivs-player[\/\\].*dist[\/\\]assets[\/\\]/,
          loader: "file-loader",
          type: "javascript/auto",
          options: {
            name: "[name].[ext]",
          },
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                url: false,
              },
            },
            "sass-loader",
          ],
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                url: false,
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          exclude: /node_module/,
          use: {
            loader: "ts-loader",
            options: {
              instance: "main",
            },
          },
        },
      ],
    },
    plugins: [
      new WebpackAssetsManifest({ publicPath: true, output: "manifest.json" }),
      new MiniCssExtractPlugin({
        filename: isProd ? "[name]-[contenthash].css" : "[name].css",
      }),
    ],
  },
];
