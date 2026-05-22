# Style Shopper

A static, browser-only prompt builder for AI-assisted clothing shopping.

Fill in your measurements, fit preferences, style preferences, garment-specific details, and shopping constraints. The app auto-saves your form data to localStorage and generates a shopping-agent prompt that can be copied to your clipboard.

## Features

- Static HTML/CSS/JavaScript; no backend and no build step.
- Automatic localStorage save on every change.
- Prompt generation and clipboard copy.
- Import/export JSON backup of your saved shopping profile.
- GitHub Pages workflow included.

## Running locally

Open `index.html` directly in a browser, or serve the folder with any static web server.

## GitHub Pages

This repository includes `.github/workflows/deploy-pages.yml`. After enabling GitHub Pages with **GitHub Actions** as the source, pushes to `main` will deploy the site automatically.

Expected public URL after Pages is enabled:

`https://eric1234.github.io/style-shopper/`
