FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf

# RUN mkdir /var/www
# RUN mkdir /var/www/web1
# RUN mkdir /var/www/web2

# RUN chgrp -R www-data /var/www/web1
# RUN chmod -R 750 /var/www/web1
# RUN chmod g+s /var/www/web1

# RUN chgrp -R www-data /var/www/web2
# RUN chmod -R 750 /var/www/web2
# RUN chmod g+s /var/www/web2

# EXPOSE 1338
EXPOSE 80
EXPOSE 443
EXPOSE 1447