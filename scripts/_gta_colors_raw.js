$.getScript('./js/modernizr-custom.js');

const _timeToLoad = 20000;
let _autoPlay = true;
let _isSet = false;
let _flag = true;
let _interval;
let _colors;
let _swatches = [];

$(document).ready(function () {
    let mainScrollPos = 0;
    let colorsScrollPos = 0;
    fetchManufacturers();
    fetchColors();

    _autoPlay
        ? $('#autoplay').addClass('active')
        : $('#autoplay').removeClass('active');

    // Manage tabs
    $(document).on('click', '.col-sel:not(.active)', function () {
        $('.drop-down-list #makers li').removeClass('active');
        $('.col-sel').removeClass('active');
        $(this).addClass('active');

        if ($(this).data('filter') === 'color') {
            $('#makers').fadeOut();
            $('#colors').fadeIn(500);
            setScrollPos(colorsScrollPos);
            mainScrollPos = getScrollPos();
            _flag = false;
        } else if ($(this).data('filter') === 'car') {
            $('#colors, #selected-colors, #no-results').fadeOut();
            $('#makers').fadeIn(500);
            setScrollPos(mainScrollPos);
            colorsScrollPos = getScrollPos();
            _flag = true;
        }
    });

    // Select color
    $(document).on('click', '.drop-down-list li:not(.active)', function () {
        const name = $(this).text();

        // Color data
        if ($('[data-filter="color"]').hasClass('active')) {
            const color = $(this).data('col_data');
            $('.tooltip[data-title="Autoplay"]').removeClass('active');

            clearInterval(_interval);
            setValues(color);
        }

        // Mark tabs
        $('.col-sel').removeClass('active');
        $('[data-filter="color"]').addClass('active');

        // Mark colors
        $('.drop-down-list li').not(this).removeClass('active');
        $(this).addClass('active');
        _autoPlay = false;

        if (_flag) {
            mainScrollPos = getScrollPos();
            fetchSelectedColors(name);
            setScrollPos(0);
        }
    });

    $(document).on('click', '#makers li:not(.active)', () => {
        $('.drop-down-list ul, .drop-down-list img').fadeOut();
        $('#selected-colors').fadeIn(500);
    });

    $(document).on(
        'click',
        '#selected-colors li:not(.active), #colors li:not(.active)',
        () => {
            $('.progress')
                .stop(true, false)
                .animate({ width: ['100%', 'linear'] }, 500);
        }
    );

    // Check if tab is active
    $(window).on('focus', function () {
        if (_autoPlay) {
            var width = Math.floor(
                ($('.progress').width() / $('.progress').parent().width()) * 100
            );
            var time = _timeToLoad - (width / 100) * _timeToLoad;

            $('.progress').animate(
                {
                    width: ['100%', 'linear'],
                },
                time,
                function () {
                    randomColors();
                }
            );
        }
    });

    $(window).on('blur', function () {
        if (_autoPlay) {
            $('.progress').stop(true, false);
            $('.img-preview').stop(true, false);
            clearInterval(_interval);
        }
    });

    // Open Social Club
    $('#crew-name+button').on('click', function () {
        const crewName = $('#crew-name').val();
        const url =
            'https://socialclub.rockstargames.com/crew/' +
            crewName.toLowerCase() +
            '/manage/edit' +
            hex;
        window.open(url);

        if ($('#save-crew').is(':checked')) {
            $.cookie('crewName', crewName, { expires: 30 });
        }

        addSwatch();
    });

    // Load swatches
    if (!$.cookie('swatches')) {
        $.cookie('swatches', '');
    } else {
        _swatches = JSON.parse($.cookie('swatches'));

        for (let n = 0; n <= _swatches.length; n++) {
            if (typeof _swatches[n] !== 'undefined') {
                const split = _swatches[n].split(', ');
                //$('.swatches .grid').prepend('<div style="background:'+split[0]+'" data-title="'+split[1].replace(/\s+/g, '&nbsp;')+'"></div>');
                $('.swatches .grid').prepend(
                    '<div style="background:' +
                        split[0] +
                        '" data-title="' +
                        split[1] +
                        '"></div>'
                );
            }
        }
    }

    // Search bar
    $('.search-box>input').on('keyup', checkInput);

    // Autoplay button
    $('.tooltip[data-title="Autoplay"]').on('click', function () {
        $(this).toggleClass('active');

        if ($(this).hasClass('active')) {
            _autoPlay = true;
            $('.drop-down-list ul li').removeClass('active');
            $('.progress')
                .stop()
                .animate(
                    {
                        width: '0%',
                    },
                    () => {
                        randomColors();
                    }
                );
        } else {
            _autoPlay = false;
            $('.progress').stop().animate({ width: '100%' });
            clearInterval(_interval);
        }
    });
});

