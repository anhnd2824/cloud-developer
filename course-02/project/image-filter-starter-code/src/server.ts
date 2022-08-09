import express, { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, isValidURL } from './util/util';
import { url } from 'inspector';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  app.get("/filteredimage/", async (req: Request, res: Response) => {
    // IT SHOULD
    //    1. validate the image_url query
    let { image_url } : { image_url: string } = req.query;

    if (!image_url) {
      return res.status(400)
        .send(`image_url is required`);
    }

    if (isValidURL(image_url) == false) {
      return res.status(400)
        .send(`image_url is invalid`);
    }

    //    2. call filterImageFromURL(image_url) to filter the image
    let filteredpath = await filterImageFromURL(image_url);

    //    3. send the resulting file in the response
    res.sendFile(filteredpath);

    //    4. deletes any files on the server on finish of the response
    res.on('finish', () => deleteLocalFiles([filteredpath]));
  });

  /**************************************************************************** */

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();