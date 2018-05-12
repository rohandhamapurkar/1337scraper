#!/usr/bin/env node

const request = require('request');
const {spawnSync} = require('child_process');
const ArgumentParser = require('argparse').ArgumentParser;
const cheerio = require('cheerio'),
  cheerioTableparser = require('cheerio-tableparser');
  const Table = require('cli-table');
  const rl = require("readline");
  const prompts = rl.createInterface(process.stdin, process.stdout);
  const torrent1337 = 'https://1337x.bypassed.bz'

const Spinner = require('cli-spinner').Spinner;

let mode = process.argv[2];
let searchString = process.argv[3];
let check = {};

function main() {
  var parser = new ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: '1337 scraper'
  });
  parser.addArgument(
    ['-s', '--s'], {
      help: 'keyword to search for torrent links (double quotes necessary)'
    }
  );
  var args = parser.parseArgs();

  if (args.s != null) {
    let spinner = new Spinner('Getting links please wait.. %s\t\t\t\t\t');
    spinner.setSpinnerString(18);
    spinner.start();
    searchString = encodeURIComponent(searchString);
    request(torrent1337 + '/search/' + searchString + '/1/', function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        cheerioTableparser($)
        let data = $('table[class="table-list table table-responsive table-striped"]').parsetable();
        
        
        var table = new Table({
          chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                 , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                 , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                 , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
                 colWidths: [5,47,10,10]
        });
        table.push(
          ['No.','Name','Size','Seeds']
        );
        //console.log(data)
        for (i in data[0]) {
          if (data[0][i].indexOf('/torrent/') > -1) {
            let name = data[0][i].slice(data[0][i].indexOf('/">'));
            let str = data[0][i].slice(data[0][i].indexOf('/torrent/'));
            let final = torrent1337 + str.slice(0, str.indexOf('">'));
            let size = data[4][i].slice(0,data[4][i].indexOf('<span'));
            let seeds = data[4][i].slice(data[4][i].indexOf('>')+1,data[4][i].indexOf('</'));

            table.push(
              [Number(i),name.slice(3,name.indexOf('</a')),size,seeds]
            );
            check[i] = {
              link:final
            };
          }
        }
        spinner.stop();
        console.log('\n');
        console.log(table.toString());
        (function testrecursive(){
          prompts.question("Enter torrent number to get magnet link(or type exit to stop process):", function (number) {
            if (!isNaN(number) && Number(number) <= Object.keys(check).length && Number(number) > 0) {
              getMagnet(number);
            } else if(number == "exit"){
              process.exit();
            } else {
              console.log("Invalid number!!!! ");
              testrecursive();
            }
        });
        })(); 
      } else {
        console.log(error)
      }
    });
  } else {
    console.log("Invalid arguments use -h for help")
  }

  function getMagnet(index) {
    let spinner = new Spinner('Getting magnet link please wait ... %s\t\t\t\t\t');
    spinner.setSpinnerString(18);
    spinner.start();
    request(check[index].link, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        spinner.stop();
        $('ul[class="download-links-dontblock btn-wrap-list"] li').each((index, elem) => {
          if (index == 0) {
            console.log("\n\n Magnet Link:")
            console.log(elem.childNodes[0].attribs.href);
            spawnSync('open', ['/Applications/uTorrent.app', elem.childNodes[0].attribs.href]);
            process.exit(0);
          }
        })
      } else {
        console.log(error)
      }
    });
  }
}

module.exports = main();