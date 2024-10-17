FROM postgres:9.4

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

RUN echo "deb http://archive.debian.org/debian stretch main\ndeb http://archive.debian.org/debian-security stretch/updates main" > /etc/apt/sources.list
RUN rm /etc/apt/sources.list.d/pgdg.list

RUN apt-get update && apt-get -y install apt-transport-https

RUN echo "deb https://apt-archive.postgresql.org/pub/repos/apt/ stretch-pgdg main" > /etc/apt/sources.list.d/pgdg.list

RUN apt-get update && apt-get -y install zip && rm -rf /var/lib/apt/lists/*p

ENTRYPOINT ["/entrypoint.sh"]
CMD ["help"]
