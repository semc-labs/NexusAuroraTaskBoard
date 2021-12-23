const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function formatNums(num,sep,dec,u){sep=sep||',';u=u||'\\d';if(typeof num!='string'){num=String(num);if(dec&&dec!='.')num=num.replace('.',dec);}return num.replace(RegExp('\\'+(dec||'.')+u+'+|'+u+'(?=(?:'+u+'{3})+(?!'+u+'))','g'),function(a){return a.length==1?a+sep:a})}


module.exports = {
	data: new SlashCommandBuilder().setName('generatetweetlink').setDescription('Generate One Time Tweet Link.'),
        async execute(interaction) {
		fetch(process.env.LINK+"/generate", {
  method: "post",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },

  //make sure to serialize your JSON body
  body: JSON.stringify({
    password: process.env.API_KEY 
  })
})
.then( async function (response) {
	let text = await response.text()
	await interaction.reply({content: "One Time Link: "+text, ephemeral: true})
   //do something awesome that makes the world a better place
});	
	},
};

