# Authentification Admin - Local SQLite vs Production Supabase

## Local Development (SQLite)

### Configuration par défaut
- **Email**: `admin@echosante.org`
- **Mot de passe**: `password`

Ces credentials sont définis dans `.env`:
```env
LOCAL_ADMIN_EMAIL=admin@echosante.org
LOCAL_ADMIN_PASSWORD=password
AUTH_COOKIE_SECRET=dev-secret
```

### Initialiser l'admin local
```bash
npm run dev
# OU créer manuellement l'admin dans la BD
npm run prisma:seed
```

Le script `prisma/seed.ts` crée automatiquement l'admin local si aucun n'existe.

### Accéder au dashboard admin
1. Allez à `/admin/login`
2. Entrez les credentials définis dans `.env`
3. Vous êtes connecté et pouvez gérer les articles

## Gestion des administrateurs locaux

### API `/api/admin-users` (protégée par authentification)

#### Lister les admins
```bash
curl http://localhost:3000/api/admin-users \
  -H "Cookie: app_session_id=<token>"
```

#### Créer un nouvel admin
```bash
curl -X POST http://localhost:3000/api/admin-users \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session_id=<token>" \
  -d '{"email":"newadmin@example.com","password":"secure-password"}'
```

#### Changer le mot de passe d'un admin
```bash
curl -X PUT http://localhost:3000/api/admin-users \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session_id=<token>" \
  -d '{"id":"user-id","password":"new-password"}'
```

#### Supprimer un admin
```bash
curl -X DELETE http://localhost:3000/api/admin-users \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session_id=<token>" \
  -d '{"id":"user-id"}'
```

## Production (Supabase)

En production, l'authentification utilise Supabase PostgreSQL au lieu de SQLite local.

### Configuration requise
```env
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Lorsque `SUPABASE_URL` est défini, le système bascule automatiquement vers l'authentification Supabase.

## Flow d'authentification

### Connexion
1. POST `/api/auth` avec `{email, password}`
2. Validation locale SQLite OU Supabase selon l'environnement
3. Création d'un token JWT signé cryptographiquement
4. Token stocké dans un cookie `app_session_id` sécurisé (httpOnly)

### Vérification de session
1. GET `/api/auth` pour vérifier l'authentification actuelle
2. Validation du cookie et du token
3. Retour des données utilisateur si valide

### Déconnexion
1. DELETE `/api/auth` pour effacer le cookie
2. Session supprimée

## Détails techniques

### Authentification locale (SQLite)
- Mot de passe hashé avec `crypto.scryptSync`
- Salt aléatoire UUID stocké avec chaque utilisateur
- Comparison de hash avec `timingSafeEqual` pour prévenir les timing attacks

### Token JWT
- Format: `userId|email|expiration|hmacSignature`
- Signé avec `AUTH_COOKIE_SECRET`
- Expiration : 1 an
- Stocké dans cookie sécurisé (httpOnly, secure en prod)

### Protections de sécurité
- Cookies httpOnly (pas accessible via JavaScript)
- CSRF protection via same-site cookies
- Timing-safe comparaisons de mots de passe
- Validation de token à chaque requête
