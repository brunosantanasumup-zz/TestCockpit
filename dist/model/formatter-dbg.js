sap.ui.define([], function() {
	"use strict";
	return {
		testResult: function(testeResult) {

			switch (testeResult) {
				case "S":
					return "Aprovado";
				case "F":
					return "Reprovado";
				case "A":
					return "Amostragem";
				default:
					return testeResult;
			}
		}

	};
});