/*
* jQuery Mobile v1.5.0-alpha.1
* http://jquerymobile.com
*
* Copyright jQuery Foundation, Inc. and other contributors
* Released under the MIT license.
* http://jquery.org/license
*
*/

(function ( root, doc, factory ) {
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( [ "jquery" ], function ( $ ) {
			factory( $, root, doc );
			return $.mobile;
		});
	} else {
		// Browser globals
		factory( root.jQuery, root, doc );
	}
}( this, document, function ( jQuery, window, document, undefined ) {/*!
 * jQuery Mobile animationComplete @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Animation Complete
//>>group: Core
//>>description: A handler for css transition & animation end events to ensure callback is executed

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'animationComplete',[ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var props = {
		"animation": {},
		"transition": {}
	},
	testElement = document.createElement( "a" ),
	vendorPrefixes = [ "", "webkit-", "moz-", "o-" ],
	callbackLookupTable = {};

$.each( [ "animation", "transition" ], function( i, test ) {

	// Get correct name for test
	var testName = ( i === 0 ) ? test + "-" + "name" : test;

	$.each( vendorPrefixes, function( j, prefix ) {
		if ( testElement.style[ $.camelCase( prefix + testName ) ] !== undefined ) {
			props[ test ][ "prefix" ] = prefix;
			return false;
		}
	} );

	// Set event and duration names for later use
	props[ test ][ "duration" ] =
		$.camelCase( props[ test ][ "prefix" ] + test + "-" + "duration" );
	props[ test ][ "event" ] =
		$.camelCase( props[ test ][ "prefix" ] + test + "-" + "end" );

	// All lower case if not a vendor prop
	if ( props[ test ][ "prefix" ] === "" ) {
		props[ test ][ "event" ] = props[ test ][ "event" ].toLowerCase();
	}
} );

// If a valid prefix was found then the it is supported by the browser
$.support.cssTransitions = ( props[ "transition" ][ "prefix" ] !== undefined );
$.support.cssAnimations = ( props[ "animation" ][ "prefix" ] !== undefined );

// Remove the testElement
$( testElement ).remove();

// Animation complete callback
$.fn.extend( {
	animationComplete: function( callback, type, fallbackTime ) {
		var timer, duration,
			that = this,
			eventBinding = function() {

				// Clear the timer so we don't call callback twice
				clearTimeout( timer );
				callback.apply( this, arguments );
			},
			animationType = ( !type || type === "animation" ) ? "animation" : "transition";

		if ( !this.length ) {
			return this;
		}

		// Make sure selected type is supported by browser
		if ( ( $.support.cssTransitions && animationType === "transition" ) ||
				( $.support.cssAnimations && animationType === "animation" ) ) {

			// If a fallback time was not passed set one
			if ( fallbackTime === undefined ) {

				// Make sure the was not bound to document before checking .css
				if ( this.context !== document ) {

					// Parse the durration since its in second multiple by 1000 for milliseconds
					// Multiply by 3 to make sure we give the animation plenty of time.
					duration = parseFloat(
							this.css( props[ animationType ].duration )
						) * 3000;
				}

				// If we could not read a duration use the default
				if ( duration === 0 || duration === undefined || isNaN( duration ) ) {
					duration = $.fn.animationComplete.defaultDuration;
				}
			}

			// Sets up the fallback if event never comes
			timer = setTimeout( function() {
				that
					.off( props[ animationType ].event, eventBinding )
					.each( function() {
						callback.apply( this );
					} );
			}, duration );

			// Update lookupTable
			callbackLookupTable[ callback ] = {
				event: props[ animationType ].event,
				binding: eventBinding
			};


			// Bind the event
			return this.one( props[ animationType ].event, eventBinding );
		} else {

			// CSS animation / transitions not supported
			// Defer execution for consistency between webkit/non webkit
			setTimeout( function() {
				that.each( function() {
					callback.apply( this );
				} );
			}, 0 );
			return this;
		}
	},

	removeAnimationComplete: function( callback ) {
		var callbackInfoObject = callbackLookupTable[ callback ];

		return callbackInfoObject ?
		this.off( callbackInfoObject.event, callbackInfoObject.binding ) : this;
	}
} );

// Allow default callback to be configured on mobileInit
$.fn.animationComplete.defaultDuration = 1000;

return $;
} );

/*!
 * jQuery Mobile Namespace @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Namespace
//>>group: Core
//>>description: The mobile namespace on the jQuery object

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'ns',[ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.mobile = { version: "@VERSION" };

return $.mobile;
} );

/*!
 * jQuery Mobile Data @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: jqmData
//>>group: Core
//>>description: Mobile versions of Data functions to allow for namespaceing
//>>css.structure: ../css/structure/jquery.mobile.core.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'data',[
			"jquery",
			"./ns" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var nsNormalizeDict = {},
	oldFind = $.find,
	rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	jqmDataRE = /:jqmData\(([^)]*)\)/g;

$.extend( $.mobile, {

	// Namespace used framework-wide for data-attrs. Default is no namespace

	ns: $.mobileBackcompat === false ? "ui-" : "",

	// Retrieve an attribute from an element and perform some massaging of the value

	getAttribute: function( element, key ) {
		var data;

		element = element.jquery ? element[ 0 ] : element;

		if ( element && element.getAttribute ) {
			data = element.getAttribute( "data-" + $.mobile.ns + key );
		}

		// Copied from core's src/data.js:dataAttr()
		// Convert from a string to a proper data type
		try {
			data = data === "true" ? true :
				data === "false" ? false :
					data === "null" ? null :
						// Only convert to a number if it doesn't change the string
						+data + "" === data ? +data :
							rbrace.test( data ) ? window.JSON.parse( data ) :
								data;
		} catch ( err ) {}

		return data;
	},

	// Expose our cache for testing purposes.
	nsNormalizeDict: nsNormalizeDict,

	// Take a data attribute property, prepend the namespace
	// and then camel case the attribute string. Add the result
	// to our nsNormalizeDict so we don't have to do this again.
	nsNormalize: function( prop ) {
		return nsNormalizeDict[ prop ] ||
			( nsNormalizeDict[ prop ] = $.camelCase( $.mobile.ns + prop ) );
	},

	// Find the closest javascript page element to gather settings data jsperf test
	// http://jsperf.com/single-complex-selector-vs-many-complex-selectors/edit
	// possibly naive, but it shows that the parsing overhead for *just* the page selector vs
	// the page and dialog selector is negligable. This could probably be speed up by
	// doing a similar parent node traversal to the one found in the inherited theme code above
	closestPageData: function( $target ) {
		return $target
			.closest( ":jqmData(role='page'), :jqmData(role='dialog')" )
				.data( "mobile-page" );
	}

} );

// Mobile version of data and removeData and hasData methods
// ensures all data is set and retrieved using jQuery Mobile's data namespace
$.fn.jqmData = function( prop, value ) {
	var result;
	if ( typeof prop !== "undefined" ) {
		if ( prop ) {
			prop = $.mobile.nsNormalize( prop );
		}

		// undefined is permitted as an explicit input for the second param
		// in this case it returns the value and does not set it to undefined
		if ( arguments.length < 2 || value === undefined ) {
			result = this.data( prop );
		} else {
			result = this.data( prop, value );
		}
	}
	return result;
};

$.jqmData = function( elem, prop, value ) {
	var result;
	if ( typeof prop !== "undefined" ) {
		result = $.data( elem, prop ? $.mobile.nsNormalize( prop ) : prop, value );
	}
	return result;
};

$.fn.jqmRemoveData = function( prop ) {
	return this.removeData( $.mobile.nsNormalize( prop ) );
};

$.jqmRemoveData = function( elem, prop ) {
	return $.removeData( elem, $.mobile.nsNormalize( prop ) );
};

$.find = function( selector, context, ret, extra ) {
	if ( selector.indexOf( ":jqmData" ) > -1 ) {
		selector = selector.replace( jqmDataRE, "[data-" + ( $.mobile.ns || "" ) + "$1]" );
	}

	return oldFind.call( this, selector, context, ret, extra );
};

$.extend( $.find, oldFind );

return $.mobile;
} );

/*!
 * jQuery Mobile Defaults @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Defaults
//>>group: Core
//>>description: Default values for jQuery Mobile
//>>css.structure: ../css/structure/jquery.mobile.core.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'defaults',[
			"jquery",
			"./ns" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

return $.extend( $.mobile, {

	hideUrlBar: true,

	// Keepnative Selector
	keepNative: ":jqmData(role='none'), :jqmData(role='nojs')",

	// Automatically handle clicks and form submissions through Ajax, when same-domain
	ajaxEnabled: true,

	// Automatically load and show pages based on location.hash
	hashListeningEnabled: true,

	// disable to prevent jquery from bothering with links
	linkBindingEnabled: true,

	// Set default page transition - 'none' for no transitions
	defaultPageTransition: "fade",

	// Set maximum window width for transitions to apply - 'false' for no limit
	maxTransitionWidth: false,

	// Set default dialog transition - 'none' for no transitions
	defaultDialogTransition: "pop",

	// Error response message - appears when an Ajax page request fails
	pageLoadErrorMessage: "Error Loading Page",

	// For error messages, which theme does the box use?
	pageLoadErrorMessageTheme: "a",

	// replace calls to window.history.back with phonegaps navigation helper
	// where it is provided on the window object
	phonegapNavigationEnabled: false,

	//automatically initialize the DOM when it's ready
	autoInitializePage: true,

	pushStateEnabled: true,

	// allows users to opt in to ignoring content by marking a parent element as
	// data-ignored
	ignoreContentEnabled: false,

	// default the property to remove dependency on assignment in init module
	pageContainer: $(),

	//enable cross-domain page support
	allowCrossDomainPages: false,

	dialogHashKey: "&ui-state=dialog"
} );
} );

/*!
 * jQuery Mobile Degrade Inputs @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Degrade Inputs
//>>group: Utilities
//>>description: Degrades HTM5 input types to compatible HTML4 ones.
//>>docs: http://api.jquerymobile.com/jQuery.mobile.degradeInputsWithin/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'degradeInputs',[
			"jquery",
			"defaults" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.mobile.degradeInputs = {
	range: "number",
	search: "text"
};

// Auto self-init widgets
$.mobile.degradeInputsWithin = function( target ) {
	target = typeof target === "string" ? $( target ) : target;

	// Degrade inputs to avoid poorly implemented native functionality
	target.find( "input" ).not( $.mobile.keepNative ).each( function() {
		var html, findstr, repstr,
			element = $( this ),
			type = this.getAttribute( "type" ),
			optType = $.mobile.degradeInputs[ type ] || "text";

		if ( $.mobile.degradeInputs[ type ] ) {
			html = $( "<div>" ).html( element.clone() ).html();

			findstr = /\s+type=["']?\w+['"]?/;
			repstr = " type=\"" + optType + "\" data-" + $.mobile.ns + "type=\"" + type + "\"";

			element.replaceWith( html.replace( findstr, repstr ) );
		}
	} );

};

var hook = function() {
	$.mobile.degradeInputsWithin( this.addBack() );
};

( $.enhance = $.extend( $.enhance, $.extend( { hooks: [] }, $.enhance ) ) ).hooks.unshift( hook );
return $.mobile.degradeInputsWithin;
} );

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/version',[ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

$.ui = $.ui || {};

return $.ui.version = "1.12.1";

} ) );

/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Keycode
//>>group: Core
//>>description: Provide keycodes as keynames
//>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/keycode',[ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};

} ) );

/*!
 * jQuery Mobile Helpers @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Helpers
//>>group: Core
//>>description: Helper functions and references
//>>css.structure: ../css/structure/jquery.mobile.core.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'helpers',[
			"jquery",
			"./ns",
			"jquery-ui/keycode" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

// Subtract the height of external toolbars from the page height, if the page does not have
// internal toolbars of the same type. We take care to use the widget options if we find a
// widget instance and the element's data-attributes otherwise.
var compensateToolbars = function( page, desiredHeight ) {
	var pageParent = page.parent(),
		toolbarsAffectingHeight = [],

		// We use this function to filter fixed toolbars with option updatePagePadding set to
		// true (which is the default) from our height subtraction, because fixed toolbars with
		// option updatePagePadding set to true compensate for their presence by adding padding
		// to the active page. We want to avoid double-counting by also subtracting their
		// height from the desired page height.
		noPadders = function() {
			var theElement = $( this ),
				widgetOptions = $.mobile.toolbar && theElement.data( "mobile-toolbar" ) ?
					theElement.toolbar( "option" ) : {
						position: theElement.attr( "data-" + $.mobile.ns + "position" ),
						updatePagePadding: ( theElement.attr( "data-" + $.mobile.ns +
								"update-page-padding" ) !== false )
					};

			return !( widgetOptions.position === "fixed" &&
				widgetOptions.updatePagePadding === true );
		},
		externalHeaders = pageParent.children( ":jqmData(type='header')" ).filter( noPadders ),
		internalHeaders = page.children( ":jqmData(type='header')" ),
		externalFooters = pageParent.children( ":jqmData(type='footer')" ).filter( noPadders ),
		internalFooters = page.children( ":jqmData(type='footer')" );

	// If we have no internal headers, but we do have external headers, then their height
	// reduces the page height
	if ( internalHeaders.length === 0 && externalHeaders.length > 0 ) {
		toolbarsAffectingHeight = toolbarsAffectingHeight.concat( externalHeaders.toArray() );
	}

	// If we have no internal footers, but we do have external footers, then their height
	// reduces the page height
	if ( internalFooters.length === 0 && externalFooters.length > 0 ) {
		toolbarsAffectingHeight = toolbarsAffectingHeight.concat( externalFooters.toArray() );
	}

	$.each( toolbarsAffectingHeight, function( index, value ) {
		desiredHeight -= $( value ).outerHeight();
	} );

	// Height must be at least zero
	return Math.max( 0, desiredHeight );
};

$.extend( $.mobile, {
	// define the window and the document objects
	window: $( window ),
	document: $( document ),

	// TODO: Remove and use $.ui.keyCode directly
	keyCode: $.ui.keyCode,

	// Place to store various widget extensions
	behaviors: {},

	// Custom logic for giving focus to a page
	focusPage: function( page ) {

		// First, look for an element explicitly marked for page focus
		var focusElement = page.find( "[autofocus]" );

		// If we do not find an element with the "autofocus" attribute, look for the page title
		if ( !focusElement.length ) {
			focusElement = page.find( ".ui-title" ).eq( 0 );
		}

		// Finally, fall back to focusing the page itself
		if ( !focusElement.length ) {
			focusElement = page;
		}

		focusElement.focus();
	},

	// Scroll page vertically: scroll to 0 to hide iOS address bar, or pass a Y value
	silentScroll: function( ypos ) {

		// If user has already scrolled then do nothing
		if ( $.mobile.window.scrollTop() > 0 ) {
			return;
		}

		if ( $.type( ypos ) !== "number" ) {
			ypos = $.mobile.defaultHomeScroll;
		}

		// prevent scrollstart and scrollstop events
		$.event.special.scrollstart.enabled = false;

		setTimeout( function() {
			window.scrollTo( 0, ypos );
			$.mobile.document.trigger( "silentscroll", { x: 0, y: ypos } );
		}, 20 );

		setTimeout( function() {
			$.event.special.scrollstart.enabled = true;
		}, 150 );
	},

	getClosestBaseUrl: function( ele ) {
		// Find the closest page and extract out its url.
		var url = $( ele ).closest( ".ui-page" ).jqmData( "url" ),
			base = $.mobile.path.documentBase.hrefNoHash;

		if ( !$.mobile.base.dynamicBaseEnabled || !url || !$.mobile.path.isPath( url ) ) {
			url = base;
		}

		return $.mobile.path.makeUrlAbsolute( url, base );
	},
	removeActiveLinkClass: function( forceRemoval ) {
		if ( !!$.mobile.activeClickedLink &&
				( !$.mobile.activeClickedLink.closest( ".ui-page-active" ).length ||
				forceRemoval ) ) {

			$.mobile.activeClickedLink.removeClass( "ui-button-active" );
		}
		$.mobile.activeClickedLink = null;
	},

	enhanceable: function( elements ) {
		return this.haveParents( elements, "enhance" );
	},

	hijackable: function( elements ) {
		return this.haveParents( elements, "ajax" );
	},

	haveParents: function( elements, attr ) {
		if ( !$.mobile.ignoreContentEnabled ) {
			return elements;
		}

		var count = elements.length,
			$newSet = $(),
			e, $element, excluded,
			i, c;

		for ( i = 0; i < count; i++ ) {
			$element = elements.eq( i );
			excluded = false;
			e = elements[ i ];

			while ( e ) {
				c = e.getAttribute ? e.getAttribute( "data-" + $.mobile.ns + attr ) : "";

				if ( c === "false" ) {
					excluded = true;
					break;
				}

				e = e.parentNode;
			}

			if ( !excluded ) {
				$newSet = $newSet.add( $element );
			}
		}

		return $newSet;
	},

	getScreenHeight: function() {
		// Native innerHeight returns more accurate value for this across platforms,
		// jQuery version is here as a normalized fallback for platforms like Symbian
		return window.innerHeight || $.mobile.window.height();
	},

	//simply set the active page's minimum height to screen height, depending on orientation
	resetActivePageHeight: function( height ) {
		var page = $( ".ui-page-active" ),
			pageHeight = page.height(),
			pageOuterHeight = page.outerHeight( true );

		height = compensateToolbars( page,
			( typeof height === "number" ) ? height : $( window ).height() );

		// Remove any previous min-height setting
		page.css( "min-height", "" );

		// Set the minimum height only if the height as determined by CSS is insufficient
		if ( page.height() < height ) {
			page.css( "min-height", height - ( pageOuterHeight - pageHeight ) );
		}
	},

	loading: function() {
		// If this is the first call to this function, instantiate a loader widget
		var loader = this.loading._widget || $.mobile.loader().element,

			// Call the appropriate method on the loader
			returnValue = loader.loader.apply( loader, arguments );

		// Make sure the loader is retained for future calls to this function.
		this.loading._widget = loader;

		return returnValue;
	},

	isElementCurrentlyVisible: function( el ) {
		el = typeof el === "string" ? $( el )[ 0 ] : el[ 0 ];

		if( !el ) {
			return true;
		}

		var rect = el.getBoundingClientRect();

		return (
			rect.bottom > 0 &&
			rect.right > 0 &&
			rect.top <
			( window.innerHeight || document.documentElement.clientHeight ) &&
			rect.left <
			( window.innerWidth || document.documentElement.clientWidth ) );
	}
} );

$.addDependents = function( elem, newDependents ) {
	var $elem = $( elem ),
		dependents = $elem.jqmData( "dependents" ) || $();

	$elem.jqmData( "dependents", $( dependents ).add( newDependents ) );
};

// plugins
$.fn.extend( {
	removeWithDependents: function() {
		$.removeWithDependents( this );
	},

	addDependents: function( newDependents ) {
		$.addDependents( this, newDependents );
	},

	// note that this helper doesn't attempt to handle the callback
	// or setting of an html element's text, its only purpose is
	// to return the html encoded version of the text in all cases. (thus the name)
	getEncodedText: function() {
		return $( "<a>" ).text( this.text() ).html();
	},

	// fluent helper function for the mobile namespaced equivalent
	jqmEnhanceable: function() {
		return $.mobile.enhanceable( this );
	},

	jqmHijackable: function() {
		return $.mobile.hijackable( this );
	}
} );

$.removeWithDependents = function( nativeElement ) {
	var element = $( nativeElement );

	( element.jqmData( "dependents" ) || $() ).remove();
	element.remove();
};
$.addDependents = function( nativeElement, newDependents ) {
	var element = $( nativeElement ),
		dependents = element.jqmData( "dependents" ) || $();

	element.jqmData( "dependents", $( dependents ).add( newDependents ) );
};

$.find.matches = function( expr, set ) {
	return $.find( expr, null, null, set );
};

$.find.matchesSelector = function( node, expr ) {
	return $.find( expr, null, null, [ node ] ).length > 0;
};

return $.mobile;
} );

/*!
 * jQuery Mobile Core @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>group: exclude

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'core',[
			"./defaults",
			"./data",
			"./helpers" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function() {} );

/*!
 * jQuery Mobile Match Media Polyfill @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Match Media Polyfill
//>>group: Utilities
//>>description: A workaround for browsers without window.matchMedia

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'media',[
			"jquery",
			"./core" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
window.matchMedia = window.matchMedia || ( function( doc, undefined ) {

	var bool,
		docElem = doc.documentElement,
		refNode = docElem.firstElementChild || docElem.firstChild,
		// fakeBody required for <FF4 when executed in <head>
		fakeBody = doc.createElement( "body" ),
		div = doc.createElement( "div" );

	div.id = "mq-test-1";
	div.style.cssText = "position:absolute;top:-100em";
	fakeBody.style.background = "none";
	fakeBody.appendChild( div );

	return function( q ) {

		div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

		docElem.insertBefore( fakeBody, refNode );
		bool = div.offsetWidth === 42;
		docElem.removeChild( fakeBody );

		return {
			matches: bool,
			media: q
		};

	};

}( document ) );

// $.mobile.media uses matchMedia to return a boolean.
$.mobile.media = function( q ) {
	var mediaQueryList = window.matchMedia( q );
	// Firefox returns null in a hidden iframe
	return mediaQueryList && mediaQueryList.matches;
};

return $.mobile.media;

} );

/*!
 * jQuery Mobile Touch Support Test @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Touch support test
//>>group: Core
//>>description: Touch feature test

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'support/touch',[
			"jquery",
			"../ns" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var support = {
	touch: "ontouchend" in document
};

$.mobile.support = $.mobile.support || {};
$.extend( $.support, support );
$.extend( $.mobile.support, support );

return $.support;
} );

/*!
 * jQuery Mobile Orientation @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Orientation support test
//>>group: Core
//>>description: Feature test for orientation

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'support/orientation',[ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.extend( $.support, {
	orientation: "orientation" in window && "onorientationchange" in window
} );

return $.support;
} );


/*!
 * jQuery Mobile Support Tests @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>description: Assorted tests to qualify browsers by detecting features
//>>label: Support Tests
//>>group: Core

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'support',[
			"jquery",
			"./core",
			"./media",
			"./support/touch",
			"./support/orientation" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var fakeBody = $( "<body>" ).prependTo( "html" ),
	fbCSS = fakeBody[ 0 ].style,
	vendors = [ "Webkit", "Moz", "O" ],
	webos = "palmGetResource" in window, //only used to rule out scrollTop
	operamini = window.operamini && ( {} ).toString.call( window.operamini ) === "[object OperaMini]",
	nokiaLTE7_3;

// thx Modernizr
function propExists( prop ) {
	var uc_prop = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ),
		props = ( prop + " " + vendors.join( uc_prop + " " ) + uc_prop ).split( " " ),
		v;

	for ( v in props ) {
		if ( fbCSS[ props[ v ] ] !== undefined ) {
			return true;
		}
	}
}
var bb = window.blackberry && !propExists( "-webkit-transform" ); //only used to rule out box shadow, as it's filled opaque on BB 5 and lower

// inline SVG support test
function inlineSVG() {
	// Thanks Modernizr & Erik Dahlstrom
	var w = window,
		svg = !!w.document.createElementNS && !!w.document.createElementNS( "http://www.w3.org/2000/svg", "svg" ).createSVGRect && !( w.opera && navigator.userAgent.indexOf( "Chrome" ) === -1 ),
		support = function( data ) {
			if ( !( data && svg ) ) {
				$( "html" ).addClass( "ui-nosvg" );
			}
		},
		img = new w.Image();

	img.onerror = function() {
		support( false );
	};
	img.onload = function() {
		support( img.width === 1 && img.height === 1 );
	};
	img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
}

function transform3dTest() {
	var mqProp = "transform-3d",
		// Because the `translate3d` test below throws false positives in Android:
		ret = $.mobile.media( "(-" + vendors.join( "-" + mqProp + "),(-" ) + "-" + mqProp + "),(" + mqProp + ")" ),
		el, transforms, t;

	if ( ret ) {
		return !!ret;
	}

	el = document.createElement( "div" );
	transforms = {
		// We’re omitting Opera for the time being; MS uses unprefixed.
		"MozTransform": "-moz-transform",
		"transform": "transform"
	};

	fakeBody.append( el );

	for ( t in transforms ) {
		if ( el.style[ t ] !== undefined ) {
			el.style[ t ] = "translate3d( 100px, 1px, 1px )";
			ret = window.getComputedStyle( el ).getPropertyValue( transforms[ t ] );
		}
	}
	return ( !!ret && ret !== "none" );
}

// Thanks Modernizr
function cssPointerEventsTest() {
	var element = document.createElement( "x" ),
		documentElement = document.documentElement,
		getComputedStyle = window.getComputedStyle,
		supports;

	if ( !( "pointerEvents" in element.style ) ) {
		return false;
	}

	element.style.pointerEvents = "auto";
	element.style.pointerEvents = "x";
	documentElement.appendChild( element );
	supports = getComputedStyle &&
		getComputedStyle( element, "" ).pointerEvents === "auto";
	documentElement.removeChild( element );
	return !!supports;
}

function boundingRect() {
	var div = document.createElement( "div" );
	return typeof div.getBoundingClientRect !== "undefined";
}

// non-UA-based IE version check by James Padolsey, modified by jdalton - from http://gist.github.com/527683
// allows for inclusion of IE 6+, including Windows Mobile 7
$.extend( $.mobile, { browser: {} } );
$.mobile.browser.oldIE = ( function() {
	var v = 3,
		div = document.createElement( "div" ),
		a = div.all || [];

	do {
		div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><br><![endif]-->";
	} while ( a[ 0 ] );

	return v > 4 ? v : !v;
} )();
$.mobile.browser.newIEMobile = ( function() {
	var div = document.createElement( "div" );
	return ( ( !$.mobile.browser.oldIE ) &&
		"onmsgesturehold" in div &&
		"ontouchstart" in div &&
		"onpointerdown" in div );
} )();

function fixedPosition() {
	var w = window,
		ua = navigator.userAgent,
		platform = navigator.platform,
		// Rendering engine is Webkit, and capture major version
		wkmatch = ua.match( /AppleWebKit\/([0-9]+)/ ),
		wkversion = !!wkmatch && wkmatch[ 1 ],
		ffmatch = ua.match( /Fennec\/([0-9]+)/ ),
		ffversion = !!ffmatch && ffmatch[ 1 ],
		operammobilematch = ua.match( /Opera Mobi\/([0-9]+)/ ),
		omversion = !!operammobilematch && operammobilematch[ 1 ];

	if (
			// iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
			( ( platform.indexOf( "iPhone" ) > -1 || platform.indexOf( "iPad" ) > -1 || platform.indexOf( "iPod" ) > -1 ) && wkversion && wkversion < 534 ) ||
			// Opera Mini
			( w.operamini && ( {} ).toString.call( w.operamini ) === "[object OperaMini]" ) ||
			( operammobilematch && omversion < 7458 ) ||
			//Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
			( ua.indexOf( "Android" ) > -1 && wkversion && wkversion < 533 ) ||
			// Firefox Mobile before 6.0 -
			( ffversion && ffversion < 6 ) ||
			// WebOS less than 3
			( "palmGetResource" in window && wkversion && wkversion < 534 ) ||
			// MeeGo
			( ua.indexOf( "MeeGo" ) > -1 && ua.indexOf( "NokiaBrowser/8.5.0" ) > -1 ) ) {
		return false;
	}

	return true;
}

$.extend( $.support, {
	// Note, Chrome for iOS has an extremely quirky implementation of popstate.
	// We've chosen to take the shortest path to a bug fix here for issue #5426
	// See the following link for information about the regex chosen
	// https://developers.google.com/chrome/mobile/docs/user-agent#chrome_for_ios_user-agent
	pushState: "pushState" in history &&
		"replaceState" in history &&
		// When running inside a FF iframe, calling replaceState causes an error
		!( window.navigator.userAgent.indexOf( "Firefox" ) >= 0 && window.top !== window ) &&
		( window.navigator.userAgent.search( /CriOS/ ) === -1 ),

	mediaquery: $.mobile.media( "only all" ),
	cssPseudoElement: !!propExists( "content" ),
	touchOverflow: !!propExists( "overflowScrolling" ),
	cssTransform3d: transform3dTest(),
	boxShadow: !!propExists( "boxShadow" ) && !bb,
	fixedPosition: fixedPosition(),
	scrollTop: ( "pageXOffset" in window ||
		"scrollTop" in document.documentElement ||
		"scrollTop" in fakeBody[ 0 ] ) && !webos && !operamini,

	cssPointerEvents: cssPointerEventsTest(),
	boundingRect: boundingRect(),
	inlineSVG: inlineSVG
} );

fakeBody.remove();

// $.mobile.ajaxBlacklist is used to override ajaxEnabled on platforms that have known conflicts with hash history updates (BB5, Symbian)
// or that generally work better browsing in regular http for full page refreshes (Opera Mini)
// Note: This detection below is used as a last resort.
// We recommend only using these detection methods when all other more reliable/forward-looking approaches are not possible
nokiaLTE7_3 = ( function() {

	var ua = window.navigator.userAgent;

	//The following is an attempt to match Nokia browsers that are running Symbian/s60, with webkit, version 7.3 or older
	return ua.indexOf( "Nokia" ) > -1 &&
		( ua.indexOf( "Symbian/3" ) > -1 || ua.indexOf( "Series60/5" ) > -1 ) &&
		ua.indexOf( "AppleWebKit" ) > -1 &&
		ua.match( /(BrowserNG|NokiaBrowser)\/7\.[0-3]/ );
} )();

// Support conditions that must be met in order to proceed
// default enhanced qualifications are media query support OR IE 7+

$.mobile.gradeA = function() {
	return ( ( $.support.mediaquery && $.support.cssPseudoElement ) || $.mobile.browser.oldIE && $.mobile.browser.oldIE >= 8 ) && ( $.support.boundingRect || $.fn.jquery.match( /1\.[0-7+]\.[0-9+]?/ ) !== null );
};

$.mobile.ajaxBlacklist =
	// BlackBerry browsers, pre-webkit
	window.blackberry && !window.WebKitPoint ||
	// Opera Mini
	operamini ||
	// Symbian webkits pre 7.3
	nokiaLTE7_3;

// Lastly, this workaround is the only way we've found so far to get pre 7.3 Symbian webkit devices
// to render the stylesheets when they're referenced before this script, as we'd recommend doing.
// This simply reappends the CSS in place, which for some reason makes it apply
if ( nokiaLTE7_3 ) {
	$( function() {
		$( "head link[rel='stylesheet']" ).attr( "rel", "alternate stylesheet" ).attr( "rel", "stylesheet" );
	} );
}

// For ruling out shadows via css
if ( !$.support.boxShadow ) {
	$( "html" ).addClass( "ui-noboxshadow" );
}

return $.support;

} );

/*!
 * jQuery Mobile Navigate Event @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Navigate
//>>group: Events
//>>description: Provides a wrapper around hashchange and popstate
//>>docs: http://api.jquerymobile.com/navigate/
//>>demos: http://api.jquerymobile.com/@VERSION/navigation/

// TODO break out pushstate support test so we don't depend on the whole thing
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'events/navigate',[
			"jquery",
			"./../ns",
			"./../support" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var $win = $.mobile.window, self,
	dummyFnToInitNavigate = function() {};

$.event.special.beforenavigate = {
	setup: function() {
		$win.on( "navigate", dummyFnToInitNavigate );
	},

	teardown: function() {
		$win.off( "navigate", dummyFnToInitNavigate );
	}
};

$.event.special.navigate = self = {
	bound: false,

	pushStateEnabled: true,

	originalEventName: undefined,

	// If pushstate support is present and push state support is defined to
	// be true on the mobile namespace.
	isPushStateEnabled: function() {
		return $.support.pushState &&
			$.mobile.pushStateEnabled === true &&
			this.isHashChangeEnabled();
	},

	// !! assumes mobile namespace is present
	isHashChangeEnabled: function() {
		return $.mobile.hashListeningEnabled === true;
	},

	// TODO a lot of duplication between popstate and hashchange
	popstate: function( event ) {
		var newEvent, beforeNavigate, state;

		if ( event.isDefaultPrevented() ) {
			return;
		}

		newEvent = new $.Event( "navigate" );
		beforeNavigate = new $.Event( "beforenavigate" );
		state = event.originalEvent.state || {};

		beforeNavigate.originalEvent = event;
		$win.trigger( beforeNavigate );

		if ( beforeNavigate.isDefaultPrevented() ) {
			return;
		}

		if ( event.historyState ) {
			$.extend( state, event.historyState );
		}

		// Make sure the original event is tracked for the end
		// user to inspect incase they want to do something special
		newEvent.originalEvent = event;

		// NOTE we let the current stack unwind because any assignment to
		//      location.hash will stop the world and run this event handler. By
		//      doing this we create a similar behavior to hashchange on hash
		//      assignment
		setTimeout( function() {
			$win.trigger( newEvent, {
				state: state
			} );
		}, 0 );
	},

	hashchange: function( event /*, data */ ) {
		var newEvent = new $.Event( "navigate" ),
			beforeNavigate = new $.Event( "beforenavigate" );

		beforeNavigate.originalEvent = event;
		$win.trigger( beforeNavigate );

		if ( beforeNavigate.isDefaultPrevented() ) {
			return;
		}

		// Make sure the original event is tracked for the end
		// user to inspect incase they want to do something special
		newEvent.originalEvent = event;

		// Trigger the hashchange with state provided by the user
		// that altered the hash
		$win.trigger( newEvent, {
			// Users that want to fully normalize the two events
			// will need to do history management down the stack and
			// add the state to the event before this binding is fired
			// TODO consider allowing for the explicit addition of callbacks
			//      to be fired before this value is set to avoid event timing issues
			state: event.hashchangeState || {}
		} );
	},

	// TODO We really only want to set this up once
	//      but I'm not clear if there's a beter way to achieve
	//      this with the jQuery special event structure
	setup: function( /* data, namespaces */ ) {
		if ( self.bound ) {
			return;
		}

		self.bound = true;

		if ( self.isPushStateEnabled() ) {
			self.originalEventName = "popstate";
			$win.bind( "popstate.navigate", self.popstate );
		} else if ( self.isHashChangeEnabled() ) {
			self.originalEventName = "hashchange";
			$win.bind( "hashchange.navigate", self.hashchange );
		}
	}
};

