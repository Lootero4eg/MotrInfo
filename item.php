<?php
ini_set('display_errors', 'On');

include('header.php');

include('./httpful.phar');

if(!isset($_GET["type"]) && !isset($_GET["item_id"]))
{
    echo "<h1>Item id not found</h1>";

    include('footer.php');
    return;
}

$uri = $REST_url ."index.php/getItemInfoById/".$_GET["type"]."/".$_GET["item_id"];
$response = \Httpful\Request::get($uri)
 ->expectsJson()
    ->send();
?>

<div data-role="header" class="top_header headerBG" data-position="fixed">
    <a href="" data-icon="back" onclick="window.history.go(-1);">Back</a>
    <h1><?php echo $response->body->item_name ?></h1>
</div>

<div data-role="tabs"  id="tabs" data-position="fixed">
<div data-role="navbar">
  <ul>
    <li><a href="#main">Main</a></li>
    <li><a href="#drop">Drops from</a></li>
  </ul>
</div>

<div id="main" class="ui-body-d ui-content">
<table id='item_info_tab'>
<tr><td colspan=2><img src="<?php echo $response->body->item_img ?>"></td></tr>
<tr></tr>
<tr></tr>
<?php
if($response->body->item_type == "wearables")
{
  ?>
  <tr><td>Class</td><td><?php echo $response->body->wearable_info->Class ?></td></tr>
  <tr><td>Slot</td><td><?php echo $response->body->wearable_info->Slot ?></td></tr>
  <?php

  if($response->body->wearable_info->Class == "Weapon")
  {?>
    <tr><td>ATK/MATK</td><td><?php echo $response->body->wearable_info->ATK_MATK ?></td></tr>
    <tr><td>Weapon level</td><td><?php echo $response->body->wearable_info->Weapon_Lvl ?></td></tr>
    <tr><td>Range</td><td><?php echo $response->body->wearable_info->Range ?></td></tr>
  <?php
  }
  else {?>
    <tr><td>DEF</td><td><?php echo $response->body->wearable_info->DEF ?></td></tr>
  <?php
  }?>
  <tr><td>Sex</td><td><?php echo $response->body->wearable_info->Sex ?></td></tr>
  <tr><td>Base level</td><td><?php echo $response->body->wearable_info->Base_Lvl ?></td></tr>
  <tr><td>Job</td><td><?php echo $response->body->wearable_info->Job ?></td></tr>
  <?php
}?>
<tr><td>Weight</td><td><?php echo $response->body->weight ?></td></tr>
<tr><td>Buy</td><td><?php echo $response->body->buy ?></td></tr>
<tr><td>Sell</td><td><?php echo $response->body->sell ?></td></tr>
<tr><td>Compound</td><td><?php echo $response->body->compound ?></td></tr>
<tr><td colspan=2><?php echo $response->body->description ?></td></tr>
</table>
</div>

<div id="drop" class="ui-body-d ui-content">
<table id='item_drop_tab'>
<?php

foreach($response->body->drop as $item)
{?>
    <tr>
      <td><?php echo $item->monster_name ?></td>
    <td><?php echo $item->chance ?>%</td></tr>
<?php
}
?>
</table>
</div>
</div>

<?php include('footer.php');?>
