FROM goloschain/webclient-tolstoy-bootstrap-content:0.1.161221



COPY ./config/client/*.* ./config/
COPY ./config/pm2/*.* ./config/
COPY ./config/sequelize/*.* ./db/config/
COPY ./start.sh ./
# COPY ./wait-for-it.sh ./



#RUN npm run build

EXPOSE 3002

# CMD ["/bin/bash", "--login"]

CMD ["/bin/bash", "--login", "-c", "./start.sh"]
