// require csvtojson and fs modules
import csv from 'csvtojson'
import fs from 'fs'
// read the csv file
var csvFilePath = "./sarcasm_tweets.csv";

// create an empty array to store the alpaca objects
var alpacaArray = [];

// parse the csv file
csv()
  .fromFile(csvFilePath)
  .then(function (jsonArray) {
    // loop through the json array
    for (var i = 0; i < jsonArray.length; i++) {
      // get the tweet and sarcasm values from the csv columns
      var tweet = jsonArray[i].Tweet;
      var sarcasm = jsonArray[i]['Sarcasm (yes/no)'];

      // create an alpaca object with the instruction,input,output fields
      var alpacaObj = {
          instruction: "Label the following tweet as sarcastic or not:",
          input: tweet,
          output: sarcasm === 'yes' ? 'Sarcastic' : 'Not Sarcastic'
      };

      // push the alpaca object to the alpaca array
      alpacaArray.push(alpacaObj);
      
    }
    console.log(alpacaArray)

    // write the alpaca array to a json file
    fs.writeFile("alpaca.json", JSON.stringify(alpacaArray, null, 2), function (
      err
    ) {
      if (err) throw err;
      console.log("Alpaca file created.");
    });
  });
