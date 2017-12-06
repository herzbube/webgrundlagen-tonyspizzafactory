// --------------------------------------------------------------------------------
// Working principles of this form validation script:
// - Perform no initial validation - we don't want to put off the user when
//   he/she opens the form for the first time.
// - The "Submit" button is initially enabled. If the user clicks the button
//   or submits the form in any other way, a full validation cycle is
//   executed. All input controls that have invalid values are immediately
//   marked up.
// - Perform validation for radio buttons when the "change" event occurs
// - Perform validation for text input controls when the "blur" event occurs
//   (this is the traditional event name when a control loses focus)
// - The checkIf... functions perform value checking only. They return true
//   if the value of the corresponding input control is valid, false if not.
//   Notably the checkIf... functions do not do error markup and they do
//   not update the submit button.
// - The validate... functions invoke their corresponding checkIf... function
//   in order to check whether the validity of the corresponding input control
//   has changed. If no, then the validate... functions do nothing. If yes,
//   the validate... functions add or remove error markup and update the submit
//   button.
// - Functions communicate with each other via a set of global variables
//   (is...Valid, are...Valid).
// --------------------------------------------------------------------------------

// --------------------------------------------------------------------------------
// Global variables and constants
// --------------------------------------------------------------------------------

// Update these using the corresponding checkIf... functions
// The form is valid only if all these flags are true
var isPizzaRatingValid = false;
var isPriceRatingValid = false;
var isCustomerNameValid = false;
var isCustomerEmailValid = false;
var areSuggestionsValid = false;

// Constants
var API_POST_URL = "https://tonyspizzafactory.herokuapp.com/api/feedback";
var API_CONTENT_TYPE = "application/json; charset=utf-8"
var API_AUTHORIZATION_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.MQ.bYceSpllpyYQixgNzDt7dpCkEojdv3NKD-85XLXfdI4";

// --------------------------------------------------------------------------------
// Script startup code
// --------------------------------------------------------------------------------

addEventListeners();

// --------------------------------------------------------------------------------
// Initializing functions
// --------------------------------------------------------------------------------

function addEventListeners()
{
    var pizzaRatingRadioButtons = getPizzaRatingRadioButtons();
    for (var indexOfPizzaRatingRadioButtons = 0;
         indexOfPizzaRatingRadioButtons < pizzaRatingRadioButtons.length;
         indexOfPizzaRatingRadioButtons++)
    {
        var pizzaRatingRadioButton = pizzaRatingRadioButtons[indexOfPizzaRatingRadioButtons];
        // The blur event does not fire for radio buttons
        pizzaRatingRadioButton.addEventListener("change", validatePizzaRating);
    }

    var priceRatingRadioButtons = getPriceRatingRadioButtons();
    for (var indexOfPriceRatingRadioButtons = 0;
         indexOfPriceRatingRadioButtons < priceRatingRadioButtons.length;
         indexOfPriceRatingRadioButtons++)
    {
        var priceRatingRadioButton = priceRatingRadioButtons[indexOfPriceRatingRadioButtons];
        // The blur event does not fire for radio buttons
        priceRatingRadioButton.addEventListener("change", validatePriceRating);
    }

    var customerNameTextfield = getCustomerNameTextfield();
    if (customerNameTextfield !== null)
    {
        customerNameTextfield.addEventListener("blur", validateCustomerName);
    }

    var customerEmailTextfield = getCustomerEmailTextfield();
    if (customerEmailTextfield !== null)
    {
        customerEmailTextfield.addEventListener("blur", validateCustomerEmail);
    }

    var suggestionsTextfield = getSuggestionsTextfield();
    if (suggestionsTextfield !== null)
    {
        suggestionsTextfield.addEventListener("blur", validateSuggestions);
    }

    var feedbackForm = getFeedbackForm();
    if (feedbackForm !== null)
    {
        // Directly listening to the form's submit event makes us independent
        // from how the form was submitted. The typical way is that the user
        // clicks the submit button, but there may be other methods as well.
        feedbackForm.addEventListener("submit", onFeedbackFormSubmitted);
    }
}

// --------------------------------------------------------------------------------
// Feedback form functions
// --------------------------------------------------------------------------------

