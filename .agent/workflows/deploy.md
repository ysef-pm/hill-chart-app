---
description: Deploy the application by pushing changes to the production branch
---

1. Check for uncommitted changes to ensure you know what you are deploying.
```bash
git status
```

2. Stage all changes.
```bash
// turbo
git add .
```

3. Commit the changes. You can edit the commit message below to be more descriptive.
```bash
git commit -m "chore: deploy updates"
```

4. Push the changes to the `main` branch to trigger the Vercel deployment.
```bash
// turbo
git push origin main
```
