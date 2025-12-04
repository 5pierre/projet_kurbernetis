# Cahier des Charges - Projet Fil Rouge Sécurité

**Module :** Sécurité des Applications Web 
**Niveau :** Débutant à Intermédiaire  
**Durée :** 1 semaine  

---

## Vue d'ensemble

Vous allez créer une **application Web complète** de votre choix (e-commerce, blog, réseau social, gestion de tâches, etc.).

**Liberté totale** sur :
- Le sujet du projet
- Les technologies (Node, PHP, Python, React, Vue, etc.)
- La complexité métier

**Mais** : Votre projet DOIT respecter **TOUS les critères de sécurité** listés ci-dessous. Si une seule contrainte n'est pas respectée, le projet est **REFUSÉ**.

---

## Contraintes Obligatoires (Fonctionnalités Minimales)

### Système d'Authentification Robuste

**Fonctionnalités requises :**

- [✅] **Page d'inscription (`/register`)**
  - Champs : Email, Mot de passe, Nom
  - Validation :
    - Email : Format valide (regex ou libraire)
    - Mot de passe : Minimum 12 caractères + 3 types (majuscules, minuscules, chiffres, spéciaux)
  - Message d'erreur explicite si validation échoue

- [✅] **Page de connexion (`/login`)**
  - Email + Mot de passe
  - Validation d'identité côté serveur
  - Message d'erreur générique en cas d'échec (pas "email pas trouvé" ou "mot de passe incorrect")

- [✅] **Stockage sécurisé des mots de passe**
  - Hachage avec `bcrypt`, `Argon2` ou `PBKDF2`
  - **Interdiction absolue** : MD5, SHA1, SHA256 simple, ou texte clair
  - Vérifiable : Query `SELECT password FROM users LIMIT 1` montre un hash

- [✅] **Session & Cookies**
  - Authentification avec session serveur (ou JWT si API)
  - Cookies avec attributs `HttpOnly`, `Secure`, `SameSite=Strict`
  - Timeout après 15-30 min d'inactivité

- [✅] **Page de déconnexion (`/logout`)**
  - Détruit vraiment la session côté serveur
  - Redirection vers login

**Preuves requises pour validation :**
- Capture écran du formulaire d'inscription
![Alt text](/images-md/formulaire-inscri.png "Formulaire d'inscription")
- Tentative inscription avec mot de passe faible → Rejet (avec message)
![Alt text](/images-md/image1.png "Formulaire d'inscription")
- Capture écran du formulaire de connexion
![Alt text](/images-md/image2.png "Formulaire de connexion")
- Capture écran du cookie dans l'inspecteur réseau (HttpOnly, Secure, SameSite visibles)
![Alt text](/images-md/image3.png "Cookie HttpOnly, Secure, SameSite")
---

### Système de Rôles & Contrôle d'Accès

**Fonctionnalités requises :**

- [✅] **Au minimum 2 rôles différents** dans le système
  - Exemple 1 : `USER` et `ADMIN`
  - Exemple 2 : `AUTHOR`, `EDITOR`, `VIEWER`
  - Exemple 3 : `MANAGER`, `EMPLOYEE`

- [✅] **Stockage du rôle en base de données**
  - Colonne `role` ou `roles` dans la table `users`

- [✅] **Au moins une page/fonctionnalité Admin-only**
  - `/admin/dashboard` visible SEULEMENT pour Admin
  - Ou : `/admin/users` pour gérer les utilisateurs

- [✅] **Vérification côté serveur** (pas juste front-end)
  - Tentative accès `/admin` en tant qu'User → **Rejet (403 ou Redirect)**
  - Code serveur vérifie `if (user.role !== 'ADMIN') { deny(); }`

