// import { Telegraf } from "telegraf"
// import dotenv from 'dotenv';
// dotenv.config()


// const bot = new Telegraf(process.env.TG_TOKEN);

// let botUsername = '';

// bot.telegram.getMe().then((botInfo) => {
//   botUsername = botInfo.username.toLowerCase();
//   console.log(`🤖 Bot running as @${botUsername}`);
// });

// bot.start((ctx) => ctx.reply("Hello!, \n I am Chinweike's bot 😎"));

// // Respond to /help command
// bot.command('help', (ctx) => ctx.reply(`@${ctx.from.username}, How may i assist you today ?`));


// // Respond to any text message
// // bot.on('text', (ctx) => {
// //     const message = ctx.message.text;
// //     ctx.reply(`${ctx.from.username} You said: "${message}"`)
// // })

// // For bot to respond to group messages
// // bot.on('text', (ctx) => {
// //     const message = ctx.message.text.toLowerCase();

// //     if(message.includes('hello')){
// //         ctx.reply(`Hey @${ctx.from.username}, how are you today`)
// //     }

// //     if(message.includes('price')){
// //         ctx.reply(`Our Product prices start from $10`)
// //     }

// // });

// bot.on('text', (ctx) => {
//     const message = ctx.message.text.toLowerCase();
//     const mentioned = message.includes(`@${botUsername}`);;

//         if(message.includes('price')){
//         ctx.reply(`Our Product prices start from $10`)
//     }

//     if(mentioned){
//         const cleanMessage = message.replace(`@${botUsername}`, '').trim();

//         // Simple responses
//         if(cleanMessage.includes('hello') || cleanMessage.includes('hi')){
//             ctx.reply(`Hello ${ctx.from.username} 👋, I'm doing great!`);
//         }else if(cleanMessage.includes('how are you')) {
//       ctx.reply(`I'm just a bot, but I'm feeling awesome 🤖✨`);
//     } else {
//       ctx.reply(`Hey ${ctx.from.username}, you tagged me? How can I help?`);
//     }
//     }
// })
// bot.launch();
// console.log("Chinweike, your bot is running")


import { Telegraf } from "telegraf";
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.TG_TOKEN);

async function startBot() {
  const botInfo = await bot.telegram.getMe();
  const botUsername = botInfo.username.toLowerCase();

  console.log(`🤖 Bot running as @${botUsername}`);

  bot.start((ctx) => ctx.reply("Hello!, \nI am Chinweike's bot 😎"));

  bot.command('help', (ctx) => ctx.reply(`@${ctx.from.username}, how may I assist you today?`));

  bot.on('text', (ctx) => {
    const message = ctx.message.text.toLowerCase();
    const mentioned = message.includes(`@${botUsername}`);

    if (message.includes('price')) {
      ctx.reply(`Our Product prices start from $10 💵`);
    }

    if (mentioned) {
      const cleanMessage = message.replace(`@${botUsername}`, '').trim();

      if (cleanMessage.includes('hello') || cleanMessage.includes('hi')) {
        ctx.reply(`Hello @${ctx.from.username} 👋, I'm doing great!`);
      } else if (cleanMessage.includes('how are you')) {
        ctx.reply(`I'm Chinweike's bot. \n I'm feeling awesome 🤖✨`);
      } else {
        ctx.reply(`Hey @${ctx.from.username}, you tagged me? How can I help?`);
      }
    }
  });

  bot.launch();
  console.log("🚀 Chinweike, your bot is running...");
}

startBot();



