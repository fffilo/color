;(function(window, document) {

    // strict mode
    "use strict";

    /**
     * Initialize Color
     *
     * @param  {String} color (optional)
     * @return {Void}
     */
    var Color = function(color) {
        if (!(this instanceof Color))
            throw "Color: Color is a constructor.";

        this._init.apply(this, arguments);
    }

    /**
     * Color prototype
     *
     * @type {Object}
     */
    Color.prototype = {

        /**
         * Constructor
         *
         * @return {Void}
         */
        _init: function() {
            this._emitter = {};

            this._h = 0;
            this._s = 0;
            this._v = 0;
            this._a = 1;

            if (arguments.length)
                this.fromString(arguments[0]);
        },

        /**
         * Set current color from HSV
         *
         * Note: all arguments must be in in 0..1 range.
         *
         * @param  {Number} h hue
         * @param  {Number} s saturation
         * @param  {Number} v value
         * @param  {Number} a alpha (optional)
         * @return {Object}
         */
        fromHsv: function(h, s, v, a) {
            var data = JSON.stringify(this.toHsv());

            if (typeof a === "undefined")
                a = 1;

            this._h = Math.max(Math.min(h*1, 1), 0) || 0;
            this._s = Math.max(Math.min(s*1, 1), 0) || 0;
            this._v = Math.max(Math.min(v*1, 1), 0) || 0;
            this._a = Math.max(Math.min(a*1, 1), 0) || 0;

            if (data !== JSON.stringify(this.toHsv()))
                this.trigger("change");

            return this;
        },

        /**
         * Set current color from HSL
         * source: https://ariya.io/2008/07/converting-between-hsl-and-hsv
         *
         * Note: all arguments must be in in 0..1 range.
         *
         * @param  {Number} h hue
         * @param  {Number} s saturation
         * @param  {Number} l lightness
         * @param  {Number} a alpha (optional)
         * @return {Object}
         */
        fromHsl: function(h, s, l, a) {
            var data = JSON.stringify(this.toHsv());

            if (typeof a === "undefined")
                a = 1;

            h = Math.max(Math.min(h*1, 1), 0) || 0;
            s = Math.max(Math.min(s*1, 1), 0) || 0;
            l = Math.max(Math.min(l*1, 1), 0) || 0;
            a = Math.max(Math.min(a*1, 1), 0) || 0;

            l *= 2;
            s *= l <= 1 ? l : 2 - l;

            this._h = h;
            this._s = ((2 * s) / (l + s)) || 0;
            this._v = (l + s) / 2;
            this._a = a;

            if (data !== JSON.stringify(this.toHsv()))
                this.trigger("change");

            return this;
        },

        /**
         * Set current color from RGB
         * source: https://github.com/bgrins/TinyColor/blob/master/tinycolor.js
         *
         * Note: all arguments must be in in 0..1 range.
         *
         * @param  {Number} r red
         * @param  {Number} g green
         * @param  {Number} b blue
         * @param  {Number} a alpha (optional)
         * @return {Object}
         */
        fromRgb: function(r, g, b, a) {
            var data = JSON.stringify(this.toHsv());

            if (typeof a === "undefined")
                a = 1;

            r = Math.max(Math.min(r*1, 1), 0) || 0;
            g = Math.max(Math.min(g*1, 1), 0) || 0;
            b = Math.max(Math.min(b*1, 1), 0) || 0;
            a = Math.max(Math.min(a*1, 1), 0) || 0;

            var max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                delta = max - min;

            this._s = max === 0 ? 0 : delta / max;
            this._v = max;
            this._a = a;

            if (max === min)
                this._h = 0;
            else if (max === r)
                this._h = (g - b) / delta + (g < b ? 6 : 0);
            else if (max === g)
                this._h = (b - r) / delta + 2;
            else if (max === b)
                this._h = (r - g) / delta + 4;
            if (max !== min)
                this._h /= 6;

            if (data !== JSON.stringify(this.toHsv()))
                this.trigger("change");

            return this;
        },

        /**
         * Set current color from hex
         *
         * valid colors format:
         *     #rgb
         *     #rgba
         *     #rrggbb
         *     #rrggbbaa
         *
         * @param  {String} color
         * @return {Object}
         */
        fromHex: function(color) {
            color = color.replace(/\s+/g, "");

            var match = color.match(/([0-9abcdef]+)/i);
            var hex = match ? match[1] : null;

            if (!hex)
                return this.fromHex("000");
            else if (hex.length === 3)
                return this.fromHex(hex + "f");
            else if (hex.length === 4)
                return this.fromHex(hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]  + hex[3] + hex[3]);
            else if (hex.length === 6)
                return this.fromHex(hex + "ff");
            else if (hex.length === 8) {
                var r = parseInt(hex.substr(0,2), 16);
                var g = parseInt(hex.substr(2,2), 16);
                var b = parseInt(hex.substr(4,2), 16);
                var a = parseInt(hex.substr(6,2), 16);

                return this.fromRgb(r/255, g/255, b/255, a/255);
            }

            return this.fromHex("000");
        },

        /**
         * Set current color from string
         *
         * @param  {String} color
         * @return {Object}
         */
        fromString: function(color) {
            if (!color)
                return;

            color = color.replace(/\s+/g, "");

            // hex format
            if (color.substr(0, 1) === "#")
                return this.fromHex(color);

            // hsv format
            var match = color.match(/hsva?\((\d+),(\d+)%,(\d+)%,?([\d\.]+)?\)/);
            if (match)
                return this.fromHsv(match[1]/360, match[2]/100, match[3]/100, (match[4] || 1)*1 || 1);

            // hsl format
            match = color.match(/hsla?\((\d+),(\d+)%,(\d+)%,?([\d\.]+)?\)/);
            if (match)
                return this.fromHsl(match[1]/360, match[2]/100, match[3]/100, (match[4] || 1)*1 || 1);

            // fallback
            var w = window,
                d = document,
                e = d.createElement("div");
            e.style.display = "none";
            e.style.color = this.toString("rgb");
            e.style.color = color;
            d.body.appendChild(e);
            color = w.getComputedStyle(e, null).getPropertyValue("color");
            color = color.replace(/\s+/g, "");
            d.body.removeChild(e);

            // computed style is in rgb(a) format
            match = color.match(/rgba?\((\d+),(\d+),(\d+),?([\d\.]+)?\)/);
            if (match)
                return this.fromRgb(match[1]/255, match[2]/255, match[3]/255, (typeof match[4] !== "undefined" ? match[4] : 1)*1);

            throw "Color: can't parse color from string";
        },

        /**
         * Convert color to string. Valid formats
         * are hex|hexa|rgb|rgba|hsl|hsla.
         *
         * @param  {String} format (optional)
         * @return {String}
         */
        toString: function(format) {
            var value;
            if (format === "hex" || format === "hexa")
                value = this.toHex();
            else if (format === "rgb" || format === "rgba")
                value = this.toRgb();
            else if (format === "hsl" || format === "hsla")
                value = this.toHsl();
            else if (format === "hsv" || format === "hsva")
                value = this.toHsv();
            else {
                format = "hex";
                value = this.toHex();
            }
            if (typeof value === "object")
                value.a = Math.round(value.a*100) / 100;

            if (format === "hex")
                return value.substr(7, 2) === "ff" ? value.substr(0, 7) : value;
            else if (format === "hexa")
                return value;
            else if (format === "rgb")
                return ""
                    + "rgb"
                    + (value.a !== 1 ? "a" : "")
                    + "(" + Math.round(value.r * 255)
                    + ", " + Math.round(value.g * 255)
                    + ", " + Math.round(value.b * 255)
                    + (value.a !== 1 ? ", " + value.a : "")
                    + ")";
            else if (format === "rgba")
                return ""
                    + "rgba"
                    + "(" + Math.round(value.r * 255)
                    + ", " + Math.round(value.g * 255)
                    + ", " + Math.round(value.b * 255)
                    + ", " + value.a
                    + ")";
            else if (format === "hsl")
                return ""
                    + "hsl"
                    + (value.a !== 1 ? "a" : "")
                    + "(" + Math.round(value.h * 360)
                    + ", " + Math.round(value.s * 100) + "%"
                    + ", " + Math.round(value.l * 100) + "%"
                    + (value.a !== 1 ? ", " + value.a : "")
                    + ")";
            else if (format === "hsla")
                return ""
                    + "hsla"
                    + "(" + Math.round(value.h * 360)
                    + ", " + Math.round(value.s * 100) + "%"
                    + ", " + Math.round(value.l * 100) + "%"
                    + ", " + value.a
                    + ")";
            else if (format === "hsv")
                return ""
                    + "hsv"
                    + (value.a !== 1 ? "a" : "")
                    + "(" + Math.round(value.h * 360)
                    + ", " + Math.round(value.s * 100) + "%"
                    + ", " + Math.round(value.v * 100) + "%"
                    + (value.a !== 1 ? ", " + value.a : "")
                    + ")";
            else if (format === "hsva")
                return ""
                    + "hsva"
                    + "(" + Math.round(value.h * 360)
                    + ", " + Math.round(value.s * 100) + "%"
                    + ", " + Math.round(value.v * 100) + "%"
                    + ", " + value.a
                    + ")";
        },

        /**
         * Convert color to HSV object
         *
         * Note: each property is in 0..1 range.
         * For real values use:
         * { h: h*360, s: s*100, v: v*100 }
         *
         * @return {Object}
         */
        toHsv: function() {
            return {
                h: this._h,
                s: this._s,
                v: this._v,
                a: this._a
            }
        },

        /**
         * Convert color to HSL object
         * source: https://ariya.io/2008/07/converting-between-hsl-and-hsv
         *
         * Note: each property is in 0..1 range.
         * For real values use:
         * { h: h*360, s: s*100, l: l*100 }
         *
         * @return {Object}
         */
        toHsl: function() {
            var result = {};
            result.h = this._h;
            result.l = (2 - this._s) * this._v
            result.s = this._s * this._v;
            result.s /= result.l <= 1 ? result.l : 2 - result.l;
            result.s = result.s || 0;
            result.l /= 2;
            result.a = this._a;

            return result;
        },

        /**
         * Convert color to RGB object
         * source: https://github.com/bgrins/TinyColor/blob/master/tinycolor.js
         *
         * Note: each property is in 0..1 range.
         * For real values use:
         * { r: r*255, g: g*255, b: b*255 }
         *
         * @return {Object}
         */
        toRgb: function() {
            var h = this._h * 6,
                s = this._s,
                v = this._v,
                i = Math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                m = i % 6;

            return {
                r: [v, q, p, p, t, v][m],
                g: [t, v, v, q, p, p][m],
                b: [p, p, t, v, v, q][m],
                a: this._a
            };
        },

        /**
         * Convert color to HEX string
         *
         * @return {String}
         */
        toHex: function() {
            var value = this.toRgb();

            return "#"
                + ("0" + Math.round(value.r * 255).toString(16)).substr(-2)
                + ("0" + Math.round(value.g * 255).toString(16)).substr(-2)
                + ("0" + Math.round(value.b * 255).toString(16)).substr(-2)
                + ("0" + Math.round(value.a * 255).toString(16)).substr(-2);
        },

        /**
         * Bind event
         *
         * @param  {String}   eventName
         * @param  {Function} callback
         * @return {Object}
         */
        on: function(eventName, callback) {
            this._emitter[eventName] = this._emitter[eventName] || [];
            this._emitter[eventName].push(callback);

            return this;
        },

        /**
         * Unbind event
         *
         * @param  {String}   eventName
         * @param  {Function} callback  (optional)
         * @return {Object}
         */
        off: function(eventName, callback) {
            if (typeof callback === "undefined") {
                delete this._emitter[eventName];
                return this;
            }

            var index = -1;
            for (var i = 0; i < (this._emitter[eventName] || []).length; i++) {
                if (this._emitter[eventName][i] === callback)
                    index = i;
            }

            if (index !== -1)
                this._emitter[eventName].splice(index, 1);

            return this;
        },

        /**
         * Trigger event
         * (you can pass additional data
         * after event name)
         *
         * @param  {String} eventName
         * @return {Object}
         */
        trigger: function(eventName) {
            var args = [].slice.call(arguments, 1);

            (this._emitter[eventName] || []).forEach(function(callback) {
                callback.apply(this, args);
            }.bind(this));

            return this;
        },

    }

    // globalize
    window.Color = Color;

})(window, document);
