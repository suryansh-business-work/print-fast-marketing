# Build context is the REPO ROOT.
#   docker build -f roas/client/Dockerfile .
FROM node:22-alpine AS build

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/common/package.json packages/common/
COPY main-website/package.json main-website/
COPY shop-website/package.json shop-website/
COPY roas/client/package.json roas/client/
COPY roas/server/package.json roas/server/
RUN pnpm install --frozen-lockfile --filter roas-printfast-client...

COPY . .

# Vite embeds VITE_ vars at build time.
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}

RUN pnpm --filter roas-printfast-client build

# ---- Serve stage ----
FROM node:22-alpine AS runtime

LABEL com.exyconn.print-fast.app="roas-client"

RUN npm install -g serve@latest

WORKDIR /app
COPY --from=build /repo/roas/client/dist .

EXPOSE 9002

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:9002/ >/dev/null || exit 1

# -s rewrites unknown paths to index.html for the React router.
CMD ["serve", "-s", ".", "-l", "9002"]
