# Checklist d'Audit Sécurité - Projet Fil Rouge


## 1. Architecture & Configuration

*Objectif : Réduire la surface d'attaque dès l'installation.*

### 1.1 Gestion des secrets

- [ ] **Aucun secret en clair dans le code** : Les mots de passe, clés API, tokens n'apparaissent pas dans les fichiers source (*.js, *.php, *.py, etc.)
  - Vérification : `git log` et `git diff` ne doivent pas contenir de secrets
  - Les secrets doivent être dans un fichier `.env` (ajouté au `.gitignore`)

- [ ] **Fichier `.gitignore` configuré** : Les fichiers `.env`, `config/`, `secrets/` ne sont pas dans le dépôt Git

- [ ] **Variables d'environnement utilisées** : Accès aux secrets via `process.env` (Node), `$_ENV` (PHP), ou équivalent

**Preuves attendues :**
- Capture d'écran du `.gitignore`
- Extrait du code montrant l'utilisation de variables d'env
- Vérifier : `grep -r "password\|api_key\|token" src/` (doit être vide)

---

### 1.2 Mode Production

- [ ] **Debug désactivé en production** : Les messages d'erreur détaillés (Stack Trace) ne s'affichent PAS aux utilisateurs

- [ ] **Logs des erreurs configurés** : Les erreurs vont dans des fichiers serveur, pas sur le navigateur

- [ ] **Console des développeurs nettoyée** : Pas de `console.log()` révélant des infos sensibles

**Preuves attendues :**
- Fichier `.env.production` ou configuration de production
- Capture d'écran montrant une erreur anonyme (pas de Stack Trace)

---

### 1.3 HTTPS Local

- [ ] **Application accessible en HTTPS** (même sur localhost)
  - Certificate auto-signé acceptable (généré avec Mkcert, Symfony CLI, ou openssl)
  - Pas d'avertissement "Connexion non sécurisée" qui reste ignoré

**Preuves attendues :**
- Capture d'écran de `https://localhost:XXXX`
- Certificat visible dans les infos du navigateur

---

### 1.4 Dépendances saines

- [ ] **Audit des paquets exécuté sans vulnérabilités critiques**
  - Node.js : `npm audit` (résultat : 0 vulnérabilités "High" ou "Critical")
  - PHP : `composer audit` (résultat : 0 vulnérabilités critiques)
  - Python : `pip check` ou `safety check`

- [ ] **Les dépendances sont à jour** : Pas de version obsolète connue pour être vulnérable

**Preuves attendues :**
- Capture d'écran du résultat `npm audit` / `composer audit`
- Fichier `package.json` ou `composer.lock` montrant les versions

---

## 2. Authentification & Sessions

*Objectif : Vérifier que personne ne peut usurper une identité.*

### 2.1 Mots de passe robustes

- [ ] **Validation au signup** : La création de compte impose un minimum de 12 caractères

- [ ] **Complexité requise** (au moins 3 critères) :
  - [ ] Majuscules
  - [ ] Minuscules
  - [ ] Chiffres
  - [ ] Caractères spéciaux

- [ ] **Message d'erreur clair** : L'utilisateur sait pourquoi son mot de passe est rejeté

**Preuves attendues :**
- Capture d'écran du formulaire d'inscription avec message de validation
- Code source montrant la validation côté serveur

---

### 2.2 Stockage des mots de passe

- [ ] **Algorithme moderne obligatoire** : `bcrypt`, `Argon2`, ou `PBKDF2`
  - **Interdiction absolue** : MD5, SHA1, SHA256 simple (sans salt), ou texte clair
  
- [ ] **Salt généré automatiquement** : Chaque mot de passe a son propre salt unique

- [ ] **Coût computationnel approprié** : Bcrypt avec au moins 10 rounds (par défaut)

**Preuves attendues :**
- Code source montrant `bcrypt.hash()`, `password_hash()`, ou `Argon2` utilisé
- Requête SQL montrant la colonne password : `$2a$...` (bcrypt), `$argon2...` (Argon2)
- Résultat de `SELECT password FROM users LIMIT 1` doit montrer un hash, pas du texte brut

---

### 2.3 Cookies & Sessions

- [ ] **Cookie de session avec HttpOnly** : `Set-Cookie: sessionId=...; HttpOnly; Secure; SameSite=Strict`

