# STEP 1: Development Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Kopiramo package fajlove
COPY package*.json ./

# Instaliramo SVE zavisnosti (i devDependencies jer nam trebaju za Nest CLI)
RUN npm install

# Kopiramo ostatak koda
COPY . .

# Build-ujemo (ovo nam treba za produkciju, ali za dev mode ćemo pregaziti komandom)
RUN npm run build

# STEP 2: Production Stage (Ovo se koristi tek kad ideš live)
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

CMD [ "node", "dist/main" ]