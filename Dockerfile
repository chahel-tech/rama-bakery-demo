FROM php:8.3-apache

WORKDIR /var/www/html
COPY . /var/www/html/

RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf \
    && mkdir -p /var/www/html/data /var/www/html/assets/uploads \
    && chown -R www-data:www-data /var/www/html/data /var/www/html/assets/uploads \
    && chmod -R 775 /var/www/html/data /var/www/html/assets/uploads

CMD ["apache2-foreground"]
