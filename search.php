<?php
ini_set('display_errors', 'On');

$pagecaption = "Database search";

include('header.php');
?>
  <form id="f1" method="GET" action="monsters.php">
    <p style="text-aling:center">
      <label for="search">Monster search:</label>
      <input name="monster_name" id="search_monster" value="" placeholder="Input monster name" type="search">

      <input value="Find monsters" type="submit">
    </p>
  </form>

  <form id="f2" method="GET" action="items.php">
    <p style="text-aling:center">
      <label for="search">Items search:</label>
      <input name="item_name" id="search_item" value="" placeholder="Input item name" type="search">

      <input value="Find items" type="submit">
    </p>
  </form>
  <?php
include('footer.php');
?>