// Load manufacturers
async function fetchManufacturers() {
    fetch('include/manufacturers')
        .then((response) => response.json())
        .then((data) => {
            let makers = data;
            return makers.map((maker) => {
                $('#makers').append(`<li>${maker.manufacturer}</li>`);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Load all colors
async function fetchColors() {
    fetch('include/colors')
        .then((response) => response.json())
        .then((data) => {
            storeColors(data);
            appendData(data, $('#colors'));
            _autoPlay && randomColors();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Load colors by manufacturer
function fetchSelectedColors(name) {
    const el = $('#selected-colors');
    const data = [];

    for (const color of _colors) {
        color.manufacturer === name ? data.push(color) : null;
    }

    data.sort((a, b) => (a.color > b.color ? 1 : -1));
    appendData(data, el);
    _flag = false;
}

// Randomize colors
function randomColors() {
    var max = _colors.length;
    var random = [];
    var i = 1;

    random[0] = Math.floor(Math.random() * max);
    setValues(_colors[random]);

    _interval = setInterval(() => {
        if (_autoPlay) {
            random[i] = Math.floor(Math.random() * max);

            if (random[i] == random[i - 1]) {
                random[i] = Math.floor(Math.random() * max);
            } else {
                setValues(_colors[random[i]]);
                i++;
            }
        } else {
            clearInterval(_interval);
        }
    }, _timeToLoad);
}

// Add swatches
function addSwatch() {
    let data = $('.drop-down-list li.active').data('col_data');
    const color = $('#col-name').text();
    const hex = $('#col-hex').text();

    // Avoid duplicates
    if ($('.swatches .grid div').length > 0) {
        if (
            hex ==
            $('.swatches .grid div:first-of-type').attr('style').split(':')[1]
        ) {
            return;
        } else {
            // Remove overflow
            if ($('.swatches .grid div').length >= 14) {
                $('.swatches .grid div:last-of-type').remove();
                _swatches.shift();
            }
        }
    }

    // Get color data for swatches
    if (data === undefined) {
        $('.swatches .grid').prepend(
            '<div style="background:' +
                hex +
                '" data-title="' +
                color +
                '"></div>'
        );
        _swatches.push(hex + ', ' + color);
    } else {
        $('.swatches .grid')
            .prepend(
                '<div style="background:' +
                    data['hex'] +
                    '" data-title="' +
                    data['color'] +
                    '"></div>'
            )
            .data('col_data');
        _swatches.push(data['hex'] + ', ' + data['color']);
    }

    $.cookie('swatches', JSON.stringify(_swatches), { expires: 60 });
}

function checkInput() {
    const inputVal = $('.search-box>input').val().trim().toLowerCase();
    let timer;

    if (inputVal.length >= 2) {
        clearTimeout(timer);
        let results = 0;

        timer = setTimeout(function () {
            $('#colors li').filter(function () {
                let liValue = $(this).text().trim().toLowerCase();
                let found = liValue.indexOf(inputVal);

                // Highlight letters
                if (found > -1) {
                    var left = $(this).text().substr(0, found);
                    var highlight = $(this)
                        .text()
                        .substr(found, inputVal.length);
                    var right = $(this)
                        .text()
                        .substr(inputVal.length + found);
                    var result = left + '<b>' + highlight + '</b>' + right;
                    results++;
                    $(this).children('p').html(result);
                }

                // Hide not matching results
                $(this).toggle(found > -1);
            });

            // Displaying results
            if (results > 0) {
                $('.results').html('<b>' + results + '</b> matching results');
                $('#makers, #selected-colors, #no-results').fadeOut();
                $('#colors').fadeIn('slow');
                _isSet = false;
            } else if (_isSet === false) {
                $('#makers, #selected-colors, #colors').fadeOut();
                $('#no-results').fadeIn(500);
                $('.panel-left .results').text('No results found');
                _isSet = true;
            }
        }, 700);
    } else {
        $('.panel-left .results').text('');
    }

    if ($('.clear-btn').length == 0 && inputVal.length > 0) {
        replaceIcons('clear');

        // Clear button
        $('.search-box div svg').on('click', function () {
            $('.progress').animate({ width: 0 }, 500, 'linear');
            $('.search-box>input').val('');
            $('.panel-left .results').text('');
            $('#no-results').fadeOut();

            replaceIcons('search');
            checkInput();
        });
    } else {
        $('#colors').fadeOut(() => {
            _autoPlay = false;
            fetchColors();
            $('#colors').fadeIn('slow');
        });

        replaceIcons('search');
    }

    $('.col-sel').removeClass('active');
    $('.col-sel:nth-of-type(2)').addClass('active');
    _flag = false;
}

// Replace SVG icons in search box
function replaceIcons(type) {
    switch (type) {
        case 'search':
            // Search
            $('.search-box div svg').replaceWith(
                '' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="20" viewBox="0 0 39.027 38.329">' +
                    '<g transform="translate(-688.469 -54.448)"><g transform="translate(688.469 54.448)" fill="none" stroke="#39424f" stroke-width="6">' +
                    '<circle cx="14.499" cy="14.499" r="14.499" stroke="none"/><circle cx="14.499" cy="14.499" r="11.499" fill="none"/></g>' +
                    '<line x2="10.874" y2="10.874" transform="translate(712.379 77.66)" fill="none" stroke="#39424f" stroke-linecap="round" stroke-width="6"/></g></svg>'
            );
            break;
        case 'clear':
            // Clear
            $('.search-box div svg').replaceWith(
                '' +
                    '<svg class=".clear-btn" style="cursor:pointer" version="1.1" xmlns="http://www.w3.org/2000/svg" height="10" width="10" viewBox="0 0 512 512">' +
                    '<path d="M507.331 411.33c-0.002-0.002-0.004-0.004-0.006-0.005l-155.322-155.325 155.322-155.325c0.002-0.002 0.004-0.003 0.006-0.005 1.672-1.673 2.881-3.627 3.656-5.708 2.123-5.688 0.912-12.341-3.662-16.915l-73.373-73.373c-4.574-4.573-11.225-5.783-16.914-3.66-2.080 0.775-4.035 1.984-5.709 3.655 0 0.002-0.002 0.003-0.004 0.005l-155.324 155.326-155.324-155.325c-0.002-0.002-0.003-0.003-0.005-0.005-1.673-1.671-3.627-2.88-5.707-3.655-5.69-2.124-12.341-0.913-16.915 3.66l-73.374 73.374c-4.574 4.574-5.784 11.226-3.661 16.914 0.776 2.080 1.985 4.036 3.656 5.708 0.002 0.001 0.003 0.003 0.005 0.005l155.325 155.324-155.325 155.326c-0.001 0.002-0.003 0.003-0.004 0.005-1.671 1.673-2.88 3.627-3.657 5.707-2.124 5.688-0.913 12.341 3.661 16.915l73.374 73.373c4.575 4.574 11.226 5.784 16.915 3.661 2.080-0.776 4.035-1.985 5.708-3.656 0.001-0.002 0.003-0.003 0.005-0.005l155.324-155.325 155.324 155.325c0.002 0.001 0.004 0.003 0.006 0.004 1.674 1.672 3.627 2.881 5.707 3.657 5.689 2.123 12.342 0.913 16.914-3.661l73.373-73.374c4.574-4.574 5.785-11.227 3.662-16.915-0.776-2.080-1.985-4.034-3.657-5.707z"></path>' +
                    '</svg>'
            );
            break;
        default:
            break;
    }
}

// Set color values
function setValues(data) {
    // [id, manufacturer, color, hex, pearlescent, image] = data;
    id = data.ID;
    manufacturer = data.manufacturer;
    color = data.color;
    hex = data.hex;
    pearlescent = data.pearlescent;
    image = data.image_url;

    $('#col-car').text(manufacturer);
    $('#col-name').text(color);
    $('.col-preview').css('background-color', hex);
    $('.col-preview').data('color_id', id);
    $('.col-preview').data('color_name', manufacturer + ' ' + color);

    // Image transition
    $('.img-preview')
        .stop()
        .animate({ opacity: [0, 'swing'] }, 500, function () {
            $('.webp .img-preview').css({
                'background-image': `url(${image}.webp)`,
            });
            $('.no-webp .img-preview').css({
                'background-image': `url(${image}.jpg)`,
            });
            $(this).animate({
                opacity: [1, 'swing'],
                duration: 500,
            });
            $('.name-output').text(`${manufacturer} ${color}`);
            $('.progress')
                .css('width', '0%')
                .animate({ width: ['100%', 'linear'] }, _timeToLoad, () => {
                    !$('.drop-down-list li').hasClass('active') &&
                        $('.progress').css('width', 0);
                });
        });

    if (hex === '') {
        $('#col-hex, #col-rgb, #col-hsl, #col-pearl').text('-');
    } else {
        let rgb = hexToRgb(hex);
        let hsl = hexToHsl(hex);

        $('#col-hex').text(hex);
        $('#col-rgb').text(rgb['r'] + ', ' + rgb['g'] + ', ' + rgb['b']);
        $('#col-hsl').text(hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%');

        if (pearlescent === '') {
            $('#col-pearl').text('-');
        } else {
            $('#col-pearl').text(pearlescent);
        }
    }
}

function storeColors(colors) {
    _colors = colors;
}

// Append LI with color data
function appendData(data, el) {
    el.html('');

    $.each(data, function (key, value) {
        li = $(
            `<li class="selected-colors-entry" title="${value.color}"><div class="selected-colors-swatch" style="background-color: ${value.hex}"></div><p>${value.color}</p></li>`
        ).data('col_data', value);
        el.append(li);
    });
}

// Set scroll position
function setScrollPos(value) {
    $('.simplebar-scrollbar').css('transition', '0.3s');
    $('[data-simplebar="init"]')[0].SimpleBar.getScrollElement().scrollTop =
        value;

    setTimeout(function () {
        $('.simplebar-scrollbar').css('transition', '');
    }, 800);
}

// Get scroll position
function getScrollPos(value) {
    return $('[data-simplebar="init"]')[0].SimpleBar.getScrollElement()
        .scrollTop;
}

// Hex to RGB
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

// Hex to HSL
function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    r = rgb['r'] / 255;
    g = rgb['g'] / 255;
    b = rgb['b'] / 255;

    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h,
        s,
        l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h = Math.round(h * 60);
    }

    return [parseInt(h), parseInt(s), parseInt(l)];
}
