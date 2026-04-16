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
# The nginx:alpine entrypoint runs envsubst on /etc/nginx/templates/*.template
# at container start, writing to /etc/nginx/conf.d/. The FILTER restricts
# substitution to PROXY_API_KEY only, so nginx's own $variable syntax is
# preserved verbatim.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV NGINX_ENVSUBST_FILTER=^PROXY_API_KEY$