- [✅] **Impossible de modifier l'ID utilisateur pour voir une autre personne** (IDOR)
  - Si on accède `/profil/user/5`, c'est mon compte (user 5)
  - Si on change `/profil/user/99`, rejet (ce compte ne m'appartient pas)

**Preuves requises pour validation :**
- Capture écran login avec 2 comptes (1 Admin, 1 User)
- Capture écran de la page Admin accessible pour Admin
- Capture écran du rejet quand on essaie d'accéder `/admin` en tant qu'User
- Capture écran du rejet en tentant de voir le profil d'un autre utilisateur

---

### Protections Contre Injections (SQL & XSS)

**Fonctionnalités requises :**

- [✅] **Toutes les requêtes SQL utilisent des requêtes préparées**
  - OK :  `SELECT * FROM users WHERE id = ?` (paramètre séparé)
  - NO : `SELECT * FROM users WHERE id = $userId` (concaténation)
  - Ou : Utiliser un ORM (Doctrine, Eloquent, Mongoose, SQLAlchemy)

- [✅] **Une fonctionnalité permettant aux utilisateurs de poster du texte** (commentaire, bio, titre, etc.)
  - Tentative : Poster `<script>alert('XSS')</script>`
  - Résultat : Le script NE S'EXÉCUTE PAS, on voit le texte brut ou échappé

- [✅] **Validation des entrées** (côté serveur)
  - Email : Format valide
  - Nombres : Seulement des chiffres si attendu
  - Longueur : Min/Max respectés

**Preuves requises pour validation :**
- Code source montrant les requêtes préparées (avec `?` ou ORM syntax)
- Capture écran montrant un commentaire avec `<script>` affiché comme texte
- Tentative d'injection SQL simple → Rejet ou pas de résultat anormal

---

### Conformité RGPD & Protection des Données

**Fonctionnalités requises :**

- [✅] **Formulaire d'inscription minimal** (Minimisation)
  - Champs collectés : Email, Mot de passe, Nom **SEULEMENT**
  - **Interdiction** : Date de naissance, Numéro Sécu, Adresse complète (sauf si justifiée pour livraison)

- [✅] **Consentement explicite** (non pré-coché)
  - Case à cocher : `<input type="checkbox" name="consent">`
  - Pas d'attribut `checked` (doit être décochée par défaut)
  - Text : "J'accepte que mes données soient utilisées pour [usage précis]"
  - Impossible soumettre sans cocher

- [✅] **Page Mentions Légales** (Transparence)
  - Lien visible dans le footer de toutes les pages
  - Contenu : Qui gère le site, quelles données, à quoi elles servent, droits utilisateurs
  - Peut être minimaliste pour un projet école

- [✅] **Fichier `.env.example`** documentant les variables d'environnement
  - Utilisateurs et développeurs savent ce qui est requis

**Preuves requises pour validation :**
- Capture écran du formulaire d'inscription (champs visibles)
- Capture écran montrant la case à cocher décochée
- Capture écran du lien "Mentions Légales" dans le footer
- Contenu de la page `/legal` ou `/privacy`

---

### Protection CSRF (si applicable) 

**Fonctionnalités requises :**

- [ ] **Si vous utilisez une architecture MVC classique (Symfony, Laravel, Django)**
  - Token CSRF présent dans chaque formulaire
  - `<input type="hidden" name="csrf_token" value="......">`
  - Token validé côté serveur avant traitement POST/PUT/DELETE

- [ ] **Si vous utilisez une API moderna (React + Express, Vue + Django REST)**
  - JWT ou session + vérification `SameSite=Strict` on cookies
  - CORS configuré correctement (pas `Access-Control-Allow-Origin: *` en production)

**Preuves requises pour validation :**
- Code source montrant la génération/validation du token CSRF (ou JWT)
- Capture écran de l'inspecteur montrant le token dans le formulaire

---

### Sécurité des Fichiers (si upload) 

- pas concerné
<!-- **Fonctionnalités requises** *(SEULEMENT si votre projet inclut un upload de fichier)*:

- [ ] **Validation d'extension** 
  - Accepté : `.jpg`, `.png`, `.pdf` uniquement
  - Rejeté : `.exe`, `.php`, `.zip`, etc.

- [ ] **Validation du type MIME** côté serveur
  - `mime_content_type()`, `finfo_file()`, ou libraire `file-type`

- [ ] **Fichier renommé avec UUID**
  - Au lieu de : `mon-avatar.jpg`
  - Renommé en : `550e8400-e29b-41d4-a716-446655440000.jpg`

- [ ] **Stockage en dehors du web root** (optionnel mais recommandé)

**Preuves requises pour validation :**
- Tentative upload d'un `.exe` → Rejet (capture écran)
- Capture écran montrant le fichier renommé en UUID dans la base ou le dossier -->

---

### Headers de Sécurité HTTP

**Fonctionnalités requises :**

- [ ] **Header `X-Content-Type-Options: nosniff`** présent dans les réponses HTTP

- [ ] **Header `X-Frame-Options: DENY`** (ou `SAMEORIGIN`) présent dans les réponses HTTP

- [ ] **HTTPS obligatoire** (même en dev/local)
  - Certificat auto-signé accepté (Mkcert, OpenSSL, ou Symfony CLI)

**Preuves requises pour validation :**
- Inspecteur réseau (Onglet Network) montrant les headers
- Capture écran de l'URL en HTTPS (pas HTTP)
- Commande : `curl -I https://votre-app.com | grep -i "X-Content\|X-Frame"`

---

### Gestion des Secrets & Configuration

**Fonctionnalités requises :**

- [✅] **Fichier `.env`** en `.gitignore` (jamais push de secrets)
  - Variables : `DB_PASSWORD`, `API_KEY`, `JWT_SECRET`, etc.

- [✅] **Fichier `.env.example`** dans le repo
  - Montre les variables requises SANS les valeurs

- [👍] **Aucun secret en clair dans le code source**
  - Vérifier : `grep -r "password\|api_key\|secret" src/` (doit être vide)
  - Vérifier : `git log` ne contient pas de secrets anciens

- [ ] **Mode Production** séparé du mode Dev
  - Erreurs détaillées affichées localement seulement
  - En production : Messages d'erreur génériques

**Preuves requises pour validation :**
- Fichier `.env.example` visible dans le repo
- Fichier `.env` ABSENT du repo (confirmé par `git status`)
- Capture écran montrant une erreur générique en production

---

### Déploiement & Production

**Fonctionnalités requises :**

- [ ] **Application déployée publiquement** (pas juste `localhost`)
  - Plateforme : Heroku, Railway, OVH, DigitalOcean, AWS, Vercel, etc.
  - URL publique : `https://mon-app-12345.herokuapp.com`

- [ ] **HTTPS valide en production**
  - Certificat SSL automatique (Let's Encrypt via la plateforme)
  - Pas d'avertissement sécurité dans le navigateur

- [ ] **Configuration de production appliquée**
  - Debug mode désactivé
  - Base de données sécurisée (pas sur localhost)
  - Secrets via variables d'environnement

**Preuves requises pour validation :**
- URL publique fonctionnelle (envoyée par email ou Slack)
- Capture écran avec certificat SSL valide
- Capture écran d'une fonctionnalité testée en production

---

### Tests de Sécurité & Audits

**Fonctionnalités requises :**

- [👍] **Audit des dépendances exécuté**
  - `npm audit` (Node) → Zéro vulnérabilités "High" ou "Critical"
  - `composer audit` (PHP) → Zéro vulnérabilités critiques
  - `pip check` (Python) → Zéro vulnérabilités

- [ ] **Documentation de sécurité** dans le README
  - Comment l'app sécurise les données utilisateurs
  - Quels sont les éléments de sécurité implémentés

- [ ] **Code Review basique** (Checklist)
  - Avant la soutenance, vous avez reviewed votre code avec la **Checklist d'Audit Sécurité** fournie
  - Au moins 90% des cases cochées

**Preuves requises pour validation :**
- Capture écran du résultat `npm audit`
- Fichier README mentionnant la sécurité
- Checklist d'Audit remplie à 90%+



---











## Exemples de Projets Validés

Voici des idées de projets qui cochent toutes les cases :

### Exemple 1 : Blog Sécurisé
- **Features** : Articles, Commentaires, Authentification
- **Rôles** : Admin (modère tous), Auteur (modère les siens), Lecteur
- **Sécurité appliquée** :
  - Login robuste 
  - Commentaires échappés (XSS) 
  - Admin-only pour modération 
  - RGPD : Newsletter avec consentement 

### Exemple 2 : E-commerce Basique
- **Features** : Catalogue, Panier, Commande, Paiement simulé
- **Rôles** : Admin (gère stock), Client
- **Sécurité appliquée** :
  - Login + Checkout sécurisés 
  - Pas de IDOR (cant voir les commandes d'un autre) 
  - Upload de photo produit sécurisé 
  - HTTPS + headers sécurité 

### Exemple 3 : Réseau Social Miniature
- **Features** : Profil, Posts, Likes, Followers
- **Rôles** : Admin, User
- **Sécurité appliquée** :
  - Auth robuste 
  - Bio échappée (XSS) 
  - Avatar upload sécurisé 
  - Cant voir/edit le profil d'un autre 
---

## Timeline Recommandée


| Jour 1 | Setup + Auth | Login/Register fonctionnel |
| Jour 2 | Injections & Rôles | Requêtes préparées + Admin page |
| Jour 3 | RGPD & Conformité | Formulaire conforme, Mentions légales |
| Jour 4 | Headers & HTTPS | Headers présents, HTTPS activé |
| Jour 5 | Déploiement | App en ligne |
| Jour 6 | Tests & Audit | Checklist 100%, Soutenance |

---

## Ressources

- **Checklist d'Audit** : Voir document séparé (`Checklist-Audit-Securite.md`)
- **OWASP Top 10** : https://owasp.org/www-project-top-ten/
- **Bcrypt** : https://github.com/pyca/bcrypt
- **Validation** : https://github.com/validatorjs/validator.js
- **DVWA** : http://www.dvwa.co.uk/ (test de vos connaissances)
- **Let's Encrypt** : https://letsencrypt.org/ (certificats SSL gratuits)

---

## FAQ

**Q : Puis-je utiliser un framework qui gère la sécurité pour moi?**
A : Oui! Symfony, Laravel, Django, etc. gèrent beaucoup (sessions, CSRF, hachage). Mais vous devez COMPRENDRE et être capable de l'EXPLIQUER pendant la soutenance.

**Q : Puis-je faire un projet simple?**
A : Oui! Pas besoin de 100 fonctionnalités. Un blog basique ou une TODO list suffisent. L'important c'est la **sécurité**, pas la complexité métier.

**Q : Je suis en retard, je fais quoi?**
A : Priorisez Auth + Injections (critiques). Vous pouvez faire Rôles très simples (juste Admin/User).

**Q : Je peux travailler en équipe?**
A : Oui! Groupe de 2-3 max. Tout le monde doit pouvoir expliquer le code.

---
