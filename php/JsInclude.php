<?php
    $jsSources = array(
        "lib/jquery-2.1.3.min.js",
        "js/HFP.js",
        "js/main.js"
    );

    foreach ($jsSources as $src) {
        echo "<script src=\"$src\"></script>";
    }
?>
