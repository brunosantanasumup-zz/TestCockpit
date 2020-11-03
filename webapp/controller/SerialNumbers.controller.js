sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function(Controller, JSONModel, Filter, FilterOperator, MessageBox) {
	"use strict";

	return Controller.extend("zui5_mm_ct.controller.SerialNumbers", {
		formatDate: function(date) {

			var month = date.getMonth() + 1;
			var day = date.getDate();
			var year = date.getFullYear();
			return day + "/" + month + "/" + year;

		},
		errorReasonSelect: function(oEvent) {

			const prob = sap.ui.getCore().getModel("ErrorReason").getData().find(element => element.CtProblemReason === oEvent.mParameters.value);
			if (prob) {
				sap.ui.getCore().byId("errorReasonDescription").setText(prob.CtProblemDescription);
				sap.ui.getCore().byId("box").focus();
			} else {
				sap.ui.getCore().byId("errorReasonDescription").setText(" ");
				sap.ui.getCore().byId("errorReason").focus();
				MessageBox.error(this._getText("noproblem"), {
					icon: MessageBox.Action.ERROR,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});

			}
		},
		onSuggestionItemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			sap.ui.getCore().byId("errorReasonDescription").setText(oItem.getKey());
		},

		onPressTestadoTab: function(oEvent) {
			if (oEvent.mParameters.selectedKey === 'REPROVADO') {
				this.getView().byId("idReject").focus();
			} else if (oEvent.mParameters.selectedKey === 'Testado') {
				this.getView().byId("idTestado").focus();
			} else {
				this.getView().byId("idAmostra").focus();
			}
		},
		formatAvailableToObjectState: function(status) {
			if (status === 'F') {
				return "Error";
			} else {
				return "Success";
			}

		},

		_getText: function(text) {
			return this.getView().getModel("i18n").getResourceBundle().getText(text);
		},
		onAfterRendering: function(oEvent) {
			var oModelQuantity = sap.ui.getCore().getModel("Quantity");
			var oDataQuantity = sap.ui.getCore().getModel("Quantity").getData();
			this.getView().byId("pageSN").setBusy(false);
			oModelQuantity.setData(oDataQuantity);

			this.getView().setModel(oModelQuantity, "Quantity");
			this.getView().byId("pageSN").setBusy(false);
			this._countQuantitys();

			// var oDate = new sap.m.DateTimeInput();
			// oDate.setDateValue(new Date());
			// oDate.setDisplayFormat("dd-MM-yyyy");

			// var date = {
			// 	// Data: oDate.getValue()
			// 	Data: new Date()

			// };

			// var oDateModel = new JSONModel();
			// oDateModel.setData(date);

			// this.getview().setModel(oDateModel, "Data");
			this.getView().byId("idTestado").focus();
		},
		onPressMoviment: function() {

			if (this.getView().getModel("SNBiped")) {
				this.getView().byId("pageSN").setBusy(true);
				var that = this;
				MessageBox.confirm(this._getText("movstockquestion"), {
					icon: MessageBox.Action.SUCCESS,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function(sAction) {
						if (sAction === MessageBox.Action.YES) {

							that._moviment();
						} else {
							that.getView().byId("pageSN").setBusy(false);
						}
					}
				});
			} else {
				MessageBox.error(this._getText("nobiped"), {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});
			}
		},
		_moviment: function() {

			var that = this;

			$.ajax({
				url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersSet",
				contentType: "application/json",
				type: 'POST',
				beforeSend: function(jqXHR1, settings) {
					jqXHR1.setRequestHeader('X-CSRF-Token', sap.ui.getCore().getModel("Token").getData().Token);
				},
				data: JSON.stringify({
					Identifier: sap.ui.getCore().getModel("Quantity").getData().Identifier,
					TestResult: "X"
				}),
				success: function(data, token) {
					MessageBox.success(that._getText("movesent"), {
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function(sAction) {
							that.getView().byId("pageSN").setBusy(false);
							var oQuant = sap.ui.getCore().getModel("Quant").getData();
							oQuant.Quantity = "";
							sap.ui.getCore().getModel("Quant").setData(oQuant);

							// var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
							// oRouter.navTo("Quantity");
							that.getOwnerComponent().getRouter().navTo("Quantity", null, true);
							// that.getOwnerComponent().getRouter().navTo("Quantity");
							// sap.ui.getCore()./**/byId("homeBtn").onClick();
						}
					});
				},
				error: function(error, data, er) {

					MessageBox.error("Gateway", {
						actions: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: function(sAction) {}
					});
				}
			});

		},
		testResult: function(testeResult) {
			switch (testeResult) {
				case "S":

					return this._getText("aprovado");
				case "F":

					return this._getText("reprovado");
				case "A":

					return this._getText("amostragem");
				default:
					return testeResult;
			}
		},
		onPressDelete: function(oEvent) {
			var that = this;

			that.getView().byId("pageSN").setBusy(true);

			var oIndices = that.getView().byId("SerialNumbersBiped").getSelectedIndices();
			if (oIndices.length > 0) {

				MessageBox.confirm(that._getText("deletesn"), {
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function(sAction) {
						if (sAction === MessageBox.Action.YES) {

							// INICIO
							var oDataSNBiped = sap.ui.getCore().getModel("SNBiped").getData();

							for (var i = 0; i < oIndices.length; i++) {
								var url = "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersBufferSet('" + oDataSNBiped.SN[oIndices[i]].Sernr +
									"')";
								$.ajax({
									url: url,
									contentType: "application/json",
									type: 'POST',
									headers: {
										'x-http-method': 'DELETE'
									},
									beforeSend: function(jqXHR1, settings) {
										jqXHR1.setRequestHeader('X-CSRF-Token', sap.ui.getCore().getModel("Token").getData().Token);
									},
									success: function(data, token) {
										jQuery.ajax({
											type: "GET",
											contentType: "application/json",
											url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersBufferSet",
											dataType: "json",
											async: false,
											success: function(data, textStat, jqXHR) {
												that.getView().byId("pageSN").setBusy(false);
												var oNewModel = new JSONModel();
												if (data.d.results.length > 0) {

													var odata = {
														SN: data.d.results
													};
													oNewModel.setData(odata);
													sap.ui.getCore().setModel(oNewModel, "SNBiped");
													that.getView().setModel(oNewModel, "SNBiped");
													that._countQuantitys();

												} else {

													var odataEmpty = {
														SN: []
													};
													var oNewModelEmpty = new JSONModel();
													oNewModelEmpty.setData(odataEmpty);
													sap.ui.getCore().setModel(oNewModelEmpty, "SNBiped");
													that.getView().setModel(oNewModelEmpty, "SNBiped");
													that._countQuantitys();
												}

											}
										});
									},
									error: function(error, data, er) {

										that.getView().byId("pageSN").setBusy(false);

										MessageBox.error("Gateway", {
											icon: sap.m.MessageBox.Icon.ERROR,
											actions: [MessageBox.Action.OK],
											emphasizedAction: MessageBox.Action.OK,
											onClose: function(sAction) {}
										});
									}
								});
							}

							MessageBox.information(that._getText("deletedsn"), {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								actions: [MessageBox.Action.OK],
								emphasizedAction: MessageBox.Action.OK,
								onClose: function() {}
							});

						} else {
							that.getView().byId("pageSN").setBusy(false);
						}

					}
				});

				// fim
			} else {
				MessageBox.error(this._getText("noselected"), {
					onClose: function(sAction) {
						that.getView().byId("pageSN").setBusy(false);
					}
				});
			}

		},
		_totalBiped: function() {
			var oDataQuantitys = sap.ui.getCore().getModel("Quantity").getData();
			if (oDataQuantitys.QuantityAlreadyTested >= oDataQuantitys.QuantityInformed) {
				return 1;
			}
		},
		_countQuantitys: function() {
			var oModelQuantitys = new JSONModel();
			var oDataQuantitys = this.getView().getModel("Quantity").getData();

			if (this.getView().getModel("SNBiped")) {
				var oDataSNBiped = this.getView().getModel("SNBiped").getData();
				oDataQuantitys.QuantityAlreadyTested = oDataSNBiped.SN.length;
				oDataQuantitys.QuantityToBeTested = oDataQuantitys.QuantityInformed - oDataQuantitys.QuantityAlreadyTested;
				if (oDataQuantitys.QuantityToBeTested <= 0) {
					oDataQuantitys.QuantityToBeTested = 0;
				}

				oDataQuantitys.QuantityAproved = this._countEspecific(oDataSNBiped.SN, "S");
				oDataQuantitys.QuantityAmostra = this._countEspecific(oDataSNBiped.SN, "A");
				oDataQuantitys.QuantityReject = this._countEspecific(oDataSNBiped.SN, "F");
				if (oDataQuantitys.QuantityAlreadyTested > 0) {
					oDataQuantitys.Percentage = (oDataQuantitys.QuantityAlreadyTested / oDataQuantitys.QuantityInformed) * 100;
					oDataQuantitys.Percentage = Number(oDataQuantitys.Percentage.toFixed(0));
				} else {
					oDataQuantitys.Percentage = 0;
				}
			}
			oDataQuantitys.QuantityInformed = oDataQuantitys.QuantityInformed;
			oModelQuantitys.setData(oDataQuantitys);

			var aproved = oDataQuantitys.QuantityAproved ? Number(oDataQuantitys.QuantityAproved) : Number('0');
			var sample = oDataQuantitys.QuantityAmostra ? Number(oDataQuantitys.QuantityAmostra) : Number('0');
			var reject = oDataQuantitys.QuantityReject ? Number(oDataQuantitys.QuantityReject) : Number('0');

			var oData = {
				'Quantidades': [{
					"Tipo": this._getText("aprovado"),
					"Valor": aproved
				}, {
					"Tipo": this._getText("amostragem"),
					"Valor": sample
				}, {
					"Tipo": this._getText("reprovado"),
					"Valor": reject
				}]
			};

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData);

			var oVizFrame = this.getView().byId("idpiechart");
			oVizFrame.setModel(oModel);

			// this._fillChart(oDataQuantitys);
			this.getView().setModel(oModelQuantitys, "Quantity");
			sap.ui.getCore().setModel(oModelQuantitys, "Quantity");
		},
		_countEspecific: function(array, query) {
			var count = 0;
			for (var i = 0; i < array.length; i++) {
				if (array[i].Testresult == query) {
					count++;
				}
			}
			return count;

		},
		onInitMatched: function() {

			var oModelQuantity = sap.ui.getCore().getModel("Quantity");
			this.getView().setModel(oModelQuantity, "Quantity");
			var oModelSNBiped = new JSONModel();

			var that = this;
			jQuery.ajax({
				type: 'GET',
				contentType: "application/json",
				url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersBufferSet",
				dataType: "json",
				async: false,
				success: function(data, textStat, jqXHR) {

					if (data.d.results.length > 0) {
						var odata = {
							SN: data.d.results
						};
						oModelSNBiped.setData(odata);
						sap.ui.getCore().setModel(oModelSNBiped, "SNBiped");
						that.getView().setModel(oModelSNBiped, "SNBiped");
						that.getView().getModel("SNBiped").refresh(true);

					} else {
						var odataEmpty = {
							SN: []
						};
						var oNewModelEmpty = new JSONModel();
						oNewModelEmpty.setData(odataEmpty);
						sap.ui.getCore().setModel(oNewModelEmpty, "SNBiped");
						that.getView().setModel(oNewModelEmpty, "SNBiped");
					}
					that._countQuantitys();
				}
			});

			var oModelQuantidade = sap.ui.getCore().getModel("Quantity");
			var oDataQuantidade = oModelQuantidade.getData();

			var aproved = oDataQuantidade.QuantityAproved ? Number(oDataQuantidade.QuantityAproved) : Number('0');
			var sample = oDataQuantidade.QuantityAmostra ? Number(oDataQuantidade.QuantityAmostra) : Number('0');
			var reject = oDataQuantidade.QuantityReject ? Number(oDataQuantidade.QuantityReject) : Number('0');

			var oData = {
				'Quantidades': [{
					"Tipo": this._getText("aprovado"),
					"Valor": aproved
				}, {
					"Tipo": this._getText("amostragem"),
					"Valor": sample
				}, {
					"Tipo": this._getText("reprovado"),
					"Valor": reject
				}]
			};

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData);

			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Tipo',
					value: "{Tipo}"
				}],

				measures: [{
					name: 'Valor',
					value: '{Valor}'
				}],

				data: {
					path: "/Quantidades"
				}
			});
			var oVizFrame = this.getView().byId("idpiechart");
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);

			if (!oVizFrame.getVizProperties()) {

				oVizFrame.setVizProperties({
					title: {
						text: this._getText("division")
					},
					plotArea: {
						colorPalette: ['#2b7d2b', '#e78c07', '#bb0000'],
						drawingEffect: "glossy",
						dataLabel: {
							visible: "true"
						}
					}
				});

				var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "size",
						'type': "Measure",
						'values': ["Valor"]
					}),
					feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "color",
						'type': "Dimension",
						'values': ["Tipo"]
					});
				oVizFrame.addFeed(feedSize);
				oVizFrame.addFeed(feedColor);
			}

		},
		onInit: function() {
			this.getView().byId("idTestado").focus();
			this.getOwnerComponent().getRouter().getRoute("SerialNumbers").attachPatternMatched(this.onInitMatched, this);

		},
		errorSelected: function() {
			sap.ui.getCore().byId("box").focus();

		},
		onPressSubmitReject: function(oEvent) {

			if (this.getView().getModel("Posting").getData().SerialNumberReaderReject) {
				this.getView().byId("pageSN").setBusy(true);

				var errorReason;

				// if (sap.ui.getCore().byId("comboError")) {
				// 	if (sap.ui.getCore().byId("comboError").getSelectedKey()) {
				// errorReason = sap.ui.getCore().byId("comboError").getSelectedKey().slice(-2);
				if (sap.ui.getCore().byId("errorReason"))
					if (sap.ui.getCore().byId("errorReason").getValue()) {
						errorReason = sap.ui.getCore().byId("errorReason").getValue();
						sap.ui.getCore().byId("errorReason").setValue(null);
						sap.ui.getCore().byId("errorReasonDescription").setText(" ");
					}
					// sap.ui.getCore().byId("comboError").setSelectedKey(null);

					// 	}
					// }
				var bag = "";

				if (this.getView().getModel("Posting").getData().Bag) {
					bag = this.getView().getModel("Posting").getData().Bag;
				}

				var oDataPost = {
					Identifier: sap.ui.getCore().getModel("Quantity").getData().Identifier,
					Sernr: this.getView().getModel("Posting").getData().SerialNumberReaderReject,
					SernrSimcard: this.getView().getModel("Posting").getData().SerialNumberSimcard,
					CtProblemReason: errorReason,
					TestResult: "F",
					Caixa: bag
				};
				var oSernr = this.getView().getModel("Posting").getData().SerialNumberReaderReject;

				var that = this;
				$.ajax({
					url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersSet",
					contentType: "application/json",
					dataType: "json",
					type: 'POST',
					beforeSend: function(jqXHR1, settings) {
						jqXHR1.setRequestHeader('X-CSRF-Token', sap.ui.getCore().getModel("Token").getData().Token);
					},
					data: JSON.stringify(oDataPost),
					processData: false,
					success: function(data, token) {

						if (data.d.Error) {

							if (that._oDialog) {
								that._oDialog.close();
							}

							var url = "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/ErrorReasonSet?$filter=CtProblemReason eq '" + oSernr + "'";
							if (data.d.RequiredProblem) {
								jQuery.ajax({
									type: "GET",
									contentType: "application/json",
									url: url,
									dataType: "json",
									async: false,
									success: function(data, textStat, jqXHR) {

										that.getView().byId("pageSN").setBusy(false);

										var oNewModel = new JSONModel();
										if (data.d.results.length > 0) {
											var oNewModel = new JSONModel();

											// for (var i = 0; i < data.d.results.length, i++  ) {
											// 	data.d.results[i].CtProblemReason = data.d.results[i].CtProblemReason.slice(-2);
											// };

											for (var i = 0; i < data.d.results.length; i++) {
												data.d.results[i].CtProblemReason = data.d.results[i].CtProblemReason.slice(-2);
											}

											oNewModel.setData(data.d.results);

											sap.ui.getCore().setModel(oNewModel, "ErrorReason");
											that.getView().setModel(oNewModel, "ErrorReason");

											if (!that._oDialogError) {

												that._oDialogError = sap.ui.xmlfragment("zui5_mm_ct.view.ErrorReason", that);
												that.getView().addDependent(that._oDialogError);
											}
											var dlg = sap.ui.getCore().byId("dlg");
											that._oDialogError.setEscapeHandler(function() {});
											that._oDialogError.open();

										} else {
											MessageBox.error(that._getText("noproblem"), {
												icon: sap.m.MessageBox.Icon.ERROR,
												onClose: function(sAction) {}
											});
										}
									}
								});
							} else {
								if (data.d.RequiredSimcard) {

									that._oDialog = sap.ui.xmlfragment("zui5_mm_ct.view.SimcardReject", that);
									that.getView().addDependent(that._oDialog);

									that._oDialog.setEscapeHandler(function() {});
									that._oDialog.open();

								} else {

									that.getView().byId("pageSN").setBusy(false);
									MessageBox.information(data.d.Msg, {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										onClose: function(sAction) {
											var oModelPosting = that.getView().getModel("Posting");
											var oDataPosting = oModelPosting.getData();
											oDataPosting.SerialNumberReaderReject = "";
											oDataPosting.SerialNumberSimcard = "";

											that.getView().setModel(oModelPosting, "Posting");
											that.getView().getModel("Posting").refresh(true);
											sap.ui.getCore().byId("idReject").focus();

										}
									});
								}
							}

						} else {
							if (that._oDialog) {
								that._oDialog.close();
							}
							jQuery.ajax({
								type: "GET",
								contentType: "application/json",
								url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersBufferSet",
								dataType: "json",
								async: false,
								success: function(data, textStat, jqXHR) {
									that.getView().byId("pageSN").setBusy(false);
									var oNewModel = new JSONModel();
									if (data.d.results.length > 0) {

										var odata = {
											SN: data.d.results
										};
										oNewModel.setData(odata);
										sap.ui.getCore().setModel(oNewModel, "SNBiped");
										that.getView().setModel(oNewModel, "SNBiped");
										that._countQuantitys();

										var result = that._totalBiped();
										if (result) {
											MessageBox.confirm(that._getText("totalalready"), {
												icon: sap.m.MessageBox.Icon.SUCCESS,
												actions: [MessageBox.Action.YES, MessageBox.Action.NO],
												emphasizedAction: MessageBox.Action.YES,
												onClose: function(sAction) {
													if (sAction === MessageBox.Action.YES) {
														that._moviment();
													}
												}
											});
										}

									} else {
										var odataEmpty = {
											SN: []
										};
										var oNewModelEmpty = new JSONModel();
										oNewModelEmpty.setData(odataEmpty);
										sap.ui.getCore().setModel(oNewModelEmpty, "SNBiped");
										that.getView().setModel(oNewModelEmpty, "SNBiped");
										that._countQuantitys();
									}
								}
							});
							var oModelBlank = new JSONModel();
							sap.ui.getCore().setModel(oModelBlank, "ErrorReason");
							that.getView().setModel(oModelBlank, "ErrorReason");

							that._clearPosting();
							// var oModelPosting = that.getView().getModel("Posting");
							// var oDataPosting = oModelPosting.getData();
							// oDataPosting.SerialNumberReaderReject = "";
							// oDataPosting.SerialNumberSimcard = "";

							// that.getView().setModel(oModelPosting, "Posting");
							that.getView().getModel("Posting").refresh(true);
							that.getView().byId("idReject").focus();

						}
					},
					error: function(e) {
						MessageBox.error("Gateway", {
							icon: MessageBox.Action.Error,
							actions: [MessageBox.Action.OK],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function(sAction) {}
						});
					}
				});

			} else {

				MessageBox.error(this._getText("informsn"), {
					icon: MessageBox.Action.Error,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});
			}
		},
		onPressErrorReason: function(oEvent) {
			if (sap.ui.getCore().byId("errorReason").getValue() && this.getView().getModel("Posting").getData().Bag) {
				this._oDialogError.close();
				this.onPressSubmitReject();
			} else {
				MessageBox.error("Informe o Motivo e Caixa", {
					icon: MessageBox.Action.Error,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});
			}

		},
		onPressSubmitAprovedSimcard: function(oEvent) {
			if (this.getView().getModel("Posting").getData().SerialNumberSimcard) {
				this.onPressSubmitTestado();
			} else {
				MessageBox.error(this._getText("informsimcard"), {
					icon: MessageBox.Action.ERROR,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});
			}
		},
		onPressSubmitAmostraSimcard: function(oEvent) {
			if (this.getView().getModel("Posting").getData().SerialNumberSimcard) {
				this.onPressSubmitAmostra();
			} else {
				MessageBox.error(this._getText("informsimcard"), {
					icon: MessageBox.Action.ERROR,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});
			}

		},
		onPressSubmitRejectSimcard: function(oEvent) {
			if (this.getView().getModel("Posting").getData().SerialNumberSimcard) {
				this.onPressSubmitReject();
			} else {
				MessageBox.error(this._getText("informsimcard"), {
					icon: MessageBox.Action.ERROR,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});
			}

		},

		onPressSubmitAmostra: function(oEvent) {

			if (this.getView().getModel("Posting").getData().SerialNumberReaderAmostra) {

				this.getView().byId("pageSN").setBusy(true);

				var oDataPost = {
					Identifier: sap.ui.getCore().getModel("Quantity").getData().Identifier,
					Sernr: this.getView().getModel("Posting").getData().SerialNumberReaderAmostra,
					SernrSimcard: this.getView().getModel("Posting").getData().SerialNumberSimcard,
					TestResult: "A"
				};

				var that = this;
				$.ajax({
					url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersSet",
					contentType: "application/json",
					dataType: "json",
					type: 'POST',
					beforeSend: function(jqXHR1, settings) {
						jqXHR1.setRequestHeader('X-CSRF-Token', sap.ui.getCore().getModel("Token").getData().Token);
					},
					data: JSON.stringify(oDataPost),
					processData: false,
					success: function(data, token) {

						if (data.d.Error) {

							that.getView().byId("pageSN").setBusy(false);

							if (data.d.RequiredSimcard) {

								that._oDialog = sap.ui.xmlfragment("zui5_mm_ct.view.Simcard", that);
								that.getView().addDependent(that._oDialog);
								that._oDialog.setEscapeHandler(function() {});
								that._oDialog.open();
							} else {
								MessageBox.error(data.d.Msg, {
									icon: MessageBox.Action.Error,
									onClose: function(sAction) {
										// that._clearPosting();
										var oModelPosting = that.getView().getModel("Posting");
										var oDataPosting = oModelPosting.getData();

										if (!oDataPosting.SerialNumberSimcard) {
											oDataPosting.SerialNumberReaderAmostra = "";
										}

										// oDataPosting.SerialNumberReaderAmostra = "";
										oDataPosting.SerialNumberSimcard = "";

										that.getView().setModel(oModelPosting, "Posting");
										that.getView().getModel("Posting").refresh(true);
									}
								});
							}

						} else {
							if (that._oDialog) {
								that._oDialog.close();
							}
							jQuery.ajax({
								type: "GET",
								contentType: "application/json",
								url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersBufferSet",
								dataType: "json",
								async: false,
								success: function(data, textStat, jqXHR) {

									that.getView().byId("pageSN").setBusy(false);

									var oNewModel = new JSONModel();
									if (data.d.results.length > 0) {

										var odata = {
											SN: data.d.results
										};
										oNewModel.setData(odata);

										sap.ui.getCore().setModel(oNewModel, "SNBiped");
										that.getView().setModel(oNewModel, "SNBiped");
										that._countQuantitys();
										var result = that._totalBiped();
										if (result) {
											MessageBox.confirm(that._getText("totalalready"), {
												icon: MessageBox.Action.SUCCESS,
												actions: [MessageBox.Action.YES, MessageBox.Action.NO],
												emphasizedAction: MessageBox.Action.YES,
												onClose: function(sAction) {
													if (sAction === MessageBox.Action.YES) {
														that._moviment();
													}
												}
											});
										}
									}
								}
							});
							that._clearPosting();
							// var oModelPosting = that.getView().getModel("Posting");
							// var oDataPosting = oModelPosting.getData();
							// oDataPosting.SerialNumberReaderAmostra = "";
							// oDataPosting.SerialNumberSimcard = "";

							// that.getView().setModel(oModelPosting, "Posting");
							that.getView().getModel("Posting").refresh(true);
							that.getView().byId("idAmostra").focus();
						}
					},
					error: function(e) {

						that.getView().byId("pageSN").setBusy(false);

						MessageBox.error("Erro Gateway", {
							icon: MessageBox.Action.ERROR,
							actions: [MessageBox.Action.OK],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function(sAction) {}
						});
					}
				});

			} else {

				MessageBox.error(this._getText("informsn"), {
					icon: MessageBox.Action.ERROR,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});

			}

		},
		onPressSubmitTestado: function(oEvent) {

			if (this.getView().getModel("Posting").getData().SerialNumberReader) {

				this.getView().byId("pageSN").setBusy(true);

				var oDataPost = {
					Identifier: sap.ui.getCore().getModel("Quantity").getData().Identifier,
					Sernr: this.getView().getModel("Posting").getData().SerialNumberReader,
					SernrSimcard: this.getView().getModel("Posting").getData().SerialNumberSimcard,
					TestResult: "S"
				};

				var that = this;
				$.ajax({
					url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersSet",
					contentType: "application/json",
					dataType: "json",
					type: 'POST',
					beforeSend: function(jqXHR1, settings) {
						jqXHR1.setRequestHeader('X-CSRF-Token', sap.ui.getCore().getModel("Token").getData().Token);
					},
					data: JSON.stringify(oDataPost),
					processData: false,
					success: function(data, token) {

						if (data.d.Error) {
							that.getView().byId("pageSN").setBusy(false);

							if (data.d.RequiredSimcard) {

								that._oDialog = sap.ui.xmlfragment("zui5_mm_ct.view.SimcardAproved", that);
								that.getView().addDependent(that._oDialog);

								that._oDialog.setEscapeHandler(function() {});
								that._oDialog.open();
							} else {

								MessageBox.error(data.d.Msg, {
									icon: MessageBox.Action.ERROR,
									onClose: function(sAction) {
										// that._clearPosting();
										var oModelPosting = that.getView().getModel("Posting");
										var oDataPosting = oModelPosting.getData();
										if (!oDataPosting.SerialNumberSimcard) {
											oDataPosting.SerialNumberReader = "";
										}
										oDataPosting.SerialNumberSimcard = "";

										that.getView().setModel(oModelPosting, "Posting");
										that.getView().getModel("Posting").refresh(true);

									}
								});
							}

						} else {
							if (that._oDialog) {
								that._oDialog.close();
							}
							jQuery.ajax({
								type: "GET",
								contentType: "application/json",
								url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/SerialNumbersBufferSet",
								dataType: "json",
								async: false,
								success: function(data, textStat, jqXHR) {
									var oNewModel = new JSONModel();

									if (data.d.results.length > 0) {

										var odata = {
											SN: data.d.results
										};
										oNewModel.setData(odata);

										sap.ui.getCore().setModel(oNewModel, "SNBiped");
										that.getView().setModel(oNewModel, "SNBiped");
										that._countQuantitys();

										that.getView().byId("pageSN").setBusy(false);

										var result = that._totalBiped();
										if (result) {
											MessageBox.confirm(that._getText("totalalready"), {
												icon: MessageBox.Action.SUCCESS,
												actions: [MessageBox.Action.YES, MessageBox.Action.NO],
												emphasizedAction: MessageBox.Action.YES,
												onClose: function(sAction) {
													if (sAction === MessageBox.Action.YES) {
														that._moviment();
													}
												}
											});
										}
									}
								}
							});

							that._clearPosting();
							// var oModelPosting = that.getView().getModel("Posting");
							// var oDataPosting = oModelPosting.getData();
							// oDataPosting.SerialNumberReader = "";
							// oDataPosting.SerialNumberSimcard = "";

							// that.getView().setModel(oModelPosting, "Posting");
							that.getView().getModel("Posting").refresh(true);
							that.getView().byId("idTestado").focus();
						}
					},
					error: function(e) {
						MessageBox.error("Gateway", {
							icon: MessageBox.Action.ERROR,
							actions: [MessageBox.Action.OK],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function(sAction) {}
						});
					}
				});

			} else {

				MessageBox.error(this._getText("informsn"), {
					icon: MessageBox.Action.ERROR,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {}
				});

			}

		},
		_clearPosting: function() {
			var oDataPosting = {
				SerialNumberReader: "",
				SerialNumberReaderAmostra: "",
				SerialNumberReaderReject: "",
				SerialNumberSimcard: "",
				TestResult: "",
				Bag: ""
			};

			var oModelPosting = new JSONModel();
			oModelPosting.setData(oDataPosting);
			this.getView().setModel(oModelPosting, "Posting");
		},
		onBeforeRendering: function() {

			var oDataPosting = {
				SerialNumberReader: "",
				SerialNumberReaderAmostra: "",
				SerialNumberReaderReject: "",
				SerialNumberSimcard: "",
				TestResult: "",
				Bag: ""
			};

			var oModelPosting = new JSONModel();
			oModelPosting.setData(oDataPosting);
			this.getView().setModel(oModelPosting, "Posting");

		}
	});
});