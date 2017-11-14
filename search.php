<?php
ini_set('display_errors', 'On');

include('header.php');
?>
  <div data-role="header" class="top_header headerBG" data-position="fixed">
    <h1>Database search</h1>
  </div>

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
