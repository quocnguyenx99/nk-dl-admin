const sassDeprecationsToSilence = [
  'import',
  'legacy-js-api',
  'global-builtin',
  'color-functions',
  'if-function',
];

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const applySassOptions = (rule) => {
        if (!rule || typeof rule !== 'object') {
          return;
        }

        if (Array.isArray(rule.oneOf)) {
          rule.oneOf.forEach(applySassOptions);
        }

        if (Array.isArray(rule.rules)) {
          rule.rules.forEach(applySassOptions);
        }

        if (!Array.isArray(rule.use)) {
          return;
        }

        rule.use.forEach((loaderEntry) => {
          if (
            loaderEntry &&
            typeof loaderEntry === 'object' &&
            typeof loaderEntry.loader === 'string' &&
            loaderEntry.loader.includes('sass-loader')
          ) {
            loaderEntry.options = {
              ...loaderEntry.options,
              sassOptions: {
                ...loaderEntry.options?.sassOptions,
                silenceDeprecations: sassDeprecationsToSilence,
              },
            };
          }
        });
      };

      webpackConfig.module.rules.forEach(applySassOptions);

      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        (warning) =>
          warning?.message?.includes('Failed to parse source map') &&
          warning?.message?.includes('@coreui'),
      ];

      webpackConfig.optimization?.minimizer?.forEach((minimizer) => {
        if (minimizer?.constructor?.name === 'CssMinimizerPlugin') {
          minimizer.options.minimizer.options = {
            ...minimizer.options.minimizer.options,
            preset: ['default', { svgo: false }],
          };
        }
      });

      return webpackConfig;
    },
  },
};
