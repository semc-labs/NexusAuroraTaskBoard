const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Client } = require('pg')

module.exports.func = async function (interaction, bot) {
    try {
	if (interaction.user.id == interaction.message.embeds[0].author.url.split("/").reverse()[0]) {
    const clientx = new Client({
        user: process.env.PG_USER,
        host: process.env.PG_HOST, 
        database: 'postgres',
        password: process.env.PG_PASSWORD, 
        port: 5432,
    })
        	await clientx.connect()
		interaction.reply({ephemeral: true, content: "Task Deleted! ):"});
		try {	
		await clientx.query('DELETE FROM accepted_tasks WHERE title=$1 AND provider_id=$2;', [interaction.message.embeds[0].title, interaction.user.id])
		
		await clientx.query('DELETE FROM tasks WHERE title=$1 AND provider_id=$2 RETURNING *;', [interaction.message.embeds[0].title, interaction.user.id]);
		} catch {
			interaction.reply({ephemeral: true, content: "Something went wrong!"}); 
			return false;
		}
		await interaction.message.thread.setArchived(true);
		await interaction.message.delete()
		await clientx.end()
	}
	await interaction.reply({ephemeral: true, content: "You can't do that!"});
    } catch (error) {
	console.log(error, "wtf hi");
        await interaction.reply({ content: 'Sorry, something when wrong. Try again in a few seconds', ephemeral: true });
    }
};

module.exports.customId = "delete";
