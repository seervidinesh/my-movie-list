FROM public.ecr.aws/docker/library/alpine:3.22.0

RUN apk update && \
    apk upgrade --no-cache --purge && \
    apk add --no-cache npm nodejs && \
    rm -vrf /var/cache/apk/* && \
    npm i -g @nestjs/cli && \
    npm i -g pm2@latest 

WORKDIR /app

COPY ["package.json", "./"]


COPY ./src ./src
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY nest-cli.json .

RUN npm run build

EXPOSE 3000

COPY entrypoint.sh .
RUN chmod +x /app/entrypoint.sh
