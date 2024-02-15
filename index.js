import express from 'express'
import OpenAI from "openai";
const openai = new OpenAI({ baseURL: 'http://127.0.0.1:5000/v1', apiKey: 'sk-1234567890'});
const app = express();
import { gameValues } from './messageValues.js';
app.use(express.text());

app.all('/modifyMessage', async (req, res) => {
    console.log({OriginalMessage: req.body });
    // return res.send('\x05\x06' + req.body)

    let result = await condescendingText(String.raw`${req.body}`);
    // Initialize the counter variable
    let counter = 0;
    result = result.replace(/(.{1,35})\s/g, function (match, p1) {
        // Increment the counter every time a newline is added
        counter++;
        // Check if the counter is divisible by 3
        if (counter % 3 === 0) {
            // Add CustomMessage.WAIT_FOR_INPUT() after the newline
            return p1 + CustomMessage.NEWLINE() + CustomMessage.WAIT_FOR_INPUT();
        } else {
            // Just add the newline
            return p1 + CustomMessage.NEWLINE();
        }
    });
    const shops = '\x01\x05D� \x05@left or right.\x01\x1B\x05BTalk to the owner\x01Quit\x05@\t\x02'
    const shopsCheck = '\x0B\x02'
    if (req.body.includes(`\b`)) {
        result = `\b`+ result + '\t\n'
    }
    if (req.body.includes(shopsCheck)) {
        result = result + shopsCheck
    }
    if (req.body.includes(shops)) {
        result = result + shops
    }
    // result = result.trim() + CustomMessage.MESSAGE_END();
    result = result.replace(/[\n\r]/g, "");
    console.log({resultMessage: result})
    // return res.send(result.slice(0, result.length));
    return res.send(result)
});


async function condescendingText(txt) {
    let msg = []
    let text = txt
    // Preprocessing: replace special codes with placeholders
    text = text.replace(/\x1B/g, "{{CHOICE}}");
    text = text.replace(/\x07/g, "{{GO_TO}}");
    text = text.replace(/\\t\\n\x02/g, "{{End_of}}");
    const stream = await openai.chat.completions.create({
        messages: [
            {
                "role": "system", 
                "content": "Be Sarcastic"
            },
            {
            "role": "user", 
            "content": text
        }],
        temperature: 0.6,
        stream: true,
        maxTokens: 20,
    }, { timeout: 120000, });
    let index = 0
    let length = text.length
    for await (const chunk of stream) {
        index++
        // process.stdout.write(chunk.choices[0]?.delta?.content || '');
        msg.push(chunk.choices[0]?.delta?.content || '')
        // if (length === index) {
        //     break
        // }
        if (index > 200 ) {
            break
        }
      }
      return putMessageBack(msg.join(''))
}

function putMessageBack(msg) {
    let result = msg
    console.log('Prepostprocess: ', {result})
    // Postprocessing: replace placeholders with special codes
    result = result.replace(/{{CHOICE}}/g, "\x1B");
    result = result.replace(/{{GO_TO}}/g, "\x07");
    result = result.replace(/{{End_of}}/g, "\t\n\x02");
    return result
}
app.listen(5001, () => {
    console.log('Server is running on port 5001');
});

const CustomMessage = {
    MESSAGE_END() {
        return "\x02";
    },

    ITEM_OBTAINED(x) {
        return "\x13" + String.fromCharCode(x);
    },

    NEWLINE() {
        return "\x01 ";
    },

    COLOR(x) {
        return "\x05" + String.fromCharCode(x);
    },

    WAIT_FOR_INPUT() {
        return "\x04 ";
    },

    PLAYER_NAME() {
        return "\x0F";
    }
}

const color = {
    BLUE: ["\x05\x03"],
    RED: ["\x05\x01"],
    PURPLE: ["\x05\x05"],
    GOLD: ["\x05\x06"]
  }
  