return $.event.special.navigate;
} );

/*!
 * jQuery Mobile Scroll Events @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Scroll
//>>group: Events
//>>description: Scroll events including: scrollstart, scrollstop

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'events/scroll',[ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var scrollEvent = "touchmove scroll";

// setup new event shortcuts
$.each( [ "scrollstart", "scrollstop" ], function( i, name ) {

	$.fn[ name ] = function( fn ) {
		return fn ? this.bind( name, fn ) : this.trigger( name );
	};

	// jQuery < 1.8
	if ( $.attrFn ) {
		$.attrFn[ name ] = true;
	}
} );

// also handles scrollstop
$.event.special.scrollstart = {

	enabled: true,
	setup: function() {

		var thisObject = this,
			$this = $( thisObject ),
			scrolling,
			timer;

		function trigger( event, state ) {
			var originalEventType = event.type;

			scrolling = state;

			event.type = scrolling ? "scrollstart" : "scrollstop";
			$.event.dispatch.call( thisObject, event );
			event.type = originalEventType;
		}

		var scrollStartHandler = $.event.special.scrollstart.handler = function ( event ) {

			if ( !$.event.special.scrollstart.enabled ) {
				return;
			}

			if ( !scrolling ) {
				trigger( event, true );
			}

			clearTimeout( timer );
			timer = setTimeout( function() {
				trigger( event, false );
			}, 50 );
		};

		// iPhone triggers scroll after a small delay; use touchmove instead
		$this.on( scrollEvent, scrollStartHandler );
	},
	teardown: function() {
		$( this ).off( scrollEvent, $.event.special.scrollstart.handler );
	}
};

$.each( {
	scrollstop: "scrollstart"
}, function( event, sourceEvent ) {

	$.event.special[ event ] = {
		setup: function() {
			$( this ).bind( sourceEvent, $.noop );
		},
		teardown: function() {
			$( this ).unbind( sourceEvent );
		}
	};
} );

return $.event.special;
} );

/*!
 * jQuery Mobile Path Utility @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Path Helpers
//>>group: Navigation
//>>description: Path parsing and manipulation helpers
//>>docs: http://api.jquerymobile.com/category/methods/path/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'navigation/path',[
			"jquery",
			"./../ns" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var path, $base,
	dialogHashKey = "&ui-state=dialog";

$.mobile.path = path = {
	uiStateKey: "&ui-state",

	// This scary looking regular expression parses an absolute URL or its relative
	// variants (protocol, site, document, query, and hash), into the various
	// components (protocol, host, path, query, fragment, etc that make up the
	// URL as well as some other commonly used sub-parts. When used with RegExp.exec()
	// or String.match, it parses the URL into a results array that looks like this:
	//
	//     [0]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread#msg-content
	//     [1]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread
	//     [2]: http://jblas:password@mycompany.com:8080/mail/inbox
	//     [3]: http://jblas:password@mycompany.com:8080
	//     [4]: http:
	//     [5]: //
	//     [6]: jblas:password@mycompany.com:8080
	//     [7]: jblas:password
	//     [8]: jblas
	//     [9]: password
	//    [10]: mycompany.com:8080
	//    [11]: mycompany.com
	//    [12]: 8080
	//    [13]: /mail/inbox
	//    [14]: /mail/
	//    [15]: inbox
	//    [16]: ?msg=1234&type=unread
	//    [17]: #msg-content
	//
	urlParseRE: /^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,

	// Abstraction to address xss (Issue #4787) by removing the authority in
	// browsers that auto-decode it. All references to location.href should be
	// replaced with a call to this method so that it can be dealt with properly here
	getLocation: function( url ) {
		var parsedUrl = this.parseUrl( url || location.href ),
			uri = url ? parsedUrl : location,

			// Make sure to parse the url or the location object for the hash because using
			// location.hash is autodecoded in firefox, the rest of the url should be from
			// the object (location unless we're testing) to avoid the inclusion of the
			// authority
			hash = parsedUrl.hash;

		// mimic the browser with an empty string when the hash is empty
		hash = hash === "#" ? "" : hash;

		return uri.protocol +
			parsedUrl.doubleSlash +
			uri.host +

			// The pathname must start with a slash if there's a protocol, because you
			// can't have a protocol followed by a relative path. Also, it's impossible to
			// calculate absolute URLs from relative ones if the absolute one doesn't have
			// a leading "/".
			( ( uri.protocol !== "" && uri.pathname.substring( 0, 1 ) !== "/" ) ?
				"/" : "" ) +
			uri.pathname +
			uri.search +
			hash;
	},

	//return the original document url
	getDocumentUrl: function( asParsedObject ) {
		return asParsedObject ? $.extend( {}, path.documentUrl ) : path.documentUrl.href;
	},

	parseLocation: function() {
		return this.parseUrl( this.getLocation() );
	},

	//Parse a URL into a structure that allows easy access to
	//all of the URL components by name.
	parseUrl: function( url ) {
		// If we're passed an object, we'll assume that it is
		// a parsed url object and just return it back to the caller.
		if ( $.type( url ) === "object" ) {
			return url;
		}

		var matches = path.urlParseRE.exec( url || "" ) || [];

		// Create an object that allows the caller to access the sub-matches
		// by name. Note that IE returns an empty string instead of undefined,
		// like all other browsers do, so we normalize everything so its consistent
		// no matter what browser we're running on.
		return {
			href: matches[ 0 ] || "",
			hrefNoHash: matches[ 1 ] || "",
			hrefNoSearch: matches[ 2 ] || "",
			domain: matches[ 3 ] || "",
			protocol: matches[ 4 ] || "",
			doubleSlash: matches[ 5 ] || "",
			authority: matches[ 6 ] || "",
			username: matches[ 8 ] || "",
			password: matches[ 9 ] || "",
			host: matches[ 10 ] || "",
			hostname: matches[ 11 ] || "",
			port: matches[ 12 ] || "",
			pathname: matches[ 13 ] || "",
			directory: matches[ 14 ] || "",
			filename: matches[ 15 ] || "",
			search: matches[ 16 ] || "",
			hash: matches[ 17 ] || ""
		};
	},

	//Turn relPath into an asbolute path. absPath is
	//an optional absolute path which describes what
	//relPath is relative to.
	makePathAbsolute: function( relPath, absPath ) {
		var absStack,
			relStack,
			i, d;

		if ( relPath && relPath.charAt( 0 ) === "/" ) {
			return relPath;
		}

		relPath = relPath || "";
		absPath = absPath ? absPath.replace( /^\/|(\/[^\/]*|[^\/]+)$/g, "" ) : "";

		absStack = absPath ? absPath.split( "/" ) : [];
		relStack = relPath.split( "/" );

		for ( i = 0; i < relStack.length; i++ ) {
			d = relStack[ i ];
			switch ( d ) {
			case ".":
				break;
			case "..":
				if ( absStack.length ) {
					absStack.pop();
				}
				break;
			default:
				absStack.push( d );
				break;
			}
		}
		return "/" + absStack.join( "/" );
	},

	//Returns true if both urls have the same domain.
	isSameDomain: function( absUrl1, absUrl2 ) {
		return path.parseUrl( absUrl1 ).domain.toLowerCase() ===
			path.parseUrl( absUrl2 ).domain.toLowerCase();
	},

	//Returns true for any relative variant.
	isRelativeUrl: function( url ) {
		// All relative Url variants have one thing in common, no protocol.
		return path.parseUrl( url ).protocol === "";
	},

	//Returns true for an absolute url.
	isAbsoluteUrl: function( url ) {
		return path.parseUrl( url ).protocol !== "";
	},

	//Turn the specified realtive URL into an absolute one. This function
	//can handle all relative variants (protocol, site, document, query, fragment).
	makeUrlAbsolute: function( relUrl, absUrl ) {
		if ( !path.isRelativeUrl( relUrl ) ) {
			return relUrl;
		}

		if ( absUrl === undefined ) {
			absUrl = this.documentBase;
		}

		var relObj = path.parseUrl( relUrl ),
			absObj = path.parseUrl( absUrl ),
			protocol = relObj.protocol || absObj.protocol,
			doubleSlash = relObj.protocol ? relObj.doubleSlash : ( relObj.doubleSlash || absObj.doubleSlash ),
			authority = relObj.authority || absObj.authority,
			hasPath = relObj.pathname !== "",
			pathname = path.makePathAbsolute( relObj.pathname || absObj.filename, absObj.pathname ),
			search = relObj.search || ( !hasPath && absObj.search ) || "",
			hash = relObj.hash;

		return protocol + doubleSlash + authority + pathname + search + hash;
	},

	//Add search (aka query) params to the specified url.
	addSearchParams: function( url, params ) {
		var u = path.parseUrl( url ),
			p = ( typeof params === "object" ) ? $.param( params ) : params,
			s = u.search || "?";
		return u.hrefNoSearch + s + ( s.charAt( s.length - 1 ) !== "?" ? "&" : "" ) + p + ( u.hash || "" );
	},

	convertUrlToDataUrl: function( absUrl ) {
		var result = absUrl,
			u = path.parseUrl( absUrl );

		if ( path.isEmbeddedPage( u ) ) {
			// For embedded pages, remove the dialog hash key as in getFilePath(),
			// and remove otherwise the Data Url won't match the id of the embedded Page.
			result = u.hash
				.split( dialogHashKey )[ 0 ]
				.replace( /^#/, "" )
				.replace( /\?.*$/, "" );
		} else if ( path.isSameDomain( u, this.documentBase ) ) {
			result = u.hrefNoHash.replace( this.documentBase.domain, "" ).split( dialogHashKey )[ 0 ];
		}

		return window.decodeURIComponent( result );
	},

	//get path from current hash, or from a file path
	get: function( newPath ) {
		if ( newPath === undefined ) {
			newPath = path.parseLocation().hash;
		}
		return path.stripHash( newPath ).replace( /[^\/]*\.[^\/*]+$/, "" );
	},

	//set location hash to path
	set: function( path ) {
		location.hash = path;
	},

	//test if a given url (string) is a path
	//NOTE might be exceptionally naive
	isPath: function( url ) {
		return ( /\// ).test( url );
	},

	//return a url path with the window's location protocol/hostname/pathname removed
	clean: function( url ) {
		return url.replace( this.documentBase.domain, "" );
	},

	//just return the url without an initial #
	stripHash: function( url ) {
		return url.replace( /^#/, "" );
	},

	stripQueryParams: function( url ) {
		return url.replace( /\?.*$/, "" );
	},

	//remove the preceding hash, any query params, and dialog notations
	cleanHash: function( hash ) {
		return path.stripHash( hash.replace( /\?.*$/, "" ).replace( dialogHashKey, "" ) );
	},

	isHashValid: function( hash ) {
		return ( /^#[^#]+$/ ).test( hash );
	},

	//check whether a url is referencing the same domain, or an external domain or different protocol
	//could be mailto, etc
	isExternal: function( url ) {
		var u = path.parseUrl( url );

		return !!( u.protocol &&
			( u.domain.toLowerCase() !== this.documentUrl.domain.toLowerCase() ) );
	},

	hasProtocol: function( url ) {
		return ( /^(:?\w+:)/ ).test( url );
	},

	isEmbeddedPage: function( url ) {
		var u = path.parseUrl( url );

		//if the path is absolute, then we need to compare the url against
		//both the this.documentUrl and the documentBase. The main reason for this
		//is that links embedded within external documents will refer to the
		//application document, whereas links embedded within the application
		//document will be resolved against the document base.
		if ( u.protocol !== "" ) {
			return ( !this.isPath( u.hash ) && u.hash && ( u.hrefNoHash === this.documentUrl.hrefNoHash || ( this.documentBaseDiffers && u.hrefNoHash === this.documentBase.hrefNoHash ) ) );
		}
		return ( /^#/ ).test( u.href );
	},

	squash: function( url, resolutionUrl ) {
		var href, cleanedUrl, search, stateIndex, docUrl,
			isPath = this.isPath( url ),
			uri = this.parseUrl( url ),
			preservedHash = uri.hash,
			uiState = "";

		// produce a url against which we can resolve the provided path
		if ( !resolutionUrl ) {
			if ( isPath ) {
				resolutionUrl = path.getLocation();
			} else {
				docUrl = path.getDocumentUrl( true );
				if ( path.isPath( docUrl.hash ) ) {
					resolutionUrl = path.squash( docUrl.href );
				} else {
					resolutionUrl = docUrl.href;
				}
			}
		}

		// If the url is anything but a simple string, remove any preceding hash
		// eg #foo/bar -> foo/bar
		//    #foo -> #foo
		cleanedUrl = isPath ? path.stripHash( url ) : url;

		// If the url is a full url with a hash check if the parsed hash is a path
		// if it is, strip the #, and use it otherwise continue without change
		cleanedUrl = path.isPath( uri.hash ) ? path.stripHash( uri.hash ) : cleanedUrl;

		// Split the UI State keys off the href
		stateIndex = cleanedUrl.indexOf( this.uiStateKey );

		// store the ui state keys for use
		if ( stateIndex > -1 ) {
			uiState = cleanedUrl.slice( stateIndex );
			cleanedUrl = cleanedUrl.slice( 0, stateIndex );
		}

		// make the cleanedUrl absolute relative to the resolution url
		href = path.makeUrlAbsolute( cleanedUrl, resolutionUrl );

		// grab the search from the resolved url since parsing from
		// the passed url may not yield the correct result
		search = this.parseUrl( href ).search;

		// TODO all this crap is terrible, clean it up
		if ( isPath ) {
			// reject the hash if it's a path or it's just a dialog key
			if ( path.isPath( preservedHash ) || preservedHash.replace( "#", "" ).indexOf( this.uiStateKey ) === 0 ) {
				preservedHash = "";
			}

			// Append the UI State keys where it exists and it's been removed
			// from the url
			if ( uiState && preservedHash.indexOf( this.uiStateKey ) === -1 ) {
				preservedHash += uiState;
			}

			// make sure that pound is on the front of the hash
			if ( preservedHash.indexOf( "#" ) === -1 && preservedHash !== "" ) {
				preservedHash = "#" + preservedHash;
			}

			// reconstruct each of the pieces with the new search string and hash
			href = path.parseUrl( href );
			href = href.protocol + href.doubleSlash + href.host + href.pathname + search +
				preservedHash;
		} else {
			href += href.indexOf( "#" ) > -1 ? uiState : "#" + uiState;
		}

		return href;
	},

	isPreservableHash: function( hash ) {
		return hash.replace( "#", "" ).indexOf( this.uiStateKey ) === 0;
	},

	// Escape weird characters in the hash if it is to be used as a selector
	hashToSelector: function( hash ) {
		var hasHash = ( hash.substring( 0, 1 ) === "#" );
		if ( hasHash ) {
			hash = hash.substring( 1 );
		}
		return ( hasHash ? "#" : "" ) + hash.replace( /([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, "\\$1" );
	},

	// return the substring of a filepath before the dialogHashKey, for making a server
	// request
	getFilePath: function( path ) {
		return path && path.split( dialogHashKey )[ 0 ];
	},

	// check if the specified url refers to the first page in the main
	// application document.
	isFirstPageUrl: function( url ) {
		// We only deal with absolute paths.
		var u = path.parseUrl( path.makeUrlAbsolute( url, this.documentBase ) ),

			// Does the url have the same path as the document?
			samePath = u.hrefNoHash === this.documentUrl.hrefNoHash ||
				( this.documentBaseDiffers &&
				u.hrefNoHash === this.documentBase.hrefNoHash ),

			// Get the first page element.
			fp = $.mobile.firstPage,

			// Get the id of the first page element if it has one.
			fpId = fp && fp[ 0 ] ? fp[ 0 ].id : undefined;

		// The url refers to the first page if the path matches the document and
		// it either has no hash value, or the hash is exactly equal to the id
		// of the first page element.
		return samePath &&
			( !u.hash ||
			u.hash === "#" ||
			( fpId && u.hash.replace( /^#/, "" ) === fpId ) );
	},

	// Some embedded browsers, like the web view in Phone Gap, allow
	// cross-domain XHR requests if the document doing the request was loaded
	// via the file:// protocol. This is usually to allow the application to
	// "phone home" and fetch app specific data. We normally let the browser
	// handle external/cross-domain urls, but if the allowCrossDomainPages
	// option is true, we will allow cross-domain http/https requests to go
	// through our page loading logic.
	isPermittedCrossDomainRequest: function( docUrl, reqUrl ) {
		return $.mobile.allowCrossDomainPages &&
			( docUrl.protocol === "file:" || docUrl.protocol === "content:" ) &&
			reqUrl.search( /^https?:/ ) !== -1;
	}
};

path.documentUrl = path.parseLocation();

$base = $( "head" ).find( "base" );

path.documentBase = $base.length ?
	path.parseUrl( path.makeUrlAbsolute( $base.attr( "href" ), path.documentUrl.href ) ) :
	path.documentUrl;

path.documentBaseDiffers = ( path.documentUrl.hrefNoHash !== path.documentBase.hrefNoHash );

//return the original document base url
path.getDocumentBase = function( asParsedObject ) {
	return asParsedObject ? $.extend( {}, path.documentBase ) : path.documentBase.href;
};

return path;
} );

/*!
 * jQuery Mobile Base Tag Support @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Base Tag
//>>group: Navigation
//>>description: Dynamic Base Tag Support

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'navigation/base',[
			"jquery",
			"./path",
			"./../ns" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var base,

	// Existing base tag?
	baseElement = $( "head" ).children( "base" ),

	// DEPRECATED as of 1.5.0 and will be removed in 1.6.0. As of 1.6.0 only
	// base.dynamicBaseEnabled will be checked
	getDynamicEnabled = function() {

		// If a value has been set at the old, deprecated location, we return that value.
		// Otherwise we return the value from the new location. We check explicitly for
		// undefined because true and false are both valid values for dynamicBaseEnabled.
		if ( $.mobile.dynamicBaseEnabled !== undefined ) {
			return $.mobile.dynamicBaseEnabled;
		}
		return base.dynamicBaseEnabled;
	};

// base element management, defined depending on dynamic base tag support
// TODO move to external widget
base = {

	// Disable the alteration of the dynamic base tag or links
	dynamicBaseEnabled: true,

	// Make sure base element is defined, for use in routing asset urls that are referenced
	// in Ajax-requested markup
	element: function() {
		if ( !( baseElement && baseElement.length ) ) {
			baseElement = $( "<base>", { href: $.mobile.path.documentBase.hrefNoSearch } )
				.prependTo( $( "head" ) );
		}

		return baseElement;
	},

	// set the generated BASE element's href to a new page's base path
	set: function( href ) {

		// We should do nothing if the user wants to manage their url base manually.
		// Note: Our method of ascertaining whether the user wants to manager their url base
		// manually is DEPRECATED as of 1.5.0 and will be removed in 1.6.0. As of 1.6.0 the
		// flag base.dynamicBaseEnabled will be checked, so the function getDynamicEnabled()
		// will be removed.
		if ( !getDynamicEnabled() ) {
			return;
		}

		// we should use the base tag if we can manipulate it dynamically
		base.element().attr( "href",
			$.mobile.path.makeUrlAbsolute( href, $.mobile.path.documentBase ) );
	},

	// set the generated BASE element's href to a new page's base path
	reset: function( /* href */ ) {

		// DEPRECATED as of 1.5.0 and will be removed in 1.6.0. As of 1.6.0 only
		// base.dynamicBaseEnabled will be checked
		if ( !getDynamicEnabled() ) {
			return;
		}

		base.element().attr( "href", $.mobile.path.documentBase.hrefNoSearch );
	}
};

$.mobile.base = base;

return base;
} );

