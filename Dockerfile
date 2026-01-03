# ---------- Build Stage ----------
FROM node:18 AS build

WORKDIR /app

# API URL build time pe inject hoga
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- Run Stage ----------
FROM nginx:alpine

# React Router ke liye nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build output
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
