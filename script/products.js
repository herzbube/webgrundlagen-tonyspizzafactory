// --------------------------------------------------------------------------------
// Working principles of this script:
// - Determine type of data required by examining the HTML markup of the
//   document
// - Asynchronously fetch data
// - Once data has been fetched, iterate over each data item and generate
//   a corresponding block of HTML markup for the item
//
// Coding style notes:
// - There is error handling to handle network problems when fetching data.
//   This is required, obviously, because we cannot trust the network
//   infrastructure to work correcly all the time because that infrastructure
//   is not under our control.
// - However, there is no error handling whatsoever in regard to things that
//   ***ARE*** under our control. Notably ...
//   - We trust that the API delivers the right kind of data with the right
//     structure etc., because the API server is under our control.
//   - We trust that the structure of the document is correct, because the
//     document is served from a web server under our control.
//   - We trust that our own code in this script works correctly :-)
//   This is offensive programming by design! If someone in our organization
//   messes things up then we want to notice the problem ASAP, not cover it up!
// - ***ANY*** errors that occur due to our offensive programming will be
//   caught by the Promise and forwarded to the Promise's failure handler.
// --------------------------------------------------------------------------------

// --------------------------------------------------------------------------------
// Global constants
// --------------------------------------------------------------------------------

var RESOURCE_TYPE_PIZZA = 0;
var RESOURCE_TYPE_SALAD = 1;
var RESOURCE_TYPE_SOFTDRINK = 2;

var API_BASE_URL = "https://tonyspizzafactory.herokuapp.com/api/";
var API_URL_SUFFIX_PIZZA = "pizzas";
var API_URL_SUFFIX_SALAD = "salads";
var API_URL_SUFFIX_SOFTDRINK = "softdrinks";
var API_AUTHORIZATION_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.MQ.bYceSpllpyYQixgNzDt7dpCkEojdv3NKD-85XLXfdI4";

var ID_PIZZAS = "pizzas";
var ID_SALADS = "salads";
var ID_SOFTDRINKS = "soft-drinks";
var ID_PREFIX_PIZZA = "pizza-";
var ID_PREFIX_SALAD = "salad-";
var ID_PREFIX_SOFTDRINK = "soft-drink-";

// Class of the element that is the parent of all product blocks
var CLASS_MAIN_CONTENT = "main-content";
// Class of the div that terminates the product list
var CLASS_PRODUCT_EOL = "product-eol";
// The entire product
var CLASS_PRODUCT = "product";
// Specific product/resource types
var CLASS_PRODUCT_PIZZA = "pizza";
var CLASS_PRODUCT_SALAD = "salad";
var CLASS_PRODUCT_SOFTDRINK = "soft-drink";
// A single line in a product block
var CLASS_PRODUCT_LINE = "product-line";
// Specific line types
var CLASS_PRODUCT_IMAGE = "product-image";
var CLASS_PRODUCT_NAME = "product-name";
var CLASS_PRODUCT_PRICE = "product-price";
var CLASS_PRODUCT_INGREDIENTS = "product-ingredients";
// Helper class
var CLASS_PRODUCT_PRICEANDCART = "product-price-and-cart";
// Shopping cart classes
var CLASS_CART_LINE = "cart-line";
var CLASS_CART_LINE_PART1 = "cart-line-part1";
var CLASS_CART_LINE_PART2 = "cart-line-part2";
var CLASS_CART_IMAGE = "cart-image";
// Select classes
var CLASS_SELECT_SALADDRESSING = "salad-dressing";
var CLASS_SELECT_DRINKSIZE = "drink-size";

var CART_IMAGE_TITLEANDALT = "Place into shopping cart";
// cart by Alfa Design from the Noun Project
var CART_IMAGE_URL = "../image/noun_927435_cc.svg";

