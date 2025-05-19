FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json yarn.lock ./

# Instalar dependências usando yarn
RUN yarn install --legacy-peer-deps

# Copiar o restante dos arquivos
COPY . .

EXPOSE 3000

# Usar yarn para executar o servidor de desenvolvimento
CMD ["yarn", "serve"]