# Ejemplos de Uso de Deploy Notificator

## Escenario 1: Un Proyecto con Notificador Incluido

Si tienes el notificador dentro de tu proyecto:

```
mi-app/
├── src/
├── deploy-notificator/
└── deploy.sh
```

**deploy.sh:**
```bash
#!/bin/bash
echo "Deploying..."
git pull
npm run build

# Ejecutar desde dentro del notificador
cd deploy-notificator
node src/notificator.js --type frontend

# O desde fuera especificando el path
node deploy-notificator/src/notificator.js --type frontend
```

---

## Escenario 2: Notificador Centralizado para Múltiples Proyectos (Recomendado)

Instalación única del notificador que sirve a todos tus proyectos:

```
/opt/
├── deploy-notificator/       <- Instalado una vez
│   ├── .env                  <- Configuración centralizada
│   └── src/
└── proyectos/
    ├── frontend-app/
    │   └── deploy.sh
    ├── backend-api/
    │   └── deploy.sh
    └── admin-panel/
        └── deploy.sh
```

### Frontend App Deploy

**/opt/proyectos/frontend-app/deploy.sh:**
```bash
#!/bin/bash
PROJECT_DIR="$(pwd)"
NOTIFICATOR="/opt/deploy-notificator"

echo "Deploying Frontend..."
git pull origin main
npm install
npm run build

# Notificar con información de este proyecto
node "$NOTIFICATOR/src/notificator.js" \
  --type frontend \
  --project-dir "$PROJECT_DIR"
```

### Backend API Deploy

**/opt/proyectos/backend-api/deploy.sh:**
```bash
#!/bin/bash
PROJECT_DIR="$(pwd)"
NOTIFICATOR="/opt/deploy-notificator"

echo "Deploying Backend API..."
git pull origin main
npm install
pm2 restart api

# Notificar
node "$NOTIFICATOR/src/notificator.js" \
  --type backend \
  --project-dir "$PROJECT_DIR"
```

---

## Escenario 3: Instalación Global con npm link

Después de hacer `npm link` en el directorio del notificador:

```bash
# Desde cualquier proyecto
cd /var/www/mi-app
git pull
npm run build

# Simplemente ejecutar
deploy-notify --type frontend

# El comando automáticamente detecta el directorio actual
```

---

## Escenario 4: GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to server
        run: |
          # Tu lógica de deploy aquí
          ./deploy-to-server.sh

      - name: Checkout notificator
        uses: actions/checkout@v3
        with:
          repository: tu-usuario/deploy-notificator
          path: notificator

      - name: Send deployment notification
        env:
          SMTP_SERVICE: gmail
          SMTP_USER: ${{ secrets.SMTP_USER }}
          SMTP_APP_PASSWORD: ${{ secrets.SMTP_APP_PASSWORD }}
          EMAIL_RECIPIENTS: ${{ secrets.EMAIL_RECIPIENTS }}
          SENDER_NAME: GitHub Actions Bot
          APP_NAME_FRONTEND: Mi App Frontend
          APP_URL_FRONTEND: https://app.example.com
          ENVIRONMENT: production
        run: |
          cd notificator
          npm install
          node src/notificator.js --type frontend --project-dir ..
```

---

## Escenario 5: GitLab CI/CD

**.gitlab-ci.yml:**
```yaml
stages:
  - deploy
  - notify

deploy_production:
  stage: deploy
  script:
    - git pull origin main
    - npm install
    - npm run build
    - ./deploy.sh
  only:
    - main

notify_deployment:
  stage: notify
  script:
    - git clone https://gitlab.com/tu-usuario/deploy-notificator.git
    - cd deploy-notificator
    - npm install
    - node src/notificator.js --type frontend --project-dir ..
  variables:
    SMTP_SERVICE: gmail
    SMTP_USER: $SMTP_USER
    SMTP_APP_PASSWORD: $SMTP_APP_PASSWORD
    EMAIL_RECIPIENTS: $EMAIL_RECIPIENTS
    SENDER_NAME: GitLab CI Bot
    APP_NAME_FRONTEND: Mi App
    APP_URL_FRONTEND: https://app.example.com
    ENVIRONMENT: production
  only:
    - main
```

---

## Escenario 6: Deploy Manual en Servidor VPS

Configuración inicial:

```bash
# Conectar al servidor
ssh user@servidor.com

# Instalar el notificador en /opt
cd /opt
git clone <repo>/deploy-notificator.git
cd deploy-notificator
npm install

# Configurar .env
cp .env.example .env
nano .env  # Editar con tus credenciales

# Hacer link global (opcional)
npm link
```

Uso diario:

```bash
# SSH al servidor
ssh user@servidor.com

# Deploy de frontend
cd /var/www/frontend
git pull
npm run build
deploy-notify --type frontend

# Deploy de backend
cd /var/www/backend
git pull
pm2 restart all
deploy-notify --type backend
```

---

## Escenario 7: Cron Job para Deploys Programados

```bash
# crontab -e

# Deploy automático todos los días a las 2 AM
0 2 * * * cd /var/www/mi-app && git pull && npm run build && /opt/deploy-notificator/src/notificator.js --type frontend >> /var/log/deploy.log 2>&1
```

---

## Escenario 8: Diferentes Entornos (Staging, Production)

Puedes tener múltiples archivos .env:

```bash
/opt/deploy-notificator/
├── .env.production
├── .env.staging
└── src/
```

**Script de deploy:**
```bash
#!/bin/bash
ENVIRONMENT=${1:-production}  # Default: production
NOTIFICATOR="/opt/deploy-notificator"

echo "Deploying to $ENVIRONMENT..."
git pull
npm run build

# Cargar el .env correcto
export $(cat "$NOTIFICATOR/.env.$ENVIRONMENT" | xargs)

node "$NOTIFICATOR/src/notificator.js" \
  --type frontend \
  --project-dir "$(pwd)"

# Uso:
# ./deploy.sh production
# ./deploy.sh staging
```

---

## Consejos de Uso

1. **Siempre prueba primero con --dry-run:**
   ```bash
   deploy-notify --type frontend --dry-run
   ```

2. **Verifica la conexión SMTP antes del deploy:**
   ```bash
   deploy-notify --verify
   ```

3. **Para debugging, revisa qué git info se extrae:**
   ```bash
   git log -1 --pretty=format:"%an - %s - %h"
   ```

4. **Usa variables de entorno para credenciales sensibles, nunca las hardcodees**

5. **Si usas el mismo notificador para múltiples apps, asegúrate de que APP_NAME_FRONTEND y APP_NAME_BACKEND estén bien configurados**