function onFeedbackFormSubmitted(event)
{
    // Always prevent the submit event. If the form data is invalid we don't
    // want the submission to take place. But even if the form data is valid,
    // we are going to submit the data ourselves.
    event.preventDefault();

    validateAllInputFields();
    updateForm();

    // Variable names must be different from function names :-(
    var isFormValidResult = isFormValid();
    if (! isFormValidResult)
        return;

    submitFormData()
}

// --------------------------------------------------------------------------------
// Form updating functions
// --------------------------------------------------------------------------------

function updateForm()
{
    // Variable names must be different from function names :-(
    var isFormValidResult = isFormValid();
    updateSubmitButton(isFormValidResult);
}

function updateSubmitButton(isFormValid)
{
    var submitButton = getSubmitButton();
    if (null === submitButton)
        return;

    if (isFormValid)
        submitButton.disabled = false;
    else
        submitButton.disabled = true;
}

function updateErrorMessageTextField(isInputValueValid, inputTextFieldElement, errorMessageElementID, errorMessage)
{
    if (isInputValueValid)
        inputTextFieldElement.style.borderColor = "black";
    else
        inputTextFieldElement.style.borderColor = "red";

    updateErrorMessage(isInputValueValid, errorMessageElementID, errorMessage);
}

function updateErrorMessage(isInputValueValid, errorMessageElementID, errorMessage)
{
    if (isInputValueValid)
        hideErrorMessage(errorMessageElementID);
    else
        showErrorMessage(errorMessage, errorMessageElementID);
}

function showErrorMessage(errorMessage, errorMessageElementID)
{
    var errorMessageElement = document.getElementById(errorMessageElementID);
    if (null === errorMessageElement)
        return;

    errorMessageElement.innerText = errorMessage;
    errorMessageElement.style.display = "block";
}

function hideErrorMessage(errorMessageElementID)
{
    var errorMessageElement = document.getElementById(errorMessageElementID);
    if (null === errorMessageElement)
        return;

    errorMessageElement.innerText = "";
    errorMessageElement.style.display = "none";
}

// --------------------------------------------------------------------------------
// validate... and checkIf... functions
// --------------------------------------------------------------------------------

// Both checks and form updates
function validateAllInputFields()
{
    validatePizzaRating();
    validatePriceRating();
    validateCustomerName();
    validateCustomerEmail();
    validateSuggestions();
}

// Only checks, no form updates
function checkAllInputFields()
{
    // Variable names must be different from function names :-(
    isPizzaRatingValid = checkIfPizzaRatingIsValid();
    isPriceRatingValid = checkIfPriceRatingIsValid();
    isCustomerNameValid = checkIfCustomerNameIsValid();
    isCustomerEmailValid = checkIfCustomerEmailIsValid();
    areSuggestionsValid = checkIfSuggestionsAreValid();
}

function validatePizzaRating()
{
    isPizzaRatingValid = checkIfPizzaRatingIsValid();
    var errorMessageElementID = "rating-pizzas-error-message";
    var errorMessage = "Please select a rating for our pizzas";

    updateErrorMessage(isPizzaRatingValid, errorMessageElementID, errorMessage);
    updateForm();
}

function checkIfPizzaRatingIsValid()
{
    var pizzaRatingRadioButtons = getPizzaRatingRadioButtons();
    // The pizza rating is valid as soon as one of the radio buttons is checked
    return isAnyRadioButtonChecked(pizzaRatingRadioButtons);
}

function validatePriceRating()
{
    isPriceRatingValid = checkIfPriceRatingIsValid();
    var errorMessageElementID = "rating-prices-error-message";
    var errorMessage = "Please select a rating for our prices";

    updateErrorMessage(isPriceRatingValid, errorMessageElementID, errorMessage);
    updateForm();
}

function checkIfPriceRatingIsValid()
{
    var priceRatingRadioButtons = getPriceRatingRadioButtons();
    // The price rating is valid as soon as one of the radio buttons is checked
    return isAnyRadioButtonChecked(priceRatingRadioButtons);
}

function validateCustomerName()
{
    isCustomerNameValid = checkIfCustomerNameIsValid();
    var customerNameTextfield = getCustomerNameTextfield();
    var errorMessageElementID = "customer-name-error-message";
    var errorMessage = "Please enter your name";

    updateErrorMessageTextField(isCustomerNameValid, customerNameTextfield, errorMessageElementID, errorMessage);
    updateForm();
}

