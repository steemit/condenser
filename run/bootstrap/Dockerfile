FROM goloschain/nodejs:6.4

ENV PROJECT_DIR /webclient


# copy project dir into container and make it current
COPY    . ${PROJECT_DIR}
WORKDIR ${PROJECT_DIR}

# prepare webclient 
RUN \
    mkdir ./tmp && \
    npm install -g sequelize-cli pm2 mysql

RUN npm install
