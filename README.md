# Deploy Notificator

Sistema de notificaciones por email para deployments, con información automática de Git (commit, branch, autor, mensaje).

## Características

- Notificaciones automáticas por email
- Información completa de Git (branch, commit, autor, mensaje)
- Soporte para frontend/backend
- Retry automático en caso de fallo
- Modo dry-run para testing
- Validación de configuración
- CLI intuitiva

## Inicio Rápido

### 1. Instalación

```bash
git clone <tu-repo>/deploy-notificator.git
cd deploy-notificator
npm install
```

### 2. Configuración

```bash
cp .env.example .env
nano .env
```

Configura las variables necesarias:
- `SMTP_SERVICE` - Servicio de email (gmail)
- `SMTP_USER` - Tu email
- `SMTP_APP_PASSWORD` - Contraseña de aplicación ([cómo obtenerla](#obtener-app-password-de-gmail))
- `EMAIL_RECIPIENTS` - Emails que recibirán notificaciones (separados por comas)
- `SENDER_NAME` - Nombre del remitente
- `APP_NAME_FRONTEND` / `APP_NAME_BACKEND` - Nombre de tus aplicaciones
- `APP_URL_FRONTEND` / `APP_URL_BACKEND` - URLs de tus aplicaciones

### 3. Uso Básico

```bash
# Probar sin enviar email
npm run notify:frontend:dry

# Enviar notificación real
npm run notify:frontend
npm run notify:backend

# Verificar conexión SMTP
npm run verify
```

### Obtener App Password de Gmail

1. Ve a https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos (actívala si no lo está)
3. Contraseñas de aplicaciones
4. Genera una contraseña para "Correo"
5. Cópiala en `SMTP_APP_PASSWORD`

## Opciones CLI

```bash
node src/notificator.js [opciones]
```

### Opciones Principales

| Opción | Descripción |
|--------|-------------|
| `-t, --type <type>` | Tipo: 'frontend' o 'backend' (default: frontend) |
| `-d, --dry-run` | Modo prueba, no envía emails |
| `-v, --verify` | Solo verifica conexión SMTP |
| `-h, --help` | Muestra ayuda |

### Opciones Avanzadas

| Opción | Descripción |
|--------|-------------|
| `-n, --app-name <name>` | Sobrescribe el nombre de la app |
| `-u, --app-url <url>` | Sobrescribe la URL de la app |
| `-p, --project-dir <dir>` | Directorio del proyecto (para extraer git info) |

**Ver ayuda completa:**
```bash
node src/notificator.js --help
```

## Ejemplo de Integración

```bash
#!/bin/bash
# deploy.sh

echo "Deploying..."
git pull origin main
npm run build

# Enviar notificación
node /path/to/deploy-notificator/src/notificator.js --type frontend

echo "Deploy completado!"
```

## Información en las Notificaciones

Cada email incluye:
- Nombre de la aplicación
- Tipo (frontend/backend)
- Fecha y hora
- Branch, commit, autor y mensaje de Git
- Entorno (production, staging, etc.)
- Link a la aplicación

## Casos de Uso

### Un Proyecto, Un Notificador
Si solo tienes un proyecto, usa la configuración básica del `.env`.

### Múltiples Proyectos, Un Notificador
Si tienes varios proyectos y quieres usar un solo notificador centralizado:

👉 **Lee la guía completa:** [CENTRALIZED.md](CENTRALIZED.md)

### Integración con CI/CD
Para GitHub Actions, GitLab CI, Cron Jobs, etc:

👉 **Ver ejemplos:** [EXAMPLES.md](EXAMPLES.md)

## Estructura del Proyecto

```
deploy-notificator/
├── src/
│   ├── notificator.js              # Script principal
│   ├── lib/                        # Módulos
│   │   ├── config.js               # Configuración
│   │   ├── mailer.js               # Envío de emails
│   │   └── git-info.js             # Info de Git
│   └── templates/
│       └── animateEmailTemplate.ejs # Template del email
├── .env.example                     # Ejemplo básico
├── .env.centralized.example         # Ejemplo centralizado
├── CENTRALIZED.md                   # Guía para múltiples proyectos
├── EXAMPLES.md                      # Ejemplos de integración
├── package.json
└── README.md
```

## Troubleshooting

### Error: "Missing required environment variables"
- Verifica que `.env` exista
- Compara con `.env.example`
- Asegúrate de tener todas las variables requeridas

### Error al enviar email
```bash
# Verificar conexión
npm run verify
```
- Usa una **contraseña de aplicación**, no tu password de Gmail
- Verifica que la verificación en dos pasos esté activada

### No se extrae información de Git
- Asegúrate de estar en un repositorio Git válido
- Si no es un repo Git, el notificador usará valores por defecto

## Documentación Adicional

- **[CENTRALIZED.md](CENTRALIZED.md)** - Guía completa para usar UN notificador con MÚLTIPLES proyectos
- **[EXAMPLES.md](EXAMPLES.md)** - Ejemplos de integración (GitHub Actions, GitLab CI, Cron Jobs, etc.)

## Contribuir

Las contribuciones son bienvenidas. Abre un issue para discutir cambios.

## Licencia

ISC - Yeltsin Lopez
