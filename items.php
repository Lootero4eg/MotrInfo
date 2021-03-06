<?php
ini_set('display_errors', 'On');

$pagecaption = "Search by monster name";
include('header.php');

include('./httpful.phar');

if(!isset($_GET["item_name"]))
{
    echo "<h1>Item id not found</h1>";

    include('footer.php');
    return;
}

$uri = $REST_url ."index.php/searchByItemName/".$_GET["item_name"];
$response = \Httpful\Request::get($uri)
 ->expectsJson()
    ->send();

?>

<ul data-role="listview" data-inset="true">
<?php
for($i=0;$i<count($response->body);$i++)
{?>
    <li style="height:60px"><a href="<?php echo $response->body[$i]->Link;?>"><img src="<?php echo $response->body[$i]->Image;?>">
    <h2><?php echo $response->body[$i]->Name; ?></h2>
    </a></li>
<?php
}?>

</ul>

<?php include('footer.php');?>
