$(document).ready(function(c) {
	showCartDetails();
	$('.close1').on('click', function(c){
		$(this).closest('div[class^="cart-header"]').fadeOut('slow', function(c){
			$(this).remove();
		});
	});	  


	$(".close1").click(function (event) {
	        event.preventDefault();
	        var data = $(this).siblings('.simpleCart_shelfItem').children('.cart-item-info').data('id')
	        var post_data = {data: data};
	        console.log(typeof post_data);
	        $.ajax({
	            type: 'POST',
	            url: 'http://localhost:3000/products/delete_from_cart',
	            data: post_data,
	            dataType: 'application/json',
	            success: function(data) {
                        console.log('success');
                        adjustLocalStorageData(data);
                        // getLocalStorageCartData();
                        // showCartDetails();
                        console.log(data);
                    },
                    error: function(e){
                    	adjustLocalStorageData(data);
                        // getLocalStorageCartData();
                        // showCartDetails();
                        console.log(e);
                    }
	        });
	    });

	$(".update_qty").click(function (event) {
    	event.preventDefault();
    	var qty = $(this).siblings('input').val();
    	var id = $(this).closest('div.cart-item-info').data('id');
    	addToCart(id, parseInt(qty));
        var cart = JSON.parse(localStorage.getItem('cart'));
        var post_data = localStorage.getItem('cart');
        console.log(typeof post_data);
        console.log(cart);
        // var data = {};
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/products/update_qty',
            data: {data: post_data},
            dataType: 'application/json',
            // dataType: 'json',
            success: function(data) {
                console.log('success');
                // getLocalStorageCartData();
                var data = JSON.parse(localStorage.getItem('cart'));
			        // var data = JSON.parse(document.cookie.item_details);
			  ids = [];
				var quantity = 0;
				var total_amount = 0;
				if(!data){
				    cart_data = [];
				}else{
				    for (var i = 0; i < data.length; i++) {
				        quantity = data[i].qty + quantity;
				        total_amount = total_amount + (data[i].qty * data[i].price);
				        id = data[i].id;
				        ids.push(id);
				    }
				}

				var cart_details = {quantity: quantity, total_amount: total_amount, ids: ids}
			    $('.simpleCart_empty').hide();
			    $('.simpleCart_quantity').html(quantity);
			     localStorage.setItem('cart_details',JSON.stringify(cart_details));
			    $('.simpleCart_total').html('$' + total_amount.toFixed(2));
                window.location.href = 'http://localhost:3000/mycart';
                // showCartDetails();
                console.log(data);
            },
            error: function(e){
            	// getLocalStorageCartData();
            	var data = JSON.parse(localStorage.getItem('cart'));
			        // var data = JSON.parse(document.cookie.item_details);
			  ids = [];
				var quantity = 0;
				var total_amount = 0;
				if(!data){
				    cart_data = [];
				}else{
				    for (var i = 0; i < data.length; i++) {
				        quantity = data[i].qty + quantity;
				        total_amount = total_amount + (data[i].qty * data[i].price);
				        id = data[i].id;
				        ids.push(id);
				    }
				}

				var cart_details = {quantity: quantity, total_amount: total_amount, ids: ids}
			    $('.simpleCart_empty').hide();
			    $('.simpleCart_quantity').html(quantity);
			     localStorage.setItem('cart_details',JSON.stringify(cart_details));
			    $('.simpleCart_total').html('$' + total_amount.toFixed(2));
                $('div.message_div').show();
                $('div.message_div').html('Item quantity updated successfully.').css({
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
                }).delay(1000).fadeOut();

                window.location.href = 'http://localhost:3000/mycart';
                // showCartDetails();
                console.log(e);
            }
        });
	});


	$(".checkout_form").submit(function(e) {
		$('div.message_div').hide();

	    $.ajax({
	           type: "POST",
	           url: 'http://localhost:3000/checkout',
	           data: $(".checkout_form").serialize(), // serializes the form's elements.
	           success: function(data) {
	           		localStorage.removeItem('cart');
	                localStorage.removeItem('cart_details');
	                getLocalStorageCartData();
	                $('div.message_div').show();
                    $('div.message_div').html('Your order has been placed successfully. Check your Email for order details.').css({
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
	                window.location.href = 'http://localhost:3000';
	            },
	            error: function(e){
	            	localStorage.removeItem('cart');
	            	getLocalStorageCartData();
	            	localStorage.removeItem('cart_details');
	            	$('div.message_div').show();
                    $('div.message_div').html('Your order has been placed successfully. Check your Email for order details.').css({
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
	            	window.location.href = 'http://localhost:3000';
	            }
	         });
	     e.preventDefault();
	 });
});

var showCartDetails = function(){
		var cart_details = JSON.parse(localStorage.getItem('cart_details'));
	   	var quantity = 0;
	   	var total_amount = 0;
	   	var delivery_charge = 10.00;
	   	var amount_with_delivery_charge = 0;
	   	if(!cart_details){
	        cart_details = [];
	    }else{
		   	console.log(cart_details)
		   	quantity = cart_details.quantity;
		   	total_amount = (cart_details.total_amount).toFixed(2);
		   	console.log(amount_with_delivery_charge)
		   }

		   if(quantity != 0){
		   	delivery_charge = 10.00;
		   }else{
		   	delivery_charge = 0.00;
		   }

		   amount_with_delivery_charge = parseFloat(total_amount) + parseFloat(delivery_charge);
		   $('.price-details span.total1:last').html('$' + delivery_charge.toFixed(2));
		   $('.price-details span.total1:first').html('$' + parseFloat(total_amount).toFixed(2));
		   $('.cart-items h1.quantity').html('My Cart (' + quantity +')');
		   $('ul.total_price li:last span:last').html('$' + parseFloat(amount_with_delivery_charge).toFixed(2));

}

var adjustLocalStorageData = function(items_to_delete){
	var items_in_cart = JSON.parse(localStorage.getItem('cart'));
    items_in_cart = items_in_cart.filter(function( obj ) {
      return obj.id !== items_to_delete;
    });
    localStorage.setItem('cart', JSON.stringify(items_in_cart));
    //getLocalStorageCartData;
    var data = JSON.parse(localStorage.getItem('cart'));
    // var data = JSON.parse(document.cookie.item_details);
    ids = [];
        var quantity = 0;
        var total_amount = 0;
        if(!data){
            cart_data = [];
        }else{
            for (var i = 0; i < data.length; i++) {
                quantity = data[i].qty + quantity;
                total_amount = total_amount + (data[i].qty * data[i].price);
                id = data[i].id;
                ids.push(id);
            }
        }
        var cart_details = {quantity: quantity, total_amount: total_amount, ids: ids}
    $('.simpleCart_empty').hide();
    $('.simpleCart_quantity').html(quantity);
     localStorage.setItem('cart_details',JSON.stringify(cart_details));
    $('.simpleCart_total').html('$' + total_amount.toFixed(2));

    // showCartDetails
    var cart_details = JSON.parse(localStorage.getItem('cart_details'));
	   	var quantity = 0;
	   	var total_amount = 0;
	   	var delivery_charge = 10.00;
	   	var amount_with_delivery_charge = 0;
	   	if(!cart_details){
	        cart_details = [];
	    }else{
		   	console.log(cart_details)
		   	quantity = cart_details.quantity;
		   	total_amount = (cart_details.total_amount).toFixed(2);
		   	// amount_with_delivery_charge = parseFloat(total_amount) + parseFloat(10.00);
		   	console.log(amount_with_delivery_charge)
		   }

		   if(quantity != 0){
		   	delivery_charge = 10.00;
		   }else{
		   	delivery_charge = 0.00;
		   }

		   amount_with_delivery_charge = parseFloat(total_amount) + parseFloat(delivery_charge);
		   $('.price-details span.total1:last').html('$' + delivery_charge.toFixed(2));
		   $('.price-details span.total1:first').html('$' + parseFloat(total_amount).toFixed(2));
		   $('.cart-items h1.quantity').html('My Cart (' + quantity +')');
		   $('ul.total_price li:last span:last').html('$' + parseFloat(amount_with_delivery_charge).toFixed(2));

}

var getLocalStorageCartData = function(){
  var data = JSON.parse(localStorage.getItem('cart'));
        // var data = JSON.parse(document.cookie.item_details);
  ids = [];
	var quantity = 0;
	var total_amount = 0;
	if(!data){
	    cart_data = [];
	}else{
	    for (var i = 0; i < data.length; i++) {
	        quantity = data[i].qty + quantity;
	        total_amount = total_amount + (data[i].qty * data[i].price);
	        id = data[i].id;
	        ids.push(id);
	    }
	}

	var cart_details = {quantity: quantity, total_amount: total_amount, ids: ids}
    $('.simpleCart_empty').hide();
    $('.simpleCart_quantity').html(quantity);
     localStorage.setItem('cart_details',JSON.stringify(cart_details));
    $('.simpleCart_total').html('$' + total_amount.toFixed(2));
}

var addToCart = function(id, qty) {
    var cart = JSON.parse(localStorage.getItem('cart'));
    if (!cart) {
        cart = [];
    }
    var index = cart.findIndex(function (cartItem) {
        return cartItem.id === id;
    });
    if (index !== -1) {
        cart[index].qty = qty;
    }

    localStorage.setItem('cart',JSON.stringify(cart));

}