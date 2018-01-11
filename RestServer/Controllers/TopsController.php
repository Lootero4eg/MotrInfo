<?php

$i_name = null;
$items = null;

use \Jacwright\RestServer\RestException;

class PersonInfo
{
    public $id = null;
    public $position = null;
    public $name = null;
    public $class = null;    
    public $baseLvl = null;
    public $jobLvl = null;
    public $guild_image = null;
    public $guild = null;
    public $socialRang = null;
}

class GuildInfo
{
    public $id = null;
    public $position = null;
    public $guild_image = null;
    public $name = null;
    public $rate = null;    
    public $lvl = null;
    public $members = null;    
    public $averageLvl = null;
    public $exp = null;
    public $GM = null;
    public $castles = null;
}

class TopsController
{    
    /**
     * Returns a JSON string object to the browser when hitting the root of the domain
     *
     * @url GET /getPersonsTop     
     * @url GET /index.php/getPersonsTop     
     */
    public function GetPersons()
    {
      require ('../phpQuery/phpQuery.php');
	  $motrinfo = file_get_contents('http://motr-online.com/tops/person');
      $document = phpQuery::newDocument($motrinfo);
      $res = [];

      $hentry = $document->find('table.tableBord');
      
      $pqm=pq($hentry)->eq(0);
      $trarr=array();

      foreach ($pqm->find('tr') as $el1)
      {
         $pq1 = pq($el1);
         $trarr[] = $pq1;
      }
      
      for($i=1;$i<count($trarr);$i++){          
          $row = new PersonInfo();
          $row->position = $trarr[$i]->find('td')->eq(0)->text();
          $row->name = $trarr[$i]->find('td')->eq(1)->text();
          $row->class = $trarr[$i]->find('td')->eq(2)->text();
          $row->baseLvl = $trarr[$i]->find('td')->eq(3)->text();
          $row->jobLvl= $trarr[$i]->find('td')->eq(4)->text();
          $row->guild = $trarr[$i]->find('td')->eq(5)->find('a')->text();
          $row->guild_image = $trarr[$i]->find('td')->eq(5)->find('img')->attr('src');
          $row->socialRang = $trarr[$i]->find('td')->eq(6)->text();
          array_push($res,$row);
      }

	  return $res;
    }

    /**
     * Returns a JSON string object to the browser when hitting the root of the domain
     *
     * @url GET /getGuildsTop/$guilds_count
     * @url GET /index.php/getGuildsTop/$guilds_count
     */
    public function GetGuilds($guilds_count)
    {
      require ('../phpQuery/phpQuery.php');
	  $motrinfo = file_get_contents('http://motr-online.com/tops/guilds/top'.$guilds_count);
      $document = phpQuery::newDocument($motrinfo);
      $res = [];

      $hentry = $document->find('table.tableBord');
      
      $pqm=pq($hentry)->eq(0);
      $trarr=array();

      foreach ($pqm->find('tr') as $el1)
      {
         $pq1 = pq($el1);
         $trarr[] = $pq1;
      }
      
      for($i=1;$i<count($trarr);$i++){          
          $row = new GuildInfo();
          $row->position = $trarr[$i]->find('td')->eq(0)->text();
          $row->guild_image = $trarr[$i]->find('td')->eq(1)->find('img')->attr('src');
          $row->name = $trarr[$i]->find('td')->eq(2)->text();
          $gldid = $trarr[$i]->find('td')->eq(2)->html();
          $row->id = preg_replace('/.*guild\/(.*?)">.*/','$1', $gldid);
          $row->rate = $trarr[$i]->find('td')->eq(3)->text();
          $row->lvl = $trarr[$i]->find('td')->eq(4)->text();
          $row->members= $trarr[$i]->find('td')->eq(5)->text();
          $row->averageLvl = $trarr[$i]->find('td')->eq(6)->text();
          $row->exp = $trarr[$i]->find('td')->eq(7)->text();
          $row->GM = $trarr[$i]->find('td')->eq(8)->text();
          $row->castles = $trarr[$i]->find('td')->eq(9)->html();
          
          $castlesArr = explode('<br>',$row->castles);
          $row->castlesList = Array();
          foreach($castlesArr as $item){
            if($item ==  "\n")
                continue;
            $item = preg_replace('/.*0">(.*)<\/font><\/a>.*">(.*)<\/font>/','$1 $2',$item);
            $item = str_replace("\n","",$item);
            array_push($row->castlesList,$item);
          }

          array_push($res,$row);
      }

	  return $res;
    }

    /**
     * Returns a JSON string object to the browser when hitting the root of the domain
     *
     * @url GET /getGuildInfo/$guild_id
     * @url GET /index.php/getGuildInfo/$guild_id
     */
    public function GetGuildInfo($guild_id)
    {
        require ('../phpQuery/phpQuery.php');
        $motrinfo = file_get_contents('http://motr-online.com/tops/guild/'.$guild_id);
        $document = phpQuery::newDocument($motrinfo);      

        $hentry = $document->find('table.tableBord');
        
        $pqm=pq($hentry)->eq(0);
        $trarr=array();

        foreach ($pqm->find('tr') as $el1)
        {
            $pq1 = pq($el1);
            $trarr[] = $pq1;
        }
            
        $row = new GuildInfo();          
        $row->GM = $trarr[1]->find('td')->eq(1)->text();
        $row->lvl = $trarr[2]->find('td')->eq(1)->text();
        $row->members= $trarr[3]->find('td')->eq(1)->text();
        $row->exp = $trarr[4]->find('td')->eq(1)->text();
        $membersStr = $trarr[5]->find('td')->eq(1)->html();
        $membersArr = explode('<br>',$membersStr);
        $row->membersList = Array();
        foreach($membersArr as $item){
        $item = str_replace("\n","",$item);
        if($item ==  "\n")
            continue;
        $item = preg_replace('/.*">(.*)<.*/','$1',$item);
        array_push($row->membersList,$item);
        }
        //$row->membersList = $trarr[5]->find('td')->eq(1)->html();
        $castlesStr = $trarr[6]->find('td')->eq(1)->html();
        $castlesArr = explode('<br>',$castlesStr);
        $row->castlesList = Array();
        foreach($castlesArr as $item){
        $item = str_replace("\n","",$item);
        if($item ==  "\n")
            continue;
        $item = preg_replace('/.*">(.*)<\/font><\/a>/','$1',$item);
        array_push($row->castlesList,$item);
        }
        
        //array_push($res,$row);

	    return $row;
    }
}
