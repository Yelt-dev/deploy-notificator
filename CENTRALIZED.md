# Guía: Notificador Centralizado para Múltiples Proyectos

Esta guía explica cómo configurar **UN solo notificador** que sirva a **MÚLTIPLES proyectos**.

---

## Configuración Inicial

### 1. Instalar el Notificador en una Ubicación Centralizada

```bash
# Clonar en una ubicación accesible (ejemplo: /opt)
cd /opt
git clone <tu-repo>/deploy-notificator.git
cd deploy-notificator
npm install
```

### 2. Configurar .env Simplificado

```bash
cp .env.centralized.example .env
nano .env
```

**Contenido del .env:**
```env
# Email Configuration
SMTP_SERVICE=gmail
SMTP_USER=deploy-bot@company.com
SMTP_APP_PASSWORD=xxxx

# Recipients (todos los que recibirán notificaciones)
EMAIL_RECIPIENTS=dev1@company.com,dev2@company.com,lead@company.com

# Sender
SENDER_NAME=Deploy Bot

# Environment
ENVIRONMENT=production
```

**IMPORTANTE:** NO necesitas definir `APP_NAME_FRONTEND`, `APP_NAME_BACKEND`, ni URLs aquí. Los pasarás como argumentos CLI.

---

## Uso con Múltiples Proyectos

### Estructura de Ejemplo

```
Servidor:
├── /opt/deploy-notificator/          <- Notificador centralizado
│   └── .env                          <- Configuración única
│
└── /var/www/
    ├── ecommerce-frontend/
    │   └── deploy.sh
    ├── ecommerce-backend/
    │   └── deploy.sh
    ├── blog-app/
    │   └── deploy.sh
    └── admin-panel/
        └── deploy.sh
```

---

## Ejemplos de Deploy Scripts

### Proyecto 1: E-commerce Frontend

**/var/www/ecommerce-frontend/deploy.sh:**
```bash
#!/bin/bash
echo "Deploying E-commerce Frontend..."

# Tu proceso de deploy
git pull origin main
npm install
npm run build

# Notificar con nombre y URL específicos
node /opt/deploy-notificator/src/notificator.js \
  --type frontend \
  --app-name "E-commerce Shop" \
  --app-url "https://shop.mycompany.com"

echo "Deploy completed!"
```

### Proyecto 2: E-commerce Backend

**/var/www/ecommerce-backend/deploy.sh:**
```bash
#!/bin/bash
echo "Deploying E-commerce Backend..."

git pull origin main
npm install
pm2 restart ecommerce-api

# Notificar con nombre y URL diferentes
node /opt/deploy-notificator/src/notificator.js \
  --type backend \
  --app-name "E-commerce API" \
  --app-url "https://api.mycompany.com"

echo "Deploy completed!"
```

### Proyecto 3: Blog

**/var/www/blog-app/deploy.sh:**
```bash
#!/bin/bash
echo "Deploying Blog..."

git pull origin main
npm run build

# Otro proyecto, otra configuración
node /opt/deploy-notificator/src/notificator.js \
  --type frontend \
  --app-name "Company Blog" \
  --app-url "https://blog.mycompany.com"
```

### Proyecto 4: Admin Panel

**/var/www/admin-panel/deploy.sh:**
```bash
#!/bin/bash
echo "Deploying Admin Panel..."

git pull origin production
npm install
npm run build

node /opt/deploy-notificator/src/notificator.js \
  --type frontend \
  --app-name "Admin Dashboard" \
  --app-url "https://admin.mycompany.com"
```

---

## Ventajas de Este Enfoque

✅ **Un solo .env** - Configuración SMTP en un solo lugar
✅ **Fácil mantenimiento** - Cambiar credenciales en un solo sitio
✅ **Flexible** - Cada proyecto define su propio nombre y URL
✅ **Sin duplicación** - No necesitas copiar el notificador en cada proyecto
✅ **Escalable** - Agregar nuevos proyectos es trivial

---

## Scripts Avanzados

### Script con Variables

```bash
#!/bin/bash
# deploy.sh

# Configuración del proyecto
APP_NAME="My Application"
APP_URL="https://myapp.com"
DEPLOY_TYPE="frontend"
NOTIFICATOR="/opt/deploy-notificator"

echo "Deploying $APP_NAME..."
git pull
npm run build

# Notificar
node "$NOTIFICATOR/src/notificator.js" \
  --type "$DEPLOY_TYPE" \
  --app-name "$APP_NAME" \
  --app-url "$APP_URL"
```

### Script con Detección Automática

