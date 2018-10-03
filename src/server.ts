import express from 'express';
import path from 'path';
import process from 'process';

var app = express();

var port = process.env.PORT || '3000';
let staticPath:string = path.join(__dirname, 'web')
app.use(express.static(staticPath));
console.log(`Static files being loaded from here: ${staticPath}`)

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});