- [ ] **Attribut Secure activé** : Le cookie ne se transmet qu'en HTTPS

- [ ] **SameSite configuré** : `SameSite=Strict` ou `Lax` (protège contre CSRF)

- [ ] **Expiration de session** : Timeout après 15-30 minutes d'inactivité

- [ ] **Logout détruit la session** : Le bouton "Se déconnecter" supprime vraiment la session côté serveur

**Preuves attendues :**
- Inspecteur réseau (Onglet Application > Cookies) montrant les flags
- Code source montrant la configuration de session
- Capture écran montrant la suppression de session au logout

---

## 3. Contrôle d'Accès 

*Objectif : Appliquer le principe de "Moindre Privilège".*

### 3.1 Rôles distincts

- [ ] **Au minimum 2 rôles implémentés** : Exemple : `USER` et `ADMIN`
  - Ou : `MANAGER`, `EMPLOYEE`, `VIEWER`
  - Ou : `AUTHOR`, `EDITOR`, `READER`

- [ ] **Base de données** : Colonne `role` ou `roles` dans la table `users`

**Preuves attendues :**
- Schéma de base de données montrant la table users avec la colonne role
- Capture d'écran montrant 2 comptes avec rôles différents

---

### 3.2 Vérification d'accès sur chaque route

- [ ] **Pas d'accès direct à une URL admin sans permission**
  - Tentative : `/admin` sans être Admin → Rejet (403 Forbidden ou redirect)
  - Tentative : `/admin/delete-user/5` en tant qu'User → Rejet

- [ ] **Vérification côté serveur** (pas seulement front-end)
  - Le serveur valide les permissions avant de répondre

**Preuves attendues :**
- Code source montrant le middleware/vérification d'accès
- Capture d'écran de la page d'erreur 403 ou redirect login
- Test : URL `/admin` accédée par un utilisateur normal → Écran blanc ou erreur visible

---

### 3.3 Pas de modification de données d'un autre utilisateur 

- [ ] **L'utilisateur A ne peut pas voir/modifier les données de l'utilisateur B**
  - Tentative : `/profil/user/15` → Rejet si vous n'êtes pas l'user 15
  - Tentative : `/mon-compte/editer` → Impossible d'éditer le compte d'un autre

- [ ] **Vérification : `if (userId != loggedInUser) { deny(); }`**

**Preuves attendues :**
- Code source montrant la vérification d'identité avant modification
- Capture écran montrant le rejet quand on change l'ID dans l'URL

---

## 4. Injections & Données 

*Objectif : Bloquer les attaques SQLi et XSS (OWASP Top 10).*

### 4.1 Injection SQL - Requêtes préparées

- [ ] **Aucune requête SQL concaténée** : Interdiction de faire `"SELECT * FROM users WHERE id=" + userId`

- [ ] **Requêtes préparées utilisées systématiquement**
  - Node + MySQL : `connection.query("SELECT * FROM users WHERE id = ?", [userId])`
  - PHP + PDO : `$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?"); $stmt->execute([$userId]);`
  - Python + SQLite : `cursor.execute("SELECT * FROM users WHERE id = ?", (userId,))`

- [ ] **ORM accepté comme alternative** : Doctrine, Eloquent, SQLAlchemy, Mongoose, etc.

**Preuves attendues :**
- Code source montrant les requêtes préparées (avec `?` ou `:paramName`)
- Audit statique : `grep -n "SELECT.*\+" src/` (doit être vide ou confirmé sûr)

---

### 4.2 Anti-XSS - Affichage sécurisé

- [ ] **Toutes les données affichées sont échappées/encodées**
  - Framework auto : Twig `{{ variable }}` (auto-échappe), Blade, JSX
  - Manual : `htmlspecialchars($variable)`, `DOMPurify.sanitize()`, etc.

- [ ] **Test XSS** : Un utilisateur peut poster du texte (commentaire, bio, profil)
  - Tentative : Poster `<script>alert('XSS')</script>` dans un commentaire
  - Résultat attendu : Le script ne s'exécute PAS, on voit du texte brut ou échappé

**Preuves attendues :**
- Code source des templates montrant l'utilisation d'échappement
- Capture écran montrant un commentaire avec `<script>` affiché comme texte

