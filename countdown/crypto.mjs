const encoder = new TextEncoder()
const decoder = new TextDecoder()

function getKeyMaterial(password) {
  password = password || window.prompt("Enter your password")
  password = encoder.encode(password)
  return window.crypto.subtle.importKey("raw", password, {name: "PBKDF2"}, false, ["deriveBits", "deriveKey"])
}

function getKey(keyMaterial, salt) {
  return window.crypto.subtle.deriveKey(
    {
      "name": "PBKDF2",
      salt: salt, 
      "iterations": 100000,
      "hash": "SHA-256"
    },
    keyMaterial,
    { "name": "AES-GCM", "length": 256},
    true,
    [ "encrypt", "decrypt" ]
  )
}


export async function encrypt(plaintext, password) {
  let keyMaterial = await getKeyMaterial(password)

  let salt = window.crypto.getRandomValues(new Uint8Array(16))
  let key = await getKey(keyMaterial, salt)

  let iv = window.crypto.getRandomValues(new Uint8Array(12))
  let message = encoder.encode(plaintext)
  let ciphertext = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, message)
  return new Blob([salt, iv, ciphertext], {type: 'application/octet-stream'})
}

export async function decrypt(cryptoblob, password) {
  let cryptoArray = await cryptoblob.arrayBuffer()
  // let cryptoArray = await readBlob(cryptoblob)
  let salt = cryptoArray.slice(0,16)
  let iv = cryptoArray.slice(16,28)
  let ciphertext = cryptoArray.slice(28)
 
  let keyMaterial = await getKeyMaterial(password)
  let key = await getKey(keyMaterial, salt)
  
  try {
    let decrypted = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, ciphertext)
    return decoder.decode(decrypted)
  } catch (e) {
    throw new Error('Failed to decrypt')
  }
}

async function readBlob(blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsArrayBuffer(blob)
  })
}
  