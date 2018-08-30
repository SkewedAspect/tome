FROM node:carbon-alpine
EXPOSE 4321

MAINTAINER Christopher S. Case <chris.case@g33xnexus.com>

RUN mkdir -p /app
WORKDIR /app

ADD . /app/

RUN yarn \
	&& yarn build

CMD [ "node", "server.js" ]
