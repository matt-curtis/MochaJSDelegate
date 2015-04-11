var MochaJSDelegate = function(selectorHandlerDict){
	var uniqueClassName = "MochaJSDelegate_DynamicClass_"+new Date().getTime();

	var delegateClassDesc = MOClassDescription.allocateDescriptionForClassWithName_superclass_(uniqueClassName, NSObject);
	
	delegateClassDesc.registerClass();

	//	Handler storage

	var handlers = {};

	//	Define interface

	this.setHandlerForSelector = function(selectorString, func){
		var handlerHasBeenSet = (selectorString in handlers);
		var selector = NSSelectorFromString(selectorString);

		handlers[selectorString] = func;

		if(!handlerHasBeenSet){
			delegateClassDesc.addInstanceMethodWithSelector_function_(selector, function(){
				var functionToCall = handlers[selectorString];

				if(functionToCall) functionToCall.apply(delegateClassDesc, Array.prototype.slice.call(arguments));
			});
		}
	};

	this.removeHandlerForSelector = function(selectorString){
		delete handlers[selectorString];
	};

	this.getHandlerForSelector = function(selectorString){
		return handlers[selectorString];
	};

	this.getAllHandlers = function(){
		return handlers;
	};

	this.getClass = function(){
		return NSClassFromString(uniqueClassName);
	};

	this.getClassInstance = function(){
		return NSClassFromString(uniqueClassName).new();
	};

	//	Conveience

	if(typeof selectorHandlerDict == "object"){
		for(var selectorString in selectorHandlerDict){
			this.setHandlerForSelector(selectorString, selectorHandlerDict[selectorString]);
		}
	}
};