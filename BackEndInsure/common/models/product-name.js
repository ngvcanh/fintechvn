'use strict';

module.exports = function(Productname) {
	const enabledRemoteMethods = ['find', 'prototype.patchAttributes', 'create'];
  Productname.sharedClass.methods().forEach(function(method) {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    // console.log(methodName);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      Productname.disableRemoteMethodByName(methodName);
    }
  });

};
