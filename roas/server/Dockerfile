# Build context is the REPO ROOT.
#   docker build -f roas/server/Dockerfile .
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
RUN pnpm install --frozen-lockfile --filter roas-printfast-server...

COPY . .
RUN pnpm --filter roas-printfast-server build

# Re-resolve production-only dependencies into a flat, copyable tree.
# `node-linker=hoisted` matters: pnpm's default isolated layout is a web of
# symlinks into the store, which does not survive `COPY --from`.
RUN pnpm --filter roas-printfast-server deploy --prod --legacy \
      --config.node-linker=hoisted /out

# ---- Production stage ----
FROM node:22-alpine AS runtime

LABEL com.exyconn.print-fast.app="roas-server"

WORKDIR /app

COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/package.json ./package.json
COPY --from=build /repo/roas/server/dist ./dist

# express.static serves /app/uploads — mounted as a named volume in production.
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=9003
EXPOSE 9003

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:9003/api/v1/health >/dev/null || exit 1

CMD ["node", "dist/index.js"]
