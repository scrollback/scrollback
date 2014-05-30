/* jshint browser: true */
/* global jQuery */

/*!
 * jquery oembed plugin
 *
 * Copyright (c) 2009 Richard Chamorro
 * Licensed under the MIT license
 *
 * Orignal Author: Richard Chamorro
 * Forked by Andrew Mee to Provide a slightly diffent kind of embedding
 * experience
 * Removed shortened URL support and bunch of other modifications
 */

(function ($) {
    $.fn.oembed = function (url, options, embedAction) {

        settings = $.extend(true, $.fn.oembed.defaults, options);

        if ($('#jqoembeddata').length === 0) $('<span id="jqoembeddata"></span>').appendTo('body');

        return this.each(function () {

            var container = $(this),
                resourceURL = (url && (!url.indexOf('http://') || !url.indexOf('https://'))) ? url : container.attr("href"),
                provider;

            if (embedAction) {
                settings.onEmbed = embedAction;
            } else if (!settings.onEmbed) {
                settings.onEmbed = function (oembedData) {
                    $.fn.oembed.insertCode(this, settings.embedMethod, oembedData);
                };
            }

            if (resourceURL !== null && resourceURL !== undefined) {
                provider = $.fn.oembed.getOEmbedProvider(resourceURL);

                if (provider !== null) {
                    provider.params = getNormalizedParams(settings[provider.name]) || {};
                    embedCode(container, resourceURL, provider);
                } else {
                    settings.onProviderNotFound.call(container, resourceURL);
                }
            }

            return container;
        });


    };

    var settings;

    // Plugin defaults
    $.fn.oembed.defaults = {
        includeHandle: false,
        embedMethod: 'auto',
        onProviderNotFound: function () {},
        beforeEmbed: function () {},
        afterEmbed: function () {},
        onEmbed: false,
        onError: function () {},
        ajaxOptions: {}
    };

    /* Private functions */
    function rand(length, current) { //Found on http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
        current = current ? current : '';
        return length ? rand(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + current) : current;
    }

    function getRequestUrl(provider, externalUrl) {
        var url = provider.apiendpoint,
            qs = "",
            i;
        url += (url.indexOf("?") <= 0) ? "?" : "&";
        url = url.replace('#', '%23');

        for (i in provider.params) {
            // We don't want them to jack everything up by changing the callback parameter
            if (i === provider.callbackparameter) continue;

            // allows the options to be set to null, don't send null values to the server as parameters
            if (provider.params[i] !== null) qs += "&" + escape(i) + "=" + provider.params[i];
        }

        url += "format=" + provider.format + "&url=" + escape(externalUrl) + qs;
        if (provider.dataType !== 'json') url += "&" + provider.callbackparameter + "=?";

        return url;
    }

    function success(oembedData, externalUrl, container) {
        $('#jqoembeddata').data(externalUrl, oembedData.code);
        settings.beforeEmbed.call(container, oembedData);
        settings.onEmbed.call(container, oembedData);
        settings.afterEmbed.call(container, oembedData);
    }

    function embedCode(container, externalUrl, embedProvider) {
        if ($('#jqoembeddata').data(externalUrl) !== undefined && embedProvider.embedtag.tag !== 'iframe') {
            var oembedData = {
                code: $('#jqoembeddata').data(externalUrl)
            };
            success(oembedData, externalUrl, container);
        } else if (embedProvider.yql) {
            var from = embedProvider.yql.from || 'htmlstring';
            var url = embedProvider.yql.url ? embedProvider.yql.url(externalUrl) : externalUrl;
            var query = 'SELECT * FROM ' + from + ' WHERE url="' + (url) + '"' + " and " + (/html/.test(from) ? 'xpath' : 'itemPath') + "='" + (embedProvider.yql.xpath || '/') + "'";
            if (from === 'html') query += " and compat='html5'";
            var ajaxopts = $.extend({
                url: "http://query.yahooapis.com/v1/public/yql",
                dataType: 'jsonp',
                data: {
                    q: query,
                    format: "json",
                    env: 'store://datatables.org/alltableswithkeys',
                    callback: "?"
                },
                success: function (data) {
                    var result;
                    if (embedProvider.yql.xpath && embedProvider.yql.xpath === '//meta|//title|//link') {
                        var meta = {};
                        if (data.query.results === null) {
                            data.query.results = {
                                "meta": []
                            };
                        }
                        for (var i = 0, l = data.query.results.meta.length; i < l; i++) {
                            var name = data.query.results.meta[i].name || data.query.results.meta[i].property || null;
                            if (name === null) continue;
                            meta[name.toLowerCase()] = data.query.results.meta[i].content;
                        }
                        if (!meta.hasOwnProperty("title") || !meta.hasOwnProperty("og:title")) {
                            if (data.query.results.title !== null) {
                                meta.title = data.query.results.title;
                            }
                        }
                        if (!meta.hasOwnProperty("og:image") && data.query.results.hasOwnProperty("link")) {
                            for (var j = 0, k = data.query.results.link.length; j < k; j++) {
                                if (data.query.results.link[j].hasOwnProperty("rel")) {
                                    if (data.query.results.link[j].rel === "apple-touch-icon") {
                                        if (data.query.results.link[j].href.charAt(0) === "/") {
                                            meta["og:image"] = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+\/).*$/)[1] + data.query.results.link[j].href;
                                        } else {
                                            meta["og:image"] = data.query.results.link[j].href;
                                        }
                                    }
                                }
                            }
                        }
                        result = embedProvider.yql.datareturn(meta);
                    } else {
                        result = embedProvider.yql.datareturn ? embedProvider.yql.datareturn(data.query.results) : data.query.results.result;
                    }
                    if (result === false) return;
                    var oembedData = $.extend({}, result);
                    oembedData.code = result;
                    success(oembedData, externalUrl, container);
                },
                error: settings.onError.call(container, externalUrl, embedProvider)
            }, settings.ajaxOptions || {});

            $.ajax(ajaxopts);
        } else if (embedProvider.templateRegex) {
            var oembedData;

            if (embedProvider.embedtag.tag !== '') {
                var flashvars = embedProvider.embedtag.flashvars || '';
                var tag = embedProvider.embedtag.tag || 'embed';
                var width = embedProvider.embedtag.width || 'auto';
                var height = embedProvider.embedtag.height || 'auto';
                var src = externalUrl.replace(embedProvider.templateRegex, embedProvider.apiendpoint);
                if (!embedProvider.nocache) src += '&jqoemcache=' + rand(5);
                if (embedProvider.apikey) src = src.replace('_APIKEY_', settings.apikeys[embedProvider.name]);


                var code = $('<' + tag + '>')
                    .attr('src', src)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('allowfullscreen', embedProvider.embedtag.allowfullscreen || 'true')
                    .attr('allowscriptaccess', embedProvider.embedtag.allowfullscreen || 'always');
                if (tag === 'embed')
                    code
                    .attr('type', embedProvider.embedtag.type || "application/x-shockwave-flash")
                    .attr('flashvars', externalUrl.replace(embedProvider.templateRegex, flashvars));
                if (tag === 'iframe')
                    code
                    .attr('scrolling', embedProvider.embedtag.scrolling || "no")
                    .attr('frameborder', embedProvider.embedtag.frameborder || "0");


                oembedData = {
                    code: code
                };
                success(oembedData, externalUrl, container);
            } else if (embedProvider.apiendpoint) {
                //Add APIkey if true
                if (embedProvider.apikey) embedProvider.apiendpoint = embedProvider.apiendpoint.replace('_APIKEY_', settings.apikeys[embedProvider.name]);
                ajaxopts = $.extend({
                    url: externalUrl.replace(embedProvider.templateRegex, embedProvider.apiendpoint),
                    dataType: 'jsonp',
                    success: function (data) {
                        var oembedData = $.extend({}, data);
                        oembedData.code = embedProvider.templateData(data);
                        success(oembedData, externalUrl, container);
                    },
                    error: settings.onError.call(container, externalUrl, embedProvider)
                }, settings.ajaxOptions || {});

                $.ajax(ajaxopts);
            } else {
                oembedData = {
                    code: externalUrl.replace(embedProvider.templateRegex, embedProvider.template)
                };
                success(oembedData, externalUrl, container);
            }
        } else {

            var requestUrl = getRequestUrl(embedProvider, externalUrl),
                ajaxopts = $.extend({
                    url: requestUrl,
                    dataType: embedProvider.dataType || 'jsonp',
                    success: function (data) {
                        var oembedData = $.extend({}, data);
                        switch (oembedData.type) {
                            case "file": //Deviant Art has this
                            case "photo":
                                oembedData.code = $.fn.oembed.getPhotoCode(externalUrl, oembedData);
                                break;
                            case "video":
                            case "rich":
                                oembedData.code = $.fn.oembed.getRichCode(externalUrl, oembedData);
                                break;
                            default:
                                oembedData.code = $.fn.oembed.getGenericCode(externalUrl, oembedData);
                                break;
                        }
                        success(oembedData, externalUrl, container);
                    },
                    error: settings.onError.call(container, externalUrl, embedProvider)
                }, settings.ajaxOptions || {});

            $.ajax(ajaxopts);
        }
    }

    function getNormalizedParams(params) {
        if (params === null) return null;
        var key, normalizedParams = {};
        for (key in params) {
            if (key !== null) normalizedParams[key.toLowerCase()] = params[key];
        }
        return normalizedParams;
    }

    /* Public functions */
    $.fn.oembed.insertCode = function (container, embedMethod, oembedData) {
        if (oembedData === null) return;
        if (embedMethod === 'auto' && container.attr("href") !== null) embedMethod = 'append';
        else if (embedMethod === 'auto') embedMethod = 'replace';
        switch (embedMethod) {
        case "replace":
            container.replaceWith(oembedData.code);
            break;
        case "fill":
            container.html(oembedData.code);
            break;
        case "append":
            container.wrap('<div class="oembedall-container"></div>');

            var oembedContainer = container.parent();

            if (settings.includeHandle) {
                $("<span>").addClass("oembedall-toggle").html("&darr;").insertBefore(container).on("click", function () {
                    var encodedString = encodeURIComponent($(this).text());
                    $(this).html((encodedString === '%E2%86%91') ? '&darr;' : '&uarr;');
                    $(this).parent().children().last().toggle();
                });
            }

            var oembedContents = $("<p>").addClass("oembedall-content").appendTo(oembedContainer);

            try {
                oembedData.code.clone().appendTo(oembedContents);
            } catch (e) {
                oembedContents.append(oembedData.code);
            }

            break;
        }
    };

    $.fn.oembed.getPhotoCode = function (url, oembedData) {
        var code, alt = oembedData.title ? oembedData.title : '';
        alt += oembedData.author_name ? ' - ' + oembedData.author_name : '';
        alt += oembedData.provider_name ? ' - ' + oembedData.provider_name : '';
        if (oembedData.url) {
            code = '<div><a href="' + url + '" target=\'_blank\'><img src="' + oembedData.url + '" alt="' + alt + '"></a></div>';
        } else if (oembedData.thumbnail_url) {
            var newURL = oembedData.thumbnail_url.replace('_s', '_b');
            code = '<div><a href="' + url + '" target=\'_blank\'><img src="' + newURL + '" alt="' + alt + '"></a></div>';
        } else {
            code = '<div>Error loading this picture</div>';
        }
        if (oembedData.html) code += "<div>" + oembedData.html + "</div>";
        return code;
    };

    $.fn.oembed.getRichCode = function (url, oembedData) {
        var code = oembedData.html;
        return code;
    };

    $.fn.oembed.getGenericCode = function (url, oembedData) {
        var title = (oembedData.title !== null) ? oembedData.title : url,
            code = '<a href="' + url + '">' + title + '</a>';
        if (oembedData.html) code += "<div>" + oembedData.html + "</div>";
        return code;
    };

    $.fn.oembed.getOEmbedProvider = function (url) {
        for (var i = 0; i < $.fn.oembed.providers.length; i++) {
            for (var j = 0, l = $.fn.oembed.providers[i].urlschemes.length; j < l; j++) {
                var regExp = new RegExp($.fn.oembed.providers[i].urlschemes[j], "i");
                if (url.match(regExp) !== null) return $.fn.oembed.providers[i];
            }
        }
        return null;
    };

    $.fn.oembed.OEmbedProvider = function (name, type, urlschemesarray, apiendpoint, extraSettings) {
        this.name = name;
        this.type = type; // "photo", "video", "link", "rich", null
        this.urlschemes = urlschemesarray;
        this.apiendpoint = apiendpoint;
        extraSettings = extraSettings || {};

        if (extraSettings.useYQL) {

            if (extraSettings.useYQL === 'xml') {
                extraSettings.yql = {
                    xpath: "//oembed/html",
                    from: 'xml',
                    apiendpoint: this.apiendpoint,
                    url: function (externalurl) {
                        return this.apiendpoint + '?format=xml&url=' + externalurl;
                    },
                    datareturn: function (results) {
                        return results.html.replace(/.*\[CDATA\[(.*)\]\]>$/, '$1') || '';
                    }
                };
            } else {
                extraSettings.yql = {
                    from: 'json',
                    apiendpoint: this.apiendpoint,
                    url: function (externalurl) {
                        return this.apiendpoint + '?format=json&url=' + externalurl;
                    },
                    datareturn: function (results) {
                        if (results.json.type !== 'video' && (results.json.url || results.json.thumbnail_url)) {
                            return '<img src="' + (results.json.url || results.json.thumbnail_url) + '" >';
                        }
                        return results.json.html || '';
                    }
                };
            }
            this.apiendpoint = null;
        }


        for (var property in extraSettings) {
            this[property] = extraSettings[property];
        }

        this.format = this.format || 'json';
        this.callbackparameter = this.callbackparameter || "callback";
        this.embedtag = this.embedtag || {
            tag: ""
        };


    };

    /*
     * Function to update existing providers
     *
     * @param  {String}    name             The name of the provider
     * @param  {String}    type             The type of the provider can be "file", "photo", "video", "rich"
     * @param  {String}    urlshemesarray   Array of url of the provider
     * @param  {String}    apiendpoint      The endpoint of the provider
     * @param  {String}    extraSettings    Extra settings of the provider
     */
    $.fn.updateOEmbedProvider = function (name, type, urlschemesarray, apiendpoint, extraSettings) {
        for (var i = 0; i < $.fn.oembed.providers.length; i++) {
            if ($.fn.oembed.providers[i].name === name) {
                if (type !== null) {
                    $.fn.oembed.providers[i].type = type;
                }
                if (urlschemesarray !== null) {
                    $.fn.oembed.providers[i].urlschemes = urlschemesarray;
                }
                if (apiendpoint !== null) {
                    $.fn.oembed.providers[i].apiendpoint = apiendpoint;
                }
                if (extraSettings !== null) {
                    $.fn.oembed.providers[i].extraSettings = extraSettings;
                    for (var property in extraSettings) {
                        if (property !== null && extraSettings[property] !== null) {
                            $.fn.oembed.providers[i][property] = extraSettings[property];
                        }
                    }
                }
            }
        }
    };

    /* Native & common providers */
    $.fn.oembed.providers = [

        //Video
        new $.fn.oembed.OEmbedProvider("youtube", "video", ["youtube\\.com/watch.+v=[\\w-]+&?", "youtu\\.be/[\\w-]+", "youtube.com/embed"], 'http://www.youtube.com/embed/$1?wmode=transparent', {
            templateRegex: /.*(?:v\=|be\/|embed\/)([\w\-]+)&?.*/,
            embedtag: {
                tag: 'iframe',
                width: '425',
                height: '349'
            }
        }),
        new $.fn.oembed.OEmbedProvider("wistia", "video", ["wistia.com/m/.+", "wistia.com/embed/.+", "wi.st/m/.+", "wi.st/embed/.+"], 'http://fast.wistia.com/oembed', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("xtranormal", "video", ["xtranormal\\.com/watch/.+"], "http://www.xtranormal.com/xtraplayr/$1/$2", {
            templateRegex: /.*com\/watch\/([\w\-]+)\/([\w\-]+).*/,
            embedtag: {
                tag: 'iframe',
                width: '320',
                height: '269'
            }
        }),
        new $.fn.oembed.OEmbedProvider("scivee", "video", ["scivee.tv/node/.+"], "http://www.scivee.tv/flash/embedCast.swf?", {
            templateRegex: /.*tv\/node\/(.+)/,
            embedtag: {
                width: '480',
                height: '400',
                flashvars: "id=$1&type=3"
            }
        }),
        new $.fn.oembed.OEmbedProvider("veoh", "video", ["veoh.com/watch/.+"], "http://www.veoh.com/swf/webplayer/WebPlayer.swf?version=AFrontend.5.7.0.1337&permalinkId=$1&player=videodetailsembedded&videoAutoPlay=0&id=anonymous", {
            templateRegex: /.*watch\/([^\?]+).*/,
            embedtag: {
                width: '410',
                height: '341'
            }
        }),
        new $.fn.oembed.OEmbedProvider("gametrailers", "video", ["gametrailers\\.com/video/.+"], "http://media.mtvnservices.com/mgid:moses:video:gametrailers.com:$2", {
            templateRegex: /.*com\/video\/([\w\-]+)\/([\w\-]+).*/,
            embedtag: {
                width: '512',
                height: '288'
            }
        }),
        new $.fn.oembed.OEmbedProvider("funnyordie", "video", ["funnyordie\\.com/videos/.+"], "http://player.ordienetworks.com/flash/fodplayer.swf?", {
            templateRegex: /.*videos\/([^\/]+)\/([^\/]+)?/,
            embedtag: {
                width: 512,
                height: 328,
                flashvars: "key=$1"
            }
        }),
        new $.fn.oembed.OEmbedProvider("colledgehumour", "video", ["collegehumor\\.com/video/.+"], "http://www.collegehumor.com/moogaloop/moogaloop.swf?clip_id=$1&use_node_id=true&fullscreen=1", {
            templateRegex: /.*video\/([^\/]+).*/,
            embedtag: {
                width: 600,
                height: 338
            }
        }),
        new $.fn.oembed.OEmbedProvider("metacafe", "video", ["metacafe\\.com/watch/.+"], "http://www.metacafe.com/fplayer/$1/$2.swf", {
            templateRegex: /.*watch\/(\d+)\/(\w+)\/.*/,
            embedtag: {
                width: 400,
                height: 345
            }
        }),
        new $.fn.oembed.OEmbedProvider("bambuser", "video", ["bambuser\\.com\/channel\/.*\/broadcast\/.*"], "http://static.bambuser.com/r/player.swf?vid=$1", {
            templateRegex: /.*bambuser\.com\/channel\/.*\/broadcast\/(\w+).*/,
            embedtag: {
                width: 512,
                height: 339
            }
        }),
        new $.fn.oembed.OEmbedProvider("twitvid", "video", ["twitvid\\.com/.+"], "http://www.twitvid.com/embed.php?guid=$1&autoplay=0", {
            templateRegex: /.*twitvid\.com\/(\w+).*/,
            embedtag: {
                tag: 'iframe',
                width: 480,
                height: 360
            }
        }),

        new $.fn.oembed.OEmbedProvider("aniboom", "video", ["aniboom\\.com/animation-video/.+"], "http://api.aniboom.com/e/$1", {
            templateRegex: /.*animation-video\/(\d+).*/,
            embedtag: {
                width: 594,
                height: 334
            }
        }),

        new $.fn.oembed.OEmbedProvider("vzaar", "video", ["vzaar\\.com/videos/.+", "vzaar.tv/.+"], "http://view.vzaar.com/$1/player?", {
            templateRegex: /.*\/(\d+).*/,
            embedtag: {
                tag: 'iframe',
                width: 576,
                height: 324
            }
        }),
        new $.fn.oembed.OEmbedProvider("snotr", "video", ["snotr\\.com/video/.+"], "http://www.snotr.com/embed/$1", {
            templateRegex: /.*\/(\d+).*/,
            embedtag: {
                tag: 'iframe',
                width: 400,
                height: 330,
                nocache: 1
            }
        }),

        new $.fn.oembed.OEmbedProvider("youku", "video", ["v.youku.com/v_show/id_.+"], "http://player.youku.com/player.php/sid/$1/v.swf", {
            templateRegex: /.*id_(.+)\.html.*/,
            embedtag: {
                width: 480,
                height: 400,
                nocache: 1
            }
        }),
        new $.fn.oembed.OEmbedProvider("tudou", "video", ["tudou.com/programs/view/.+\/"], "http://www.tudou.com/v/$1/v.swf", {
            templateRegex: /.*view\/(.+)\//,
            embedtag: {
                width: 480,
                height: 400,
                nocache: 1
            }
        }),

        new $.fn.oembed.OEmbedProvider("embedr", "video", ["embedr\\.com/playlist/.+"], "http://embedr.com/swf/slider/$1/425/520/default/false/std?", {
            templateRegex: /.*playlist\/([^\/]+).*/,
            embedtag: {
                width: 425,
                height: 520
            }
        }),
        new $.fn.oembed.OEmbedProvider("blip", "video", ["blip\\.tv/.+"], "http://blip.tv/oembed/"),
        new $.fn.oembed.OEmbedProvider("minoto-video", "video", ["http://api.minoto-video.com/publishers/.+/videos/.+", "http://dashboard.minoto-video.com/main/video/details/.+", "http://embed.minoto-video.com/.+"], "http://api.minoto-video.com/services/oembed.json", {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("animoto", "video", ["animoto.com/play/.+"], "http://animoto.com/services/oembed"),
        new $.fn.oembed.OEmbedProvider("hulu", "video", ["hulu\\.com/watch/.*"], "http://www.hulu.com/api/oembed.json"),
        new $.fn.oembed.OEmbedProvider("ustream", "video", ["ustream\\.tv/recorded/.*"], "http://www.ustream.tv/oembed", {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("videojug", "video", ["videojug\\.com/(film|payer|interview).*"], "http://www.videojug.com/oembed.json", {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("sapo", "video", ["videos\\.sapo\\.pt/.*"], "http://videos.sapo.pt/oembed", {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("vimeo", "video", ["www\.vimeo\.com\/groups\/.*\/videos\/.*", "www\.vimeo\.com\/.*", "vimeo\.com\/groups\/.*\/videos\/.*", "vimeo\.com\/.*"], "//vimeo.com/api/oembed.json"),
        new $.fn.oembed.OEmbedProvider("dailymotion", "video", ["dailymotion\\.com/.+"], 'http://www.dailymotion.com/services/oembed'),
        new $.fn.oembed.OEmbedProvider("5min", "video", ["www\\.5min\\.com/.+"], 'http://api.5min.com/oembed.xml', {
            useYQL: 'xml'
        }),
        new $.fn.oembed.OEmbedProvider("National Film Board of Canada", "video", ["nfb\\.ca/film/.+"], 'http://www.nfb.ca/remote/services/oembed/', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("qik", "video", ["qik\\.com/\\w+"], 'http://qik.com/api/oembed.json', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("revision3", "video", ["revision3\\.com"], "http://revision3.com/api/oembed/"),
        new $.fn.oembed.OEmbedProvider("dotsub", "video", ["dotsub\\.com/view/.+"], "http://dotsub.com/services/oembed", {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("clikthrough", "video", ["clikthrough\\.com/theater/video/\\d+"], "http://clikthrough.com/services/oembed"),
        new $.fn.oembed.OEmbedProvider("Kinomap", "video", ["kinomap\\.com/.+"], "http://www.kinomap.com/oembed"),
        new $.fn.oembed.OEmbedProvider("VHX", "video", ["vhx.tv/.+"], "http://vhx.tv/services/oembed.json"),
        new $.fn.oembed.OEmbedProvider("bambuser", "video", ["bambuser.com/.+"], "http://api.bambuser.com/oembed/iframe.json"),
        new $.fn.oembed.OEmbedProvider("justin.tv", "video", ["justin.tv/.+"], 'http://api.justin.tv/api/embed/from_url.json', {
            useYQL: 'json'
        }),


        //Audio
        new $.fn.oembed.OEmbedProvider("official.fm", "rich", ["official.fm/.+"], 'http://official.fm/services/oembed', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("chirbit", "rich", ["chirb.it/.+"], 'http://chirb.it/oembed.json', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("Huffduffer", "rich", ["huffduffer.com/[-.\\w@]+/\\d+"], "http://huffduffer.com/oembed"),
        new $.fn.oembed.OEmbedProvider("Spotify", "rich", ["open.spotify.com/(track|album|user)/"], "https://embed.spotify.com/oembed/"),
        new $.fn.oembed.OEmbedProvider("shoudio", "rich", ["shoudio.com/.+", "shoud.io/.+"], "http://shoudio.com/api/oembed"),
        new $.fn.oembed.OEmbedProvider("mixcloud", "rich", ["mixcloud.com/.+"], 'http://www.mixcloud.com/oembed/', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("rdio.com", "rich", ["rd.io/.+", "rdio.com"], "http://www.rdio.com/api/oembed/"),
        new $.fn.oembed.OEmbedProvider("Soundcloud", "rich", ["soundcloud.com/.+", "snd.sc/.+"], "http://soundcloud.com/oembed", {
            format: 'js'
        }),

        //Photo
        new $.fn.oembed.OEmbedProvider("deviantart", "photo", ["deviantart.com/.+", "fav.me/.+", "deviantart.com/.+"], "http://backend.deviantart.com/oembed", {
            format: 'jsonp'
        }),
        new $.fn.oembed.OEmbedProvider("skitch", "photo", ["skitch.com/.+"], null, {
            yql: {
                xpath: "json",
                from: 'json',
                url: function (externalurl) {
                    return 'http://skitch.com/oembed/?format=json&url=' + externalurl;
                },
                datareturn: function (data) {
                    return $.fn.oembed.getPhotoCode(data.json.url, data.json);
                }
            }
        }),
        new $.fn.oembed.OEmbedProvider("mobypicture", "photo", ["mobypicture.com/user/.+/view/.+", "moby.to/.+"], "http://api.mobypicture.com/oEmbed"),
        new $.fn.oembed.OEmbedProvider("flickr", "photo", ["flickr\\.com/photos/.+"], "http://flickr.com/services/oembed", {
            callbackparameter: 'jsoncallback'
        }),
        new $.fn.oembed.OEmbedProvider("photobucket", "photo", ["photobucket\\.com/(albums|groups)/.+"], "http://photobucket.com/oembed/"),
        new $.fn.oembed.OEmbedProvider("instagram", "photo", ["instagr\\.?am(\\.com)?/.+"], "http://api.instagram.com/oembed"),
        new $.fn.oembed.OEmbedProvider("SmugMug", "photo", ["smugmug.com/[-.\\w@]+/.+"], "http://api.smugmug.com/services/oembed/"),

        new $.fn.oembed.OEmbedProvider("dribbble", "photo", ["dribbble.com/shots/.+"], "http://api.dribbble.com/shots/$1?callback=?", {
            templateRegex: /.*shots\/([\d]+).*/,
            templateData: function (data) {
                if (!data.image_teaser_url) return false;
                return '<img src="' + data.image_teaser_url + '">';
            }
        }),
        new $.fn.oembed.OEmbedProvider("chart.ly", "photo", ["chart\\.ly/[a-z0-9]{6,8}"], "http://chart.ly/uploads/large_$1.png", {
            templateRegex: /.*ly\/([^\/]+).*/,
            embedtag: {
                tag: 'img'
            },
            nocache: 1
        }),
        new $.fn.oembed.OEmbedProvider("circuitlab", "photo", ["circuitlab.com/circuit/.+"], "https://www.circuitlab.com/circuit/$1/screenshot/540x405/", {
            templateRegex: /.*circuit\/([^\/]+).*/,
            embedtag: {
                tag: 'img'
            },
            nocache: 1
        }),
        new $.fn.oembed.OEmbedProvider("23hq", "photo", ["23hq.com/[-.\\w@]+/photo/.+"], "http://www.23hq.com/23/oembed", {
            useYQL: "json"
        }),
        new $.fn.oembed.OEmbedProvider("img.ly", "photo", ["img\\.ly/.+"], "http://img.ly/show/thumb/$1", {
            templateRegex: /.*ly\/([^\/]+).*/,
            embedtag: {
                tag: 'img'
            },
            nocache: 1
        }),
        new $.fn.oembed.OEmbedProvider("twitgoo.com", "photo", ["twitgoo\\.com/.+"], "http://twitgoo.com/show/thumb/$1", {
            templateRegex: /.*com\/([^\/]+).*/,
            embedtag: {
                tag: 'img'
            },
            nocache: 1
        }),
        new $.fn.oembed.OEmbedProvider("imgur.com", "photo", ["imgur\\.com/gallery/.+"], "http://imgur.com/$1l.jpg", {
            templateRegex: /.*gallery\/([^\/]+).*/,
            embedtag: {
                tag: 'img'
            },
            nocache: 1
        }),
        new $.fn.oembed.OEmbedProvider("visual.ly", "rich", ["visual\\.ly/.+"], null, {
            yql: {
                xpath: "//a[@id=\\'gc_article_graphic_image\\']/img",
                from: 'htmlstring'
            }
        }),

        //Rich
        new $.fn.oembed.OEmbedProvider("twitter", "rich", ["twitter.com/.+"], "https://api.twitter.com/1/statuses/oembed.json"),
        new $.fn.oembed.OEmbedProvider("gmep", "rich", ["gmep.imeducate.com/.*", "gmep.org/.*"], "http://gmep.org/oembed.json"),
        new $.fn.oembed.OEmbedProvider("cacoo", "rich", ["cacoo.com/.+"], "http://cacoo.com/oembed.json"),
        new $.fn.oembed.OEmbedProvider("dailymile", "rich", ["dailymile.com/people/.*/entries/.*"], "http://api.dailymile.com/oembed"),
        new $.fn.oembed.OEmbedProvider("dipity", "rich", ["dipity.com/timeline/.+"], 'http://www.dipity.com/oembed/timeline/', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("sketchfab", "rich", ["sketchfab.com/show/.+"], 'http://sketchfab.com/oembed', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("speakerdeck", "rich", ["speakerdeck.com/.+"], 'http://speakerdeck.com/oembed.json', {
            useYQL: 'json'
        }),
        new $.fn.oembed.OEmbedProvider("popplet", "rich", ["popplet.com/app/.*"], "http://popplet.com/app/Popplet_Alpha.swf?page_id=$1&em=1", {
            templateRegex: /.*#\/([^\/]+).*/,
            embedtag: {
                width: 460,
                height: 460
            }
        }),

        new $.fn.oembed.OEmbedProvider("pearltrees", "rich", ["pearltrees.com/.*"], "http://cdn.pearltrees.com/s/embed/getApp?", {
            templateRegex: /.*N-f=1_(\d+).*N-p=(\d+).*/,
            embedtag: {
                width: 460,
                height: 460,
                flashvars: "lang=en_US&amp;embedId=pt-embed-$1-693&amp;treeId=$1&amp;pearlId=$2&amp;treeTitle=Diagrams%2FVisualization&amp;site=www.pearltrees.com%2FF"
            }
        }),

        new $.fn.oembed.OEmbedProvider("prezi", "rich", ["prezi.com/.*"], "http://prezi.com/bin/preziloader.swf?", {
            templateRegex: /.*com\/([^\/]+)\/.*/,
            embedtag: {
                width: 550,
                height: 400,
                flashvars: "prezi_id=$1&amp;lock_to_path=0&amp;color=ffffff&amp;autoplay=no&amp;autohide_ctrls=0"
            }
        }),

        new $.fn.oembed.OEmbedProvider("tourwrist", "rich", ["tourwrist.com/tours/.+"], null, {
            templateRegex: /.*tours.([\d]+).*/,
            template: function (wm, tourid) {
                return "<div id='" + tourid + "' class='tourwrist-tour-embed direct'></div> <script type='text/javascript' src='http://tourwrist.com/tour_embed.js'></script>";
            }
        }),

        new $.fn.oembed.OEmbedProvider("meetup", "rich", ["meetup\\.(com|ps)/.+"], "http://api.meetup.com/oembed"),
        new $.fn.oembed.OEmbedProvider("ebay", "rich", ["ebay\\.*"], "http://togo.ebay.com/togo/togo.swf?2008013100", {
            templateRegex: /.*\/([^\/]+)\/(\d{10,13}).*/,
            embedtag: {
                width: 355,
                height: 300,
                flashvars: "base=http://togo.ebay.com/togo/&lang=en-us&mode=normal&itemid=$2&query=$1"
            }
        }),
        new $.fn.oembed.OEmbedProvider("wikipedia", "rich", ["wikipedia.org/wiki/.+"], "http://$1.wikipedia.org/w/api.php?action=parse&page=$2&format=json&section=0&callback=?", {
            templateRegex: /.*\/\/([\w]+).*\/wiki\/([^\/]+).*/,
            templateData: function (data) {
                if (!data.parse) return false;
                var text = data.parse['text']['*'].replace(/href="\/wiki/g, 'href="http://en.wikipedia.org/wiki');
                return '<div id="content"><h3><a class="nav-link" href="http://en.wikipedia.org/wiki/' + data.parse['displaytitle'] + '">' + data.parse['displaytitle'] + '</a></h3><p>' + text + '</p></div>';
            }
        }),
        new $.fn.oembed.OEmbedProvider("imdb", "rich", ["imdb.com/title/.+"], "http://www.imdbapi.com/?i=$1&callback=?", {
            templateRegex: /.*\/title\/([^\/]+).*/,
            templateData: function (data) {
                if (!data.Title) return false;
                return '<div id="content"><h3><a class="nav-link" href="http://imdb.com/title/' + data.imdbID + '/">' + data.Title + '</a> (' + data.Year + ')</h3><p><strong>Rating:</strong> ' + data.imdbRating + '<br><strong>Genre:</strong> ' + data.Genre + '<br><strong>Starring:</strong> ' + data.Actors + '</p></div>  <div id="view-photo-caption">' + data.Plot + '</div></div>';
            }
        }),
        new $.fn.oembed.OEmbedProvider("circuitbee", "rich", ["circuitbee\\.com/circuit/view/.+"], "http://c.circuitbee.com/build/r/schematic-embed.html?id=$1", {
            templateRegex: /.*circuit\/view\/(\d+).*/,
            embedtag: {
                tag: 'iframe',
                width: '500',
                height: '350'
            }
        }),

        new $.fn.oembed.OEmbedProvider("googlecalendar", "rich", ["www.google.com/calendar/embed?.+"], "$1", {
            templateRegex: /(.*)/,
            embedtag: {
                tag: 'iframe',
                width: '800',
                height: '600'
            }
        }),
        new $.fn.oembed.OEmbedProvider("jsfiddle", "rich", ["jsfiddle.net/[^/]+/?"], "http://jsfiddle.net/$1/embedded/result,js,resources,html,css/?", {
            templateRegex: /.*net\/([^\/]+).*/,
            embedtag: {
                tag: 'iframe',
                width: '100%',
                height: '300'
            }
        }),
        new $.fn.oembed.OEmbedProvider("jsbin", "rich", ["jsbin.com/.+"], "http://jsbin.com/$1/?", {
            templateRegex: /.*com\/([^\/]+).*/,
            embedtag: {
                tag: 'iframe',
                width: '100%',
                height: '300'
            }
        }),

        new $.fn.oembed.OEmbedProvider("jotform", "rich", ["form.jotform.co/form/.+"], "$1?", {
            templateRegex: /(.*)/,
            embedtag: {
                tag: 'iframe',
                width: '100%',
                height: '507'
            }
        }),
        new $.fn.oembed.OEmbedProvider("reelapp", "rich", ["reelapp\\.com/.+"], "http://www.reelapp.com/$1/embed", {
            templateRegex: /.*com\/(\S{6}).*/,
            embedtag: {
                tag: 'iframe',
                width: '400',
                height: '338'
            }
        }),
        new $.fn.oembed.OEmbedProvider("linkedin", "rich", ["linkedin.com/pub/.+"], "https://www.linkedin.com/cws/member/public_profile?public_profile_url=$1&format=inline&isFramed=true", {
            templateRegex: /(.*)/,
            embedtag: {
                tag: 'iframe',
                width: '368px',
                height: 'auto'
            }
        }),
        new $.fn.oembed.OEmbedProvider("timetoast", "rich", ["timetoast.com/timelines/[0-9]+"], "http://www.timetoast.com/flash/TimelineViewer.swf?passedTimelines=$1", {
            templateRegex: /.*timelines\/([0-9]*)/,
            embedtag: {
                width: 550,
                height: 400,
                nocache: 1
            }
        }),
        new $.fn.oembed.OEmbedProvider("pastebin", "rich", ["pastebin\\.com/[\\S]{8}"], "http://pastebin.com/embed_iframe.php?i=$1", {
            templateRegex: /.*\/(\S{8}).*/,
            embedtag: {
                tag: 'iframe',
                width: '100%',
                height: 'auto'
            }
        }),
        new $.fn.oembed.OEmbedProvider("mixlr", "rich", ["mixlr.com/.+"], "http://mixlr.com/embed/$1?autoplay=ae", {
            templateRegex: /.*com\/([^\/]+).*/,
            embedtag: {
                tag: 'iframe',
                width: '100%',
                height: 'auto'
            }
        }),
        new $.fn.oembed.OEmbedProvider("pastie", "rich", ["pastie\\.org/pastes/.+"], null, {
            yql: {
                xpath: '//pre[@class="textmate-source"]'
            }
        }),
        new $.fn.oembed.OEmbedProvider("codepen", "rich", ["codepen.io/.+/pen/.+"], "http://codepen.io/api/oembed"),
        new $.fn.oembed.OEmbedProvider("github", "rich", ["gist.github.com/.+"], "https://github.com/api/oembed"),
        new $.fn.oembed.OEmbedProvider("github", "rich", ["github.com/[-.\\w@]+/[-.\\w@]+"], "https://api.github.com/repos/$1/$2?callback=?", {
            templateRegex: /.*\/([^\/]+)\/([^\/]+).*/,
            templateData: function (data) {
                if (!data.data.html_url) return false;
                return '<div class="oembedall-githubrepos"><ul class="oembedall-repo-stats"><li>' + data.data.language + '</li><li class="oembedall-watchers"><a title="Watchers" href="' + data.data.html_url + '/watchers">&#x25c9; ' + data.data.watchers + '</a></li>' + '<li class="oembedall-forks"><a title="Forks" href="' + data.data.html_url + '/network">&#x0265; ' + data.data.forks + '</a></li></ul><h3><a href="' + data.data.html_url + '">' + data.data.name + '</a></h3><div class="oembedall-body"><p class="oembedall-description">' + data.data.description + '</p>' + '<p class="oembedall-updated-at">Last updated: ' + data.data.pushed_at + '</p></div></div>';
            }
        }),
        new $.fn.oembed.OEmbedProvider("facebook", "rich", ["facebook.com/(people/[^\\/]+/\\d+|[^\\/]+$)"], "https://graph.facebook.com/$2$3/?callback=?", {
            templateRegex: /.*facebook.com\/(people\/[^\/]+\/(\d+).*|([^\/]+$))/,
            templateData: function (data) {
                if (!data.id) return false;
                var out = '<div class="oembedall-facebook"><div class="oembedall-facebook-head"><a href="http://www.facebook.com/">facebook</a> ';
                out += '</div><div class="oembedall-facebook-body"><div class="contents">';
                if (data.picture) out += '<a href="' + data.link + '"><img src="' + data.picture + '"></a>';
                else out += '<img src="https://graph.facebook.com/' + data.id + '/picture">';
                if (data.from) out += '<a href="http://www.facebook.com/' + data.from.id + '">' + data.from.name + '</a><br>';
                else if (data.link) out += '<a href="' + data.link + '">' + data.name + '</a><br>';
                else if (data.username) out += '<a href="http://www.facebook.com/' + data.username + '">' + data.name + '</a><br>';
                else out += '<a href="http://www.facebook.com/' + data.id + '">' + data.name + '</a><br>';
                if (data.founded) out += 'Founded: <strong>' + data.founded + '</strong><br>';
                if (data.category) out += 'Category: <strong>' + data.category + '</strong><br>';
                if (data.website) out += 'Website: <strong><a href="' + data.website + '">' + data.website + '</a></strong><br>';
                if (data.gender) out += 'Gender: <strong>' + data.gender + '</strong><br>';
                if (data.description) out += data.description + '<br>';
                out += '</div></div>';
                return out;
            }
        }),
        new $.fn.oembed.OEmbedProvider("wordpress", "rich", ["wordpress\\.com/.+", "blogs\\.cnn\\.com/.+", "techcrunch\\.com/.+", "wp\\.me/.+"], "http://public-api.wordpress.com/oembed/1.0/?for=jquery-oembed-all"),
        new $.fn.oembed.OEmbedProvider("screenr", "rich", ["screenr\.com"], "http://www.screenr.com/embed/$1", {
            templateRegex: /.*\/([^\/]+).*/,
            embedtag: {
                tag: 'iframe',
                width: '650',
                height: 396
            }
        }),
        new $.fn.oembed.OEmbedProvider("gigpans", "rich", ["gigapan\\.org/[-.\\w@]+/\\d+"], "http://gigapan.org/gigapans/$1/options/nosnapshots/iframe/flash.html", {
            templateRegex: /.*\/(\d+)\/?.*/,
            embedtag: {
                tag: 'iframe',
                width: '100%',
                height: 400
            }
        }),
        new $.fn.oembed.OEmbedProvider("scribd", "rich", ["scribd\\.com/.+"], "http://www.scribd.com/embeds/$1/content?start_page=1&view_mode=list", {
            templateRegex: /.*doc\/([^\/]+).*/,
            embedtag: {
                tag: 'iframe',
                width: '100%',
                height: 600
            }
        }),
        new $.fn.oembed.OEmbedProvider("kickstarter", "rich", ["kickstarter\\.com/projects/.+"], "$1/widget/card.html", {
            templateRegex: /([^\?]+).*/,
            embedtag: {
                tag: 'iframe',
                width: '220',
                height: 380
            }
        }),
        new $.fn.oembed.OEmbedProvider("amazon", "rich", ["amzn.com/B+", "amazon.com.*/(B\\S+)($|\\/.*)"], "http://rcm.amazon.com/e/cm?t=_APIKEY_&o=1&p=8&l=as1&asins=$1&ref=qf_br_asin_til&fc1=000000&IS2=1&lt1=_blank&m=amazon&lc1=0000FF&bc1=000000&bg1=FFFFFF&f=ifr", {
            apikey: true,
            templateRegex: /.*\/(B[0-9A-Z]+)($|\/.*)/,
            embedtag: {
                tag: 'iframe',
                width: '120px',
                height: '240px'
            }
        }),
        new $.fn.oembed.OEmbedProvider("slideshare", "rich", ["slideshare\.net"], "http://www.slideshare.net/api/oembed/2", {
            format: 'jsonp'
        }),
        new $.fn.oembed.OEmbedProvider("roomsharejp", "rich", ["roomshare\\.jp/(en/)?post/.*"], "http://roomshare.jp/oembed.json"),
        new $.fn.oembed.OEmbedProvider("asciiartfarts", "rich", ["asciiartfarts.com/\\d+.html"], null, {
            yql: {
                xpath: '//pre/font',
                from: 'htmlstring',
                datareturn: function (results) {
                    if (!results.result) return false;
                    return '<pre>' + results.result + '</pre>';
                }
            }
        }),

        //Use Open Graph Where applicable
        new $.fn.oembed.OEmbedProvider("opengraph", "rich", [".*"], null, {
            yql: {
                xpath: "//meta|//title|//link",
                from: 'html',
                datareturn: function (results) {
                    if (!results['og:title'] && results['title'] && results['description']) results['og:title'] = results['title'];
                    if (!results['og:title'] && !results['title']) return false;

                    var code = $('<p>').addClass("oembedall-opengraph");

                    if (results['og:video']) {
                        var embed = $('<embed src="' + results['og:video'] + '">');
                        embed
                            .attr('type', results['og:video:type'] || "application/x-shockwave-flash");
                        if (results['og:video:width']) embed.attr('width', results['og:video:width']);
                        if (results['og:video:height']) embed.attr('height', results['og:video:height']);
                        code.append(embed);
                    } else if (results['og:image']) {
                        var img = $('<img src="' + results['og:image'] + '">');
                        if (results['og:image:width']) img.attr('width', results['og:image:width']);
                        if (results['og:image:height']) img.attr('height', results['og:image:height']);
                        code.append(img);
                    }
                    if (results['og:title']) code.append('<h3>' + results['og:title'] + '</h3>');
                    if (results['og:description'])
                        code.append('<p>' + results['og:description'] + '</p>');
                    else if (results['description'])
                        code.append(results['<p>' + 'description'] + '</p>');
                    return code;
                }
            }
        })

    ];
})(jQuery);
