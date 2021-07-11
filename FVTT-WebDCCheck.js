//Performs Dexterity and Strength checks for the Web spell (or others like it)
//Prompts for the caster's Spell DC (default is 13, from the Cloak of Arachnida)
//Prompts if Dex save fails to use the creatures action to perform the Strength save
//Toggles the Net condition based on success/failure
// Requires Combat Utility Belt (CUB)
function togglenet(maybe) {
    let condition = "Net";
    if (maybe) {
        game.cub.addCondition(condition);
    } else {
        if (game.cub.hasCondition(condition)) {
            game.cub.removeCondition(condition);
        }
    }
}

let spellDC = await Dialog.prompt({
  title: 'Spell DC',
  content: `<input type="text" value="13">`,
  callback: (html) => html.find('input').val() 
});

let actors = canvas.tokens.controlled.map(({ actor }) => actor);
let messageContent = 'Spell DC is ' + spellDC;
const validActors = actors.filter(actor => actor != null);
for (const selectedActor of validActors) {
  const dexMod = selectedActor.data.data.abilities.dex.mod; // dex mod
  const dexRoll = new Roll("1d20 + @dexMod", {dexMod: dexMod}).roll(); // rolling the formula
  const dexCheck = dexRoll.total;
  messageContent += `<hr>${selectedActor.name} Dexterity roll was a <b>${dexCheck}</b> (${dexRoll.result}).`; // creating the output string
  
  if (dexCheck >= spellDC) {
      messageContent += `<hr>${selectedActor.name} nimbly steps through the webs!`; // creating the output string
      togglenet(false);
  } else {
      messageContent += `<hr>${selectedActor.name} is stuck in the webs!`; // creating the output string
      togglenet(true);
      let confirmation = await Dialog.confirm({
          title: 'Dex Check Failed',
          content: `<p>Dex check failed, use action for Str check?</p>`,
      });
      if (confirmation) {
          const strMod = selectedActor.data.data.abilities.str.mod; // str mod
          const strRoll = new Roll("1d20 + @strMod", {strMod: strMod}).roll();
          const strCheck = strRoll.total; // rolling the formula
          messageContent += `<hr>${selectedActor.name} Strength roll was a <b>${strCheck}</b> (${strRoll.result}).`; // creating the output string
          if (strCheck >= spellDC) {
              togglenet(false);
              messageContent += `<hr>${selectedActor.name} gets caught, but tears through the webs with raw strength!`; // creating the output string
          } else {
              messageContent += `<hr>${selectedActor.name} struggles to break free of the webs!`; // creating the output string
          }
      } else {
          togglenet(true);
      }
  }
}
  
  // create the message
const chatData = {
  user: game.user.data._id,
  speaker: game.user,
  content: messageContent,
  whisper: game.users.contents.filter((u) => u.isGM).map((u) => u.data._id),
};
ChatMessage.create(chatData, {});
