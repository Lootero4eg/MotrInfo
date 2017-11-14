<?php

ini_set('display_errors', 'On');

include('vendor/autoload.php');

require __DIR__ . '/source/Jacwright/RestServer/RestServer.php';
require 'Controllers/MonstersController.php';
require 'Controllers/ItemsController.php';

#var_dump($_POST);

$server = new \Jacwright\RestServer\RestServer('debug');
$server->addClass('MonstersController');
$server->addClass('ItemsController');
$server->handle();

?>