/*!
 * jQuery Mobile History Manager @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: History Manager
//>>group: Navigation
//>>description: Manages a stack of history entries. Used exclusively by the Navigation Manager
//>>demos: http://demos.jquerymobile.com/@VERSION/navigation/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'navigation/history',[
			"jquery",
			"./../ns",
			"./path" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.mobile.History = function( stack, index ) {
	this.stack = stack || [];
	this.activeIndex = index || 0;
};

$.extend( $.mobile.History.prototype, {
	getActive: function() {
		return this.stack[ this.activeIndex ];
	},

	getLast: function() {
		return this.stack[ this.previousIndex ];
	},

	getNext: function() {
		return this.stack[ this.activeIndex + 1 ];
	},

	getPrev: function() {
		return this.stack[ this.activeIndex - 1 ];
	},

	// addNew is used whenever a new page is added
	add: function( url, data ) {
		data = data || {};

		//if there's forward history, wipe it
		if ( this.getNext() ) {
			this.clearForward();
		}

		// if the hash is included in the data make sure the shape
		// is consistent for comparison
		if ( data.hash && data.hash.indexOf( "#" ) === -1 ) {
			data.hash = "#" + data.hash;
		}

		data.url = url;
		this.stack.push( data );
		this.activeIndex = this.stack.length - 1;
	},

	//wipe urls ahead of active index
	clearForward: function() {
		this.stack = this.stack.slice( 0, this.activeIndex + 1 );
	},

	find: function( url, stack, earlyReturn ) {
		stack = stack || this.stack;

		var entry, i,
			length = stack.length, index;

		for ( i = 0; i < length; i++ ) {
			entry = stack[ i ];

			if ( decodeURIComponent( url ) === decodeURIComponent( entry.url ) ||
					decodeURIComponent( url ) === decodeURIComponent( entry.hash ) ) {
				index = i;

				if ( earlyReturn ) {
					return index;
				}
			}
		}

		return index;
	},

	_findById: function( id ) {
		var stackIndex,
			stackLength = this.stack.length;

		for ( stackIndex = 0; stackIndex < stackLength; stackIndex++ ) {
			if ( this.stack[ stackIndex ].id === id ) {
				break;
			}
		}

		return ( stackIndex < stackLength ? stackIndex : undefined );
	},

	closest: function( url, id ) {
		var closest = ( id === undefined ? undefined : this._findById( id ) ),
			a = this.activeIndex;

		// First, we check whether we've found an entry by id. If so, we're done.
		if ( closest !== undefined ) {
			return closest;
		}

		// Failing that take the slice of the history stack before the current index and search
		// for a url match. If one is found, we'll avoid avoid looking through forward history
		// NOTE the preference for backward history movement is driven by the fact that
		//      most mobile browsers only have a dedicated back button, and users rarely use
		//      the forward button in desktop browser anyhow
		closest = this.find( url, this.stack.slice( 0, a ) );

		// If nothing was found in backward history check forward. The `true`
		// value passed as the third parameter causes the find method to break
		// on the first match in the forward history slice. The starting index
		// of the slice must then be added to the result to get the element index
		// in the original history stack :( :(
		//
		// TODO this is hyper confusing and should be cleaned up (ugh so bad)
		if ( closest === undefined ) {
			closest = this.find( url, this.stack.slice( a ), true );
			closest = closest === undefined ? closest : closest + a;
		}

		return closest;
	},

	direct: function( opts ) {
		var newActiveIndex = this.closest( opts.url, opts.id ),
			a = this.activeIndex;

		// save new page index, null check to prevent falsey 0 result
		// record the previous index for reference
		if ( newActiveIndex !== undefined ) {
			this.activeIndex = newActiveIndex;
			this.previousIndex = a;
		}

		// invoke callbacks where appropriate
		//
		// TODO this is also convoluted and confusing
		if ( newActiveIndex < a ) {
			( opts.present || opts.back || $.noop )( this.getActive(), "back" );
		} else if ( newActiveIndex > a ) {
			( opts.present || opts.forward || $.noop )( this.getActive(), "forward" );
		} else if ( newActiveIndex === undefined && opts.missing ) {
			opts.missing( this.getActive() );
		}
	}
} );

return $.mobile.History;
} );

/*!
 * jQuery Mobile Navigator @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Navigation Manager
//>>group: Navigation
//>>description: Manages URL history and information in conjunction with the navigate event

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'navigation/navigator',[
			"jquery",
			"./../ns",
			"../events/navigate",
			"./path",
			"./history" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var path = $.mobile.path,
	initialHref = location.href;

$.mobile.Navigator = function( history ) {
	this.history = history;
	this.ignoreInitialHashChange = true;

	$.mobile.window.bind( {
		"popstate.history": $.proxy( this.popstate, this ),
		"hashchange.history": $.proxy( this.hashchange, this )
	} );
};

$.extend( $.mobile.Navigator.prototype, {
	historyEntryId: 0,
	squash: function( url, data ) {
		var state, href,
			hash = path.isPath( url ) ? path.stripHash( url ) : url;

		href = path.squash( url );

		// make sure to provide this information when it isn't explicitly set in the
		// data object that was passed to the squash method
		state = $.extend( {
			id: ++this.historyEntryId,
			hash: hash,
			url: href
		}, data );

		// replace the current url with the new href and store the state
		// Note that in some cases we might be replacing an url with the
		// same url. We do this anyways because we need to make sure that
		// all of our history entries have a state object associated with
		// them. This allows us to work around the case where $.mobile.back()
		// is called to transition from an external page to an embedded page.
		// In that particular case, a hashchange event is *NOT* generated by the browser.
		// Ensuring each history entry has a state object means that onPopState()
		// will always trigger our hashchange callback even when a hashchange event
		// is not fired.
		//
		//  Check is to make sure that jqm doesn't throw type errors in environments where
		//  window.history is not available (e.g. Chrome packaged apps)
		if ( window.history && window.history.replaceState ) {
			window.history.replaceState( state, state.title || document.title, href );
		}

		// If we haven't yet received the initial popstate, we need to update the reference
		// href so that we compare against the correct location
		if ( this.ignoreInitialHashChange ) {
			initialHref = href;
		}

		return state;
	},

	hash: function( url, href ) {
		var parsed, loc, hash, resolved;

		// Grab the hash for recording. If the passed url is a path
		// we used the parsed version of the squashed url to reconstruct,
		// otherwise we assume it's a hash and store it directly
		parsed = path.parseUrl( url );
		loc = path.parseLocation();

		if ( loc.pathname + loc.search === parsed.pathname + parsed.search ) {
			// If the pathname and search of the passed url is identical to the current loc
			// then we must use the hash. Otherwise there will be no event
			// eg, url = "/foo/bar?baz#bang", location.href = "http://example.com/foo/bar?baz"
			hash = parsed.hash ? parsed.hash : parsed.pathname + parsed.search;
		} else if ( path.isPath( url ) ) {
			resolved = path.parseUrl( href );
			// If the passed url is a path, make it domain relative and remove any trailing hash
			hash = resolved.pathname + resolved.search + ( path.isPreservableHash( resolved.hash ) ? resolved.hash.replace( "#", "" ) : "" );
		} else {
			hash = url;
		}

		return hash;
	},

	// TODO reconsider name
	go: function( url, data, noEvents ) {
		var state, href, hash, popstateEvent,
			isPopStateEvent = $.event.special.navigate.isPushStateEnabled();

		// Get the url as it would look squashed on to the current resolution url
		href = path.squash( url );

		// sort out what the hash sould be from the url
		hash = this.hash( url, href );

		// Here we prevent the next hash change or popstate event from doing any
		// history management. In the case of hashchange we don't swallow it
		// if there will be no hashchange fired (since that won't reset the value)
		// and will swallow the following hashchange
		if ( noEvents && hash !== path.stripHash( path.parseLocation().hash ) ) {
			this.preventNextHashChange = noEvents;
		}

		// IMPORTANT in the case where popstate is supported the event will be triggered
		//      directly, stopping further execution - ie, interupting the flow of this
		//      method call to fire bindings at this expression. Below the navigate method
		//      there is a binding to catch this event and stop its propagation.
		//
		//      We then trigger a new popstate event on the window with a null state
		//      so that the navigate events can conclude their work properly
		//
		// if the url is a path we want to preserve the query params that are available on
		// the current url.
		this.preventHashAssignPopState = true;
		window.location.hash = hash;

		// If popstate is enabled and the browser triggers `popstate` events when the hash
		// is set (this often happens immediately in browsers like Chrome), then the
		// this flag will be set to false already. If it's a browser that does not trigger
		// a `popstate` on hash assignement or `replaceState` then we need avoid the branch
		// that swallows the event created by the popstate generated by the hash assignment
		// At the time of this writing this happens with Opera 12 and some version of IE
		this.preventHashAssignPopState = false;

		state = $.extend( {
			url: href,
			hash: hash,
			title: document.title
		}, data );

		if ( isPopStateEvent ) {
			popstateEvent = new $.Event( "popstate" );
			popstateEvent.originalEvent = new $.Event( "popstate", { state: null } );

			state.id = ( this.squash( url, state ) || {} ).id;

			// Trigger a new faux popstate event to replace the one that we
			// caught that was triggered by the hash setting above.
			if ( !noEvents ) {
				this.ignorePopState = true;
				$.mobile.window.trigger( popstateEvent );
			}
		}

		// record the history entry so that the information can be included
		// in hashchange event driven navigate events in a similar fashion to
		// the state that's provided by popstate
		this.history.add( state.url, state );
	},

	// This binding is intended to catch the popstate events that are fired
	// when execution of the `$.navigate` method stops at window.location.hash = url;
	// and completely prevent them from propagating. The popstate event will then be
	// retriggered after execution resumes
	//
	// TODO grab the original event here and use it for the synthetic event in the
	//      second half of the navigate execution that will follow this binding
	popstate: function( event ) {
		var hash, state;

		// Partly to support our test suite which manually alters the support
		// value to test hashchange. Partly to prevent all around weirdness
		if ( !$.event.special.navigate.isPushStateEnabled() ) {
			return;
		}

		// If this is the popstate triggered by the actual alteration of the hash
		// prevent it completely. History is tracked manually
		if ( this.preventHashAssignPopState ) {
			this.preventHashAssignPopState = false;
			event.stopImmediatePropagation();
			return;
		}

		// if this is the popstate triggered after the `replaceState` call in the go
		// method, then simply ignore it. The history entry has already been captured
		if ( this.ignorePopState ) {
			this.ignorePopState = false;
			return;
		}

		// If there is no state, and the history stack length is one were
		// probably getting the page load popstate fired by browsers like chrome
		// avoid it and set the one time flag to false.
		// TODO: Do we really need all these conditions? Comparing location hrefs
		// should be sufficient.
		if ( !event.originalEvent.state &&
				this.history.stack.length === 1 &&
				this.ignoreInitialHashChange ) {
			this.ignoreInitialHashChange = false;

			if ( location.href === initialHref ) {
				event.preventDefault();
				return;
			}
		}

		// account for direct manipulation of the hash. That is, we will receive a popstate
		// when the hash is changed by assignment, and it won't have a state associated. We
		// then need to squash the hash. See below for handling of hash assignment that
		// matches an existing history entry
		// TODO it might be better to only add to the history stack
		//      when the hash is adjacent to the active history entry
		hash = path.parseLocation().hash;
		if ( !event.originalEvent.state && hash ) {
			// squash the hash that's been assigned on the URL with replaceState
			// also grab the resulting state object for storage
			state = this.squash( hash );

			// record the new hash as an additional history entry
			// to match the browser's treatment of hash assignment
			this.history.add( state.url, state );

			// pass the newly created state information
			// along with the event
			event.historyState = state;

			// do not alter history, we've added a new history entry
			// so we know where we are
			return;
		}

		// If all else fails this is a popstate that comes from the back or forward buttons
		// make sure to set the state of our history stack properly, and record the directionality
		this.history.direct( {
			id: ( event.originalEvent.state || {} ).id,
			url: ( event.originalEvent.state || {} ).url || hash,

			// When the url is either forward or backward in history include the entry
			// as data on the event object for merging as data in the navigate event
			present: function( historyEntry, direction ) {
				// make sure to create a new object to pass down as the navigate event data
				event.historyState = $.extend( {}, historyEntry );
				event.historyState.direction = direction;
			}
		} );
	},

	// NOTE must bind before `navigate` special event hashchange binding otherwise the
	//      navigation data won't be attached to the hashchange event in time for those
	//      bindings to attach it to the `navigate` special event
	// TODO add a check here that `hashchange.navigate` is bound already otherwise it's
	//      broken (exception?)
	hashchange: function( event ) {
		var history, hash;

		// If hashchange listening is explicitly disabled or pushstate is supported
		// avoid making use of the hashchange handler.
		if ( !$.event.special.navigate.isHashChangeEnabled() ||
				$.event.special.navigate.isPushStateEnabled() ) {
			return;
		}

		// On occasion explicitly want to prevent the next hash from propagating because we only
		// with to alter the url to represent the new state do so here
		if ( this.preventNextHashChange ) {
			this.preventNextHashChange = false;
			event.stopImmediatePropagation();
			return;
		}

		history = this.history;
		hash = path.parseLocation().hash;

		// If this is a hashchange caused by the back or forward button
		// make sure to set the state of our history stack properly
		this.history.direct( {
			url: hash,

			// When the url is either forward or backward in history include the entry
			// as data on the event object for merging as data in the navigate event
			present: function( historyEntry, direction ) {
				// make sure to create a new object to pass down as the navigate event data
				event.hashchangeState = $.extend( {}, historyEntry );
				event.hashchangeState.direction = direction;
			},

			// When we don't find a hash in our history clearly we're aiming to go there
			// record the entry as new for future traversal
			//
			// NOTE it's not entirely clear that this is the right thing to do given that we
			//      can't know the users intention. It might be better to explicitly _not_
			//      support location.hash assignment in preference to $.navigate calls
			// TODO first arg to add should be the href, but it causes issues in identifying
			//      embedded pages
			missing: function() {
				history.add( hash, {
					hash: hash,
					title: document.title
				} );
			}
		} );
	}
} );

return $.mobile.Navigator;
} );

/*!
 * jQuery Mobile Navigate Method @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Navigate Method
//>>group: Navigation
//>>description: A wrapper for the primary Navigator and History objects in jQuery Mobile
//>>docs: http://api.jquerymobile.com/jQuery.mobile.navigate/
//>>demos: http://demos.jquerymobile.com/@VERSION/navigation/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'navigation/method',[
			"jquery",
			"./path",
			"./history",
			"./navigator" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

// TODO consider queueing navigation activity until previous activities have completed
//      so that end users don't have to think about it. Punting for now
// TODO !! move the event bindings into callbacks on the navigate event
$.mobile.navigate = function( url, data, noEvents ) {
	$.mobile.navigate.navigator.go( url, data, noEvents );
};

// expose the history on the navigate method in anticipation of full integration with
// existing navigation functionalty that is tightly coupled to the history information
$.mobile.navigate.history = new $.mobile.History();

// instantiate an instance of the navigator for use within the $.navigate method
$.mobile.navigate.navigator = new $.mobile.Navigator( $.mobile.navigate.history );

var loc = $.mobile.path.parseLocation();
$.mobile.navigate.history.add( loc.href, { hash: loc.hash } );

return $.mobile.navigate;
} );

/*!
 * jQuery Mobile Transition @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Transition Core
//>>group: Transitions
//>>description: Animated page change base constructor and logic
//>>demos: http://demos.jquerymobile.com/@VERSION/transitions/
//>>css.structure: ../css/structure/jquery.mobile.transition.css
//>>css.structure: ../css/structure/jquery.mobile.transition.fade.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'transitions/transition',[
			"jquery",
			"../core",

			// TODO event.special.scrollstart
			"../events/scroll",
			"../animationComplete" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

// TODO remove direct references to $.mobile and properties, we should
//      favor injection with params to the constructor
$.mobile.Transition = function() {
	this.init.apply( this, arguments );
};

$.extend( $.mobile.Transition.prototype, {
	toPreClass: " ui-page-pre-in",

	init: function( name, reverse, $to, $from ) {
		$.extend( this, {
			name: name,
			reverse: reverse,
			$to: $to,
			$from: $from,
			deferred: new $.Deferred()
		} );
	},

	cleanFrom: function() {
		this.$from
			.removeClass( "ui-page-active out in reverse " + this.name )
			.height( "" );
	},

	// NOTE overridden by child object prototypes, noop'd here as defaults
	beforeDoneIn: function() {},
	beforeDoneOut: function() {},
	beforeStartOut: function() {},

	doneIn: function() {
		this.beforeDoneIn();

		this.$to.removeClass( "out in reverse " + this.name ).height( "" );

		this.toggleViewportClass();

		// In some browsers (iOS5), 3D transitions block the ability to scroll to the desired location during transition
		// This ensures we jump to that spot after the fact, if we aren't there already.
		if ( $.mobile.window.scrollTop() !== this.toScroll ) {
			this.scrollPage();
		}
		if ( !this.sequential ) {
			this.$to.addClass( "ui-page-active" );
		}
		this.deferred.resolve( this.name, this.reverse, this.$to, this.$from, true );
	},

	doneOut: function( screenHeight, reverseClass, none, preventFocus ) {
		this.beforeDoneOut();
		this.startIn( screenHeight, reverseClass, none, preventFocus );
	},

	hideIn: function( callback ) {
		// Prevent flickering in phonegap container: see comments at #4024 regarding iOS
		this.$to.css( "z-index", -10 );
		callback.call( this );
		this.$to.css( "z-index", "" );
	},

	scrollPage: function() {
		// By using scrollTo instead of silentScroll, we can keep things better in order
		// Just to be precautios, disable scrollstart listening like silentScroll would
		$.event.special.scrollstart.enabled = false;
		//if we are hiding the url bar or the page was previously scrolled scroll to hide or return to position
		if ( $.mobile.hideUrlBar || this.toScroll !== $.mobile.defaultHomeScroll ) {
			window.scrollTo( 0, this.toScroll );
		}

		// reenable scrollstart listening like silentScroll would
		setTimeout( function() {
			$.event.special.scrollstart.enabled = true;
		}, 150 );
	},

	startIn: function( screenHeight, reverseClass, none, preventFocus ) {
		this.hideIn( function() {
			this.$to.addClass( "ui-page-active" + this.toPreClass );

			// Send focus to page as it is now display: block
			if ( !preventFocus ) {
				$.mobile.focusPage( this.$to );
			}

			// Set to page height
			this.$to.height( screenHeight + this.toScroll );

			if ( !none ) {
				this.scrollPage();
			}
		} );

		this.$to
			.removeClass( this.toPreClass )
			.addClass( this.name + " in " + reverseClass );

		if ( !none ) {
			this.$to.animationComplete( $.proxy( function() {
				this.doneIn();
			}, this ) );
		} else {
			this.doneIn();
		}

	},

	startOut: function( screenHeight, reverseClass, none ) {
		this.beforeStartOut( screenHeight, reverseClass, none );

		// Set the from page's height and start it transitioning out
		// Note: setting an explicit height helps eliminate tiling in the transitions
		this.$from
			.height( screenHeight + $.mobile.window.scrollTop() )
			.addClass( this.name + " out" + reverseClass );
	},

	toggleViewportClass: function() {
		this.$to.closest( ".ui-pagecontainer" ).toggleClass( "ui-mobile-viewport-transitioning viewport-" + this.name );
	},

	transition: function( toScroll ) {
		// NOTE many of these could be calculated/recorded in the constructor, it's my
		//      opinion that binding them as late as possible has value with regards to
		//      better transitions with fewer bugs. Ie, it's not guaranteed that the
		//      object will be created and transition will be run immediately after as
		//      it is today. So we wait until transition is invoked to gather the following
		var none,
			reverseClass = this.reverse ? " reverse" : "",
			screenHeight = $( window ).height(),
			maxTransitionOverride = $.mobile.maxTransitionWidth !== false &&
				$.mobile.window.width() > $.mobile.maxTransitionWidth;

		this.toScroll = ( toScroll ? toScroll : 0 );

		none = !$.support.cssTransitions || !$.support.cssAnimations ||
			maxTransitionOverride || !this.name || this.name === "none" ||
			Math.max( $.mobile.window.scrollTop(), this.toScroll ) >
			$.mobile.getMaxScrollForTransition();

		this.toggleViewportClass();

		if ( this.$from && !none ) {
			this.startOut( screenHeight, reverseClass, none );
		} else {
			this.doneOut( screenHeight, reverseClass, none, true );
		}

		return this.deferred.promise();
	}
} );

return $.mobile.Transition;
} );

/*!
 * jQuery Mobile Concurrent Transition @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Transition Concurrent
//>>group: Transitions
//>>description: Animated page change with concurrent transition style application
//>>demos: http://demos.jquerymobile.com/@VERSION/transitions/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'transitions/concurrent',[
			"jquery",
			"./transition" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.mobile.ConcurrentTransition = function() {
	this.init.apply( this, arguments );
};

$.extend( $.mobile.ConcurrentTransition.prototype, $.mobile.Transition.prototype, {
	sequential: false,

	beforeDoneIn: function() {
		if ( this.$from ) {
			this.cleanFrom();
		}
	},

	beforeStartOut: function( screenHeight, reverseClass, none ) {
		this.doneOut( screenHeight, reverseClass, none );
	}
} );

return $.mobile.ConcurrentTransition;
} );

/*!
 * jQuery Mobile Serial Transition @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Transition Serial
//>>group: Transitions
//>>description: Animated page change with serial transition style application
//>>demos: http://demos.jquerymobile.com/@VERSION/transitions/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'transitions/serial',[
			"jquery",
			"../animationComplete",
			"./transition" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.mobile.SerialTransition = function() {
	this.init.apply( this, arguments );
};

$.extend( $.mobile.SerialTransition.prototype, $.mobile.Transition.prototype, {
	sequential: true,

	beforeDoneOut: function() {
		if ( this.$from ) {
			this.cleanFrom();
		}
	},

	beforeStartOut: function( screenHeight, reverseClass, none ) {
		this.$from.animationComplete( $.proxy( function() {
			this.doneOut( screenHeight, reverseClass, none );
		}, this ) );
	}
} );

return $.mobile.SerialTransition;
} );

/*!
 * jQuery Mobile Transition Handlers @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Transition Handlers
//>>group: Transitions
//>>description: Animated page change handlers for integrating with Navigation
//>>demos: http://demos.jquerymobile.com/@VERSION/transitions/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'transitions/handlers',[
			"jquery",
			"../core",
			"./serial",
			"./concurrent" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

// generate the handlers from the above
var defaultGetMaxScrollForTransition = function() {
	return $( window ).height() * 3;
};

//transition handler dictionary for 3rd party transitions
$.mobile.transitionHandlers = {
	"sequential": $.mobile.SerialTransition,
	"simultaneous": $.mobile.ConcurrentTransition
};

// Make our transition handler the public default.
$.mobile.defaultTransitionHandler = $.mobile.transitionHandlers.sequential;

$.mobile.transitionFallbacks = {};

// If transition is defined, check if css 3D transforms are supported, and if not, if a fallback is specified
$.mobile._maybeDegradeTransition = function( transition ) {
	if ( transition && !$.support.cssTransform3d && $.mobile.transitionFallbacks[ transition ] ) {
		transition = $.mobile.transitionFallbacks[ transition ];
	}

	return transition;
};

// Set the getMaxScrollForTransition to default if no implementation was set by user
$.mobile.getMaxScrollForTransition = $.mobile.getMaxScrollForTransition || defaultGetMaxScrollForTransition;

return $.mobile.transitionHandlers;
} );

/*!
 * jQuery Mobile Virtual Mouse @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Virtual Mouse (vmouse) Bindings
//>>group: Core
//>>description: Normalizes touch/mouse events.
//>>docs: http://api.jquerymobile.com/?s=vmouse

// This plugin is an experiment for abstracting away the touch and mouse
// events so that developers don't have to worry about which method of input
// the device their document is loaded on supports.
//
// The idea here is to allow the developer to register listeners for the
// basic mouse events, such as mousedown, mousemove, mouseup, and click,
// and the plugin will take care of registering the correct listeners
// behind the scenes to invoke the listener at the fastest possible time
// for that device, while still retaining the order of event firing in
// the traditional mouse environment, should multiple handlers be registered
// on the same element for different events.
//
// The current version exposes the following virtual events to jQuery bind methods:
// "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel"

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'vmouse',[ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var dataPropertyName = "virtualMouseBindings",
	touchTargetPropertyName = "virtualTouchID",
	touchEventProps = "clientX clientY pageX pageY screenX screenY".split( " " ),
	virtualEventNames = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split( " " ),
	generalProps = ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),
	mouseHookProps = $.event.mouseHooks ? $.event.mouseHooks.props : [],
	mouseEventProps = generalProps.concat( mouseHookProps ),
	activeDocHandlers = {},
	resetTimerID = 0,
	startX = 0,
	startY = 0,
	didScroll = false,
	clickBlockList = [],
	blockMouseTriggers = false,
	blockTouchTriggers = false,
	eventCaptureSupported = "addEventListener" in document,
	$document = $( document ),
	nextTouchID = 1,
	lastTouchID = 0, threshold,
	i;

$.vmouse = {
	moveDistanceThreshold: 10,
	clickDistanceThreshold: 10,
	resetTimerDuration: 1500,
	maximumTimeBetweenTouches: 100
};

function getNativeEvent( event ) {

	while ( event && typeof event.originalEvent !== "undefined" ) {
		event = event.originalEvent;
	}
	return event;
}

function createVirtualEvent( event, eventType ) {

	var t = event.type,
		oe, props, ne, prop, ct, touch, i, j, len;

	event = $.Event( event );
	event.type = eventType;

	oe = event.originalEvent;
	props = generalProps;

	// addresses separation of $.event.props in to $.event.mouseHook.props and Issue 3280
	// https://github.com/jquery/jquery-mobile/issues/3280
	if ( t.search( /^(mouse|click)/ ) > -1 ) {
		props = mouseEventProps;
	}

	// copy original event properties over to the new event
	// this would happen if we could call $.event.fix instead of $.Event
	// but we don't have a way to force an event to be fixed multiple times
	if ( oe ) {
		for ( i = props.length; i; ) {
			prop = props[ --i ];
			event[ prop ] = oe[ prop ];
		}
	}

	// make sure that if the mouse and click virtual events are generated
	// without a .which one is defined
	if ( t.search( /mouse(down|up)|click/ ) > -1 && !event.which ) {
		event.which = 1;
	}

	if ( t.search( /^touch/ ) !== -1 ) {
		ne = getNativeEvent( oe );
		t = ne.touches;
		ct = ne.changedTouches;
		touch = ( t && t.length ) ? t[ 0 ] : ( ( ct && ct.length ) ? ct[ 0 ] : undefined );

		if ( touch ) {
			for ( j = 0, len = touchEventProps.length; j < len; j++ ) {
				prop = touchEventProps[ j ];
				event[ prop ] = touch[ prop ];
			}
		}
	}

	return event;
}

function getVirtualBindingFlags( element ) {

	var flags = {},
		b, k;

	while ( element ) {

		b = $.data( element, dataPropertyName );

		for ( k in b ) {
			if ( b[ k ] ) {
				flags[ k ] = flags.hasVirtualBinding = true;
			}
		}
		element = element.parentNode;
	}
	return flags;
}

function getClosestElementWithVirtualBinding( element, eventType ) {
	var b;
	while ( element ) {

		b = $.data( element, dataPropertyName );

		if ( b && ( !eventType || b[ eventType ] ) ) {
			return element;
		}
		element = element.parentNode;
	}
	return null;
}

function enableTouchBindings() {
	blockTouchTriggers = false;
}

function disableTouchBindings() {
	blockTouchTriggers = true;
}

function enableMouseBindings() {
	lastTouchID = 0;
	clickBlockList.length = 0;
	blockMouseTriggers = false;

	// When mouse bindings are enabled, our
	// touch bindings are disabled.
	disableTouchBindings();
}

function disableMouseBindings() {
	// When mouse bindings are disabled, our
	// touch bindings are enabled.
	enableTouchBindings();
}

function clearResetTimer() {
	if ( resetTimerID ) {
		clearTimeout( resetTimerID );
		resetTimerID = 0;
	}
}

function startResetTimer() {
	clearResetTimer();
	resetTimerID = setTimeout( function() {
		resetTimerID = 0;
		enableMouseBindings();
	}, $.vmouse.resetTimerDuration );
}

function triggerVirtualEvent( eventType, event, flags ) {
	var ve;

	if ( ( flags && flags[ eventType ] ) ||
			( !flags && getClosestElementWithVirtualBinding( event.target, eventType ) ) ) {

		ve = createVirtualEvent( event, eventType );

		$( event.target ).trigger( ve );
	}

	return ve;
}

function mouseEventCallback( event ) {
	var touchID = $.data( event.target, touchTargetPropertyName ),
		ve;

	// It is unexpected if a click event is received before a touchend
	// or touchmove event, however this is a known behavior in Mobile
	// Safari when Mobile VoiceOver (as of iOS 8) is enabled and the user
	// double taps to activate a link element. In these cases if a touch
	// event is not received within the maximum time between touches,
	// re-enable mouse bindings and call the mouse event handler again.
	if ( event.type === "click" && $.data( event.target, "lastTouchType" ) === "touchstart" ) {
		setTimeout( function() {
			if ( $.data( event.target, "lastTouchType" ) === "touchstart" ) {
				enableMouseBindings();
				delete $.data( event.target ).lastTouchType;
				mouseEventCallback( event );
			}
		}, $.vmouse.maximumTimeBetweenTouches );
	}

	if ( !blockMouseTriggers && ( !lastTouchID || lastTouchID !== touchID ) ) {
		ve = triggerVirtualEvent( "v" + event.type, event );
		if ( ve ) {
			if ( ve.isDefaultPrevented() ) {
				event.preventDefault();
			}
			if ( ve.isPropagationStopped() ) {
				event.stopPropagation();
			}
			if ( ve.isImmediatePropagationStopped() ) {
				event.stopImmediatePropagation();
			}
		}
	}
}

function handleTouchStart( event ) {

	var touches = getNativeEvent( event ).touches,
		target, flags, t;

	if ( touches && touches.length === 1 ) {

		target = event.target;
		flags = getVirtualBindingFlags( target );

		$.data( event.target, "lastTouchType", event.type );

		if ( flags.hasVirtualBinding ) {

			lastTouchID = nextTouchID++;
			$.data( target, touchTargetPropertyName, lastTouchID );

			clearResetTimer();

			disableMouseBindings();
			didScroll = false;

			t = getNativeEvent( event ).touches[ 0 ];
			startX = t.pageX;
			startY = t.pageY;

			triggerVirtualEvent( "vmouseover", event, flags );
			triggerVirtualEvent( "vmousedown", event, flags );
		}
	}
}

function handleScroll( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	if ( !didScroll ) {
		triggerVirtualEvent( "vmousecancel", event, getVirtualBindingFlags( event.target ) );
	}

	$.data( event.target, "lastTouchType", event.type );

	didScroll = true;
	startResetTimer();
}

function handleTouchMove( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	var t = getNativeEvent( event ).touches[ 0 ],
		didCancel = didScroll,
		moveThreshold = $.vmouse.moveDistanceThreshold,
		flags = getVirtualBindingFlags( event.target );

	$.data( event.target, "lastTouchType", event.type );

	didScroll = didScroll ||
		( Math.abs( t.pageX - startX ) > moveThreshold ||
		Math.abs( t.pageY - startY ) > moveThreshold );

	if ( didScroll && !didCancel ) {
		triggerVirtualEvent( "vmousecancel", event, flags );
	}

	triggerVirtualEvent( "vmousemove", event, flags );
	startResetTimer();
}

function handleTouchEnd( event ) {
	if ( blockTouchTriggers || $.data( event.target, "lastTouchType" ) === undefined ) {
		return;
	}

	disableTouchBindings();
	delete $.data( event.target ).lastTouchType;

	var flags = getVirtualBindingFlags( event.target ),
		ve, t;
	triggerVirtualEvent( "vmouseup", event, flags );

	if ( !didScroll ) {
		ve = triggerVirtualEvent( "vclick", event, flags );
		if ( ve && ve.isDefaultPrevented() ) {
			// The target of the mouse events that follow the touchend
			// event don't necessarily match the target used during the
			// touch. This means we need to rely on coordinates for blocking
			// any click that is generated.
			t = getNativeEvent( event ).changedTouches[ 0 ];
			clickBlockList.push( {
				touchID: lastTouchID,
				x: t.clientX,
				y: t.clientY
			} );

			// Prevent any mouse events that follow from triggering
			// virtual event notifications.
			blockMouseTriggers = true;
		}
	}
	triggerVirtualEvent( "vmouseout", event, flags );
	didScroll = false;

	startResetTimer();
}

function hasVirtualBindings( ele ) {
	var bindings = $.data( ele, dataPropertyName ),
		k;

	if ( bindings ) {
		for ( k in bindings ) {
			if ( bindings[ k ] ) {
				return true;
			}
		}
	}
	return false;
}

function dummyMouseHandler() {
}

function getSpecialEventObject( eventType ) {
	var realType = eventType.substr( 1 );

	return {
		setup: function( /* data, namespace */ ) {
			// If this is the first virtual mouse binding for this element,
			// add a bindings object to its data.

			if ( !hasVirtualBindings( this ) ) {
				$.data( this, dataPropertyName, {} );
			}

			// If setup is called, we know it is the first binding for this
			// eventType, so initialize the count for the eventType to zero.
			var bindings = $.data( this, dataPropertyName );
			bindings[ eventType ] = true;

			// If this is the first virtual mouse event for this type,
			// register a global handler on the document.

			activeDocHandlers[ eventType ] = ( activeDocHandlers[ eventType ] || 0 ) + 1;

			if ( activeDocHandlers[ eventType ] === 1 ) {
				$document.bind( realType, mouseEventCallback );
			}

			// Some browsers, like Opera Mini, won't dispatch mouse/click events
			// for elements unless they actually have handlers registered on them.
			// To get around this, we register dummy handlers on the elements.

			$( this ).bind( realType, dummyMouseHandler );

			// For now, if event capture is not supported, we rely on mouse handlers.
			if ( eventCaptureSupported ) {
				// If this is the first virtual mouse binding for the document,
				// register our touchstart handler on the document.

				activeDocHandlers[ "touchstart" ] = ( activeDocHandlers[ "touchstart" ] || 0 ) + 1;

				if ( activeDocHandlers[ "touchstart" ] === 1 ) {
					$document.bind( "touchstart", handleTouchStart )
						.bind( "touchend", handleTouchEnd )

						// On touch platforms, touching the screen and then dragging your finger
						// causes the window content to scroll after some distance threshold is
						// exceeded. On these platforms, a scroll prevents a click event from being
						// dispatched, and on some platforms, even the touchend is suppressed. To
						// mimic the suppression of the click event, we need to watch for a scroll
						// event. Unfortunately, some platforms like iOS don't dispatch scroll
						// events until *AFTER* the user lifts their finger (touchend). This means
						// we need to watch both scroll and touchmove events to figure out whether
						// or not a scroll happenens before the touchend event is fired.

						.bind( "touchmove", handleTouchMove )
						.bind( "scroll", handleScroll );
				}
			}
		},

		teardown: function( /* data, namespace */ ) {
			// If this is the last virtual binding for this eventType,
			// remove its global handler from the document.

			--activeDocHandlers[eventType];

			if ( !activeDocHandlers[ eventType ] ) {
				$document.unbind( realType, mouseEventCallback );
			}

			if ( eventCaptureSupported ) {
				// If this is the last virtual mouse binding in existence,
				// remove our document touchstart listener.

				--activeDocHandlers["touchstart"];

				if ( !activeDocHandlers[ "touchstart" ] ) {
					$document.unbind( "touchstart", handleTouchStart )
						.unbind( "touchmove", handleTouchMove )
						.unbind( "touchend", handleTouchEnd )
						.unbind( "scroll", handleScroll );
				}
			}

			var $this = $( this ),
				bindings = $.data( this, dataPropertyName );

			// teardown may be called when an element was
			// removed from the DOM. If this is the case,
			// jQuery core may have already stripped the element
			// of any data bindings so we need to check it before
			// using it.
			if ( bindings ) {
				bindings[ eventType ] = false;
			}

			// Unregister the dummy event handler.

			$this.unbind( realType, dummyMouseHandler );

			// If this is the last virtual mouse binding on the
			// element, remove the binding data from the element.

			if ( !hasVirtualBindings( this ) ) {
				$this.removeData( dataPropertyName );
			}
		}
	};
}

