require("dotenv").config();

const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(express.static("public"));
app.use(express.json());

const PORT = 3000;

/*
    AI TUTOR ENDPOINT
*/

app.post("/api/tutor", async (req, res) => {

    try {

        const {
            depth,
            pressure,
            ballast,
            verticalVelocity
        } = req.body;

        const prompt = `
You are an educational submarine physics tutor.

Explain what is happening to the submarine in simple STEM educational language.

Current state:
- Depth: ${depth.toFixed(1)} meters
- Pressure: ${pressure.toFixed(2)} atmospheres
- Ballast: ${ballast.toFixed(1)}%
- Vertical Velocity: ${verticalVelocity.toFixed(2)} m/s

Keep responses short and educational.

IMPORTANT:
- Never output raw backslashes alone.
- Please try to write equations and make them ONLY like this example formatting:

$$
F = ma
$$

- Never use [ equation ] formatting.
- Please explain the variables in the equations you write, and what they represent in the context of submarine physics.
- Use proper spaces between words.
`;

        /*
            FREE MODEL FALLBACKS
        */
        const models = [

            "nvidia/nemotron-3-nano-30b-a3b:free",

            "inclusionai/ring-2.6-1t:free",

            "arcee-ai/trinity-large-thinking:free",

            "openrouter/free"

        ];

        let aiText = null;
        let usedModel = null;

        /*
            TRY EACH MODEL
        */
        for (const model of models) {

            try {

                console.log(
                    `Trying model: ${model}`
                );

                const response =
                    await axios.post(

                        "https://openrouter.ai/api/v1/chat/completions",

                        {
                            model,

                            provider: {
                                allow_fallbacks: true
                            },

                            messages: [

                                {
                                    role: "system",

                                    content:
                                        "You are a helpful STEM tutor."
                                },

                                {
                                    role: "user",

                                    content: prompt
                                }
                            ]
                        },

                        {
                            headers: {

                                Authorization:
                                    `Bearer ${process.env.OPENROUTER_API_KEY}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                aiText =
                    response.data.choices[0]
                    .message.content;

                usedModel = model;

                break;

            } catch (modelError) {

                console.log(
                    `Model failed: ${model}`
                );

                console.log(
                    modelError.response?.data ||
                    modelError.message
                );
            }
        }

        /*
            ALL MODELS FAILED
        */
        if (!aiText) {

            return res.status(500).json({
                error:
                    "All AI models failed."
            });
        }

        console.log(
            `Successful model: ${usedModel}`
        );

        res.json({
            text: aiText,
            model: usedModel
        });

    } catch (error) {

        console.error(
            error.response?.data || error
        );

        res.status(500).json({
            error: "AI request failed"
        });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});