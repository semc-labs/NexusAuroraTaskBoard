const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client } = require('pg')

async function getMessage(channel, followUp = "") {
	const filter = m => (m.author.id != "883786557369229322");
	let x = await channel.awaitMessages({ filter, max: 1, time: 60000 });
	if (followUp != "") { await channel.send(followUp) };
	return x.first().content	
}

function createWeekEpoch(date) {
	startOfWeek = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - date.getUTCDay(), 0, 0, 0))
	
	return date.valueOf() - startOfWeek.valueOf()
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-event')
		.setDescription('Begin event creation'),
	async execute(interaction) {
		// Get Message Object
		let message = await interaction.user.send("Beginning Event Creation\n**Meeting Name:**");		 
		let channel = message.channel;
		let guild = message.client.guilds.cache.get(process.env.guildId);
		console.log(channel)
		// Alert User
		await interaction.reply({content:'Event Creation Has Begun. Check DMs: https://discord.com/channels/@me/'+message.channel.id, ephemeral:true});

		let name = await getMessage(channel, "**Meeting Description:**");
		let description = await getMessage(channel, "**Date and Time**\nUse Format YYYY-MM-DD HH:MM (UTC)");
		let time = await getMessage(channel)
		time = new Date(time+"Z");
		if (isNaN(time.getTime())) {
			await channel.send("Please Put in a Valid Date\n"+"**Date and Time**\nUse Format YYYY-MM-DD HH:MM (UTC)")
			time = await getMessage(channel)                             
            time = new Date(time+"Z");
		}

		let weekEpochTime =  createWeekEpoch(time);

		await channel.send("Should the meeting repeat? (Yes or No)")
		let shouldRepeat = await getMessage(channel);
		if ( shouldRepeat.toLowerCase() == "yes" ) {
			await channel.send("Ok! Setting to repeat once a week")

			const clientx = new Client({
                user: process.env.PG_USER,
                host: process.env.PG_HOST,
                database: 'postgres',
                password: process.env.PG_PASSWORD, 
                port: 5432,
        	})
       		clientx.connect()

			await clientx.query('INSERT INTO repeating_meetings(name,description,"startTime",last_updated) VALUES($1,$2,$3,$4)', [name, description, weekEpochTime, time.valueOf()])
		} else {
			await channel.send("Ok, I will not repeat this meeting.")
		}

		await channel.send("Meeting Created!")
		let options = {
			name: name, 
			scheduledStartTime: time,
			description: description,
			channel: message.client.channels.cache.get(process.env.voiceId),
			privacyLevel: 2,
			entityType: "VOICE"
		}
		let event = await guild.scheduledEvents.create(options);
		await message.client.channels.cache.get(process.env.eventChannelId).send(await event.createInviteURL());
	},
};

