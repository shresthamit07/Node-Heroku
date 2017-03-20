$(document).ready(function(){
    // localStorage.clear();

    $(".item_add").on('click', function (event) {
                $('div.message_div').hide();
                event.preventDefault();
                var data = $(this).data('itemdetails');
                console.log(data.id);
                addToCart(data.id, data);
                var cart = JSON.parse(localStorage.getItem('cart'));
                var post_data = localStorage.getItem('cart');
                console.log(typeof post_data);
                console.log(cart);
                // var data = {};
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:3000/products/add_to_cart',
                    data: {data: post_data},
                    dataType: 'application/json',
                    // dataType: 'json',
                    success: function(data) {
                        console.log('success');
                        getLocalStorageCartData();
                        console.log(data);
                    },
                    error: function(e){
                        $('div.message_div').show();
                        $('div.message_div').html('Item added successfully to your cart.').css({
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
                        getLocalStorageCartData();
                        console.log(e);
                    }
                });
            });


// // working code
//     $(".item_add").click(function () {
//     console.log('clicked');
//     var data = $(this).data('itemdetails');
//     console.log(data.id);
//     addToCart(data.id, data);
//     getLocalStorageCartData();
    //end 0f working code
// });

var addToCart = function(id, item) {
    var cart = JSON.parse(localStorage.getItem('cart'));
    if (!cart) {
        cart = [];
    }
    var index = cart.findIndex(function (cartItem) {
        return cartItem.id === item.id;
    });
    if (index !== -1) {
        cart[index].qty += 1;
    } else {
        cart.push({
            id: item.id,
            name : item.name,
            category: item.category,
            price : item.price,
            qty : 1,
            image: item.image,
            volume: item.size
        });
    }

    localStorage.setItem('cart',JSON.stringify(cart));

}

var getLocalStorageCartData = function(){
    var data = JSON.parse(localStorage.getItem('cart'));
        // var data = JSON.parse(document.cookie.item_details)
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
        localStorage.setItem('cart_details',JSON.stringify(cart_details));
        $('.simpleCart_empty').hide();
        $('.simpleCart_quantity').html(quantity);
        $('.simpleCart_total').html('$' + total_amount.toFixed(2));

}

});