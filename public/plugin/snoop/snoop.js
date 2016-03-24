$(function () {
    var asin = $('#ASIN').val();
    if (asin == undefined)
        return;
    snoop.initialize(asin);
});

var queryString = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
};

//Various currencies' rates to EUR
window.Rates = {
    timestamp: new Date(),
    'EUR': 1,
    'USD': 0,
    'JPY': 0,
    'BGN': 0,
    'CZK': 0,
    'DKK': 0,
    'GBP': 0,
    'HUF': 0,
    'LTL': 0,
    'LVL': 0,
    'PLN': 0,
    'RON': 0,
    'SEK': 0,
    'CHF': 0,
    'NOK': 0,
    'HRK': 0,
    'RUB': 0,
    'TRY': 0,
    'AUD': 0,
    'BRL': 0,
    'CAD': 0,
    'CNY': 0,
    'HKD': 0,
    'IDR': 0,
    'ILS': 0,
    'INR': 0,
    'KRW': 0,
    'MXN': 0,
    'MYR': 0,
    'NZD': 0,
    'PHP': 0,
    'SGD': 0,
    'THB': 0,
    'ZAR': 0
};
function refreshRates() {
    var cachedRates = JSON.parse(localStorage.getItem("conversionRates"));
    //console.log(cachedRates);
    if (cachedRates != null && cachedRates.timestamp != undefined) {
        cachedRates.timestamp = new Date(cachedRates.timestamp);
        Rates = cachedRates;
        var ageInHours = (new Date() - cachedRates.timestamp) / 1000 / 60 / 60;
        if (ageInHours < 7)
            return;
    }
    //console.log('Refreshing conversion rates...');
    $.get('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', function (result) {
        var $document = $(result);
        for (var rate in Rates) {
            if (typeof rate !== 'string' || rate === 'EUR')
                continue;
            Rates[rate] = parseFloat($document.find('Cube[currency="' + rate + '"]').attr('rate'));
        }
        Rates.timestamp = new Date();
        localStorage["conversionRates"] = JSON.stringify(Rates);
    });
}

var Money = function (amount, currency, culture, extraAmount) {
    this.amount = amount;
    this.extraAmount = extraAmount;
    this.currency = currency;
    this.culture = culture;
    //console.log('Money', this);
};
Money.prototype.for = function (currency, culture) {
    var rate = Rates[currency] / Rates[this.currency];
    var convertedAmount = this.amount * rate;
    var convertedExtraAmount = this.extraAmount !== undefined ? this.extraAmount * rate : undefined;
    //console.log('Conversion\n', this.currency, '->', currency, 
    //  '\n', Rates[this.currency], '->', Rates[currency], 
    //  '\n', this.amount, '->', convertedAmount);
    return new Money(convertedAmount, currency, culture, convertedExtraAmount);
};
Money.prototype.toString = function () {
    //console.log(this.amount, this.culture, Globalize.format(this.amount, "c", this.culture));
    if (this.extraAmount === undefined)
        return Globalize.format(this.amount, "c", this.culture);
    else
        return Globalize.format(this.amount, "c", this.culture) + ' - ' + Globalize.format(this.extraAmount, "c", this.culture);
};

var Shop = function (id, title, domain, base_url, currency, culture) {
    this.id = id;
    this.title = title;
    this.domain = domain;
    this.base_url = base_url;
    this.url = this.base_url;
    this.currency = currency;
    this.culture = culture;
    this.setAsin = function (asin) {
        this.url = this.urlFor(asin);
    };
    this.urlFor = function (asin) {
        return this.base_url.replace('{asin}', asin);
    };
    this.moneyFrom = function (amount) {
        //console.log(amount);
        var culture = this.culture;
        if (amount.indexOf('-') == -1) {
            var sanitizedAmount = Globalize.parseFloat(amount.replace(/[^\d^,^.]/g, ''), culture);
            return new Money(sanitizedAmount, this.currency, culture);
        }
        var sanitizedAmounts = amount.split('-').map(function (a) {
            return Globalize.parseFloat(a.replace(/[^\d^,^.]/g, ''), culture);
        });
        //console.log(sanitizedAmounts);
        return new Money(sanitizedAmounts[0], this.currency, culture, sanitizedAmounts[1]);
    };
};

