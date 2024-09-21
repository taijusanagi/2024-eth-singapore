mergeInto(LibraryManager.library, {
  SendMessageToParent: function (messagePtr) {
    var message = UTF8ToString(messagePtr); // Convert C# string pointer to JavaScript string
    window.parent.postMessage(message, "*"); // Send the message to the parent iframe
  },
});
