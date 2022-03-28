module.exports = {
    root: true,
    env: {
        node: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "unused-imports"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
    },
    overrides: [
        {
            files: ["src/**/__tests__/**/*.{test,spec}.ts"],
            rules: {
                "@typescript-eslint/ban-ts-comment": "off",
            },
        },
    ],
};
