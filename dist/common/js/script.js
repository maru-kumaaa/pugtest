$(function () {
 const head_h = $("header").outerHeight();
 $("header").next().css("margin-top", head_h);
});

$(function () {

 function modal(ttl, text) {
  $(".js-modal .modal_ttl").html(ttl);
  $(".js-modal .modal_txt").html(text);
  return;
 }

 $(".js-modal_open").on("click", function () {
  const ttl = $(this).find(".get_ttl").text();
  const text = $(this).find(".get_txt").text();
  modal(ttl, text)
  $(this).parent().next(".js-modal").fadeIn();
  return false;
 });

 $(".close").on("click", function () {
  $(this).closest(".js-modal").fadeOut();
 });
});