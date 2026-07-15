# Guide utilisateur - Echo Santé

Ce guide explique comment utiliser le site Echo Santé et son espace d’administration.

## Accès au site

En local, le site est accessible à l’adresse :

```text
http://localhost:3000
```

Les principales pages publiques sont :

- Accueil : `/`
- À propos : `/about`
- Projets : `/projects`
- Articles : `/articles`
- Galerie : `/gallery`
- Contact : `/contact`

## Installation PWA

Le site peut être installé comme application sur mobile ou ordinateur.

Sur mobile :

1. Ouvrir le site dans le navigateur.
2. Ouvrir le menu du navigateur.
3. Choisir l’option d’ajout à l’écran d’accueil ou d’installation.

Sur desktop :

1. Ouvrir le site dans Chrome, Edge ou un navigateur compatible PWA.
2. Cliquer sur l’icône d’installation dans la barre d’adresse si elle apparaît.
3. Confirmer l’installation.

Le mode hors ligne affiche une page dédiée si aucune page en cache n’est disponible.

## Accès administrateur

Page de connexion admin :

```text
/admin/login
```

Identifiants admin locaux par défaut :

```text
Email : admin@echosante.org
Mot de passe : password
```

Ces identifiants sont prévus pour le développement local. Ils doivent être changés avant toute mise en production réelle.

## Espace admin

Après connexion, l’espace admin est disponible ici :

```text
/admin/dashboard
```

L’espace admin permet de gérer :

- Articles
- Projets
- Membres de l’équipe
- Services
- Statistiques
- Pages
- Galerie
- Paramètres du site
- Messages de contact

## Créer un contenu

1. Aller dans `/admin/dashboard`.
2. Choisir l’onglet correspondant au type de contenu.
3. Cliquer sur le bouton de création.
4. Remplir les champs requis.
5. Enregistrer.

Le contenu est ajouté au fichier JSON correspondant.

## Modifier un contenu

1. Aller dans l’onglet concerné.
2. Utiliser la recherche ou les filtres si nécessaire.
3. Cliquer sur l’icône de modification.
4. Modifier les champs.
5. Enregistrer.

## Supprimer un contenu

1. Aller dans l’onglet concerné.
2. Cliquer sur l’icône de suppression.
3. Confirmer dans la modale.

La suppression est définitive dans le fichier JSON local.

## Recherche, filtres et pagination

Chaque liste de l’espace admin propose :

- une recherche textuelle ;
- des filtres selon le type de contenu ;
- une pagination pour limiter le nombre d’éléments affichés.

## Messages de contact

Les messages envoyés via le formulaire de contact sont stockés dans :

```text
data/contact-messages.json
```

Dans l’admin, il est possible de :

- consulter les messages ;
- marquer un message comme lu ;
- supprimer un message.

## Images

Les images publiques sont dans :

```text
public/
```

Pour les contenus administrables, utilisez :

- un chemin local comme `/equip.webp` ;
- ou une URL d’image externe compatible.

L’upload direct est désactivé en mode JSON local.

## Limite importante sur Vercel

Sur Vercel, le système de fichiers est éphémère. Le CRUD fonctionne pendant l’exécution, mais les modifications faites depuis l’espace admin ne sont pas persistantes entre instances ou redéploiements.

En local, les modifications sont bien écrites dans `data/*.json`.
