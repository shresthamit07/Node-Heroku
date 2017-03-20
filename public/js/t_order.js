$(document).ready(function(c) {
	$(".order_header").click(function () {

    $header = $(this);
    debugger;
    //getting the next element
    $content = $header.next();
    //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
    $content.slideToggle(500, function () {
    });

});

});