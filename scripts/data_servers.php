<?php
include_once('common_bo.php');

$servers = \Cetera\Server::enum();
if (sizeof($servers)) {

    $data = array();
    
    foreach ($servers as $s) {
    
        $data[] = array(
            'id'       => $s->id,
            'name'     => $s->name
        );  
    }  
    
}

echo json_encode(array(
    'success' => true,
    'rows'    => $data
));
