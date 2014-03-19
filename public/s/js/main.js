/*jslint browser: true, indent: 4, regexp: true*/
/*global $, jQuery*/

(function () {
    'use strict';

    // Detect scroll position
    function detectScroll() {
        if ($(window).scrollTop() >= 1) {
            $(document.body).addClass("scrolled");
        } else {
            $(document.body).removeClass("scrolled");
        }
    }

    detectScroll();
    $(window).scroll(detectScroll);

    // Show and hide the modal dialog
    $(".login-toggle").click(function () {
        $("body").toggleClass("login-open");
    });

    $(".dim").click(function () {
        $("body").removeClass("login-open");
    });

    $(window).keyup(function (e) {
        if (e.keyCode === 27) {
            $("body").removeClass("login-open");
        }
    });

    // Check if the array contains a value
    Array.prototype.contains = function (value) {
        var i;

        for (i in this) {
            if (this[i] === value) {
                return true;
            }
        }

        return false;
    };

    // Show a slideshow
    var slides = ["websites", "conferences", "geeks", "home"],
        current = 0,
        timeout;

    function startSlideshow(clickedDelay) {
        if (!timeout) {
            timeout = setTimeout(startSlideshow, clickedDelay || 10000);
            return;
        }

        $("#cover").removeClass().addClass("cover-" + slides[current]);

        current = (current + 1) % slides.length;

        timeout = setTimeout(startSlideshow, 10000);
    }

    startSlideshow();

    $(".links > ul > li > a").click(function () {
        var slide = $(this).attr("class").substr(5);

        clearTimeout(timeout);
        timeout = null;

        if (slides.contains(slide)) {
            $("#cover").removeClass().addClass("cover-" + slide);
        }

        startSlideshow(30000);
    });

    // Smooth scroll for in page links
    $("a[href*=#]:not([href=#])").click(function () {
        if (location.pathname.replace(/^\//, "") === this.pathname.replace(/^\//, "") && location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
            if (target.length) {
                $("html,body").animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    // Validate form submission
    function error(err) {
        $("#create-field > .error").text(err);
        if (typeof err === 'undefined') {
            $("#create-field > .button").removeClass('disabled');
        } else {
            $("#create-field > .button").addClass('disabled');
        }
    }

    function validate() {
        var name = $("#create-text").val();
        if (name.length  === 0) { error(''); return false; }
        if (name.length > 0 && name.length < 3) { error('Must be at least 3 letters long.'); return false; }
        if (/^[^a-z]/.test(name)) { error('Must start with a lower case letter.'); return false; }
        if (/[^0-9a-z\-]/.test(name)) { error('Must have only lowercase letters, digits and hyphens (-)'); return false; }
        if (name.length >= 3) { error(''); }
        error();
        return true;
    }

    // Handle submit button click
    $("#create-field > .button").click(function () {
        if ($(this).hasClass('disabled')) {
            return;
        }

        location.href = location.protocol + "//" + location.host + "/" + $("#create-field > input").val();
        $("#create-field > input").val('');
        $(this).addClass('disabled');
    });

    // Prevent form submission if input not valid
    $("#create-text").focus(validate).keyup(validate).change(validate);
    $("#create-field").submit(function (e) {
        e.preventDefault();
        return false;
    });

    // Style active states in mobile
    document.addEventListener("touchstart", function () {}, true);

}());