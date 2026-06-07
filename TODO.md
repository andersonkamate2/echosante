# TODO - Déploiement Vercel avec SQLite

- [x] Vérifier l’init Prisma (schema SQLite vs Postgres)
- [x] Adapter `package.json` pour que `next build` sur Vercel utilise SQLite + seed
- [x] Mettre à jour `vercel.json` (buildCommand) pour appeler le script SQLite

- [ ] Mettre à jour `DEPLOYMENT_VERCEL.md` : enlever Postgres, ajouter variables SQLite et méthode seed

- [ ] Lancer local `npm run vercel-build` pour valider
- [ ] Tester build de production `NODE_ENV=production npm run build`
- [ ] Déployer sur Vercel
- [ ] Vérifier dans logs que Prisma utilise bien SQLite

