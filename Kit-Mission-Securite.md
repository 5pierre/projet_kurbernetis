# Kit de Mission : Sécurité Web

---

## Introduction

Vous n'avez pas de cours magistral. À la place, vous avez une **mission réelle** et un **kit de survie**.

**Pourquoi ?** Parce que dans le monde réel, la sécurité c'est ça : vous avez une liste de règles à respecter, internet comme ressource, et vous devez faire fonctionner votre projet.

**Ce que ce document fait :**
- Vous montre CE QUE vous devez faire (les règles)
- Vous pointe VERS LES BONNES RESSOURCES 
- Ne vous donne PAS la solution toute prête

---

## Rappel de votre Mission 

Créer une application web **complètement sécurisée** en 1 semaine.

**Liberté totale :**
- Sujet : E-commerce, Blog, Réseau social, Todo list, Gestion de tâches... vous choisissez
- Technologie : Node, PHP, Python, React, Vue... ce que vous maîtrisez
- Complexité : Simple mais sécurisé > Complexe et troué

**Contrainte unique :**
Respecter la **Checklist d'Audit Sécurité**. Si une case n'est pas cochée, c'est rejeté.

---

## Les 2 Points de Contrôle Obligatoires

### Point de Contrôle #1 :

**Ce que vous devez présenter :**
- "On fait un [Type de projet]"
- "On utilise [Technologie] en back"
- "On utilise [Technologie] en front"
- "Pour l'authentification, on utilise [Solution]"

**Exemple valide :**
> "On fait un blog. Back en Node.js + Express + Passport.js. Front en React. Pour la base de données, PostgreSQL avec Sequelize ORM."

**Exemple REJETÉ :**
> "On va faire un truc en PHP basic + MySQL connecté directement."

**Pourquoi ?** Pour valider que votre stack est :
- Moderne 
- Pas trop complexe pour votre niveau
- Sécurisé "by default"

**Action :** Envoyez un message Teams avec votre plan.

---

### Point de Contrôle #2 :

**Ce que vous devez montrer :**
- La page de **Login** qui fonctionne
- La page de **Register** qui fonctionne
- **Une requête SQL** montrant le hash du mot de passe en base de données

**Capture écran attendue :**
```
SELECT email, password FROM users LIMIT 1;

| email              | password                                                   |
|--------------------|------------------------------------------------------------|
| user@example.com   | $2y$10$N9qo8uLO... (bcrypt hash, pas du texte brut)        |
```

**Action :** Envoyez une capture écran du résultat de la requête SQL.

---

## Les 10 Domaines de Sécurité

Pour chaque domaine, vous avez :
1. **Le concept à comprendre** 
2. **La ressource officielle** 
3. **Le code d'exemple** 
4. **Les pièges à éviter**

---

## Authentification & Mots de Passe

### Le Concept

Un mot de passe ne doit **JAMAIS** être stocké en clair. Vous avez une formule mathématique (hachage) qui transforme "Mon123Mot" en une suite de caractères qui ne peut pas être inversée.

**Exemple :**
- Vous tapez : `Mon123Mot!`
- La formule crée : `$2y$10$N9qo8uLO... (65 caractères incompréhensibles)`
- Si quelqu'un pirate la base de données : il ne peut rien faire avec ces 65 caractères

### Les Ressources

**La Bible :**
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- Contient tout ce qu'il faut savoir sur le hachage de mots de passe

**Les Bibliothèques Officielles (utilisez-les, ne codez pas à la main) :**

**Node.js :**
- Bibliothèque : `bcrypt` (NPM)
- Installation : `npm install bcrypt`
- Code minimal :
```javascript
const bcrypt = require('bcrypt');

// Lors de l'inscription
const hashedPassword = await bcrypt.hash(userPassword, 10);
// Stockez hashedPassword en base

// Lors du login
const isValid = await bcrypt.compare(userPassword, storedHash);
```

**PHP :**
- Fonction native (déjà intégrée) : `password_hash()`
```php
// Lors de l'inscription
$hash = password_hash($userPassword, PASSWORD_BCRYPT);
// Stockez $hash en base

// Lors du login
$isValid = password_verify($userPassword, $storedHash);
```

**Python :**
- Bibliothèque : `bcrypt` (pip)
- Installation : `pip install bcrypt`
```python
import bcrypt

# Lors de l'inscription
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
# Stockez hashed en base

# Lors du login
is_valid = bcrypt.checkpw(password.encode(), stored_hash)
```

