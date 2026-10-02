# Vexan Astro Theme: agent notes

Before changing anything, read the template guide: `.claude/skills/astro-template-guidance/SKILL.md`
(it routes to `references/*.md` for pages, components, content, configuration, scripts, styling and i18n).

Key rules:
- Keep the original CSS class names; styling lives in `src/styles/vexan.webflow.css` (do not convert to Tailwind or scoped styles). New CSS goes in `src/styles/custom.css`.
- Site settings are in `src/config/*.json`; CMS content comes from Strapi (`./strapi`) or `src/data/*.json`.
- Animations are attribute-driven (`src/scripts/animations.ts`).
- Strapi MCP server: `http://localhost:1337/mcp` (Admin API token required).

## Development

```
npm run dev            # Astro on :4321
npm run strapi:dev     # Strapi on :1337
```

Docs: https://docs.astro.build · https://docs.strapi.io
