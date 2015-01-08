var rest = require('restler');
var cheerio = require('cheerio');
var pdc = require('pdc');
var fs = require('fs');
var forEach = require('async-foreach').forEach;

// optional, if pandoc is not in PATH
// var path = require('path');
// pdc.path = path.resolve(process.env.HOME, '.cabal/bin/pandoc');



var posts = [
  'https://medium.com/@guojing/633c3459193',
  'https://medium.com/chinese-writing/-a06aaa79999b',
  'https://medium.com/@streetevens/1fb11246e36'
]
var i = 0;
var output = '';

forEach (posts, function (post, index, arr) {
  rest.get(post).on('complete', function(result) {
    i++;
    console.log('fetching no.'+i);
    if (result instanceof Error) {
      console.log('Error:', result.message);
      this.retry(5000); // try again after 5 sec
    } else {
      var $ = cheerio.load(result);

      var title = $('[name="title"]').text();
      title = '<h2>'+title+'</h2>';
      var date = $('.postMetaInline--date').find('.post-date').first().text();
      var author = $('.postMetaInline--authorDateline').find('a').text();
      author = '<b>'+author+'</b> 写于 '+date;

      var content = '';
      $('.section-content').find('.layoutSingleColumn').each(function () {

        if ($(this).find('p').length > 0) {
          if (!$(this).data('scroll')) {
            content = $(this).html();
          }
        }


      })

      // remove css in result
      //console.log(content);
      $ = cheerio.load(content);
      $('*').each(function() {      // iterate over all elements
        $(this).attr('style',null);     // remove all attributes
      });
      content = $.html();
      // end

      output += title + author + content + '<hr>';
      if (i == posts.length) {

        //console.log(output);
        pdc(output, 'html', 'html', function(err, result) {
          if (err)
            throw err;
            else {
              var style = '<link href="screen.css" rel="stylesheet" type="text/css">';
              result = style + result;
              fs.writeFile("output.html", result, function(err) {
                if(err) {
                  console.log(err);
                } else {
                  console.log("The file was saved!");
                }
              });

            }

        });
      }

    }

  })
})


/*
for (i=0; i<posts.length; i++) {
  var order = i+1;
  console.log('fetching no.'+order);
  rest.get(posts[i]).on('complete', function(result) {


    if (result instanceof Error) {
      console.log('Error:', result.message);
      this.retry(5000); // try again after 5 sec
    } else {
      var $ = cheerio.load(result);
      var title = $('[name="title"]').text();
      var content = $('.layoutSingleColumn').html();
      output += title + content + '<hr>';
      console.log(title);
      if (i == posts.length - 1) {
        console.log('last')
        pdc(output, 'html', 'pdf', function(err, result) {
          if (err)
            throw err;
          else {

            fs.writeFile("output.pdf", result, function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log("The file was saved!");
              }
            });

          }

        });



      }
    }



  });


}
*/
