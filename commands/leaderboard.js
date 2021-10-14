const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client } = require('pg')

async function getPoints(month) {
    const clientx = new Client({
        user: process.env.PG_USER,
        host: process.env.PG_HOST, 
        database: 'postgres',
        password: process.env.PG_PASSWORD, 
        port: 5432,
    })
    clientx.connect()

    const newEmbed = new MessageEmbed()
        .setTitle("All Time Points Leaderboard")
        .setDescription("Leaderboard of task points in Nexus Aurora")
        .setTimestamp()

    let points = await clientx.query('SELECT * FROM points ORDER BY points desc');
    points = points.rows.slice(0, 10);

    for (user in points) {
        let end = "s";
        if (Number((month ? points[user].points_this_month.toString() : points[user].points.toString())) == 1) {
            end="";
        }
        newEmbed.addField(points[user].discordname, (month ? points[user].points_this_month.toString() : points[user].points.toString()) + (month ? " Point"+end+" this month" : " All Time Point"+end));
    }

    clientx.end()

    

    console.log(points);

    

    return newEmbed;
}
module.exports = {
    data: new SlashCommandBuilder().setName('leaderboard').setDescription('Get points leaderboard')
        .addBooleanOption(option => option.setName('month').setDescription('Only for this month?')),
    async execute(interaction) {
        let month = interaction.options.getBoolean("month");
        if (month === null) {
            month = false;
        }
        await interaction.reply({ embeds: [await getPoints(month)] })
    },
};

