<?php

$m_name = null;
$monsters = null;

use \Jacwright\RestServer\RestException;

class MonsterInfo
{
    public $monster_name = null;
    public $monster_img = null;
    public $monster_type = null;
    public $maindata = null;
    public $drop = null;
    public $locations = null;
    public $skills = null;
}

class MonstersController
{
    /**
     * Returns a JSON string object to the browser when hitting the root of the domain
     *
     * @url GET /searchByMonsterName/$monster_name
     * @url GET /index.php/searchByMonsterName/$monster_name
     */
    public function SearchByMonsterName($monster_name = null)
    {
	     global $m_name;
	     $m_name = $monster_name;

	     require ('../phpQuery/phpQuery.php');
	     phpQuery::browserGet('http://motr-online.com/database/monsters', 'monsters_success');

	     global $monsters;

	     return $monsters;
    }

    /**
     * Returns a JSON string object to the browser when hitting the root of the domain
     *
     * @url GET /getMonsterInfoById/$monster_id
     * @url GET /index.php/getMonsterInfoById/$monster_id
     */
    public function GetMonsterInfoById($monster_id = null)
    {
       require ('../phpQuery/phpQuery.php');
	     $motrinfo = file_get_contents('http://motr-online.com/database/monsters/'.$monster_id);
	     $document = phpQuery::newDocument($motrinfo);

      $hentry = $document->find('table.tableBord');

      $pqm=pq($hentry);
      $tdarr=array();

      foreach ($pqm->find('td') as $el1)
      {
         $pq1 = pq($el1);
         $tdarr[] = $pq1;
      }

	    $res = new MonsterInfo();
	    $res->monster_name = $tdarr[0]->text();
	    $res->monster_img = $tdarr[7]->find("img")->attr('src');
	    $res->monster_type = trim($tdarr[56]->text());
	    $res->maindata= array
	    (
	         $tdarr[1]->text() => $tdarr[2]->text(),
	         $tdarr[3]->text() => $tdarr[4]->text(),

	         $tdarr[8]->text() => $tdarr[9]->text(),
	         $tdarr[10]->text() => $tdarr[11]->text(),

	         $tdarr[14]->text() => $tdarr[15]->text(),
	         $tdarr[16]->text() => $tdarr[17]->text(),


	         $tdarr[20]->text() => $tdarr[21]->text(),
	         $tdarr[22]->text() => $tdarr[23]->text(),

	         $tdarr[26]->text() => $tdarr[27]->text(),
	         $tdarr[28]->text() => $tdarr[29]->text(),

	         $tdarr[32]->text() => $tdarr[33]->text(),
	         $tdarr[34]->text() => $tdarr[35]->text(),

	         $tdarr[38]->text() => $tdarr[39]->text(),
	         $tdarr[40]->text() => $tdarr[41]->text(),

	         $tdarr[44]->text() => $tdarr[45]->text(),
	         $tdarr[46]->text() => $tdarr[47]->text(),

	         $tdarr[50]->text() => $tdarr[51]->text(),
	         $tdarr[52]->text() => $tdarr[53]->text(),
	         "Vulnerables" => array(
	              "Neutral" => $tdarr[6]->text(),
	              "Water" => $tdarr[13]->text(),
	              "Earth" => $tdarr[19]->text(),
	              "Fire" => $tdarr[25]->text(),
	              "Wind" => $tdarr[31]->text(),
	              "Poison" => $tdarr[37]->text(),
	              "Holy" => $tdarr[43]->text(),
	              "Shadow" => $tdarr[49]->text(),
	              "Ghost" => $tdarr[55]->text(),
	              "Undead" => $tdarr[58]->text())); // serializes object into JSON

	         //--finding drop and skills
	         $hentry = $document->find('table.tabl1');

	         //--DROP
	         $tdarr=array();
	         foreach(pq($hentry)->eq(0)->find('td') as $el2)
	         {
	            $pq2 = pq($el2);
	            $tdarr[] = $pq2;
	         }

	         if ((count($tdarr)/7)==round(count($tdarr)/7))
	         {
	            $res->drop = array();
	            for($i=7;$i<count($tdarr);$i=$i+7)
	            {
                $link = $tdarr[$i+1]->find("a")->attr("href");
                $link = str_replace("/database/","item.php?type=", $link);
                $link = str_replace("/","&item_id=", $link);
                $tdarr[$i+1]->find("a")->attr("href", $link);
		              $row = array(
		                   "Image" =>  $tdarr[$i]->find("img")->attr('src'),                       
		                   $tdarr[1]->html() => $tdarr[$i+1]->html(),
		                   $tdarr[2]->html() => $tdarr[$i+2]->text(),
		                   $tdarr[3]->html() => $tdarr[$i+3]->text(),
		                   "Weight" => $tdarr[$i+4]->text(),
		                   $tdarr[5]->html() => $tdarr[$i+5]->text(),
		                   "Chance" => $tdarr[$i+6]->text());
		              array_push($res->drop,$row);
	            }
            }

	          //--LOCATIONS
	          $tdarr=array();
	          foreach(pq($hentry)->eq(1)->find('td') as $el2)
	          {
	             $pq2 = pq($el2);
	             $tdarr[] = $pq2;
	          }

	          if ((count($tdarr)/3)==round(count($tdarr)/3))
	          {
	             $res->locations = array();
	             for($i=3;$i<count($tdarr);$i=$i+3)
	             {
		               $row = array(
		                  $tdarr[0]->html() => $tdarr[$i]->html(),
		                  "Count" => $tdarr[$i+1]->text(),
		                  $tdarr[2]->html() => $tdarr[$i+2]->text());
		               array_push($res->locations, $row);
	             }
	          }

	          //--SKILLS
	          $tdarr=array();
	          foreach(pq($hentry)->eq(2)->find('td') as $el2)
	          {
	             $pq2 = pq($el2);
	             $tdarr[] = $pq2;
	          }

	          if ((count($tdarr)/3)==round(count($tdarr)/3))
	          {
	             $res->skills = array();
	             for($i=3;$i<count($tdarr);$i=$i+3)
	             {
		               $row = array(
		                   "Image" => $tdarr[$i]->html(),
		                   "Skill" => $tdarr[$i+1]->html(),
		                   "Level" => $tdarr[$i+2]->text());
		               array_push($res->skills, $row);
	             }
	          }

	       return $res;
    }
}

