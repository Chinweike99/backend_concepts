import ollama from 'ollama';

const resp = await ollama.chat({
    model: "llama3.2",
    messages: [{ role: 'user', content: 'Write me a story on why the sky is blue'}]
});

console.log("Response: ", resp.messages.content);



// const stream = await ollama.chat({
//   model: 'llama3.2',
//   messages: [{ role:'user', content:'Tell me a short joke' }],
//   stream: true
// })
// for await (const part of stream) {
//   process.stdout.write(part.message.content)
// }
