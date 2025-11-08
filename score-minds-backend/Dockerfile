# STEP 1: Faza izrade
FROM node:20-alpine AS build

WORKDIR /app

# Kopira package.json i package-lock.json da bi instalirao zavisnosti
COPY package*.json ./

# Instalira Node zavisnosti
RUN npm install


# Kopira ostatak izvornog koda
COPY . .

# Gradi NestJS aplikaciju
RUN npm run build


# STEP 2: Faza rada (Manja i sigurnija slika)
FROM node:20-alpine

WORKDIR /app

# Kopira produkcione zavisnosti i izgrađenu aplikaciju iz faze izrade
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

# Izvršava se pri pokretanju kontejnera
CMD [ "node", "dist/main" ]
# U zavisnosti od tvog scripta u package.json, možda koristiš 'start:dev' za razvoj
# Ako koristiš TypeORM migracije pri pokretanju aplikacije, koristi 'start:prod' ili 'start:dev'