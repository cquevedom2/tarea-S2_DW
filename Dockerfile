# Imagen base ligera de Python
FROM python:3.11-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar e instalar dependencias primero (aprovecha caché de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto 5000
EXPOSE 5000

# Variable de entorno para Flask
ENV FLASK_APP=app.py

# Comando para ejecutar la app con gunicorn (producción)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
