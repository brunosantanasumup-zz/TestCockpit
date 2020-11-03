sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("zui5_mm_ct.controller.Quantity", {
		onInitMatched: function() {
			// this._verifyAlreadyUsing();

			var oExec = {
				Execution: true
			};

			var oModelExec = new JSONModel();
			oModelExec.setData(oExec);

			this.getView().setModel(oModelExec, "Exec");
			sap.ui.getCore().setModel(oModelExec, "Exec");
		},
		onInit: function() {

			this.getOwnerComponent().getRouter().getRoute("Quantity").attachPatternMatched(this.onInitMatched, this);

		},
		onAfterRendering: function() {

			if (this.getView().getModel("Quant")) {
				this.getView().getModel("Quant").setData(sap.ui.getCore().getModel("Quant").getData());
				var oQuan = this.getView().getModel("Quant").getData();

				var oExec = this.getView().getModel("Exec").getData();
				if (oQuan.Quantity) {
					oExec.Execution = false;
				} else {
					oExec.Execution = true;
				}
				sap.ui.getCore().getModel("Exec").setData(oExec);
				this.getView().getModel("Exec").setData(oExec);
			}
			this._verifyAlreadyUsing();
		},
		onBeforeRendering: function() {

		},
		_verifyAlreadyUsing: function() {

			this.getView().byId("pageQuantity").setBusy(true);

			var oQuan = {
				Quantity: ""
			};

			var oModelQuant = new JSONModel();
			oModelQuant.setData(oQuan);
			this.getView().setModel(oModelQuant, "Quant");
			sap.ui.getCore().setModel(oModelQuant, "Quant");

			var oToken = {
				Token: ""
			};
			try {
				var name = sap.ushell.Container.getService("UserInfo").getUser().getFirstName();
			} catch (err) {
				name = "Teste";
			}

			var oDataQuantity = {
				Identifier: "",
				New: "",
				User: name,
				Old: "",
				Percentage: "",
				Data: new Date(),
				QuantityOld: "",
				QuantityInformed: "",
				QuantityAproved: 0,
				QuantityReject: 0,
				QuantityAmostra: 0,
				QuantityToBeTested: 0,
				QuantityAlreadyTested: 0
			};

			var oModel = new JSONModel();
			oModel.setData(oModel);
			this.getView().setModel(oModel, "Quantity");
			sap.ui.getCore().setModel(oModel, "Quantity");

			// var oDataQuan = {
			// 	Quantity: ""
			// };

			var that = this;
			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/ZCDS_MM_CT_001",
				dataType: "json",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("X-CSRF-Token", "Fetch");
				},
				async: false,
				error: function() {
					that.getView().byId("pageQuantity").setBusy(false);
				},
				success: function(data, textStat, jqXHR) {
					oToken.Token = jqXHR.getResponseHeader("X-CSRF-Token");

					var oModel = new JSONModel();

					var oModelQuan = new JSONModel();

					that.getView().byId("pageQuantity").setBusy(false);

					if (data.d.results.length > 0) {

						oDataQuantity.old = "X";
						oDataQuantity.Identifier = data.d.results[0].Identifier;
						oDataQuantity.QuantityInformed = data.d.results[0].Quantity.replace(/^0+/, '');

						// oDataQuantity.QuantityInformed = data.d.results[0].Quantity.replace(/^0+/, '');
						// oDataQuan.Quantity = oDataQuantity.QuantityInformed;

						oModel.setData(oDataQuantity);
						that.getView().setModel(oModel, "Quantity");
						sap.ui.getCore().setModel(oModel, "Quantity");

						// oModelQuan.setData(oDataQuan);
						// that.getView().setModel(oModelQuan, "Quan");
						// sap.ui.getCore().setModel(oModelQuan, "Quan");

						// MessageBox.success("Ja existe(m) S/N a ser(em) movimentada(s)", {

						MessageBox.information(that._getText("alreadySN"), {
							icon: MessageBox.Icon.INFORMATION,
							actions: [MessageBox.Action.OK],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function(sAction) {
								if (sAction === MessageBox.Action.OK) {
									// var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
									// oRouter.navTo("SerialNumbers");

									that.getOwnerComponent().getRouter().navTo("SerialNumbers");

								}
							}
						});

					} else {

						var oExecution = sap.ui.getCore().getModel("Exec").getData();
						oExecution.Execution = "true";
						sap.ui.getCore().getModel("Exec").setData(oExecution);
						that.getView().getModel("Exec").setData(oExecution);

						oDataQuantity.New = "X";
						oModel.setData(oDataQuantity);
						that.getView().setModel(oModel, "Quantity");
						sap.ui.getCore().setModel(oModel, "Quantity");

						// oModelQuan.setData(oDataQuan);
						// that.getView().setModel(oModelQuan, "Quan");
						// sap.ui.getCore().setModel(oModelQuan, "Quan");
					}

				}
			});

			var oTokenModel = new JSONModel();
			oTokenModel.setData(oToken);
			sap.ui.getCore().setModel(oTokenModel, "Token");
		},
		_getText: function(text) {
			return this.getView().getModel("i18n").getResourceBundle().getText(text);
		},
		onSearch: function(oEvent) {

			if (this.getView().getModel("Quant").getData().Quantity > 0) {
				var that = this;
				that.getView().byId("pageQuantity").setBusy(true);
				var oDataQuan = {
					Quantity: this.getView().getModel("Quant").getData().Quantity
				};

				$.ajax({
					url: "/sap/opu/odata/SAP/ZGW_COCKPIT_TEST_SRV_02/ZCDS_MM_CT_001",
					contentType: "application/json",
					type: 'POST',
					beforeSend: function(jqXHR1, settings) {
						jqXHR1.setRequestHeader('X-CSRF-Token', sap.ui.getCore().getModel("Token").getData().Token);
					},
					// data: JSON.stringify(that.getView().getModel("Quan").getData()),
					data: JSON.stringify(oDataQuan),
					dataType: "json",
					processData: false,
					success: function(dat, token) {
						var oModel = sap.ui.getCore().getModel("Quantity");

						var oDataQuant = oModel.getData();

						oDataQuant.QuantityInformed = that.getView().getModel("Quant").getData().Quantity;
						oDataQuant.Identifier = dat.d.Identifier;

						oModel.setData(oDataQuant);

						that.getView().setModel(oModel, "Quantity");
						sap.ui.getCore().setModel(oModel, "Quantity");

						var oExecution = sap.ui.getCore().getModel("Exec").getData();
						oExecution.Execution = false;
						sap.ui.getCore().getModel("Exec").setData(oExecution);

						// var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						// oRouter.navTo("SerialNumbers");
						that.getView().byId("pageQuantity").setBusy(false);
						that.getOwnerComponent().getRouter().navTo("SerialNumbers");
					},
					error: function(e) {
						that.getView().byId("pageQuantity").setBusy(false);
						MessageBox.error("Gateway", {
							icon: MessageBox.Action.Error,
							actions: [MessageBox.Action.OK],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function(sAction) {
								// navegar pra proxima 							
							}
						});
					}
				});

			} else {
				that.getView().byId("pageQuantity").setBusy(false);
				MessageBox.error(this._getText("informQnt"), {
					icon: MessageBox.Action.Error,
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function(sAction) {
						// navegar pra proxima 							
					}
				});

			}
		}

	});
});