var Settings = function (asin) {
    this.asin = asin;
    this.shops = [
        new Shop(1, 'amazon.co.uk', 'www.amazon.co.uk', 'http://www.amazon.co.uk/dp/{asin}?', 'GBP', 'en-GB'),
        new Shop(2, 'amazon.de', 'www.amazon.de', 'http://www.amazon.de/dp/{asin}?', 'EUR', 'de'),
        new Shop(3, 'amazon.fr', 'www.amazon.fr', 'http://www.amazon.fr/dp/{asin}?', 'EUR', 'fr'),
        new Shop(5, 'amazon.it', 'www.amazon.it', 'http://www.amazon.it/dp/{asin}?', 'EUR', 'it'),
        new Shop(4, 'amazon.es', 'www.amazon.es', 'http://www.amazon.es/dp/{asin}?', 'EUR', 'es')
    ];
    this.shops.forEach(function (shop) {
        shop.setAsin(asin);
    });
    this.desiredCurrency = 'EUR'; //TODO: de inlocuit
    this.desiredCulture = 'de';
    //this.desiredCurrency = 'RON';    //TODO: de inlocuit
    //this.desiredCulture = 'ro';
    this.currentShop = this.shops.filter(function (shop) {
        return shop.domain == document.domain;
    })[0];
    if (this.currentShop.currency != this.desiredCurrency) {
        this.filteredShops = this.shops;
    }
    else {
        this.filteredShops = this.shops.filter(function (shop) {
            return shop.domain != document.domain;
        });
    }
    this.shop = function (id) {
        var shopById = this.shops.filter(function (shop) {
            return shop.id == id;
        });
        if (shopById.length == 1)
            return shopById[0];
        return null;
    };
    this.image = function (file) {
        return chrome.extension.getURL('/images/' + file);
    };
};



var pageScraper = {
    warning: {
        networkError: 'Network error',
        unavailable: 'Unavailable',
        notFound: 'Not found',
        multipleOptions: 'Multiple options'
    },
    getPriceOn: function (shop, displayPrice, displayWarning) {
        var serverUrl = shop.url;
        $.get(serverUrl).success(function (data) {
            var regex = /[nb]\s*?id="priceblock_[\w]*?price".*?>(.*?)</img; //partea cu [nb] captureaza span sau b
            var price = regex.exec(data);
            if (price == null || price.length != 2) {
                displayWarning(pageScraper.warning.unavailable, false);
                return;
            }
            displayPrice(price[1]);
        }).error(function (data) {
            if (data.status == 404)
                displayWarning(pageScraper.warning.notFound, true);
            else
                displayWarning(pageScraper.warnings.networkError, false);
        });
    }
};

var tooltip = {
    _mouseIsOnIcon: false,
    _mouseIsOnTooltip: false,
    registerShowHideHandlers: function () {
        this._genericRegisterShowHideHandlers($('.snoop-tooltip'), function (on) {
            tooltip._mouseIsOnTooltip = on;
        });
        this._genericRegisterShowHideHandlers($('#snoop-icon'), function (on) {
            tooltip._mouseIsOnIcon = on;
        });
    },
    _genericRegisterShowHideHandlers: function ($selector, isOn) {
        $selector.mouseenter(function () {
            $('.snoop-tooltip').show();
            isOn(true);
        }).mouseleave(function () {
            isOn(false);
            setTimeout(function () {
                if (!tooltip._mouseIsOnIcon && !tooltip._mouseIsOnTooltip)
                    $('.snoop-tooltip').hide();
            }, 100);
        });
    }
};

