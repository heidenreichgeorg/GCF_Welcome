#package.json
  "scripts": {
    "dev":     "next dev . root=C:/workspace/GCF_Welcome/entity/ config=bookingpages",
    "start": "next start . root=./entity config=bookingpages",

#docker-compose-yml
    ports:
      - 3000:3000
    volumes:
      - ./entity:/usr/src/app/entity:rw

npm run dev

npm run build

docker-compose build

docker tag finreport build(DATE)

docker-compose up

docker tag finreport bookingkg/finreport

docker push bookingkg/finreport

---------------------------------------------------------

docker info

docker network ls

docker network inspect host

docker ps

docker pull bookingkg/finreport

docker image ls

docker image rm xxxxxxx

docker tag bookingkg/finreport finreport

cd booking

docker-compose up

# /usr/src/app  ln -s /home/georg/booking/entity entity

# volumes: 
#    ./entity:/usr/src/app/entity

##docker run --rm -it --network host --name fin1 bookingkg/finreport