var SELECT_SIZE = 1;
var SELECT_NAME_SALADDRESSING = "salad-dressing";
var SELECT_NAME_DRINKSIZE = "drink-size";
var SELECT_TITLE_DRESSING = "Dressing";
var SELECT_TITLE_DRINKSIZE = "Drink size";
var SELECT_TEXT_DRESSING_ITALIAN = "Italian Dressing";
var SELECT_TEXT_DRESSING_FRENCH = "French Dressing";
var SELECT_TEXT_DRINKSIZE_25CL = "25cl";
var SELECT_TEXT_DRINKSIZE_50CL = "50cl";
var SELECT_TEXT_DRINKSIZE_100CL = "100cl";

var SHOPPING_CART_DATA_TYPE_PIZZA = "pizza";
var SHOPPING_CART_DATA_TYPE_SALAD = "salad";
var SHOPPING_CART_DATA_TYPE_SOFTDRINK = "softdrink";
var SHOPPING_CART_DATA_DRESSING_ITALIAN = "italian";
var SHOPPING_CART_DATA_DRESSING_FRENCH = "french";
var SHOPPING_CART_DATA_DRINKSIZE_25CL = "25";
var SHOPPING_CART_DATA_DRINKSIZE_50CL = "50";
var SHOPPING_CART_DATA_DRINKSIZE_100CL = "100";

// --------------------------------------------------------------------------------
// Script startup code
// --------------------------------------------------------------------------------

var completionHandler = generateHtmlMarkupFromJsonData;
var failureHandler = generateHtmlMarkupWithErrorMessage;
fetchProductDataAsync(completionHandler, failureHandler);

// --------------------------------------------------------------------------------
// Fetch data
// --------------------------------------------------------------------------------

function fetchProductDataAsync(completionHandler, failureHandler)
{
    var url = getApiUrl();

    getDataFromUrlAsync(url, API_AUTHORIZATION_TOKEN)
        .then(completionHandler)
        .catch(failureHandler);
}

function getApiUrl()
{
    var resourceType = getDocumentResourceType();

    var apiUrlSuffix = resourceType2ApiUrlSuffix(resourceType);
    var apiUrl = API_BASE_URL + apiUrlSuffix;

    return apiUrl;
}

// Generic function for asynchronous fetching of data. Can be reused in
// other programs.
//
// url is mandatory.
// authToken is optional.
//
// Returns a Promise.
function getDataFromUrlAsync(url, authToken)
{
    return new Promise(
        function(resolveHandler, rejectHandler)
        {
            var xhr = new XMLHttpRequest();

            var isAsyncRequest = true;
            xhr.open(
                "GET",
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
                            "Unable to fetch data from " + url +
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
                        "Unable to fetch data from " + url +
                        ". A network error occurred.";
                    rejectHandler(errorMessage);
                }
            );

            if (authToken !== null)
                xhr.setRequestHeader ("Authorization", authToken);

                // User cannot cancel the operation, so we can ignore the "abort"
            // event. Also we don't show any progress, so we can ignore the
            // "progress" event as well.

            xhr.send(null);
        }
    );
}

// --------------------------------------------------------------------------------
// Process product data & generate HTML markup
// --------------------------------------------------------------------------------

function generateHtmlMarkupFromJsonData(jsonData)
{
    var resourceType = getDocumentResourceType();
    var mainContentElement = getMainContentElement();

    var products = JSON.parse(jsonData);
    for (var indexOfProducts = 0; indexOfProducts < products.length; indexOfProducts++)
    {
        var product = products[indexOfProducts];

        generateHtmlMarkupForProduct(product, mainContentElement, resourceType);
    }

    generateHtmlMarkupForEol(mainContentElement);
}

function generateHtmlMarkupForProduct(product, parentElement, resourceType)
{
    // In the beginning some markup is the same for all resource types

    var productMainElement = generateProductMainElement(
        parentElement,
        product.id,
        resourceType);
    var productImageElement = generateProductImageElement(
        productMainElement,
        product.imageUrl,
        product.name);

    // From here on the markup is different for each resource type

    switch (resourceType)
    {
        case RESOURCE_TYPE_PIZZA:
            generateHtmlMarkupForPizza(product, productMainElement);
            break;
        case RESOURCE_TYPE_SALAD:
            generateHtmlMarkupForSalad(product, productMainElement);
            break;
        case RESOURCE_TYPE_SOFTDRINK:
            generateHtmlMarkupForSoftDrink(product, productMainElement);
            break;
        default:
            break;
    }
}

