# 1) 프론트엔드 빌드 스테이지
FROM node:23 AS frontend-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/dto ./libs/dto
COPY apps/client ./apps/client

RUN pnpm install --frozen-lockfile
RUN pnpm run --filter client build

# 2) nginx + modsecurity 스테이지
FROM owasp/modsecurity-crs:nginx-alpine

USER root

# 프론트엔드 빌드 결과물 복사
COPY --from=frontend-builder /app/apps/client/dist /usr/share/nginx/html

# 기본 default.conf를 우리 설정으로 교체
COPY infra/waf/pingpong.conf /etc/nginx/conf.d/pingpong.conf

EXPOSE 8081
