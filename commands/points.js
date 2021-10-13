const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client } = require('pg')

async function getPoints(user, month) {
        const clientx = new Client({
                user: process.env.PG_USER,
                host: process.env.PG_HOST,
                database: 'postgres',
                password: process.env.PG_PASSWORD, 
                port: 5432,
        })
        clientx.connect()

        const points = await clientx.query('SELECT * FROM points WHERE id=$1;', [user]);
        clientx.end()

        if (points.rows[0] == null) {
                return 0;
        }

        if (!month) {
                return points.rows[0].points;
        } else {
                return points.rows[0].points_this_month;
        }
        
}
module.exports = {
        data: new SlashCommandBuilder().setName('points').setDescription('Get points')
                .addUserOption(option =>
                        option.setName("user")
                                .setDescription("User to get points for")
                                .setRequired(false))
                .addBooleanOption(option => option.setName('month').setDescription('Only for this month?')),
        async execute(interaction) {
                const user = interaction.options.getUser('user');
                let month = interaction.options.getBoolean("month");
                if (month === null) {
                        month = false;
                }
                if (user === null) {
                        await interaction.reply(interaction.user.toString() + " has **" + await getPoints(interaction.user.id, month) + (month ? "** points this month" : "** points in total"));
                } else {
                        await interaction.reply(user.toString() + " has **" + await getPoints(user.id, month) + (month ? "** points this month" : "** points in total"));
                }
        },
};

