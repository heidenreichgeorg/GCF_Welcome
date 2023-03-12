FROM node:alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json package.json
RUN mkdir sec
ADD bookingpages.json  /usr/src/app/sec/bookingpages.json
RUN npm install
COPY ./.next ./.next
EXPOSE 3000
CMD ["npm", "start"]