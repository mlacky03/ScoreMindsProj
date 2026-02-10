# ---------------------------------------------
# DOCKERFILE ZA FRONTEND (DEVELOPMENT)
# ---------------------------------------------

# 1. Koristimo istu Node verziju kao i za backend
FROM node:20-alpine

# 2. Radni direktorijum
WORKDIR /app

# 3. Kopiramo prvo package fajlove (zbog keširanja, da ubrzamo build)
COPY package*.json ./

# 4. Instaliramo zavisnosti
RUN npm install

# 5. Kopiramo ostatak koda
COPY . .

# 6. Otvaramo port 4200 (Angular default)
EXPOSE 4200

# 7. Komanda za pokretanje
# --host 0.0.0.0 je OBAVEZNO da bi mogao da pristupiš iz browsera
# --poll 2000 pomaže da Docker na Windowsu prepozna izmene fajlova
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]