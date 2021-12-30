// ==UserScript==
// @name         Syntax highligthing editor for TWiki
// @namespace
// @version      0.1
// @description  Syntax Highligthing editor for TWiki
// @include      https://twiki.org/cgi-bin/edit*
// @author       Thierry Bénard
// @icon         https://cdn1.iconfinder.com/data/icons/hawcons/32/699302-icon-32-clipboard-edit-512.png
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

(function() {
    'use strict';

    // globals
    const url_base = window.location.origin;
    var request_available = true; // avoid to launch new request if last one is not completed
    const url_tml2html = url_base + "/cgi-bin/rest/WysiwygPlugin/tml2html";
    const url_ace_domain = "https://ace.c9.io/build/src/";
    const height_init = 300;

    // functions
    function createDiv(id, resizeable) {
        var $newdiv1 = $( "<div id='" + id + "'></div>" );
        // resizeable = MASTER div
        if (resizeable) {
            $newdiv1.height(height_init);
            $newdiv1.css("resize", "both");
            $newdiv1.css("overflow", "auto");
        } else {
            // CHILD div side-by-side inside MASTER div
            $newdiv1.width("50%");
            $newdiv1.height("100%");
            $newdiv1.css("float", "left");
        }
        return $newdiv1;
    }

    /*
     * clean text to be compatible with TML2HTML
     *
     */
    function cleanText(text) {
        text = text.replace(/%BR%/gm,"<literal><br></literal>");
        text = text.replace(/\n\n\n+/g,"\n\n");
        return text;
    }

    /*
     * Update live ACE editor
     *
     */
    function update(mytext) {
        $.get( url_tml2html, { text: mytext } )
            .done(function( data ) {
            request_available = true;
            $( "#ace_object2").html( data );
            // CSS
            $(".WYSIWYG_PROTECTED").css({"color": "orange", "font-style": "italic"});
        });
    }

    /*
     * Main function for ACE editor
     *
     */
    function myEditor() {
        // create new DIV
        var $acemaster = createDiv('ace_master', true);
        var $acediv1 = createDiv('ace_object1', false).appendTo($acemaster);
        var $acediv2 = createDiv('ace_object2', false).appendTo($acemaster);

        // add DIV afetr textarea
        $( "#topic" ).first().after( $acemaster );

        // create ACE editor instance
        var editor = ace.edit("ace_object1");
        editor.setTheme("ace/theme/chrome");
        editor.session.setMode("ace/mode/html");

        var textarea = $('textarea[id="topic"]').hide();
        editor.getSession().setValue(textarea.val());
        editor.getSession().on('change', function(){
            var mytext = editor.getSession().getValue();
            textarea.val(mytext);
            if (request_available) {
                request_available = false;
                update(cleanText(mytext));
            }
        });
    }

    // Starting here...
    $.getScript( url_ace_domain + "ace.js" )
        .done(function( script, textStatus ) {
        console.log($().jquery);
        console.log( textStatus );
        console.log("url base: ", url_base);
        myEditor();
    })
        .fail(function( jqxhr, settings, exception ) {
        alert( "Triggered ajaxError handler." );
    });

})();
