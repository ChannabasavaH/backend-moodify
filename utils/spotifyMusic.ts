import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

const refreshSpotifyToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    setTimeout(refreshSpotifyToken, (data.body['expires_in'] - 60) * 1000);
  } catch (error) {
    console.error("Error in refresh Spotify token: ", error);
  }
};

const shuffleArray = (array: any[]) => array.sort(() => Math.random() - 0.5);

export const searchPlaylistByMood = async (mood: string, limit: number = 5): Promise<any> => {
  try {
    const searchOptions: Record<string, string[]> = {
      'upbeat': ['happy upbeat positive', 'fun dance party', 'cheerful pop beats'],
      'melancholic': ['sad melancholy emotional', 'heartbreak moody', 'dark calm slow'],
      'intense': ['angry intense powerful', 'rock hard metal', 'epic cinematic aggressive'],
      'energetic': ['surprised energetic excited', 'high energy workout', 'powerful motivation'],
      'chill': ['relaxing chill calm', 'soft acoustic soothing', 'lofi study beats']
    };

    // Choose a random search query from available options
    const searchQueries = searchOptions[mood] || [mood];
    const searchQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];

    // Random offset for more variety in results
    const offset = Math.floor(Math.random() * 50);

    // Append timestamp to prevent caching (optional)
    const queryWithTimestamp = `${searchQuery} ${Date.now()}`;

    const response = await spotifyApi.searchPlaylists(queryWithTimestamp, { limit, offset });

    if (!response.body.playlists || !response.body.playlists.items) {
      console.log('Invalid response structure from Spotify:', response.body);
      return [];
    }

    return shuffleArray(response.body.playlists.items)
      .filter(playlist => playlist && playlist.id)
      .slice(0, limit) // Shuffle and select the top results
      .map(playlist => ({
        id: playlist.id,
        name: playlist.name || 'Unnamed Playlist',
        description: playlist.description ?? '',
        imageUrl: playlist.images?.[0]?.url || null,
        externalUrl: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`,
        tracks: playlist.tracks?.total || 0,
        embedUrl: `https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`
      }));

  } catch (error) {
    console.error("Error in searching playlists: ", error);
    return [];
  }
};

export const initSpotifyApi = () => {
  refreshSpotifyToken();
};