/*
    A pizza product block looks like this. Words in UPPERCASE refer to
    dynamic content.

    <div class="product pizza" id="pizza-PRODUCTID">
        <p class="product-image product-line">
            <img
                    class="product-image"
                    title="PRODUCTNAME"
                    alt="PRODUCTNAME"
                    src="IMAGEURL"
            />
        </p>
        <div class="cart-line product-line">
            <p class="product-name cart-line-part1">PRODUCTNAME</p>
            <p class="product-price-and-cart cart-line-part2">
                <span class="product-price">PRODUCTPRICE</span>
                <img
                        class="cart-image"
                        title="Place into shopping cart"
                        alt="Place into shopping cart"
                        src="IMAGEURL"
                />
            </p>
        </div>
        <p class="product-ingredients product-line">PRODUCTINGREDIENTS</p>
    </div>
 */
function generateHtmlMarkupForPizza(pizza, parentElement)
{
    var cartLineElement = generateCartLineElement(parentElement);

    var productNameElement = generateProductNameElement(cartLineElement, pizza.name);
    productNameElement.classList.add(CLASS_CART_LINE_PART1);

    var productPriceAndCartElement = generateProductPriceAndCartElement(cartLineElement, pizza.prize);

    var productIngredientsElement = generateProductIngredientsElement(parentElement, pizza.ingredients);
}

/*
    A salad product block looks like this. Words in UPPERCASE refer to
    dynamic content.

    <div class="product salad" id="salad-PRODUCTID">
        <p class="product-image product-line">
            <img
                    class="product-image"
                    title="PRODUCTNAME"
                    alt="PRODUCTNAME"
                    src="IMAGEURL"
            />
        </p>
        <p class="product-name product-line">PRODUCTNAME</p>
        <p class="product-ingredients product-line">PRODUCTINGREDIENTS</p>
        <div class="cart-line product-line">
            <select size="1" name="salad-dressing" title="Dressing" class="salad-dressing cart-line-part1">
                <option value="italian">Italian dressing</option>
                <option value="french">French dressing</option>
            </select>
            <p class="product-price-and-cart cart-line-part2">
                <span class="product-price">PRODUCTPRICE</span>
                <img
                        class="cart-image"
                        title="Place into shopping cart"
                        alt="Place into shopping cart"
                        src="IMAGEURL"
                />
            </p>
        </div>
    </div>
 */
function generateHtmlMarkupForSalad(salad, parentElement)
{
    var productNameElement = generateProductNameElement(parentElement, salad.name);
    productNameElement.classList.add(CLASS_PRODUCT_LINE);

    var productIngredientsElement = generateProductIngredientsElement(parentElement, salad.ingredients);

    var cartLineElement = generateCartLineElement(parentElement);

    var selectElement = generateSelectElement(cartLineElement, RESOURCE_TYPE_SALAD);

    var productPriceAndCartElement = generateProductPriceAndCartElement(cartLineElement, salad.prize);
}

/*
    A soft drink product block looks like this. Words in UPPERCASE refer to
    dynamic content.

    <div class="product soft-drink" id="softdrink-PRODUCTID">
        <p class="product-image product-line">
            <img
                    class="product-image"
                    title="PRODUCTNAME"
                    alt="PRODUCTNAME"
                    src="IMAGEURL"
            />
        </p>
        <p class="product-name product-line">PRODUCTNAME</p>
        <div class="cart-line product-line">
            <select size="1" name="drink-size" title="Drink size" class="drink-size cart-line-part1">
                <option value="25">25cl</option>
                <option value="50">50cl</option>
                <option value="100">100cl</option>
            </select>
            <p class="product-price-and-cart cart-line-part2">
                <span class="product-price">PRODUCTPRICE</span>
                <img
                        class="cart-image"
                        title="Place into shopping cart"
                        alt="Place into shopping cart"
                        src="IMAGEURL"
                />
            </p>
        </div>
    </div>
 */
