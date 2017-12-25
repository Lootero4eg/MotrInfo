<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
    <title>MOTR Search</title>
<?php
/*    <link rel="icon" type="image/png" href="/images/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css" />*/
?>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="css/motr-theme.min.css" />
    <link rel="stylesheet" href="css/jquery.mobile.icons.min.css" />
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.5/jquery.mobile.structure-1.4.5.min.css" />

    <script src="http://code.jquery.com/jquery-1.11.1.js"></script>

    <script src="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
    <script src="scripts/fortabs.js"></script>
</head>
<body>
<?php
  require('config.php');
?>
<script type="text/javascript">
$.when(
  $.post( "http://theassasin.lan/inquire/", { user: "max.troy@facilitygrid.com", pass: "123", xrqst: "login",submit: "Log In", xrdr: "http://theassasin.lan/inquire/" } ))
.done(function(){
  //alert('1');
window.location.replace("http://theassasin.lan/inquire/?action=gchd&prj=1406");
});
</script>
<div data-role="page">
  <div data-role="panel" id="menu" data-display="overlay">
      <h1 class="menu">
        <font class="shadowed">MOTRInfo</font>
        <img src="css/images/poring_panel_logo.png"><br>
        <div class="menu_separator"></div><br>
      </h1>
      <div style="line-height:2">
      <a href="home.php">Home</a><br>
      <a href="search.php">Search</a><br>
      <a href="vending.php">Vending</a><br>
      <a href="http://exitapp">Exit</a>
    </div>
  </div><!-- /panel -->
<?php
if(!isset($customheader)){
 ?>
  <div data-role="header" class="header" data-position="fixed">
    <h1><?php echo is_null($pagecaption) ? "" : $pagecaption; ?></h1>
  </div>

  <div id="content" data-role="content">
<?php } ?>
