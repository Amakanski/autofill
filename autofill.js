/*
 * Autofiller
 * (c)2017 Anyflex, Ivo Wams
 * 
 * Provide an entity, add formatting types to your DOM, then call fill().
 * formatting to a null value hides the parameter pair box entirely.
 * 
 * Example -
 * DOM: <div/input/select/... bind="[variable name]" format="[format]"></div>
 * Jscript: obj.date_start = '2017-2-1 ...'; autofill.fill();
 * 
 * Uses moment.js for nice date outputs.
 */

var autofill =
	{

		format:
		{

			// When no formatting or unknown formatting defined
			"default": function (str) {
				if (str === null)
					return null;

				if (typeof str == 'number')
					return autofill.format.number(str);

				if (typeof str == 'string')
					return autofill.format.string(str);

				if (typeof str == 'object') {

					if (str.constructor.name == 'Date')
						return moment(str).format('LL');	// Special case

					if (str.toString)
						return autofill.format.string(str.toString());

				}

				return null;
			},

			// Primitives
			"boolean": function (val) {
				return get_string(val ? "YES" : "NO");
			},

			"integer": function (val) {

				var parse = parseInt(val);
				if (isNaN(parse)) {
					console.warn('Not a number: ', val);
					return null;
				}

				return parse;
			},

			"number": function (nr) {
				return nr;
			},

			"string": function (str) {
				return str;
			},
			
			/*

			"duration": function (time) {
				return nice.duration(parseInt(time));
			},

			"file_size": function (bytes) {
				return nice.file_size(bytes);
			},

			"bytes": function (bytes) {
				return nice.file_size(bytes);
			},
			
			*/

			"percentage": function (value, total) {
				return Math.round(100 * value / total) + '%';
			},

			"checkbox": function(value){
				return value == null ? false : value == true;
			},

			// Conversions

			// Objects
			"date": function (obj) {
				return (obj && obj.date) ? moment(obj.date).format('L') : null;
			},

			// CSS
			"backgroundImage": function(str) {
				return 'url('+ str +')';
			}
		},

		fill: function (init) {

			var hide_parent = (init && init.hide_parent) || false;				// If value turns out to be '' or null, hide the parent element
			var prefix = (init && String(init.prefix).toLowerCase()) || '';		// Ignore all source bindings with this prefix

			$('[bind]')
				.each(function (i, e) {
					try {
						var source = unescape(e.getAttribute('bind'));

						if(prefix != '' && source.toLowerCase().indexOf(prefix) != 0)
							return; // throw Error('Ignoring '+ source +' due to prefix');

						var bind = eval(source);

						if (bind === undefined)
							return console.warn('Unable to bind ' + e.getAttribute('bind'));

						var format = autofill.format[e.getAttribute('format')] || autofill.format.default;
						var value = format(bind);

						if(hide_parent)
							e.parentElement.style.display = value === null | bind === null ? 'none' : 'block';

						// Bind to alternate attributes (ie. style)
						var bind_to_attr = e.attributes['bindToAttr'];
						// Bind to properties (ie. "checked")
						var bind_to_prop = e.attributes['bindToProp'];

						if(bind_to_attr){
							if(e[bind_to_attr.value] == undefined)
								return console.warn('Unable to bindToAttr ' + bind_to_attr.value);

							e[bind_to_attr.value][e.attributes['format'].value] = value;
						}

						else if(bind_to_prop){

							if(e[bind_to_prop.value] == undefined){
								console.warn('Unable to bindToProp ' + bind_to_prop.value);
								return;
							}

							e[bind_to_prop.value] = value;
						}

						// Bind to interface elements
						else {

							if(['INPUT', 'SELECT'].indexOf(e.tagName) != -1){
								e.value = value;
							
							} else 
								// Change innerHTML prototype to fire change events ?
								e.innerHTML = value;
							
						}

					} catch(err){
						console.warn(err);
						if(e.parentElement && hide_parent)
							e.parentElement.style.display = 'none';
					}

				});

		}

	}

