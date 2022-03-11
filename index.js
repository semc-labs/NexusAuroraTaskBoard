// Require the necessary discord.js classes
const { Client, Collection, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');


var cron = require('node-cron');

function createWeekEpoch(date) {
	startOfWeek = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - date.getUTCDay(), 0, 0, 0))

	return date.valueOf() - startOfWeek.valueOf()
}

function weekStart(date) {
	startOfWeek = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - date.getUTCDay(), 0, 0, 0))

	return startOfWeek.valueOf()
}

// Run the function to check for upcoming meetings every five minutes
cron.schedule('*/5 * * * *', async () => {
	const { Client } = require('pg')
	// Create Postgres Client With Env Variables
	const clientx = new Client({
		user: process.env.PG_USER,
		host: process.env.PG_HOST,
		database: 'postgres',
		password: process.env.PG_PASSWORD,
		port: 5432,
	})
	clientx.connect()
	let res = await clientx.query("SELECT * FROM repeating_meetings"); // Get all repeating meetings
	let meetings = res.rows; // Get rows in table
	let guild = await client.guilds.cache.get(process.env.guildId); // Get guild from guildId

	// Loop through meetings
	for (meeting in meetings) {
		meeting = meetings[meeting];
		if (new Date(Date.now()).valueOf() - Number(meeting.last_updated) >= (24 * 4 * 60 * 60 * 1000)) { // Check if it was updated more than 4 days ago
			if (Number(meeting.startTime) - createWeekEpoch(new Date(Date.now())) <= (259200000) && Math.abs(Number(meeting.startTime) - createWeekEpoch(new Date(Date.now()))) == Number(meeting.startTime) - createWeekEpoch(new Date(Date.now()))) { // Check if it is within 3 days from now
				try {
					let options = {
						name: meeting.name,
						scheduledStartTime: new Date(weekStart(new Date(Date.now())) + Number(meeting.startTime)),
						description: meeting.description,
						channel: client.channels.cache.get(process.env.voiceId),
						privacyLevel: 2,
						entityType: "VOICE"
					}
					console.log(options)

					let event = await guild.scheduledEvents.create(options).catch(e => console.log(e));

					await client.channels.cache.get(process.env.eventChannelId).send(await event.createInviteURL());
					res = await clientx.query("UPDATE repeating_meetings SET last_updated = $1 WHERE id = $2", [Date.now(), meeting.id]);
					console.log(res.err)
				} catch (err) {
					console.log(err)
				}
			}
		}
	}
	clientx.end();
});

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
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();

var supabase = createClient('https://yrwzfuhdwmsygfksjrwi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjg3ODY2MiwiZXhwIjoxOTQ4NDU0NjYyfQ.dlRgknRLgXl57xNrgcKO1_DpXI3JD3w7fUVV0y-1sxw');

client.on("messageCreate", async function (message) {
	if (message.channel.id == "951658616807637073") {
		const request = await fetch(process.env.topicLink, {
			method: "post",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},

			//make sure to serialize your JSON body
			body: JSON.stringify({
				key: process.env.topicApiKey,
				topic: message.content.split("|")[0].trim()
			})
		});
		console.log(request.status);
		console.log(await request.text())
	}
})

const tweets = supabase
	.from('tweets')
	.on('INSERT', async function (payload) {
		console.log("THIS SHOULD WORK WDYM")
		console.log(payload.new);
		console.log(process.env.TO_DM);
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
		console.log(payload.new)
		let guild = client.guilds.cache.get(guildId);
		let member = guild.members.cache.get(payload.new.provider_id);

		if (!member.roles.cache.some(role => role.name === 'Council')) {
			client.users.cache.get(payload.new.provider_id).send("Hey! You aren't Council");
			return 'Not council';
		}


		const channel = client.channels.cache.get(taskChannelId);
		const exampleEmbed = new MessageEmbed()
			.setTitle(payload.new.title)
			.setAuthor(payload.new.username, payload.new.profilepic, "https://discordapp.com/users/" + payload.new.provider_id.toString())
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

