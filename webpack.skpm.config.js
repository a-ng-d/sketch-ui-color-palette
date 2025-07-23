const Dotenv = require("dotenv-webpack");
const path = require("path");

module.exports = function (config, entry) {
  config.plugins = config.plugins || [];
  config.plugins.push(
    new Dotenv({
      path: path.resolve(__dirname, ".env.local"),
      systemvars: true,
    })
  );

  config.node = entry.isPluginCommand
    ? false
    : {
        setImmediate: false,
      };

  config.resolve = {
    ...config.resolve,
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      ...config.resolve.alias,
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "@ui-lib": require("path").resolve(
        __dirname,
        "packages/ui-ui-color-palette/src"
      ),
    },
  };

  config.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          [
            "@babel/preset-react",
            {
              runtime: "automatic",
              importSource: "preact",
            },
          ],
        ],
        plugins: [
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
        ],
      },
    },
  });

  config.module.rules.push({
    test: /\.(js|jsx)$/,
    include: [
      /node_modules\/@sentry/,
      /node_modules\/@sentry-internal/,
      /node_modules\/@a_ng_d/,
    ],
    use: {
      loader: "babel-loader",
      options: {
        presets: [["@babel/preset-env", { targets: { node: "current" } }]],
        plugins: [
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
        ],
      },
    },
  });

  config.module.rules.push({
    test: /\.tsx?$/,
    use: [
      {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          compilerOptions: {
            jsx: "react-jsx",
            jsxImportSource: "preact",
            target: "es2019",
          },
        },
      },
    ],
    exclude: /node_modules/,
  });

  config.module.rules.push({
    test: /\.(webp|gif|png|jpe?g|svg)$/i,
    use: [
      {
        loader: "url-loader",
        options: {
          limit: Infinity,
          encoding: "base64",
        },
      },
    ],
  });

  config.module.rules.push({
    test: /\.(html)$/,
    use: [
      {
        loader: "@skpm/extract-loader",
      },
      {
        loader: "html-loader",
        options: {
          attrs: ["img:src", "link:href"],
          interpolate: true,
        },
      },
    ],
  });

  config.module.rules.push({
    test: /\.css$/,
    use: [
      entry.isPluginCommand
        ? { loader: "@skpm/extract-loader" }
        : { loader: "style-loader" },
      {
        loader: "css-loader",
        options: {
          importLoaders: 1,
        },
      },
    ],
  });
};
