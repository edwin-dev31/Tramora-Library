# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY . .
# Vite embeds these public frontend values during compilation.
RUN --mount=type=secret,id=vite_env,target=/app/.env,required=true \
    npm run build

FROM nginx:stable-alpine-slim AS runtime
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
