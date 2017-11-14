<?php

$i_name = null;
$items = null;

use \Jacwright\RestServer\RestException;

class ItemsInfo
{
    public $id = null;
    public $item_name = null;
    public $item_img = null;
    public $item_type = null;
    public $weight = null;
    public $sell = null;
    public $buy = null;
    public $description = null;
    public $compound = null;
    public $wearable_info = null;
    public $drop = null;
}

class ItemsController
{
    /**
     * Returns a JSON string object to the browser when hitting the root of the domain
     *
     * @url GET /searchByItemName/$item_name
     * @url GET /index.php/searchByItemName/$item_name
     */
    public function SearchByItemName($item_name = null)
    {
	     global $i_name;
	     $i_name = $item_name;

	     require ('../phpQuery/phpQuery.php');
	     phpQuery::browserGet('http://motr-online.com/database/finditems', 'items_success');

	     global $items;

	     return $items;
       //return null;
    }

    /**
     * Returns a JSON string object to the browser when hitting the root of the domain
     *
     * @url GET /getMonsterInfoById/$type/$item_id
     * @url GET /index.php/getItemInfoById/$type/$item_id
     */
    public function GetItemInfoById($type = null, $item_id = null)
    {
       require ('../phpQuery/phpQuery.php');
	     $motrinfo = file_get_contents('http://motr-online.com/database/'.$type.'/'.$item_id);
	     $document = phpQuery::newDocument($motrinfo);

      $hentry = $document->find('table.tabl1');

      //--main item data
      $pqm=pq($hentry)->eq(0);
      $tdarr=array();

      foreach ($pqm->find('td') as $el1)
      {
         $pq1 = pq($el1);
         $tdarr[] = $pq1;
      }

      $res = new ItemsInfo();
      $res->id = $item_id;
      $res->item_type = $type;
      $res->item_name = $tdarr[0]->text();

      if($type == "items")
      {
        $res->weight = $tdarr[2]->text();
        if($tdarr[6]->text() == "")
          $res->sell = "10";
        else
          $res->sell = strval($tdarr[6]->text() / 2);
        $res->buy = $tdarr[6]->text();
        $res->item_img = $tdarr[9]->find("img")->attr('src');
        $res->description = $tdarr[10]->html();
      }

      if($type == "wearables")
      {
        $res->weight = $tdarr[7]->text();
        $res->item_img = $tdarr[1]->find("img")->attr('src');
        if($tdarr[23]->text() == "")
          $res->sell = "10";
        else
          $res->sell = $tdarr[23]->text();

        if($tdarr[25]->text() == "")
          $res->buy = "10";
        else
          $res->buy = $tdarr[25]->text();
        $res->compound = $tdarr[27]->text();
        $res->description = $tdarr[30]->html();

	      $res->wearable_info = array(
          $tdarr[2]->text() => $tdarr[3]->text(),
          $tdarr[4]->text() => $tdarr[5]->text(),
          $tdarr[8]->text() => $tdarr[9]->text(),
          "ATK_MATK" => $tdarr[11]->text(),
          $tdarr[12]->text() => $tdarr[13]->text(),
          "Weapon_Lvl" => $tdarr[15]->text(),
          "Base_Lvl" => $tdarr[17]->text(),
          $tdarr[18]->text() => $tdarr[19]->text(),
          $tdarr[20]->text() => $tdarr[21]->text(),
          //$tdarr[26]->text() => $tdarr[27]->text(),
          "Job" => trim(substr($tdarr[31]->text(),5))
        );
      }

      if($type == "cards")
      {
        $res->item_img = $tdarr[1]->find("img")->attr('src');
        $res->weight = $tdarr[4]->text();
        $res->description = $tdarr[7]->html();
        $res->sell = "10";
        $res->buy = "";
      }

      //--drop item data
      $pqm=pq($hentry)->eq(1);
      $tdarr=array();

      foreach ($pqm->find('td') as $el1)
      {
         $pq1 = pq($el1);
         $tdarr[] = $pq1;
      }

      if ((count($tdarr)/2)==round(count($tdarr)/2))
      {
         $res->drop = array();
         for($i=2;$i<count($tdarr);$i=$i+2)
         {
            $mid = $tdarr[$i]->find("a")->attr("href");
            $mid = substr(strrchr($mid, "/"),1);
            $link = "monster.php?monster_id=" .$mid;
            $tdarr[$i]->find("a")->attr("href",$link);
            $row = array(
               //"test"=> $link,
                  "monster_name" => $tdarr[$i]->html(),
                  "chance" => $tdarr[$i+1]->text()
                  );
             array_push($res->drop,$row);
         }
      }

	    return $res;
    }
}

function items_success($browser)
{
  global $i_name;

  $handle = $browser
  ->WebBrowser('print_items_info');
  $handle
  ->find('input[id=search_box1]')
      ->val($i_name)
      ->parents('form')
      ->unbind()
        ->submit();
}

function print_items_info($browser)
{
    $tabs = $browser->find('table[bgcolor="Black"]')
        ->attr('bgcolor','White')
        ->attr('align','Left');

    $tdarr = array();
    $tdnum = 0;
    foreach(pq($tabs)->find('tr') as $el2)
    {
        $pq2 = pq($el2);
	    $tdarr[] = $pq2->find('td')->eq(0);
    }

	global $items;
	$items = array();

  if ((count($tdarr)/2)==round(count($tdarr)/2))
  {
	   for($i=0;$i<count($tdarr);$i=$i+2)
     {
         $link_arr = explode('/', $tdarr[$i+1]->find('a')->attr('href'));
 			   $link = "item.php?type=".$link_arr[count($link_arr)-1];
 			   $image = $tdarr[$i+1]->find("img")->attr('src');

         $link = $tdarr[$i+1]->find("a")->attr("href");
         $link = str_replace("/database/","item.php?type=", $link);
         $link = str_replace("/","&item_id=", $link);

	       $row = array(
	       "Name" => $tdarr[$i]->text(),
		     "Link" => $link,
			   "Image" => $tdarr[$i+1]->find("img")->attr("src"));

         array_push($items, $row);
     }
  }

  return $items;
}