// Expose our custom events to the jQuery bind/unbind mechanism.

for ( i = 0; i < virtualEventNames.length; i++ ) {
	$.event.special[ virtualEventNames[ i ] ] = getSpecialEventObject( virtualEventNames[ i ] );
}

// Add a capture click handler to block clicks.
// Note that we require event capture support for this so if the device
// doesn't support it, we punt for now and rely solely on mouse events.
if ( eventCaptureSupported ) {
	document.addEventListener( "click", function( e ) {
		var cnt = clickBlockList.length,
			target = e.target,
			x, y, ele, i, o, touchID;

		if ( cnt ) {
			x = e.clientX;
			y = e.clientY;
			threshold = $.vmouse.clickDistanceThreshold;

			// The idea here is to run through the clickBlockList to see if
			// the current click event is in the proximity of one of our
			// vclick events that had preventDefault() called on it. If we find
			// one, then we block the click.
			//
			// Why do we have to rely on proximity?
			//
			// Because the target of the touch event that triggered the vclick
			// can be different from the target of the click event synthesized
			// by the browser. The target of a mouse/click event that is synthesized
			// from a touch event seems to be implementation specific. For example,
			// some browsers will fire mouse/click events for a link that is near
			// a touch event, even though the target of the touchstart/touchend event
			// says the user touched outside the link. Also, it seems that with most
			// browsers, the target of the mouse/click event is not calculated until the
			// time it is dispatched, so if you replace an element that you touched
			// with another element, the target of the mouse/click will be the new
			// element underneath that point.
			//
			// Aside from proximity, we also check to see if the target and any
			// of its ancestors were the ones that blocked a click. This is necessary
			// because of the strange mouse/click target calculation done in the
			// Android 2.1 browser, where if you click on an element, and there is a
			// mouse/click handler on one of its ancestors, the target will be the
			// innermost child of the touched element, even if that child is no where
			// near the point of touch.

			ele = target;

			while ( ele ) {
				for ( i = 0; i < cnt; i++ ) {
					o = clickBlockList[ i ];
					touchID = 0;

					if ( ( ele === target && Math.abs( o.x - x ) < threshold && Math.abs( o.y - y ) < threshold ) ||
							$.data( ele, touchTargetPropertyName ) === o.touchID ) {
						// XXX: We may want to consider removing matches from the block list
						//      instead of waiting for the reset timer to fire.
						e.preventDefault();
						e.stopPropagation();
						return;
					}
				}
				ele = ele.parentNode;
			}
		}
	}, true );
}
} );

