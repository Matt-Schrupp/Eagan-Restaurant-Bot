
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());


var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

var intents = new builder.IntentDialog({ recognizers: [recognizer] });
// bot.dialog('/', intents);

intents.matches('RestaurantMenu', builder.DialogAction.beginDialog('/RestaurantMenu'));
intents.matches('MakeReservation', builder.DialogAction.beginDialog('/MakeReservation'));


bot.dialog('/RestaurantMenu', [
    (session, results, next) => {
      var card = new builder.ThumbnailCard(session)
            .title("EcoBot")
            .text("Here's a few things I can do:")
            .buttons([
                builder.CardAction.imBack(session, "View Restaurant types", "View Restaurant types"),
                builder.CardAction.imBack(session, "List Restaurants", "List Restaurants"),
                builder.CardAction.imBack(session, "Make dinner reservation", "Make dinner reservation"),
            ]);
            var message = new builder.Message(session)
            .addAttachment(card);
            session.endConversation(message);

        // builder.Prompts.choice(session, "Here are a few things I can do", [
        //     "View Restaurant types", 
        //     "Get list of restaurants",
        //     "Make dinner reservation",
        // ], { 
        //     listStyle: builder.ListStyle.button 
        // });
    // (session, results, next) => {
    //     if (results.response.entity === "View Restaurant types") {
            
        // builder.Prompts.choice(session, "Here is a list of restaurant types:", [
        //     "Fast Food Restaurants", 
        //     "Italian Restaurants",
        //     "Fancy Restaurants",
        // ], { 
        //     listStyle: builder.ListStyle.button 
        // });
            
//          session.send("This is the Restaurant Types");
//         } else if  (results.response.entity === "List Restaurants") {
//             // builder.CardAction.imBack(session, "Mcdonald's","Mcdonalds"),
//             // builder.CardAction.imBack(session, "Olive Garden","Olive Garden"),
//             // builder.CardAction.imBack(session, "China King Buffet","China King Buffet"),
//             // builder.CardAction.imBack(session, "Jensen's","Jensen's"),
//             
//             session.send("this is the List of Restaurants");
//          } else if (results.response.entity === "Make dinner reservation") {
//              session.replaceDialog('/MakeReservation');
//        
//         }
//         else session.send("This is the end.");
//     }
    }
]).triggerAction({
    matches: "RestaurantMenu",
}
);

var inMemoryStorage = new builder.MemoryBotStorage();


//  bot.dialog('MakeReservationDialog', [
//    (session, results, next) => {
//        session.send("hello! Your test succeeded!");
//    new bot = new  builder.UniversalBot(connector, [
//     function (session) {
//         session.send("Welcome to the dinner reservation.");
//         builder.Prompts.time(session, "Please provide a reservation date and time (e.g.: June 6th at 5pm)");
//         next();
//     },
//     function (session, results) {
//         session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
//         builder.Prompts.text(session, "How many people are in your party?");
//         next();
//     },
//     function (session, results) {
//         session.dialogData.partySize = results.response;
//         builder.Prompts.text(session, "Whose name will this reservation be under?");
//         next();
//     },
//     function (session, results) {
//         session.dialogData.reservationName = results.response;
// 
//         session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
//         session.endDialog();
//     }
// ]).set('storage', inMemoryStorage) // Register in-memory storage 
//   }
//  ]).triggerAction({
//      matches: "MakeReservation",
// 
//  });  
    

bot.dialog('GreetingDialog',
    (session) => {
        session.send('Hello! I am the Eagan Restaurant Bot. How may I help you?', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Greeting',
});

bot.dialog('HelpDialog',
    (session) => {
        session.send('Oh, So you want help huh?', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Help'
});

bot.dialog('CancelDialog',
    (session) => {
        session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
});

bot.dialog('ViewRestaurantsDialog',
    (session) => {
        var card = new builder.ThumbnailCard(session)
            .title("EcoBot")
            .text("Here's a few things I can do:")
            .buttons([
            builder.CardAction.imBack(session, "Mcdonald's","Mcdonalds"),
            builder.CardAction.imBack(session, "Olive Garden","Olive Garden"),
            builder.CardAction.imBack(session, "China King Buffet","China King Buffet"),
            builder.CardAction.imBack(session, "Jensen's","Jensen's"),
            ]);
            var message = new builder.Message(session)
            .addAttachment(card);
            session.endConversation(message);
    }
 ).triggerAction({
 matches: 'ViewRestaurant'
});
    

