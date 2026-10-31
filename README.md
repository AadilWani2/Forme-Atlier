# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Frontend demo checkout

The `/checkout` route provides a responsive, frontend-only checkout with contact/address validation, standard and express delivery options, and a live order summary. Submitting creates a demo order stored in this browser's local storage and opens `/order-confirmation/:orderId`. No backend, payment gateway, or server-side order processing is connected. Demo order details are stored under `forme-studio-demo-orders-v1` and `forme-studio-last-order-v1`.


## 3D product model assets

The non-mug customizer now loads the supplied GLB models for the bottle, pen, journal, and keychain from `public/models/`. Their model materials are preserved where possible; the customizable color is applied to the product body, and text/artwork is shown as a live front overlay.

The supplied `iphone_16_pro_back_cover.glb` upload was not a valid GLB file (it contained only the 15-byte string `[object Object]`). Until a valid phone-case GLB is supplied, the phone case continues to use its procedural 3D fallback.
