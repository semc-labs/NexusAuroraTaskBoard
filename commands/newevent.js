const { SlashCommandBuilder } = require('@discordjs/builders');

async function getMessage(channel, followUp = "") {
	const filter = m => (m.author.id != "883786557369229322");
	let x = await channel.awaitMessages({ filter, max: 1, time: 60000 });
	if (followUp != "") { await channel.send(followUp) };
	return x.first().content	
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

