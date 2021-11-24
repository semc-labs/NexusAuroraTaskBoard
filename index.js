// Require the necessary discord.js classes
const { Client, Collection, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const clientId = process.env.clientId;
const token = process.env.token;
const taskChannelId = process.env.taskChannelId;
const guildId = process.env.guildId;

const { createClient } = require('@supabase/supabase-js');
const fs = require("fs");
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
const buttons = {};

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS] });
client.commands = new Collection();

var supabase = createClient('https://yrwzfuhdwmsygfksjrwi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjg3ODY2MiwiZXhwIjoxOTQ4NDU0NjYyfQ.dlRgknRLgXl57xNrgcKO1_DpXI3JD3w7fUVV0y-1sxw')

const tweets = supabase
        .from('tweets')
        .on('INSERT', async function (payload) {
		const embed = new MessageEmbed()
			.setAuthor("Nexus Aurora One Time Tweet Portal")
                        .setTitle("Do you like this tweet?")
                        .setDescription(payload.new.body)
                        .setTimestamp()
		const row = new MessageActionRow()
                        .addComponents(
                        	new MessageButton()
                                	.setCustomId('acceptTweet')
                                        .setLabel('Accept')
                                        .setStyle('PRIMARY'));

		client.users.cache.get(process.env.TO_DM).send({ embeds: [embed], components: [row] })
	})
	.subscribe()

const subscription = supabase
	.from('tasks')
	.on('INSERT', async function (payload) {
		let guild = client.guilds.cache.get(guildId);
		let member = guild.members.cache.get(payload.new.provider_id);

		if (!member.roles.cache.some(role => role.name === 'Council')) {
			client.users.cache.get(payload.new.provider_id).send("Hey! You aren't Council");
			return 'Not council';
		}


		const channel = client.channels.cache.get(taskChannelId);
		const exampleEmbed = new MessageEmbed()
			.setTitle(payload.new.title)
			.setAuthor(payload.new.username, payload.new.profilepic, "https://discordapp.com/users/"+payload.new.provider_id.toString())
			.setDescription(payload.new.description)
			.addFields(
				{ name: 'Deadline', value: '<t:' + payload.new.deadline.toString() + ':R>' },
				{ name: 'Skills Needed', value: payload.new.skillsNeeded, inline: true },
			)
			.setTimestamp()

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('accept')
					.setLabel('Accept')
					.setStyle('PRIMARY'),
				new MessageButton()
                                        .setCustomId('delete')
                                        .setLabel('Delete')
                                        .setStyle('DANGER'),
			);

		const message = await channel.send({ embeds: [exampleEmbed], components: [row] });
		const thread = await message.startThread({
			name: payload.new.title,
			autoArchiveDuration: 1440,
		});
		thread.members.add(payload.new.provider_id);
	})
	.subscribe()

// When the client is ready, run this code (only once)
client.once('ready', async function () {
	client.user.setStatus('idle');
	client.user.setActivity('people do tasks', { type: 'WATCHING' });
	console.log('Ready!');
	
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.data.name, command);
		commands.push(command.data.toJSON());
	}

	for (const file of buttonFiles) {
		const button = require(`./buttons/${file}`);
		buttons[button.customId] = button.func;
	}
});

client.on('interactionCreate', async interaction => {
	try {
		if (interaction.isButton()) {

			await buttons[interaction.customId](interaction, client);
		}
	} catch (error) {
		console.log("Error: " + error);
	}

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login to Discord with your client's token
client.login(token);

