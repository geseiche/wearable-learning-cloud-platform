sap.ui.controller("wlcpfrontend.controllers.GameEditor", {

	pageId : "gameEditor",
	boxId : "box",
	boxIdCount : 0,
	
	jsPlumbInstance : null,
	
	
	inputEndPoint : {
		 endpoint:"Dot",
		 isTarget:true,
		 isSource:false,
		 maxConnections: -1
	},
	
	outputEndPoint : {
		 endpoint:"Dot",
		 isTarget:false,
		 isSource:true,
		 maxConnections: -1,
	},
	
	initJsPlumb : function() {
		this.jsPlumbInstance = jsPlumb.getInstance();
		this.jsPlumbInstance.importDefaults({Connector: ["Straight"], ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                id: "arrow",
                length: 14,
                foldback: 0.8,
                paintStyle:{ fill: "#000000" }
            }]
        ]});
	},
	
	initStartState : function() {
		
		//Create a new start state
		//var startState = new StartState(((document.getElementById("gameEditor--pad").offsetWidth / 2) - (150 / 2)),100, "start");
		var startState = new StartState("startStateTopColor", "startStateBottomColor", "Start State" , "start", this.jsPlumbInstance);
		startState.setPositionX(((document.getElementById("gameEditor--pad").offsetWidth / 2) - (150 / 2))); startState.setPositionY(100);
		startState.draw();
		
		//Create the div
		//startState.createDiv("startStateTopColor", "startStateBottomColor", "Start State");
		
		//Draw the div
		//startState.drawDiv();
	},	
	
	initToolbox : function() {
		$("#gameEditor--toolboxDisplayState").draggable({ revert: false, helper: "clone", start : this.toolboxDragStart, stop : $.proxy(this.toolboxDragStop, this)});
		$("#gameEditor--toolboxButtonPressState").draggable({ revert: false, helper: "clone", start : this.toolboxDragStart, stop : $.proxy(this.toolboxDragStop, this)});
	},
	
	initToolbox2 : function() {
		$("#gameEditor--transition").draggable({ revert: false, helper: "clone", start : this.toolboxDragStart, stop : $.proxy(this.within2, this)});
	},
	
	onItemSelect : function(oEvent) {
		setTimeout(function(t) {
			t.initToolbox2();
		}, 500, this);
	},
	
	absoluteToRelativeX(absoluteX, width) {
		return absoluteX - (document.getElementById("gameEditor--toolbox").getBoundingClientRect().width + document.getElementById("gameEditor--mainSplitter-splitbar-0").getBoundingClientRect().width + (width / 2));
	},
	
	absoluteToRelativeY(absoluteY) {
		return absoluteY + document.getElementById("gameEditor--toolbox-scroll").offsetHeight;
	},
	
	toolboxDragStart : function() {
		document.getElementById("gameEditor--mainSplitter-content-0").style.overflow = "visible";
		document.getElementById("gameEditor--toolbox").style["overflow-x"] = "visible";
		document.getElementById("gameEditor--toolbox").style["overflow-y"] = "visible";
	},
	
	toolboxDragStop : function(event, ui) {
		document.getElementById("gameEditor--mainSplitter-content-0").style.overflow = "auto";
		document.getElementById("gameEditor--toolbox").style["overflow-x"] = "hidden";
		document.getElementById("gameEditor--toolbox").style["overflow-y"] = "auto";
		
		switch(ui.helper[0].childNodes[1].className) {
			case "toolboxDisplayStateTopColor":
				var displayState = new DisplayState("toolboxDisplayStateTopColor", "toolboxDisplayStateBottomColor", "Display Text" , this.createStateId(), this.jsPlumbInstance);
				displayState.setPositionX(displayState.absoluteToRelativeX(ui.position.left)); displayState.setPositionY(displayState.absoluteToRelativeY(ui.position.top));
				displayState.draw();
//				var displayState = new DisplayState(displayState.absoluteToRelativeX(ui.position.left), displayState.absoluteToRelativeY(ui.position.top), this.createStateId());
//				displayState.createDiv("toolboxDisplayStateTopColor", "toolboxDisplayStateBottomColor", "Display Text");
//				displayState.drawDiv(this.jsPlumbInstance);
				break;
			case "toolboxButtonPressStateTopColor":
				var displayState = new DisplayState(this.absoluteToRelativeX(ui.position.left, 150), this.absoluteToRelativeY(ui.position.top), this.createStateId());
				displayState.createDiv("toolboxButtonPressStateTopColor", "toolboxButtonPressStateBottomColor", "Button Press");
				displayState.drawDiv(this.jsPlumbInstance);
				break;
		}
	},
	
	createStateId : function() {
		this.boxIdCount++;
		return this.boxId + this.boxIdCount;
	},
	
	within2 : function(event, ui) {
		var localX = this.absoluteToRelativeX(ui.position.left, 75);
		var localY = this.absoluteToRelativeY(ui.position.top);
		  for(var i = 0; i < this.jsPlumbInstance.getConnections().length; i++) {
			  var x = this.jsPlumbInstance.getConnections()[i].connector.x;
			  var y = this.jsPlumbInstance.getConnections()[i].connector.y;
			  var h = this.jsPlumbInstance.getConnections()[i].connector.h;
			  var w = this.jsPlumbInstance.getConnections()[i].connector.w;
			  if(localX < x + w && localX + 75 > x && localY < y + h && localY + 62.5 > y) {
				   	//console.log("within");
				   	var hasLabel = false;
				    for(var key in this.jsPlumbInstance.getConnections()[i].getOverlays()) {
				        if( this.jsPlumbInstance.getConnections()[i].getOverlays()[key].hasOwnProperty("label")) {
				        	hasLabel = true;
				        	//console.log("has label");
				        }
				    }
				    if(!hasLabel) {
				    	this.jsPlumbInstance.getConnections()[i].addOverlay([ "Label", { label: "<div class=\"centerTransitionText\">Transition</div>", cssClass : "transition" }]);
				    	//console.log("no label");
				    } 	
				}
		  }
	},
	
	within : function(e) {
		  var localX = e.pageX - $("#gameEditor--pad").offset().left;
		  var localY = e.pageY - $("#gameEditor--pad").offset().top;
		  for(var i = 0; i < this.jsPlumbInstance.getConnections().length; i++) {
			  var x = this.jsPlumbInstance.getConnections()[i].connector.x;
			  var y = this.jsPlumbInstance.getConnections()[i].connector.y;
			  var h = this.jsPlumbInstance.getConnections()[i].connector.h;
			  var w = this.jsPlumbInstance.getConnections()[i].connector.w;
			  if(x <= localX && localX <= (x + w) && y <= localY && localY <= (y +h)) {
				   	//console.log("within");
				   	var hasLabel = false;
				    for(var key in this.jsPlumbInstance.getConnections()[i].getOverlays()) {
				        if( this.jsPlumbInstance.getConnections()[i].getOverlays()[key].hasOwnProperty("label")) {
				        	hasLabel = true;
				        	//console.log("has label");
				        }
				    }
				    if(!hasLabel) {
				    	this.jsPlumbInstance.getConnections()[i].addOverlay([ "Label", { label: "<div class=\"centerTransitionText\">hey</div>", cssClass : "transition" }]);
				    	//console.log("no label");
				    } 	
				}
		  }
	},
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf wlcpfrontend.views.GameEditor
*/
	onInit: function() {
		this.getView().byId("gameEditor").addEventDelegate({
			  onAfterRendering: function(){
				  
				  //Wait for the inital DOM to render
				  //Init jsPlumb
				  this.initJsPlumb();
				  
				  //Init the start state
				  this.initStartState();
				  
				  //Setup the toolbox drag and drop
				  this.initToolbox();
				  
				  //$("#gameEditor--pad").click($.proxy(this.within, this));
				  
			  }
			}, this);
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf wlcpfrontend.views.GameEditor
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf wlcpfrontend.views.GameEditor
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf wlcpfrontend.views.GameEditor
*/
//	onExit: function() {
//
//	}

});