function generateHtmlMarkupForSoftDrink(softDrink, parentElement)
{
    var productNameElement = generateProductNameElement(parentElement, softDrink.name);
    productNameElement.classList.add(CLASS_PRODUCT_LINE);

    var cartLineElement = generateCartLineElement(parentElement);

    var selectElement = generateSelectElement(cartLineElement, RESOURCE_TYPE_SOFTDRINK);

    var productPriceAndCartElement = generateProductPriceAndCartElement(cartLineElement, softDrink.prize);
}

function generateHtmlMarkupForEol(parentElement)
{
    var classNames = [CLASS_PRODUCT_EOL];

    var divElement = createElement("div", parentElement, classNames);
}

// --------------------------------------------------------------------------------
// Product-specific HTML markup generation
// --------------------------------------------------------------------------------

// Generates the main element that represents the entire product
function generateProductMainElement(parentElement, productId, resourceType)
{
    var productClass = resourceType2ProductClass(resourceType);
    var classNames = [CLASS_PRODUCT, productClass];

    var idPrefix = resourceType2IdPrefix(resourceType);
    var id = idPrefix + productId;

    var divElement = createElement(
        "div",
        parentElement,
        classNames,
        id);

    return divElement;
}

// Generates the main element for the product image and all of its contents
function generateProductImageElement(parentElement, imageUrl, productName)
{
    var classNamesMainElement = [CLASS_PRODUCT_IMAGE, CLASS_PRODUCT_LINE];
    var productImageElement = createElement(
        "p",
        parentElement,
        classNamesMainElement);

    var classNamesImgElement = [CLASS_PRODUCT_IMAGE];
    var productImageImgElement = createImgElement(
        productImageElement,
        imageUrl,
        productName,
        classNamesImgElement);

    return productImageElement;
}

// Generates the main element for the cart line, but WITHOUT content
// (content depends on resource type)
function generateCartLineElement(parentElement)
{
    var classNames = [CLASS_CART_LINE, CLASS_PRODUCT_LINE];

    var cartLineElement = createElement(
        "div",
        parentElement,
        classNames);

    return cartLineElement;
}

// Generates the element that displays the product name
function generateProductNameElement(parentElement, productName)
{
    var classNames = [CLASS_PRODUCT_NAME];

    var productNameElement = createElement(
        "p",
        parentElement,
        classNames);

    productNameElement.innerText = productName;

    return productNameElement;
}

// Generates the element that displays the product price and the shopping cart
// image
// Note: The product price includes the currency sign (e.g. "42$"), so it's
// not a number.
function generateProductPriceAndCartElement(parentElement, productPrice)
{
    var classNamesMainElement = [CLASS_PRODUCT_PRICEANDCART, CLASS_CART_LINE_PART2];
    var productPriceAndCartElement = createElement(
        "p",
        parentElement,
        classNamesMainElement);

    var classNamesSpanElement = [CLASS_PRODUCT_PRICE];
    var productPriceElement = createElement(
        "span",
        productPriceAndCartElement,
        classNamesSpanElement);
    productPriceElement.innerText = productPrice;

    var classNamesImgElement = [CLASS_CART_IMAGE];
    var cartImgElement = createImgElement(
        productPriceAndCartElement,
        CART_IMAGE_URL,
        CART_IMAGE_TITLEANDALT,
        classNamesImgElement);

    return productPriceAndCartElement;
}

// Generates the element that displays the product ingredients
function generateProductIngredientsElement(parentElement, productIngredients)
{
    // TODO: Add space character between ingredients

    var classNames = [CLASS_PRODUCT_INGREDIENTS, CLASS_PRODUCT_LINE];

    var productIngredientsElement = createElement(
        "p",
        parentElement,
        classNames);

    productIngredientsElement.innerText = productIngredients;

    return productIngredientsElement;
}

