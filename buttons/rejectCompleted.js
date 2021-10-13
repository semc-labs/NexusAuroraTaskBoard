const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Client } = require('pg')



module.exports.func = async function (interaction, bot) {
    try {
        let replacementMessage = interaction.message;

        let replaceMentEmbed = interaction.message.embeds[0];

        let replacementRow = interaction.message.components[0];

        replacementRow.components[0].disabled = true;
        replacementRow.components[1].disabled = true;

        await interaction.update({ components: [replacementRow] });

        const acceptEmbed = new MessageEmbed()
            .setTitle("Sorry! Your completed task has been rejected by "+interaction.user.username+" - "+replaceMentEmbed.fields[2].value)
            .setDescription("Thank you for trying to complete a task - We would love for you to try again!\nAfter you finish the task, hit complete and then DM the author your results :heart:")
            .addFields(
                { name: 'Description', value: replaceMentEmbed.fields[0].value },
                { name: 'Deadline', value: replaceMentEmbed.fields[1].value },
                { name: 'Skills Needed', value: replaceMentEmbed.fields[3].value, inline: true },
            )
            .setTimestamp()

        const acceptRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('complete')
                    .setLabel('Complete Task')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setURL(interaction.message.components[0].components[2].url)
                    .setLabel('DM Author')
                    .setStyle('LINK'),
            );

        await interaction.user.send({ embeds: [acceptEmbed], components: [acceptRow] });
    } catch (error) {
        console.log(error);
        await interaction.followUp({ content: 'Sorry, something when wrong. Try again in a few seconds', ephemeral: true });
    }
};

module.exports.customId = "rejectCompleted";
