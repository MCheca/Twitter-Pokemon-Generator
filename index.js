import translate from 'translate-google';
import * as dotenv from 'dotenv';
dotenv.config();

import { connectDB, getUserDailyTweets } from './db.js';
import { postTweet, createTweetStream } from './twitter.js';
import { generateImage } from './images.js';

const main = async () => {
  const accountName = process.env.ACCOUNT_USERNAME;

  const dbCollection = await connectDB();

  const stream = createTweetStream(accountName);

  stream.on('tweet', async (tweet) => {
    try {
      const userId = tweet.user.id.toString();

      const userTweetsToday = await getUserDailyTweets(dbCollection, userId);

      if (userTweetsToday < 3) {
        let tweetData = {
          createdAt: new Date(tweet.created_at),
          tweetId: tweet.id.toString(),
          tweetIdStr: tweet.id_str,
          text: tweet.text.replaceAll(`${accountName}`, ''),
          user: {
            userId,
            userScreenName: tweet.user.screen_name,
          },
        };

        const originalImage = await generateResponse(
          tweetData.text,
          tweetData.user.userScreenName
        );

        tweetData = {
          ...tweetData,
          originalImage,
        };

        await dbCollection.insertOne(tweetData);
      }
    } catch (error) {
      console.log('Error processing tweet\n', error);
    }
  });
};

const generateResponse = async (prompt, user) => {
  const translatedPrompt = await translate(prompt, {
    to: 'en',
  });

  const { parsedImage, originalImage } = await generateImage(translatedPrompt);

  const tweetInfo = await postTweet(
    `${prompt}\n\n🤖 Prompt by @${user}`,
    parsedImage
  );

  return originalImage;
};

main();
