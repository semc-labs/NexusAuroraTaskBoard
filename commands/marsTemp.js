const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

function formatNums(num,sep,dec,u){sep=sep||',';u=u||'\\d';if(typeof num!='string'){num=String(num);if(dec&&dec!='.')num=num.replace('.',dec);}return num.replace(RegExp('\\'+(dec||'.')+u+'+|'+u+'(?=(?:'+u+'{3})+(?!'+u+'))','g'),function(a){return a.length==1?a+sep:a})}


module.exports = {
        data: new SlashCommandBuilder().setName('marstemp').setDescription('Get temp on Mars'),
        async execute(interaction) {
        const response = await fetch("https://mars.nasa.gov/rss/api/?feed=weather&category=insight_temperature&feedtype=json&ver=1.0");
	    const json = await response.json();
		console.log(json.data);
		await interaction.reply("The High at Elysium Planitia, Mars is: **"+Object.values(json)[0].AT.mx.toString()+" Celcius**\nThe low is: **"+Object.values(json)[0].AT.mn.toString()+" Celcius** \n\n"+"*This is a forecast for **<t:"+new Date(Object.values(json)[0].First_UTC).valueOf() / 1000+":D>***");
	},
};

