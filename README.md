# jsreport-browser-client-dist

**Standalone distributable jsreport browser sdk**

##Download

You can use npm
> npm install jsreport-browser-client-dist

Or download `jsreport.js` from the [release page](https://github.com/jsreport/jsreport-browser-client-dist/releases)

The script itself should be compatible with [webpack](https://webpack.github.io/), [requirejs](http://requirejs.org/) and other script bundlers.

##Usage

```js
jsreport.serverUrl = 'http://localhost:3000';

var request = {
  template: { 
    content: 'foo', engine: 'none', recipe: 'phantom-pdf'
   }
};

//display report in the new tab
jsreport.render('_blank', request);

//display report in placeholder with id reportPlaceholder
jsreport.render('reportPlaceholder', request);

//display report in placeholder element
jsreport.render(document.getElementById('reportPlaceholder'), request);

//open download dialog for report
jsreport.download('myReport.pdf', request);

//render through AJAX request and return promise with array buffer response
jsreport.renderAsync(request).then(function(arrayBuffer) {
  console.log(arrayBuffer);
});
```

You can find more details about the `request` argument  [jsreport-core](https://github.com/jsreport/jsreport-core) repository.

##License
MIT