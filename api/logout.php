<?php
require __DIR__ . '/config.php';

destroy_admin_session();
send_json(['ok' => true]);
