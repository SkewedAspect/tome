#-----------------------------------------------------------------------------------------------------------------------
# Tome Dockerfile
#-----------------------------------------------------------------------------------------------------------------------

FROM node:lts-alpine
EXPOSE 4321

MAINTAINER Christopher S. Case <chris.case@g33xnexus.com>

#-----------------------------------------------------------------------------------------------------------------------

RUN mkdir -p /app/db
WORKDIR /app

#-----------------------------------------------------------------------------------------------------------------------
# Build Tome Docker
#-----------------------------------------------------------------------------------------------------------------------

# Build deps (for customization support)
COPY .babelrc /app/.babelrc
COPY .browserslistrc /app/.browserslistrc
COPY .editorconfig /app/.editorconfig
COPY .npmrc /app/.npmrc
COPY package.json /app/package.json
COPY assets /app/assets
COPY client /app/client
COPY server /app/server
COPY config.js /app/config.js
COPY config.site.js /app/config.site.js
COPY knexfile.js /app/knexfile.js
COPY server.js /app/server.js

# Install deps and build dist
RUN yarn && yarn build

CMD [ "node", "server.js", "# tome server" ]

#-----------------------------------------------------------------------------------------------------------------------
