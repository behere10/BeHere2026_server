<?php
    ini_set('display_errors', "On");



    header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
    
    // HTTP/1.1
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Cache-Control: post-check=0, pre-check=0', FALSE);
    
    // HTTP/1.0
    header('Pragma: no-cache');
    


    if (isset($_FILES['upload'])) {
        header("Content-Type: application/json; charset=utf-8");

        $message = ['status' => true, 'message' => 'OK'];

        try {
            if ($_FILES['upload']['error'] != 0) {
                throw Exception("FAILED: upload: " . $_FILES['upload']['error']);
            }

            $filename = 'data/' . $_FILES['upload']['name'];
            if (file_exists($filename)) {
                date_default_timezone_set('Asia/Tokyo');
                //date_default_timezone_set('America/Los_Angeles');

                $mTime = filemtime($filename);
                $dateTimeStr = date("YmdHis", $mTime);
                $newFilename = $filename . '.' . $dateTimeStr. '.BAK';

                copy($filename, $newFilename);
            }
            
            if (move_uploaded_file($_FILES['upload']['tmp_name'], $filename)) {
                $message['message'] = 'OK, uploaded to: ' . $filename;
            } else {
                throw Exception("FAILED: move_uploaded_file");
            }
        }
        catch (Exception $e) {
            $message['status'] = false;
            $message['message'] = $e->getMessage();
        }

        echo json_encode($message);

        return;
    }
?>

<html>

<head>
    <title>App Data Upload - BeHereLA server</title>
</head>

<body>

<h1>BeHereLA server</h1>

<h2>App Data Upload</h2>

<form enctype="multipart/form-data" action="./upload.php" method="POST">
    <input type="hidden" name="MAX_FILE_SIZE" value="20000000" />
    <p>このファイルをアップロード: <input name="upload" type="file" /></p>
    <p><input type="submit" value="ファイルを送信" /></p>
</form>

</body>

</html>