/*!
 * jQuery UI Widget 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/widget',[ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

var widgetUuid = 0;
var widgetSlice = Array.prototype.slice;

$.cleanData = ( function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// Http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
} )( $.cleanData );

$.widget = function( name, base, prototype ) {
	var existingConstructor, constructor, basePrototype;

	// ProxiedPrototype allows the provided prototype to remain unmodified
	// so that it can be used as a mixin for multiple widgets (#8876)
	var proxiedPrototype = {};

	var namespace = name.split( "." )[ 0 ];
	name = name.split( "." )[ 1 ];
	var fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	if ( $.isArray( prototype ) ) {
		prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
	}

	// Create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {

		// Allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// Allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	// Extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,

		// Copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),

		// Track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	} );

	basePrototype = new base();

	// We need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = ( function() {
			function _super() {
				return base.prototype[ prop ].apply( this, arguments );
			}

			function _superApply( args ) {
				return base.prototype[ prop ].apply( this, args );
			}

			return function() {
				var __super = this._super;
				var __superApply = this._superApply;
				var returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		} )();
	} );
	constructor.prototype = $.widget.extend( basePrototype, {

		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	} );

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// Redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
				child._proto );
		} );

		// Remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widgetSlice.call( arguments, 1 );
	var inputIndex = 0;
	var inputLength = input.length;
	var key;
	var value;

	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :

						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );

				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string";
		var args = widgetSlice.call( arguments, 1 );
		var returnValue = this;

		if ( isMethodCall ) {

			// If this is an empty collection, we need to have the instance method
			// return undefined instead of the jQuery instance
			if ( !this.length && options === "instance" ) {
				returnValue = undefined;
			} else {
				this.each( function() {
					var methodValue;
					var instance = $.data( this, fullName );

					if ( options === "instance" ) {
						returnValue = instance;
						return false;
					}

					if ( !instance ) {
						return $.error( "cannot call methods on " + name +
							" prior to initialization; " +
							"attempted to call method '" + options + "'" );
					}

					if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
						return $.error( "no such method '" + options + "' for " + name +
							" widget instance" );
					}

					methodValue = instance[ options ].apply( instance, args );

					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false;
					}
				} );
			}
		} else {

			// Allow multiple hashes to be passed on init
			if ( args.length ) {
				options = $.widget.extend.apply( null, [ options ].concat( args ) );
			}

			this.each( function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			} );
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",

	options: {
		classes: {},
		disabled: false,

		// Callbacks
		create: null
	},

	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widgetUuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();
		this.classesElementLookup = {};

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			} );
			this.document = $( element.style ?

				// Element within the document
				element.ownerDocument :

				// Element is window or document
				element.document || element );
			this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();

		if ( this.options.disabled ) {
			this._setOptionDisabled( this.options.disabled );
		}

		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},

	_getCreateOptions: function() {
		return {};
	},

	_getCreateEventData: $.noop,

	_create: $.noop,

	_init: $.noop,

	destroy: function() {
		var that = this;

		this._destroy();
		$.each( this.classesElementLookup, function( key, value ) {
			that._removeClass( value, key );
		} );

		// We can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.off( this.eventNamespace )
			.removeData( this.widgetFullName );
		this.widget()
			.off( this.eventNamespace )
			.removeAttr( "aria-disabled" );

		// Clean up events and states
		this.bindings.off( this.eventNamespace );
	},

	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;
		var parts;
		var curOption;
		var i;

		if ( arguments.length === 0 ) {

			// Don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {

			// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},

	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},

	_setOption: function( key, value ) {
		if ( key === "classes" ) {
			this._setOptionClasses( value );
		}

		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this._setOptionDisabled( value );
		}

		return this;
	},

	_setOptionClasses: function( value ) {
		var classKey, elements, currentElements;

		for ( classKey in value ) {
			currentElements = this.classesElementLookup[ classKey ];
			if ( value[ classKey ] === this.options.classes[ classKey ] ||
					!currentElements ||
					!currentElements.length ) {
				continue;
			}

			// We are doing this to create a new jQuery object because the _removeClass() call
			// on the next line is going to destroy the reference to the current elements being
			// tracked. We need to save a copy of this collection so that we can add the new classes
			// below.
			elements = $( currentElements.get() );
			this._removeClass( currentElements, classKey );

			// We don't use _addClass() here, because that uses this.options.classes
			// for generating the string of classes. We want to use the value passed in from
			// _setOption(), this is the new value of the classes option which was passed to
			// _setOption(). We pass this value directly to _classes().
			elements.addClass( this._classes( {
				element: elements,
				keys: classKey,
				classes: value,
				add: true
			} ) );
		}
	},

	_setOptionDisabled: function( value ) {
		this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

		// If the widget is becoming disabled, then nothing is interactive
		if ( value ) {
			this._removeClass( this.hoverable, null, "ui-state-hover" );
			this._removeClass( this.focusable, null, "ui-state-focus" );
		}
	},

	enable: function() {
		return this._setOptions( { disabled: false } );
	},

	disable: function() {
		return this._setOptions( { disabled: true } );
	},

	_classes: function( options ) {
		var full = [];
		var that = this;

		options = $.extend( {
			element: this.element,
			classes: this.options.classes || {}
		}, options );

		function processClassString( classes, checkOption ) {
			var current, i;
			for ( i = 0; i < classes.length; i++ ) {
				current = that.classesElementLookup[ classes[ i ] ] || $();
				if ( options.add ) {
					current = $( $.unique( current.get().concat( options.element.get() ) ) );
				} else {
					current = $( current.not( options.element ).get() );
				}
				that.classesElementLookup[ classes[ i ] ] = current;
				full.push( classes[ i ] );
				if ( checkOption && options.classes[ classes[ i ] ] ) {
					full.push( options.classes[ classes[ i ] ] );
				}
			}
		}

		this._on( options.element, {
			"remove": "_untrackClassesElement"
		} );

		if ( options.keys ) {
			processClassString( options.keys.match( /\S+/g ) || [], true );
		}
		if ( options.extra ) {
			processClassString( options.extra.match( /\S+/g ) || [] );
		}

		return full.join( " " );
	},

	_untrackClassesElement: function( event ) {
		var that = this;
		$.each( that.classesElementLookup, function( key, value ) {
			if ( $.inArray( event.target, value ) !== -1 ) {
				that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
			}
		} );
	},

	_removeClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, false );
	},

	_addClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, true );
	},

	_toggleClass: function( element, keys, extra, add ) {
		add = ( typeof add === "boolean" ) ? add : extra;
		var shift = ( typeof element === "string" || element === null ),
			options = {
				extra: shift ? keys : extra,
				keys: shift ? element : keys,
				element: shift ? this.element : element,
				add: add
			};
		options.element.toggleClass( this._classes( options ), add );
		return this;
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement;
		var instance = this;

		// No suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// No element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {

				// Allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// Copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ );
			var eventName = match[ 1 ] + instance.eventNamespace;
			var selector = match[ 2 ];

			if ( selector ) {
				delegateElement.on( eventName, selector, handlerProxy );
			} else {
				element.on( eventName, handlerProxy );
			}
		} );
	},

	_off: function( element, eventName ) {
		eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.off( eventName ).off( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
			},
			mouseleave: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
			}
		} );
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
			},
			focusout: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
			}
		} );
	},

	_trigger: function( type, event, data ) {
		var prop, orig;
		var callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();

		// The original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// Copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}

		var hasOptions;
		var effectName = !options ?
			method :
			options === true || typeof options === "number" ?
				defaultEffect :
				options.effect || defaultEffect;

		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}

		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;

		if ( options.delay ) {
			element.delay( options.delay );
		}

		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue( function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			} );
		}
	};
} );

return $.widget;

} ) );

/*!
 * jQuery Mobile Widget @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget Factory
//>>group: Core
//>>description: Widget factory extentions for mobile.
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widget',[
			"jquery",
			"./ns",
			"jquery-ui/widget",
			"./data" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

return $.mobile.widget = $.mobile.widget || {};

} );

/*!
 * jQuery Mobile First And Last Classes @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: First & Last Classes
//>>group: Widgets
//>>description: Behavior mixin to mark first and last visible item with special classes.

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/addFirstLastClasses',[
			"jquery",
			"../core" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var uiScreenHiddenRegex = /\bui-screen-hidden\b/;
function noHiddenClass( elements ) {
	var index,
		length = elements.length,
		result = [];

	for ( index = 0; index < length; index++ ) {
		if ( !elements[ index ].className.match( uiScreenHiddenRegex ) ) {
			result.push( elements[ index ] );
		}
	}

	return $( result );
}

$.mobile.behaviors.addFirstLastClasses = {
	_getVisibles: function( $els, create ) {
		var visibles;

		if ( create ) {
			visibles = noHiddenClass( $els );
		} else {
			visibles = $els.filter( ":visible" );
			if ( visibles.length === 0 ) {
				visibles = noHiddenClass( $els );
			}
		}

		return visibles;
	},

	_addFirstLastClasses: function( $els, $visibles, create ) {
		$els.removeClass( "ui-first-child ui-last-child" );
		$visibles.eq( 0 ).addClass( "ui-first-child" ).end().last().addClass( "ui-last-child" );
		if ( !create ) {
			this.element.trigger( "updatelayout" );
		}
	},

	_removeFirstLastClasses: function( $els ) {
		$els.removeClass( "ui-first-child ui-last-child" );
	}
};

return $.mobile.behaviors.addFirstLastClasses;

} );

/*!
 * jQuery Mobile Theme Option @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget Theme
//>>group: Widgets
//>>description: Adds Theme option to widgets
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/widget.theme',[
			"jquery",
			"../core",
			"../widget" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.mobile.widget.theme = {
	_create: function() {
		var that = this;
		this._super();
		$.each( this._themeElements(), function( i, toTheme ) {
			that._addClass(
				toTheme.element,
				null,
				toTheme.prefix + that.options[ toTheme.option || "theme" ]
			);
		} );
	},

	_setOption: function( key, value ) {
		var that = this;
		$.each( this._themeElements(), function( i, toTheme ) {
			var themeOption = ( toTheme.option || "theme" );

			if ( themeOption === key ) {
				that._removeClass(
					toTheme.element,
					null,
					toTheme.prefix + that.options[ toTheme.option || "theme" ]
				)
				._addClass( toTheme.element, null, toTheme.prefix + value );
			}
		} );
		this._superApply( arguments );
	}
};

return $.mobile.widget.theme;

} );

/*!
 * jQuery UI Controlgroup 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Controlgroup
//>>group: Widgets
//>>description: Visually groups form control widgets
//>>docs: http://api.jqueryui.com/controlgroup/
//>>demos: http://jqueryui.com/controlgroup/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/controlgroup.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/widgets/controlgroup',[
			"jquery",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {
var controlgroupCornerRegex = /ui-corner-([a-z]){2,6}/g;

return $.widget( "ui.controlgroup", {
	version: "1.12.1",
	defaultElement: "<div>",
	options: {
		direction: "horizontal",
		disabled: null,
		onlyVisible: true,
		items: {
			"button": "input[type=button], input[type=submit], input[type=reset], button, a",
			"controlgroupLabel": ".ui-controlgroup-label",
			"checkboxradio": "input[type='checkbox'], input[type='radio']",
			"selectmenu": "select",
			"spinner": ".ui-spinner-input"
		}
	},

	_create: function() {
		this._enhance();
	},

	// To support the enhanced option in jQuery Mobile, we isolate DOM manipulation
	_enhance: function() {
		this.element.attr( "role", "toolbar" );
		this.refresh();
	},

	_destroy: function() {
		this._callChildMethod( "destroy" );
		this.childWidgets.removeData( "ui-controlgroup-data" );
		this.element.removeAttr( "role" );
		if ( this.options.items.controlgroupLabel ) {
			this.element
				.find( this.options.items.controlgroupLabel )
				.find( ".ui-controlgroup-label-contents" )
				.contents().unwrap();
		}
	},

	_initWidgets: function() {
		var that = this,
			childWidgets = [];

		// First we iterate over each of the items options
		$.each( this.options.items, function( widget, selector ) {
			var labels;
			var options = {};

			// Make sure the widget has a selector set
			if ( !selector ) {
				return;
			}

			if ( widget === "controlgroupLabel" ) {
				labels = that.element.find( selector );
				labels.each( function() {
					var element = $( this );

					if ( element.children( ".ui-controlgroup-label-contents" ).length ) {
						return;
					}
					element.contents()
						.wrapAll( "<span class='ui-controlgroup-label-contents'></span>" );
				} );
				that._addClass( labels, null, "ui-widget ui-widget-content ui-state-default" );
				childWidgets = childWidgets.concat( labels.get() );
				return;
			}

			// Make sure the widget actually exists
			if ( !$.fn[ widget ] ) {
				return;
			}

			// We assume everything is in the middle to start because we can't determine
			// first / last elements until all enhancments are done.
			if ( that[ "_" + widget + "Options" ] ) {
				options = that[ "_" + widget + "Options" ]( "middle" );
			} else {
				options = { classes: {} };
			}

			// Find instances of this widget inside controlgroup and init them
			that.element
				.find( selector )
				.each( function() {
					var element = $( this );
					var instance = element[ widget ]( "instance" );

					// We need to clone the default options for this type of widget to avoid
					// polluting the variable options which has a wider scope than a single widget.
					var instanceOptions = $.widget.extend( {}, options );

					// If the button is the child of a spinner ignore it
					// TODO: Find a more generic solution
					if ( widget === "button" && element.parent( ".ui-spinner" ).length ) {
						return;
					}

					// Create the widget if it doesn't exist
					if ( !instance ) {
						instance = element[ widget ]()[ widget ]( "instance" );
					}
					if ( instance ) {
						instanceOptions.classes =
							that._resolveClassesValues( instanceOptions.classes, instance );
					}
					element[ widget ]( instanceOptions );

					// Store an instance of the controlgroup to be able to reference
					// from the outermost element for changing options and refresh
					var widgetElement = element[ widget ]( "widget" );
					$.data( widgetElement[ 0 ], "ui-controlgroup-data",
						instance ? instance : element[ widget ]( "instance" ) );

					childWidgets.push( widgetElement[ 0 ] );
				} );
		} );

		this.childWidgets = $( $.unique( childWidgets ) );
		this._addClass( this.childWidgets, "ui-controlgroup-item" );
	},

	_callChildMethod: function( method ) {
		this.childWidgets.each( function() {
			var element = $( this ),
				data = element.data( "ui-controlgroup-data" );
			if ( data && data[ method ] ) {
				data[ method ]();
			}
		} );
	},

	_updateCornerClass: function( element, position ) {
		var remove = "ui-corner-top ui-corner-bottom ui-corner-left ui-corner-right ui-corner-all";
		var add = this._buildSimpleOptions( position, "label" ).classes.label;

		this._removeClass( element, null, remove );
		this._addClass( element, null, add );
	},

	_buildSimpleOptions: function( position, key ) {
		var direction = this.options.direction === "vertical";
		var result = {
			classes: {}
		};
		result.classes[ key ] = {
			"middle": "",
			"first": "ui-corner-" + ( direction ? "top" : "left" ),
			"last": "ui-corner-" + ( direction ? "bottom" : "right" ),
			"only": "ui-corner-all"
		}[ position ];

		return result;
	},

	_spinnerOptions: function( position ) {
		var options = this._buildSimpleOptions( position, "ui-spinner" );

		options.classes[ "ui-spinner-up" ] = "";
		options.classes[ "ui-spinner-down" ] = "";

		return options;
	},

	_buttonOptions: function( position ) {
		return this._buildSimpleOptions( position, "ui-button" );
	},

	_checkboxradioOptions: function( position ) {
		return this._buildSimpleOptions( position, "ui-checkboxradio-label" );
	},

	_selectmenuOptions: function( position ) {
		var direction = this.options.direction === "vertical";
		return {
			width: direction ? "auto" : false,
			classes: {
				middle: {
					"ui-selectmenu-button-open": "",
					"ui-selectmenu-button-closed": ""
				},
				first: {
					"ui-selectmenu-button-open": "ui-corner-" + ( direction ? "top" : "tl" ),
					"ui-selectmenu-button-closed": "ui-corner-" + ( direction ? "top" : "left" )
				},
				last: {
					"ui-selectmenu-button-open": direction ? "" : "ui-corner-tr",
					"ui-selectmenu-button-closed": "ui-corner-" + ( direction ? "bottom" : "right" )
				},
				only: {
					"ui-selectmenu-button-open": "ui-corner-top",
					"ui-selectmenu-button-closed": "ui-corner-all"
				}

			}[ position ]
		};
	},

	_resolveClassesValues: function( classes, instance ) {
		var result = {};
		$.each( classes, function( key ) {
			var current = instance.options.classes[ key ] || "";
			current = $.trim( current.replace( controlgroupCornerRegex, "" ) );
			result[ key ] = ( current + " " + classes[ key ] ).replace( /\s+/g, " " );
		} );
		return result;
	},

	_setOption: function( key, value ) {
		if ( key === "direction" ) {
			this._removeClass( "ui-controlgroup-" + this.options.direction );
		}

		this._super( key, value );
		if ( key === "disabled" ) {
			this._callChildMethod( value ? "disable" : "enable" );
			return;
		}

		this.refresh();
	},

	refresh: function() {
		var children,
			that = this;

		this._addClass( "ui-controlgroup ui-controlgroup-" + this.options.direction );

		if ( this.options.direction === "horizontal" ) {
			this._addClass( null, "ui-helper-clearfix" );
		}
		this._initWidgets();

		children = this.childWidgets;

		// We filter here because we need to track all childWidgets not just the visible ones
		if ( this.options.onlyVisible ) {
			children = children.filter( ":visible" );
		}

		if ( children.length ) {

			// We do this last because we need to make sure all enhancment is done
			// before determining first and last
			$.each( [ "first", "last" ], function( index, value ) {
				var instance = children[ value ]().data( "ui-controlgroup-data" );

				if ( instance && that[ "_" + instance.widgetName + "Options" ] ) {
					var options = that[ "_" + instance.widgetName + "Options" ](
						children.length === 1 ? "only" : value
					);
					options.classes = that._resolveClassesValues( options.classes, instance );
					instance.element[ instance.widgetName ]( options );
				} else {
					that._updateCornerClass( children[ value ](), value );
				}
			} );

			// Finally call the refresh method on each of the child widgets.
			this._callChildMethod( "refresh" );
		}
	}
} );
} ) );

/*!
 * jQuery Mobile Controlgroup @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Controlgroups
//>>group: Forms
//>>description: Visually groups sets of buttons, checks, radios, etc.
//>>docs: http://api.jquerymobile.com/toolbar/
//>>demos: http://demos.jquerymobile.com/@VERSION/toolbar-fixed/
//>>css.structure: ../css/structure/jquery.mobile.controlgroup.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/controlgroup',[
			"jquery",
			"jquery-ui/widget",
			"./widget.theme",
			"jquery-ui/widgets/controlgroup" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.widget( "ui.controlgroup", $.ui.controlgroup, {
	options: {
		theme: "inherit"
	},

	_create: function() {
		this._super();
		this._on( this.document, {
			"pagecontainershow": function( event, ui ) {
				if ( $.contains( ui.toPage[ 0 ], this.element[ 0 ] ) ) {
					this.refresh();
				}
			}
		} );
	},

	// Deprecated as of 1.5.0 and will be removed in 1.6.0
	// This method is no longer necessary since controlgroup no longer has a wrapper
	container: function() {
		return this.element;
	},

	_themeElements: function() {
		return [
			{
				element: this.widget(),
				prefix: "ui-group-theme-"
			}
		];
	}
} );

$.widget( "ui.controlgroup", $.ui.controlgroup, $.mobile.widget.theme );

return $.ui.controlgroup;

} );

/*!
 * jQuery Mobile Widget Backcompat @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Backcompat option setting code
//>>group: Backcompat
//>>description: Synchronize deprecated style options and the value of the classes option.

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/widget.backcompat',[
			"jquery",
			"../ns",
			"../widget",
			"jquery-ui/widget" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

if ( $.mobileBackcompat !== false ) {

	var classSplitterRegex = /\S+/g;

	$.mobile.widget = $.extend( {}, { backcompat: {

		_boolOptions: {
			inline:  "ui-button-inline",
			mini: "ui-mini",
			shadow: "ui-shadow",
			corners: "ui-corner-all"
		},

		_create: function() {
			this._setInitialOptions();
			this._super();
			if ( !this.options.enhanced && this.options.wrapperClass ) {
				this._addClass( this.widget(), null, this.options.wrapperClass );
			}
		},

		_classesToOption: function( value ) {
			if ( this.classProp && ( typeof value[ this.classProp ] === "string" ) ) {
				var that = this,
					valueArray = value[ this.classProp ].match( classSplitterRegex ) || [];

				$.each( this._boolOptions, function( option, className ) {
					if ( that.options[ option ] !== undefined ) {
						if ( $.inArray( className, valueArray ) !== -1 ) {
							that.options[ option ] = true;
						} else {
							that.options[ option ] = false;
						}
					}
				} );
			}
		},

		_getClassValue: function( prop, optionClass, value ) {
			var classes = this.options.classes[ prop ] || "",
				classArray = classes.match( classSplitterRegex ) || [];

				if ( value ) {
					if ( $.inArray( optionClass, classArray ) === -1 ) {
						classArray.push( optionClass );
					}
				} else {
					classArray.splice( $.inArray( optionClass, classArray ), 1 );
				}
				return classArray.join( " " );
		},

		_optionsToClasses: function( option, value ) {
			var prop = this.classProp,
				className = this._boolOptions[ option ];

			if ( prop ) {
				this.option(
					"classes." + prop,
					this._getClassValue( prop, className, value )
				);
			}
		},

		_setInitialOptions: function() {
			var currentClasses,
				options = this.options,
				original = $[ this.namespace ][ this.widgetName ].prototype.options,
				prop = this.classProp,
				that = this;

			if ( prop ) {
				currentClasses =
					( options.classes[ prop ] || "" ).match( classSplitterRegex ) || [];

				// If the classes option value has diverged from the default, then its value takes
				// precedence, causing us to update all the style options to reflect the contents
				// of the classes option value
				if ( original.classes[ prop ] !== options.classes[ prop ] ) {
					$.each( this._boolOptions, function( option, className ) {
						if ( options[ option ] !== undefined ) {
							options[ option ] = ( $.inArray( className, currentClasses ) !== -1 );
						}
					} ) ;

				// Otherwise we assume that we're dealing with legacy code and look for style
				// option values which diverge from the defaults. If we find any that diverge, we
				// update the classes option value accordingly.
				} else {
					$.each( this._boolOptions, function( option, className ) {
						if ( options[ option ] !== original[ option ] ) {
							options.classes[ prop ] =
								that._getClassValue( prop, className, options[ option ] );
						}
					} );
				}
			}
		},

		_setOption: function( key, value ) {
			var widgetElement;

			// Update deprecated option based on classes option
			if ( key === "classes" ) {
				this._classesToOption( value );
			}

			// Update classes options based on deprecated option
			if ( this._boolOptions[ key ] ) {
				this._optionsToClasses( key, value );
			}

			// Update wrapperClass
			if ( key === "wrapperClass" ) {
				widgetElement = this.widget();
				this._removeClass( widgetElement, null, this.options.wrapperClass )
					._addClass( widgetElement, null, value );
			}

			this._superApply( arguments );
		}
	} }, $.mobile.widget );
} else {
	$.mobile.widget.backcompat = {};
}

return $.mobile.widget;

} );

/*!
 * jQuery Mobile Controlgroup Backcompat @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Controlgroups
//>>group: Forms
//>>description: Visually groups sets of buttons, checks, radios, etc.
//>>docs: http://api.jquerymobile.com/controlgroup/
//>>demos: http://demos.jquerymobile.com/@VERSION/controlgroup/
//>>css.structure: ../css/structure/jquery.mobile.controlgroup.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/controlgroup.backcompat',[
			"jquery",
			"jquery-ui/widget",
			"./widget.theme",
			"jquery-ui/widgets/controlgroup",
			"./controlgroup",
			"./widget.backcompat" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.widget( "ui.controlgroup", $.ui.controlgroup, {
	options: {
		shadow: false,

		//Corners: true,
		direction: "vertical",
		type: "vertical",
		mini: false
	},

	_create: function() {
		if ( this.options.direction !== $.ui.controlgroup.prototype.options.direction ) {
			this.options.type = this.options.direction;
		} else if ( this.options.type !== $.ui.controlgroup.prototype.options.type ) {
			this._setOption( "direction", this.options.type );
		}
		this._super();
	},

	classProp: "ui-controlgroup",

	_setOption: function( key, value ) {
		if ( key === "direction" ) {
			this.options.type = value;
		}
		if ( key === "type" ) {
			this._setOption( "direction", value );
		}
		this._superApply( arguments );
	}
} );

$.widget( "ui.controlgroup", $.ui.controlgroup, $.mobile.widget.backcompat );

return $.ui.controlgroup;

} );

/*!
 * jQuery Mobile Selectmenu Controlgroup Integration @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Selectmenu Controlgroup Integration
//>>group: Forms
//>>description: Selectmenu integration for controlgroups

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/controlgroup.selectmenu',[
			"jquery",
			"./controlgroup" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var uiButtonInlineRegex = /ui-button-inline/g;
var uiShadowRegex = /ui-shadow/g;

return $.widget( "ui.controlgroup", $.ui.controlgroup, {

	_selectmenuOptions: function( position ) {
		var isVertical = ( this.options.direction === "vertical" );
		var inlineClass = isVertical ? "" : "ui-button-inline";

		return {
			classes: {
				middle: {
					"ui-selectmenu": inlineClass,
					"ui-selectmenu-button": ""
				},
				first: {
					"ui-selectmenu": inlineClass,
					"ui-selectmenu-button":
						"ui-corner-" + ( isVertical ? "top" : "left" )
				},
				last: {
					"ui-selectmenu": inlineClass,
					"ui-selectmenu-button":
						"ui-corner-" + ( isVertical ? "bottom" : "right" )
				},
				only: {
					"ui-selectmenu": inlineClass,
					"ui-selectmenu-button": "ui-corner-all"
				}
			}[ position ]
		};
	},

	// The native element of an enhanced and disabled selectmenu widget fails the :visible test.
	// This will cause controlgroup to ignore it in the calculation of the corner classes. Thus, in
	// the case of the selectmenu, we need to transfer the controlgroup information from the native
	// select element to its parent which is still visible.
	//
	// The selectmenu widget's wrapper needs to have the class ui-button-inline, but only when the
	// selectmenu is oriented horizontally. Thus, we remove it here, and allow the refresh() to
	// determine whether it needs to be added.
	//
	// The ui-shadow class needs to be removed here.
	_initWidgets: function() {
		this._superApply( arguments );

		this.childWidgets = this.childWidgets.map( function() {
			var selectmenuWidget = $.data( this, "mobile-selectmenu" );
			if ( selectmenuWidget ) {

				// Transfer data to parent node
				$.data( this.parentNode, "ui-controlgroup-data",
					$.data( this, "ui-controlgroup-data" ) );
				$.removeData( this, "ui-controlgroup-data" );

				// Remove the class ui-button-inline. It may be re-added if this controlgroup is
				// horizontal.
				selectmenuWidget.option( "classes.ui-selectmenu",
					selectmenuWidget.option( "classes.ui-selectmenu" )
						.replace( uiButtonInlineRegex, "" )
						.trim() );
				selectmenuWidget.option( "classes.ui-selectmenu-button",
					selectmenuWidget.option( "classes.ui-selectmenu-button" )
						.replace( uiShadowRegex, "" )
						.trim() );

				return this.parentNode;
			}
			return this;
		} );
	}

} );

} );

/*!
 * jQuery Mobile Zoom @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Zoom Handling
//>>group: Utilities
//>>description: Utility methods for enabling and disabling user scaling (pinch zoom)

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'zoom',[
			"jquery",
			"./core" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var meta = $( "meta[name=viewport]" ),
	initialContent = meta.attr( "content" ),
	disabledZoom = initialContent + ",maximum-scale=1, user-scalable=no",
	enabledZoom = initialContent + ",maximum-scale=10, user-scalable=yes",
	disabledInitially = /(user-scalable[\s]*=[\s]*no)|(maximum-scale[\s]*=[\s]*1)[$,\s]/.test( initialContent );

$.mobile.zoom = $.extend( {}, {
	enabled: !disabledInitially,
	locked: false,
	disable: function( lock ) {
		if ( !disabledInitially && !$.mobile.zoom.locked ) {
			meta.attr( "content", disabledZoom );
			$.mobile.zoom.enabled = false;
			$.mobile.zoom.locked = lock || false;
		}
	},
	enable: function( unlock ) {
		if ( !disabledInitially && ( !$.mobile.zoom.locked || unlock === true ) ) {
			meta.attr( "content", enabledZoom );
			$.mobile.zoom.enabled = true;
			$.mobile.zoom.locked = false;
		}
	},
	restore: function() {
		if ( !disabledInitially ) {
			meta.attr( "content", initialContent );
			$.mobile.zoom.enabled = true;
		}
	}
} );

return $.mobile.zoom;
} );

/*!
 * jQuery Mobile Textinput @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Text Inputs & Textareas
//>>group: Forms
//>>description: Enhances and consistently styles text inputs.
//>>docs: http://api.jquerymobile.com/textinput/
//>>demos: http://demos.jquerymobile.com/@VERSION/textinput/
//>>css.structure: ../css/structure/jquery.mobile.forms.textinput.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/textinput',[
			"jquery",
			"../../core",
			"../../widget",
			"../../degradeInputs",
			"../widget.theme",
			"../../zoom" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.widget( "mobile.textinput", {
	version: "@VERSION",

	options: {
		classes: {
			"ui-textinput": "ui-corner-all ui-shadow-inset",
			"ui-textinput-search-icon": "ui-icon ui-alt-icon ui-icon-search"
		},

		theme: "inherit",

		// This option defaults to true on iOS devices.
		preventFocusZoom: /iPhone|iPad|iPod/.test( navigator.platform ) && navigator.userAgent.indexOf( "AppleWebKit" ) > -1,
		enhanced: false
	},

	_create: function() {

		var options = this.options,
			isSearch = this.element.is( "[type='search'], :jqmData(type='search')" ),
			isTextarea = this.element[ 0 ].nodeName.toLowerCase() === "textarea";

		if ( this.element.prop( "disabled" ) ) {
			options.disabled = true;
		}

		$.extend( this, {
			isSearch: isSearch,
			isTextarea: isTextarea
		} );

		this._autoCorrect();

		if ( !options.enhanced ) {
			this._enhance();
		} else {
			this._outer = ( isTextarea ? this.element : this.element.parent() );
			if ( isSearch ) {
				this._searchIcon = this._outer.children( ".ui-textinput-search-icon" );
			}
		}

		this._addClass( this._outer,
			"ui-textinput ui-textinput-" + ( this.isSearch ? "search" : "text" ) );

		if ( this._searchIcon ) {
			this._addClass( this._searchIcon, "ui-textinput-search-icon" );
		}

		this._on( {
			"focus": "_handleFocus",
			"blur": "_handleBlur"
		} );

		if ( options.disabled !== undefined ) {
			this.element.prop( "disabled", !!options.disabled );
			this._toggleClass( this._outer, null, "ui-state-disabled", !!options.disabled );
		}

	},

	refresh: function() {
		this._setOptions( {
			"disabled": this.element.is( ":disabled" )
		} );
	},

	_themeElements: function() {
		return [
			{
				element: this._outer,
				prefix: "ui-body-"
			}
		];
	},

	_enhance: function() {
		var outer;

		if ( !this.isTextarea ) {
			outer = $( "<div>" );
			if ( this.isSearch ) {
				this._searchIcon = $( "<span>" ).prependTo( outer );
			}
		} else {
			outer = this.element;
		}

		this._outer = outer;

		// Now that we're done building up the wrapper, wrap the input in it
		if ( !this.isTextarea ) {
			outer.insertBefore( this.element ).append( this.element );
		}
	},

	widget: function() {
		return this._outer;
	},

	_autoCorrect: function() {

		// XXX: Temporary workaround for issue 785 (Apple bug 8910589).
		//      Turn off autocorrect and autocomplete on non-iOS 5 devices
		//      since the popup they use can't be dismissed by the user. Note
		//      that we test for the presence of the feature by looking for
		//      the autocorrect property on the input element. We currently
		//      have no test for iOS 5 or newer so we're temporarily using
		//      the touchOverflow support flag for jQM 1.0. Yes, I feel dirty.
		//      - jblas
		if ( typeof this.element[ 0 ].autocorrect !== "undefined" &&
				!$.support.touchOverflow ) {

			// Set the attribute instead of the property just in case there
			// is code that attempts to make modifications via HTML.
			this.element[ 0 ].setAttribute( "autocorrect", "off" );
			this.element[ 0 ].setAttribute( "autocomplete", "off" );
		}
	},

	_handleBlur: function() {
		this._removeClass( this._outer, null, "ui-focus" );
		if ( this.options.preventFocusZoom ) {
			$.mobile.zoom.enable( true );
		}
	},

	_handleFocus: function() {

		// In many situations, iOS will zoom into the input upon tap, this
		// prevents that from happening
		if ( this.options.preventFocusZoom ) {
			$.mobile.zoom.disable( true );
		}
		this._addClass( this._outer, null, "ui-focus" );
	},

	_setOptions: function( options ) {
		if ( options.disabled !== undefined ) {
			this.element.prop( "disabled", !!options.disabled );
			this._toggleClass( this._outer, null, "ui-state-disabled", !!options.disabled );
		}
		return this._superApply( arguments );
	},

	_destroy: function() {
		if ( this.options.enhanced ) {
			this.classesElementLookup = {};
			return;
		}
		if ( this._searchIcon ) {
			this._searchIcon.remove();
		}
		if ( !this.isTextarea ) {
			this.element.unwrap();
		}
	}
} );

return $.widget( "mobile.textinput", $.mobile.textinput, $.mobile.widget.theme );

} );

/*!
 * jQuery Mobile Autogrow @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Textarea Autogrow
//>>group: Forms
//>>description: Textarea elements automatically grow/shrink to accommodate their contents.
//>>docs: http://api.jquerymobile.com/textinput/#option-autogrow
//>>css.structure: ../css/structure/jquery.mobile.forms.textinput.autogrow.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/autogrow',[
			"jquery",
			"./textinput" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

return $.widget( "mobile.textinput", $.mobile.textinput, {
	options: {
		autogrow: true,
		keyupTimeoutBuffer: 100
	},

	_create: function() {
		this._super();

		if ( this.options.autogrow && this.isTextarea ) {
			this._autogrow();
		}
	},

	_autogrow: function() {
		this._addClass( "ui-textinput-autogrow" );

		this._on( {
			"keyup": "_timeout",
			"change": "_timeout",
			"input": "_timeout",
			"paste": "_timeout"
		} );

		// Attach to the various you-have-become-visible notifications that the
		// various framework elements emit.
		// TODO: Remove all but the updatelayout handler once #6426 is fixed.
		this._handleShow( "create" );
		this._on( true, this.document, {
			"popupbeforeposition": "_handleShow",
			"updatelayout": "_handleShow",
			"panelopen": "_handleShow"
		} );
	},

	// Synchronously fix the widget height if this widget's parents are such
	// that they show/hide content at runtime. We still need to check whether
	// the widget is actually visible in case it is contained inside multiple
	// such containers. For example: panel contains collapsible contains
	// autogrow textinput. The panel may emit "panelopen" indicating that its
	// content has become visible, but the collapsible is still collapsed, so
	// the autogrow textarea is still not visible.
	_handleShow: function( event ) {
		if ( event === "create" || ( $.contains( event.target, this.element[ 0 ] ) &&
				this.element.is( ":visible" ) ) ) {

			if ( event !== "create" && event.type !== "popupbeforeposition" ) {
				this._addClass( "ui-textinput-autogrow-resize" );
				this.element
					.animationComplete(
						$.proxy( function() {
							this._removeClass( "ui-textinput-autogrow-resize" );
						}, this ),
						"transition" );
			}
			this._prepareHeightUpdate();
		}
	},

	_unbindAutogrow: function() {
		this._removeClass( "ui-textinput-autogrow" );
		this._off( this.element, "keyup change input paste" );
		this._off( this.document,
			"pageshow popupbeforeposition updatelayout panelopen" );
	},

	keyupTimeout: null,

	_prepareHeightUpdate: function( delay ) {
		if ( this.keyupTimeout ) {
			clearTimeout( this.keyupTimeout );
		}
		if ( delay === undefined ) {
			this._updateHeight();
		} else {
			this.keyupTimeout = this._delay( "_updateHeight", delay );
		}
	},

	_timeout: function() {
		this._prepareHeightUpdate( this.options.keyupTimeoutBuffer );
	},

	_updateHeight: function() {
		var paddingTop, paddingBottom, paddingHeight, scrollHeight, clientHeight,
			borderTop, borderBottom, borderHeight, height,
			scrollTop = this.window.scrollTop();
		this.keyupTimeout = 0;

		// IE8 textareas have the onpage property - others do not
		if ( !( "onpage" in this.element[ 0 ] ) ) {
			this.element.css( {
				"height": 0,
				"min-height": 0,
				"max-height": 0
			} );
		}

		scrollHeight = this.element[ 0 ].scrollHeight;
		clientHeight = this.element[ 0 ].clientHeight;
		borderTop = parseFloat( this.element.css( "border-top-width" ) );
		borderBottom = parseFloat( this.element.css( "border-bottom-width" ) );
		borderHeight = borderTop + borderBottom;
		height = scrollHeight + borderHeight + 15;

		// Issue 6179: Padding is not included in scrollHeight and
		// clientHeight by Firefox if no scrollbar is visible. Because
		// textareas use the border-box box-sizing model, padding should be
		// included in the new (assigned) height. Because the height is set
		// to 0, clientHeight == 0 in Firefox. Therefore, we can use this to
		// check if padding must be added.
		if ( clientHeight === 0 ) {
			paddingTop = parseFloat( this.element.css( "padding-top" ) );
			paddingBottom = parseFloat( this.element.css( "padding-bottom" ) );
			paddingHeight = paddingTop + paddingBottom;

			height += paddingHeight;
		}

		this.element.css( {
			"height": height,
			"min-height": "",
			"max-height": ""
		} );

		this.window.scrollTop( scrollTop );
	},

	refresh: function() {
		if ( this.options.autogrow && this.isTextarea ) {
			this._updateHeight();
		}
	},

	_setOptions: function( options ) {

		this._super( options );

		if ( options.autogrow !== undefined && this.isTextarea ) {
			if ( options.autogrow ) {
				this._autogrow();
			} else {
				this._unbindAutogrow();
			}
		}
	},

	_destroy: function() {
		this._unbindAutogrow();
		this._super();
	}

} );
} );

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/escape-selector',[ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

// Internal use only
return $.ui.escapeSelector = ( function() {
	var selectorEscape = /([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;
	return function( selector ) {
		return selector.replace( selectorEscape, "\\$1" );
	};
} )();

} ) );

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/form',[ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

// Support: IE8 Only
// IE8 does not support the form attribute and when it is supplied. It overwrites the form prop
// with a string, so we need to find the proper form.
return $.fn.form = function() {
	return typeof this[ 0 ].form === "string" ? this.closest( "form" ) : $( this[ 0 ].form );
};

} ) );

/*!
 * jQuery UI Form Reset Mixin 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Form Reset Mixin
//>>group: Core
//>>description: Refresh input widgets when their form is reset
//>>docs: http://api.jqueryui.com/form-reset-mixin/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/form-reset-mixin',[
			"jquery",
			"./form",
			"./version"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

return $.ui.formResetMixin = {
	_formResetHandler: function() {
		var form = $( this );

		// Wait for the form reset to actually happen before refreshing
		setTimeout( function() {
			var instances = form.data( "ui-form-reset-instances" );
			$.each( instances, function() {
				this.refresh();
			} );
		} );
	},

	_bindFormResetHandler: function() {
		this.form = this.element.form();
		if ( !this.form.length ) {
			return;
		}

		var instances = this.form.data( "ui-form-reset-instances" ) || [];
		if ( !instances.length ) {

			// We don't use _on() here because we use a single event handler per form
			this.form.on( "reset.ui-form-reset", this._formResetHandler );
		}
		instances.push( this );
		this.form.data( "ui-form-reset-instances", instances );
	},

	_unbindFormResetHandler: function() {
		if ( !this.form.length ) {
			return;
		}

		var instances = this.form.data( "ui-form-reset-instances" );
		instances.splice( $.inArray( this, instances ), 1 );
		if ( instances.length ) {
			this.form.data( "ui-form-reset-instances", instances );
		} else {
			this.form
				.removeData( "ui-form-reset-instances" )
				.off( "reset.ui-form-reset" );
		}
	}
};

} ) );

/*!
 * jQuery UI Labels 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: labels
//>>group: Core
//>>description: Find all the labels associated with a given input
//>>docs: http://api.jqueryui.com/labels/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/labels',[ "jquery", "./version", "./escape-selector" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

return $.fn.labels = function() {
	var ancestor, selector, id, labels, ancestors;

	// Check control.labels first
	if ( this[ 0 ].labels && this[ 0 ].labels.length ) {
		return this.pushStack( this[ 0 ].labels );
	}

	// Support: IE <= 11, FF <= 37, Android <= 2.3 only
	// Above browsers do not support control.labels. Everything below is to support them
	// as well as document fragments. control.labels does not work on document fragments
	labels = this.eq( 0 ).parents( "label" );

	// Look for the label based on the id
	id = this.attr( "id" );
	if ( id ) {

		// We don't search against the document in case the element
		// is disconnected from the DOM
		ancestor = this.eq( 0 ).parents().last();

		// Get a full set of top level ancestors
		ancestors = ancestor.add( ancestor.length ? ancestor.siblings() : this.siblings() );

		// Create a selector for the label based on the id
		selector = "label[for='" + $.ui.escapeSelector( id ) + "']";

		labels = labels.add( ancestors.find( selector ).addBack( selector ) );

	}

	// Return whatever we have found for labels
	return this.pushStack( labels );
};

} ) );

/*!
 * jQuery UI Checkboxradio 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Checkboxradio
//>>group: Widgets
//>>description: Enhances a form with multiple themeable checkboxes or radio buttons.
//>>docs: http://api.jqueryui.com/checkboxradio/
//>>demos: http://jqueryui.com/checkboxradio/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/button.css
//>>css.structure: ../../themes/base/checkboxradio.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/widgets/checkboxradio',[
			"jquery",
			"../escape-selector",
			"../form-reset-mixin",
			"../labels",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.checkboxradio", [ $.ui.formResetMixin, {
	version: "1.12.1",
	options: {
		disabled: null,
		label: null,
		icon: true,
		classes: {
			"ui-checkboxradio-label": "ui-corner-all",
			"ui-checkboxradio-icon": "ui-corner-all"
		}
	},

	_getCreateOptions: function() {
		var disabled, labels;
		var that = this;
		var options = this._super() || {};

		// We read the type here, because it makes more sense to throw a element type error first,
		// rather then the error for lack of a label. Often if its the wrong type, it
		// won't have a label (e.g. calling on a div, btn, etc)
		this._readType();

		labels = this.element.labels();

		// If there are multiple labels, use the last one
		this.label = $( labels[ labels.length - 1 ] );
		if ( !this.label.length ) {
			$.error( "No label found for checkboxradio widget" );
		}

		this.originalLabel = "";

		// We need to get the label text but this may also need to make sure it does not contain the
		// input itself.
		this.label.contents().not( this.element[ 0 ] ).each( function() {

			// The label contents could be text, html, or a mix. We concat each element to get a
			// string representation of the label, without the input as part of it.
			that.originalLabel += this.nodeType === 3 ? $( this ).text() : this.outerHTML;
		} );

		// Set the label option if we found label text
		if ( this.originalLabel ) {
			options.label = this.originalLabel;
		}

		disabled = this.element[ 0 ].disabled;
		if ( disabled != null ) {
			options.disabled = disabled;
		}
		return options;
	},

	_create: function() {
		var checked = this.element[ 0 ].checked;

		this._bindFormResetHandler();

		if ( this.options.disabled == null ) {
			this.options.disabled = this.element[ 0 ].disabled;
		}

		this._setOption( "disabled", this.options.disabled );
		this._addClass( "ui-checkboxradio", "ui-helper-hidden-accessible" );
		this._addClass( this.label, "ui-checkboxradio-label", "ui-button ui-widget" );

		if ( this.type === "radio" ) {
			this._addClass( this.label, "ui-checkboxradio-radio-label" );
		}

		if ( this.options.label && this.options.label !== this.originalLabel ) {
			this._updateLabel();
		} else if ( this.originalLabel ) {
			this.options.label = this.originalLabel;
		}

		this._enhance();

		if ( checked ) {
			this._addClass( this.label, "ui-checkboxradio-checked", "ui-state-active" );
			if ( this.icon ) {
				this._addClass( this.icon, null, "ui-state-hover" );
			}
		}

		this._on( {
			change: "_toggleClasses",
			focus: function() {
				this._addClass( this.label, null, "ui-state-focus ui-visual-focus" );
			},
			blur: function() {
				this._removeClass( this.label, null, "ui-state-focus ui-visual-focus" );
			}
		} );
	},

	_readType: function() {
		var nodeName = this.element[ 0 ].nodeName.toLowerCase();
		this.type = this.element[ 0 ].type;
		if ( nodeName !== "input" || !/radio|checkbox/.test( this.type ) ) {
			$.error( "Can't create checkboxradio on element.nodeName=" + nodeName +
				" and element.type=" + this.type );
		}
	},

	// Support jQuery Mobile enhanced option
	_enhance: function() {
		this._updateIcon( this.element[ 0 ].checked );
	},

	widget: function() {
		return this.label;
	},

	_getRadioGroup: function() {
		var group;
		var name = this.element[ 0 ].name;
		var nameSelector = "input[name='" + $.ui.escapeSelector( name ) + "']";

		if ( !name ) {
			return $( [] );
		}

		if ( this.form.length ) {
			group = $( this.form[ 0 ].elements ).filter( nameSelector );
		} else {

			// Not inside a form, check all inputs that also are not inside a form
			group = $( nameSelector ).filter( function() {
				return $( this ).form().length === 0;
			} );
		}

		return group.not( this.element );
	},

	_toggleClasses: function() {
		var checked = this.element[ 0 ].checked;
		this._toggleClass( this.label, "ui-checkboxradio-checked", "ui-state-active", checked );

		if ( this.options.icon && this.type === "checkbox" ) {
			this._toggleClass( this.icon, null, "ui-icon-check ui-state-checked", checked )
				._toggleClass( this.icon, null, "ui-icon-blank", !checked );
		}

		if ( this.type === "radio" ) {
			this._getRadioGroup()
				.each( function() {
					var instance = $( this ).checkboxradio( "instance" );

					if ( instance ) {
						instance._removeClass( instance.label,
							"ui-checkboxradio-checked", "ui-state-active" );
					}
				} );
		}
	},

	_destroy: function() {
		this._unbindFormResetHandler();

		if ( this.icon ) {
			this.icon.remove();
			this.iconSpace.remove();
		}
	},

	_setOption: function( key, value ) {

		// We don't allow the value to be set to nothing
		if ( key === "label" && !value ) {
			return;
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this._toggleClass( this.label, null, "ui-state-disabled", value );
			this.element[ 0 ].disabled = value;

			// Don't refresh when setting disabled
			return;
		}
		this.refresh();
	},

	_updateIcon: function( checked ) {
		var toAdd = "ui-icon ui-icon-background ";

		if ( this.options.icon ) {
			if ( !this.icon ) {
				this.icon = $( "<span>" );
				this.iconSpace = $( "<span> </span>" );
				this._addClass( this.iconSpace, "ui-checkboxradio-icon-space" );
			}

			if ( this.type === "checkbox" ) {
				toAdd += checked ? "ui-icon-check ui-state-checked" : "ui-icon-blank";
				this._removeClass( this.icon, null, checked ? "ui-icon-blank" : "ui-icon-check" );
			} else {
				toAdd += "ui-icon-blank";
			}
			this._addClass( this.icon, "ui-checkboxradio-icon", toAdd );
			if ( !checked ) {
				this._removeClass( this.icon, null, "ui-icon-check ui-state-checked" );
			}
			this.icon.prependTo( this.label ).after( this.iconSpace );
		} else if ( this.icon !== undefined ) {
			this.icon.remove();
			this.iconSpace.remove();
			delete this.icon;
		}
	},

	_updateLabel: function() {

		// Remove the contents of the label ( minus the icon, icon space, and input )
		var contents = this.label.contents().not( this.element[ 0 ] );
		if ( this.icon ) {
			contents = contents.not( this.icon[ 0 ] );
		}
		if ( this.iconSpace ) {
			contents = contents.not( this.iconSpace[ 0 ] );
		}
		contents.remove();

		this.label.append( this.options.label );
	},

	refresh: function() {
		var checked = this.element[ 0 ].checked,
			isDisabled = this.element[ 0 ].disabled;

		this._updateIcon( checked );
		this._toggleClass( this.label, "ui-checkboxradio-checked", "ui-state-active", checked );
		if ( this.options.label !== null ) {
			this._updateLabel();
		}

		if ( isDisabled !== this.options.disabled ) {
			this._setOptions( { "disabled": isDisabled } );
		}
	}

} ] );

return $.ui.checkboxradio;

} ) );

/*!
 * jQuery UI Button 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Button
//>>group: Widgets
//>>description: Enhances a form with themeable buttons.
//>>docs: http://api.jqueryui.com/button/
//>>demos: http://jqueryui.com/button/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/button.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/widgets/button',[
			"jquery",

			// These are only for backcompat
			// TODO: Remove after 1.12
			"./controlgroup",
			"./checkboxradio",

			"../keycode",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.button", {
	version: "1.12.1",
	defaultElement: "<button>",
	options: {
		classes: {
			"ui-button": "ui-corner-all"
		},
		disabled: null,
		icon: null,
		iconPosition: "beginning",
		label: null,
		showLabel: true
	},

	_getCreateOptions: function() {
		var disabled,

			// This is to support cases like in jQuery Mobile where the base widget does have
			// an implementation of _getCreateOptions
			options = this._super() || {};

		this.isInput = this.element.is( "input" );

		disabled = this.element[ 0 ].disabled;
		if ( disabled != null ) {
			options.disabled = disabled;
		}

		this.originalLabel = this.isInput ? this.element.val() : this.element.html();
		if ( this.originalLabel ) {
			options.label = this.originalLabel;
		}

		return options;
	},

	_create: function() {
		if ( !this.option.showLabel & !this.options.icon ) {
			this.options.showLabel = true;
		}

		// We have to check the option again here even though we did in _getCreateOptions,
		// because null may have been passed on init which would override what was set in
		// _getCreateOptions
		if ( this.options.disabled == null ) {
			this.options.disabled = this.element[ 0 ].disabled || false;
		}

		this.hasTitle = !!this.element.attr( "title" );

		// Check to see if the label needs to be set or if its already correct
		if ( this.options.label && this.options.label !== this.originalLabel ) {
			if ( this.isInput ) {
				this.element.val( this.options.label );
			} else {
				this.element.html( this.options.label );
			}
		}
		this._addClass( "ui-button", "ui-widget" );
		this._setOption( "disabled", this.options.disabled );
		this._enhance();

		if ( this.element.is( "a" ) ) {
			this._on( {
				"keyup": function( event ) {
					if ( event.keyCode === $.ui.keyCode.SPACE ) {
						event.preventDefault();

						// Support: PhantomJS <= 1.9, IE 8 Only
						// If a native click is available use it so we actually cause navigation
						// otherwise just trigger a click event
						if ( this.element[ 0 ].click ) {
							this.element[ 0 ].click();
						} else {
							this.element.trigger( "click" );
						}
					}
				}
			} );
		}
	},

	_enhance: function() {
		if ( !this.element.is( "button" ) ) {
			this.element.attr( "role", "button" );
		}

		if ( this.options.icon ) {
			this._updateIcon( "icon", this.options.icon );
			this._updateTooltip();
		}
	},

	_updateTooltip: function() {
		this.title = this.element.attr( "title" );

		if ( !this.options.showLabel && !this.title ) {
			this.element.attr( "title", this.options.label );
		}
	},

	_updateIcon: function( option, value ) {
		var icon = option !== "iconPosition",
			position = icon ? this.options.iconPosition : value,
			displayBlock = position === "top" || position === "bottom";

		// Create icon
		if ( !this.icon ) {
			this.icon = $( "<span>" );

			this._addClass( this.icon, "ui-button-icon", "ui-icon" );

			if ( !this.options.showLabel ) {
				this._addClass( "ui-button-icon-only" );
			}
		} else if ( icon ) {

			// If we are updating the icon remove the old icon class
			this._removeClass( this.icon, null, this.options.icon );
		}

		// If we are updating the icon add the new icon class
		if ( icon ) {
			this._addClass( this.icon, null, value );
		}

		this._attachIcon( position );

		// If the icon is on top or bottom we need to add the ui-widget-icon-block class and remove
		// the iconSpace if there is one.
		if ( displayBlock ) {
			this._addClass( this.icon, null, "ui-widget-icon-block" );
			if ( this.iconSpace ) {
				this.iconSpace.remove();
			}
		} else {

			// Position is beginning or end so remove the ui-widget-icon-block class and add the
			// space if it does not exist
			if ( !this.iconSpace ) {
				this.iconSpace = $( "<span> </span>" );
				this._addClass( this.iconSpace, "ui-button-icon-space" );
			}
			this._removeClass( this.icon, null, "ui-wiget-icon-block" );
			this._attachIconSpace( position );
		}
	},

	_destroy: function() {
		this.element.removeAttr( "role" );

		if ( this.icon ) {
			this.icon.remove();
		}
		if ( this.iconSpace ) {
			this.iconSpace.remove();
		}
		if ( !this.hasTitle ) {
			this.element.removeAttr( "title" );
		}
	},

	_attachIconSpace: function( iconPosition ) {
		this.icon[ /^(?:end|bottom)/.test( iconPosition ) ? "before" : "after" ]( this.iconSpace );
	},

	_attachIcon: function( iconPosition ) {
		this.element[ /^(?:end|bottom)/.test( iconPosition ) ? "append" : "prepend" ]( this.icon );
	},

	_setOptions: function( options ) {
		var newShowLabel = options.showLabel === undefined ?
				this.options.showLabel :
				options.showLabel,
			newIcon = options.icon === undefined ? this.options.icon : options.icon;

		if ( !newShowLabel && !newIcon ) {
			options.showLabel = true;
		}
		this._super( options );
	},

	_setOption: function( key, value ) {
		if ( key === "icon" ) {
			if ( value ) {
				this._updateIcon( key, value );
			} else if ( this.icon ) {
				this.icon.remove();
				if ( this.iconSpace ) {
					this.iconSpace.remove();
				}
			}
		}

		if ( key === "iconPosition" ) {
			this._updateIcon( key, value );
		}

		// Make sure we can't end up with a button that has neither text nor icon
		if ( key === "showLabel" ) {
				this._toggleClass( "ui-button-icon-only", null, !value );
				this._updateTooltip();
		}

		if ( key === "label" ) {
			if ( this.isInput ) {
				this.element.val( value );
			} else {

				// If there is an icon, append it, else nothing then append the value
				// this avoids removal of the icon when setting label text
				this.element.html( value );
				if ( this.icon ) {
					this._attachIcon( this.options.iconPosition );
					this._attachIconSpace( this.options.iconPosition );
				}
			}
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this._toggleClass( null, "ui-state-disabled", value );
			this.element[ 0 ].disabled = value;
			if ( value ) {
				this.element.blur();
			}
		}
	},

	refresh: function() {

		// Make sure to only check disabled if its an element that supports this otherwise
		// check for the disabled class to determine state
		var isDisabled = this.element.is( "input, button" ) ?
			this.element[ 0 ].disabled : this.element.hasClass( "ui-button-disabled" );

		if ( isDisabled !== this.options.disabled ) {
			this._setOptions( { disabled: isDisabled } );
		}

		this._updateTooltip();
	}
} );

// DEPRECATED
if ( $.uiBackCompat !== false ) {

	// Text and Icons options
	$.widget( "ui.button", $.ui.button, {
		options: {
			text: true,
			icons: {
				primary: null,
				secondary: null
			}
		},

		_create: function() {
			if ( this.options.showLabel && !this.options.text ) {
				this.options.showLabel = this.options.text;
			}
			if ( !this.options.showLabel && this.options.text ) {
				this.options.text = this.options.showLabel;
			}
			if ( !this.options.icon && ( this.options.icons.primary ||
					this.options.icons.secondary ) ) {
				if ( this.options.icons.primary ) {
					this.options.icon = this.options.icons.primary;
				} else {
					this.options.icon = this.options.icons.secondary;
					this.options.iconPosition = "end";
				}
			} else if ( this.options.icon ) {
				this.options.icons.primary = this.options.icon;
			}
			this._super();
		},

		_setOption: function( key, value ) {
			if ( key === "text" ) {
				this._super( "showLabel", value );
				return;
			}
			if ( key === "showLabel" ) {
				this.options.text = value;
			}
			if ( key === "icon" ) {
				this.options.icons.primary = value;
			}
			if ( key === "icons" ) {
				if ( value.primary ) {
					this._super( "icon", value.primary );
					this._super( "iconPosition", "beginning" );
				} else if ( value.secondary ) {
					this._super( "icon", value.secondary );
					this._super( "iconPosition", "end" );
				}
			}
			this._superApply( arguments );
		}
	} );

	$.fn.button = ( function( orig ) {
		return function() {
			if ( !this.length || ( this.length && this[ 0 ].tagName !== "INPUT" ) ||
					( this.length && this[ 0 ].tagName === "INPUT" && (
						this.attr( "type" ) !== "checkbox" && this.attr( "type" ) !== "radio"
					) ) ) {
				return orig.apply( this, arguments );
			}
			if ( !$.ui.checkboxradio ) {
				$.error( "Checkboxradio widget missing" );
			}
			if ( arguments.length === 0 ) {
				return this.checkboxradio( {
					"icon": false
				} );
			}
			return this.checkboxradio.apply( this, arguments );
		};
	} )( $.fn.button );

	$.fn.buttonset = function() {
		if ( !$.ui.controlgroup ) {
			$.error( "Controlgroup widget missing" );
		}
		if ( arguments[ 0 ] === "option" && arguments[ 1 ] === "items" && arguments[ 2 ] ) {
			return this.controlgroup.apply( this,
				[ arguments[ 0 ], "items.button", arguments[ 2 ] ] );
		}
		if ( arguments[ 0 ] === "option" && arguments[ 1 ] === "items" ) {
			return this.controlgroup.apply( this, [ arguments[ 0 ], "items.button" ] );
		}
		if ( typeof arguments[ 0 ] === "object" && arguments[ 0 ].items ) {
			arguments[ 0 ].items = {
				button: arguments[ 0 ].items
			};
		}
		return this.controlgroup.apply( this, arguments );
	};
}

return $.ui.button;

} ) );

/*!
 * jQuery Mobile Button @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Mobile Button
//>>group: Forms
//>>description: Consistent styling for native butttons.
//>>docs: http://api.jquerymobile.com/button/
//>>demos: http://demos.jquerymobile.com/@VERSION/button/
//>>css.structure: ../css/structure/jquery.mobile.forms.slider.tooltip.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/button',[
			"jquery",
			"../../core",
			"../../widget",
			"../widget.theme",
			"jquery-ui/widgets/button" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.widget( "ui.button", $.ui.button, {
	options: {
		enhanced: false,
		theme: null
	},

	_enhance: function() {
		if ( !this.options.enhanced ) {
			this._super();
		} else if ( this.options.icon ) {
			this.icon = this.element.find( "ui-button-icon" );
		}
	},

	_themeElements: function() {
		this.options.theme = this.options.theme ? this.options.theme : "inherit";

		return [
			{
				element: this.widget(),
				prefix: "ui-button-"
			}
		];
	}
} );

$.widget( "ui.button", $.ui.button, $.mobile.widget.theme );

$.ui.button.prototype.options.classes = {
	"ui-button": "ui-shadow ui-corner-all"
};

return $.ui.button;

} );

/*!
 * jQuery Mobile Button Backcompat @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Button
//>>group: Forms
//>>description: Backwards-compatibility for buttons.
//>>docs: http://api.jquerymobile.com/button/
//>>demos: http://demos.jquerymobile.com/@VERSION/button/
//>>css.structure: ../css/structure/jquery.mobile.core.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/button.backcompat',[
			"jquery",
			"../../core",
			"../../widget",
			"../widget.backcompat",
			"./button" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

if ( $.mobileBackcompat !== false ) {
	$.widget( "ui.button", $.ui.button, {
		initSelector: "input[type='button'], input[type='submit'], input[type='reset'], button," +
		" [data-role='button']",
		options: {
			iconpos: "left",
			mini: false,
			wrapperClass: null,
			inline: null,
			shadow: true,
			corners: true
		},

		classProp: "ui-button",

		_create: function() {
			if ( this.options.iconPosition !== $.ui.button.prototype.options.iconPosition ) {
				this._seticonPosition( this.options.iconPosition );
			} else if ( this.options.iconpos !== $.ui.button.prototype.options.iconpos ) {
				this._seticonpos( this.options.iconpos );
			}
			this._super();
		},

		_seticonPosition: function( value ) {
			if ( value === "end" ) {
				this.options.iconpos = "right";
			} else if ( value !== "left" ) {
				this.options.iconpos = value;
			}
		},

		_seticonpos: function( value ) {
			if ( value === "right" ) {
				this._setOption( "iconPosition", "end" );
			} else if ( value !== "left" ) {
				this._setOption( "iconPosition", value );
			}
		},

		_setOption: function( key, value ) {
			if ( key === "iconPosition" || key === "iconpos" ) {
				this[ "_set" + key ]( value );
			}
			this._superApply( arguments );
		}
	} );
	return $.widget( "ui.button", $.ui.button, $.mobile.widget.backcompat );
}

} );

/*!
 * jQuery Mobile Checkboxradio @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Checkboxes & Radio Buttons
//>>group: Forms
//>>description: Consistent styling for checkboxes/radio buttons.
//>>docs: http://api.jquerymobile.com/checkboxradio/
//>>demos: http://demos.jquerymobile.com/@VERSION/checkboxradio-checkbox/
//>>css.structure: ../css/structure/jquery.mobile.forms.checkboxradio.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/checkboxradio',[
			"jquery",
			"../../core",
			"../../widget",
			"jquery-ui/widgets/checkboxradio",
			"../widget.theme" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.widget( "ui.checkboxradio", $.ui.checkboxradio, {
	options: {
		enhanced: false,
		theme: "inherit"
	},

	_enhance: function() {
		if ( !this.options.enhanced ) {
			this._super();
		} else if ( this.options.icon ) {
			this.icon = this.element.parent().find( ".ui-checkboxradio-icon" );
		}
	},

	_themeElements: function() {
		return [
			{
				element: this.widget(),
				prefix: "ui-button-"
			}
		];
	}
} );

$.widget( "ui.checkboxradio", $.ui.checkboxradio, $.mobile.widget.theme );

return $.ui.checkboxradio;

} );

/*!
 * jQuery Mobile Checkboxradio Backcompat @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Checkboxes & Radio Buttons
//>>group: Forms
//>>description: Consistent styling for checkboxes/radio buttons.
//>>docs: http://api.jquerymobile.com/checkboxradio/
//>>demos: http://demos.jquerymobile.com/@VERSION/checkboxradio-checkbox/
//>>css.structure: ../css/structure/jquery.mobile.forms.checkboxradio.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/checkboxradio.backcompat',[
			"jquery",
			"../../core",
			"../../widget",
			"../widget.theme",
			"../widget.backcompat",
			"./checkboxradio" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

if ( $.mobileBackcompat !== false ) {
	$.widget( "ui.checkboxradio", $.ui.checkboxradio, {
		initSelector: "input[type='radio'],input[type='checkbox']:not(:jqmData(role='flipswitch'))",
		options: {

			// Unimplemented until its decided if this will move to ui widget
			iconpos: "left",
			mini: false,
			wrapperClass: null
		},

		classProp: "ui-checkboxradio-label"
	} );
	$.widget( "ui.checkboxradio", $.ui.checkboxradio, $.mobile.widget.backcompat );
}

return $.ui.checkboxradio;

} );

/*!
 * jQuery Mobile Clear Button @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Text Input Clear Button
//>>group: Forms
//>>description: Add the ability to have a clear button
//>>docs: http://api.jquerymobile.com/textinput/#option-clearBtn
//>>demos: http://demos.jquerymobile.com/@VERSION/textinput/
//>>css.structure: ../css/structure/jquery.mobile.forms.textinput.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/clearButton',[
			"jquery",
			"./textinput" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

return $.widget( "mobile.textinput", $.mobile.textinput, {
	options: {
		classes: {
			"ui-textinput-clear-button": "ui-corner-all"
		},
		clearBtn: false,
		clearBtnText: "Clear text"
	},

	_create: function() {
		this._super();

		if ( this.isSearch ) {
			this.options.clearBtn = true;
		}

		// We do nothing on startup if the options is off or if this is not a wrapped input
		if ( !this.options.clearBtn || this.isTextarea ) {
			return;
		}

		if ( this.options.enhanced ) {
			this._clearButton = this._outer.children( ".ui-textinput-clear-button" );
			this._clearButtonIcon = this._clearButton
				.children( ".ui-textinput-clear-button-icon" );
			this._toggleClasses( true );
			this._bindClearEvents();
		} else {
			this._addClearButton();
		}
	},

	_clearButtonClick: function( event ) {
		this.element.val( "" )
			.focus()
			.trigger( "change" );
		event.preventDefault();
	},

	_toggleClasses: function( add ) {
		this._toggleClass( this._outer, "ui-textinput-has-clear-button", null, add );
		this._toggleClass( this._clearButton, "ui-textinput-clear-button",
			"ui-button ui-button-icon-only ui-button-right", add );
		this._toggleClass( this._clearButtonIcon, "ui-textinput-clear-button-icon",
			"ui-icon-delete ui-icon", add );
		this._toggleClass( "ui-textinput-hide-clear", null, add );
	},

	_addClearButton: function() {
		this._clearButtonIcon = $( "<span>" );
		this._clearButton = $( "<a href='#' tabindex='-1' aria-hidden='true'></a>" )
			.attr( "title", this.options.clearBtnText )
			.text( this.options.clearBtnText )
			.append( this._clearButtonIcon );
		this._toggleClasses( true );
		this._clearButton.appendTo( this._outer );
		this._bindClearEvents();
		this._toggleClear();
	},

	_removeClearButton: function() {
		this._toggleClasses( false );
		this._unbindClearEvents();
		this._clearButton.remove();
		clearTimeout( this._toggleClearDelay );
		delete this._toggleClearDelay;
	},

	_bindClearEvents: function() {
		this._on( this._clearButton, {
			"click": "_clearButtonClick"
		} );

		this._on( {
			"keyup": "_toggleClear",
			"change": "_toggleClear",
			"input": "_toggleClear",
			"focus": "_toggleClear",
			"blur": "_toggleClear",
			"cut": "_toggleClear",
			"paste": "_toggleClear"

		} );
	},

	_unbindClearEvents: function() {
		this._off( this._clearButton, "click" );
		this._off( this.element, "keyup change input focus blur cut paste" );
	},

	_setOptions: function( options ) {
		this._super( options );

		if ( options.clearBtn !== undefined && !this.isTextarea ) {
			if ( options.clearBtn ) {
				this._addClearButton();
			} else {
				this._removeClearButton();
			}
		}

		if ( options.clearBtnText !== undefined && this._clearButton !== undefined ) {
			this._clearButton.text( options.clearBtnText )
				.attr( "title", options.clearBtnText );
		}
	},

	_toggleClear: function() {
		this._toggleClearDelay = this._delay( "_toggleClearClass", 0 );
	},

	_toggleClearClass: function() {
		this._toggleClass( this._clearButton, "ui-textinput-clear-button-hidden",
			undefined, !this.element.val() );
		this._clearButton.attr( "aria-hidden", !this.element.val() );
		delete this._toggleClearDelay;
	},

	_destroy: function() {
		this._super();
		if ( !this.options.enhanced && this._clearButton ) {
			this._removeClearButton();
		}
	}

} );

} );

/*!
 * jQuery Mobile Form Reset @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Form Reset
//>>group: Forms
//>>description: A behavioral mixin that forces a widget to react to a form reset

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/reset',[
			"jquery",
			"../../core" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.mobile.behaviors.formReset = {
	_handleFormReset: function() {
		this._on( this.element.closest( "form" ), {
			reset: function() {
				this._delay( "_reset" );
			}
		} );
	}
};

return $.mobile.behaviors.formReset;

} );

/*!
 * jQuery Mobile Flipswitch @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Flip Switch
//>>group: Forms
//>>description: Consistent styling for native select menus. Tapping opens a native select menu.
//>>docs: http://api.jquerymobile.com/flipswitch/
//>>demos: http://demos.jquerymobile.com/@VERSION/flipswitch/
//>>css.structure: ../css/structure/jquery.mobile.forms.flipswitch.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/flipswitch',[
			"jquery",
			"../../core",
			"../../widget",
			"../../zoom",
			"./reset" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var selectorEscapeRegex = /([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;

return $.widget( "mobile.flipswitch", $.extend( {
	version: "@VERSION",

	options: {
		onText: "On",
		offText: "Off",
		theme: null,
		enhanced: false,
		classes: {
			"ui-flipswitch": "ui-shadow-inset ui-corner-all",
			"ui-flipswitch-on": "ui-shadow"
		}
	},

	_create: function() {
		var labels;

		this._originalTabIndex = this.element.attr( "tabindex" );
		this.type = this.element[ 0 ].nodeName.toLowerCase();

		if ( !this.options.enhanced ) {
			this._enhance();
		} else {
			$.extend( this, {
				flipswitch: this.element.parent(),
				on: this.element.find( ".ui-flipswitch-on" ).eq( 0 ),
				off: this.element.find( ".ui-flipswitch-off" ).eq( 0 )
			} );
		}

		this._handleFormReset();

		this.element.attr( "tabindex", "-1" );
		this._on( {
			"focus": "_handleInputFocus"
		} );

		if ( this.element.is( ":disabled" ) ) {
			this._setOptions( {
				"disabled": true
			} );
		}

		this._on( this.flipswitch, {
			"click": "_toggle",
			"swipeleft": "_left",
			"swiperight": "_right"
		} );

		this._on( this.on, {
			"keydown": "_keydown"
		} );

		this._on( {
			"change": "refresh"
		} );

		// On iOS we need to prevent default when the label is clicked, otherwise it drops down
		// the native select menu. We nevertheless pass the click onto the element like the
		// native code would.
		if ( this.element[ 0 ].nodeName.toLowerCase() === "select" ) {
			labels = this._findLabels();
			if ( labels.length ) {
				this._on( labels, {
					"click": function( event ) {
						this.element.click();
						event.preventDefault();
					}
				} );
			}
		}
	},

	_handleInputFocus: function() {
		this.on.focus();
	},

	widget: function() {
		return this.flipswitch;
	},

	_left: function() {
		this.flipswitch.removeClass( "ui-flipswitch-active" );
		if ( this.type === "select" ) {
			this.element.get( 0 ).selectedIndex = 0;
		} else {
			this.element.prop( "checked", false );
		}
		this.element.trigger( "change" );
	},

	_right: function() {
		this._addClass( this.flipswitch, "ui-flipswitch-active" );
		if ( this.type === "select" ) {
			this.element.get( 0 ).selectedIndex = 1;
		} else {
			this.element.prop( "checked", true );
		}
		this.element.trigger( "change" );
	},

	_enhance: function() {
		var flipswitch = $( "<div>" ),
			options = this.options,
			element = this.element,
			tabindex = this._originalTabIndex || 0,
			theme = options.theme ? options.theme : "inherit",

			// The "on" button is an anchor so it's focusable
			on = $( "<span tabindex='" + tabindex + "'></span>" ),
			off = $( "<span></span>" ),
			onText = ( this.type === "input" ) ?
				options.onText : element.find( "option" ).eq( 1 ).text(),
			offText = ( this.type === "input" ) ?
				options.offText : element.find( "option" ).eq( 0 ).text();

		this._addClass( on, "ui-flipswitch-on", "ui-button ui-button-inherit" );
		on.text( onText );
		this._addClass( off, "ui-flipswitch-off" );
		off.text( offText );

		this._addClass( flipswitch, "ui-flipswitch", "ui-bar-" + theme + " " +
				( ( element.is( ":checked" ) ||
				element
					.find( "option" )
						.eq( 1 )
						.is( ":selected" ) ) ? "ui-flipswitch-active" : "" ) +
				( element.is( ":disabled" ) ? " ui-state-disabled" : "" ) );

		flipswitch.append( on, off );

		this._addClass( "ui-flipswitch-input" );
		element.after( flipswitch ).appendTo( flipswitch );

		$.extend( this, {
			flipswitch: flipswitch,
			on: on,
			off: off
		} );
	},

	_reset: function() {
		this.refresh();
	},

	refresh: function() {
		var direction,
			existingDirection = this.flipswitch
				.hasClass( "ui-flipswitch-active" ) ? "_right" : "_left";

		if ( this.type === "select" ) {
			direction = ( this.element.get( 0 ).selectedIndex > 0 ) ? "_right" : "_left";
		} else {
			direction = this.element.prop( "checked" ) ? "_right" : "_left";
		}

		if ( direction !== existingDirection ) {
			this[ direction ]();
		}
	},

	// Copied with modifications from checkboxradio
	_findLabels: function() {
		var input = this.element[ 0 ],
			labelsList = input.labels;

		if ( labelsList && labelsList.length ) {
			labelsList = $( labelsList );
		} else {
			labelsList = this.element.closest( "label" );
			if ( labelsList.length === 0 ) {

				// NOTE: Windows Phone could not find the label through a selector
				// filter works though.
				labelsList = $( this.document[ 0 ].getElementsByTagName( "label" ) )
					.filter( "[for='" +
						input.getAttribute( "id" ).replace( selectorEscapeRegex, "\\$1" ) +
						"']" );
			}
		}

		return labelsList;
	},

	_toggle: function() {
		var direction = this.flipswitch.hasClass( "ui-flipswitch-active" ) ? "_left" : "_right";

		this[ direction ]();
	},

	_keydown: function( e ) {
		if ( e.which === $.mobile.keyCode.LEFT ) {
			this._left();
		} else if ( e.which === $.mobile.keyCode.RIGHT ) {
			this._right();
		} else if ( e.which === $.mobile.keyCode.SPACE ) {
			this._toggle();
			e.preventDefault();
		}
	},

	_setOptions: function( options ) {
		if ( options.theme !== undefined ) {
			var currentTheme = this.options.theme ? this.options.theme : "inherit",
				newTheme = options.theme ? options.theme : "inherit";

			this._removeClass( this.flipswitch, null,  "ui-bar-" + currentTheme );
			this._addClass( this.flipswitch, null,  "ui-bar-" + newTheme );
		}
		if ( options.onText !== undefined ) {
			this.on.text( options.onText );
		}
		if ( options.offText !== undefined ) {
			this.off.text( options.offText );
		}
		if ( options.disabled !== undefined ) {
			this._toggleClass( this.flipswitch, null, "ui-state-disabled", options.disabled );
		}

		this._super( options );
	},

	_destroy: function() {
		if ( this.options.enhanced ) {
			return;
		}
		if ( this._originalTabIndex != null ) {
			this.element.attr( "tabindex", this._originalTabIndex );
		} else {
			this.element.removeAttr( "tabindex" );
		}
		this.on.remove();
		this.off.remove();
		this.element.unwrap();
		this.element.removeClass( "ui-flipswitch-input" );
		this.flipswitch.remove();
	}

}, $.mobile.behaviors.formReset ) );

} );

/*!
 * jQuery Mobile Flipswitch Backcompat @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Flipswitch
//>>group: Forms
//>>description: Deprecated rangeslider features

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/flipswitch.backcompat',[
			"jquery",
			"../widget.backcompat",
			"./flipswitch" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

if ( $.mobileBackcompat !== false ) {

	$.widget( "mobile.flipswitch", $.mobile.flipswitch, {
		options: {
			corners: true,
			mini: false,
			wrapperClass: null
		},
		classProp: "ui-flipswitch"
	} );

	$.widget( "mobile.flipswitch", $.mobile.flipswitch, $.mobile.widget.backcompat );

}

return $.mobile.flipswitch;

} );

/*!
 * jQuery Mobile Slider @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Slider
//>>group: Forms
//>>description: Slider form widget
//>>docs: http://api.jquerymobile.com/button/
//>>demos: http://demos.jquerymobile.com/@VERSION/button/
//>>css.structure: ../css/structure/jquery.mobile.forms.slider.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/slider',[
			"jquery",
			"../../core",
			"../../widget",
			"./textinput",
			"../../vmouse",
			"../widget.theme",
			"./reset" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.widget( "mobile.slider", $.extend( {
	version: "@VERSION",

	initSelector: "input[type='range'], :jqmData(type='range'), :jqmData(role='slider')",

	widgetEventPrefix: "slide",

	options: {
		theme: "inherit",
		trackTheme: "inherit",
		classes: {
			"ui-slider-track": "ui-shadow-inset ui-corner-all",
			"ui-slider-input": "ui-shadow-inset ui-corner-all"
		}
	},

	_create: function() {

		// TODO: Each of these should have comments explain what they're for
		var control = this.element,
			cType = control[ 0 ].nodeName.toLowerCase(),
			isRangeslider = control.parent().is( ":jqmData(role='rangeslider')" ),
			controlID = control.attr( "id" ),
			$label = $( "[for='" + controlID + "']" ),
			labelID = $label.attr( "id" ) || controlID + "-label",
			min = parseFloat( control.attr( "min" ) ),
			max = parseFloat( control.attr( "max" ) ),
			step = window.parseFloat( control.attr( "step" ) || 1 ),
			domHandle = document.createElement( "a" ),
			handle = $( domHandle ),
			domSlider = document.createElement( "div" ),
			slider = $( domSlider ),
			wrapper;

		$label.attr( "id", labelID );

		domHandle.setAttribute( "href", "#" );
		domSlider.setAttribute( "role", "application" );
		this._addClass( slider, "ui-slider-track" );
		this._addClass( handle, "ui-slider-handle" );
		domSlider.appendChild( domHandle );

		handle.attr( {
			"role": "slider",
			"aria-valuemin": min,
			"aria-valuemax": max,
			"aria-valuenow": this._value(),
			"aria-valuetext": this._value(),
			"title": this._value(),
			"aria-labelledby": labelID
		} );

		$.extend( this, {
			slider: slider,
			handle: handle,
			control: control,
			type: cType,
			step: step,
			max: max,
			min: min,
			isRangeslider: isRangeslider,
			dragging: false,
			beforeStart: null,
			userModified: false,
			mouseMoved: false
		} );

		// Monitor the input for updated values
		this._addClass( "ui-slider-input" );

		this._on( control, {
			"change": "_controlChange",
			"keyup": "_controlKeyup",
			"blur": "_controlBlur",
			"vmouseup": "_controlVMouseUp"
		} );

		slider.bind( "vmousedown", $.proxy( this._sliderVMouseDown, this ) )
			.bind( "vclick", false );

		// We have to instantiate a new function object for the unbind to work properly
		// since the method itself is defined in the prototype (causing it to unbind everything)
		this._on( document, { "vmousemove": "_preventDocumentDrag" } );
		this._on( slider.add( document ), { "vmouseup": "_sliderVMouseUp" } );

		slider.insertAfter( control );

		// Wrap in a div for styling purposes
		if ( !isRangeslider ) {
			wrapper = "<div class='ui-slider'></div>";

			control.add( slider ).wrapAll( wrapper );
		}

		// Bind the handle event callbacks and set the context to the widget instance
		this._on( this.handle, {
			"vmousedown": "_handleVMouseDown",
			"keydown": "_handleKeydown",
			"keyup": "_handleKeyup"
		} );

		this.handle.bind( "vclick", false );

		this._handleFormReset();

		this.refresh( undefined, undefined, true );
	},

	_setOptions: function( options ) {
		if ( options.disabled !== undefined ) {
			this._setDisabled( options.disabled );
		}
		this._super( options );
	},

	_controlChange: function( event ) {

		// If the user dragged the handle, the "change" event was triggered from
		// inside refresh(); don't call refresh() again
		if ( this._trigger( "controlchange", event ) === false ) {
			return false;
		}
		if ( !this.mouseMoved ) {
			this.refresh( this._value(), true );
		}
	},

	_controlKeyup: function( /* event */ ) {

		// Necessary?
		this.refresh( this._value(), true, true );
	},

	_controlBlur: function( /* event */ ) {
		this.refresh( this._value(), true );
	},

	// It appears the clicking the up and down buttons in chrome on
	// range/number inputs doesn't trigger a change until the field is
	// blurred. Here we check thif the value has changed and refresh
	_controlVMouseUp: function( /* event */ ) {
		this._checkedRefresh();
	},

	// NOTE force focus on handle
	_handleVMouseDown: function( /* event */ ) {
		this.handle.focus();
	},

	_handleKeydown: function( event ) {
		var index = this._value();
		if ( this.options.disabled ) {
			return;
		}

		// In all cases prevent the default and mark the handle as active
		switch ( event.keyCode ) {
		case $.mobile.keyCode.HOME:
		case $.mobile.keyCode.END:
		case $.mobile.keyCode.PAGE_UP:
		case $.mobile.keyCode.PAGE_DOWN:
		case $.mobile.keyCode.UP:
		case $.mobile.keyCode.RIGHT:
		case $.mobile.keyCode.DOWN:
		case $.mobile.keyCode.LEFT:
			event.preventDefault();

			if ( !this._keySliding ) {
				this._keySliding = true;

				// TODO: We don't use this class for styling. Do we need it?
				this._addClass( this.handle, null, "ui-state-active" );
			}

			break;
		}

		// Move the slider according to the keypress
		switch ( event.keyCode ) {
		case $.mobile.keyCode.HOME:
			this.refresh( this.min );
			break;
		case $.mobile.keyCode.END:
			this.refresh( this.max );
			break;
		case $.mobile.keyCode.PAGE_UP:
		case $.mobile.keyCode.UP:
		case $.mobile.keyCode.RIGHT:
			this.refresh( index + this.step );
			break;
		case $.mobile.keyCode.PAGE_DOWN:
		case $.mobile.keyCode.DOWN:
		case $.mobile.keyCode.LEFT:
			this.refresh( index - this.step );
			break;
		}
	},

	_handleKeyup: function( /* event */ ) {
		if ( this._keySliding ) {
			this._keySliding = false;
			this._removeClass( this.handle, null, "ui-state-active" ); /* See comment above. */
		}
	},

	_sliderVMouseDown: function( event ) {

		// NOTE: we don't do this in refresh because we still want to
		//       support programmatic alteration of disabled inputs
		if ( this.options.disabled || !( event.which === 1 ||
			event.which === 0 || event.which === undefined ) ) {
			return false;
		}
		if ( this._trigger( "beforestart", event ) === false ) {
			return false;
		}
		this.dragging = true;
		this.userModified = false;
		this.mouseMoved = false;

		this.refresh( event );
		this._trigger( "start" );
		return false;
	},

	_sliderVMouseUp: function() {
		if ( this.dragging ) {
			this.dragging = false;
			this.mouseMoved = false;
			this._trigger( "stop" );
			return false;
		}
	},

	_preventDocumentDrag: function( event ) {

		// NOTE: we don't do this in refresh because we still want to
		//       support programmatic alteration of disabled inputs
		if ( this._trigger( "drag", event ) === false ) {
			return false;
		}
		if ( this.dragging && !this.options.disabled ) {

			// This.mouseMoved must be updated before refresh() because it will be
			// used in the control "change" event
			this.mouseMoved = true;

			this.refresh( event );

			// Only after refresh() you can calculate this.userModified
			this.userModified = this.beforeStart !== this.element[ 0 ].selectedIndex;
			return false;
		}
	},

	_checkedRefresh: function() {
		if ( this.value !== this._value() ) {
			this.refresh( this._value() );
		}
	},

	_value: function() {
		return parseFloat( this.element.val() );
	},

	_reset: function() {
		this.refresh( undefined, false, true );
	},

	refresh: function( val, isfromControl, preventInputUpdate ) {

		// NOTE: we don't return here because we want to support programmatic
		//       alteration of the input value, which should still update the slider

		var self = this,
			left, width, data, tol,
			pxStep, percent,
			control, min, max, step,
			newval, valModStep, alignValue, percentPerStep,
			handlePercent, aPercent, bPercent,
			valueChanged;

		this._addClass( self.slider, "ui-slider-track" );
		if ( this.options.disabled || this.element.prop( "disabled" ) ) {
			this.disable();
		}

		// Set the stored value for comparison later
		this.value = this._value();
		this._addClass( this.handle, null, "ui-button ui-shadow" );

		control = this.element;
		min = parseFloat( control.attr( "min" ) );
		max = parseFloat( control.attr( "max" ) );
		step = ( parseFloat( control.attr( "step" ) ) > 0 ) ?
				parseFloat( control.attr( "step" ) ) : 1;

		if ( typeof val === "object" ) {
			data = val;

			// A slight tolerance helped get to the ends of the slider
			tol = 8;

			left = this.slider.offset().left;
			width = this.slider.width();
			pxStep = width / ( ( max - min ) / step );
			if ( !this.dragging ||
					data.pageX < left - tol ||
					data.pageX > left + width + tol ) {
				return;
			}
			if ( pxStep > 1 ) {
				percent = ( ( data.pageX - left ) / width ) * 100;
			} else {
				percent = Math.round( ( ( data.pageX - left ) / width ) * 100 );
			}
		} else {
			if ( val == null ) {
				val = parseFloat( control.val() || 0 ) ;
			}
			percent = ( parseFloat( val ) - min ) / ( max - min ) * 100;
		}

		if ( isNaN( percent ) ) {
			return;
		}

		newval = ( percent / 100 ) * ( max - min ) + min;

		//From jQuery UI slider, the following source will round to the nearest step
		valModStep = ( newval - min ) % step;
		alignValue = newval - valModStep;

		if ( Math.abs( valModStep ) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		percentPerStep = 100 / ( ( max - min ) / step );

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see jQueryUI: #4124)
		newval = parseFloat( alignValue.toFixed( 5 ) );

		if ( typeof pxStep === "undefined" ) {
			pxStep = width / ( ( max - min ) / step );
		}
		if ( pxStep > 1 ) {
			percent = ( newval - min ) * percentPerStep * ( 1 / step );
		}
		if ( percent < 0 ) {
			percent = 0;
		}

		if ( percent > 100 ) {
			percent = 100;
		}

		if ( newval < min ) {
			newval = min;
		}

		if ( newval > max ) {
			newval = max;
		}

		this.handle.css( "left", percent + "%" );

		this.handle[ 0 ].setAttribute( "aria-valuenow",  newval );

		this.handle[ 0 ].setAttribute( "aria-valuetext", newval );

		this.handle[ 0 ].setAttribute( "title", newval );

		if ( this.valuebg ) {
			this.valuebg.css( "width", percent + "%" );
		}

		// Drag the label widths
		if ( this._labels ) {
			handlePercent = this.handle.width() / this.slider.width() * 100;
			aPercent = percent && handlePercent + ( 100 - handlePercent ) * percent / 100;
			bPercent = percent === 100 ? 0 : Math.min( handlePercent + 100 - aPercent, 100 );

			this._labels.each( function() {
				var ab = $( this ).hasClass( "ui-slider-label-a" );
				$( this ).width( ( ab ? aPercent : bPercent ) + "%" );
			} );
		}

		if ( !preventInputUpdate ) {
			valueChanged = false;

			// Update control"s value
			valueChanged = parseFloat( control.val() ) !== newval;
			control.val( newval );

			if ( this._trigger( "beforechange", val ) === false ) {
				return false;
			}
			if ( !isfromControl && valueChanged ) {
				control.trigger( "change" );
			}
		}
	},

	_themeElements: function() {
		return [
			{
				element: this.handle,
				prefix: "ui-button-"
			},
			{
				element: this.control,
				prefix: "ui-body-"
			},
			{
				element: this.slider,
				prefix: "ui-body-",
				option: "trackTheme"
			},
			{
				element: this.element,
				prefix: "ui-body-"
			}
		];
	},

	_setDisabled: function( value ) {
		value = !!value;
		this.element.prop( "disabled", value );

		this._toggleClass( this.slider, null, "ui-state-disabled", value );
		this.slider.attr( "aria-disabled", value );

		this._toggleClass( null, "ui-state-disabled", value );
	}

}, $.mobile.behaviors.formReset ) );

