module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native(?:-community)?/|@react-native-async-storage/|react-native(?:-safe-area-context|-svg)?/))',
  ],
};
