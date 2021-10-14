const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Client } = require('pg')

module.exports.func = async function (interaction, bot) {
    try {
        let replacementRow = interaction.message.components[0];

        replacementRow.components[0].disabled = true;
        replacementRow.components[1].disabled = true;

        await interaction.update({ components: [replacementRow] });

        const client = new Client({
            user: process.env.PG_USER,
            host: process.env.PG_HOST, 
            database: 'postgres',
            password: process.env.PG_PASSWORD, 
            port: 5432,
        })
        client.connect()

        console.log

        client.query('DELETE FROM accepted_tasks WHERE title=$1 AND "skillsNeeded"=$2;', [interaction.message.embeds[0].fields[0].value, interaction.message.embeds[0].fields[1].value])
            .then(res => {
                client.query('INSERT INTO points(id,discordname,points_this_month,points) VALUES($1,$2,1,1) ON CONFLICT DO NOTHING', [interaction.message.components[0].components[2].url.split('/').reverse()[0], bot.users.cache.get(interaction.message.components[0].components[2].url.split('/').reverse()[0]).username])
                    .then(res => {
                        client.query("UPDATE points SET points = points + 1, points_this_month = points_this_month + 1 WHERE id = $1;", [interaction.message.components[0].components[2].url.split('/').reverse()[0]])
                    })
                    .catch(e => console.error(e.stack))
            })
            .catch(e => console.error(e.stack))

        bot.users.cache.get(interaction.message.components[0].components[2].url.split('/').reverse()[0]).send(interaction.user.username + " has accepted your completed task! Congratulations!");
        interaction.followUp("Task completed and finalized... adding points to users total");
	await client.end()
    } catch (error) {
        console.log(error);
	await client.end() 
        await interaction.followUp({ content: 'Sorry, something when wrong. Try again in a few seconds', ephemeral: true });
    }
};

module.exports.customId = "acceptCompleted";
