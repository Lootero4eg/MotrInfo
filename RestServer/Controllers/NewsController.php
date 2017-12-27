<?php

$i_name = null;
$items = null;

use \Jacwright\RestServer\RestException;

class NewsEntry
{
    public $caption = null;
    public $post_date = null;
    public $content = null;    
}

class NewsController
{    
    /**
     * Returns a JSON string object to the browser when hitting the root of the domain
     *
     * @url GET /getMonsterInfoById/$type/$item_id
     * @url GET /index.php/getNews
     */
    public function GetNews()
    {
      require ('../phpQuery/phpQuery.php');
	  $motrinfo = file_get_contents('http://motr-online.com/news');
      $document = phpQuery::newDocument($motrinfo);
      $res = [];

      $hentry = $document->find('table.tbl1');
      
      foreach (pq($hentry) as $tab){
        $newsentry = new NewsEntry();
        $newsentry->caption = pq($tab)->find("tr")->eq(0)->text();
        $newsentry->post_date = pq($tab)->find("tr")->eq(1)->text();
        $newsentry->content = pq($tab)->find("tr")->eq(2)->html();
        array_push($res, $newsentry);
      }

      /*$pqm=pq($hentry)->eq(0);
      $trarr=array();

      foreach ($pqm->find('tr') as $el1)
      {
         $pq1 = pq($el1);
         $tdarr[] = $pq1;
      }*/      

	    return $res;
    }
}
