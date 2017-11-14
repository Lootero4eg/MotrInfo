<?php
ini_set('display_errors', 'On');

include('header.php');

include('./httpful.phar');

//echo "<h1>Главная страница</h1>\n\n";

$uri = "http://motrinfo.000webhostapp.com/RestServer/index.php/getMonsterInfoById/1115";
#$uri = "http://localhost/RestServer/index.php/getMonsterInfoById/1115";
$response = \Httpful\Request::get($uri)
 ->expectsJson()
    ->send();

echo '
<div data-role="header" class="top_header headerBG" data-position="fixed"> 
    <h1>'.$response->body->monster_name.'</h1> 
    </div>
';

echo '
<div data-role="tabs"  id="tabs" data-position="fixed">
<div data-role="navbar">
  <ul>
    <li><a href="#main">Main</a></li>
    <li><a href="#vulnerables">Elements</a></li>
    <li><a href="#drop">Drop</a></li>
    <li><a href="#location">Location</a></li>
    <li><a href="#skills">Skills</a></li>
  </ul>
</div><!-- /navbar -->';

echo '  <div id="main" class="ui-body-d ui-content">';

echo "\n<table id='mosnter_info_tab'>\n";
#echo "\n<table id='mosnter_info_tab'>\n<tr><td>Monster name:</td><td><b>";
#echo $response->body->monster_name."</b></td></tr>\n";
echo "<tr><td colspan=2><img src=\"".$response->body->monster_img."\"></td></tr>\n";
echo "<tr><td colspan=2>".$response->body->monster_type."</td></tr>\n";
echo "<tr></tr>";
echo "<tr></tr>";
echo "<tr><td>Level</td><td>".$response->body->maindata->Level."</td></tr>\n";
echo "<tr><td>Scale</td><td>".$response->body->maindata->Scale."</td></tr>\n";
echo "<tr><td>Race</td><td>".$response->body->maindata->Race."</td></tr>\n";
echo "<tr><td>Element</td><td>".$response->body->maindata->Element."</td></tr>\n";
echo "<tr><td>HP</td><td>".$response->body->maindata->HP."</td></tr>\n";
echo "<tr><td>ATK</td><td>".$response->body->maindata->ATK."</td></tr>\n";
echo "<tr><td>DEF</td><td>".$response->body->maindata->DEF."</td></tr>\n";
echo "<tr><td>MDEF</td><td>".$response->body->maindata->MDEF."</td></tr>\n";
echo "<tr><td>EXP</td><td>".$response->body->maindata->EXP."</td></tr>\n";
echo "<tr><td>Job EXP</td><td>".$response->body->maindata->{'Job EXP'}."</td></tr>\n";
echo "<tr><td>Range</td><td>".$response->body->maindata->Range."</td></tr>\n";
echo "<tr></tr>";
echo "<tr></tr>";
echo "<tr><td colspan=2><b>Stats:</b></td></tr>\n";
echo "<tr><td>STR</td><td>".$response->body->maindata->STR."</td></tr>\n";
echo "<tr><td>AGI</td><td>".$response->body->maindata->AGI."</td></tr>\n";
echo "<tr><td>VIT</td><td>".$response->body->maindata->VIT."</td></tr>\n";
echo "<tr><td>INT</td><td>".$response->body->maindata->INT."</td></tr>\n";
echo "<tr><td>DEX</td><td>".$response->body->maindata->DEX."</td></tr>\n";
echo "<tr><td>LUK</td><td>".$response->body->maindata->LUK."</td></tr>\n";
echo "<tr><td>Speed</td><td>".$response->body->maindata->Speed."</td></tr>\n";
/*echo "<tr></tr>";
echo "<tr></tr>";
echo "<tr><td colspan=2><b>Vulnerables:</b></td></tr>\n";
echo "<tr><td>Neutral</td><td>".$response->body->maindata->Vulnerables->Neutral."</td></tr>\n";
echo "<tr><td><font color='blue'>Water</font></td><td>".$response->body->maindata->Vulnerables->Water."</td></tr>\n";
echo "<tr><td><font color='#330000'>Earth</font></td><td>".$response->body->maindata->Vulnerables->Earth."</td></tr>\n";
echo "<tr><td><font color='Red'>Fire</font></td><td>".$response->body->maindata->Vulnerables->Fire."</td></tr>\n";
echo "<tr><td><font color='#999900'>Wind</font></td><td>".$response->body->maindata->Vulnerables->Wind."</td></tr>\n";
echo "<tr><td><font color='Lime'>Poison</font></td><td>".$response->body->maindata->Vulnerables->Poison."</td></tr>\n";
echo "<tr><td>Holy</td><td>".$response->body->maindata->Vulnerables->Holy."</td></tr>\n";
echo "<tr><td><font color='#404040'>Shadow</font></td><td>".$response->body->maindata->Vulnerables->Shadow."</td></tr>\n";
echo "<tr><td><font color='Gray'>Ghost</font></td><td>".$response->body->maindata->Vulnerables->Ghost."</td></tr>\n";
echo "<tr><td><font color='#333300'>Undead</font></td><td>".$response->body->maindata->Vulnerables->Undead."</td></tr>\n";*/

echo "\n</table>\n\n";
echo '    </div>';//--main page div

echo '  <div id="vulnerables" class="ui-body-d ui-content">';
echo "\n<table id='mosnter_vulnerables_tab'>\n";
echo "<tr><td>Neutral</td><td>".$response->body->maindata->Vulnerables->Neutral."</td></tr>\n";
echo "<tr><td><font color='blue'>Water</font></td><td>".$response->body->maindata->Vulnerables->Water."</td></tr>\n";
echo "<tr><td><font color='#330000'>Earth</font></td><td>".$response->body->maindata->Vulnerables->Earth."</td></tr>\n";
echo "<tr><td><font color='Red'>Fire</font></td><td>".$response->body->maindata->Vulnerables->Fire."</td></tr>\n";
echo "<tr><td><font color='#999900'>Wind</font></td><td>".$response->body->maindata->Vulnerables->Wind."</td></tr>\n";
echo "<tr><td><font color='Lime'>Poison</font></td><td>".$response->body->maindata->Vulnerables->Poison."</td></tr>\n";
echo "<tr><td>Holy</td><td>".$response->body->maindata->Vulnerables->Holy."</td></tr>\n";
echo "<tr><td><font color='#404040'>Shadow</font></td><td>".$response->body->maindata->Vulnerables->Shadow."</td></tr>\n";
echo "<tr><td><font color='Gray'>Ghost</font></td><td>".$response->body->maindata->Vulnerables->Ghost."</td></tr>\n";
echo "<tr><td><font color='#333300'>Undead</font></td><td>".$response->body->maindata->Vulnerables->Undead."</td></tr>\n";

echo "\n</table>\n\n";
echo '    </div>';

echo '  <div id="drop" class="ui-body-d ui-content">';
echo "\n<table id='mosnter_drop_tab'>\n";
foreach($response->body->drop as $item)
{
    echo "<tr><td><img src=\"".$item->Image."\"></td><td>".$item->Name."</td>\n";
    echo "<td>".$item->Chance."%</td></tr>\n";
#    echo $item->Name;
}
#var_dump($response->body);
echo "\n</table>\n\n";
echo '    </div>';

echo '</div>';//--tabpages div
echo "<script>
$( document ).ready(function() {
    $('a[href=\"#drop\"]').trigger(\"click\");
});
</script>";


include('footer.php');
?>