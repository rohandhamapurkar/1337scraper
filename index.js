var request = require('request');
const {spawnSync} = require('child_process');
var ArgumentParser = require('argparse').ArgumentParser;
var cheerio = require('cheerio'), cheerioTableparser = require('cheerio-tableparser');
let torrent1337 = 'https://1337x.bypassed.bz'
let mode = process.argv[2];
let searchString = process.argv[3];
var parser = new ArgumentParser({
    version: '1.0.0',
    addHelp:true,
    description: '1337 scraper'
  });
  parser.addArgument(
    [ '-s', '--s' ],
    {
      help: 'keyword to search for torrent links (double quotes necessary)'
    }
  );
  parser.addArgument(
    [ '-m', '--m' ],
    {
      help: 'to launch utorrent apllication with magnet link or to get magnet link in console'
    }
  );
  var args = parser.parseArgs();
  if(args.s != null){
    console.log("Scraping please wait ...");
    searchString = encodeURIComponent(searchString);
    request(torrent1337+'/search/'+searchString+'/1/', function (error, response, html) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(html);
          cheerioTableparser($)
          let data = $('table[class="table-list table table-responsive table-striped"]').parsetable();
          let check = [];
          for(i of data[0]){
              if(i.indexOf('/torrent/') > -1){
                  let str = i.slice(i.indexOf('/torrent/'))
                  let final = torrent1337+str.slice(0,str.indexOf('">'));
                  check.push(final);
              }
          }
          console.log(JSON.stringify(check,null,2));
        } else {
            console.log(error)
        }
      });
  } else if(args.m!= null) {
    console.log("Scraping please wait ...");
    request(searchString, function (error, response, html) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(html);
          $('ul[class="download-links-dontblock btn-wrap-list"] li').each((index,elem)=>{
            if(index == 0){
                console.log(elem.childNodes[0].attribs.href);
                spawnSync('open', ['/Applications/uTorrent.app',elem.childNodes[0].attribs.href]);
            }
          })
        } else {
            console.log(error)
        }
      });
  } else {
      console.log("Invalid arguments use -h for help")
  }
