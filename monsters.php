<?php
ini_set('display_errors', 'On');

$pagecaption = "Search by monster name";

include('header.php');

include('./httpful.phar');

if(!isset($_GET["monster_name"]))
{
    echo "<h1>Monster id not found</h1>";

    include('footer.php');
    return;
}

$uri = $REST_url ."index.php/searchByMonsterName/".$_GET["monster_name"];
$response = \Httpful\Request::get($uri)
 ->expectsJson()
    ->send();
?>
<ul data-role="listview" data-inset="true">
<?php
for($i=0;$i<count($response->body);$i++)
{?>
    <li><a href="<?php echo $response->body[$i]->Link;?>"><img src="<?php echo $response->body[$i]->Image;?>">
    <h2><?php echo $response->body[$i]->Name; ?></h2>
    <p><?php echo $response->body[$i]->Type; ?></p>
    </a></li>
<?php
}?>

</ul>

<?php include('footer.php');?>