function checkIfCustomerNameIsValid()
{
    var customerName = getCustomerName();

    if (customerName.length > 0)
        return true;
    else
        return false;
}

function validateCustomerEmail()
{
    isCustomerEmailValid = checkIfCustomerEmailIsValid();
    var customerEmailTextfield = getCustomerEmailTextfield();
    var errorMessageElementID = "customer-email-error-message";
    var errorMessage = "'" + customerEmailTextfield.value + "' is not a valid e-mail address";

    updateErrorMessageTextField(isCustomerEmailValid, customerEmailTextfield, errorMessageElementID, errorMessage);
    updateForm();
}

function checkIfCustomerEmailIsValid()
{
    var customerEmail = getCustomerEmail();

    if (0 === customerEmail.length)
        return false;

    // Rules enforced by this regex:
    // - The email address must have exactly one "@" character
    // - There must be at least 1 character before the "@" character
    // - The domain name must use at least one sub-domain, i.e. a
    //   top-level domain only is considered invalid. Examples:
    //   foo@bar is invalid, foo@bar.baz is valid.
    //
    // This regex does not check the following:
    // - Whether the email address contains any illegal characters
    // - Whether the email address actually works
    //
    // Also, this regex will pronounce various exotic email addresses
    // invalid although, according to some RFCs, they might be legal.
    var simpleEmailRegex = /^[^@]+@[^@.]+\.[^@]+/;
    var regexMatchesCustomerEmail = simpleEmailRegex.test(customerEmail);
    if (regexMatchesCustomerEmail)
        return true;
    else
        return false;
}

function validateSuggestions()
{
    areSuggestionsValid = checkIfSuggestionsAreValid();
    var suggestionsTextfield = getSuggestionsTextfield();
    var errorMessageElementID = "suggestions-error-message";
    var errorMessage = "Please enter at least 50 characters";

    updateErrorMessageTextField(areSuggestionsValid, suggestionsTextfield, errorMessageElementID, errorMessage);
    updateForm();
}

function checkIfSuggestionsAreValid()
{
    var suggestions = getSuggestionsValue();

    if (suggestions.length >= 50)
        return true;
    else
        return false;
}

// --------------------------------------------------------------------------------
// Form submission functions
// --------------------------------------------------------------------------------

function submitFormData()
{
    var pizzaRating = getPizzaRating();
    var priceRating = getPriceRating();
    var customerName = getCustomerName();
    var customerEmail = getCustomerEmail();
    var suggestions = getSuggestionsValue();

    var formData =
    {
        "pizzaRating": pizzaRating,
        "prizeRating": priceRating,
        "name": customerName,
        "email": customerEmail,
        "feedback": suggestions,
    }

    var url = API_POST_URL;
    var jsonData = JSON.stringify(formData);
    var contentType = API_CONTENT_TYPE;
    var authToken = API_AUTHORIZATION_TOKEN;

    postDataToUrlAsync(url, jsonData, contentType, authToken)
        .then(postDataSuccessful)
        .catch(postDataFailed);
}

function postDataSuccessful(responseText)
{
    var alertSuccessElement = getAlertSuccessElement();

    alertSuccessElement.innerText = "Thank you for taking the time to give us your feedback.";

    alertSuccessElement.style.display = "block";
}
function postDataFailed(errorMessage)
{
    var alertErrorElement = getAlertErrorElement();

    alertErrorElement.innerHTML =
        "Oops! Something went wrong, your feedback could not be submitted to our server. " +
        "Here's the technical error message: <br/><br/>" + errorMessage;

    alertErrorElement.style.display = "block";
}

// Generic function for asynchronous posting of data. Can be reused in
// other programs.
//
// url, data and contentType are mandatory.
// authToken is optional.
//
// Returns a Promise.
function postDataToUrlAsync(url, data, contentType, authToken)
{
    return new Promise(
        function(resolveHandler, rejectHandler)
        {
            var xhr = new XMLHttpRequest();

            var isAsyncRequest = true;
            xhr.open(
                "POST",
                url,
                isAsyncRequest);

            xhr.addEventListener(
                "load",
                function()
                {
                    if (xhr.status >= 200 && xhr.status <= 299)
                    {
                        resolveHandler(xhr.responseText);
                    }
                    else
                    {
                        var errorMessage =
                            "Unable to post data to " + url +
                            ". Request status code = " + xhr.status +
                            ", status text = " + xhr.statusText;
                        rejectHandler(errorMessage);
                    }
                }
            );

            xhr.addEventListener(
                "error",
                function()
                {
                    var errorMessage =
                        "Unable to post data to " + url +
                        ". A network error occurred.";
                    rejectHandler(errorMessage);
                }
            );

            xhr.setRequestHeader("content-type", contentType);

            if (authToken !== null)
                xhr.setRequestHeader ("Authorization", authToken);

            // User cannot cancel the operation, so we can ignore the "abort"
            // event. Also we don't show any progress, so we can ignore the
            // "progress" event as well.

            xhr.send(data);
        }
    );
}

