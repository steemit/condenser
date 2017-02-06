FROM goloschain/nodejs:6.4

ENV PROJECT_DIR /webclient


# copy project dir into container and make it current
RUN mkdir ${PROJECT_DIR}
COPY    ./package.json ./npm-shrinkwrap.json ./${PROJECT_DIR}/
WORKDIR ${PROJECT_DIR}

# prepare deps 
RUN \
    mkdir ./tmp && \
    npm install -g sequelize-cli pm2 mysql

RUN npm install
