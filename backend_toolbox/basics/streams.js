import fs from 'fs'
import { Transform } from 'stream';
import http from 'http';
import { Readable } from 'node:stream';
import zlib from 'zlib'


// Reading a file with streams
/*
const stream = fs.createReadStream('large.txt', { encoding: 'utf8'});

stream.on('data', chunk => {
    console.log('New chunk recieved: ');
    console.log(chunk);
});

stream.on('end', ()=> {
    console.log("Finished reading file");
});
*/




//2.. Writing a file with streams
/* const writeStreams = fs.createWriteStream("write.txt");
// writeStreams.write("Hello,\n");
// writeStreams.write("Welcome\n")
*/


//3.. Piping streams (Read => write)
/*const readStream = fs.createReadStream("large.txt");
const writeStream = fs.createWriteStream("copied.txt");

readStream.pipe(writeStream);
*/


//4.. Transform stream 
/*const transformToUppercase = new Transform({
    transform(chunk, encoding, callback){
        const upper = chunk.toString().toUpperCase();
        callback(null, upper)
    }
});
process.stdin.pipe(transformToUppercase).pipe(process.stdout);
*/


//5.. Streaming an HTTP response
/**
 * Instead of loading the full file in memory, we stream it directly to the client.
Great for large media files and APIs returning massive logs, data exports, etc.
 
http.createServer((req, res) => {
    const stream = fs.createReadStream('bigfile.mp4');

    res.writeHead(200, {'Content-Type': 'video/mp4'});
    stream.pipe(res);
}).listen(3000, () => console.log("Server running on port http://localhost:3000"))
*/

// 6..
// class MyStream extends Readable {
//     #count = 0;
//     _read(){
//         this.push(':-)');
//         if(++this.#count === 5){
//             this.push(null);
//         }
//     }
// }

// const stream = new MyStream();
// stream.on('data', chunk => {
//     console.log(chunk.toString());
// })


const readStream = fs.createReadStream('copied.txt');
const gzip = zlib.createGzip();
const writeStream = fs.createWriteStream('copied.txt.gz');
// readStream.pipe(gzip).pipe(writeStream);


readStream.pipe(gzip).pipe(writeStream).on('finish', ()=> {
    const unzip = zlib.createGunzip();
    const readCompressed = fs.createReadStream('copied.txt.gz');
    const newzip = fs.createWriteStream('newfile.txt');

    readCompressed.pipe(unzip).pipe(newzip);
})