// Generates the element that displays the selection for either salad dressing
// or drink size. The specified resource type which one is generated.
function generateSelectElement(parentElement, resourceType)
{
    var size = SELECT_SIZE;
    var name = resourceType2SelectName(resourceType);
    var title = resourceType2SelectTitle(resourceType);
    var selectClass = resourceType2SelectClass(resourceType);
    var classNames = [selectClass, CLASS_CART_LINE_PART1];
    var optionsData = resourceType2OptionsData(resourceType);

    var selectElement = createSelectElement(parentElement, size, name, title, classNames);
    createOptionElements(selectElement, optionsData);
}

// --------------------------------------------------------------------------------
// Generic HTML markup generation
// --------------------------------------------------------------------------------

// Creates an "img" element that has the same value for the "title" and
// "alt" attributes.
function createImgElement(parentElement, imageUrl, titleAndAlt, classNames)
{
    var imgElement = createElement("img", parentElement, classNames);

    imgElement.setAttribute("src", imageUrl);
    imgElement.setAttribute("title", titleAndAlt);
    imgElement.setAttribute("alt", titleAndAlt);

    return imgElement;
}

// Creates a "select" element with specified values for the "size",
// "name" and "title" attributes.
function createSelectElement(parentElement, size, name, title, classNames)
{
    var selectElement = createElement("select", parentElement, classNames);

    selectElement.setAttribute("size", size);
    selectElement.setAttribute("name", name);
    selectElement.setAttribute("title", title);

    return selectElement;
}

// Creates a number of "option" elements with data from the specified
// optionsData array. The number of elements corresponds to the number
// of items in the array.
//
// Unlike the other create... functions this function does NOT return
// anything.
function createOptionElements(parentElement, optionsData)
{
    for (var indexOfOptionsData = 0; indexOfOptionsData < optionsData.length; indexOfOptionsData++)
    {
        var optionElement = createElement("option", parentElement);

        var optionData = optionsData[indexOfOptionsData];
        optionElement.setAttribute("value", optionData.value);
        optionElement.innerText = optionData.text;
    }
}

// Creates an element with the given name and adds it as the last child
// to the given parent element.
// Optionally specify an array of class names and/or a single ID. If present
// these are added to the "id" and "class" attributes of the new element.
function createElement(elementName, parentElement, classNames, id)
{
    var element = document.createElement(elementName);

    parentElement.appendChild(element);

    if (classNames !== undefined)
    {
        for (var indexOfClassNames = 0; indexOfClassNames < classNames.length; indexOfClassNames++)
        {
            var className = classNames[indexOfClassNames];
            element.classList.add(className);
        }
    }

    if (id !== undefined)
    {
        element.id = id;
    }

    return element;
}

// --------------------------------------------------------------------------------
// Error handling
// --------------------------------------------------------------------------------

function generateHtmlMarkupWithErrorMessage(errorMessage)
{
    var mainContentElement = getMainContentElement();

    var errorMessageElement = createElement("p", mainContentElement);

    errorMessageElement.innerText = errorMessage;
    errorMessageElement.style.color = "red";
}

// --------------------------------------------------------------------------------
// Helper functions
// --------------------------------------------------------------------------------

function getMainContentElement()
{
    var mainContentElements = document.getElementsByClassName(CLASS_MAIN_CONTENT);
    var mainContentElement = mainContentElements[0];
    return mainContentElement;
}

function getDocumentResourceType()
{
    var pizzasElement = document.getElementById(ID_PIZZAS);
    if (pizzasElement !== null)
        return RESOURCE_TYPE_PIZZA;

    var saladsElement = document.getElementById(ID_SALADS);
    if (saladsElement !== null)
        return RESOURCE_TYPE_SALAD;

    var softDrinksElement = document.getElementById(ID_SOFTDRINKS);
    if (softDrinksElement !== null)
        return RESOURCE_TYPE_SOFTDRINK;

    throw "Failed to determine resource type from document content";
}

