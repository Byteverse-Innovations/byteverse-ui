# Byteverse UI

React + TypeScript + Vite application for Byteverse Innovations.

## Local Development Setup

### Prerequisites
- Node.js 20+
- AWS CLI configured with appropriate credentials
- Access to the `byteverse-ui/appsync-config` secret in AWS Secrets Manager

### Environment Variables

For local development, you need to set up environment variables. You have two options:

#### Option 1: Use the setup script (Recommended)
```bash
./scripts/setup-local-env.sh
```

This script automatically fetches values from AWS Secrets Manager and creates a `.env` file.

#### Option 2: Manual setup
1. Get the secret value from AWS Secrets Manager:
```bash
aws secretsmanager get-secret-value --secret-id byteverse-ui/appsync-config --region us-east-1 --query SecretString --output text | jq
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Fill in the values in `.env`:
   - `VITE_COGNITO_IDENTITY_POOL_ID` (required)
   - `VITE_AWS_REGION` (optional, defaults to `us-east-1`)
   - `VITE_APPSYNC_ENDPOINT` (optional, defaults to `https://api.byteverseinnov.com/graphql`)

### Running the Application

```bash
npm install
npm run dev
```

## Production Build

Production builds automatically fetch configuration from AWS Secrets Manager during the CI/CD pipeline. No manual `.env` file is needed for production deployments.

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
