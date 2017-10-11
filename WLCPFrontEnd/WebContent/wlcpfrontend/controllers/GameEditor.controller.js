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
		var startState = new StartState("startStateTopColor", "startStateBottomColor", "Start State" , "start", this.jsPlumbInstance);
		
		//Set the position
		startState.setPositionX(((document.getElementById("gameEditor--pad").offsetWidth / 2) - (150 / 2))); startState.setPositionY(100);
		
		//Redraw it
		startState.draw();
	},	
	
	initToolbox : function() {
		$("#gameEditor--toolboxDisplayState").draggable({ revert: false, helper: "clone", start : this.toolboxDragStart, stop : $.proxy(this.toolboxDragStop, this)});
		$("#gameEditor--toolboxBuzzerState").draggable({ revert: false, helper: "clone", start : this.toolboxDragStart, stop : $.proxy(this.toolboxDragStop, this)});
		$("#gameEditor--toolboxLEDState").draggable({ revert: false, helper: "clone", start : this.toolboxDragStart, stop : $.proxy(this.toolboxDragStop, this)});
	},
	
	initToolbox2 : function() {
		$("#gameEditor--transition").draggable({ revert: false, helper: "clone", start : this.toolboxDragStart, stop : $.proxy(this.dropTransition, this)});
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
				break;
			case "toolboxBuzzerStateTopColor":
				var buzzerState = new BuzzerState("toolboxBuzzerStateTopColor", "toolboxBuzzerStateBottomColor", "Buzzer Sound" , this.createStateId(), this.jsPlumbInstance);
				buzzerState.setPositionX(buzzerState.absoluteToRelativeX(ui.position.left)); buzzerState.setPositionY(buzzerState.absoluteToRelativeY(ui.position.top));
				buzzerState.draw();
				break;
			case "toolboxLEDStateTopColor":
				var ledState = new LEDState("toolboxLEDStateTopColor", "toolboxLEDStateBottomColor", "LED" , this.createStateId(), this.jsPlumbInstance);
				ledState.setPositionX(ledState.absoluteToRelativeX(ui.position.left)); ledState.setPositionY(ledState.absoluteToRelativeY(ui.position.top));
				ledState.draw();
				break;
		}
	},
	
	createStateId : function() {
		this.boxIdCount++;
		return this.boxId + this.boxIdCount;
	},
	
	dropTransition : function(event, ui) {
		
		//Get the position of the transition
		var localX = this.absoluteToRelativeX(ui.position.left, 75);
		var localY = this.absoluteToRelativeY(ui.position.top);
		
		//Place holder for found connections
		var connections = [];
		
		//Loop through all bounding boxes of connections and select ones the transition falls within
		for(var i = 0; i < this.jsPlumbInstance.getConnections().length; i++) {
			
			//Get positions and size of bounding box
			var x = this.jsPlumbInstance.getConnections()[i].connector.x;
			var y = this.jsPlumbInstance.getConnections()[i].connector.y;
			var h = this.jsPlumbInstance.getConnections()[i].connector.h;
			var w = this.jsPlumbInstance.getConnections()[i].connector.w;
			
			//Check if the transition is within the bounding box
			if(localX < x + w && localX + 75 > x && localY < y + h && localY + 62.5 > y) {
				
				//Check if the connection already has a label
				var hasLabel = false;
				for(var key in this.jsPlumbInstance.getConnections()[i].getOverlays()) {
					if( this.jsPlumbInstance.getConnections()[i].getOverlays()[key].hasOwnProperty("label")) {
						  hasLabel = true;
					}
				}
				
				//Only care about connections that dont have labels
				if(!hasLabel) {
					connections.push(this.jsPlumbInstance.getConnections()[i]);
			  }   		
		   }
		}
		
		//If there is only 1 connection, snap the label to the connection
		if(connections.length == 1) {
			connections[0].addOverlay([ "Label", { label: "<div class=\"centerTransitionText\">Transition</div>", cssClass : "transition" }]);
		} else if(connections.length != 0) { //If there is more than one connection
			
			//We need to figure out the closest
			var closestConnection = null;
			var closestDistance = 0;
			
			//Loop through the connections
			for(var i = 0; i < connections.length; i++) {
				
				//Get positions and size of bounding box
				var x = connections[i].connector.x;
				var y = connections[i].connector.y;
				var h = connections[i].connector.h;
				var w = connections[i].connector.w;
				
				//Get the center point of the box
				var centerX = x + (w / 2);
				var centerY = y + (h / 2);
				
				//Calculate the distance from the transition to the center of the bounding box of the connection
				var distance = Math.sqrt(Math.pow((centerX - localX), 2) + Math.pow((centerY - localY), 2));
				
				//If its the first connection set up the variables
				if(closestConnection == null) {
					closestConnection = connections[i];
					closestDistance = distance;
				} else { //If its not the first connection
					
					//Check to see if this connection is closer
					if(distance < closestDistance) {
						
						//If it is, make it the new closest
						closestConnection = connections[i];
						closestDistance = distance;
					}
				}
			}
			//Add the transition to the closest connection
			closestConnection.addOverlay([ "Label", { label: "<div class=\"centerTransitionText\">Transition</div>", cssClass : "transition" }]);
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