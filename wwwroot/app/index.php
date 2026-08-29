<?php
    ini_set('display_errors', "On");



    function dirList($dir)
    {
        $result = [];

        $list = scandir($dir);
        foreach ($list as $f) {
            if (preg_match("/^\..*/", $f)) {
                continue;
            }

            if (preg_match("/.*\.BAK$/", $f)) {
                continue;
            }

            $name = $dir . '/' . $f;
            if (is_dir($name)) {
                $result = array_merge($result, dirList($name));
            }
            else {
                $result[$name] = filemtime($name);
            }
        }

        return $result;
    }



    $fileList = [];

    $rootList = scandir("./");
    foreach ($rootList as $dir) {
        if ($dir != "data" && $dir != "models") {
            continue;
        }

        $fileList = array_merge($fileList, dirList($dir));
    }



    header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
    
    // HTTP/1.1
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Cache-Control: post-check=0, pre-check=0', FALSE);
    
    // HTTP/1.0
    header('Pragma: no-cache');

    echo json_encode($fileList);
?>