// --------------------------------------------------------------------------------
// Form data getter functions
// --------------------------------------------------------------------------------

function getPizzaRating()
{
    var pizzaRatingRadioButtons = getPizzaRatingRadioButtons();

    var pizzaRating = getValueOfCheckedRadioButton(pizzaRatingRadioButtons);

    // Return the value from the HTML markup without any changes
    return pizzaRating;
}

function getPriceRating()
{
    var priceRatingRadioButtons = getPriceRatingRadioButtons();

    var priceRating = getValueOfCheckedRadioButton(priceRatingRadioButtons);

    // Return the value from the HTML markup without any changes
    return priceRating;
}

function getCustomerName()
{
    var customerNameTextfield = getCustomerNameTextfield();
    var customerName = customerNameTextfield.value;

    var customerNameTrimmed = customerName.trim();

    return customerNameTrimmed;
}

function getCustomerEmail()
{
    var customerEmailTextfield = getCustomerEmailTextfield();
    var customerEmail = customerEmailTextfield.value;

    var customerEmailTrimmed = customerEmail.trim();

    return customerEmailTrimmed;
}

function getSuggestionsValue()
{
    var suggestionsTextfield = getSuggestionsTextfield();
    var suggestions = suggestionsTextfield.value;

    var suggestionsTrimmed = suggestions.trim();

    return suggestionsTrimmed;
}

// --------------------------------------------------------------------------------
// HTML element getter functions
// --------------------------------------------------------------------------------
function getPizzaRatingRadioButtons()
{
    return document.querySelectorAll("input[name=\"rating-pizzas\"]");
}

function getPriceRatingRadioButtons()
{
    return document.querySelectorAll("input[name=\"rating-prices\"]");
}

function getCustomerNameTextfield()
{
    return document.getElementById("customer-name");
}

function getCustomerEmailTextfield()
{
    return document.getElementById("customer-email");
}

function getSuggestionsTextfield()
{
    return document.getElementById("suggestions");
}

function getSubmitButton()
{
    var submitButtons = document.querySelectorAll("input[type=\"submit\"]");
    if (submitButtons.length >= 1)
        return submitButtons[0];
    else
        return null;
}

function getFeedbackForm()
{
    if (document.forms.length > 0)
        return document.forms[0];
    else
        return null;
}

function getAlertSuccessElement()
{
    return document.getElementsByClassName("alert-success")[0];
}

function getAlertErrorElement()
{
    return document.getElementsByClassName("alert-error")[0];
}

// --------------------------------------------------------------------------------
// Helper functions
// --------------------------------------------------------------------------------

function isAnyRadioButtonChecked(radioButtonsArray)
{
    for (var indexOfRadioButtonsArray = 0;
         indexOfRadioButtonsArray < radioButtonsArray.length;
         indexOfRadioButtonsArray++)
    {
        var radioButton = radioButtonsArray[indexOfRadioButtonsArray];
        if (radioButton.checked)
            return true;
    }

    return false;
}

function getValueOfCheckedRadioButton(radioButtonsArray)
{
    for (var indexOfRadioButtonsArray = 0;
         indexOfRadioButtonsArray < radioButtonsArray.length;
         indexOfRadioButtonsArray++)
    {
        var radioButton = radioButtonsArray[indexOfRadioButtonsArray];
        if (radioButton.checked)
            return radioButton.value;
    }

    return false;
}

function isFormValid()
{
    if (! isPizzaRatingValid)
        return false;
    else if (! isPriceRatingValid)
        return false;
    else if (! isCustomerNameValid)
        return false;
    else if (! isCustomerEmailValid)
        return false;
    else if (! areSuggestionsValid)
        return false;
    else
        return true;
}
