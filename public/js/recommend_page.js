$(document).ready(function(){
	$('.actual_products').slick({
	  infinite: true,
	  slidesToShow: 4,
	  slidesToScroll: 4,
	  arrows: true
	});
	
	$('.recommend_products').slick({
		slidesToShow: 4,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 2000,
		arrows: true
	});

	$('.recommend_products_vertical').slick({
		slidesToShow: 2,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 2000,
		arrows: true,
		vertical: true
	});
	$('.test_vertical').slick({
		// slidesToShow: 2,
		// slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 2000,
		arrows: true,
		vertical: true
	});
});