return $.widget( "mobile.slider", $.mobile.slider, $.mobile.widget.theme );

} );

/*!
 * jQuery Mobile Range Slider @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Range Slider
//>>group: Forms
//>>description: Range Slider form widget
//>>docs: http://api.jquerymobile.com/rangeslider/
//>>demos: http://demos.jquerymobile.com/@VERSION/rangeslider/
//>>css.structure: ../css/structure/jquery.mobile.forms.rangeslider.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/rangeslider',[
			"jquery",
			"../../core",
			"../../widget",
			"./textinput",
			"../../vmouse",
			"./reset",
			"../widget.theme",
			"./slider" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.widget( "mobile.rangeslider", $.extend( {
	version: "@VERSION",

	options: {
		theme: "inherit",
		trackTheme: "inherit"
	},

	_create: function() {
		var _inputFirst = this.element.find( "input" ).first(),
		_inputLast = this.element.find( "input" ).last(),
		_label = this.element.find( "label" ).first(),
		_sliderWidgetFirst = $.data( _inputFirst.get( 0 ), "mobile-slider" ) ||
			$.data( _inputFirst.slider().get( 0 ), "mobile-slider" ),
		_sliderWidgetLast = $.data( _inputLast.get( 0 ), "mobile-slider" ) ||
			$.data( _inputLast.slider().get( 0 ), "mobile-slider" ),
		_sliderFirst = _sliderWidgetFirst.slider,
		_sliderLast = _sliderWidgetLast.slider,
		firstHandle = _sliderWidgetFirst.handle,
		_sliders = $( "<div>" );
		this._addClass( _sliders, "ui-rangeslider-sliders" );
		_sliders.appendTo( this.element );

		this._addClass( _inputFirst, "ui-rangeslider-first" );
		this._addClass( _inputLast, "ui-rangeslider-last" );
		this._addClass( "ui-rangeslider" );

		_sliderFirst.appendTo( _sliders );
		_sliderLast.appendTo( _sliders );
		_label.insertBefore( this.element );
		firstHandle.prependTo( _sliderLast );

		$.extend( this, {
			_inputFirst: _inputFirst,
			_inputLast: _inputLast,
			_sliderFirst: _sliderFirst,
			_sliderLast: _sliderLast,
			_label: _label,
			_targetVal: null,
			_sliderTarget: false,
			_sliders: _sliders,
			_proxy: false
		} );

		this.refresh();
		this._on( this.element.find( "input.ui-slider-input" ), {
			"slidebeforestart": "_slidebeforestart",
			"slidestop": "_slidestop",
			"slidedrag": "_slidedrag",
			"slidebeforechange": "_change",
			"blur": "_change",
			"keyup": "_change"
		} );
		this._on( {
			"mousedown":"_change"
		} );
		this._on( this.element.closest( "form" ), {
			"reset":"_handleReset"
		} );
		this._on( firstHandle, {
			"vmousedown": "_dragFirstHandle"
		} );
	},
	_handleReset: function() {
		var self = this;

		// We must wait for the stack to unwind before updating
		// otherwise sliders will not have updated yet
		setTimeout( function() {
			self._updateHighlight();
		}, 0 );
	},

	_dragFirstHandle: function( event ) {

		// If the first handle is dragged send the event to the first slider
		$.data( this._inputFirst.get( 0 ), "mobile-slider" ).dragging = true;
		$.data( this._inputFirst.get( 0 ), "mobile-slider" ).refresh( event );
		$.data( this._inputFirst.get( 0 ), "mobile-slider" )._trigger( "start" );
		return false;
	},

	_slidedrag: function( event ) {
		var first = $( event.target ).is( this._inputFirst ),
			otherSlider = ( first ) ? this._inputLast : this._inputFirst;

		this._sliderTarget = false;

		// If the drag was initiated on an extreme and the other handle is
		// focused send the events to the closest handle
		if ( ( this._proxy === "first" && first ) || ( this._proxy === "last" && !first ) ) {
			$.data( otherSlider.get( 0 ), "mobile-slider" ).dragging = true;
			$.data( otherSlider.get( 0 ), "mobile-slider" ).refresh( event );
			return false;
		}
	},

	_slidestop: function( event ) {
		var first = $( event.target ).is( this._inputFirst );

		this._proxy = false;

		// This stops dragging of the handle and brings the active track to the front
		// this makes clicks on the track go the the last handle used
		this.element.find( "input" ).trigger( "vmouseup" );
		this._sliderFirst.css( "z-index", first ? 1 : "" );
	},

	_slidebeforestart: function( event ) {
		this._sliderTarget = false;

		// If the track is the target remember this and the original value
		if ( $( event.originalEvent.target ).hasClass( "ui-slider-track" ) ) {
			this._sliderTarget = true;
			this._targetVal = $( event.target ).val();
		}
	},

	_setOptions: function( options ) {
		if ( options.theme !== undefined ) {
			this._setTheme( options.theme );
		}

		if ( options.trackTheme !== undefined ) {
			this._setTrackTheme( options.trackTheme );
		}

		if ( options.disabled !== undefined ) {
			this._setDisabled( options.disabled );
		}

		this._super( options );
		this.refresh();
	},

	refresh: function() {
		var $el = this.element,
			o = this.options;

		if ( this._inputFirst.is( ":disabled" ) || this._inputLast.is( ":disabled" ) ) {
			this.options.disabled = true;
		}

		$el.find( "input" ).slider( {
			theme: o.theme,
			trackTheme: o.trackTheme,
			disabled: o.disabled
		} ).slider( "refresh" );
		this._updateHighlight();
	},

	_change: function( event ) {
		if ( event.type === "keyup" ) {
			this._updateHighlight();
			return false;
		}

		var self = this,
			min = parseFloat( this._inputFirst.val(), 10 ),
			max = parseFloat( this._inputLast.val(), 10 ),
			first = $( event.target ).hasClass( "ui-rangeslider-first" ),
			thisSlider = first ? this._inputFirst : this._inputLast,
			otherSlider = first ? this._inputLast : this._inputFirst;

		if ( ( this._inputFirst.val() > this._inputLast.val() && event.type === "mousedown" &&
			!$( event.target ).hasClass( "ui-slider-handle" ) ) ) {
			thisSlider.blur();
		} else if ( event.type === "mousedown" ) {
			return;
		}
		if ( min > max && !this._sliderTarget ) {

			// This prevents min from being greater than max
			thisSlider.val( first ? max : min ).slider( "refresh" );
			this._trigger( "normalize" );
		} else if ( min > max ) {

			// This makes it so clicks on the target on either extreme go to the closest handle
			thisSlider.val( this._targetVal ).slider( "refresh" );

			// You must wait for the stack to unwind so
			// first slider is updated before updating second
			setTimeout( function() {
				otherSlider.val( first ? min : max ).slider( "refresh" );
				$.data( otherSlider.get( 0 ), "mobile-slider" ).handle.focus();
				self._sliderFirst.css( "z-index", first ? "" : 1 );
				self._trigger( "normalize" );
			}, 0 );
			this._proxy = ( first ) ? "first" : "last";
		}

		// Fixes issue where when both _sliders are at min they cannot be adjusted
		if ( min === max ) {
			$.data( thisSlider.get( 0 ), "mobile-slider" ).handle.css( "z-index", 1 );
			$.data( otherSlider.get( 0 ), "mobile-slider" ).handle.css( "z-index", 0 );
		} else {
			$.data( otherSlider.get( 0 ), "mobile-slider" ).handle.css( "z-index", "" );
			$.data( thisSlider.get( 0 ), "mobile-slider" ).handle.css( "z-index", "" );
		}

		this._updateHighlight();

		if ( min > max ) {
			return false;
		}
	},

	_themeElements: function() {
		return [
			{
				element: this.element.find( ".ui-slider-track" ),
				prefix: "ui-bar-"
			}
		];
	},

	_updateHighlight: function() {
		var min = parseInt( $.data( this._inputFirst.get( 0 ), "mobile-slider" )
								.handle.get( 0 ).style.left, 10 ),
			max = parseInt( $.data( this._inputLast.get( 0 ), "mobile-slider" )
								.handle.get( 0 ).style.left, 10 ),
			width = ( max - min );

		this.element.find( ".ui-slider-bg" ).css( {
			"margin-left": min + "%",
			"width": width + "%"
		} );
	},

	_setTheme: function( value ) {
		this._inputFirst.slider( "option", "theme", value );
		this._inputLast.slider( "option", "theme", value );
	},

	_setTrackTheme: function( value ) {
		this._inputFirst.slider( "option", "trackTheme", value );
		this._inputLast.slider( "option", "trackTheme", value );
	},

	_setDisabled: function( value ) {
		this._inputFirst.prop( "disabled", value );
		this._inputLast.prop( "disabled", value );
	},

	_destroy: function() {
		this._label.prependTo( this.element );
		this._inputFirst.after( this._sliderFirst );
		this._inputLast.after( this._sliderLast );
		this._sliders.remove();
		this.element.find( "input" ).slider( "destroy" );
	}

}, $.mobile.behaviors.formReset ) );

return $.widget( "mobile.rangeslider", $.mobile.rangeslider, $.mobile.widget.theme );

} );

/*!
 * jQuery Mobile Rangeslider Backcompat @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Rangeslider
//>>group: Forms
//>>description: Deprecated rangeslider features

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/rangeslider.backcompat',[
			"jquery",
			"../widget.backcompat",
			"./rangeslider" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

if ( $.mobileBackcompat !== false ) {

	$.widget( "mobile.rangeslider", $.mobile.rangeslider, {
		options: {
			corners: true,
			mini: false,
			highlight: true
		},
		classProp: "ui-rangeslider",
		_create: function() {
			this._super();

			this.element.find( "input" ).slider( {
				mini: this.options.mini,
				highlight: this.options.highlight
			} ).slider( "refresh" );

			this._updateHighlight();

			if ( this.options.mini ) {
				this._addClass( "ui-mini", null );
				this._addClass( this._sliderFirst, "ui-mini", null );
				this._addClass( this._sliderLast, "ui-mini", null );
			}
		}
	} );

	$.widget( "mobile.rangeslider", $.mobile.rangeslider, $.mobile.widget.backcompat );

}

return $.mobile.rangeslider;

} );

/*!
 * jQuery Mobile Select Menu @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Selects
//>>group: Forms
//>>description: Consistent styling for native select menus. Tapping opens a native select menu.
//>>docs: http://api.jquerymobile.com/selectmenu/
//>>demos: http://demos.jquerymobile.com/@VERSION/selectmenu/
//>>css.structure: ../css/structure/jquery.mobile.forms.select.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/forms/select',[
			"jquery",
			"jquery-ui/labels",
			"../../core",
			"../../widget",
			"../../zoom",
			"../../navigation/path",
			"../widget.theme",
			"jquery-ui/form-reset-mixin" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var selectmenu = $.widget( "mobile.selectmenu", [ {
	version: "@VERSION",

	options: {
		classes: {
			"ui-selectmenu-button": "ui-corner-all ui-shadow"
		},
		theme: "inherit",
		icon: "caret-d",
		iconpos: "right",
		nativeMenu: true,

		// This option defaults to true on iOS devices.
		preventFocusZoom: /iPhone|iPad|iPod/.test( navigator.platform ) &&
			navigator.userAgent.indexOf( "AppleWebKit" ) > -1
	},

	_button: function() {
		return $( "<div/>" );
	},

	_themeElements: function() {
		return [
			{
				element: this.button,
				prefix: "ui-button-"
			}
		];
	},

	_setDisabled: function( value ) {
		this.element.prop( "disabled", value );
		this.button.attr( "aria-disabled", value );
		return this._setOption( "disabled", value );
	},

	_focusButton: function() {
		var that = this;

		setTimeout( function() {
			that.button.focus();
		}, 40 );
	},

	_selectOptions: function() {
		return this.element.find( "option" );
	},

	// Setup items that are generally necessary for select menu extension
	_preExtension: function() {
		var classes = "";

		this.element = this.element;
		this.selectWrapper = $( "<div>" );
		this._addClass( this.selectWrapper, "ui-selectmenu", classes );
		this.selectWrapper.insertBefore( this.element );
		this.element.detach();

		this.selectId = this.element.attr( "id" ) || ( "select-" + this.uuid );
		this.buttonId = this.selectId + "-button";
		this.isMultiple = this.element[ 0 ].multiple;

		this.element.appendTo( this.selectWrapper );
		this.label = this.element.labels().first();
	},

	_destroy: function() {
		if ( this.selectWrapper.length > 0 ) {
			this.element.insertAfter( this.selectWrapper );
			this.selectWrapper.remove();
		}
		this._unbindFormResetHandler();
	},

	_create: function() {
		var options = this.options,
			iconpos = options.icon ?
				( options.iconpos || this.element.attr( "data-" + this._ns() + "iconpos" ) ) :
					false;

		this._preExtension();

		this.button = this._button();

		this.button.attr( "id", this.buttonId );
		this._addClass( this.button, "ui-selectmenu-button", "ui-button" );
		this.button.insertBefore( this.element );

		if ( this.options.icon ) {
			this.icon = $( "<span>" );
			this._addClass( this.icon, "ui-selectmenu-button-icon",
				"ui-icon-" + options.icon + " ui-icon ui-widget-icon-float" +
					( iconpos === "right" ? "end" : "beginning" ) );
			this.button.prepend( this.icon );
		}

		this.setButtonText();

		// Opera does not properly support opacity on select elements
		// In Mini, it hides the element, but not its text
		// On the desktop,it seems to do the opposite
		// for these reasons, using the nativeMenu option results in a full native select in Opera
		if ( options.nativeMenu && window.opera && window.opera.version ) {
			this._addClass( this.button, "ui-selectmenu-nativeonly" );
		}

		// Add counter for multi selects
		if ( this.isMultiple ) {
			this.buttonCount = $( "<span>" ).hide();
			this._addClass( this.buttonCount, "ui-selectmenu-count-bubble",
				"ui-listview-item-count-bubble ui-body-inherit" );
			this._addClass( this.button, null, "ui-listview-item-has-count" );
			this.buttonCount.appendTo( this.button );
		}

		// Disable if specified
		if ( options.disabled || this.element.prop( "disabled" ) ) {
			this.disable();
		}

		// Events on native select
		this._on( this.element, {
			change: "refresh"
		} );

		this._bindFormResetHandler();

		this._on( this.button, {
			keydown: "_handleKeydown"
		} );

		this.build();
	},

	build: function() {
		var that = this;

		this.element
			.appendTo( that.button )
			.bind( "vmousedown", function() {

				// Add active class to button
				that.button.addClass( "ui-button-active" );
			} )
			.bind( "focus", function() {
				that.button.addClass( "ui-focus" );
			} )
			.bind( "blur", function() {
				that.button.removeClass( "ui-focus" );
			} )
			.bind( "focus vmouseover", function() {
				that.button.trigger( "vmouseover" );
			} )
			.bind( "vmousemove", function() {

				// Remove active class on scroll/touchmove
				that.button.removeClass( "ui-button-active" );
			} )
			.bind( "change blur vmouseout", function() {
				that.button.trigger( "vmouseout" )
					.removeClass( "ui-button-active" );
			} );

		// In many situations, iOS will zoom into the select upon tap, this prevents that from
		// happening
		that.button.bind( "vmousedown", function() {
			if ( that.options.preventFocusZoom ) {
				$.mobile.zoom.disable( true );
			}
		} );
		that.label.bind( "click focus", function() {
			if ( that.options.preventFocusZoom ) {
				$.mobile.zoom.disable( true );
			}
		} );
		that.element.bind( "focus", function() {
			if ( that.options.preventFocusZoom ) {
				$.mobile.zoom.disable( true );
			}
		} );
		that.button.bind( "mouseup", function() {
			if ( that.options.preventFocusZoom ) {
				setTimeout( function() {
					$.mobile.zoom.enable( true );
				}, 0 );
			}
		} );
		that.element.bind( "blur", function() {
			if ( that.options.preventFocusZoom ) {
				$.mobile.zoom.enable( true );
			}
		} );
	},

	selected: function() {
		return this._selectOptions().filter( ":selected" );
	},

	selectedIndices: function() {
		var that = this;

		return this.selected().map( function() {
			return that._selectOptions().index( this );
		} ).get();
	},

	setButtonText: function() {
		var that = this,
			selected = this.selected(),
			text = this.placeholder,
			span = $( "<span>" );

		this.button.children( "span" )
			.not( ".ui-selectmenu-count-bubble,.ui-selectmenu-button-icon" )
			.remove().end().end()
			.append( ( function() {
				if ( selected.length ) {
					text = selected.map( function() {
						return $( this ).text();
					} ).get().join( ", " );
				}

				if ( text ) {
					span.text( text );
				} else {

					// Set the contents to &nbsp; which we write as &#160; to be XHTML compliant.
					// See gh-6699
					span.html( "&#160;" );
				}

				// Hide from assistive technologies, as otherwise this will create redundant text
				// announcement - see gh-8256
				span.attr( "aria-hidden", "true" );

				// TODO possibly aggregate multiple select option classes
				that._addClass( span, "ui-selectmenu-button-text",
					[ that.element.attr( "class" ), selected.attr( "class" ) ].join( " " ) );
				that._removeClass( span, null, "ui-screen-hidden" );
				return span;
			} )() );
	},

	setButtonCount: function() {
		var selected = this.selected();

		// Multiple count inside button
		if ( this.isMultiple ) {
			this.buttonCount[ selected.length > 1 ? "show" : "hide" ]().text( selected.length );
		}
	},

	_handleKeydown: function( /* event */ ) {
		this._delay( "_refreshButton" );
	},

	_refreshButton: function() {
		this.setButtonText();
		this.setButtonCount();
	},

	refresh: function() {
		this._refreshButton();
	},

	// Functions open and close preserved in native selects to simplify users code when looping
	// over selects
	open: $.noop,
	close: $.noop,

	disable: function() {
		this._setDisabled( true );
		this.button.addClass( "ui-state-disabled" );
	},

	enable: function() {
		this._setDisabled( false );
		this.button.removeClass( "ui-state-disabled" );
	}
}, $.ui.formResetMixin ] );

