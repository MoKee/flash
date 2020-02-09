export default function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => resolve(new Uint8Array(evt.target.result));
    reader.onabort = () => resolve(null);
    reader.onerror = (evt) => reject(evt);
    reader.readAsArrayBuffer(file);
  });
}
