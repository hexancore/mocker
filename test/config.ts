process.on('unhandledRejection', (err) => {
  throw new Error(<string>err);
});
