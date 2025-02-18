require('dotenv').config({
  path: './environment.env'
})
const {
  Configuration,
  OpenAIApi
} = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);
var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var fs = require('fs')
var request = require('request');

const imageFolder = './generations';

if (!fs.existsSync(imageFolder)) {
  fs.mkdirSync(imageFolder);
}

/* Generation completion */
router.post('/generation', async function (req, res, next) {
  var prompt = req.body;
  
  try {
    const response = await openai.createImage({
      "prompt": prompt.promptText,
      "n": parseInt(prompt.promptNum),
      "size": prompt.promptRes,
      "response_format": "b64_json",
    });

    res.send(response.data.data)

    if (prompt.promptSave == true) {
      for (i = 0; i < response.data.data.length; i++) {
        let promptName = (prompt.promptText.substring(0, 150) + " - " + prompt.promptTime.substring(0, 50) + " - " + i).replace(/[/\\?%*:|"<>]/g, '-');
        const filePath = imageFolder + '/' + promptName + '.jpg';
        fs.writeFile(filePath, response.data.data[i].b64_json, 'base64', (err) => {
          if (err) {
            console.error(err);
          }
        });

      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Something went wrong."
    });
  }



});

module.exports = router;