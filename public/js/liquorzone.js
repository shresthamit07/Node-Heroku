$(document).ready(function(c) {
    $("#contact_form").submit(function(e) {
    		$('div.message_div').hide();

    	    $.ajax({
    	           type: "POST",
    	           url: 'http://localhost:3000/contact_message',
    	           data: $("#contact_form").serialize(), // serializes the form's elements.
    	           success: function(data) {
    	                $('div.message_div').show();
                        $('div.message_div').html('Thank you for sending us message.').css({
                            'position': 'fixed',
                            'top': '0',
                            'left': '0',
                            'z-index': '999',
                            'width': '100%',
                            'height': '50px',
                            'background-color': '#dff0d8',
                            'color': '#3c763d',
                            'border-color': '#d6e9c6',
                            'text-align': 'center',
                            'padding': '5px',
                        }).delay(10000).fadeOut();
    	                window.location.href = 'http://localhost:3000/contact_us';
    	            },
    	            error: function(e){
    	            	$('div.message_div').show();
                        $('div.message_div').html('Thank you for sending us message.').css({
                            'position': 'fixed',
                            'top': '0',
                            'left': '0',
                            'z-index': '999',
                            'width': '100%',
                            'height': '50px',
                            'background-color': '#dff0d8',
                            'color': '#3c763d',
                            'border-color': '#d6e9c6',
                            'text-align': 'center',
                            'padding': '5px',
                        }).delay(10000).fadeOut();
    	                console.log(e);
    	            	window.location.href = 'http://localhost:3000/contact_us';
    	            }
    	         });
    	     e.preventDefault();
    	 });
});