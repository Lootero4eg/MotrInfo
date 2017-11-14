<?php
ini_set('display_errors', 'On');

include('header.php');

include('./httpful.phar');

if(!isset($_GET["item_name"]))
{
    echo "<h1>Item id not found</h1>";

    include('footer.php');
    return;
}

//$uri = "http://motrinfo.000webhostapp.com/RestServer/index.php/searchByItemName/".$_GET["item_name"];
$uri = "http://localhost/motrinfo/RestServer/index.php/searchByItemName/".$_GET["item_name"];
$response = \Httpful\Request::get($uri)
 ->expectsJson()
    ->send();

?>
<div data-role="header" class="top_header headerBG" data-position="fixed">
    <a href="search.php" data-icon="back">Back</a>
    <h1>Search by monster name</h1>
</div>

<ul data-role="listview" data-inset="true">
<?php
for($i=0;$i<count($response->body);$i++)
{?>
    <li style="height:610px"><a href="<?php echo $response->body[$i]->Link;?>"><img src="<?php echo $response->body[$i]->Image;?>">
    <h2><?php echo $response->body[$i]->Name; ?></h2>
    </a></li>
<?php
}?>

</ul>

<?php include('footer.php');?>