var page = {
    addTooltipToPage: function (tooltipMarkup) {
        var $placeholderMarkup = $('<img id="snoop-placeholder" src="' + settings.image('placeholder.png') + '" alt="Placeholder" />');
        var $imageMarkup = $('<img id="snoop-icon" src="' + settings.image('icon.png') + '" alt="Hover to see the prices of the other stores" />');
        var $container = this.findAppropriateTooltipContainer();
        $container.append($imageMarkup);
        $container.append(tooltipMarkup);
        tooltip.registerShowHideHandlers();
    },
    findAppropriateTooltipContainer: function () {
        var $tries = [
            $('table.product .priceLarge:first', $('#priceBlock')),
            $('#priceblock_ourprice'),
            $('#priceblock_saleprice'),
            $('#availability_feature_div > #availability > .a-color-price'),
            $('div.buying span.availGreen', $('#handleBuy')),
            $('div.buying span.availRed:nth-child(2)', $('#handleBuy'))
        ];
        for (var i = 0; i < $tries.length; i++) {
            if ($tries[i].length > 0)
                return $tries[i];
        }
        throw new Error('Unable to find the price section.');
    },
    displayPrice: function ($shopInfo, price) {
        var convertedPrice = price.for(settings.desiredCurrency, settings.desiredCulture);
        $shopInfo.text(convertedPrice.toString());
    },
    displayWarning: function ($shopInfo, warning, addNotFoundClass) {
        $shopInfo.text(warning).addClass('snoop-warning');
        if (addNotFoundClass)
            $shopInfo.parent().addClass('snoop-not-found');
    },
    addOptionalBackLink: function () {
        var from = queryString('snoop-from');
        var asin = queryString('snoop-from-asin');
        if (from == '' || asin == '')
            return;
        var shop = settings.shop(from);
        if (shop == null)
            return;
        //$('h1.parseasinTitle').append(
        //$('#btAsinTitle').append(
        $('form#handleBuy').prepend('<span class="back-link"> <img src="' + settings.image('return.png') + '" /> <a href="' + shop.urlFor(asin) + '"  >return to ' + shop.title + '</a> </span>');
        //$('form#handleBuy > table:last tr:last').prepend(
    },
    registerInitializationHandler: function (shops) {
        $('#snoop-icon').mouseover(function () {
            if (window.snoop_tooltipInitialized != undefined && window.snoop_tooltipInitialized != false)
                return;
            window.snoop_tooltipInitialized = true;
            $.each(shops, function (index, shop) {
                var $shopInfo = $('#snoop-shop-' + shop.id);
                pageScraper.getPriceOn(shop, function (price) {
                    page.displayPrice($shopInfo, shop.moneyFrom(price));
                }, function (warning, addNotFoundClass) {
                    page.displayWarning($shopInfo, warning, addNotFoundClass);
                });
            });
        });
    }
};

var settings;
var snoop = {
    tooltip: null,
    asin: null,
    _startMonitoringAsin: function () {
        var observer = new MutationObserver(function (mutations) {
            var asinHasProbablyChanged = mutations.some(function (mutation) {
                return mutation.addedNodes.length > 0;
            });
            if (!asinHasProbablyChanged)
                return;
            var newAsin = $('#ASIN').val(); //nu pot sa fac cache la asin, pentru ca se inlocuieste intregul form, nu elementele individuale, si se pierd referintele
            if (snoop.asin == newAsin)
                return;
            snoop.run(newAsin);
        });
        observer.observe($('#buybox_feature_div')[0], { attributes: true, subtree: true, childList: true, characterData: true });
    },
    initialize: function (asin) {
        this.asin = asin;
        this._startMonitoringAsin();
        refreshRates();
        settings = new Settings(asin);
        page.addOptionalBackLink();
        $.get(chrome.extension.getURL("tooltip.html"), function (tooltipTemplate) {
            snoop.tooltip = Mustache.to_html(tooltipTemplate, {
                shops: settings.filteredShops,
                from_shop: settings.currentShop.id,
                from_asin: settings.asin,
                loader_url: chrome.extension.getURL('/images/loader.gif')
            });
            snoop.run(asin);
        }, 'html');
    },
    run: function (asin) {
        this.asin = asin;
        settings = new Settings(asin);
        window.snoop_tooltipInitialized = false;
        var ensureTooltipHasBeenLoaded = function () {
            if (snoop.tooltip == null) {
                setTimeout(ensureTooltipHasBeenLoaded, 50);
            }
            else {
                var tooltipMarkup = snoop.tooltip.replace(/{asin}/gm, settings.asin);
                page.addTooltipToPage(tooltipMarkup);
                page.registerInitializationHandler(settings.filteredShops);
            }
        };
        ensureTooltipHasBeenLoaded();
    }
};