### Pièges à Éviter 

**Ne JAMAIS utiliser ces algorithmes :** MD5, SHA1, SHA256 simple
**Ne JAMAIS stocker le mot de passe en texte clair**
**Ne JAMAIS coder votre propre hachage**

---

## Injections SQL (La Base de Données)

### Le Concept

Vous écrivez du SQL. Un utilisateur écrit du code SQL à la place du nom. Résultat : il récupère TOUTES vos données.

**Exemple d'attaque :**
- Vous attendez : "Pierre"
- L'attaquant tape : `' OR '1'='1`
- Le SQL devient : `SELECT * FROM users WHERE name = '' OR '1'='1'` 
- **Résultat :** Tous les utilisateurs sont retournés.

### La Solution : Requêtes Préparées

**Ne JAMAIS faire :**
```javascript
// MAUVAIS - SQL Injection possible
const query = "SELECT * FROM users WHERE id = " + userId;
db.query(query, (err, results) => { ... });
```

**TOUJOURS faire :**
```javascript
// BON - Requête préparée
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId], (err, results) => { ... });
// Le ? est un placeholder. userId est séparé et sécurisé
```

### Les Ressources

**Documentation par langage :**

**Node.js + MySQL :**
- Guide : [MySQL2/Promise Documentation](https://github.com/sidorares/node-mysql2)
- Exemple :
```javascript
const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
```

**Node.js + Mongoose (MongoDB) :**
- Mongoose protège par défaut contre les injections
```javascript
const user = await User.findById(userId);
```

**PHP + PDO :**
- Guide : [PHP PDO Documentation](https://www.php.net/manual/en/class.pdo.php)
- Exemple :
```php
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();
```

**Python + SQLAlchemy (ORM) :**
- Protégé par défaut
```python
user = db.session.query(User).filter_by(id=user_id).first()
```

### Pièges à Éviter

**Ne jamais concaténer des variables dans du SQL**
**Ne jamais faire confiance à l'utilisateur**
**Ne jamais ignorer les avertissements de "SQL injection" de votre IDE**

### Test de Réussite

Inspectez votre code pour chaque requête SQL. Vérifiez que :
1. Aucune variable n'est directement dans la chaîne SQL
2. Les paramètres sont passés séparément (? ou :param)
3. Vous utilisez un ORM ou des requêtes préparées

**Vérification rapide :**
```bash
# Grep toutes vos requêtes SQL
grep -r "SELECT.*WHERE" src/

# Aucune ne doit avoir de + ou de `${}`
# OK : "SELECT * FROM users WHERE id = ?" 
# NO : "SELECT * FROM users WHERE id = " + id
```

---

## Cross-Site Scripting (XSS)

### Le Concept

Un utilisateur écrit du JavaScript dans un commentaire. Ce code s'exécute sur le navigateur des autres utilisateurs.

**Exemple d'attaque :**
- Vous avez une page de commentaires
- L'attaquant poste : `<script>alert('XSS')</script>`
- Un autre utilisateur voit le commentaire
- **Résultat :** Le script s'exécute sur SON navigateur

### La Solution : Échappement (Escaping)

Vous transformez `<` en `&lt;` et `>` en `&gt;` pour que le navigateur affiche du texte, pas du code.

**Ne JAMAIS faire :**
```html
<!-- MAUVAIS - Direct HTML -->
<div>Commentaire : <%= userComment %></div>
```

**TOUJOURS faire (automatique avec les bons frameworks) :**
```html
<!-- BON - Framework échappe automatiquement -->
<!-- Twig (Symfony) -->
<div>Commentaire : {{ userComment }}</div>

<!-- Blade (Laravel) -->
<div>Commentaire : {{ $userComment }}</div>

<!-- React (JSX) -->
<div>Commentaire : {userComment}</div>

<!-- Vue -->
<div>Commentaire : {{ userComment }}</div>
```

### Les Ressources

**La Bible XSS :**
- [OWASP XSS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

**Les Frameworks qui échappent par défaut :**
- Twig (Symfony)
- Blade (Laravel)
- React JSX
- Vue

**Si vous manipulez du HTML en JavaScript :**
- Utilisez `textContent` au lieu de `innerHTML`
- Ou utilisez la libraire `DOMPurify`

### Pièges à Éviter

**Ne JAMAIS utiliser `innerHTML` avec du contenu utilisateur**
**Ne JAMAIS désactiver l'échappement (v-html, dangerouslySetInnerHTML) sans raison**
**Ne jamais faire confiance aux données utilisateur**

### Test de Réussite 

**Test simple :**
1. Allez sur votre formulaire de commentaire
2. Écrivez : `<script>alert('XSS')</script>`
3. Soumettez

**Résultat accepté :** Vous voyez le texte brut `<script>alert('XSS')</script>` affiché (pas un popup)
**Résultat REJETÉ :** Un popup `alert` apparaît (= faille XSS)

---

## Conformité RGPD & Minimisation des Données

### Le Concept

Vous ne collectez QUE ce que vous avez besoin. Pas de date de naissance "juste au cas où", pas de numéro de téléphone "pour plus tard".

**Exemple MAUVAIS :**
```html
<form>
  <input type="email" name="email"> ← OK, nécessaire
  <input type="password" name="password"> ← OK, nécessaire
  <input type="text" name="nom"> ← OK, nécessaire
  <input type="date" name="naissance"> ← Pourquoi ?
  <input type="text" name="numero_secu"> ← DANGEREUX
</form>
```

**Exemple BON :**
```html
<form>
  <input type="email" name="email"> ← Nécessaire pour l'authentification
  <input type="password" name="password"> ← Nécessaire pour l'authentification
  <input type="text" name="nom"> ← Nécessaire pour afficher le nom
  <!-- Pas d'autres champs -->
</form>
```

### Les Ressources

**La Loi :**
- [RGPD Article 5 - Principes](https://gdpr-info.eu/art-5-gdpr/)
- [CNIL - Le RGPD expliqué](https://www.cnil.fr/fr/comprendre-le-rgpd)

**Les Règles Simples :**
1. **Minimisation :** Collectez le moins possible
2. **Consentement :** Demandez permission (checkbox, pas pré-cochée)
3. **Transparence :** Dites ce que vous faites avec les données
4. **Droit à l'oubli :** Les utilisateurs peuvent demander suppression

### Pièges à Éviter 

**Ne jamais avoir une checkbox pré-cochée pour le consentement**
**Ne jamais collecter des données "juste au cas où"**
**Ne jamais vendre/partager les données sans permission explicite**

### Test de Réussite 

**Checklist :**
- [ ] Votre formulaire d'inscription demande : Email + Mot de passe + Nom (seulement)
- [ ] Il y a une checkbox NON pré-cochée : "J'accepte les conditions"
- [ ] Un lien "Mentions Légales" ou "Politique de confidentialité" existe et est accessible


---

## Protection CSRF (Cross-Site Request Forgery)

### Le Concept

Un utilisateur connecté à votre site visite un autre site malveillant. Ce site essaie de faire une action sur votre site (transférer de l'argent, changer l'email, etc.) sans permission.

**Exemple d'attaque :**
1. Vous êtes connecté à votre banque
2. Vous visitez un site malveillant (pendant ce temps)
3. Le site malveillant essaie : `POST /transfer?to=attacker&amount=1000`
4. Comme vous êtes connecté à la banque, la requête est acceptée
5. **Résultat :** On vous a volé 1000€ ! 

### La Solution : Token CSRF

Vous générez un token unique pour chaque formulaire. Sans ce token, le formulaire ne peut pas être soumis.

**Ne JAMAIS faire :**
```html
<!-- MAUVAIS - Pas de token -->
<form method="POST" action="/transfer">
  <input type="text" name="amount">
  <button>Envoyer</button>
</form>
```

**TOUJOURS faire :**
```html
<!-- BON - Avec token CSRF -->
<form method="POST" action="/transfer">
  <input type="hidden" name="csrf_token" value="abc123xyz...">
  <input type="text" name="amount">
  <button>Envoyer</button>
</form>
```

### Les Ressources

**Frameworks qui l'incluent par défaut :**
- Symfony (automatique)
- Laravel (automatique avec `@csrf`)
- Django (automatique)

**Si vous devez le faire à la main :**
- [OWASP CSRF Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

### Pièges à Éviter 

**Ne jamais oublier le token dans un formulaire POST**
**Ne jamais accepter de requête POST sans valider le token**

### Test de Réussite 

**Pour chaque formulaire POST :**
1. Inspectez le code HTML (`F12` > Éléments)
2. Cherchez un `<input type="hidden" name="csrf_token">`
3. S'il existe, c'est bon

---

## Uploads de Fichiers (Si Applicable)

### Le Concept

Un utilisateur upload un fichier `.php` ou `.exe` à la place d'une image. Vous l'exécutez accidentellement = faille !

### La Solution : Validation Triple

1. **Vérifier l'extension** (liste blanche)
2. **Vérifier le type MIME** côté serveur
3. **Renommer le fichier** avec un UUID

**Ne JAMAIS faire :**
```php
// MAUVAIS - Accepte tout
move_uploaded_file($_FILES['avatar']['tmp_name'], 'uploads/' . $_FILES['avatar']['name']);
```

**TOUJOURS faire :**
```php
// BON - Validation complète
$allowed = ['jpg', 'png', 'pdf'];
$ext = strtolower(pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowed)) {
    die('Extension non autorisée');
}

// Vérifier le MIME côté serveur
$mime = mime_content_type($_FILES['avatar']['tmp_name']);
if (!in_array($mime, ['image/jpeg', 'image/png', 'application/pdf'])) {
    die('Type MIME non autorisé');
}

// Renommer avec UUID
$filename = bin2hex(random_bytes(16)) . '.' . $ext;
move_uploaded_file($_FILES['avatar']['tmp_name'], 'uploads/' . $filename);
```

### Les Ressources

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

### Test de Réussite

**Test d'upload malveillant :**
1. Créez un fichier `test.php` vide
2. Essayez de l'uploader
3. **Résultat accepté :** Rejeté avec message d'erreur
4. **Résultat REJETÉ :** Le fichier est accepté ou exécuté

---

## En-têtes de Sécurité HTTP

### Le Concept

Vous dites au navigateur de l'utilisateur : "Attention, sois prudent sur ce site". Le navigateur applique des règles strictes.

**Exemples d'en-têtes :**
- `X-Content-Type-Options: nosniff` → Le navigateur ne doit pas deviner le type de fichier
- `X-Frame-Options: DENY` → Mon site ne peut pas être affiché dans une iframe

### Les Ressources

**Les 2 en-têtes minimums :**
- [OWASP Secure Headers Project](https://secureheadersproject.com/)

### Comment les Ajouter

**Node.js + Express :**
```javascript
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  next();
});
```

**PHP :**
```php
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
```

**Nginx (configuration serveur) :**
```
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "DENY";
```

### Test de Réussite 

**Vérifiez les headers :**
1. Ouvrez le navigateur (F12 > Network)
2. Rechargez la page
3. Cliquez sur la requête HTML
4. Allez dans "Response Headers"
5. Vérifiez que `X-Content-Type-Options` et `X-Frame-Options` sont présents

---

## HTTPS & Certificats

### Le Concept

Toute communication doit être chiffrée. Pas de HTTP simple, toujours HTTPS.

Même en local !

### Générer un Certificat Local

**Utilisez mkcert (le plus simple) :**

1. Installez mkcert : https://github.com/FiloSottile/mkcert
2. Lancez :
```bash
mkcert localhost 127.0.0.1 ::1
```
3. Vous obtenez 2 fichiers : `localhost+2-key.pem` et `localhost+2.pem`
4. Configurez votre serveur pour utiliser ces fichiers

**Alternative Symfony :**
```bash
symfony server:ca:install
```

### Test de Réussite

- [ ] Votre URL locale commence par `https://` (pas `http://`)
- [ ] Pas d'avertissement sécurité dans le navigateur

---

## Gestion des Secrets (.env)

### Le Concept

Les secrets (mots de passe BDD, clés API, etc.) ne doivent JAMAIS être dans le code source. Ils vont dans un fichier `.env` ignoré par Git.

### Les Fichiers

**`.env.example` ← Poussé sur GitHub**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=CHANGEZ_MOI
API_KEY=CHANGEZ_MOI
```

**`.env` ← JAMAIS poussé sur GitHub (dans .gitignore)**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=MonVraiMotDePasseSecret123
API_KEY=abc123xyz789
```

### Configuration Git

**Ajoutez à `.gitignore` :**
```
.env
.env.local
```

### Utilisation dans le Code

**Node.js :**
```javascript
require('dotenv').config();
const dbPassword = process.env.DB_PASSWORD;
```

**PHP :**
```php
$dbPassword = $_ENV['DB_PASSWORD'];
// Ou avec un package
```

**Python :**
```python
import os
db_password = os.getenv('DB_PASSWORD')
```

### Test de Réussite

**Vérification :**
1. Lancez : `grep -r "password" src/` (ne doit rien afficher ou montrer des variables)
2. Lancez : `git status` (le fichier `.env` ne doit pas être là)
3. Le fichier `.env.example` DOIT être dans Git

---

## Déploiement en Production

### Le Concept

Vous mettez votre app en ligne sur un vrai serveur vrai, pas sur votre ordinateur.

### Les Plateformes Faciles

**Quelques exemples :**
- [Railway](https://railway.app/) (super facile, gratuit quelque temps)
- [Render](https://render.com/) (gratuit)
- ...

### Comment Déployer

**Avec Railway (le plus simple) :**
1. Connectez votre GitHub
2. Sélectionnez votre repo
3. Railway détecte automatiquement votre techno
4. Cliquez "Deploy"
5. 5 minutes plus tard = votre app en ligne 

**Les Ressources :**
- [Railway Docs](https://docs.railway.app/)

### Le Certificat SSL

Les plateformes incluent HTTPS automatiquement (via Let's Encrypt).

**Vous devriez avoir :**
- Une URL comme `https://mon-app-12345.railway.app`
- Pas d'avertissement sécurité dans le navigateur
- Le cadenas vert dans la barre d'adresse

### Test de Réussite 

- [ ] Votre app est accessible sur une URL publique (pas localhost)
- [ ] L'URL commence par `https://`
- [ ] Aucun avertissement sécurité

---

## Votre Checklist Finale

**Avant de soumettre votre projet, vérifiez :**

### Authentification 
- [ ] Login et Register fonctionnent
- [ ] Les mots de passe sont hachés avec bcrypt/Argon2/PBKDF2
- [ ] Les cookies sont HttpOnly + Secure + SameSite
- [ ] Le logout détruit la session

### Données 
- [ ] Toutes les requêtes SQL utilisent des requêtes préparées
- [ ] Les données affichées sont échappées (pas de XSS)
- [ ] Les validations se font côté serveur
- [ ] Le formulaire d'inscription ne demande que Email/Pass/Nom

### RGPD 
- [ ] Une checkbox de consentement non pré-cochée existe
- [ ] Une page "Mentions Légales" ou "Politique de confidentialité" existe
- [ ] Un fichier `.env.example` documente les variables

### Sécurité HTTP 
- [ ] Headers `X-Content-Type-Options` et `X-Frame-Options` présents
- [ ] HTTPS activé (local + production)
- [ ] Pas de fichier `.env` dans Git

### Production 
- [ ] App déployée sur une URL publique
- [ ] Certificat SSL valide (pas d'avertissement)
- [ ] Les secrets sont dans des variables d'environnement

### Tests 
- [ ] `npm audit` / `composer audit` / `pip check` = 0 vulnérabilités "High"
- [ ] Code revu avec la Checklist d'Audit (90%+ des cases cochées)

---

## Les Pièges Classiques (À Tous Les Coups)

Si vous faites UN de ces trucs, votre projet sera rejeté :

1. **Le fichier `.env` est poussé sur GitHub** → FAIL immédiat
   - Ajoutez `.env` à `.gitignore` MAINTENANT

2. **Les mots de passe sont en MD5 ou SHA1** → FAIL immédiat
   - Utilisez bcrypt/Argon2

3. **SQL avec concaténation de variables** → FAIL immédiat
   - Utilisez des requêtes préparées

4. **La checkbox de consentement est pré-cochée** → FAIL immédiat
   - Enlevez l'attribut `checked`

5. **Erreurs PHP/Node complètes affichées à l'utilisateur** → FAIL immédiat
   - Cachez les erreurs en production

---


## Conseil Final

**La sécurité ça peut paraitre "chiant", mais c'est crucial.**

Vous allez avoir la tentation de penser "C'est un petit projet, pas grave si je saute la sécurité".

**FAUX.**

Les mêmes bugs de sécurité qui tuent les petits projets tuent les gros. Alors autant apprendre à bien les faire.
