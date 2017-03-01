$(document).ready(function(){
    getLocalStorageCartData();
});

var getLocalStorageCartData = function(){
    var data = JSON.parse(localStorage.getItem('cart'));
        // var data = JSON.parse(document.cookie.item_details);
        var quantity = 0;
        var total_amount = 0;
        if(!data){
            cart_data = [];
        }else{
            for (var i = 0; i < data.length; i++) {
                quantity = data[i].qty + quantity;
                total_amount = total_amount + (data[i].qty * data[i].price)
                console.log(quantity);
                console.log(total_amount);
            }
        }
        $('.simpleCart_empty').hide();
        $('.simpleCart_quantity').html(quantity);
        $('.simpleCart_total').html('$' + total_amount.toFixed(2))

}