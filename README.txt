Rama's Bakery Website + Easy Admin Panel
========================================

Admin URL
---------
yourdomain.com/#admin

Default login
-------------
Username: admin
Password: Rama@123

IMPORTANT: Change the password before giving it to the client.
The login page does not display the default password publicly.

New easy image system
---------------------
The client no longer needs to copy/paste image paths.
In Admin > Images:
- Logo, Hero, Menu and Contact images have Upload / Replace buttons.
- Cake Gallery has Add Images, Change, Delete and Up/Down buttons.
- Fresh Bake images have Add Images, Change, Delete and Up/Down buttons.
- Supported upload formats: JPG, JPEG and PNG.
- After choosing images, click Save Changes at the bottom. Upload only selects/sends the image; Save Changes publishes it on the website.

Why "Failed to fetch" happens
-----------------------------
Admin login uses PHP files inside the /api folder. It will NOT work by double-clicking index.html from Downloads because the browser opens it as file:// and PHP does not run.

Correct GoDaddy upload
----------------------
1. Open GoDaddy File Manager.
2. Go to public_html.
3. Upload this ZIP.
4. Extract it inside public_html.
5. Make sure index.html, api, assets, css, js and data are directly inside public_html.
6. Open yourdomain.com/#admin.

Test after upload
-----------------
Open this in browser:
yourdomain.com/setup-check.php

Good result should show:
- php_working: true
- data_folder_writable: true
- uploads_folder_writable: true
- content_file_exists: true
- api_folder_exists: true

If data_folder_writable or uploads_folder_writable is false:
Set folder permission to 755 or 775 from cPanel File Manager.

How to test locally on laptop
-----------------------------
Do not open index.html directly. Use PHP server:

cd rama-bakery-admin-easy-images
php -S localhost:8000

Then open:
http://localhost:8000/#admin

How to change admin password
----------------------------
1. Generate a new PHP password hash:
php -r 'echo password_hash("YOUR_NEW_PASSWORD", PASSWORD_DEFAULT), PHP_EOL;'

2. Open api/config.php.
3. Replace ADMIN_PASSWORD_HASH value with the new hash.
4. Save and upload.

Included features
-----------------
- Responsive React single-page website
- Good header and footer
- Cake gallery, menu, fresh bakes, contact section and map
- Admin login
- Admin content editing
- Easy image manager for client
- PHP backend saves changes to data/site-content.json


Simple client image upload steps
-------------------------------
1. Open yourdomain.com/#admin and login.
2. Scroll to Images.
3. To add new photos: click Add Images, choose JPG/JPEG/PNG, then click Save Changes.
4. To replace an old photo: click Change under that photo, choose the new image, then click Save Changes.
5. To remove a photo: click Delete, then click Save Changes.
6. If upload fails on GoDaddy, open yourdomain.com/setup-check.php. data_folder_writable and uploads_folder_writable must be true.
