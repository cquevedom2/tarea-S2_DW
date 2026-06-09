# Comandos Útiles del Proyecto

Este archivo contiene los comandos básicos para ejecutar el proyecto en Docker y gestionar el control de versiones con Git.

## 🐳 Docker

### 1. Iniciar el proyecto (Primera vez o para aplicar cambios de configuración)
Construye la imagen de Docker y levanta el contenedor en segundo plano (`-d`).
```bash
docker compose up -d --build
```

### 2. Iniciar el proyecto normalmente
Si la imagen ya está construida, puedes iniciar el proyecto más rápido.
```bash
docker compose up -d
```

### 3. Detener el proyecto
Detiene los contenedores en ejecución sin eliminar sus datos.
```bash
docker compose stop
```

### 4. Apagar y limpiar el proyecto
Detiene y remueve los contenedores y la red de Docker creada para este proyecto.
```bash
docker compose down
```

---

## 🌿 Git

Estos son los comandos para guardar tus cambios en tu rama local y subirlos al servidor.

### 1. Preparar todos los cambios
Añade todos los archivos modificados o nuevos (como `app.py`, plantillas HTML, etc.) para que formen parte del próximo guardado.
```bash
git add .
```

### 2. Crear un punto de guardado (Commit)
Crea una "captura" de tus cambios. Recuerda cambiar el mensaje por uno que describa lo que hiciste.
```bash
git commit -m "Mensaje describiendo los cambios realizados"
```

### 3. Subir los cambios a GitHub
Envía tus cambios empaquetados a tu rama en el repositorio remoto.
```bash
git push origin DevCuchoBackend
```

*(Nota: Si cambias a otra rama, asegúrate de cambiar `DevCuchoBackend` por el nombre de tu nueva rama en el comando de push).*
