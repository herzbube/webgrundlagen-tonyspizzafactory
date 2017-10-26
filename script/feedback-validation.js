// --------------------------------------------------------------------------------
// Working principles of this form validation script:
// - Perform initial validation of all input fields without error markup
//   if a field is not valid. We don't want to put off the user when he/she
//   opens the form for the first time. Initial validation only serves the
//   purpose of disabling/enabling the submit button
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

// Global variables
// Update these using the corresponding checkIf... functions
// The form is valid only if all these flags are true
var isPizzaRatingValid = false;
var isPriceRatingValid = false;
var isCustomerNameValid = false;
var isCustomerEmailValid = false;
var areSuggestionsValid = false;

addEventListeners();
checkAllInputFields();
updateForm();

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
}

function checkAllInputFields()
{
    // Variable names must be different from function names :-(
    isPizzaRatingValid = checkIfPizzaRatingIsValid();
    isPriceRatingValid = checkIfPriceRatingIsValid();
    isCustomerNameValid = checkIfCustomerNameIsValid();
    isCustomerEmailValid = checkIfCustomerEmailIsValid();
    areSuggestionsValid = checkIfSuggestionsAreValid();
}

// --------------------------------------------------------------------------------
// Form updating functions
// --------------------------------------------------------------------------------

function updateForm()
{
    var isFormValid = (
        isPizzaRatingValid &&
        isPriceRatingValid &&
        isCustomerNameValid &&
        isCustomerEmailValid &&
        areSuggestionsValid);

    updateSubmitButton(isFormValid);
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

function updateErrorMessage(isInputValueValid, inputTextFieldElement, errorMessageElementID, errorMessage)
{
    if (isInputValueValid)
    {
        inputTextFieldElement.style.borderColor = "black";
        hideErrorMessage(errorMessageElementID);
    }
    else
    {
        inputTextFieldElement.style.borderColor = "red";
        showErrorMessage(errorMessage, errorMessageElementID);
    }
}

function showErrorMessage(errorMessage, errorMessageElementID)
{
    var errorMessageElement = document.getElementById(errorMessageElementID);
    if (errorMessageElement === null)
        return;

    errorMessageElement.innerText = errorMessage;
    errorMessageElement.style.display = "block";
}

function hideErrorMessage(errorMessageElementID)
{
    var errorMessageElement = document.getElementById(errorMessageElementID);
    if (errorMessageElement === null)
        return;

    errorMessageElement.innerText = "";
    errorMessageElement.style.display = "none";
}

// --------------------------------------------------------------------------------
// validate... and checkIf... functions
// --------------------------------------------------------------------------------

function validatePizzaRating()
{
    isPizzaRatingValid = checkIfPizzaRatingIsValid();

    if (isPizzaRatingValid)
    {
        // TODO: Remove markup
    }
    else
    {
        // TODO: Add markup
    }

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

    if (isPriceRatingValid)
    {
        // TODO: Remove markup
    }
    else
    {
        // TODO: Add markup
    }

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

    updateErrorMessage(isCustomerNameValid, customerNameTextfield, errorMessageElementID, errorMessage);
    updateForm();
}

function checkIfCustomerNameIsValid()
{
    var customerNameTextfield = getCustomerNameTextfield();
    if (null === customerNameTextfield)
        return false;

    var customerName = customerNameTextfield.value.trim();
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

    updateErrorMessage(isCustomerEmailValid, customerEmailTextfield, errorMessageElementID, errorMessage);
    updateForm();
}

function checkIfCustomerEmailIsValid()
{
    var customerEmailTextfield = getCustomerEmailTextfield();
    if (null === customerEmailTextfield)
        return false;

    var customerEmail = customerEmailTextfield.value.trim();
    if (customerEmail.length === 0)
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

    updateErrorMessage(areSuggestionsValid, suggestionsTextfield, errorMessageElementID, errorMessage);
    updateForm();
}

function checkIfSuggestionsAreValid()
{
    var suggestionsTextfield = getSuggestionsTextfield();
    if (null === suggestionsTextfield)
        return false;

    var suggestions = suggestionsTextfield.value.trim();
    if (suggestions.length >= 50)
        return true;
    else
        return false;
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
