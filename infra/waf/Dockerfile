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

# 1) root 권한으로 디렉터리 생성 & 권한 설정
USER root
RUN mkdir -p /var/log/modsecurity \
 && chown -R nginx:nginx /var/log/modsecurity

# 2) 다시 비root 계정으로
USER nginx

# 3) 나머지 파일 복사
COPY --from=frontend-builder /app/apps/client/dist /usr/share/nginx/html
COPY ./infra/waf/nginx.conf    /etc/nginx/nginx.conf
COPY ./infra/waf/modsecurity.conf /etc/modsecurity/modsecurity.conf
COPY ./infra/waf/custom.conf    /etc/modsecurity/rules/custom.conf

EXPOSE 80
