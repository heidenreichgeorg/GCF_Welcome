#package.json
  "scripts": {
    "dev":     "next dev . root=C:/workspace/GCF_Welcome/sec/ config=bookingpages",
    "start": "next start . root=./sec config=bookingpages",

#docker-compose-yml
    ports:
      - 3000:3000
    volumes:
      - ./sec:/usr/src/app/sec:ro

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

# /usr/src/app  ln -s /home/georg/booking/sec sec

# volumes: 
#    ./sec:/usr/src/app/sec

##docker run --rm -it --network host --name fin1 bookingkg/finreport