```bash
#!/bin/bash
# auto-deploy.sh

# Detectar el nombre del proyecto del directorio actual
PROJECT_NAME=$(basename "$PWD")
APP_URL="https://${PROJECT_NAME}.mycompany.com"

echo "Deploying $PROJECT_NAME..."
git pull
npm run build

node /opt/deploy-notificator/src/notificator.js \
  --type frontend \
  --app-name "$PROJECT_NAME" \
  --app-url "$APP_URL"
```

### Script con Entorno Variable

```bash
#!/bin/bash
# deploy.sh [production|staging]

ENVIRONMENT=${1:-production}
APP_NAME="Payment API"

if [ "$ENVIRONMENT" = "production" ]; then
    APP_URL="https://api.mycompany.com"
else
    APP_URL="https://staging-api.mycompany.com"
fi

echo "Deploying to $ENVIRONMENT..."
git pull
npm run build

# Sobrescribir environment
ENVIRONMENT="$ENVIRONMENT" node /opt/deploy-notificator/src/notificator.js \
  --type backend \
  --app-name "$APP_NAME ($ENVIRONMENT)" \
  --app-url "$APP_URL"

# Uso: ./deploy.sh production
#      ./deploy.sh staging
```

---

## Instalación Global (Opcional)

Para hacer el comando aún más fácil:

```bash
cd /opt/deploy-notificator
npm link
```

Ahora puedes usar `deploy-notify` desde cualquier lugar:

```bash
cd /var/www/my-app
deploy-notify \
  --type frontend \
  --app-name "My App" \
  --app-url "https://myapp.com"
```

---

## Comparación: .env vs CLI Arguments

### Opción A: Todo en .env (Para 1-2 Proyectos)

**.env:**
```env
APP_NAME_FRONTEND=My Frontend
APP_URL_FRONTEND=https://app.com
APP_NAME_BACKEND=My API
APP_URL_BACKEND=https://api.com
```

**Uso:**
```bash
node notificator.js --type frontend  # Usa APP_NAME_FRONTEND
node notificator.js --type backend   # Usa APP_NAME_BACKEND
```

**Problema:** ¿Qué pasa si tienes 5 frontends diferentes?

---

### Opción B: CLI Arguments (Para Múltiples Proyectos) ✅

**.env:**
```env
# Solo configuración SMTP y recipients
SMTP_USER=...
EMAIL_RECIPIENTS=...
```

**Uso:**
```bash
# Proyecto 1
node notificator.js --type frontend --app-name "Shop" --app-url "https://shop.com"

# Proyecto 2
node notificator.js --type frontend --app-name "Blog" --app-url "https://blog.com"

# Proyecto 3
node notificator.js --type backend --app-name "API" --app-url "https://api.com"
```

**Ventaja:** Infinitos proyectos, un solo .env

---

## Troubleshooting

### Error: "Missing app name"

Si ves este error:
```
Missing app name. Either:
  1. Set APP_NAME_FRONTEND in your .env file, or
  2. Use --app-name flag when running the command
```

**Solución:** Agrega `--app-name` al comando:
```bash
node notificator.js --type frontend --app-name "Mi App"
```

---

## FAQ

**P: ¿Puedo mezclar .env y CLI arguments?**
R: Sí! Los argumentos CLI tienen prioridad sobre .env.

```bash
# Si tienes APP_NAME_FRONTEND en .env, pero quieres sobrescribirlo:
node notificator.js --type frontend --app-name "Override Name"
```

**P: ¿Los argumentos necesitan comillas si tienen espacios?**
R: Sí, usa comillas:
```bash
--app-name "My Application Name"  # ✓ Correcto
--app-name My Application Name     # ✗ Incorrecto
```

**P: ¿Puedo omitir --app-url?**
R: Sí, será "N/A" en el email.

**P: ¿Cómo cambio los recipients por proyecto?**
R: Actualmente todos los proyectos usan EMAIL_RECIPIENTS del .env. Si necesitas diferentes recipients por proyecto, considera crear múltiples archivos .env y cargarlos según el proyecto.

---

## Resumen

Para usar el notificador con múltiples proyectos:

1. **Instala una vez** en `/opt/deploy-notificator`
2. **Configura .env** con SMTP y recipients únicamente
3. **Usa --app-name y --app-url** en cada deploy script
4. **Profit!** Cada proyecto envía notificaciones personalizadas

**Comando base:**
```bash
node /opt/deploy-notificator/src/notificator.js \
  --type [frontend|backend] \
  --app-name "Nombre de tu App" \
  --app-url "https://tu-app.com"
```
