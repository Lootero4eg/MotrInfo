<?php
ini_set('display_errors', 'On');

include('header.php');

include('./httpful.phar');

if(!isset($_GET["monster_id"]))
{
    echo "<h1>Monster id not found</h1>";

    include('footer.php');
    return;
}

//$uri = "http://motrinfo.000webhostapp.com/RestServer/index.php/getMonsterInfoById/".$_GET["monster_id"];
$uri = "http://localhost/motrinfo/RestServer/index.php/getMonsterInfoById/".$_GET["monster_id"];
$response = \Httpful\Request::get($uri)
 ->expectsJson()
    ->send();
?>
<div data-role="header" class="top_header headerBG" data-position="fixed">
    <a href="" data-icon="back" onclick="window.history.go(-1);">Back</a>
    <h1><?php echo $response->body->monster_name ?></h1>
</div>

<div data-role="tabs"  id="tabs" data-position="fixed">
<div data-role="navbar">
  <ul>
    <li><a href="#main">Main</a></li>
    <li><a href="#vulnerables">Elements</a></li>
    <li><a href="#drop">Drop</a></li>
    <li><a href="#locations">Location</a></li>
    <li><a href="#skills">Skills</a></li>
  </ul>
</div>

<div id="main" class="ui-body-d ui-content">

<table id='mosnter_info_tab'>
<tr><td colspan=2><img src="<?php echo $response->body->monster_img ?>"></td></tr>
<tr><td colspan=2><?php echo $response->body->monster_type ?></td></tr>
<tr></tr>
<tr></tr>
<tr><td>Level</td><td><?php echo $response->body->maindata->Level ?></td></tr>
<tr><td>Scale</td><td><?php echo $response->body->maindata->Scale ?></td></tr>
<tr><td>Race</td><td><?php echo $response->body->maindata->Race ?></td></tr>
<tr><td>Element</td><td><?php echo $response->body->maindata->Element ?></td></tr>
<tr><td>HP</td><td><?php echo $response->body->maindata->HP ?></td></tr>
<tr><td>ATK</td><td><?php echo $response->body->maindata->ATK ?></td></tr>
<tr><td>DEF</td><td><?php echo $response->body->maindata->DEF ?></td></tr>
<tr><td>MDEF</td><td><?php echo $response->body->maindata->MDEF ?></td></tr>
<tr><td>EXP</td><td><?php echo $response->body->maindata->EXP ?></td></tr>
<tr><td>Job EXP</td><td><?php echo $response->body->maindata->{'Job EXP'} ?></td></tr>
<tr><td>Range</td><td><?php echo $response->body->maindata->Range ?></td></tr>
<tr></tr>
<tr></tr>
<tr><td colspan=2><b>Stats:</b></td></tr>
<tr><td>STR</td><td><?php echo $response->body->maindata->STR ?></td></tr>
<tr><td>AGI</td><td><?php echo $response->body->maindata->AGI ?></td></tr>
<tr><td>VIT</td><td><?php echo $response->body->maindata->VIT ?></td></tr>
<tr><td>INT</td><td><?php echo $response->body->maindata->INT ?></td></tr>
<tr><td>DEX</td><td><?php echo $response->body->maindata->DEX ?></td></tr>
<tr><td>LUK</td><td><?php echo $response->body->maindata->LUK ?></td></tr>
<tr><td>Speed</td><td><?php echo $response->body->maindata->Speed ?></td></tr>
</table>
</div>

<div id="vulnerables" class="ui-body-d ui-content">
<table id='mosnter_vulnerables_tab'>
<tr><td>Neutral</td><td><?php echo $response->body->maindata->Vulnerables->Neutral ?></td></tr>
<tr><td><font color='blue'>Water</font></td><td><?php echo $response->body->maindata->Vulnerables->Water ?></td></tr>
<tr><td><font color='#330000'>Earth</font></td><td><?php echo $response->body->maindata->Vulnerables->Earth ?></td></tr>
<tr><td><font color='Red'>Fire</font></td><td><?php echo $response->body->maindata->Vulnerables->Fire ?></td></tr>
<tr><td><font color='#999900'>Wind</font></td><td><?php echo $response->body->maindata->Vulnerables->Wind ?></td></tr>
<tr><td><font color='Lime'>Poison</font></td><td><?php echo $response->body->maindata->Vulnerables->Poison ?></td></tr>
<tr><td>Holy</td><td><?php echo $response->body->maindata->Vulnerables->Holy ?></td></tr>
<tr><td><font color='#404040'>Shadow</font></td><td><?php echo $response->body->maindata->Vulnerables->Shadow ?></td></tr>
<tr><td><font color='Gray'>Ghost</font></td><td><?php echo $response->body->maindata->Vulnerables->Ghost ?></td></tr>
<tr><td><font color='#333300'>Undead</font></td><td><?php echo $response->body->maindata->Vulnerables->Undead ?></td></tr>
</table>
</div>

<div id="drop" class="ui-body-d ui-content">
<table id='mosnter_drop_tab'>
<?php

foreach($response->body->drop as $item)
{?>
    <tr><td><img src="<?php echo $item->Image ?>"></td>
      <td><?php echo $item->Name ?></td>
    <td><?php echo $item->Chance ?>%</td></tr>
<?php
}
?>
</table>
</div>

<div id="locations" class="ui-body-d ui-content">
<table id='mosnter_locations_tab'>
<tr><th>Map name</th><th>Count</th><th>Respawn time</th></tr>
<?php
foreach($response->body->locations as $item)
{?>
    <tr><td><?php echo $item->Name ?></td>
      <td align='center'><?php echo $item->Count ?></td>
    <td><?php $item->Respawn ?></td></tr>
<?php
}?>
</table>
</div>

<div id="skills" class="ui-body-d ui-content">
<table id='mosnter_locations_tab'>
<tr><th></th><th>Skill</th><th>Skill level time</th></tr>
<?php
foreach($response->body->skills as $item)
{?>
    <tr><td><?php echo $item->Image ?></td>
      <td><?php echo $item->Skill ?></td>
    <td align="center"><?php echo $item->Level ?></td></tr>
<?php
}?>
</table>
</div>
</div>
<?php include('footer.php');?>
