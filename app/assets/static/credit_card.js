$(function() {
    const data = $('script[data-iso-key="_0"]');
    const json = JSON.parse(data.text());
    Stripe.setPublishableKey(json.stripe_key);
});

$('#credit-card-form').on('submit', function(e){
    e.preventDefault();
    event.preventDefault();
    $('form-errors').hide();
    Stripe.card.createToken({
        name: $('#card-holder-name').val(),
        number: $('#card-number').val(),
        cvc: $('#cvv').val(),
        exp_month: $('#expiry-month').val(),
        exp_year: $('#expiry-year').val()
    }, stripeResponseHandler);
    $('#submit-btn').prop("disabled", true);
});

function stripeResponseHandler(status, response) {
    var $form = $('#credit-card-form');
    if (response.error) {
        $('#form-errors').show();
        $('#form-errors').html(response.error.message);
        $('#submit-btn').prop("disabled", false);
    } else {
        $form.append($('<input type="hidden" name="stripeToken" />').val(response.id));
        $form.get(0).submit();
    }
}
