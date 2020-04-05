import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import fs from 'fs';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get( "/filteredimage", async ( req, res) => {

    let url = req.query.url;

    //check url is provided
    if(!url){
      return res.status(400).send({message: 'url is empty'});
    } 
    
    let filteredImagePath = '';

    try{
    filteredImagePath = await filterImageFromURL(url);
    console.log('filtered image: ' + filteredImagePath);
    res.status(200).sendFile(filteredImagePath);
    }
    catch (e) {
      // cacth error thrown from util.ts when processing image
      console.log('err', e);
      return res.status(400).send({'message': e});
    }

    //delete image path from tmp folder once response finished
    res.on("finish", () => {
      deleteLocalFiles([filteredImagePath]);
    })
  } );

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();