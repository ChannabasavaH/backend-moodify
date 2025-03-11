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
        console.error("Error in refresh spotify token: ", error);
    }
}

export const searchPlaylistByMood = async (mood: string, limit: number = 5): Promise<any> => {
    try {
        const searchItems: Record<string, string> = {
            'upbeat': 'happy upbeat positive',
            'melancholic': 'sad melancholy emotional',
            'intense': 'angry intense powerful',
            'energetic': 'surprised energetic excited',
            'chill': 'relaxing chill calm'
        }

        const searchQuery = searchItems[mood] || mood;
        const response = await spotifyApi.searchPlaylists(searchQuery, { limit });

        if (!response.body.playlists || !response.body.playlists.items) {
            console.log('Invalid response structure from Spotify:', response.body);
            return [];
        }

        return response.body.playlists.items
      .filter(playlist => playlist !== null)
      .map(playlist => {
        // Make sure we have a valid playlist object
        if (!playlist || typeof playlist !== 'object') {
          return null;
        }
        
        try {
          return {
            id: playlist.id,
            name: playlist.name || 'Unnamed Playlist',
            description: playlist.description ?? '',
            imageUrl: playlist.images && playlist.images.length > 0 ? playlist.images[0].url : null,
            externalUrl: playlist.external_urls && playlist.external_urls.spotify ? 
              playlist.external_urls.spotify : `https://open.spotify.com/playlist/${playlist.id}`,
            tracks: playlist.tracks && typeof playlist.tracks.total === 'number' ? 
              playlist.tracks.total : 0,
            embedUrl: `https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`
          };
        } catch (err) {
          console.error('Error processing playlist item:', err);
          return null;
        }
      })
      .filter(Boolean); 
    } catch (error) {
        console.error("Error in searching playlists: ", error);
        return [];
    }
};

export const initSpotifyApi = () => {
    refreshSpotifyToken();
}