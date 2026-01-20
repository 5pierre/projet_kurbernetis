
bug front react 
le regex affiché et celui pris en compte n'est pas le méme:



minikube addons enable ingress
minikube tunnel # A laisser tourner dans un terminal séparé (Mot de passe admin requis)

Configurer le DNS local ?

kubectl apply -f 01-secrets-config.yaml
kubectl apply -f 02-postgres.yaml
kubectl apply -f 03-backends.yaml
kubectl apply -f 04-frontend.yaml
kubectl apply -f 05-ingress.yaml