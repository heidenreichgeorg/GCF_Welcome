FROM node:alpine
LABEL build-date="202304"
LABEL table_schema=HDSATA
LABEL server=React
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json package.json
RUN npm install
COPY ./.next ./.next
EXPOSE 3000
CMD ["npm", "start"]