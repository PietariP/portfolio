# Pietari Pakarinen — portfolio

A responsive, static portfolio site built with HTML and CSS. It has no build step or JavaScript dependency.

## Pages

- `/` — home and selected-work links
- `/about/` — short biography and working approach
- `/work/nsc3/`, `/work/locust-swarm/`, `/work/patria/`, `/work/saucesoft/` — individual case studies

## Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root when a commit reaches `main`. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. The workflow then publishes the static files and reports the site URL in its run summary.

The repository name is `portfolio`, so the default project-site URL is `https://pietarip.github.io/portfolio/`. A custom domain can be configured later in Pages settings.

## Design source

The homepage follows the desktop direction in the Figma file, with a two-column project grid that collapses to one column on narrow screens. Copy and case-study detail stay at a public-safe level; unreleased NSC3 features and specific operational scenarios are intentionally omitted pending approval for publication.
