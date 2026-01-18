###################################################
## DOCKERFILE FOR WIF3005 ALTERNATIVE ASSESSMENT ##
###################################################
# NAME: MUHAMMAD ADDIN BIN AHMAD SUHAIMI
# MATRIC NO. : U2101491
# LINK TO GITHUB REPO: https://github.com/AddinSuhaimi/aqualeaf-web-docker

# syntax=docker/dockerfile:1

# 1) Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2) Build Next.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

COPY certs/ca.pem /app/certs/ca.pem
ENV NODE_EXTRA_CA_CERTS=/app/certs/ca.pem

# only prod deps
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3000
CMD ["npm", "start"]