---

### 4.3 Validation des entrées

- [ ] **Tous les champs de formulaire validés côté serveur** (pas juste front-end)
  - Email : Format `name@domain.com`
  - Numéro : Uniquement des chiffres
  - Texte : Longueur min/max, caractères autorisés

- [ ] **Rejet des données invalides** : Erreur lisible ou silencieux selon le contexte

**Preuves attendues :**
- Code source montrant la validation (regex, libraires type `joi`, `validator.js`)
- Capture écran montrant le rejet d'une donnée invalide

---

## 5. Fonctionnalités Sensibles 

*Objectif : Sécuriser les actions critiques.*

### 5.1 Protection CSRF

- [ ] **Un token CSRF unique par formulaire** (si architecture MVC classique)
  - Formulaire contient : `<input type="hidden" name="csrf_token" value="abc123xyz">`
  - Token validé côté serveur avant de traiter POST/PUT/DELETE

- [ ] **Token généré à chaque page** (ou au moins unique par session)

- [ ] **Validation stricte** : Un token invalide = rejet de la requête

**Preuves attendues :**
- Inspect du formulaire montrant le champ CSRF
- Code source montrant la génération et validation du token
- Note : Si utilisation de framework moderne (React, Vue) + API JWT, cette étape peut être remplacée par une bonne gestion des CORS

---

### 5.2 Uploads de fichiers

- [ ] **Extension vérifiée (Liste blanche)** : Seuls `.jpg`, `.png`, `.pdf` acceptés (pas `.exe`, `.php`)

- [ ] **Type MIME vérifié côté serveur** : `mime_content_type()`, `finfo_file()`, ou libraire `file-type`

- [ ] **Fichier renommé avec UUID** : `avatar_12345678-1234.jpg` au lieu de `mon-avatar.jpg`
  - Empêche l'écrasement accidentel et l'exécution de scripts

- [ ] **Stockage en dehors du web root** : Le fichier uploadé ne doit pas être accessible directement par URL

**Preuves attendues :**
- Code source montrant la validation d'extension et MIME
- Tentative d'upload d'un `.exe` ou `.php` → Rejet
- Capture écran montrant le fichier renommé en UUID

---

## 6. Conformité & RGPD 

*Objectif : Respecter la loi et l'utilisateur.*

### 6.1 Minimisation des données

- [ ] **Formulaire d'inscription minimal** : Seulement Email, Mot de passe, Nom (et rien de plus sans justification)
  - **Interdiction** : Date de naissance, Numéro de Sécu, Adresse complète (sauf si nécessaire pour livraison)

- [ ] **Justification documentée** : Pourquoi chaque champ est collecté

**Preuves attendues :**
- Capture écran du formulaire
- Documentation : "Nous collectons Nom pour [raison], Email pour [raison]"

---

### 6.2 Consentement explicite

- [ ] **Case à cocher pour consentement** (NON pré-cochée)
  - `<input type="checkbox" name="consent" required>` (pas de `checked`)

- [ ] **Texte clair du consentement** : "J'accepte que mes données soient utilisées pour [usage précis]"

- [ ] **Impossible d'envoyer le formulaire sans cocher** : Validation HTML `required` + serveur

**Preuves attendues :**
- Capture écran montrant la case décochée par défaut
- Code HTML montrant `required` sur la checkbox
- Test : Essayer soumettre sans cocher → Rejet

---

### 6.3 Mentions légales & Politique de confidentialité

- [ ] **Page de conformité accessible** : Lien visible dans le footer (`/legal`, `/privacy`, etc.)

- [ ] **Contenu minimal**
  - Qui gère le site (nom, adresse)
  - Quelles données sont collectées
  - À quoi elles servent
  - Durée de conservation
  - Droits des utilisateurs (accès, modification, suppression, portabilité)

- [ ] **Lien dans le footer** : Visible sur toutes les pages

**Preuves attendues :**
- Capture écran du lien dans le footer
- Capture écran de la page `/legal` ou `/privacy`

---

## 7. En-têtes de Sécurité HTTP 

*Objectif : Durcir le navigateur via les headers.*

### 7.1 Headers de sécurité basiques

- [ ] **X-Content-Type-Options: nosniff**
  - Empêche le navigateur de deviner le type MIME