function resourceType2ApiUrlSuffix(resourceType)
{
    switch (resourceType)
    {
        case RESOURCE_TYPE_PIZZA:
            return API_URL_SUFFIX_PIZZA;
        case RESOURCE_TYPE_SALAD:
            return API_URL_SUFFIX_SALAD;
        case RESOURCE_TYPE_SOFTDRINK:
            return API_URL_SUFFIX_SOFTDRINK;
        default:
            throw "resourceType2ApiUrlSuffix: Unknown resource type";
    }
}

function resourceType2ProductClass(resourceType)
{
    switch (resourceType)
    {
        case RESOURCE_TYPE_PIZZA:
            return CLASS_PRODUCT_PIZZA;
        case RESOURCE_TYPE_SALAD:
            return CLASS_PRODUCT_SALAD;
        case RESOURCE_TYPE_SOFTDRINK:
            return CLASS_PRODUCT_SOFTDRINK;
        default:
            throw "resourceType2ProductClass: Unknown resource type";
    }
}

function resourceType2IdPrefix(resourceType)
{
    switch (resourceType)
    {
        case RESOURCE_TYPE_PIZZA:
            return ID_PREFIX_PIZZA;
        case RESOURCE_TYPE_SALAD:
            return ID_PREFIX_SALAD;
        case RESOURCE_TYPE_SOFTDRINK:
            return ID_PREFIX_SOFTDRINK;
        default:
            throw "resourceType2IdPrefix: Unknown resource type";
    }
}

function resourceType2SelectName(resourceType)
{
    switch (resourceType)
    {
        case RESOURCE_TYPE_SALAD:
            return SELECT_NAME_SALADDRESSING;
        case RESOURCE_TYPE_SOFTDRINK:
            return SELECT_NAME_DRINKSIZE;
        default:
            throw "resourceType2SelectName: Unknown resource type";
    }
}

function resourceType2SelectTitle(resourceType)
{
    switch (resourceType)
    {
        case RESOURCE_TYPE_SALAD:
            return SELECT_TITLE_DRESSING;
        case RESOURCE_TYPE_SOFTDRINK:
            return SELECT_TITLE_DRINKSIZE;
        default:
            throw "resourceType2SelectTitle: Unknown resource type";
    }
}

function resourceType2SelectClass(resourceType)
{
    switch (resourceType)
    {
        case RESOURCE_TYPE_SALAD:
            return CLASS_SELECT_SALADDRESSING;
        case RESOURCE_TYPE_SOFTDRINK:
            return CLASS_SELECT_DRINKSIZE;
        default:
            throw "resourceType2SelectClass: Unknown resource type";
    }
}

function resourceType2OptionsData(resourceType)
{
    switch (resourceType)
    {
        case RESOURCE_TYPE_SALAD:
        {
            var optionsDataSalad =
                [
                    {
                        "value" : SHOPPING_CART_DATA_DRESSING_ITALIAN,
                        "text" : SELECT_TEXT_DRESSING_ITALIAN,
                    },
                    {
                        "value" : SHOPPING_CART_DATA_DRESSING_FRENCH,
                        "text" : SELECT_TEXT_DRESSING_FRENCH,
                    },
                ];
            return optionsDataSalad;
        }
        case RESOURCE_TYPE_SOFTDRINK:
        {
            var optionsDataSoftDrink =
            [
                {
                    "value" : SHOPPING_CART_DATA_DRINKSIZE_25CL,
                    "text" : SELECT_TEXT_DRINKSIZE_25CL,
                },
                {
                    "value" : SHOPPING_CART_DATA_DRINKSIZE_50CL,
                    "text" : SELECT_TEXT_DRINKSIZE_50CL,
                },
                {
                    "value" : SHOPPING_CART_DATA_DRINKSIZE_100CL,
                    "text" : SELECT_TEXT_DRINKSIZE_100CL,
                },
            ];
            return optionsDataSoftDrink;
        }
        default:
            throw "resourceType2OptionsData: Unknown resource type";
    }
}
