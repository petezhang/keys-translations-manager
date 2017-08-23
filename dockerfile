FROM daocloud.io/library/node:6-onbuild

# Create app directory
RUN mkdir -p /usr/
WORKDIR /home/Service

# Bundle app source
COPY . /Users/zp/Documents/work/KTM/keys-translations-manager
#RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
