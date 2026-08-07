# Build context is the REPO ROOT — the app compiles against packages/common.
#   docker build -f shop-website/Dockerfile .
FROM node:22-alpine AS build

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /repo

# Manifests first: the dependency layer then caches independently of source.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/common/package.json packages/common/
COPY main-website/package.json main-website/
COPY shop-website/package.json shop-website/
COPY roas/client/package.json roas/client/
COPY roas/server/package.json roas/server/
RUN pnpm install --frozen-lockfile --filter @print-fast/shop-website...

COPY . .

# Cross-site origins are baked in at build time (they end up inside hrefs).
ARG PUBLIC_MAIN_SITE_URL
ARG PUBLIC_SHOP_SITE_URL
ARG PUBLIC_ROAS_APP_URL
ARG PUBLIC_ROAS_API_URL
ENV PUBLIC_MAIN_SITE_URL=${PUBLIC_MAIN_SITE_URL}
ENV PUBLIC_SHOP_SITE_URL=${PUBLIC_SHOP_SITE_URL}
ENV PUBLIC_ROAS_APP_URL=${PUBLIC_ROAS_APP_URL}
ENV PUBLIC_ROAS_API_URL=${PUBLIC_ROAS_API_URL}

RUN pnpm --filter @print-fast/shop-website build

FROM nginx:1.27-alpine AS runtime

LABEL com.exyconn.print-fast.app="shop-website"

COPY deploy/nginx/astro-container.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/shop-website/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
