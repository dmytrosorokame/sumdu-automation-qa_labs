/**
 * Cucumber Configuration
 * @see https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md
 */

// Set TS_NODE_PROJECT to use the features-specific tsconfig
process.env.TS_NODE_PROJECT = "./features/tsconfig.json";

const common = {
  // Feature files location
  paths: ["features/**/*.feature"],

  // Step definitions and support files (use require for CommonJS)
  require: ["features/step-definitions/**/*.ts", "features/support/**/*.ts"],

  // Use ts-node for TypeScript support
  requireModule: ["ts-node/register"],

  // Output format
  format: [
    "progress-bar",
    "html:cucumber-report/cucumber-report.html",
    "json:cucumber-report/cucumber-report.json",
  ],
};

module.exports = {
  default: common,
};
