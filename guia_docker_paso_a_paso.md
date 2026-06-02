# 🐳 Guía SUPER Detallada: Dockerizar el Proyecto Lumen

> [!IMPORTANT]
> **Estado actual:** Ya creé todos los archivos necesarios en tu proyecto. Esta guía te indica los comandos que debes ejecutar y cómo verificar que todo funciona.

---

## 📋 Lo que ya hice por ti (archivos creados/modificados)

| Archivo | Acción | Para qué sirve |
|---------|--------|----------------|
| [Dockerfile](file:///c:/Users/lenovo/Desktop/8vo%20Semestre/Gestiion%20Configuracion%20Software/S7/Dockerfile) | ✅ CREADO | La "receta" para construir la imagen de tu app |
| [docker-compose.yml](file:///c:/Users/lenovo/Desktop/8vo%20Semestre/Gestiion%20Configuracion%20Software/S7/docker-compose.yml) | ✅ CREADO | Orquesta los servicios (levanta todo con un comando) |
| [.dockerignore](file:///c:/Users/lenovo/Desktop/8vo%20Semestre/Gestiion%20Configuracion%20Software/S7/.dockerignore) | ✅ CREADO | Evita copiar archivos innecesarios a la imagen |
| [.env](file:///c:/Users/lenovo/Desktop/8vo%20Semestre/Gestiion%20Configuracion%20Software/S7/.env) | ✅ CREADO | Variables de entorno para el contenedor |
| [requirements.txt](file:///c:/Users/lenovo/Desktop/8vo%20Semestre/Gestiion%20Configuracion%20Software/S7/requirements.txt) | ✏️ MODIFICADO | Se agregó `gunicorn` (servidor de producción) |
| [app.py](file:///c:/Users/lenovo/Desktop/8vo%20Semestre/Gestiion%20Configuracion%20Software/S7/app.py) | ✏️ MODIFICADO | Se cambió `app.run()` para que funcione dentro de Docker |
| [.gitignore](file:///c:/Users/lenovo/Desktop/8vo%20Semestre/Gestiion%20Configuracion%20Software/S7/.gitignore) | ✏️ MODIFICADO | Se agregó entrada para Docker |

---

## 🚀 PASO A PASO — Lo que TÚ debes hacer

### PASO 0: Verificar que Docker Desktop está corriendo

1. Mira en la **barra de tareas de Windows** (abajo a la derecha, cerca del reloj)
2. Busca el ícono de la **ballena 🐳** de Docker
3. Si está ahí y NO tiene una "X" roja, **Docker está corriendo** ✅
4. Si no lo ves, abre **Docker Desktop** desde el menú de inicio

> [!TIP]
> Para confirmar que Docker funciona, abre **PowerShell** y escribe:
> ```
> docker --version
> ```
> Debería mostrarte algo como: `Docker version 27.x.x, build xxxxx`

---

### PASO 1: Abrir la Terminal correcta

> [!CAUTION]
> **¡IMPORTANTE!** Usa **PowerShell**, NO Git Bash. Docker en Windows funciona mejor con PowerShell.

**Cómo abrir PowerShell en la carpeta correcta:**

1. En VS Code, presiona **Ctrl + ñ** (o ve a `Terminal > New Terminal`)
2. Asegúrate de que dice **PowerShell** en la parte superior derecha de la terminal
3. Si dice "bash" o "Git Bash", haz clic en el dropdown (▾) junto a él y selecciona **PowerShell**

**Verifica que estás en la carpeta correcta.** La terminal debe mostrar algo como:
```
PS C:\Users\lenovo\Desktop\8vo Semestre\Gestiion Configuracion Software\S7>
```

Si no estás ahí, navega con:
```powershell
cd "C:\Users\lenovo\Desktop\8vo Semestre\Gestiion Configuracion Software\S7"
```

---

### PASO 2: Verificar que estás en la rama correcta

Escribe en la terminal:
```powershell
git branch
```

Deberías ver algo así (el asterisco `*` indica la rama actual):
```
  DevCuchoBackend
* feature/docker
  main
```

✅ Si ves `* feature/docker` → **¡Perfecto, ya estás en la rama correcta!**

❌ Si NO estás en `feature/docker`, ejecuta:
```powershell
git checkout feature/docker
```

---

### PASO 3: Construir la imagen Docker

> [!NOTE]
> Este paso descarga Python 3.11, instala las dependencias de tu app, y crea una "imagen" (como una foto) de tu proyecto listo para ejecutarse. **La primera vez tarda unos minutos** porque tiene que descargar todo.

Escribe en la terminal:
```powershell
docker compose build
```

**Lo que deberías ver (aproximado):**
```
[+] Building 45.2s (9/9) FINISHED
 => [internal] load build definition from Dockerfile
 => [internal] load .dockerignore
 => [1/4] FROM docker.io/library/python:3.11-slim
 => [2/4] WORKDIR /app
 => [3/4] COPY requirements.txt .
 => [4/4] COPY . .
 => exporting to image
```

**Si ves errores comunes:**

| Error | Solución |
|-------|----------|
| `docker: command not found` | Docker Desktop no está corriendo. Ábrelo y espera unos segundos |
| `Cannot connect to the Docker daemon` | Mismo problema: Docker Desktop no está activo |
| `error during connect` | Reinicia Docker Desktop (clic derecho en ícono ballena → Restart) |
| `no configuration file provided: not found` | No estás en la carpeta correcta. Vuelve al PASO 1 |

---

### PASO 4: Levantar el contenedor

> [!NOTE]
> Este paso toma la imagen que construiste y la "enciende" como un contenedor en ejecución. Es como prender una computadora virtual que tiene tu app dentro.

Escribe en la terminal:
```powershell
docker compose up -d
```

El `-d` significa **"detached"** (en segundo plano), para que la terminal no se quede ocupada mostrando logs.

**Lo que deberías ver:**
```
[+] Running 2/2
 ✔ Network s7_default  Created
 ✔ Container s7-web-1  Started
```

✅ Si ves `Started` → **¡Tu contenedor está corriendo!**

---

### PASO 5: Verificar que el contenedor está activo

Escribe en la terminal:
```powershell
docker compose ps
```

**Lo que deberías ver:**
```
NAME        IMAGE     COMMAND                  SERVICE   CREATED          STATUS          PORTS
s7-web-1    s7-web    "gunicorn --bind 0.0…"   web       10 seconds ago   Up 9 seconds    0.0.0.0:5000->5000/tcp
```

Lo importante es que **STATUS** diga **"Up"**. Si dice "Exited" o "Restarting", hay un problema (ve la sección de errores al final).

---

### PASO 6: ¡Probar en el navegador! 🎉

Abre tu navegador (Chrome, Edge, etc.) y visita estas URLs:

1. **Landing page:** [http://localhost:5000](http://localhost:5000)
   - Deberías ver la página principal de Lumen

2. **Panel de administración:** [http://localhost:5000/admin](http://localhost:5000/admin)
   - Deberías ver el panel admin

> [!TIP]
> Si la página carga correctamente, **¡felicidades! Tu app Flask está corriendo dentro de un contenedor Docker!** 🐳🎉

---

### PASO 7: Verificar la persistencia de datos (puntos extra)

Este paso demuestra que los datos de la base de datos se mantienen incluso si apagas el contenedor.

1. **Registra un usuario** en la landing page (http://localhost:5000)
2. **Verifica** que aparece en el admin (http://localhost:5000/admin)
3. **Apaga el contenedor:**
   ```powershell
   docker compose down
   ```
4. **Vuelve a levantarlo:**
   ```powershell
   docker compose up -d
   ```
5. **Revisa el admin** otra vez → el usuario debería seguir ahí ✅

---

### PASO 8: Ver los logs (opcional, pero útil)

Si algo no funciona o quieres ver qué está pasando dentro del contenedor:

```powershell
docker compose logs web
```

Para ver los logs en tiempo real (se actualiza solo):
```powershell
docker compose logs -f web
```

Presiona **Ctrl + C** para salir de los logs en tiempo real.

---

### PASO 9: Hacer commit y push a GitHub

Una vez que todo funciona, guarda tus cambios:

```powershell
# 1. Ver qué archivos cambiaron
git status

# 2. Agregar TODOS los archivos nuevos y modificados
git add .

# 3. Hacer el commit con un mensaje descriptivo
git commit -m "feat: dockerizar aplicacion con Dockerfile y Docker Compose"

# 4. Subir la rama a GitHub
git push origin feature/docker
```

**Lo que `git status` debería mostrar antes del commit:**
```
Changes to be committed:
  new file:   .dockerignore
  new file:   Dockerfile
  new file:   docker-compose.yml
  modified:   .gitignore
  modified:   app.py
  modified:   requirements.txt
```

> [!IMPORTANT]
> Nota que `.env` **NO** aparece en la lista porque está en el `.gitignore`. Esto es correcto — los archivos `.env` con secretos **nunca** deben subirse a GitHub.

---

### PASO 10: Crear el Pull Request en GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/tu-usuario/tu-repo`
2. GitHub debería mostrarte un banner amarillo que dice: **"feature/docker had recent pushes — Compare & pull request"**
3. Haz clic en **"Compare & pull request"**
4. Llena los campos:
   - **Base:** `DevCuchoBackend` (la rama destino)
   - **Compare:** `feature/docker` (tu rama)
   - **Título:** `feat: Dockerizar aplicación con Docker Compose`
   - **Descripción:** Puedes poner algo como:
     ```
     ## Cambios realizados
     - Agregado Dockerfile con imagen Python 3.11-slim
     - Agregado docker-compose.yml para orquestación
     - Agregado .dockerignore
     - Modificado requirements.txt (añadido gunicorn)
     - Modificado app.py (bind 0.0.0.0 para Docker)
     
     ## Cómo probar
     docker compose build
     docker compose up -d
     # Abrir http://localhost:5000
     ```
5. Haz clic en **"Create pull request"**

---

## 🔴 Solución de Errores Comunes

### Error: "El contenedor se apaga inmediatamente" (STATUS: Exited)

Ver los logs para saber qué pasó:
```powershell
docker compose logs web
```

Si dice algo sobre `gunicorn not found`:
```powershell
docker compose build --no-cache
docker compose up -d
```

### Error: "Puerto 5000 ya en uso"

Significa que algo más está usando el puerto 5000 (quizás Flask corriendo localmente). Solución:

```powershell
# Opción 1: Detener todo lo que use el puerto
# Si tienes Flask corriendo en otra terminal, ciérralo con Ctrl+C

# Opción 2: Cambiar el puerto en docker-compose.yml a 5001
# Cambiar la línea: "5000:5000" por "5001:5000"
# Y luego acceder en http://localhost:5001
```

### Error: "Cannot connect to the Docker daemon"

1. Abre Docker Desktop
2. Espera a que el ícono de la ballena deje de parpadear (30-60 seg)
3. Vuelve a intentar el comando

---

## 📊 Resumen de comandos (cheat sheet)

| Qué quieres hacer | Comando |
|--------------------|---------|
| Construir la imagen | `docker compose build` |
| Levantar contenedor | `docker compose up -d` |
| Ver estado | `docker compose ps` |
| Ver logs | `docker compose logs web` |
| Apagar contenedor | `docker compose down` |
| Reconstruir desde cero | `docker compose build --no-cache` |
| Apagar y borrar TODO | `docker compose down -v` (borra datos también) |

---

## ✅ Checklist final — ¿Cumplí todos los requisitos?

- [ ] `Dockerfile` creado y funcional
- [ ] Imagen Docker se construye sin errores (`docker compose build`)
- [ ] Contenedor se ejecuta y la app responde en `localhost:5000`
- [ ] `docker-compose.yml` orquesta el servicio
- [ ] Volumen `db-data` persiste la BD SQLite
- [ ] Variables de entorno se cargan desde `.env`
- [ ] Commit y push a GitHub en la rama `feature/docker`
- [ ] Pull Request creado hacia `DevCuchoBackend`
