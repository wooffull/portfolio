<?php
    // Constants
    define("NAV_ELEMENT_SPAN_CLASSES", "nav-bar-element-span");
    define("NAV_ELEMENT_LINK_CLASSES", "nav-bar-element-link");

    function generateNavBarElement($label, $link) {
        $label = strtoupper($label);
        $a = "<a href=\"$link\" class=\"" .
            NAV_ELEMENT_LINK_CLASSES . "\">$label</a>";
        return "<span class=\"" . NAV_ELEMENT_SPAN_CLASSES . "\">$a</span>";
    }

    $navBarElements = array(
        "Hector" => "./",
        "Projects" => "projects.php",
        "Resume" => "./img/Resume.pdf",
        "Music" => "music.php"
    );

    echo "<nav id=\"nav-bar\">";
    foreach ($navBarElements as $label => $link) {
        echo generateNavBarElement($label, $link);
    }
    echo "</nav>";
?>
