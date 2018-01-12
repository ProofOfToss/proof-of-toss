#
# RSK Node Dockerfile
#

# Pull base image.
FROM java:8-jdk

RUN apt-get update
RUN apt-get install -y --no-install-recommends wget supervisor python-software-properties software-properties-common && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install RSK.
RUN groupadd --gid 888 rsk && useradd rsk -d /var/lib/rsk -s /sbin/nologin --uid=888 --gid=888

WORKDIR /usr/share/rsk
RUN wget https://github.com/rsksmart/rskj/releases/download/BAMBOO-0.4.0/rskj-core-0.4.0-BAMBOO-all.jar

# Supervisod CONF
COPY ./docker/rsk/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 4444
EXPOSE 50505

# Define default command.
CMD ["/usr/bin/supervisord"]