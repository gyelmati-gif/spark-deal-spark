## Plan

1. **Fix the failing GitHub Actions install step**
   - The workflow uses `npm ci`, but the project currently has no `package-lock.json`; `npm ci` fails without it.
   - Add a committed `package-lock.json` generated from the existing `package.json` so GitHub Actions can install dependencies with npm.

2. **Keep the requested workflow unchanged**
   - Leave `.github/workflows/main.yml` using:
     - `npm ci`
     - `npm run build`
     - `publish_dir: ./dist`

3. **Verify GitHub Pages output assumptions**
   - Check that the production build writes `index.html` into `dist`.
   - Confirm the Vite base path remains `/spark-deal-spark/` so assets load under the repository subpath.

4. **If build output is not static-site compatible**
   - Adjust only the minimum config needed so the app produces a static `dist/index.html` suitable for GitHub Pages.

After approval, I’ll implement the package-lock/build-output fix and keep changes limited to the deployment issue.