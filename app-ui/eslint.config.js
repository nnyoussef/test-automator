// eslint.config.js
import vuePlugin from 'eslint-plugin-vue';
import promisePlugin from 'eslint-plugin-promise';
import securityPlugin from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';

export default [
    // Ignore everything outside src
    {
        ignores: ['dist/**', 'node_modules/**', 'eslint.config.js', '.eslintrc.cjs'],
    },

    // JS and TS files
    {
        files: ['src/**/*.{js,ts}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            promise: promisePlugin,
            security: securityPlugin,
        },
        rules: {
            // General code quality
            'no-console': 'warn',
            'no-var': 'error',
            'prefer-const': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            complexity: ['warn', 10],
            'max-params': ['warn', 5],
            'max-statements': ['warn', 40],

            // TypeScript
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

            // Promise & Security
            'promise/always-return': 'error',
            'security/detect-object-injection': 'error',
        },
    },

    // Vue files
    {
        files: ['src/**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser, // for <script lang="ts">
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: { vue: vuePlugin },
        rules: {
            'vue/multi-word-component-names': 'error',
            'vue/html-self-closing': [
                'error',
                { html: { void: 'always', normal: 'always', component: 'always' } },
            ],
        },
    },

    // Prettier overrides
    prettier,
];
