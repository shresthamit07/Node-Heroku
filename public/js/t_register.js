$(document).ready(function(){
$('#register_form input').on('change invalid', function() {
    var textfield = $(this).get(0);
    textfield.setCustomValidity('');
    if (!textfield.validity.valid) {
    	var msg = $(this).get(0).title;
      textfield.setCustomValidity(msg);  
    }
});

$("#success_alert").fadeTo(2000, 500).fadeIn(500, function(){
    $("#success_alert").fadeOut(500);
});
});