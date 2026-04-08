# Stage 1: Build JSX files
FROM node:alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install --global esbuild && npm install

COPY internal/ ./internal/

RUN find internal -name '*.jsx' -print0 |     xargs -0 -r -I{} sh -c '       outfile="$(echo "{}" | sed "s/\.jsx$/.js/")";       esbuild "{}" --bundle --outfile="$outfile" --format=esm --jsx=automatic --loader:.jsx=jsx     ' &&     find internal -name '*.jsx' -delete;     exit 0

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/internal/ /usr/share/nginx/internal/
COPY external/ /usr/share/nginx/external/
COPY nginx.conf /etc/nginx/conf.d/default.conf