return $.widget( "mobile.selectmenu", selectmenu, $.mobile.widget.theme );

} );

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/safe-active-element',[ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.safeActiveElement = function( document ) {
	var activeElement;

	// Support: IE 9 only
	// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
	try {
		activeElement = document.activeElement;
	} catch ( error ) {
		activeElement = document.body;
	}

	// Support: IE 9 - 11 only
	// IE may return null instead of an element
	// Interestingly, this only seems to occur when NOT in an iframe
	if ( !activeElement ) {
		activeElement = document.body;
	}

	// Support: IE 11 only
	// IE11 returns a seemingly empty object in some cases when accessing
	// document.activeElement from an <iframe>
	if ( !activeElement.nodeName ) {
		activeElement = document.body;
	}

	return activeElement;
};

} ) );

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'jquery-ui/safe-blur',[ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.safeBlur = function( element ) {

	// Support: IE9 - 10 only
	// If the <body> is blurred, IE will switch windows, see #9420
	if ( element && element.nodeName.toLowerCase() !== "body" ) {
		$( element ).trigger( "blur" );
	}
};

} ) );

/*!
 * jQuery Mobile Enhancer @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Enhancer
//>>group: Widgets
//>>description: Enhables declarative initalization of widgets
//>>docs: http://api.jquerymobile.com/enhancer/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/enhancer',[
			"jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var widgetBaseClass,
	installed = false;

$.fn.extend( {
	enhance: function() {
		return $.enhance.enhance( this );
	},
	enhanceWithin: function() {
		this.children().enhance();
		return this;
	},
	enhanceOptions: function() {
		return $.enhance.getOptions( this );
	},
	enhanceRoles: function() {
		return $.enhance.getRoles( this );
	}
} );
$.enhance = $.enhance || {};
$.extend( $.enhance, {

	enhance: function( elem ) {
		var i,
			enhanceables = elem.find( "[" + $.enhance.defaultProp() + "]" ).addBack();

		if ( $.enhance._filter ) {
			enhanceables = $.enhance._filter( enhanceables );
		}

		// Loop over and execute any hooks that exist
		for ( i = 0; i < $.enhance.hooks.length; i++ ) {
			$.enhance.hooks[ i ].call( elem, enhanceables );
		}

		// Call the default enhancer function
		$.enhance.defaultFunction.call( elem, enhanceables );

		return elem;
	},

	// Check if the enhancer has already been defined if it has copy its hooks if not
	// define an empty array
	hooks: $.enhance.hooks || [],

	_filter: $.enhance._filter || false,

	defaultProp: $.enhance.defaultProp || function() { return "data-ui-role"; },

	defaultFunction: function( enhanceables ) {
		enhanceables.each( function() {
			var i,
				roles = $( this ).enhanceRoles();

			for ( i = 0; i < roles.length; i++ ) {
				if ( $.fn[ roles[ i ] ] ) {
					$( this )[ roles[ i ] ]();
				}
			}
		} );
	},

	cache: true,

	roleCache: {},

	getRoles: function( element ) {
		if ( !element.length ) {
			return [];
		}

		var role,

			// Look for cached roles
			roles = $.enhance.roleCache[ !!element[ 0 ].id ? element[ 0 ].id : undefined ];

		// We already have done this return the roles
		if ( roles ) {
			return roles;
		}

		// This is our first time get the attribute and parse it
		role = element.attr( $.enhance.defaultProp() );
		roles = role ? role.match( /\S+/g ) : [];

		// Caches the array of roles for next time
		$.enhance.roleCache[ element[ 0 ].id ] = roles;

		// Return the roles
		return roles;
	},

	optionCache: {},

	getOptions: function( element ) {
		var options = $.enhance.optionCache[ !!element[ 0 ].id ? element[ 0 ].id : undefined ],
			ns;

		// Been there done that return what we already found
		if ( !!options ) {
			return options;
		}

		// This is the first time lets compile the options object
		options = {};
		ns = ( $.mobile.ns || "ui-" ).replace( "-", "" );

		$.each( $( element ).data(), function( option, value ) {
			option = option.replace( ns, "" );

			option = option.charAt( 0 ).toLowerCase() + option.slice( 1 );
			options[ option ] = value;
		} );

		// Cache the options for next time
		$.enhance.optionCache[ element[ 0 ].id ] = options;

		// Return the options
		return options;
	},

	_installWidget: function() {
		if ( $.Widget && !installed ) {
			$.extend( $.Widget.prototype, {
				_getCreateOptions: function( options ) {
					var option, value,
						dataOptions = this.element.enhanceOptions();

					options = options || {};

					// Translate data-attributes to options
					for ( option in this.options ) {
						value = dataOptions[ option ];
						if ( value !== undefined ) {
							options[ option ] = value;
						}
					}
					return options;
				}
			} );
			installed = true;
		}
	}
} );

if ( !$.Widget ) {
	Object.defineProperty( $, "Widget", {
		configurable: true,
		enumerable: true,
		get: function() {
			return widgetBaseClass;
		},
		set: function( newValue ) {
			if ( newValue ) {
				widgetBaseClass = newValue;
				setTimeout( function() {
					$.enhance._installWidget();
				} );
			}
		}
	} );
} else {
	$.enhance._installWidget();
}

return $.enhance;
} );

/*!
 * jQuery Mobile Enhancer @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Enhancer Widget Crawler
//>>group: Widgets
//>>description: Adds support for custom initSlectors on widget prototypes
//>>docs: http://api.jquerymobile.com/enhancer/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/enhancer.widgetCrawler',[
			"jquery",
			"../core",
			"widgets/enhancer" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var widgetCrawler = function( elements, _childConstructors ) {
		$.each( _childConstructors, function( index, constructor ) {
			var prototype = constructor.prototype,
				plugin = $.enhance,
				selector = plugin.initGenerator( prototype ),
				found;

			if( !selector ) {
				return;
			}

			found = elements.find( selector );

			if ( plugin._filter ) {
				found = plugin._filter( found );
			}

			found[ prototype.widgetName ]();
			if ( constructor._childConstructors && constructor._childConstructors.length > 0 ) {
				widgetCrawler( elements, constructor._childConstructors );
			}
		} );
	},
	widgetHook = function() {
		if ( !$.enhance.initGenerator || !$.Widget ) {
			return;
		}

		// Enhance widgets with custom initSelectors
		widgetCrawler( this.addBack(), $.Widget._childConstructors );
	};

$.enhance.hooks.push( widgetHook );

return $.enhance;

} );

/*!
 * jQuery Mobile Enhancer Backcompat@VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Enhancer
//>>group: Widgets
//>>description: Enables declarative initalization of widgets
//>>docs: http://api.jquerymobile.com/enhancer/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/enhancer.backcompat',[
			"jquery",
			"widgets/enhancer",
			"widgets/enhancer.widgetCrawler" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {
if ( $.mobileBackcompat !== false ) {
	var filter = function( elements ) {
			elements = elements.not( $.mobile.keepNative );

			if ( $.mobile.ignoreContentEnabled ) {
				elements.each( function() {
					if ( $( this )
							.closest( "[data-" + $.mobile.ns + "enhance='false']" ).length ) {
						elements = elements.not( this );
					}
				} );
			}
			return elements;
		},
		generator = function( prototype ) {
			return prototype.initSelector ||
				$[ prototype.namespace ][ prototype.widgetName ].prototype.initSelector || false;
		};

	$.enhance._filter = filter;
	$.enhance.defaultProp = function() {
		return "data-" + $.mobile.ns + "role";
	};
	$.enhance.initGenerator = generator;

}

return $.enhance;

} );

/*!
 * jQuery Mobile Page @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Page Creation
//>>group: Core
//>>description: Basic page definition and formatting.
//>>docs: http://api.jquerymobile.com/page/
//>>demos: http://demos.jquerymobile.com/@VERSION/pages/
//>>css.structure: ../css/structure/jquery.mobile.core.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/page',[
			"jquery",
			"../widget",
			"./widget.theme",
			"../core",
			"widgets/enhancer",
			"widgets/enhancer.backcompat",
			"widgets/enhancer.widgetCrawler" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

$.widget( "mobile.page", {
	version: "@VERSION",

	options: {
		theme: "a",
		domCache: false,

		enhanceWithin: true,
		enhanced: false
	},

	_create: function() {

		// If false is returned by the callbacks do not create the page
		if ( this._trigger( "beforecreate" ) === false ) {
			return false;
		}

		this._establishStructure();
		this._setAttributes();
		this._attachToDOM();
		this._addHandlers();

		if ( this.options.enhanceWithin ) {
			this.element.enhanceWithin();
		}
	},

	_establishStructure: $.noop,

	_setAttributes: function() {
		if ( this.options.role ) {
			this.element.attr( "data-" + $.mobile.ns + "role", this.options.role );
		}
		this.element.attr( "tabindex", "0" );
		this._addClass( "ui-page" );
	},

	_attachToDOM: $.noop,

	_addHandlers: function() {
		this._on( this.element, {
			pagebeforehide: "_handlePageBeforeHide",
			pagebeforeshow: "_handlePageBeforeShow"
		} );
	},

	bindRemove: function( callback ) {
		var page = this.element;

		// When dom caching is not enabled or the page is embedded bind to remove the page on hide
		if ( !page.data( "mobile-page" ).options.domCache &&
				page.is( ":jqmData(external-page='true')" ) ) {

			this._on( this.document, {
				pagecontainerhide: callback || function( e, data ) {

					if ( data.prevPage[ 0 ] !== this.element[ 0 ] ) {
						return;
					}

					// Check if this is a same page transition and if so don't remove the page
					if ( !data.samePage ) {
						var prEvent = new $.Event( "pageremove" );

						this._trigger( "remove", prEvent );

						if ( !prEvent.isDefaultPrevented() ) {
							this.element.removeWithDependents();
						}
					}
				}
			} );
		}
	},

	_themeElements: function() {
		return [ {
			element: this.element,
			prefix: "ui-page-theme-"
		} ];
	},

	_handlePageBeforeShow: function( /* e */ ) {
		this._setContainerSwatch( this.options.theme );
	},

	_handlePageBeforeHide: function() {
		this._setContainerSwatch( "none" );
	},

	_setContainerSwatch: function( swatch ) {
		var pagecontainer = this.element.parent().pagecontainer( "instance" );

		if ( pagecontainer ) {
			pagecontainer.option( "theme", swatch );
		}
	}
} );

