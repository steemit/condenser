FROM node
RUN apt update
RUN apt upgrade -y -qq
RUN apt install -y -qq python3 python3-pip
RUN npm install -g sequelize-cli pm2 babel-cli
RUN npm install
RUN git clone https://github.com/steemit/steemit.com
WORKDIR /steemit.com
RUN git submodule update --init --recursive
WORKDIR /steemit.com/config
RUN cp steem-example.json steem-dev.json
ADD steemitcom /usr/bin/
ADD wait-for-it.sh /usr/bin/wait-for-it
RUN chmod +x /usr/bin/wait-for-it
RUN chmod +x /usr/bin/steemitcom
EXPOSE 3002
CMD ["/usr/bin/npm","start"]
