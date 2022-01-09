const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function formatNums(num,sep,dec,u){sep=sep||',';u=u||'\\d';if(typeof num!='string'){num=String(num);if(dec&&dec!='.')num=num.replace('.',dec);}return num.replace(RegExp('\\'+(dec||'.')+u+'+|'+u+'(?=(?:'+u+'{3})+(?!'+u+'))','g'),function(a){return a.length==1?a+sep:a})}

function percentIncrease(start, now) {
  return ((now - start) / start) * 100
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

module.exports = {
        data: new SlashCommandBuilder().setName('getshibprice').setDescription('Get USD Price of SHIB'),
        async execute(interaction) {
        	const response = await fetch("https://www.coinbase.com/api/v2/assets/prices/d6031388-71ab-59c7-8a15-a56ec20d6080?base=USD");
	        const json = await response.json();
		console.log(json.data);
		await interaction.reply("SHIB is currently at: **"+json.data.prices.latest+"** USD\n\nThat places NA's .4 billion SHIB at: **"+formatNums(round(Number(json.data.prices.latest)*Number(process.env.TOTAL_SHIB), 2))+"** USD or "+round(Math.abs(percentIncrease(11401.40, Number(json.data.prices.latest)*Number(process.env.TOTAL_SHIB))), 2)+" "+(percentIncrease(11401.40, Number(json.data.prices.latest)*Number(process.env.TOTAL_SHIB)) > 0 ? "Up" : "Down") + " from its original value");
	},
};