$.widget( "mobile.page", $.mobile.page, $.mobile.widget.theme );

return $.mobile.page;

} );

/*!
 * jQuery Mobile Page Container @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Content Management
//>>group: Navigation
//>>description: Widget to create page container which manages pages and transitions
//>>docs: http://api.jquerymobile.com/pagecontainer/
//>>demos: http://demos.jquerymobile.com/@VERSION/navigation/
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( 'widgets/pagecontainer',[
			"jquery",
			"../core",
			"jquery-ui/safe-active-element",
			"jquery-ui/safe-blur",
			"jquery-ui/widget",
			"../navigation/path",
			"../navigation/base",
			"../events/navigate",
			"../navigation/history",
			"../navigation/navigator",
			"../navigation/method",
			"../events/scroll",
			"../support",
			"../widgets/page" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

// These variables make all page containers use the same queue and only navigate one at a time
// queue to hold simultanious page transitions
var pageTransitionQueue = [],

	// Indicates whether or not page is in process of transitioning
	isPageTransitioning = false;

$.widget( "mobile.pagecontainer", {
	version: "@VERSION",

	options: {
		theme: "a",
		changeOptions: {
			transition: undefined,
			reverse: false,
			changeUrl: true,

			// Use changeUrl instead, changeHash is deprecated and will be removed in 1.6
			changeHash: true,
			fromHashChange: false,
			duplicateCachedPage: undefined,

			//loading message shows by default when pages are being fetched during change()
			showLoadMsg: true,
			dataUrl: undefined,
			fromPage: undefined,
			allowSamePageTransition: false
		}
	},

	initSelector: false,

	_create: function() {
		var currentOptions = this.options;

		currentOptions.changeUrl = currentOptions.changeUrl ? currentOptions.changeUrl :
		( currentOptions.changeHash ? true : false );

		// Maintain a global array of pagecontainers
		$.mobile.pagecontainers = ( $.mobile.pagecontainers ? $.mobile.pagecontainers : [] )
			.concat( [ this ] );

		// In the future this will be tracked to give easy access to the active pagecontainer
		// For now we just set it since multiple containers are not supported.
		$.mobile.pagecontainers.active = this;

		this._trigger( "beforecreate" );
		this.setLastScrollEnabled = true;

		this._on( this.window, {

			// Disable a scroll setting when a hashchange has been fired, this only works because
			// the recording of the scroll position is delayed for 100ms after the browser might
			// have changed the position because of the hashchange
			navigate: "_disableRecordScroll",

			// Bind to scrollstop for the first page, "pagechange" won't be fired in that case
			scrollstop: "_delayedRecordScroll"
		} );

		// TODO consider moving the navigation handler OUT of widget into
		//      some other object as glue between the navigate event and the
		//      content widget load and change methods
		this._on( this.window, { navigate: "_filterNavigateEvents" } );

		// TODO move from page* events to content* events
		this._on( { pagechange: "_afterContentChange" } );

		this._addClass( "ui-pagecontainer", "ui-mobile-viewport" );

		// Handle initial hashchange from chrome :(
		this.window.one( "navigate", $.proxy( function() {
			this.setLastScrollEnabled = true;
		}, this ) );
	},

	_setOptions: function( options ) {
		if ( options.theme !== undefined && options.theme !== "none" ) {
			this._removeClass( null, "ui-overlay-" + this.options.theme )
				._addClass( null, "ui-overlay-" + options.theme );
		} else if ( options.theme !== undefined ) {
			this._removeClass( null, "ui-overlay-" + this.options.theme );
		}

		this._super( options );
	},

	_disableRecordScroll: function() {
		this.setLastScrollEnabled = false;
	},

	_enableRecordScroll: function() {
		this.setLastScrollEnabled = true;
	},

	// TODO consider the name here, since it's purpose specific
	_afterContentChange: function() {

		// Once the page has changed, re-enable the scroll recording
		this.setLastScrollEnabled = true;

		// Remove any binding that previously existed on the get scroll which may or may not be
		// different than the scroll element determined for this page previously
		this._off( this.window, "scrollstop" );

		// Determine and bind to the current scoll element which may be the window or in the case
		// of touch overflow the element touch overflow
		this._on( this.window, { scrollstop: "_delayedRecordScroll" } );
	},

	_recordScroll: function() {

		// This barrier prevents setting the scroll value based on the browser scrolling the window
		// based on a hashchange
		if ( !this.setLastScrollEnabled ) {
			return;
		}

		var active = this._getActiveHistory(),
			currentScroll, defaultScroll;

		if ( active ) {
			currentScroll = this._getScroll();
			defaultScroll = this._getDefaultScroll();

			// Set active page's lastScroll prop. If the location we're scrolling to is less than
			// minScrollBack, let it go.
			active.lastScroll = currentScroll < defaultScroll ? defaultScroll : currentScroll;
		}
	},

	_delayedRecordScroll: function() {
		setTimeout( $.proxy( this, "_recordScroll" ), 100 );
	},

	_getScroll: function() {
		return this.window.scrollTop();
	},

	_getDefaultScroll: function() {
		return $.mobile.defaultHomeScroll;
	},

	_filterNavigateEvents: function( e, data ) {
		var url;

		if ( e.originalEvent && e.originalEvent.isDefaultPrevented() ) {
			return;
		}

		url = e.originalEvent.type.indexOf( "hashchange" ) > -1 ? data.state.hash : data.state.url;

		if ( !url ) {
			url = this._getHash();
		}

		if ( !url || url === "#" || url.indexOf( "#" + $.mobile.path.uiStateKey ) === 0 ) {
			url = location.href;
		}

		this._handleNavigate( url, data.state );
	},

	_getHash: function() {
		return $.mobile.path.parseLocation().hash;
	},

	// TODO active page should be managed by the container (ie, it should be a property)
	getActivePage: function() {
		return this.activePage;
	},

	// TODO the first page should be a property set during _create using the logic
	//      that currently resides in init
	_getInitialContent: function() {
		return $.mobile.firstPage;
	},

	// TODO each content container should have a history object
	_getHistory: function() {
		return $.mobile.navigate.history;
	},

	_getActiveHistory: function() {
		return this._getHistory().getActive();
	},

	// TODO the document base should be determined at creation
	_getDocumentBase: function() {
		return $.mobile.path.documentBase;
	},

	back: function() {
		this.go( -1 );
	},

	forward: function() {
		this.go( 1 );
	},

	go: function( steps ) {

		// If hashlistening is enabled use native history method
		if ( $.mobile.hashListeningEnabled ) {
			window.history.go( steps );
		} else {

			// We are not listening to the hash so handle history internally
			var activeIndex = $.mobile.navigate.history.activeIndex,
				index = activeIndex + parseInt( steps, 10 ),
				url = $.mobile.navigate.history.stack[ index ].url,
				direction = ( steps >= 1 ) ? "forward" : "back";

			// Update the history object
			$.mobile.navigate.history.activeIndex = index;
			$.mobile.navigate.history.previousIndex = activeIndex;

			// Change to the new page
			this.change( url, { direction: direction, changeUrl: false, fromHashChange: true } );
		}
	},

	// TODO rename _handleDestination
	_handleDestination: function( to ) {
		var history;

		// Clean the hash for comparison if it's a url
		if ( $.type( to ) === "string" ) {
			to = $.mobile.path.stripHash( to );
		}

		if ( to ) {
			history = this._getHistory();

			// At this point, 'to' can be one of 3 things, a cached page
			// element from a history stack entry, an id, or site-relative /
			// absolute URL. If 'to' is an id, we need to resolve it against
			// the documentBase, not the location.href, since the hashchange
			// could've been the result of a forward/backward navigation
			// that crosses from an external page/dialog to an internal
			// page/dialog.
			//
			// TODO move check to history object or path object?
			to = !$.mobile.path.isPath( to ) ? ( $.mobile.path.makeUrlAbsolute( "#" + to, this._getDocumentBase() ) ) : to;
		}
		return to || this._getInitialContent();
	},

	// The options by which a given page was reached are stored in the history entry for that
	// page. When this function is called, history is already at the new entry. So, when moving
	// back, this means we need to consult the old entry and reverse the meaning of the
	// options. Otherwise, if we're moving forward, we need to consult the options for the
	// current entry.
	_optionFromHistory: function( direction, optionName, fallbackValue ) {
		var history = this._getHistory(),
			entry = ( direction === "back" ? history.getLast() : history.getActive() );

		return ( ( entry && entry[ optionName ] ) || fallbackValue );
	},

	_handleDialog: function( changePageOptions, data ) {
		var to, active,
			activeContent = this.getActivePage();

		// If current active page is not a dialog skip the dialog and continue
		// in the same direction
		// Note: The dialog widget is deprecated as of 1.4.0 and will be removed in 1.5.0.
		// Thus, as of 1.5.0 activeContent.data( "mobile-dialog" ) will always evaluate to
		// falsy, so the second condition in the if-statement below can be removed altogether.
		if ( activeContent && !activeContent.data( "mobile-dialog" ) ) {
			// determine if we're heading forward or backward and continue
			// accordingly past the current dialog
			if ( data.direction === "back" ) {
				this.back();
			} else {
				this.forward();
			}

			// Prevent change() call
			return false;
		} else {

			// If the current active page is a dialog and we're navigating
			// to a dialog use the dialog objected saved in the stack
			to = data.pageUrl;
			active = this._getActiveHistory();

			// Make sure to set the role, transition and reversal
			// as most of this is lost by the domCache cleaning
			$.extend( changePage