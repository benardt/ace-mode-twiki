// ==UserScript==
// @name           ACEtwiki
// @author         Thierry Benard 2020-11-24 (fork of Antoine Bernier)
// @version        0.0.4
// @description    ACE editor in your twiki
// @include        http://your-domain/twiki/*nowysiwyg=1*
// @include        http://your-domain/twiki/*raw=on*
// @include        http://your-domain/do/view/*raw=on*
// @include        http://your-domain/do/edit/*nowysiwyg=1*
// @grant       GM_addStyle
// ==/UserScript==
(function(d, cb) {

    //
    // A script loader over here!
    //

    if (typeof $LAB === 'undefined') {
        var s;

        s = d.createElement('script');
        s.src = 'http://your-domain/pub/Mechatronic/WebJavascriptLibrary/LAB.min.js';
        s.onload = function() {
            var s;
            s = d.createElement('script');
            s.textContent = '(' + cb.toString() + ')();';

            d.body.appendChild(s);
        }
        d.body.appendChild(s);
    } else {
        cb()
    }
}(document, function() {

    var baseurl = 'http://your-domain/pub/Mechatronic/WebJavascriptLibrary/';

    $LAB
        .script(baseurl + 'jquery-1.10.2.js')
        .script(baseurl + 'jquery-ui.js')
        .script(baseurl + 'ace.js')
        .script(baseurl + 'ext-language_tools.js')
        .script(baseurl + 'theme-chrome.js')
        .wait(function() {

            // Needed for resizeable feature
            $("head").append(
                '<link ' +
                'href="' + baseurl + '/jquery-ui.css" ' +
                'rel="stylesheet" type="text/css">'
            );


            $('textarea#topic').each(function(i, el) {
                var $el,
                    $container,
                    editor,
                    ext;

                $el = $(el);

                //
                // Principle: inject an DOM element (sized and positioned) and hide the textarea
                //

                // inject DIV resizeable
                $('<div />', {
                    id: 'resizable1'
                }).css({
                    position: 'relative',
                    width: $el.width(),
                    height: $el.height()
                }).insertAfter(el);

                // inject DIV editor
                $('<div />', {
                    id: 'editor'
                }).css({
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    right: '0px',
                    bottom: '0px'
                }).appendTo('#resizable1');


                $el.hide();

                //
                // ACE magic
                //

                editor = ace.edit('editor');
                editor.setTheme('ace/theme/chrome');
                // Syntax highlighting
                editor.getSession().setMode('ace/mode/twiki');

                // autocompletion
                editor.setOptions({
                    enableBasicAutocompletion: true
                });
                var staticWordCompleter = {
                    getCompletions: function(editor, session, pos, prefix, callback) {
                        $.get("http://your-domain/do/view/Mechatronic/WebJavascriptLibrary", function(response) {
                            //var data = $.parseHTML(response);
                            var mytext = $($.parseHTML(response)).find('#wordlist').html();
                            var wordList = mytext.split(',');
                            callback(null, wordList.map(function(word) {
                                return {
                                    caption: word,
                                    value: word,
                                    meta: "static"
                                };
                            }));
                        });
                    }
                }
                editor.completers = [staticWordCompleter];



                // Keep hidden textarea in sync

                editor.getSession().setValue($el.val());
                editor.getSession().on('change', function() {
                    $el.val(editor.getSession().getValue());
                });

                // Allow resizeable ACE editor

                $("#resizable1").resizable({
                    resize: function(event, ui) {
                        editor.resize();
                    }
                });

            });
        });
}));
