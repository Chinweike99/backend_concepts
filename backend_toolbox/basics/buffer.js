const buffer = Buffer.from("Hello")
console.log(buffer);
console.log(buffer.toString());
console.log(buffer[0]);
console.log(buffer[4]);

 console.log("INTERMEDIATE")

const intermediate = Buffer.alloc(4);
const firstIntermediate = intermediate.writeUInt8(0x1f, 0); // Write 8-bit unsigned int at position 0
const secondIntermediate = intermediate.writeUInt16BE(0x1234, 1); // Write 16-bit BE integer at position 1
console.log(firstIntermediate);
console.log(secondIntermediate);
console.log(intermediate);


import fs from 'fs';



// fs.readFile('image.png', (err, data) => {
//   if (err) throw err;

//   console.log('Buffer size:', data.length);
//   console.log('First 10 bytes:', data.slice(0, 10)); // Shows raw bytes

//   // Convert to base64 if needed
//   const base64Image = data.toString('base64');
//   console.log(base64Image.substring(0, 100) + '...');
// });
