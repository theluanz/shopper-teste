# Usar a imagem base do Node.js
FROM node:18

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos de package e lock para instalar dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos da aplicação
COPY . .

# Copiar o arquivo .env
COPY .env ./

# Compilar o TypeScript para JavaScript
RUN npm run build

# Definir a porta que a aplicação vai escutar
EXPOSE 80

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]
