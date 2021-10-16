const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Client } = require('pg')



module.exports.func = async function (interaction, bot) {
    try {
        
        await interaction.reply({ content: 'Task Accepted!', ephemeral: true });
        let replacementMessage = interaction.message;

        let replaceMentEmbed = interaction.message.embeds[0];

        const client = new Client({
            user: process.env.PG_USER, 
            host: process.env.PG_HOST,
            database: 'postgres',
            password: process.env.PG_PASSWORD,
            port: 5432,
        })
        client.connect()

	try {
        	await client.query('INSERT into accepted_tasks(title, username, profilepic, description, deadline, "skillsNeeded", provider_id, "acceptedBy") VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *;', [replaceMentEmbed.title, replaceMentEmbed.author.name, replaceMentEmbed.author.iconURL, replaceMentEmbed.description, replaceMentEmbed.fields[0].value.slice(3, -3), replaceMentEmbed.fields[1].value, replaceMentEmbed.author.url.split('/').reverse()[0], interaction.user.id])
        	await client.query('DELETE FROM tasks WHERE title=$1 AND username=$2;', [replaceMentEmbed.title, replaceMentEmbed.author.name]);
	} catch {
		interaction.reply({ephemeral: true, content: "Something went wrong!"}); 
		return false;
	}
        let replacementRow = interaction.message.components[0];
        replaceMentEmbed.addField("Accepted By", interaction.user.username + "#" + interaction.user.discriminator)

        replacementRow.components[0].disabled = true;
        interaction.message.thread.members.add(interaction.user.id);
        interaction.message.edit({ embeds: [replaceMentEmbed], components: [replacementRow] });

        const acceptEmbed = new MessageEmbed()
            .setTitle("You have accepted a task - " + replaceMentEmbed.title)
            .setDescription("Thank you for accepting a task!\nAfter you finish the task, hit complete and then DM the author your results :heart:")
            .addFields(
                { name: 'Description', value: replaceMentEmbed.description },
                { name: 'Deadline', value: replaceMentEmbed.fields[0].value },
                { name: 'Skills Needed', value: replaceMentEmbed.fields[1].value, inline: true },
            )
            .setTimestamp()

        const notifyEmbed = new MessageEmbed()
            .setTitle(interaction.user.username + " Has accepted your task - " + replaceMentEmbed.title)
            .setDescription("You will get a notification when they complete this task!")
            .addFields(
                { name: 'Description', value: replaceMentEmbed.description },
                { name: 'Deadline', value: replaceMentEmbed.fields[0].value },
                { name: 'Skills Needed', value: replaceMentEmbed.fields[1].value, inline: true },
            )
            .setTimestamp()

        const acceptRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('complete')
                    .setLabel('Complete Task')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setURL("https://discordapp.com/users/"+replaceMentEmbed.author.url.split('/').reverse()[0])
                    .setLabel('DM Author')
                    .setStyle('LINK'),
            );

        await interaction.user.send({ embeds: [acceptEmbed], components: [acceptRow] });
        bot.users.cache.get(replaceMentEmbed.author.url.split('/').reverse()[0]).send({ embeds: [notifyEmbed] });
    await client.end()
    } catch (error) {
	await client.end();
        console.log(error);
        await interaction.reply({ content: 'Sorry, something when wrong. Try again in a few seconds', ephemeral: true });
    }
};

module.exports.customId = "accept";
