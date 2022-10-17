import Twit from 'twit';
import * as dotenv from 'dotenv';
dotenv.config();

const TwitClient = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

const postTweet = async (text, image) => {
  try {
    const mediaIdStr = (
      await TwitClient.post('media/upload', { media_data: image })
    ).data.media_id_string;

    const params = {
      status: text,
      media_ids: [mediaIdStr],
    };

    const { created_at, id, id_str } = (
      await TwitClient.post('statuses/update', params)
    ).data;

    return { createdAt: created_at, tweetId: id, tweetIdStr: id_str };
  } catch (error) {
    console.log('Error posting tweet\n', error);
  }
};

const createTweetStream = (accountName) => {
  const stream = TwitClient.stream('statuses/filter', { track: accountName });

  console.log(`Starting to stream tweets quoting ${accountName}`);

  return stream;
};

export { postTweet, createTweetStream };
