const fetch = require('node-fetch');
module.exports.func = async function(interaction) {
	fetch(process.env.LINK+"/tweet/", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        //make sure to serialize your JSON body
        body: JSON.stringify({
            body: interaction.message.embeds[0].description,
	    password: process.env.API_KEY	
        })
    })
        .then(async function (response) {
            let replacementRow = interaction.message.components[0];

            replacementRow.components[0].disabled = true;

            await interaction.update({ components: [replacementRow] });
	    await interaction.followUp("Tweeted!")
            //do something awesome that makes the world a better place
        });
};

module.exports.customId = "acceptTweet";