function monsters_success($browser)
{
  global $m_name;
  $handle = $browser
    ->WebBrowser('print_monsters_info');
  $handle
    ->find('input[id=search_box2]')
      ->val($m_name)
      ->parents('form')
      ->unbind()
        ->submit();
}

function print_monsters_info($browser)
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

	global $monsters;
	$monsters = array();

	for($i=0;$i<count($tdarr);$i++)
  {
		$name = null;
		$link = null;
		$image = null;
		$type = null;
		$tdaffectedcnt = 0;

		if($tdarr[$i]->find('font')->attr('color') == "Yellow")
		{
			$name = $tdarr[$i]->text();
			$tdaffectedcnt++;
		}

		if($i+1 < count($tdarr))
		{
			$link_arr = explode('/', $tdarr[$i+1]->find('a')->attr('href'));
			$link = "monster.php?monster_id=".$link_arr[count($link_arr)-1];
			$image = $tdarr[$i+1]->find("img")->attr('src');
			$tdaffectedcnt++;
		}

		if($i+2 < count($tdarr))
		{
			if($tdarr[$i+2]->attr('colspan') != null)
			{
				if($tdarr[$i+2]->find('font')->text() != '')
				{
					$type = $tdarr[$i+2]->text();
					$tdaffectedcnt++;
				}
			}
		}

		$i = $i + $tdaffectedcnt;

	  $row = array(
	     "Name" => $name,
		   "Link" => $link,
			 "Image" => $image,
	     "Type" => $type);

       array_push($monsters, $row);
  }

  return null;
}
