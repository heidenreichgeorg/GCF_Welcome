FROM node:alpine
LABEL build-date="202611"
LABEL table_schema=HDSATA
LABEL server=React
LABEL org.opencontainers.image.source=https://github.com/heidenreichgeorg/GCF_WELCOME
LABEL org.opencontainers.image.description="Balance and Booking"
LABEL org.opencontainers.image.licenses=MIT
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json package.json
RUN npm install
COPY ./.next ./.next
EXPOSE 3000
CMD ["npm", "start"]