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
		   	debugger
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