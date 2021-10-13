const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Client } = require('pg')

module.exports.func = async function (interaction, bot) {
    try {

        let replacementRow = interaction.message.components[0];

        replacementRow.components[0].disabled = true;

        const completeEmbed = new MessageEmbed()
            .setTitle(interaction.user.username + " has completed one of your tasks!")
            .setDescription("User: " + interaction.user.username + ", has completed your task **(" + interaction.message.embeds[0].title.split("- ").reverse()[0] + ")**! Expect a DM\n\nOnce You get the completed task, click the button below if you think it is good!")
            .addFields(
                { name: 'Description', value: interaction.message.embeds[0].fields[0].value },
                { name: 'Deadline', value: interaction.message.embeds[0].fields[1].value },
                { name: "Task Name", value: interaction.message.embeds[0].title.split("- ").reverse()[0] },
                { name: "Skills Needed", value: interaction.message.embeds[0].fields[2].value }
            )
            .setTimestamp()

        await bot.users.cache.get("633434170596786186").createDM();

        const completeComponents = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('acceptCompleted')
                    .setLabel('Accept Completed Task')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('rejectCompleted')
                    .setLabel('Reject Completed Task')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setURL("https://discordapp.com/users/"+interaction.user.id.toString())
                    .setLabel('Contact User Doing Task')
                    .setStyle('LINK'),
            );

        bot.users.cache.get(interaction.message.components[0].components[1].url.split('/').reverse()[0]).send({ embeds: [completeEmbed], components: [completeComponents] });

        interaction.update({ embeds: [interaction.message.embeds[0]], components: [replacementRow] })

        await interaction.followUp({ content: 'Task Completed! Please dm the author now' });

        console.log(interaction.message);

    } catch (error) {
        console.log(error);
        await interaction.reply({ content: 'Sorry, something when wrong. Try again in a few seconds', ephemeral: true });
    }
};

module.exports.customId = "complete";
