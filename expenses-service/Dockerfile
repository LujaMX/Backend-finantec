# Utilizamos la imagen oficial de Node.js como imagen base
FROM node:16

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos el archivo package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copiamos todo el código de la aplicación al contenedor
COPY . .

# Exponemos el puerto para el contenedor
EXPOSE 5003

# Usamos PM2 para iniciar la aplicación
CMD ["npm", "start"]
