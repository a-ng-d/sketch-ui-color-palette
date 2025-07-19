const Dotenv = require("dotenv-webpack");
const path = require("path");

module.exports = function (config, entry) {
  // Charger les variables d'environnement depuis .env.local
  config.plugins = config.plugins || [];
  config.plugins.push(
    new Dotenv({
      path: path.resolve(__dirname, ".env.local"),
      systemvars: true, // Charge également les variables d'environnement système
      safe: false, // Charge .env.example si présent (facultatif)
      defaults: false, // Charge .env.defaults si présent (facultatif)
    })
  );

  config.node = entry.isPluginCommand
    ? false
    : {
        setImmediate: false,
      };

  // Configuration des résolutions d'alias
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

  // Configurer Babel pour prendre en charge les opérateurs modernes (comme ??)
  config.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules\/(?!(@a_ng_d)\/).*/,
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

  // Loader pour TypeScript et TSX (Preact)
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
            target: "es2019", // Cibler une version compatible avec les opérateurs ES modernes
          },
        },
      },
    ],
    exclude: /node_modules/,
  });

  // Loader pour les fichiers d'images (webp, gif, png, jpg, etc.)
  config.module.rules.push({
    test: /\.(webp|gif|png|jpe?g|svg)$/i,
    use: [
      {
        loader: "url-loader",
        options: {
          limit: Infinity, // Toujours encoder en base64 quelle que soit la taille
          encoding: "base64",
        },
      },
    ],
  });

  // Loader HTML
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

  // Loader CSS unifié pour tous les fichiers CSS
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
