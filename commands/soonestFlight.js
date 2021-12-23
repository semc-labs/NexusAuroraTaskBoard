const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

function formatNums(num, sep, dec, u) { sep = sep || ','; u = u || '\\d'; if (typeof num != 'string') { num = String(num); if (dec && dec != '.') num = num.replace('.', dec); } return num.replace(RegExp('\\' + (dec || '.') + u + '+|' + u + '(?=(?:' + u + '{3})+(?!' + u + '))', 'g'), function (a) { return a.length == 1 ? a + sep : a }) }

module.exports = {
	data: new SlashCommandBuilder().setName('soonestflight').setDescription('Get soonest space flight'),
	async execute(interaction) {
		let cache = JSON.parse(fs.readFileSync("./lastLaunch.json", { encoding: 'utf8', flag: 'r' }));
		let needsToCache = false;
		let json = {};
		let response = {};
		if (Number(new Date().valueOf()) / 1000 - Number(cache.timeCached) >= 300) {
			response = await fetch("https://ll.thespacedevs.com/2.2.0/launch/upcoming/");
			json = await response.json();
			needsToCache = true;
		}

		let found = false;

		console.log("??")

		if (needsToCache) {
			for (let i in json.results) {
				const launch = json.results[i];
				if (!found) {
					let launch_service_provider = await fetch(launch.launch_service_provider.url);
					launch_service_provider = await launch_service_provider.json();

					if (launch.status.name == "Go for Launch") {
						if (needsToCache) {
							cache.name = launch.name;
							cache.image = launch.image;
							cache.organizationLogo = launch_service_provider.logo_url;
							cache.description = launch.mission.description;
							cache.timeCached = Number(new Date().valueOf()) / 1000;
							cache.orginizationName = launch_service_provider.name;
							fs.writeFileSync("./lastLaunch.json", JSON.stringify(cache, null, 4));
						}

						const exampleEmbed = new MessageEmbed()
							.setTitle(cache.name)
							.setAuthor(cache.orginizationName, cache.organizationLogo.replace("ll", "lldev"))
							.setDescription(cache.description)
							.setThumbnail(cache.image)
							.setTimestamp()

						// .setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png');

						await interaction.reply({ embeds: [exampleEmbed] });

						found = true;
					}
				}

			}
		} else {
			const exampleEmbed = new MessageEmbed()
				.setTitle(cache.name)
				.setAuthor(cache.orginizationName, cache.organizationLogo.replace("ll", "lldev"))
				.setDescription(cache.description)
				.setThumbnail(cache.image)
				.setTimestamp()

			// .setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png');

			await interaction.reply({ embeds: [exampleEmbed] });
		}
	},
};

