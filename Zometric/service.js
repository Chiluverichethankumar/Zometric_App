// service.js
import TrackPlayer from 'react-native-track-player';

module.exports = async function () {
  // keep empty for now; required so module works
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());
  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());
};
