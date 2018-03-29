export default function callAsync(method) {
  return new Promise((resolve, reject) => {
    method((error, result) => {
      if (error) {
        return reject(error);
      }

      resolve(result);
    });
  });
}
