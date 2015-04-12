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
			/*
				For some reason, Mocha acts weird about arguments:
				https://github.com/logancollins/Mocha/issues/28

				We have to basically create a dynamic handler with a likewise dynamic number of predefined arguments.
			*/

			var dynamicHandler = function(){
				var functionToCall = handlers[selectorString];

				if(!functionToCall) return;

				var argArray = [];

				for(var i = 0, len = arguments.length; i<len; i++) argArray.push(arguments[i]);

				functionToCall.apply(delegateClassDesc, argArray);
			};

			var code = /\{([\s\S]*)\}/g.exec(dynamicHandler+"")[1];
			var args = [];

			var regex = /:/g;
			while(match = regex.exec(selectorString)) args.push("arg"+args.length);

			dynamicHandler = eval("(function("+args.join(",")+"){"+code+"})"); // new Function() doesn't respect scope

			delegateClassDesc.addInstanceMethodWithSelector_function_(selector, dynamicHandler);
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