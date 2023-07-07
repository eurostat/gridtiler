(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["gtil"] = factory();
	else
		root["gtil"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   tiling: () => (/* binding */ tiling)
/* harmony export */ });


//see
//https://www.npmjs.com/package/commander

//examples:
//https://github.com/nodejs/examples/tree/main/cli/commander/fake-names-generator
//https://github.com/topojson/topojson-server/tree/master


//export {default as tiling} from "./tiling.js";

const tiling = function(input, output, info) {
    console.log("hello world !!!")
    console.log(input)
}


/*
const fs = require('fs')
const csv = require('fast-csv');

exports.doTiling = (input, output, info) => {

    const data = []

    fs.createReadStream(input)
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => {
            data.push(row)
        })
        .on('end', () => {
            console.log(data)
        });

}
*/






/*
install, uninstall locally
https://github.com/nodejs/examples/blob/main/cli/commander/fake-names-generator/README.md#as-a-local-project

sudo npm i -g
# this will install the current working directory as a global module.

gridtiler
# run the CLI
sudo npm uninstall -g
*/


//read: https://docs.npmjs.com/packages-and-modules


/*
export const hwfun = () => {
    console.log("hello world !")
}
*/

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHRpbGVyLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOztVQ1ZBO1VBQ0E7Ozs7O1dDREE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7O0FDSkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBLFVBQVUsbUJBQW1COztBQUV0QjtBQUNQO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsMEJBQTBCLGVBQWU7QUFDekM7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7Ozs7Ozs7QUFPQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndGlsL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9ndGlsL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2d0aWwvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2d0aWwvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9ndGlsL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ3RpbC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJndGlsXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImd0aWxcIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCAoKSA9PiB7XG5yZXR1cm4gIiwiLy8gVGhlIHJlcXVpcmUgc2NvcGVcbnZhciBfX3dlYnBhY2tfcmVxdWlyZV9fID0ge307XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJcblxuLy9zZWVcbi8vaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvY29tbWFuZGVyXG5cbi8vZXhhbXBsZXM6XG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvZXhhbXBsZXMvdHJlZS9tYWluL2NsaS9jb21tYW5kZXIvZmFrZS1uYW1lcy1nZW5lcmF0b3Jcbi8vaHR0cHM6Ly9naXRodWIuY29tL3RvcG9qc29uL3RvcG9qc29uLXNlcnZlci90cmVlL21hc3RlclxuXG5cbi8vZXhwb3J0IHtkZWZhdWx0IGFzIHRpbGluZ30gZnJvbSBcIi4vdGlsaW5nLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aWxpbmcgPSBmdW5jdGlvbihpbnB1dCwgb3V0cHV0LCBpbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJoZWxsbyB3b3JsZCAhISFcIilcbiAgICBjb25zb2xlLmxvZyhpbnB1dClcbn1cblxuXG4vKlxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5jb25zdCBjc3YgPSByZXF1aXJlKCdmYXN0LWNzdicpO1xuXG5leHBvcnRzLmRvVGlsaW5nID0gKGlucHV0LCBvdXRwdXQsIGluZm8pID0+IHtcblxuICAgIGNvbnN0IGRhdGEgPSBbXVxuXG4gICAgZnMuY3JlYXRlUmVhZFN0cmVhbShpbnB1dClcbiAgICAgICAgLnBpcGUoY3N2LnBhcnNlKHsgaGVhZGVyczogdHJ1ZSB9KSlcbiAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKVxuICAgICAgICAub24oJ2RhdGEnLCByb3cgPT4ge1xuICAgICAgICAgICAgZGF0YS5wdXNoKHJvdylcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKVxuICAgICAgICB9KTtcblxufVxuKi9cblxuXG5cblxuXG5cbi8qXG5pbnN0YWxsLCB1bmluc3RhbGwgbG9jYWxseVxuaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9leGFtcGxlcy9ibG9iL21haW4vY2xpL2NvbW1hbmRlci9mYWtlLW5hbWVzLWdlbmVyYXRvci9SRUFETUUubWQjYXMtYS1sb2NhbC1wcm9qZWN0XG5cbnN1ZG8gbnBtIGkgLWdcbiMgdGhpcyB3aWxsIGluc3RhbGwgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgYXMgYSBnbG9iYWwgbW9kdWxlLlxuXG5ncmlkdGlsZXJcbiMgcnVuIHRoZSBDTElcbnN1ZG8gbnBtIHVuaW5zdGFsbCAtZ1xuKi9cblxuXG4vL3JlYWQ6IGh0dHBzOi8vZG9jcy5ucG1qcy5jb20vcGFja2FnZXMtYW5kLW1vZHVsZXNcblxuXG4vKlxuZXhwb3J0IGNvbnN0IGh3ZnVuID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiaGVsbG8gd29ybGQgIVwiKVxufVxuKi9cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==