- [ ] **X-Frame-Options: DENY** (ou SAMEORIGIN)
  - Empêche l'affichage du site dans une iframe (Clickjacking)

- [ ] **Content-Security-Policy** (Bonus, si possible)
  - Limite les sources de ressources (scripts, stylesheets)

**Preuves attendues :**
- Inspecteur réseau (Onglet Network) → Headers de réponse
- Captures écrans montrant les headers présents
- Commande : `curl -I https://votre-site.com | grep -i "X-Content\|X-Frame"`

---

### 7.2 Sécurité des cookies (redondance avec section 2.3)

- [ ] **Secure flag** : `Set-Cookie: ... Secure`
- [ ] **HttpOnly flag** : `Set-Cookie: ... HttpOnly`
- [ ] **SameSite flag** : `Set-Cookie: ... SameSite=Strict`

---

## 8. Déploiement & Production 

*Objectif : Appliquer les bonnes pratiques en environnement réel.*

### 8.1 Déploiement sécurisé

- [ ] **Application déployée** (pas juste locale sur `localhost`)
  - Hébergement : Heroku, Railway, OVH, AWS, DigitalOcean, etc.
  - Domaine : URL publique accessible

- [ ] **Configuration de production appliquée** : Pas de debug mode, secrets sécurisés

- [ ] **HTTPS en production** : Certificat SSL/TLS valide (Let's Encrypt gratuit)

**Preuves attendues :**
- URL publique fonctionnelle
- Capture écran avec certificat SSL valide (pas d'avertissement)

---

### 8.2 Logs & Monitoring (Optionnel, Bonus)

- [ ] **Logs des actions importantes** : Authentification, modifications, erreurs
- [ ] **Logs séparés** : Pas dans la même console que les logs système
- [ ] **Aucune donnée sensible dans les logs** : Pas de mots de passe, tokens, etc.

---

## 9. Tests de Sécurité 

*Objectif : Vérifier la solidité globale.*

### 9.1 Audit automatique

- [ ] **Scan de dépendances exécuté** : `npm audit`, `composer audit`, ou `snyk`

- [ ] **Scan SAST (Static Analysis)** (Optionnel)
  - ESLint security plugin, SonarQube, Semgrep

- [ ] **Pas de vulnérabilités critiques restantes**

**Preuves attendues :**
- Rapport de scan (capture écran ou fichier)
- Lien vers la CI/CD montrant l'exécution des tests

---

### 9.2 Test de pénétration basique (Optionnel)

- [ ] **Tentative d'exploitation des 3 failles principales testées**
  - SQL Injection
  - XSS
  - Accès non autorisé (IDOR)

- [ ] **Rapport documenté** : Vulnérabilité, localisation, exploitation, correction

---

## 10. Documentation & Code (General)

*Objectif : Trace et maintenabilité.*

### 10.1 README & Documentation

- [ ] **README.md présent** avec :
  - Description du projet
  - Installation locale
  - Variables d'environnement à configurer (`.env.example`)
  - Commandes de déploiement

- [ ] **Code commenté** sur les parties sensibles (authentification, validation)

- [ ] **Diagramme d'architecture** (optionnel mais apprécié)

**Preuves attendues :**
- Fichier `README.md` dans le repo
- Fichier `.env.example` listant les variables

---

### 10.2 Contrôle de version

- [ ] **Dépôt Git** avec commits clairs
  - Pas de commit "gros commit" sans message
  - Historique lisible

- [ ] **Branch main protégée** (optionnel) : Pas de push direct, review avant merge


---

## Décision Finale

### VALIDÉ (Au moins 90% des cases cochées)
Le projet respecte les standards de sécurité minimaux.

### À RÉVISER (70-89%)
Correction requise avant validation. Liste des points critiques :
- [ ] ...
- [ ] ...

### REFUSÉ (< 70% ou failles critiques)
Le projet présente des vulnérabilités graves. Révision complète nécessaire.

---

## Notes d'Audit

**Observations générales :**

```
[Espace pour commentaires détaillés]
```

**Points forts :**

```
[Ce qui fonctionne bien]
```

**Failles à corriger en priorité :**

1. ...
2. ...
3. ...

**Recommendation pour la suite :**

```
[Conseils pour aller plus loin]
```

---
